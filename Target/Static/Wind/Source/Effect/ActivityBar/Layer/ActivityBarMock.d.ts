/**
 * @module Effect/ActivityBar/Layer/ActivityBarMock
 * @description
 * Mock implementation layer for ActivityBar service.
 * Used in testing and development scenarios.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */
import { Layer } from "effect";
import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
/**
 * Mock implementation layer for ActivityBar service.
 * Provides simple no-op implementation for testing.
 */
export declare const ActivityBarMockLive: Layer.Layer<ActivityBarTag, never, never>;
export default ActivityBarMockLive;
//# sourceMappingURL=ActivityBarMock.d.ts.map