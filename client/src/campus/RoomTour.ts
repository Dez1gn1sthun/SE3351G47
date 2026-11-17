import * as THREE from 'three';
import { escapeHtml, requireElement } from '../shared/dom';
import type { RoomView } from './RoomView';

/**
 * Interactive layer for the ACEB 1420 scan, brought back from the original
 * WEVE viewer (commit e5eeab1) and fitted to the real scan:
 *   - information points (BR-05, BR-06): markers in the room that open a panel
 *   - quick-jump viewpoints (BR-08): an Explore menu that glides the camera
 *   - minimap with "you are here" (BR-07): top-down plan of the scan
 * Everything is driven by the `rooms` section of content.json (BR-13), so
 * text, positions and viewpoints can change without touching this code.
 * Positions are in scan coordinates (metres, Y up), the same space as aceb-1420.glb.
 */

type Vec3 = [number, number, number];

export interface RoomInfoPoint {
  id: string;
  title: string;
  text: string;
  position: Vec3;
  image?: string;
  imageAlt?: string;
}

export interface RoomJumpPoint {
  id: string;
  label: string;
  camera: Vec3;
  target: Vec3;
}

export interface RoomPlan {
  image: string;
  /** Scan X and Z at the plan image's top-left pixel. */
  x0: number;
  z0: number;
  /** Plan image pixels per metre along X and Z. */
  pxPerMetreX: number;
  pxPerMetreZ: number;
}

export interface RoomContent {
  name: string;
  infoPoints: RoomInfoPoint[];
  jumpPoints: RoomJumpPoint[];
  plan?: RoomPlan;
}

const GLIDE_SECONDS = 1.1;

export class RoomTour {
  private readonly markerLayer = requireElement<HTMLElement>('#poi-markers');
  private readonly infoPanel = requireElement<HTMLElement>('#info-panel');
  private readonly infoTitle = requireElement<HTMLElement>('#info-title');
  private readonly infoText = requireElement<HTMLElement>('#info-text');
  private readonly infoImage = requireElement<HTMLImageElement>('#info-img');
  private readonly explorePanel = requireElement<HTMLElement>('#explore-panel');
  private readonly exploreButton = requireElement<HTMLButtonElement>('#explore-btn');
  private readonly jumpList = requireElement<HTMLElement>('#jump-list');
  private readonly poiList = requireElement<HTMLElement>('#poi-list');
  private readonly minimapFigure = requireElement<HTMLElement>('#minimap-wrap');
  private readonly minimap = requireElement<HTMLCanvasElement>('#minimap');
  private readonly announcer = requireElement<HTMLElement>('#announcer');

  private readonly markers: { point: RoomInfoPoint; el: HTMLButtonElement; world: THREE.Vector3 }[] = [];
  private planImage: HTMLImageElement | null = null;
  private glide: { fromPos: THREE.Vector3; fromTarget: THREE.Vector3; toPos: THREE.Vector3; toTarget: THREE.Vector3; t: number } | null = null;
  private readonly tmp = new THREE.Vector3();
  private readonly abort = new AbortController();

  constructor(private readonly view: RoomView, private readonly content: RoomContent) {
    this.buildMarkers();
    this.buildExplore();
    this.loadPlan();
    this.wire();
    this.setVisible(true);
  }

  /* ------------------------------------------------------------ building */

