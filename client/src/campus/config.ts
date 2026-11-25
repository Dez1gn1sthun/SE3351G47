/**
 * Shared, site-wide settings. Everything that a designer or teammate might want
 * to tweak after a model update lives here.
 */

const base = import.meta.env.BASE_URL;

export const MODELS = {
  /** Western Engineering campus blockout (satellite ground + building masses). */
  campus: `${base}models/eng-campus.glb`,
  /** Scaniverse LiDAR scan of ACEB 1420. Loaded only when the sign is clicked. */
  room: `${base}models/aceb-1420.glb`,
} as const;

/** Name of the empty inside `eng-campus.glb` that anchors the campus marker UI. */
export const SIGN_NODE_NAME = 'sign';

/**
 * Used only if the GLB has no `sign` empty (e.g. it was lost in a re-export).
 * Worth keeping in sync with the empty so a broken export still ships a marker.
 *
 * Sits just off the corner of ACEB (the Amit Chakma Engineering Building), where
 * the model's own "Amit Chakma Engineering Building" text object marks the
 * entrance. Re-export the campus with the `sign` empty selected, or the marker
 * falls back to this point.
 */
export const SIGN_FALLBACK = { x: 20, y: 1.5, z: -4.5 } as const;

/** Ground-plane WASD movement speed, in world units per second. */
export const WASD_MOVE_SPEED = 36;

/** The room is much smaller, so it uses a slower navigation speed. */
export const ROOM_WASD_MOVE_SPEED = 6;

export const ROOM = {
  title: 'ACEB 1420',
  kicker: 'LiDAR scan',
  credit: 'Scaniverse',
} as const;
