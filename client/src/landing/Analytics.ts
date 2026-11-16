/**
 * Non-personal analytics (BR-14).
 *
 * No IDs, no cookies, no user agent: each event is a name, the time since the
 * page loaded, and a little coarse context. Respects Do Not Track.
 */

type EventProps = Record<string, string | number | boolean | null>;

export class Analytics {
  private readonly startedAt = performance.now();
  private readonly enabled: boolean;
  private endpoint: string | null = null;

  constructor() {
    const legacyDnt = (window as Window & { doNotTrack?: string }).doNotTrack;
    this.enabled = navigator.doNotTrack !== '1' && legacyDnt !== '1';
  }

  setEndpoint(endpoint: string | null | undefined): void {
    this.endpoint = endpoint ?? null;
  }

  track(event: string, props: EventProps = {}): void {
    if (!this.enabled) return;

    const payload = { event, ms: Math.round(performance.now() - this.startedAt), ...props };

    // sendBeacon survives the page navigating away, which matters here because
    // the most common event ("campus_open") is immediately followed by one.
    if (this.endpoint && navigator.sendBeacon) {
      const body = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
      navigator.sendBeacon(this.endpoint, body);
    } else {
      console.debug('[analytics]', payload);
    }
  }
}
