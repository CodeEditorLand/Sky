import { Layer } from "effect";
import {
  ConfigurationLive,
  ConfigurationWithSyncLive
} from "../Configuration.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";
import { EnvironmentLive } from "../Environment.js";
import { HealthLive } from "../Health.js";
import { BootstrapLive } from "../Bootstrap.js";
import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { MountainSyncLive } from "../MountainSync.js";
import { ActivityBarLive } from "../ActivityBar.js";
import { PanelLive } from "../Panel.js";
import { SidebarLive } from "../Sidebar.js";
import { StatusBarLive } from "../StatusBar.js";
const TauriBaseLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive)
);
const TauriLiveLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive)
);
const TauriDevLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive)
);
var Tauri_default = TauriLiveLayer;
export {
  TauriBaseLayer,
  TauriDevLayer,
  TauriLiveLayer,
  Tauri_default as default
};
//# sourceMappingURL=Tauri.js.map
