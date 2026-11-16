/**
 * Editable site content (client/public/content.json): copy, links, and the
 * areas and points of interest described in the text-only tour.
 */

export interface ProgramLink {
  label: string;
  url: string;
}

export interface SiteContent {
  title: string;
  programLink?: ProgramLink;
  /** Where analytics events are POSTed. `null` logs them to the console instead. */
  analyticsEndpoint?: string | null;
}

export interface InfoPoint {
  id: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
}

export interface Area {
  name: string;
  description: string;
  infoPoints?: InfoPoint[];
}

export interface TourContent {
  site: SiteContent;
  areas: Record<string, Area>;
}

export class ContentRepository {
  constructor(private readonly url: string) {}

  async load(): Promise<TourContent> {
    const response = await fetch(this.url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Could not load ${this.url} (HTTP ${response.status})`);
    }
    return (await response.json()) as TourContent;
  }
}
