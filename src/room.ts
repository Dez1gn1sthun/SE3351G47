import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS } from './config';
import type { ProgressFn } from './types';

/**
 * The interior: a photogrammetry scan you stand inside.
 *
 * The scan has no meaningful authored camera, so the eye point is derived from
 * its bounding box: mid-height, a third of the way across the shorter axis,
 * looking down the long axis.
 */
export class RoomView {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;

  private readonly model = new THREE.Group();

  constructor(canvas: HTMLCanvasElement) {
    this.scene.background = new THREE.Color('#0b0d12');

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.02, 200);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.45;
    this.controls.zoomSpeed = 0.6;
    this.controls.panSpeed = 0.5;
    // Looking past vertical inside a room flips the scan upside down.
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI - 0.12;

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#5a5f70', 2.2));
    const fill = new THREE.DirectionalLight('#ffffff', 1.1);
    fill.position.set(0.4, 1, 0.3).multiplyScalar(10);
    this.scene.add(fill, this.model);
  }

  async load(onProgress?: ProgressFn): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(
      MODELS.room,
      (event) => onProgress?.(event.loaded, event.total),
    );

    this.model.add(gltf.scene);
    gltf.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      // Photogrammetry shells are single-sided sheets; from inside the room the
      // visible faces are the ones pointing away from the scan normals.
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!material) continue;
        material.side = THREE.DoubleSide;
        const map = (material as THREE.MeshStandardMaterial).map;
        if (map) {
          map.anisotropy = 8;
          map.colorSpace = THREE.SRGBColorSpace;
        }
      }
    });

    this.frameInterior();
  }

  private frameInterior(): void {
    const box = new THREE.Box3().setFromObject(this.model);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const short = Math.min(size.x, size.z);

    // Stand off-centre near one end so the far wall and the floor both read.
    this.camera.position.copy(center).add(
      new THREE.Vector3(size.x * 0.1, size.y * 0.16, -short * 0.32),
    );
    this.controls.target.copy(center);

    this.camera.near = Math.max(0.02, size.length() * 0.001);
    this.camera.far = size.length() * 6;
    this.camera.updateProjectionMatrix();

    this.controls.minDistance = 0.4;
    this.controls.maxDistance = Math.max(size.x, size.z) * 0.85;
    this.camera.lookAt(this.controls.target);
    this.controls.update();
  }

  update(dt: number): void {
    this.controls.update(dt);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Frees ~20 MB of texture and geometry as soon as the user leaves. */
  dispose(): void {
    this.controls.dispose();
    this.model.traverse((child) => {
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
    this.model.clear();
  }
}
