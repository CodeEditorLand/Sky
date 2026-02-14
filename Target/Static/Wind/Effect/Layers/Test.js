import { Layer } from "effect";
import { ConfigurationMock } from "../Configuration.js";
import { IPCMockLive } from "../IPC.js";
import { MountainMockLive } from "../Mountain.js";
import { SandboxMockLive } from "../Sandbox.js";
import { TelemetryLive, TelemetryMockLive } from "../Telemetry.js";
const TestLayer = Layer.empty.pipe(
  Layer.provide(SandboxMockLive),
  Layer.provide(IPCMockLive),
  Layer.provide(ConfigurationMock),
  Layer.provide(TelemetryMockLive),
  Layer.provide(MountainMockLive)
);
const TestWithTelemetryLayer = Layer.empty.pipe(
  Layer.provide(SandboxMockLive),
  Layer.provide(IPCMockLive),
  Layer.provide(ConfigurationMock),
  Layer.provide(TelemetryLive),
  Layer.provide(MountainMockLive)
);
var Test_default = TestLayer;
export {
  TestLayer,
  TestWithTelemetryLayer,
  Test_default as default
};
//# sourceMappingURL=Test.js.map
