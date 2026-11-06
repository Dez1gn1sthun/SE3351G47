import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS, SIGN_FALLBACK, SIGN_NODE_NAME } from './config';
import type { ProgressFn } from './types';

/** Where the camera sits relative to the building cluster, at rest. */
const VIEW_DIRECTION = new THREE.Vector3(0.5, 1.15, 0.44).normalize();

/**
 * The massing blocks ship as flat, single-colour boxes, which read as cardboard
 * from a low angle. Two cheap world-space effects fix most of that without
 * textures or UVs (several meshes have none):
 *
 * - contact occlusion: darkens the lower few metres of every volume, so blocks
 *   sit in the terrain instead of hovering over it
 * - mottling: a little value noise breaks up the perfectly even albedo that
 *   gives away an untextured box; the glazing is left smooth on purpose
 */
const AO_GROUND_Y = 1.5;
const AO_HEIGHT = 3.5;

function applyMassingSurface(material: THREE.MeshStandardMaterial, mottle: boolean): void {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMassingPos;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvMassingPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vMassingPos;
float massingHash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}
float massingNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = massingHash(i);
  float n100 = massingHash(i + vec3(1.0, 0.0, 0.0));
  float n010 = massingHash(i + vec3(0.0, 1.0, 0.0));
  float n110 = massingHash(i + vec3(1.0, 1.0, 0.0));
  float n001 = massingHash(i + vec3(0.0, 0.0, 1.0));
  float n101 = massingHash(i + vec3(1.0, 0.0, 1.0));
  float n011 = massingHash(i + vec3(0.0, 1.0, 1.0));
  float n111 = massingHash(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float height = smoothstep(${AO_GROUND_Y.toFixed(1)}, ${(AO_GROUND_Y + AO_HEIGHT).toFixed(1)}, vMassingPos.y);
  float occlusion = mix(0.78, 1.0, height);
  ${
    mottle
      ? `float blotch = massingNoise(vMassingPos * 0.55) * 0.65 + massingNoise(vMassingPos * 2.3) * 0.35;
  diffuseColor.rgb *= occlusion * (0.88 + 0.12 * blotch);`
      : 'diffuseColor.rgb *= occlusion;'
  }
}`,
      );
  };
  material.customProgramCacheKey = () => (mottle ? 'massing-mottled' : 'massing-smooth');
  material.needsUpdate = true;
}

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

  private readonly renderer: THREE.WebGLRenderer;
  private readonly sun: THREE.DirectionalLight;

  /** Cached so the camera can be re-fitted when the viewport changes shape. */
  private frameCenter = new THREE.Vector3();
  private frameRadius = 0;
  /** Once the user orbits, resizing keeps their framing instead of resetting. */
  private touched = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    renderer: THREE.WebGLRenderer,
  ) {
    this.renderer = renderer;
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);
    this.camera.position.set(150, 120, -60);

    // Left transparent so the page's gradient shows through around the model:
    // the terrain reads as a floating map plate rather than a clipped image.
    this.scene.background = null;
    // Dissolves the far edge of the plate and separates the building layers.
    this.scene.fog = new THREE.FogExp2('#161d2b', 0.0011);

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

    this.sun = new THREE.DirectionalLight('#fff1d8', 1.0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.6;
    this.sun.shadow.radius = 2.5;

    // Cheap sky/ground bounce; most of the ambient comes from the env map below.
    const bounce = new THREE.HemisphereLight('#cfe0ff', '#3a4034', 0.5);

    this.scene.add(this.sun, this.sun.target, bounce, this.marker);
    this.applySkyEnvironment();
    this.ring = this.buildMarker();
  }

  /**
   * Image-based lighting from a procedural sky gradient. The massing blocks are
   * authored at roughness 0.5 with no textures, so without an environment they
   * have no specular response at all and read as flat cardboard. This gives them
   * a soft sheen, the glazing a sky reflection, and the scene natural ambient.
   */
  private applySkyEnvironment(): void {
    const sky = document.createElement('canvas');
    sky.width = 16;
    sky.height = 128;
    const ctx = sky.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, sky.height);
    gradient.addColorStop(0, '#4d7ec6');
    gradient.addColorStop(0.42, '#b9cde3');
    gradient.addColorStop(0.5, '#8e968a');
    gradient.addColorStop(0.64, '#5d6353');
    gradient.addColorStop(1, '#33372c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sky.width, sky.height);

    const texture = new THREE.CanvasTexture(sky);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromEquirectangular(texture).texture;
    this.scene.environmentIntensity = 0.9;
    pmrem.dispose();
    texture.dispose();
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
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Several parts of the export use a mirroring scale of -1, which flips
      // the winding order and hides faces when back-face culling is on.
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        material.side = THREE.DoubleSide;
        const standard = material as THREE.MeshStandardMaterial;
        if (standard.map) standard.map.anisotropy = 8;
        if (mesh === this.groundMesh) continue;

        // Glazing is authored matte; a tighter lobe lets the sky env reflect.
        if (material.name === 'Glass' && 'roughness' in standard) {
          standard.roughness = 0.18;
          applyMassingSurface(standard, false);
        } else {
          applyMassingSurface(standard, true);
        }
      }
    });

    this.scene.add(this.model);
    if (this.groundMesh) this.makeGroundShadowReceiver();

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
    this.aimSun();
    this.layout();
  }

  /**
   * Positions the sun and tightens its shadow camera to the building cluster, so
   * a 2048px map spends its resolution where the shadows are actually read.
   */
  private aimSun(): void {
    const center = this.frameCenter;
    const radius = this.frameRadius;
    if (radius <= 0) return;

    // ~30 degrees of elevation, shadows falling toward +z. The satellite
    // imagery already has sun/shade baked in, so matching that angle is what
    // makes the blockout buildings sit on the photograph instead of on top of it.
    const direction = new THREE.Vector3(0.25, 0.5, -0.83).normalize();
    this.sun.position.copy(center).addScaledVector(direction, radius * 3);
    this.sun.target.position.copy(center);
    this.sun.target.updateMatrixWorld();

    const extent = radius * 1.8;
    const camera = this.sun.shadow.camera;
    camera.left = -extent;
    camera.right = extent;
    camera.top = extent;
    camera.bottom = -extent;
    camera.near = radius * 0.5;
    camera.far = radius * 7;
    camera.updateProjectionMatrix();
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
   * The satellite terrain is exported unlit (`KHR_materials_unlit`), and unlit
   * materials ignore both lights and shadow maps. Swapping in a standard
   * material with the same map costs nothing visually once the light levels are
   * balanced, and lets the buildings finally cast onto the ground.
   */
  private makeGroundShadowReceiver(): void {
    const mesh = this.groundMesh;
    if (!mesh) return;

    const replace = (material: THREE.Material): THREE.Material => {
      if (!(material instanceof THREE.MeshBasicMaterial)) return material;
      // The unlit export effectively showed the map at full strength; the light
      // rig only delivers ~0.65 of that to an up-facing surface, so the albedo
      // is scaled up to keep the photograph looking exactly as it did.
      const lit = new THREE.MeshStandardMaterial({
        map: material.map,
        color: new THREE.Color().setScalar(1.85),
        roughness: 0.95,
        metalness: 0,
      });
      material.dispose();
      return lit;
    };

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(replace)
      : replace(mesh.material);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
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
