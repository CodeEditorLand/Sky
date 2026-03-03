/**
 * @module Effect/Configuration/Implementation/ConfigurationImplementation
 * @description
 * Main implementation of Configuration service with reactive state management.
 * Provides production-ready implementation with telemetry and sync support.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */
import { Layer } from "effect";
import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { MountainTag } from "../../Mountain.js";
/**
 * Live implementation layer for Configuration service.
 * Provides reactive configuration management with fetch and sync capabilities.
 */
export declare const ConfigurationLive: Layer.Layer<ConfigurationTag, ConfigFetchError, import("../../Sandbox.js").SandboxService | import("../../IPC.js").IPCTag>;
/**
 * Live implementation layer for Configuration service with Mountain sync.
 * Includes periodic sync with the Mountain backend.
 */
export declare const ConfigurationWithSyncLive: Layer.Layer<ConfigurationTag, ConfigFetchError, import("../../Sandbox.js").SandboxService | import("../../IPC.js").IPCTag | MountainTag>;
export default ConfigurationLive;
//# sourceMappingURL=ConfigurationImplementation.d.ts.map