  private buildMarkers(): void {
    this.markerLayer.replaceChildren();
    for (const point of this.content.infoPoints) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'poi';
      el.setAttribute('aria-label', `Information: ${point.title}`);
      el.innerHTML = '<span class="poi__dot" aria-hidden="true">i</span>' +
        `<span class="poi__label">${escapeHtml(point.title)}</span>`;
      el.addEventListener('click', () => this.openInfo(point));
      this.markerLayer.append(el);
      this.markers.push({ point, el, world: new THREE.Vector3(...point.position) });
    }
  }

  private buildExplore(): void {
    this.jumpList.replaceChildren(...this.content.jumpPoints.map((jp) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'panel-btn'; b.textContent = jp.label;
      b.addEventListener('click', () => { this.jumpTo(jp); this.closePanels(); });
      li.append(b);
      return li;
    }));
    this.poiList.replaceChildren(...this.content.infoPoints.map((p) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'panel-btn'; b.textContent = p.title;
      b.addEventListener('click', () => { this.lookAtPoint(p); this.openInfo(p); });
      li.append(b);
      return li;
    }));
  }

  private loadPlan(): void {
    const plan = this.content.plan;
    if (!plan) { this.minimapFigure.hidden = true; return; }
    const img = new Image();
    img.onload = () => { this.planImage = img; };
    img.onerror = () => { this.planImage = null; };
    img.src = `${import.meta.env.BASE_URL}${plan.image}`;
  }

  private wire(): void {
    const signal = this.abort.signal;
    this.exploreButton.addEventListener('click', () => this.togglePanel(this.explorePanel), { signal });
    this.infoPanel.querySelector('[data-close]')?.addEventListener('click', () => this.closePanels(), { signal });
    this.explorePanel.querySelector('[data-close]')?.addEventListener('click', () => this.closePanels(), { signal });
    window.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === 'KeyM') { this.togglePanel(this.explorePanel); }
      if (event.code === 'KeyI') { const p = this.nearestInfo(); if (p) this.openInfo(p); }
      if (event.key === 'Escape' && this.panelOpen()) { event.stopImmediatePropagation(); this.closePanels(); }
    }, { signal, capture: true });
  }

  /* -------------------------------------------------------------- actions */

  openInfo(point: RoomInfoPoint): void {
    this.infoTitle.textContent = point.title;
    this.infoText.textContent = point.text;
    if (point.image) {
      this.infoImage.hidden = true;
      this.infoImage.alt = point.imageAlt ?? '';
      this.infoImage.onload = () => { this.infoImage.hidden = false; };
      this.infoImage.onerror = () => { this.infoImage.hidden = true; };
      this.infoImage.src = `${import.meta.env.BASE_URL}${point.image}`;
    } else {
      this.infoImage.hidden = true;
    }
    this.explorePanel.hidden = true;
    this.exploreButton.setAttribute('aria-expanded', 'false');
    this.infoPanel.hidden = false;
    this.announce(`${point.title}. ${point.text}`);
  }

  jumpTo(jp: RoomJumpPoint): void {
    this.startGlide(new THREE.Vector3(...jp.camera), new THREE.Vector3(...jp.target));
    this.announce(`Moved to ${jp.label}`);
  }

  private lookAtPoint(p: RoomInfoPoint): void {
    const target = new THREE.Vector3(...p.position);
    const cam = this.view.camera.position.clone();
    const dir = cam.clone().sub(target);
    if (dir.length() > 4) cam.copy(target).add(dir.setLength(4));
    this.startGlide(cam, target);
  }

  private startGlide(toPos: THREE.Vector3, toTarget: THREE.Vector3): void {
    this.glide = {
      fromPos: this.view.camera.position.clone(),
      fromTarget: this.view.controls.target.clone(),
      toPos, toTarget, t: 0,
    };
  }

  private nearestInfo(): RoomInfoPoint | null {
    let best: RoomInfoPoint | null = null;
    let bestScore = Infinity;
    const cam = this.view.camera.position;
    const forward = this.view.camera.getWorldDirection(new THREE.Vector3());
    for (const m of this.markers) {
      const to = m.world.clone().sub(cam);
      const dist = to.length();
      const facing = to.normalize().dot(forward);
      const score = dist * (facing > 0 ? 1 : 3);
      if (score < bestScore) { bestScore = score; best = m.point; }
    }
    return best;
  }

  private togglePanel(panel: HTMLElement): void {
    const open = panel.hidden;
    this.closePanels();
    panel.hidden = !open;
    if (panel === this.explorePanel) this.exploreButton.setAttribute('aria-expanded', String(open));
  }

  private panelOpen(): boolean {
    return !this.infoPanel.hidden || !this.explorePanel.hidden;
  }

  private closePanels(): void {
    this.infoPanel.hidden = true;
    this.explorePanel.hidden = true;
    this.exploreButton.setAttribute('aria-expanded', 'false');
  }

  private announce(message: string): void {
    this.announcer.textContent = '';
    window.setTimeout(() => { this.announcer.textContent = message; }, 30);
  }

  /* ---------------------------------------------------------- per frame */

  update(dt: number): void {
    if (this.glide) {
      const g = this.glide;
      g.t = Math.min(1, g.t + dt / GLIDE_SECONDS);
      const e = g.t < 0.5 ? 2 * g.t * g.t : 1 - Math.pow(-2 * g.t + 2, 2) / 2;
      this.view.camera.position.lerpVectors(g.fromPos, g.toPos, e);
      this.view.controls.target.lerpVectors(g.fromTarget, g.toTarget, e);
      if (g.t >= 1) this.glide = null;
    }
    this.positionMarkers();
    this.drawMinimap();
  }

  private positionMarkers(): void {
    const cam = this.view.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const m of this.markers) {
      this.tmp.copy(m.world).project(cam);
      const visible = this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.05 && Math.abs(this.tmp.y) < 1.05;
      m.el.hidden = !visible;
      if (!visible) continue;
      const x = (this.tmp.x * 0.5 + 0.5) * w;
      const y = (-this.tmp.y * 0.5 + 0.5) * h;
      m.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }

  private drawMinimap(): void {
    const plan = this.content.plan;
    const ctx = this.minimap.getContext('2d');
    if (!plan || !ctx) return;
    const W = this.minimap.width;
    const H = this.minimap.height;
    ctx.clearRect(0, 0, W, H);
    if (this.planImage) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.planImage, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    const sx = W / (this.planImage?.naturalWidth || W);
    const sy = H / (this.planImage?.naturalHeight || H);
    const toMap = (x: number, z: number): [number, number] => [
      (x - plan.x0) * plan.pxPerMetreX * sx,
      (z - plan.z0) * plan.pxPerMetreZ * sy,
    ];
    ctx.fillStyle = '#a78bfa';
    for (const m of this.markers) {
      const [mx, my] = toMap(m.world.x, m.world.z);
      ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    const cam = this.view.camera;
    const [cx, cy] = toMap(cam.position.x, cam.position.z);
    const dir = cam.getWorldDirection(new THREE.Vector3());
    const angle = Math.atan2(dir.z * plan.pxPerMetreZ, dir.x * plan.pxPerMetreX);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 26, -0.55, 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------- teardown */

  setVisible(visible: boolean): void {
    this.markerLayer.hidden = !visible;
    this.minimapFigure.hidden = !visible || !this.content.plan;
    this.exploreButton.hidden = !visible;
    if (!visible) this.closePanels();
  }

  dispose(): void {
    this.abort.abort();
    this.setVisible(false);
    this.markerLayer.replaceChildren();
    this.markers.length = 0;
  }
}

/** Loads the room section of content.json. Returns null if it is missing, so the scan still opens. */
export async function loadRoomContent(roomId: string): Promise<RoomContent | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}content.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.rooms?.[roomId] as RoomContent | undefined) ?? null;
  } catch {
    return null;
  }
}
