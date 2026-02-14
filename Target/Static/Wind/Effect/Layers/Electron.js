import { Layer } from "effect";
import {
  ConfigurationLive,
  ConfigurationWithSyncLive
} from "../Configuration.js";
import { IPCElectronLive } from "../IPC.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";
const ElectronBaseLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(IPCElectronLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationLive),
  Layer.provide(MountainLive)
);
const ElectronLiveLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(IPCElectronLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive)
);
const ElectronDevLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(IPCElectronLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive)
);
var Electron_default = ElectronLiveLayer;
export {
  ElectronBaseLayer,
  ElectronDevLayer,
  ElectronLiveLayer,
  Electron_default as default
};
//# sourceMappingURL=Electron.js.map
