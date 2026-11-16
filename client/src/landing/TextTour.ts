import { escapeHtml, requireElement } from '../shared/dom';
import type { Area, InfoPoint } from './ContentRepository';

export interface TextTourActions {
  onViewCampus(): void;
  onBack(): void;
}

/**
 * Accessible text alternative to the 3D campus (#9, BR-11): every area and
 * point of interest from content.json as plain, screen-reader-friendly HTML.
 */
export class TextTour {
  private readonly root = requireElement<HTMLElement>('#text-tour');
  private readonly content = requireElement<HTMLElement>('#text-content');
  private readonly notice = requireElement<HTMLElement>('#text-notice');

  constructor(actions: TextTourActions) {
    requireElement('#text-to-3d').addEventListener('click', () => actions.onViewCampus());
    requireElement('#text-to-start').addEventListener('click', () => actions.onBack());
  }

  render(areas: Record<string, Area>): void {
    this.content.replaceChildren(
      ...Object.entries(areas).map(([id, area]) => this.renderArea(id, area)),
    );
    // Info images are optional; drop any that have not been added yet.
    for (const image of this.content.querySelectorAll('img')) {
      image.addEventListener('error', () => image.remove());
    }
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
  }

  /** Shows the tour, optionally with a notice explaining why the user is here. */
  open(notice?: string): void {
    this.notice.textContent = notice ?? '';
    this.notice.hidden = !notice;
    this.setVisible(true);
    this.root.focus();
  }

  private renderArea(id: string, area: Area): HTMLElement {
    const headingId = `t-${id}`;
    const points = area.infoPoints ?? [];

    const section = document.createElement('section');
    section.className = 'text-area';
    section.setAttribute('aria-labelledby', headingId);
    section.innerHTML = `
      <h2 id="${escapeHtml(headingId)}">${escapeHtml(area.name)}</h2>
      <p>${escapeHtml(area.description)}</p>
      ${points.length ? `<h3>Points of interest</h3><ul class="text-poi">${points.map(renderPoint).join('')}</ul>` : ''}`;
    return section;
  }
}

function renderPoint(point: InfoPoint): string {
  const image = point.image
    ? `<img src="${escapeHtml(point.image)}" alt="${escapeHtml(point.imageAlt)}" loading="lazy">`
    : '';
  return `
    <li>
      <h4>${escapeHtml(point.title)}</h4>
      ${image}
      <p>${escapeHtml(point.text)}</p>
    </li>`;
}
