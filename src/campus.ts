import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS, SIGN_FALLBACK, SIGN_NODE_NAME } from './config';
import type { ProgressFn } from './types';

/** Where the camera sits relative to the building cluster, at rest. */
const VIEW_DIRECTION = new THREE.Vector3(0.5, 1.15, 0.44).normalize();

interface DebugNode {
  el: HTMLElement;
  object: THREE.Object3D;
}

/**
 * Campus scene: the engineering buildings, the ground marker for the `sign`
 * empty, and orbiting.
 *
 * The marker is authored in Blender as an empty named `sign`; a DOM label is
 * projected from that world-space point every frame, so moving the empty in the
 * source file moves the UI with it.
 */
export class CampusView {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;

  /** World-space anchor of the `sign` empty. */
  readonly anchor = new THREE.Vector3(SIGN_FALLBACK.x, SIGN_FALLBACK.y, SIGN_FALLBACK.z);

  private readonly marker = new THREE.Group();
  private readonly ring: THREE.Mesh;
  private groundMesh: THREE.Mesh | null = null;
  private model: THREE.Object3D | null = null;
  private debugNodes: DebugNode[] = [];
  private elapsed = 0;

  /** Cached so the camera can be re-fitted when the viewport changes shape. */
  private frameCenter = new THREE.Vector3();
  private frameRadius = 0;
  /** Once the user orbits, resizing keeps their framing instead of resetting. */
  private touched = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);
    this.camera.position.set(150, 120, -60);

    // Left transparent so the page's gradient shows through around the model:
    // the terrain reads as a floating map plate rather than a clipped image.
    this.scene.background = null;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 460;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.47; // never dip below the ground
    this.controls.zoomSpeed = 0.8;
    this.controls.target.set(46, 7, 26);
    this.controls.addEventListener('start', () => {
      this.touched = true;
    });

    const hemi = new THREE.HemisphereLight('#dce7ff', '#2b2f26', 1.3);
    const sun = new THREE.DirectionalLight('#fff6e8', 1.5);
    sun.position.set(180, 240, -140);

    this.scene.add(hemi, sun, this.marker);
    this.ring = this.buildMarker();
  }

  /**
   * A ground ring plus a centre dot: reads as a location on the map, and keeps
   * the label honest even when the camera is high above the campus.
   */
  private buildMarker(): THREE.Mesh {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.8, 4.6, 64),
      new THREE.MeshBasicMaterial({
        color: '#a78bfa',
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 2;

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 28),
      new THREE.MeshBasicMaterial({
        color: '#ddd6fe',
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    core.rotation.x = -Math.PI / 2;
    core.position.y = 0.02;
    core.renderOrder = 3;

    this.marker.add(ring, core);
    this.marker.position.set(this.anchor.x, 0.05, this.anchor.z);
    return ring;
  }

  async load(onProgress?: ProgressFn): Promise<void> {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(
      MODELS.campus,
      (event) => onProgress?.(event.loaded, event.total),
    );

    this.model = gltf.scene;
    this.model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.name.toLowerCase().includes('ground')) this.groundMesh = mesh;
      // Several parts of the export use a mirroring scale of -1, which flips
      // the winding order and hides faces when back-face culling is on.
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        material.side = THREE.DoubleSide;
        const map = (material as THREE.MeshStandardMaterial).map;
        if (map) map.anisotropy = 8;
      }
    });

    this.scene.add(this.model);

    const sign = this.model.getObjectByName(SIGN_NODE_NAME);
    if (sign) {
      this.anchor.setFromMatrixPosition(sign.matrixWorld);
    } else {
      console.error(
        `No "${SIGN_NODE_NAME}" empty in ${MODELS.campus}; using the fallback anchor.`,
        this.anchor.toArray(),
      );
    }

    // Dev convenience: `?sign=x,y,z` retunes the marker without re-exporting.
    if (import.meta.env.DEV) {
      const override = new URLSearchParams(location.search).get('sign');
      if (override) {
        const [x, y, z] = override.split(',').map(Number);
        if ([x, y, z].every((value) => Number.isFinite(value))) {
          this.anchor.set(x ?? 0, y ?? 0, z ?? 0);
        }
      }
    }

    this.placeMarkerOnTerrain();

    this.frameBuildings();
    this.mountDebugNodes();
  }

  /**
   * Frames the building cluster rather than the whole terrain quad, so the sign
   * is readable on first paint instead of being one pixel in a car park.
   */
  private frameBuildings(): void {
    if (!this.model) return;

    const buildings = new THREE.Box3();
    const ground = new THREE.Box3();
    this.model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (child.name.toLowerCase().includes('ground')) ground.expandByObject(mesh);
      else buildings.expandByObject(mesh);
    });

    const box = buildings.isEmpty() ? ground : buildings;
    if (box.isEmpty()) return;

    this.frameCenter = box.getCenter(new THREE.Vector3());
    this.frameRadius = box.getBoundingSphere(new THREE.Sphere()).radius;
    this.layout();
  }

  /**
   * Fits the cluster to the viewport. A portrait phone has a much narrower
   * horizontal field of view, so the same distance would crop the campus badly;
   * the horizontal fit is allowed to pull back, but only up to 1.4x.
   */
  private layout(): void {
    if (this.frameRadius <= 0) return;

    const halfV = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * this.camera.aspect);
    const fitV = this.frameRadius / Math.sin(halfV);
    const fitH = this.frameRadius / Math.sin(halfH);
    const distance = Math.max(fitV, Math.min(fitH, fitV * 1.4)) * 0.95;

    this.controls.target.copy(this.frameCenter);
    this.camera.position
      .copy(this.frameCenter)
      .addScaledVector(VIEW_DIRECTION, Math.min(distance, this.controls.maxDistance));
    this.camera.lookAt(this.frameCenter);
    this.controls.update();
  }

  /**
   * Drops the marker onto the terrain surface. The satellite scan is not flat,
   * so a downward ray is more reliable than trusting the empty's Y value.
   */
  private placeMarkerOnTerrain(): void {
    let height = Math.max(this.anchor.y, 0.05);

    if (this.groundMesh) {
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(this.anchor.x, this.anchor.y + 200, this.anchor.z),
        new THREE.Vector3(0, -1, 0),
      );
      const hit = raycaster.intersectObject(this.groundMesh, false)[0];
      if (hit) height = hit.point.y + 0.06;
    }

    this.marker.position.set(this.anchor.x, height, this.anchor.z);
  }

  /** Grows the marker in once the model is on screen. */
  revealMarker(): void {
    const from = performance.now();
    const grow = (): void => {
      const t = Math.min((performance.now() - from) / 650, 1);
      this.marker.scale.setScalar(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(grow);
    };
    this.marker.scale.setScalar(0);
    grow();
  }

  update(dt: number): void {
    this.controls.update(dt);

    this.elapsed += dt;
    // Slow breathing pulse so the marker reads as a target, not a sticker.
    const pulse = 1 + Math.sin(this.elapsed * 1.9) * 0.07;
    this.ring.scale.setScalar(pulse);
    (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.8 - (pulse - 1) * 2;

    this.updateDebugNodes();
  }

  /**
   * Places the DOM sign label on the screen position of the `sign` empty.
   * Written to `visibility` rather than `hidden`: it stays cheap per frame and
   * never triggers layout.
   */
  positionLabel(el: HTMLElement): void {
    const projected = this.anchor.clone().project(this.camera);
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;

    // Margins cover the card (roughly 170x70) and its stem, so the label is
    // hidden rather than clipped when the anchor leaves the viewport.
    const onScreen =
      projected.z < 1 && x > 100 && x < width - 100 && y > 160 && y < height - 30;
    el.style.visibility = onScreen ? 'visible' : 'hidden';
    if (!onScreen) return;

    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  /* -------------------------------------------------- dev-only node labels */

  /**
   * Names every node on screen, so a sign position can be chosen by eye.
   * Enabled from `main.ts` for `?nodes` in dev builds only; costs nothing in
   * production because nothing ever fills `debugNodes`.
   */
  mountDebugNodes(): void {
    if (!import.meta.env.DEV || !this.model) return;
    if (!new URLSearchParams(location.search).has('nodes')) return;

    const host = document.querySelector<HTMLElement>('#node-debug');
    if (!host) return;

    this.model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const el = document.createElement('div');
      el.className = 'dbg';
      el.textContent = mesh.name;
      host.append(el);
      this.debugNodes.push({ el, object: mesh });
    });
  }

  private updateDebugNodes(): void {
    if (this.debugNodes.length === 0) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const point = new THREE.Vector3();

    for (const { el, object } of this.debugNodes) {
      new THREE.Box3().setFromObject(object).getCenter(point);
      const projected = point.project(this.camera);
      if (projected.z > 1) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`;
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (!this.touched) this.layout();
  }

  dispose(): void {
    this.controls.dispose();
    this.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        (material as THREE.MeshStandardMaterial).map?.dispose();
        material.dispose();
      }
    });
  }
}
