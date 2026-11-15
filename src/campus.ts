import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS, SIGN_FALLBACK, SIGN_NODE_NAME } from './config';
import type { ProgressFn } from './types';

/** Where the camera sits relative to the building cluster, at rest. */
// Looking in from -z: that is the ACEB entrance side and the side the sun
// reaches, so the sign faces the default view instead of hiding behind it.
/** Sky band colours; the fog and the distant ground meet the sky here. */
const SKY_ZENITH = '#4f7ec0';
const SKY_HORIZON = '#c3d2e2';
const VIEW_DIRECTION = new THREE.Vector3(0.42, 1.05, -0.88).normalize();

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


//Theses are specific to the scanned environment
/**
 * Surface response per material. The export authors every material at the glTF
 * default of roughness 0.5, which makes glass, limestone and painted metal all
 * look the same; these are the values the materials actually want. Colours are
 * linear, matching how the glTF loader set them.
 */
function tuneSurface(material: THREE.MeshStandardMaterial): void {
  switch (material.name) {
    case 'Glass':
      // Curtain wall: close to a mirror, so the sky gradient does the work and
      // the glazing reads as glass rather than as a flat blue panel.
      // Tinted metal: the reflection carries the scene, the tint keeps it reading
      // as blue glazing rather than a mirror.
      material.color.setRGB(0.1, 0.18, 0.46);
      material.metalness = 0.5;
      material.roughness = 0.06;
      material.envMapIntensity = 1.4;
      break;
    case 'Brown':
      // The dark red-brown band on ACEB; glazed tile, so it holds a highlight.
      material.metalness = 0.15;
      material.roughness = 0.3;
      material.envMapIntensity = 1.15;
      break;
    case 'White Sheet':
      // Painted sheet metal: a little metallic so it is not flat card.
      material.metalness = 0.3;
      material.roughness = 0.45;
      material.envMapIntensity = 0.9;
      break;
    case 'Black':
      material.metalness = 0.2;
      material.roughness = 0.5;
      material.envMapIntensity = 0.9;
      break;
    case 'Grey':
    case 'Yellow Brick':
    case 'Material.001':
      // Concrete and brick: rough, and barely reflective.
      material.metalness = 0;
      material.roughness = 0.82;
      material.envMapIntensity = 0.5;
      break;
    case 'Brick':
      // Limestone facing.
      material.metalness = 0;
      material.roughness = 0.78;
      material.envMapIntensity = 0.55;
      break;
    default:
      break;
  }
}

/**
 * True footprint of the plate in world XZ. The export bakes a rotation into the
 * ground node, so a Box3 is badly inflated and skewed; walking the vertices is
 * the only way to know where the photograph actually ends.
 */
