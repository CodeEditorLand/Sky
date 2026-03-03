/**
 * @module Effect/Bootstrap/Layer/BootstrapMock
 * @description
 * Mock implementation layer for Bootstrap service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */
import { Layer } from "effect";
import { BootstrapTag } from "../Tag/BootstrapTag.js";
import type { BootstrapService } from "../Interface/BootstrapService.js";
/**
 * Creates a mock bootstrap service for testing.
 */
export declare const makeMockBootstrap: () => BootstrapService;
/**
 * Mock implementation layer for Bootstrap service.
 * Provides simple no-op implementation for testing.
 */
export declare const BootstrapMock: Layer.Layer<BootstrapTag, never, never>;
export default BootstrapMock;
//# sourceMappingURL=BootstrapMock.d.ts.map