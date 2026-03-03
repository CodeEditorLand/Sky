/**
 * @module Effect/Layers/Electron
 * @description
 * Complete Effect layer stack for Electron runtime (Sky).
 * Composes all atomic services into a runnable layer using Electron IPC.
 */
import { Layer } from "effect";
/**
 * Base Electron layer stack.
 * Provides: Sandbox + IPC + Configuration + Telemetry + Mountain
 *
 * Use this when you need manual control over configuration sync.
 */
export declare const ElectronBaseLayer: Layer.Layer<never, any, any>;
/**
 * Full Electron layer stack with automatic configuration sync.
 * Provides: All base services + reactive Mountain-driven config updates
 *
 * This is the standard layer for Sky (Electron) builds.
 */
export declare const ElectronLiveLayer: Layer.Layer<never, any, any>;
/**
 * Electron layer with maximum telemetry and logging.
 * Useful for debugging and development in Electron environment.
 */
export declare const ElectronDevLayer: Layer.Layer<never, any, any>;
export default ElectronLiveLayer;
//# sourceMappingURL=Electron.d.ts.map