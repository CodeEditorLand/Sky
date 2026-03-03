/**
 * @module Effect/Health/Implementation/HealthImplementation
 * @description
 * Main implementation of the Health monitoring service.
 * @category Implementation
 */
import { Layer } from "effect";
import { HealthTag } from "../Tag/HealthTag.js";
import type { HealthService, HealthStatus } from "../Type/HealthType.js";
export declare const makeHealthChecker: () => HealthService;
export declare const HealthLive: Layer.Layer<HealthTag, never, never>;
export declare const makeMockHealth: (Overrides?: Partial<Record<string, HealthStatus>>) => HealthService;
export declare const HealthMock: Layer.Layer<HealthTag, never, never>;
//# sourceMappingURL=HealthImplementation.d.ts.map