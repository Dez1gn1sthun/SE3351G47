import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WASD_MOVE_SPEED } from './config';

const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);

/**
 * Translates an OrbitControls camera and its target together across the XZ
 * plane. Forward follows the camera's heading, not the world axes.
 */
export class GroundNavigator {
  private readonly keys = new Set<string>();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly movement = new THREE.Vector3();
  private readonly quaternion = new THREE.Quaternion();
  private readonly abort = new AbortController();
  private moving = false;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly speed = WASD_MOVE_SPEED,
  ) {
    window.addEventListener('keydown', this.onKeyDown, { signal: this.abort.signal });
    window.addEventListener('keyup', this.onKeyUp, { signal: this.abort.signal });
    window.addEventListener('blur', this.clearKeys, { signal: this.abort.signal });
    document.addEventListener('visibilitychange', this.onVisibilityChange, {
      signal: this.abort.signal,
    });
  }

  /** Whether the most recent update actually translated the camera. */
  get isMoving(): boolean {
    return this.moving;
  }

  update(dt: number): boolean {
    this.moving = false;
    if (dt <= 0 || this.keys.size === 0) return false;

    const longitudinal = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const lateral = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    if (longitudinal === 0 && lateral === 0) return false;

    this.camera.getWorldQuaternion(this.quaternion);
    this.forward.set(0, 0, -1).applyQuaternion(this.quaternion).setY(0);
    this.right.set(1, 0, 0).applyQuaternion(this.quaternion).setY(0);
    if (this.forward.lengthSq() > 1e-8) this.forward.normalize();
    else this.forward.set(0, 0, 0);
    if (this.right.lengthSq() > 1e-8) this.right.normalize();
    else this.right.set(0, 0, 0);

    this.movement
      .set(0, 0, 0)
      .addScaledVector(this.forward, longitudinal)
      .addScaledVector(this.right, lateral);
    if (this.movement.lengthSq() === 0) return false;

    // Normalize so W+D is no faster than W alone. Applying the same offset to
    // camera and target preserves orbit distance, angle, and target height.
    this.movement.normalize().multiplyScalar(this.speed * dt);
    this.controls.target.add(this.movement);
    this.camera.position.add(this.movement);
    this.moving = true;
    return true;
  }

  dispose(): void {
    this.abort.abort();
    this.clearKeys();
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!MOVEMENT_KEYS.has(event.code)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (this.isTextEntry(event.target)) return;

    event.preventDefault();
    this.keys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (!MOVEMENT_KEYS.has(event.code)) return;
    this.keys.delete(event.code);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.clearKeys();
  };

  private readonly clearKeys = (): void => {
    this.keys.clear();
    this.moving = false;
  };

  private isTextEntry(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && (
      target.isContentEditable || target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
    );
  }
}