function plateBoundsXZ(mesh: THREE.Mesh): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
} {
  mesh.updateWorldMatrix(true, false);

  const position = mesh.geometry.getAttribute('position');
  const index = mesh.geometry.getIndex();
  const point = new THREE.Vector3();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  const count = index ? index.count : position.count;
  for (let i = 0; i < count; i += 1) {
    point.fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(mesh.matrixWorld);
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
    if (point.z < minZ) minZ = point.z;
    if (point.z > maxZ) maxZ = point.z;
  }

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

/**
 * Softens the photograph's own edge. The camera is held close enough that the
 * edge normally sits outside the viewport; this is the graceful failure when the
 * window is an awkward aspect.
 */
function fadePlateRim(material: THREE.MeshStandardMaterial, mesh: THREE.Mesh): void {
  const { minX, maxX, minZ, maxZ } = plateBoundsXZ(mesh);
  const centre = new THREE.Vector2((minX + maxX) / 2, (minZ + maxZ) / 2);
  const size = new THREE.Vector2(maxX - minX, maxZ - minZ);

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRimCentre = { value: centre };
    shader.uniforms.uRimHalf = { value: new THREE.Vector2(size.x / 2, size.y / 2) };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRimPos;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvRimPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vRimPos;
uniform vec2 uRimCentre;
uniform vec2 uRimHalf;`,
      )
      .replace(
        '#include <alphamap_fragment>',
        `#include <alphamap_fragment>
{
  vec2 offset = abs((vRimPos.xz - uRimCentre) / uRimHalf);
  diffuseColor.a *= 1.0 - smoothstep(0.88, 0.995, max(offset.x, offset.y));
}`,
      );
  };
  material.customProgramCacheKey = () => 'plate-rim';
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
  /** Cached label width; re-measured on resize so the card never clips. */
  private labelWidth = 0;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly sun: THREE.DirectionalLight;

  /** Glazing, so the reflection probe knows what to hide while it renders. */
  private readonly glassMeshes: THREE.Mesh[] = [];
  /** Sky gradient, reused as the probe's backdrop. */
  private skyTexture: THREE.Texture | null = null;
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
    this.camera = new THREE.PerspectiveCamera(42, 1, 1, 4000);
    this.camera.position.set(150, 120, -60);

    // Lighting only: the sky is never seen, so it exists purely as the
    // environment map the massing materials need for a specular response.
    this.makeSky();

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 30;
    this.controls.minPolarAngle = 0.12;
    // Down to almost ground level, for a street-side view of the facades.
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
    this.controls.zoomSpeed = 0.8;
    this.controls.target.set(46, 7, 26);
    this.controls.addEventListener('start', () => {
      this.touched = true;
    });

    this.sun = new THREE.DirectionalLight('#fff1d8', 1.35);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.6;
    this.sun.shadow.radius = 2.5;

    // Cheap sky/ground bounce; most of the ambient comes from the env map below.
    const bounce = new THREE.HemisphereLight('#cfe0ff', '#3a4034', 0.3);

    this.scene.add(this.sun, this.sun.target, bounce, this.marker);
    this.ring = this.buildMarker();
  }

  /**
   * Procedural sky, baked down to an environment map. The massing blocks are
   * authored at roughness 0.5 with no textures, so without an environment they
   * have no specular response at all and read as cardboard.
   */
  private makeSky(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, SKY_ZENITH);
      gradient.addColorStop(0.4, '#a8c3dc');
      // Everything at and below the horizon is the fog colour, so the ground
      // plane's far edge and the sky behind it are literally the same value.
      gradient.addColorStop(0.46, SKY_HORIZON);
      gradient.addColorStop(1, SKY_HORIZON);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.skyTexture = texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromEquirectangular(texture).texture;
    this.scene.environmentIntensity = 0.75;
    pmrem.dispose();
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

        tuneSurface(standard);
        applyMassingSurface(standard, material.name !== 'Glass');
        if (material.name === 'Glass') this.glassMeshes.push(mesh);
      }
    });

    this.scene.add(this.model);
    if (this.groundMesh) {
      this.makeGroundShadowReceiver();
    }

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
    this.captureReflectionProbe();
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
   * Renders the site into a cubemap and hands it to the glazing as an env map.
   * The glazing otherwise only ever reflects the sky gradient, which reads as a
   * flat blue panel; a probe picks up the road, the car park and the neighbouring
   * blocks, which is what makes glass look like glass.
   */
  private captureReflectionProbe(): void {
    if (this.glassMeshes.length === 0 || !this.model) return;

    // Sit the probe low and just off the facade. Placed high it only ever sees
    // sky, and uniformly bright sky reflecting in a smooth surface is exactly the
    // flat panel we are trying to get rid of: the contrast of dark ground below
    // against bright sky above is what reads as glass.
    const bounds = new THREE.Box3();
    for (const mesh of this.glassMeshes) bounds.expandByObject(mesh);
    const centre = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.z) * 1.6;
    const outward = VIEW_DIRECTION.clone().setY(0).normalize();
    const position = centre
      .clone()
      .addScaledVector(outward, radius * 0.5)
      .setY(bounds.min.y + size.y * 0.12);

    const cubeTarget = new THREE.WebGLCubeRenderTarget(512, {
      type: THREE.HalfFloatType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace,
    });
    const cubeCamera = new THREE.CubeCamera(1, radius * 8, cubeTarget);
    cubeCamera.position.copy(position);

    // Hidden while probing: the glazing would otherwise reflect itself and go
    // black, and the marker is not part of the building.
    const hidden: THREE.Object3D[] = [...this.glassMeshes, this.marker];
    const previousVisibility = hidden.map((object) => object.visible);
    hidden.forEach((object) => {
      object.visible = false;
    });
    const previousBackground = this.scene.background;
    this.scene.background = this.skyTexture;

    cubeCamera.update(this.renderer, this.scene);

    hidden.forEach((object, index) => {
      object.visible = previousVisibility[index] ?? true;
    });
    this.scene.background = previousBackground;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromCubemap(cubeTarget.texture).texture;
    pmrem.dispose();
    cubeTarget.dispose();

    for (const mesh of this.glassMeshes) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        standard.envMap = env;
        standard.envMapIntensity = 1.4;
        standard.roughness = 0.06;
        standard.needsUpdate = true;
      }
    }
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
    // Portrait gets up to 1.8x the pull-back: the cluster is wide, and at 1.4x
    // the corners (including the sign) were being cropped away.
    const distance = Math.max(fitV, Math.min(fitH, fitV * 1.8)) * 0.95;

    this.controls.target.copy(this.frameCenter);
    this.camera.position
      .copy(this.frameCenter)
      .addScaledVector(VIEW_DIRECTION, distance);
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
        envMapIntensity: 0.45,
        transparent: true,
        depthWrite: false,
      });
      fadePlateRim(lit, mesh);
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
      // Trust the empty: only follow the surface when the two nearly agree, so a
      // sign authored on a roof or mid-air stays exactly where it was placed.
      if (hit && Math.abs(hit.point.y - this.anchor.y) < 2.5) {
        height = hit.point.y + 0.06;
      }
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

    if (this.labelWidth === 0) {
      const card = el.querySelector('.sign__card');
      this.labelWidth = card instanceof HTMLElement ? card.offsetWidth : 170;
    }

    // The card is hidden when the anchor drops out of view, but it slides along
    // the viewport edge rather than being cut off: on a narrow phone the sign
    // sits very close to the side and would otherwise be unreachable.
    const onScreen = projected.z < 1 && y > 150 && y < height - 20;
    el.style.visibility = onScreen ? 'visible' : 'hidden';
    if (!onScreen) return;

    const half = this.labelWidth / 2 + 12;
    const clamped = Math.min(Math.max(x, half), Math.max(half, width - half));
    const shift = Math.round(clamped - x);
    el.style.setProperty('--label-shift', `${shift}px`);
    el.classList.toggle('is-shifted', Math.abs(shift) > 2);
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
    this.labelWidth = 0; // media queries may change the card's size
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
