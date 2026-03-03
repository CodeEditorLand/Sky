/**
 * @module Effect/Layers/Test
 * @description
 * Test layer stack with all mocks.
 * Useful for unit testing without real backend dependencies.
 */
import { Layer } from "effect";
/**
 * Complete test layer with all services mocked.
 * No real backend connections, all effects succeed with dummy data.
 */
export declare const TestLayer: Layer.Layer<never, never, never>;
/**
 * Test layer with real telemetry but mocked services.
 * Useful for testing performance monitoring.
 */
export declare const TestWithTelemetryLayer: Layer.Layer<never, never, never>;
export default TestLayer;
//# sourceMappingURL=Test.d.ts.map