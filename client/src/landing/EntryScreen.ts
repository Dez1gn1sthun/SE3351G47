import { requireElement } from '../shared/dom';

export interface EntryScreenActions {
  onViewCampus(): void;
  onOpenRoom(): void;
  onTextTour(): void;
}

/**
 * The first screen (#1, BR-01/BR-03): what the site is, a button into the 3D
 * campus, a low-performance toggle, and a way into the text-only tour.
 */
export class EntryScreen {
  private readonly root = requireElement<HTMLElement>('#entry');
  private readonly startButton = requireElement<HTMLButtonElement>('#start-btn');
  private readonly roomButton = requireElement<HTMLButtonElement>('#room-btn');
  private readonly textButton = requireElement<HTMLButtonElement>('#text-btn');
  private readonly lowPerfCheckbox = requireElement<HTMLInputElement>('#lowperf-entry');
  private readonly error = requireElement<HTMLElement>('#entry-error');

  constructor(actions: EntryScreenActions) {
    this.startButton.addEventListener('click', () => actions.onViewCampus());
    this.roomButton.addEventListener('click', () => actions.onOpenRoom());
    this.textButton.addEventListener('click', () => actions.onTextTour());
  }

  get lowPerf(): boolean {
    return this.lowPerfCheckbox.checked;
  }

  set lowPerf(value: boolean) {
    this.lowPerfCheckbox.checked = value;
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
  }

  focus(): void {
    this.startButton.focus();
  }

  /** The text tour needs content.json; the 3D campus does not, so it stays usable. */
  disableTextTour(message: string): void {
    this.textButton.disabled = true;
    this.error.textContent = message;
    this.error.hidden = false;
  }
}
