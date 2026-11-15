// WEVE — Western Engineering Virtual Explorer: classroom viewer front end.
// Backlog coverage is tagged inline as (#n / BR-xx).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* ------------------------------------------------------------------ */
/* Constants & state                                                   */
/* ------------------------------------------------------------------ */
const EYE_HEIGHT = 1.6;
const WALK_SPEED = 2.2;        // m/s
const RUN_MULT = 1.8;
const TURN_SPEED = 1.8;        // rad/s (keyboard)
const LOOK_SPEED = 1.2;        // rad/s (PgUp/PgDn)
const DRAG_SENS = 0.0035;      // rad per px
const WALL_MARGIN = 0.35;
const DOOR_PROMPT_RANGE = 1.2;
const DOOR_AUTO_RANGE = 0.5;   // walking into the door triggers the transition
const INFO_RANGE = 4;
const DOOR_H = 2.1;
const PITCH_LIMIT = 1.2;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = matchMedia('(pointer: coarse)').matches;
const $ = (s) => document.querySelector(s);
const deg = THREE.MathUtils.degToRad;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

const state = {
  content: null,
  areaId: null,
  selectedArea: null,
  pos: new THREE.Vector3(0, EYE_HEIGHT, 0),
  yaw: 0,
  pitch: 0,
  keys: new Set(),
  lowPerf: store.get('weve-lowperf') === '1',
  running: false,
  transitioning: false,
  tween: null,
  nearDoor: null,
  doorCooldown: 0,
  clickables: [],
  infoMarkers: [],
  perfSuggested: false,
};

/* ------------------------------------------------------------------ */
/* #11 Non-personal analytics (BR-14)                                  */
/* No IDs, no cookies, no user agent — just event names, an elapsed    */
/* time, and coarse context. Respects Do Not Track.                    */
/* ------------------------------------------------------------------ */
const analytics = {
  endpoint: null,
  t0: performance.now(),
  enabled: navigator.doNotTrack !== '1' && window.doNotTrack !== '1',
  track(event, props = {}) {
    if (!this.enabled) return;
    const payload = { event, ms: Math.round(performance.now() - this.t0), ...props };
    if (this.endpoint && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, new Blob([JSON.stringify(payload)], { type: 'text/plain' }));
    } else {
      console.debug('[analytics]', payload);
    }
  },
};

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function announce(msg) {
  const el = $('#announcer');
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

let toastTimer;
function toast(msg, { actionLabel, onAction, timeout = 5000 } = {}) {
  const t = $('#toast');
  $('#toast-text').textContent = msg;
  const btn = $('#toast-action');
  if (actionLabel) {
    btn.hidden = false;
    btn.textContent = actionLabel;
    btn.onclick = () => { t.hidden = true; onAction?.(); };
  } else {
    btn.hidden = true;
  }
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, timeout);
}

function show(screen) {
  for (const id of ['entry', 'viewer', 'text-tour']) $('#' + id).hidden = id !== screen;
}

/* #8 Loading indicator (BR-09) */
function showLoading(text) {
  $('#loading').hidden = false;
  $('#loading-text').textContent = text;
  $('#loading-bar').style.width = '0%';
  $('.progress').classList.add('indeterminate');
}
function setLoadingProgress(fraction, label) {
  $('.progress').classList.remove('indeterminate');
  $('#loading-bar').style.width = `${Math.round(fraction * 100)}%`;
  $('#loading-text').textContent = `${label} ${Math.round(fraction * 100)}%`;
}
function hideLoading() { $('#loading').hidden = true; }

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
init();

