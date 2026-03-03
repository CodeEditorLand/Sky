/**
 * @module Effect/Configuration/Layer/ConfigurationMock
 * @description
 * Mock implementation layer for Configuration service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */
import { Layer } from "effect";
import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import type { ConfigurationService } from "../Interface/ConfigurationService.js";
import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
/**
 * Creates a mock configuration service for testing.
 */
export declare const makeMockConfiguration: (overrides?: Partial<ISandboxConfiguration>) => ConfigurationService;
/**
 * Mock implementation layer for Configuration service.
 * Provides simple no-op implementation for testing.
 */
export declare const ConfigurationMock: Layer.Layer<ConfigurationTag, never, never>;
export default ConfigurationMock;
//# sourceMappingURL=ConfigurationMock.d.ts.map