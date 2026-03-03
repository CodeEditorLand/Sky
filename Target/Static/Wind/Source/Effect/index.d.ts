/**
 * @module Effect
 * @description
 * Atomic Effect-TS services for Wind.
 * This module exports all Effect services and composed layer stacks.
 * All services now use atomic file structure for better organization and maintainability.
 */
export { IPCTag as IPC, IPCTauriLive, IPCElectronLive, IPCMockLive } from "./IPC.js";
export type { IPCService } from "./IPC.js";
export { Sandbox, SandboxLive, SandboxMockLive } from "./Sandbox/index.js";
export type { SandboxService } from "./Sandbox/index.js";
export { Configuration, ConfigurationLive, ConfigurationWithSyncLive, } from "./Configuration.js";
export type { ConfigurationService } from "./Configuration.js";
export { Telemetry, TelemetryLive, TelemetryMockLive, withSpan, withMetric, } from "./Telemetry/index.js";
export type { TelemetryService } from "./Telemetry/index.js";
export { Mountain, MountainLive, MountainMockLive } from "./Mountain/index.js";
export type { MountainService, MountainConnectionState, SyncResource, } from "./Mountain/index.js";
export { MountainSyncTag, MountainSyncLive, MountainSyncMock } from "./MountainSync/index.js";
export type { MountainSyncService, SyncConfig, SyncStats, MountainSyncResult, SyncStatus } from "./MountainSync/index.js";
export { EnvironmentTag } from "./Environment/index.js";
export { EnvironmentLive } from "./Environment/index.js";
export { EnvironmentMock } from "./Environment/index.js";
export type { EnvironmentService, EnvironmentInfo, Platform, Architecture } from "./Environment/index.js";
export { HealthTag, HealthLive, HealthMock } from "./Health/index.js";
export type { HealthService, ServiceHealth, SystemHealth, HealthStatus } from "./Health/index.js";
export { BootstrapTag, BootstrapLive, BootstrapMock, runBootstrap } from "./Bootstrap/index.js";
export type { BootstrapService, BootstrapOptions, StageResult, BootstrapResult } from "./Bootstrap/index.js";
export { ClipboardServiceTag, LiveClipboardServiceLayer, MockClipboardServiceLayer } from "./Clipboard.js";
export type { ClipboardService, ClipboardProblem } from "./Clipboard.js";
export { ActivityBar, ActivityBarLive, ActivityBarMockLive } from "./ActivityBar/index.js";
export type { ActivityBarService, ActivityBarItem, CreateActivityBarItem, ActivityBarBadge } from "./ActivityBar/index.js";
export { Panel, PanelLive, PanelMockLive } from "./Panel/index.js";
export type { PanelService, PanelView, CreatePanelView, PanelViewType } from "./Panel/index.js";
export { Sidebar, SidebarLive, SidebarMockLive } from "./Sidebar/index.js";
export type { SidebarService, SidebarPanel, CreateSidebarPanel } from "./Sidebar/index.js";
export { StatusBar, StatusBarLive, StatusBarMockLive } from "./StatusBar/index.js";
export type { StatusBarService, StatusBarItem, CreateStatusBarItem } from "./StatusBar/index.js";
export { WorkbenchIntegrationTag as Workbench, WorkbenchIntegrationLiveLayer as WorkbenchLive } from "../Workbench/index.js";
export type { WorkbenchIntegrationService, WorkbenchState, WorkbenchInitState, WorkbenchIntegrationConfig, ProviderRegistrationResult, WorkspaceContext, WorkbenchDiagnostics } from "../Workbench/index.js";
export { WorkbenchIntegrationErrorCode } from "../Workbench/index.js";
export { TauriBaseLayer, TauriLiveLayer, TauriDevLayer } from "./Layers/Tauri.js";
export { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "./IPC.js";
export { ConfigFetchError, ConfigValidationError, ConfigApplyError, } from "./Configuration.js";
export { TelemetryCollectionError } from "./Telemetry/index.js";
export { MountainConnectionError, MountainRPCError, MountainSyncError, MountainStateError, } from "./Mountain/index.js";
export { ActivityBarItemNotFoundError, ActivityBarUpdateError } from "./ActivityBar/index.js";
export { PanelViewNotFoundError, PanelUpdateError } from "./Panel/index.js";
export { SidebarPanelNotFoundError, SidebarUpdateError } from "./Sidebar/index.js";
export { StatusBarItemNotFoundError, StatusBarUpdateError } from "./StatusBar/index.js";
export { FileSystemProviderTag, FileSystemProviderLive } from "../FileSystem/index.js";
export type { FileSystemProviderService } from "../FileSystem/index.js";
//# sourceMappingURL=index.d.ts.map