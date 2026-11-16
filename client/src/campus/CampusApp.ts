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

  // Get references to the HTML elements used by the campus interface.
  private readonly canvas = requireElement<HTMLCanvasElement>('#scene');
  private readonly sign = requireElement<HTMLElement>('#sign');
  private readonly hud = requireElement<HTMLElement>('#hud');
  private readonly roomBar = requireElement<HTMLElement>('#room-bar');
  private readonly roomHint = requireElement<HTMLElement>('#room-hint');
  private readonly backButton = requireElement<HTMLButtonElement>('#back');

  // Objects responsible for rendering and displaying the 3D content.
  private readonly renderer: THREE.WebGLRenderer;
  private readonly campus: CampusView;
  private readonly loader: LoaderOverlay;

  // Holds the room view when it has been loaded.
  // null means that the room scene is not currently loaded.
  private room: RoomView | null = null;

  // Tracks which scene is currently being displayed.
  private mode: Mode = 'campus';

  // Tracks whether the campus model has finished loading.
  private campusLoaded = false;

  // Prevents multiple room-loading operations from running at once.
  private busy = false;

  // Stores the timestamp of the previous animation frame.
  private previousFrame = performance.now();

  /**
   * Initializes the campus application.
   * Creates the WebGL renderer, campus scene and loading overlay.
   * Also fills in the room title and credit information.
   */
  constructor(options: CampusOptions) {
    // Create the renderer using the selected performance settings.
    this.renderer = createRenderer(this.canvas, options);

    // Set up the 3D campus view using the canvas and renderer.
    this.campus = new CampusView(this.canvas, this.renderer);

    // Create the loading overlay and connect its retry button.
    this.loader = new LoaderOverlay(() => this.retry());

    // Display the room title and its associated information.
    requireElement('#room-title').textContent = ROOM.title;
    requireElement('#room-kicker').textContent = `${ROOM.kicker} · ${ROOM.credit}`;
  }

  /**
   * Starts the application.
   * Connects event listeners, adjusts the display size,
   * starts the animation loop and loads the campus model.
   */
  start(): void {
    this.wireEvents();
    this.resize();

    // Start continuously updating and rendering the active scene.
    requestAnimationFrame(this.frame);

    // Begin loading the campus model without blocking this method.
    void this.loadCampus();
  }

  /* ------------------------------------------------------------------ flow */

  /**
   * Loads the 3D campus model.
   * Displays loading progress and reveals the campus interface
   */
  private async loadCampus(): Promise<void> {
    this.loader.open('Loading campus');

    try {
      // Wait for the campus model to finish loading.
      await this.campus.load(this.loader.setProgress);

      // Record that the campus is available for future use.
      this.campusLoaded = true;

      // Hide the loading overlay and display the campus interface.
      this.loader.close();
      this.hud.hidden = false;
      this.sign.hidden = false;

      // Reveal the interactive marker above the ACEB building.
      this.campus.revealMarker();

      // Position the HTML sign at the correct location on the 3D model.
      this.campus.positionLabel(this.sign);
    } catch (error) {
      // Display an error message if the campus model cannot load.
      this.loader.showError(error);
    }
  }

  /**
   * Loads and opens the ACEB 1420 room scan.
   * Prevents duplicate loading and ignores requests if the room
   * is already being displayed.
   */
  private async openRoom(): Promise<void> {
    if (this.busy || this.mode === 'room') return;

    // Indicate that a room-loading operation is in progress.
    this.busy = true;
    this.loader.open(`Loading ${ROOM.title} scan`);

    // Create a new room view and adjust it to the current window size.
    const next = new RoomView(this.canvas);
    next.resize(window.innerWidth, window.innerHeight);

    try {
      // Load the room scan and report its progress to the loading overlay.
      await next.load(this.loader.setProgress);

      // Store the loaded room and switch the application to room mode.
      this.room = next;
      this.mode = 'room';

      // Hide the campus interface and display the room controls.
      this.setRoomUiVisible(true);

      // Close the loading overlay and move keyboard focus to the back button.
      this.loader.close();
      this.backButton.focus({ preventScroll: true });
    } catch (error) {
      // Dispose of the partially loaded room if loading fails.
      next.dispose();

      // Display the loading error and allow the user to retry.
      this.loader.showError(error);
    } finally {
      // Allow another loading attempt regardless of whether loading succeeded.
      this.busy = false;
    }
  }

  /**
   * Closes the room view and returns to the 3D campus.
   * Releases the room's resources when leaving the scene.
   */
  private closeRoom(): void {
    // Do nothing if the application is not currently displaying the room.
    if (this.mode !== 'room') return;

    // Switch back to the campus scene.
    this.mode = 'campus';

    // Dispose of the room scene and release its resources.
    this.room?.dispose();
    this.room = null;

    // Restore the campus interface and hide the room controls.
    this.setRoomUiVisible(false);

    // Update the sign's position and restore keyboard focus to it.
    this.campus.positionLabel(this.sign);
    this.sign.focus({ preventScroll: true });
  }

  /**
   * Retries loading whichever scene previously failed.
   * Loads the campus if it has not loaded yet;
   * otherwise, retries loading the room scan.
   */
  private retry(): void {
    // Retry whichever download failed: the campus on first load, otherwise the room.
    if (this.campusLoaded) void this.openRoom();
    else void this.loadCampus();
  }

  /**
   * Controls which HTML interface elements are visible.
   *
   * When in the room, the campus sign and HUD are hidden.
   * When back on campus, the room controls are hidden.
   */
  private setRoomUiVisible(inRoom: boolean): void {
    this.sign.hidden = inRoom;
    this.hud.hidden = inRoom;
    this.roomBar.hidden = !inRoom;
    this.roomHint.hidden = !inRoom;
  }

  /* ---------------------------------------------------------------- events */

  /**
   * Connects user interactions to their corresponding functions.
   * Handles mouse clicks, keyboard input and window resizing.
   */
  private wireEvents(): void {
    // Resize the 3D display whenever the browser window changes size.
    window.addEventListener('resize', this.resize);

    // Open the room when the user clicks the campus sign.
    this.sign.addEventListener('click', () => void this.openRoom());

    // Allow the sign to be activated using the keyboard.
    this.sign.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void this.openRoom();
      }
    });

    // Return to the campus when the back button is clicked.
    this.backButton.addEventListener('click', () => this.closeRoom());

    // Allow the Escape key to return to the campus from the room.
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.mode === 'room') this.closeRoom();
    });
  }

  /**
   * Updates the renderer and both views when the window is resized.
   * Also repositions the campus sign if the campus scene is active.
   */
  private readonly resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update the renderer to match the new window dimensions.
    this.renderer.setSize(width, height, false);

    // Resize the campus and room views.
    this.campus.resize(width, height);
    this.room?.resize(width, height);

    // Recalculate the sign's screen position when displaying the campus.
    if (this.mode === 'campus') this.campus.positionLabel(this.sign);
  };

  /* ------------------------------------------------------------------ loop */

  /**
   * Main animation loop.
   * Updates and renders whichever scene is currently active.
   */
  private readonly frame = (now: number): void => {
    // Calculate the time elapsed since the previous frame.
    // Limit the maximum time step to prevent large jumps after tab inactivity.
    const dt = Math.min((now - this.previousFrame) / 1000, 0.1);
    this.previousFrame = now;

    if (this.mode === 'room' && this.room) {
      // Update the room scene and render it using its own camera.
      this.room.update(dt);
      this.renderer.render(this.room.scene, this.room.camera);
    } else {
      // Update the campus scene and reposition its interactive sign.
      this.campus.update(dt);
      this.campus.positionLabel(this.sign);

      // Render the campus using the campus camera.
      this.renderer.render(this.campus.scene, this.campus.camera);
    }

    // Schedule the next animation frame to keep the scene updating.
    requestAnimationFrame(this.frame);
  };
}

/**
 * Creates and configures the Three.js WebGL renderer.
 *
 * Low-performance mode (BR-09, selected on the landing page)
 * reduces GPU workload by disabling antialiasing and shadows
 * and using a lower-resolution rendering buffer.
 */
function createRenderer(canvas: HTMLCanvasElement, options: CampusOptions): THREE.WebGLRenderer {

  // Create the WebGL renderer and apply the selected performance settings.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !options.lowPerf,
    alpha: true,
    powerPreference: options.lowPerf ? 'low-power' : 'default',
  });

  // Set the rendering resolution.
  renderer.setPixelRatio(options.lowPerf ? 1 : Math.min(window.devicePixelRatio, 2));

  // Use the sRGB colour space for accurate colour display.
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Apply filmic tone mapping to improve the appearance of lighting and colours.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Enable shadows only when low-performance mode is disabled.
  renderer.shadowMap.enabled = !options.lowPerf;

  // Select a soft shadow algorithm for smoother shadow edges.
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}