async function init() {
  try {
    const res = await fetch('content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.content = await res.json();
  } catch (err) {
    console.error(err);
    const e = $('#entry-error');
    e.hidden = false;
    e.textContent = 'Could not load content.json. Serve this folder over HTTP (e.g. "npx vite" or "python -m http.server") rather than opening the file directly.';
    // The start button leads to the Luanti world, which does not depend on this
    // file, so it stays usable even when the classroom content cannot load.
    wireUI();
    return;
  }
  analytics.endpoint = state.content.site?.analyticsEndpoint || null;
  buildEntry();
  buildTextTour();
  wireUI();
}

/* ------------------------------------------------------------------ */
/* #1 Entry screen + #10 branding/link (BR-01, BR-03, BR-10, BR-15)    */
/* ------------------------------------------------------------------ */
function buildEntry() {
  const { site, areas } = state.content;
  const ids = Object.keys(areas);
  state.selectedArea = areas[site.defaultArea] ? site.defaultArea : ids[0];

  const wrap = $('#area-options');
  wrap.innerHTML = '';
  for (const id of ids) {
    const a = areas[id];
    const label = document.createElement('label');
    label.className = 'area-option';
    label.innerHTML = `
      <input type="radio" name="area" value="${esc(id)}" ${id === state.selectedArea ? 'checked' : ''}>
      <span class="area-option-body"><strong>${esc(a.name)}</strong><span>${esc(a.summary)}</span></span>`;
    label.querySelector('input').addEventListener('change', () => { state.selectedArea = id; });
    wrap.append(label);
  }

  for (const link of document.querySelectorAll('.program-link')) {
    if (site.programLink?.url) link.href = site.programLink.url;
    if (site.programLink?.label) link.textContent = site.programLink.label;
    link.addEventListener('click', () => analytics.track('program_link_click', { from: currentScreen() }));
  }
  $('#lowperf-entry').checked = state.lowPerf;
}

function currentScreen() {
  if (!$('#viewer').hidden) return 'viewer';
  if (!$('#text-tour').hidden) return 'text';
  return 'entry';
}

/* ------------------------------------------------------------------ */
/* #9 Accessible text alternative (BR-11)                              */
/* ------------------------------------------------------------------ */
function buildTextTour() {
  const c = $('#text-content');
  c.innerHTML = '';
  for (const [id, a] of Object.entries(state.content.areas)) {
    const sec = document.createElement('section');
    sec.className = 'text-area';
    sec.setAttribute('aria-labelledby', `t-${id}`);
    const pois = (a.infoPoints || []).map((p) => `
      <li>
        <h4>${esc(p.title)}</h4>
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.imageAlt || '')}" loading="lazy">` : ''}
        <p>${esc(p.text)}</p>
      </li>`).join('');
    sec.innerHTML = `
      <h2 id="t-${esc(id)}">${esc(a.name)}</h2>
      <p>${esc(a.description)}</p>
      ${pois ? `<h3>Points of interest</h3><ul class="text-poi">${pois}</ul>` : ''}`;
    c.append(sec);
  }
  c.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => img.remove()));
}

function openTextTour(notice) {
  pauseViewer();
  show('text-tour');
  const n = $('#text-notice');
  n.hidden = !notice;
  n.textContent = notice || '';
  $('#text-tour').focus();
  analytics.track('text_tour_open', { from: state.running ? 'viewer' : 'entry' });
}

/* ------------------------------------------------------------------ */
/* UI wiring                                                           */
/* ------------------------------------------------------------------ */
function wireUI() {
  $('#start-btn').addEventListener('click', () => {
    analytics.track('start_luanti');
    window.location.assign('luanti.html');
  });
  $('#text-btn').addEventListener('click', () => openTextTour());
  $('#skip-to-text').addEventListener('click', (e) => { e.preventDefault(); openTextTour(); });

  $('#text-to-3d').addEventListener('click', () => window.location.assign('luanti.html'));
  $('#text-to-start').addEventListener('click', () => { show('entry'); $('#start-btn').focus(); });

  $('#explore-btn').addEventListener('click', () => togglePanel('explore-panel', '#explore-btn'));
  $('#help-btn').addEventListener('click', () => togglePanel('help-panel', '#help-btn'));
  $('#text-mode-btn').addEventListener('click', () => openTextTour());
  $('#lowperf-btn').addEventListener('click', () => setLowPerf(!state.lowPerf));
  $('#exit-btn').addEventListener('click', () => {
    pauseViewer();
    closeAllPanels();
    show('entry');
    $('#start-btn').focus();
    analytics.track('exit_to_start');
  });

  document.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => { closePanel(b.dataset.close); $('#scene').focus(); }));

  $('#door-btn').addEventListener('click', () => state.nearDoor && useDoor(state.nearDoor));
  $('#info-img').addEventListener('error', (e) => { e.target.hidden = true; });

  wireKeyboard();
  wirePointer();
  wireTouchPad();
}

function togglePanel(id, btnSel) {
  const open = $('#' + id).hidden;
  closeAllPanels();
  if (open) {
    $('#' + id).hidden = false;
    $(btnSel)?.setAttribute('aria-expanded', 'true');
    $('#' + id).querySelector('button')?.focus();
    if (id === 'explore-panel') analytics.track('explore_menu_open', { area: state.areaId });
  }
}
function closePanel(id) {
  $('#' + id).hidden = true;
  if (id === 'explore-panel') $('#explore-btn').setAttribute('aria-expanded', 'false');
  if (id === 'help-panel') $('#help-btn').setAttribute('aria-expanded', 'false');
}
function closeAllPanels() {
  ['explore-panel', 'help-panel', 'info-panel'].forEach(closePanel);
}

/* ------------------------------------------------------------------ */
/* #2 Three.js viewer (BR-02)                                          */
/* ------------------------------------------------------------------ */
let renderer, scene, camera, clock, raycaster, gltfLoader;
const areaGroups = {};
const ndc = new THREE.Vector2();

async function startTour(areaId) {
  state.lowPerf = $('#entry').hidden ? state.lowPerf : $('#lowperf-entry').checked;
  store.set('weve-lowperf', state.lowPerf ? '1' : '0');

  if (!renderer) {
    try {
      setupRenderer();
    } catch (err) {
      console.error(err);
      openTextTour('3D graphics are not available on this device, so here is the text version of the tour.');
      return;
    }
  }
  show('viewer');
  resize();
  analytics.track('session_start', { mode: '3d', area: areaId, lowPerf: state.lowPerf, input: isCoarse ? 'touch' : 'pointer' });

  if (state.areaId !== areaId) await enterArea(areaId, null, { fade: false });
  resumeViewer();
  $('#scene').focus();
}

function setupRenderer() {
  const canvas = $('#scene');
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !state.lowPerf,
    powerPreference: state.lowPerf ? 'low-power' : 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15111c);
  camera = new THREE.PerspectiveCamera(70, 1, 0.05, 80);
  camera.rotation.order = 'YXZ';

  scene.add(new THREE.HemisphereLight(0xffffff, 0x3d3550, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 6, 2);
  scene.add(key);

  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();

  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);

  for (const [id, a] of Object.entries(state.content.areas)) {
    const group = new THREE.Group();
    group.name = id;
    group.visible = false;

    const placeholder = new THREE.Group();
    placeholder.name = 'placeholder';
    buildRoom(placeholder, a);
    if (a.placeholder === 'classroom') furnishClassroom(placeholder, a.bounds);
    if (a.placeholder === 'hallway') furnishHallway(placeholder, a.bounds);
    group.add(placeholder);

    addMarkers(group, id, a);
    scene.add(group);
    areaGroups[id] = { group, placeholder, modelPromise: null };
  }

  applyPerf();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!renderer) return;
  const c = renderer.domElement;
  const w = c.clientWidth || window.innerWidth;
  const h = c.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function resumeViewer() {
  if (!renderer || state.running) return;
  state.running = true;
  clock.getDelta();
  renderer.setAnimationLoop(frame);
}
function pauseViewer() {
  state.running = false;
  state.keys.clear();
  renderer?.setAnimationLoop(null);
}

/* #8 Low-performance mode (BR-09) */
function applyPerf() {
  if (!renderer) return;
  renderer.setPixelRatio(state.lowPerf ? Math.min(window.devicePixelRatio, 1) * 0.8 : Math.min(window.devicePixelRatio, 2));
  camera.far = state.lowPerf ? 35 : 80;
  camera.updateProjectionMatrix();
  $('#lowperf-btn').setAttribute('aria-pressed', String(state.lowPerf));
  resize();
}
function setLowPerf(on) {
  state.lowPerf = on;
  store.set('weve-lowperf', on ? '1' : '0');
  $('#lowperf-entry').checked = on;
  applyPerf();
  toast(on ? 'Low-performance mode on.' : 'Low-performance mode off.', { timeout: 2500 });
  analytics.track('low_perf_toggle', { on });
}

const fps = { frames: 0, time: 0, warmup: 2 };
function monitorFps(dt) {
  if (state.lowPerf || state.perfSuggested) return;
  fps.warmup -= dt;
  if (fps.warmup > 0) return;
  fps.frames++;
  fps.time += dt;
  if (fps.time >= 4) {
    const avg = fps.frames / fps.time;
    fps.frames = 0; fps.time = 0;
    if (avg < 24) {
      state.perfSuggested = true;
      toast(`Running at about ${Math.round(avg)} fps.`, {
        actionLabel: 'Turn on low-performance mode', onAction: () => setLowPerf(true), timeout: 10000,
      });
      analytics.track('low_fps_detected', { fps: Math.round(avg) });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Placeholder geometry (#4 hallway, BR-02/BR-04)                      */
/* Shown until/unless a GLB scan loads for that area.                  */
/* ------------------------------------------------------------------ */
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts }));
  return matCache.get(key);
}
function box(parent, w, h, d, x, y, z, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function doorSide(d, b) {
  const eps = 0.05;
  if (Math.abs(d.z - b.minZ) < eps) return 'minZ';
  if (Math.abs(d.z - b.maxZ) < eps) return 'maxZ';
  if (Math.abs(d.x - b.minX) < eps) return 'minX';
  if (Math.abs(d.x - b.maxX) < eps) return 'maxX';
  return null;
}
// Unit vector pointing from the door into the room.
function doorInward(d, b) {
  return { minZ: [0, 1], maxZ: [0, -1], minX: [1, 0], maxX: [-1, 0] }[doorSide(d, b)] || [0, 0];
}

function buildRoom(parent, area) {
  const b = area.bounds;
  const doors = area.doors || [];
  const height = 3, T = 0.1;
  const W = b.maxX - b.minX, D = b.maxZ - b.minZ;
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const wallColor = area.placeholder === 'hallway' ? 0xd8d3dd : 0xe2ddd4;

  box(parent, W, 0.02, D, cx, -0.01, cz, area.placeholder === 'hallway' ? 0x55505e : 0x6d717c);
  box(parent, W, 0.02, D, cx, height + 0.01, cz, 0xf0eee9);

  const walls = [
    { axis: 'x', fixed: b.minZ - T / 2, from: b.minX, to: b.maxX, side: 'minZ' },
    { axis: 'x', fixed: b.maxZ + T / 2, from: b.minX, to: b.maxX, side: 'maxZ' },
    { axis: 'z', fixed: b.minX - T / 2, from: b.minZ, to: b.maxZ, side: 'minX' },
    { axis: 'z', fixed: b.maxX + T / 2, from: b.minZ, to: b.maxZ, side: 'maxX' },
  ];
  for (const w of walls) {
    const seg = (s, e, y0, y1) => {
      if (e - s <= 0.001) return;
      const len = e - s, mid = (s + e) / 2, h = y1 - y0, cy = (y0 + y1) / 2;
      if (w.axis === 'x') box(parent, len, h, T, mid, cy, w.fixed, wallColor);
      else box(parent, T, h, len, w.fixed, cy, mid, wallColor);
    };
    const gaps = doors
      .filter((d) => doorSide(d, b) === w.side)
      .map((d) => { const c = w.axis === 'x' ? d.x : d.z; const hw = (d.width || 1) / 2; return { d, s: c - hw, e: c + hw, c }; })
      .sort((p, q) => p.s - q.s);
    let cur = w.from;
    for (const g of gaps) {
      seg(cur, g.s, 0, height);
      seg(g.s, g.e, DOOR_H, height);
      cur = g.e;
      // Closed door slab filling the gap — clickable (#13).
      const dw = (g.e - g.s) - 0.04;
      const slab = w.axis === 'x'
        ? box(parent, dw, DOOR_H - 0.02, 0.06, g.c, DOOR_H / 2, w.fixed, 0x7a5634)
        : box(parent, 0.06, DOOR_H - 0.02, dw, w.fixed, DOOR_H / 2, g.c, 0x7a5634);
      slab.userData = { kind: 'door', door: g.d };
      state.clickables.push(slab);
      const [ix, iz] = doorInward(g.d, b);
      const along = dw / 2 - 0.12;
      box(parent, 0.06, 0.06, 0.06,
        slab.position.x + ix * 0.06 + (w.axis === 'x' ? along : 0), 1.0,
        slab.position.z + iz * 0.06 + (w.axis === 'z' ? along : 0), 0xd4c08a, { metalness: 0.6, roughness: 0.3 });
    }
    seg(cur, w.to, 0, height);
  }

  // Ceiling light panels
  const light = { emissive: 0xffffff, emissiveIntensity: 0.9 };
  for (let x = b.minX + 1.5; x < b.maxX - 0.5; x += 3) {
    for (let z = b.minZ + 1.5; z < b.maxZ - 0.5; z += 3) {
      box(parent, Math.min(1.2, W - 0.4), 0.03, 0.6, x, height - 0.02, z, 0xffffff, light);
    }
  }
}

function furnishClassroom(p, b) {
  const wood = 0xb08a5f, chair = 0x3c3552;
  // Whiteboard on the front wall
  box(p, 4.2, 1.3, 0.04, 0, 1.55, b.minZ + 0.03, 0x9a9aa2);
  box(p, 4.0, 1.15, 0.05, 0, 1.55, b.minZ + 0.05, 0xfafafa, { roughness: 0.4 });
  // Instructor desk
  box(p, 1.8, 0.08, 0.8, 1.4, 0.76, b.minZ + 1.2, wood);
  box(p, 1.8, 0.7, 0.05, 1.4, 0.38, b.minZ + 1.58, 0x5a4a3a);
  // Desk rows
  for (let z = b.minZ + 3; z <= b.maxZ - 1.6; z += 1.4) {
    for (let x = b.minX + 1.3; x <= b.maxX - 2.4; x += 2.3) {
      box(p, 1.7, 0.05, 0.6, x, 0.74, z, wood);
      box(p, 1.6, 0.68, 0.04, x, 0.38, z - 0.27, 0x6b5a48);
      box(p, 0.45, 0.45, 0.45, x - 0.4, 0.23, z + 0.55, chair);
      box(p, 0.45, 0.45, 0.45, x + 0.4, 0.23, z + 0.55, chair);
    }
  }
  // Windows on the left wall
  for (let z = b.minZ + 1.5; z < b.maxZ - 1; z += 2.2) {
    box(p, 0.03, 1.3, 1.7, b.minX + 0.02, 1.8, z, 0xcfe6ff, { emissive: 0x9cc8ff, emissiveIntensity: 0.7 });
  }
}

function furnishHallway(p, b) {
  // Lockers on the right wall
  for (let z = b.minZ + 0.5; z <= b.maxZ - 0.5; z += 0.5) {
    if (Math.abs(z) < 1) continue;
    box(p, 0.3, 1.8, 0.47, b.maxX - 0.15, 0.9, z, 0x4b3f72, { metalness: 0.3, roughness: 0.6 });
  }
  // Notice board on the left wall
  box(p, 0.03, 0.9, 1.6, b.minX + 0.02, 1.5, -4, 0xb8935f);
  // Floor stripe
  box(p, 0.15, 0.005, b.maxZ - b.minZ, 0, 0.003, 0, 0x4f2683);
}

/* ------------------------------------------------------------------ */
/* Markers: info points (#7) and door hotspots (#13)                   */
/* ------------------------------------------------------------------ */
function iconTexture(glyph, bg) {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 8, 0, Math.PI * 2);
  g.fillStyle = bg;
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = '#ffffff';
  g.stroke();
  g.fillStyle = '#ffffff';
  g.font = 'bold 68px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(glyph, s / 2, s / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let infoMat, doorMat;
function addMarkers(group, areaId, a) {
  infoMat ||= new THREE.SpriteMaterial({ map: iconTexture('i', '#4f2683') });
  doorMat ||= new THREE.SpriteMaterial({ map: iconTexture('→', '#1f8a5b') });

  for (const poi of a.infoPoints || []) {
    const s = new THREE.Sprite(infoMat);
    s.position.set(poi.x, poi.y ?? 1.6, poi.z);
    s.scale.setScalar(0.32);
    s.userData = { kind: 'info', poi, areaId, baseY: s.position.y, phase: Math.random() * 6 };
    group.add(s);
    state.clickables.push(s);
    state.infoMarkers.push(s);
  }
  for (const d of a.doors || []) {
    const [ix, iz] = doorInward(d, a.bounds);
    const s = new THREE.Sprite(doorMat);
    s.position.set(d.x + ix * 0.25, DOOR_H + 0.3, d.z + iz * 0.25);
    s.scale.setScalar(0.3);
    s.userData = { kind: 'door', door: d };
    group.add(s);
    state.clickables.push(s);
  }
}

function isVisible(obj) {
  for (let o = obj; o; o = o.parent) if (!o.visible) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* GLB loading (#2 BR-02) with progress (#8)                           */
/* ------------------------------------------------------------------ */
function ensureModel(areaId) {
  const rec = areaGroups[areaId];
  const a = state.content.areas[areaId];
  const url = (state.lowPerf && a.modelLowPerf) || a.model;
  if (!url) return Promise.resolve(false);
  if (rec.modelPromise) return rec.modelPromise;

  showLoading(`Loading the ${a.name.toLowerCase()} scan…`);
  rec.modelPromise = new Promise((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        const t = a.modelTransform || {};
        if (t.position) root.position.fromArray(t.position);
        if (t.rotationYDeg) root.rotation.y = deg(t.rotationYDeg);
        if (t.scale) root.scale.setScalar(t.scale);
        rec.group.add(root);
        rec.placeholder.visible = false;
        hideLoading();
        analytics.track('model_loaded', { area: areaId });
        resolve(true);
      },
      (xhr) => { if (xhr.lengthComputable && xhr.total) setLoadingProgress(xhr.loaded / xhr.total, `Loading the ${a.name.toLowerCase()} scan…`); },
      (err) => {
        console.warn(`Could not load ${url}; using placeholder geometry.`, err);
        hideLoading();
        toast(`The ${a.name.toLowerCase()} scan isn't available yet, so you're seeing a placeholder room.`, { timeout: 6000 });
        resolve(false);
      },
    );
  });
  return rec.modelPromise;
}

/* ------------------------------------------------------------------ */
/* Areas, door transitions (#13 BR-04), quick jump (#6 BR-08)          */
/* ------------------------------------------------------------------ */
function fadeTo(opacity) {
  const f = $('#fade');
  if (reducedMotion) { f.style.opacity = opacity; return Promise.resolve(); }
  return new Promise((resolve) => {
    f.style.opacity = opacity;
    setTimeout(resolve, 380);
  });
}

async function enterArea(areaId, spawnId, { fade = true } = {}) {
  if (state.transitioning) return;
  const area = state.content.areas[areaId];
  if (!area) return;
  state.transitioning = true;
  state.tween = null;
  closePanel('info-panel');

  if (fade) await fadeTo(1);
  for (const [id, rec] of Object.entries(areaGroups)) rec.group.visible = id === areaId;
  state.areaId = areaId;
  const sp = (spawnId && area.jumpPoints?.find((j) => j.id === spawnId)) || area.spawn;
  placeAt(sp);
  buildExploreLists();
  $('#area-name').textContent = area.name;
  $('#minimap-label').textContent = `${area.name} — you are here`;
  $('#minimap').setAttribute('aria-label', `Minimap of the ${area.name.toLowerCase()} showing your position`);

  await ensureModel(areaId);
  if (fade) await fadeTo(0);
  state.doorCooldown = 1;
  state.transitioning = false;
  announce(`Entered the ${area.name.toLowerCase()}.`);
  analytics.track('area_enter', { area: areaId });
}

function useDoor(door) {
  if (state.transitioning) return;
  analytics.track('door_transition', { from: state.areaId, to: door.target });
  enterArea(door.target, door.targetSpawn);
}

function placeAt(p) {
  state.pos.set(p.x, EYE_HEIGHT, p.z);
  state.yaw = deg(p.yawDeg || 0);
  state.pitch = 0;
}

function shortestAngle(from, to) {
  return ((to - from + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
}

function glideTo(x, z, yaw, pitch = 0) {
  if (reducedMotion) {
    state.pos.set(x, EYE_HEIGHT, z); state.yaw = yaw; state.pitch = pitch;
    return;
  }
  state.tween = {
    t: 0, dur: 0.7,
    from: { x: state.pos.x, z: state.pos.z, yaw: state.yaw, pitch: state.pitch },
    dx: x - state.pos.x, dz: z - state.pos.z,
    dyaw: shortestAngle(state.yaw, yaw), dpitch: pitch - state.pitch,
  };
}

function stepTween(dt) {
  const tw = state.tween;
  tw.t = Math.min(1, tw.t + dt / tw.dur);
  const e = tw.t < 0.5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2;
  state.pos.x = tw.from.x + tw.dx * e;
  state.pos.z = tw.from.z + tw.dz * e;
  state.yaw = tw.from.yaw + tw.dyaw * e;
  state.pitch = tw.from.pitch + tw.dpitch * e;
  if (tw.t >= 1) state.tween = null;
}

function jumpTo(jp) {
  glideTo(jp.x, jp.z, deg(jp.yawDeg || 0));
  announce(`Moved to ${jp.label}.`);
  analytics.track('quick_jump', { area: state.areaId, id: jp.id });
}

// Yaw that faces a world point from the current position (forward = (-sin, -cos)).
function yawToward(x, z) { return Math.atan2(-(x - state.pos.x), -(z - state.pos.z)); }
function pitchToward(x, y, z) {
  return Math.atan2(y - EYE_HEIGHT, Math.hypot(x - state.pos.x, z - state.pos.z));
}

function buildExploreLists() {
  const a = state.content.areas[state.areaId];
  const mk = (label, sub, onClick, current = false) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `${esc(label)}${sub ? `<span class="sub">${esc(sub)}</span>` : ''}`;
    if (current) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', onClick);
    li.append(b);
    return li;
  };

  const jl = $('#jump-list');
  jl.replaceChildren(...(a.jumpPoints || []).map((jp) => mk(jp.label, '', () => { closePanel('explore-panel'); jumpTo(jp); $('#scene').focus(); })));

  const pl = $('#poi-list');
  pl.replaceChildren(...(a.infoPoints || []).map((poi) => mk(poi.title, 'Look at it and open the details', () => {
    glideTo(state.pos.x, state.pos.z, yawToward(poi.x, poi.z), THREE.MathUtils.clamp(pitchToward(poi.x, poi.y ?? 1.6, poi.z), -0.6, 0.6));
    openInfo(poi);
  })));

  const al = $('#area-list');
  al.replaceChildren(...Object.entries(state.content.areas).map(([id, ar]) =>
    mk(ar.name, id === state.areaId ? 'You are here' : ar.summary, () => {
      if (id === state.areaId) return;
      closePanel('explore-panel');
      enterArea(id).then(() => $('#scene').focus());
    }, id === state.areaId)));
}

/* ------------------------------------------------------------------ */
/* #7 Info panel (BR-05, BR-06)                                        */
/* ------------------------------------------------------------------ */
function openInfo(poi) {
  closePanel('explore-panel');
  closePanel('help-panel');
  $('#info-title').textContent = poi.title;
  $('#info-text').textContent = poi.text;
  const img = $('#info-img');
  if (poi.image) {
    img.hidden = false;
    img.alt = poi.imageAlt || '';
    img.src = poi.image;
  } else {
    img.hidden = true;
    img.removeAttribute('src');
  }
  $('#info-panel').hidden = false;
  $('#info-close').focus();
  analytics.track('info_open', { area: state.areaId, id: poi.id });
}

function nearestInfo() {
  const a = state.content.areas[state.areaId];
  let best = null, bestD = INFO_RANGE;
  for (const p of a.infoPoints || []) {
    const d = Math.hypot(p.x - state.pos.x, p.z - state.pos.z);
    if (d < bestD) { best = p; bestD = d; }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* #3 Navigation controls (BR-04, BR-09)                               */
/* ------------------------------------------------------------------ */
const MOVE_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'ShiftLeft', 'ShiftRight']);

function wireKeyboard() {
  window.addEventListener('keydown', (e) => {
    if ($('#viewer').hidden || !state.running) return;
    if (e.target.matches?.('input, textarea, select')) return;

    if (e.key === 'Escape') {
      closeAllPanels();
      $('#scene').focus();
      return;
    }
    const inPanel = e.target.closest?.('.panel');
    if (MOVE_CODES.has(e.code)) {
      if (inPanel) return;               // let arrow keys work inside menus
      state.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code.startsWith('Page')) e.preventDefault();
      state.tween = null;
      return;
    }
    if (inPanel || e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.code) {
      case 'KeyE':
        if (state.nearDoor) useDoor(state.nearDoor);
        else announce('There is no door nearby.');
        break;
      case 'KeyI': {
        const p = nearestInfo();
        if (p) openInfo(p); else announce('No point of interest nearby. Press M to see the list.');
        break;
      }
      case 'KeyM': togglePanel('explore-panel', '#explore-btn'); break;
      case 'KeyH': togglePanel('help-panel', '#help-btn'); break;
      case 'KeyP': { // dev helper for placing content.json points
        const msg = `x: ${state.pos.x.toFixed(2)}, z: ${state.pos.z.toFixed(2)}, yawDeg: ${Math.round(THREE.MathUtils.radToDeg(state.yaw))}`;
        console.log(`[WEVE position] area=${state.areaId}`, msg);
        toast(msg, { timeout: 4000 });
        break;
      }
      default: return;
    }
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => state.keys.delete(e.code));
  window.addEventListener('blur', () => state.keys.clear());
}

function wirePointer() {
  const canvas = $('#scene');
  let drag = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
    state.tween = null;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      const sens = DRAG_SENS * (e.pointerType === 'touch' ? 1.3 : 1);
      state.yaw += dx * sens;   // drag-the-world, like a 360° photo viewer
      state.pitch = THREE.MathUtils.clamp(state.pitch + dy * sens, -PITCH_LIMIT, PITCH_LIMIT);
    } else if (e.pointerType === 'mouse' && renderer) {
      canvas.style.cursor = pick(e) ? 'pointer' : '';
    }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasClick = drag.moved < 6;
    drag = null;
    if (wasClick && e.type === 'pointerup') {
      const hit = pick(e);
      if (hit?.kind === 'info') openInfo(hit.poi);
      else if (hit?.kind === 'door') useDoor(hit.door);
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const objects = state.clickables.filter(isVisible);
  const hits = raycaster.intersectObjects(objects, false);
  return hits[0]?.object.userData || null;
}

function wireTouchPad() {
  document.querySelectorAll('#touch-pad button').forEach((b) => {
    const k = b.dataset.key;
    const on = (e) => { e.preventDefault(); state.keys.add(k); b.classList.add('held'); state.tween = null; };
    const off = () => { state.keys.delete(k); b.classList.remove('held'); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointerleave', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

function move(dt) {
  const k = state.keys;
  const has = (...codes) => codes.some((c) => k.has(c));

  const turn = (has('ArrowLeft', 'turnLeft') ? 1 : 0) - (has('ArrowRight', 'turnRight') ? 1 : 0);
  state.yaw += turn * TURN_SPEED * dt;
  const look = (has('PageUp') ? 1 : 0) - (has('PageDown') ? 1 : 0);
  state.pitch = THREE.MathUtils.clamp(state.pitch + look * LOOK_SPEED * dt, -PITCH_LIMIT, PITCH_LIMIT);

  const fwd = (has('KeyW', 'ArrowUp', 'forward') ? 1 : 0) - (has('KeyS', 'ArrowDown', 'back') ? 1 : 0);
  const strafe = (has('KeyD') ? 1 : 0) - (has('KeyA') ? 1 : 0);
  if (!fwd && !strafe) return;

  const speed = WALK_SPEED * (has('ShiftLeft', 'ShiftRight') ? RUN_MULT : 1) * dt;
  const sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
  let dx = -sin * fwd + cos * strafe;
  let dz = -cos * fwd - sin * strafe;
  const len = Math.hypot(dx, dz);
  state.pos.x += (dx / len) * speed;
  state.pos.z += (dz / len) * speed;

  const b = state.content.areas[state.areaId].bounds;
  state.pos.x = THREE.MathUtils.clamp(state.pos.x, b.minX + WALL_MARGIN, b.maxX - WALL_MARGIN);
  state.pos.z = THREE.MathUtils.clamp(state.pos.z, b.minZ + WALL_MARGIN, b.maxZ - WALL_MARGIN);
}

function checkDoors(dt) {
  state.doorCooldown = Math.max(0, state.doorCooldown - dt);
  const a = state.content.areas[state.areaId];
  let near = null, nearD = DOOR_PROMPT_RANGE;
  for (const d of a.doors || []) {
    const dist = Math.hypot(d.x - state.pos.x, d.z - state.pos.z);
    if (dist < nearD) { near = d; nearD = dist; }
  }
  if (near !== state.nearDoor) {
    state.nearDoor = near;
    $('#door-prompt').hidden = !near;
    if (near) {
      $('#door-btn').textContent = `${near.label}${isCoarse ? '' : '  (E)'}`;
      announce(`${near.label}: press E.`);
    }
  }
  if (near && nearD < DOOR_AUTO_RANGE && state.doorCooldown === 0 && !state.transitioning) useDoor(near);
}

/* ------------------------------------------------------------------ */
/* #5 Minimap with you-are-here marker (BR-07)                         */
/* ------------------------------------------------------------------ */
function drawMinimap() {
  const cv = $('#minimap');
  const g = cv.getContext('2d');
  const a = state.content.areas[state.areaId];
  const b = a.bounds;
  const W = cv.width, H = cv.height, pad = 16;
  const s = Math.min((W - pad * 2) / (b.maxX - b.minX), (H - pad * 2) / (b.maxZ - b.minZ));
  const ox = (W - (b.maxX - b.minX) * s) / 2, oz = (H - (b.maxZ - b.minZ) * s) / 2;
  const mx = (x) => ox + (x - b.minX) * s;
  const my = (z) => oz + (z - b.minZ) * s;

  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 2;
  g.fillRect(mx(b.minX), my(b.minZ), (b.maxX - b.minX) * s, (b.maxZ - b.minZ) * s);
  g.strokeRect(mx(b.minX), my(b.minZ), (b.maxX - b.minX) * s, (b.maxZ - b.minZ) * s);

  for (const d of a.doors || []) {
    const half = ((d.width || 1) / 2) * s;
    const side = doorSide(d, b);
    g.strokeStyle = '#5fd39a';
    g.lineWidth = 4;
    g.beginPath();
    if (side === 'minZ' || side === 'maxZ') { g.moveTo(mx(d.x) - half, my(d.z)); g.lineTo(mx(d.x) + half, my(d.z)); }
    else { g.moveTo(mx(d.x), my(d.z) - half); g.lineTo(mx(d.x), my(d.z) + half); }
    g.stroke();
  }
  g.fillStyle = '#a77fe6';
  for (const p of a.infoPoints || []) {
    g.beginPath(); g.arc(mx(p.x), my(p.z), 3.5, 0, Math.PI * 2); g.fill();
  }

  // You are here
  const px = mx(state.pos.x), py = my(state.pos.z);
  g.save();
  g.translate(px, py);
  g.rotate(-state.yaw);
  g.fillStyle = 'rgba(255,255,255,0.14)';
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 34, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); g.closePath(); g.fill();
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#4f2683';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -9); g.lineTo(6.5, 7); g.lineTo(0, 3.5); g.lineTo(-6.5, 7); g.closePath();
  g.fill(); g.stroke();
  g.restore();
}

/* ------------------------------------------------------------------ */
/* Frame loop                                                          */
/* ------------------------------------------------------------------ */
let elapsed = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (state.tween) stepTween(dt);
  else if (!state.transitioning) move(dt);
  if (!state.transitioning) checkDoors(dt);

  camera.position.copy(state.pos);
  camera.rotation.set(state.pitch, state.yaw, 0);

  if (!reducedMotion) {
    for (const m of state.infoMarkers) m.position.y = m.userData.baseY + Math.sin(elapsed * 2 + m.userData.phase) * 0.04;
  }

  renderer.render(scene, camera);
  drawMinimap();
  monitorFps(dt);
}