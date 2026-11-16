import { campusUrl } from '../shared/routes';
import { Analytics } from './Analytics';
import type { ContentRepository, ProgramLink } from './ContentRepository';
import { EntryScreen } from './EntryScreen';
import { Preferences } from './Preferences';
import { TextTour } from './TextTour';

/**
 * The landing page. It owns no 3D code: "View campus" navigates to
 * campus.html, which keeps the WebGL bundle and the 13 MB campus model off
 * this page entirely and gives the campus the whole GPU once it opens.
 */
export class LandingApp {
  private readonly analytics = new Analytics();
  private readonly preferences = new Preferences();
  private readonly entry: EntryScreen;
  private readonly textTour: TextTour;

  constructor(private readonly content: ContentRepository) {
    this.entry = new EntryScreen({
      onViewCampus: () => this.openCampus(),
      onTextTour: () => this.openTextTour(),
    });
    this.textTour = new TextTour({
      onViewCampus: () => this.openCampus(),
      onBack: () => this.showEntry(),
    });
  }

  async start(): Promise<void> {
    this.entry.lowPerf = this.preferences.lowPerf;
    this.wireSkipLink();
    this.trackProgramLinks();

    try {
      const content = await this.content.load();
      this.analytics.setEndpoint(content.site.analyticsEndpoint);
      this.applyProgramLink(content.site.programLink);
      this.textTour.render(content.areas);
    } catch (error) {
      console.error(error);
      this.entry.disableTextTour(
        'The text tour could not be loaded. Start the site with "npm run dev" or "npm start" rather than opening the HTML file directly.',
      );
    }
  }

  private openCampus(): void {
    if (!supportsWebGL()) {
      this.openTextTour('3D graphics are not available on this device, so here is the text version of the tour.');
      return;
    }
    const lowPerf = this.entry.lowPerf;
    this.preferences.lowPerf = lowPerf;
    this.analytics.track('campus_open', { from: this.currentScreen(), lowPerf });
    window.location.assign(campusUrl({ lowPerf }));
  }

  private openTextTour(notice?: string): void {
    this.analytics.track('text_tour_open', { from: this.currentScreen() });
    this.entry.setVisible(false);
    this.textTour.open(notice);
  }

  private showEntry(): void {
    this.textTour.setVisible(false);
    this.entry.setVisible(true);
    this.entry.focus();
  }

  private currentScreen(): 'entry' | 'text' {
    return this.textTour.isOpen ? 'text' : 'entry';
  }

  private wireSkipLink(): void {
    document.querySelector('#skip-to-text')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.openTextTour();
    });
  }

  private trackProgramLinks(): void {
    for (const link of document.querySelectorAll<HTMLAnchorElement>('.program-link')) {
      link.addEventListener('click', () =>
        this.analytics.track('program_link_click', { from: this.currentScreen() }),
      );
    }
  }

  private applyProgramLink(programLink: ProgramLink | undefined): void {
    if (!programLink) return;
    for (const link of document.querySelectorAll<HTMLAnchorElement>('.program-link')) {
      link.href = programLink.url;
      link.textContent = programLink.label;
    }
  }
}

/** Cheap probe so devices without WebGL get the text tour instead of a blank page. */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
