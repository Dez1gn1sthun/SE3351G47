import * as THREE from 'three';
import '../css/style.css';
import { CampusView } from './campus';
import { RoomView } from './room';
import { ROOM } from './config';
import type { Mode } from './types';

const $ = <T extends Element>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

const canvas = $<HTMLCanvasElement>('#scene');
const sign = $<HTMLElement>('#sign');
const hud = $<HTMLElement>('#hud');
const roomBar = $<HTMLElement>('#room-bar');
const roomHint = $<HTMLElement>('#room-hint');
const backButton = $<HTMLButtonElement>('#back');
const loader = $<HTMLElement>('#loader');
const loaderFill = $<HTMLElement>('#loader-fill');
const loaderLabel = $<HTMLElement>('#loader-label');
const loaderPct = $<HTMLElement>('#loader-pct');
const loaderError = $<HTMLElement>('#loader-error');
const retryButton = $<HTMLButtonElement>('#retry');

$<HTMLElement>('#room-title').textContent = ROOM.title;
$<HTMLElement>('#room-kicker').textContent = `${ROOM.kicker} · ${ROOM.credit}`;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMappingExposure = 1.0;

const campus = new CampusView(canvas, renderer);

let room: RoomView | null = null;
let mode: Mode = 'campus';
let busy = false;

/* ---------------------------------------------------------------- viewport */

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  campus.resize(width, height);
  room?.resize(width, height);
  if (mode === 'campus') campus.positionLabel(sign);
}

window.addEventListener('resize', resize);

/* ------------------------------------------------------------------ loader */

function openLoader(label: string): void {
  loaderLabel.textContent = label;
  loaderPct.textContent = '';
  loaderFill.style.transform = 'scaleX(0)';
  loaderError.hidden = true;
  loader.hidden = false;
}

function setProgress(loaded: number, total: number): void {
  // `total` is 0 when the host omits Content-Length; show an idle bar then.
  const ratio = total > 0 ? Math.min(loaded / total, 1) : 0;
  loaderFill.style.transform = `scaleX(${ratio})`;
  loaderPct.textContent = total > 0 ? `${Math.round(ratio * 100)}%` : '';
}

function closeLoader(): void {
  loader.classList.add('is-leaving');
  window.setTimeout(() => {
    loader.hidden = true;
    loader.classList.remove('is-leaving');
  }, 320);
}

function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[western-engineering-3d]', error);
  loaderError.textContent = `Could not load the model. ${message}`;
  loaderError.hidden = false;
  loaderFill.style.transform = 'scaleX(0)';
  loaderPct.textContent = '';
}

/* -------------------------------------------------------------------- flow */

async function boot(): Promise<void> {
  openLoader('Loading campus');
  try {
    await campus.load(setProgress);
    closeLoader();
    hud.hidden = false;
    sign.hidden = false;
    campus.revealMarker();
    campus.positionLabel(sign);
  } catch (error) {
    showError(error);
  }
}

async function openRoom(): Promise<void> {
  if (busy || mode === 'room') return;
  busy = true;
  openLoader(`Loading ${ROOM.title} scan`);

  const next = new RoomView(canvas);
  next.resize(window.innerWidth, window.innerHeight);

  try {
    await next.load(setProgress);
    room = next;
    mode = 'room';
    sign.hidden = true;
    hud.hidden = true;
    roomBar.hidden = false;
    roomHint.hidden = false;
    closeLoader();
    backButton.focus({ preventScroll: true });
  } catch (error) {
    next.dispose();
    showError(error);
  } finally {
    busy = false;
  }
}

function closeRoom(): void {
  if (mode !== 'room') return;
  mode = 'campus';
  room?.dispose();
  room = null;
  roomBar.hidden = true;
  roomHint.hidden = true;
  hud.hidden = false;
  sign.hidden = false;
  campus.positionLabel(sign);
  sign.focus({ preventScroll: true });
}

sign.addEventListener('click', () => void openRoom());
sign.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    void openRoom();
  }
});
backButton.addEventListener('click', closeRoom);
retryButton.addEventListener('click', () => {
  if (mode === 'room') void openRoom();
  else void boot();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mode === 'room') closeRoom();
});

/* -------------------------------------------------------------------- loop */

let previous = performance.now();

function frame(now: number): void {
  // Clamp so a background tab doesn't fling the damping on return.
  const dt = Math.min((now - previous) / 1000, 0.1);
  previous = now;

  if (mode === 'room' && room) {
    room.update(dt);
    renderer.render(room.scene, room.camera);
  } else {
    campus.update(dt);
    campus.positionLabel(sign);
    renderer.render(campus.scene, campus.camera);
  }

  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
void boot();
