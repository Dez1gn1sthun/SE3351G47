import * as THREE from 'three';
import type { CampusOptions } from '../shared/routes';
import { requireElement } from '../shared/dom';
import { CampusView } from './CampusView';
import { LoaderOverlay } from './LoaderOverlay';
import { RoomView } from './RoomView';
import { ROOM } from './config';
import type { Mode } from './types';

/**
 * The 3D campus page: one WebGL renderer shared by two scenes.
 *
 * - `campus` — the orbitable campus model with a sign anchored over ACEB.
 * - `room`   — the ACEB 1420 LiDAR scan, loaded when the sign is clicked and
 *              disposed again when the user leaves it.
 */
export class CampusApp {
  private readonly canvas = requireElement<HTMLCanvasElement>('#scene');
  private readonly sign = requireElement<HTMLElement>('#sign');
  private readonly hud = requireElement<HTMLElement>('#hud');
  private readonly roomBar = requireElement<HTMLElement>('#room-bar');
  private readonly roomHint = requireElement<HTMLElement>('#room-hint');
  private readonly backButton = requireElement<HTMLButtonElement>('#back');

  private readonly renderer: THREE.WebGLRenderer;
  private readonly campus: CampusView;
  private readonly loader: LoaderOverlay;

  private room: RoomView | null = null;
  private mode: Mode = 'campus';
  private campusLoaded = false;
  private busy = false;
  private previousFrame = performance.now();

  constructor(options: CampusOptions) {
    this.renderer = createRenderer(this.canvas, options);
    this.campus = new CampusView(this.canvas, this.renderer);
    this.loader = new LoaderOverlay(() => this.retry());

    requireElement('#room-title').textContent = ROOM.title;
    requireElement('#room-kicker').textContent = `${ROOM.kicker} · ${ROOM.credit}`;
  }

  start(): void {
    this.wireEvents();
    this.resize();
    requestAnimationFrame(this.frame);
    void this.loadCampus();
  }

  /* ------------------------------------------------------------------ flow */

  private async loadCampus(): Promise<void> {
    this.loader.open('Loading campus');
    try {
      await this.campus.load(this.loader.setProgress);
      this.campusLoaded = true;
      this.loader.close();
      this.hud.hidden = false;
      this.sign.hidden = false;
      this.campus.revealMarker();
      this.campus.positionLabel(this.sign);
    } catch (error) {
      this.loader.showError(error);
    }
  }

  private async openRoom(): Promise<void> {
    if (this.busy || this.mode === 'room') return;
    this.busy = true;
    this.loader.open(`Loading ${ROOM.title} scan`);

    const next = new RoomView(this.canvas);
    next.resize(window.innerWidth, window.innerHeight);

    try {
      await next.load(this.loader.setProgress);
      this.room = next;
      this.mode = 'room';
      this.setRoomUiVisible(true);
      this.loader.close();
      this.backButton.focus({ preventScroll: true });
    } catch (error) {
      next.dispose();
      this.loader.showError(error);
    } finally {
      this.busy = false;
    }
  }

  private closeRoom(): void {
    if (this.mode !== 'room') return;
    this.mode = 'campus';
    this.room?.dispose();
    this.room = null;
    this.setRoomUiVisible(false);
    this.campus.positionLabel(this.sign);
    this.sign.focus({ preventScroll: true });
  }

  private retry(): void {
    // Retry whichever download failed: the campus on first load, otherwise the room.
    if (this.campusLoaded) void this.openRoom();
    else void this.loadCampus();
  }

  private setRoomUiVisible(inRoom: boolean): void {
    this.sign.hidden = inRoom;
    this.hud.hidden = inRoom;
    this.roomBar.hidden = !inRoom;
    this.roomHint.hidden = !inRoom;
  }

  /* ---------------------------------------------------------------- events */

  private wireEvents(): void {
    window.addEventListener('resize', this.resize);

    this.sign.addEventListener('click', () => void this.openRoom());
    this.sign.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void this.openRoom();
      }
    });

    this.backButton.addEventListener('click', () => this.closeRoom());
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.mode === 'room') this.closeRoom();
    });
  }

  private readonly resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.campus.resize(width, height);
    this.room?.resize(width, height);
    if (this.mode === 'campus') this.campus.positionLabel(this.sign);
  };

  /* ------------------------------------------------------------------ loop */

  private readonly frame = (now: number): void => {
    // Clamp so a background tab doesn't fling the damping on return.
    const dt = Math.min((now - this.previousFrame) / 1000, 0.1);
    this.previousFrame = now;

    if (this.mode === 'room' && this.room) {
      this.room.update(dt);
      this.renderer.render(this.room.scene, this.room.camera);
    } else {
      this.campus.update(dt);
      this.campus.positionLabel(this.sign);
      this.renderer.render(this.campus.scene, this.campus.camera);
    }

    requestAnimationFrame(this.frame);
  };
}

/**
 * Low-performance mode (BR-09, chosen on the landing page) drops antialiasing,
 * shadows and the high-DPI backbuffer: the three biggest per-frame GPU costs.
 */
function createRenderer(canvas: HTMLCanvasElement, options: CampusOptions): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !options.lowPerf,
    alpha: true,
    powerPreference: options.lowPerf ? 'low-power' : 'default',
  });
  renderer.setPixelRatio(options.lowPerf ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !options.lowPerf;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}
