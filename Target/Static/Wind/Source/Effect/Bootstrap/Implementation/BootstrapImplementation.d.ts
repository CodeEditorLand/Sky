/**
 * @module Effect/Bootstrap/Implementation/BootstrapImplementation
 * @description
 * Main implementation of Bootstrap service with stage orchestration.
 * Provides production-ready implementation with telemetry support.
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */
import { Layer } from "effect";
import { BootstrapTag } from "../Tag/BootstrapTag.js";
/**
 * Live implementation layer for Bootstrap service.
 * Orchestrates all initialization stages for the VSCode workbench.
 */
export declare const BootstrapLive: Layer.Layer<BootstrapTag, never, never>;
export default BootstrapLive;
//# sourceMappingURL=BootstrapImplementation.d.ts.map