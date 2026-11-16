import { requireElement } from '../shared/dom';
import type { ProgressFn } from './types';

/** How long the fade-out in campus.css (.loader.is-leaving) takes. */
const LEAVE_MS = 320;

/**
 * The full-screen progress overlay shown while a model downloads, which turns
 * into an error message with a Retry button if the download fails.
 */
export class LoaderOverlay {
  private readonly root = requireElement<HTMLElement>('#loader');
  private readonly fill = requireElement<HTMLElement>('#loader-fill');
  private readonly label = requireElement<HTMLElement>('#loader-label');
  private readonly percent = requireElement<HTMLElement>('#loader-pct');
  private readonly error = requireElement<HTMLElement>('#loader-error');
  private readonly retryButton = requireElement<HTMLButtonElement>('#retry');

  constructor(onRetry: () => void) {
    this.retryButton.addEventListener('click', onRetry);
  }

  open(label: string): void {
    this.label.textContent = label;
    this.percent.textContent = '';
    this.fill.style.transform = 'scaleX(0)';
    this.error.hidden = true;
    this.retryButton.hidden = true;
    this.root.hidden = false;
  }

  /** Arrow property so it can be handed straight to a loader as a callback. */
  readonly setProgress: ProgressFn = (loaded, total) => {
    // `total` is 0 when the server omits Content-Length; show an idle bar then.
    const ratio = total > 0 ? Math.min(loaded / total, 1) : 0;
    this.fill.style.transform = `scaleX(${ratio})`;
    this.percent.textContent = total > 0 ? `${Math.round(ratio * 100)}%` : '';
  };

  close(): void {
    this.root.classList.add('is-leaving');
    window.setTimeout(() => {
      this.root.hidden = true;
      this.root.classList.remove('is-leaving');
    }, LEAVE_MS);
  }

  showError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[western-engineering-3d]', error);
    this.error.textContent = `Could not load the model. ${message}`;
    this.error.hidden = false;
    this.retryButton.hidden = false;
    this.fill.style.transform = 'scaleX(0)';
    this.percent.textContent = '';
  }
}
