/**
 * @module Effect/Mountain/Layer/MountainMock
 * @description
 * Mock implementation layer for Mountain service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */
import { Layer } from "effect";
import { MountainTag } from "../Tag/MountainTag.js";
/**
 * Mock implementation layer for Mountain service.
 * Provides simple no-op implementation for testing.
 */
export declare const MountainMockLive: Layer.Layer<MountainTag, never, never>;
export default MountainMockLive;
//# sourceMappingURL=MountainMock.d.ts.map