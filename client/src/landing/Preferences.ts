/**
 * Per-browser preferences kept in localStorage. Every access is guarded
 * because storage can be blocked (private windows, strict privacy settings),
 * in which case the defaults are used and nothing is remembered.
 */
export class Preferences {
  private static readonly LOW_PERF_KEY = 'weve-lowperf';

  get lowPerf(): boolean {
    return this.read(Preferences.LOW_PERF_KEY) === '1';
  }

  set lowPerf(value: boolean) {
    this.write(Preferences.LOW_PERF_KEY, value ? '1' : '0');
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage blocked: the preference just isn't remembered.
    }
  }
}
