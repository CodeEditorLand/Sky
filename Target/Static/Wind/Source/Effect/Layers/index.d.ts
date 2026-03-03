/**
 * @module Effect/Layers
 * @description
 * Layer stack compositions for different runtime environments.
 */
export { TauriBaseLayer, TauriLiveLayer, TauriDevLayer, default as Tauri, } from "./Tauri.js";
export { ElectronBaseLayer, ElectronLiveLayer, ElectronDevLayer, default as Electron, } from "./Electron.js";
export { TestLayer, TestWithTelemetryLayer, default as Test } from "./Test.js";
//# sourceMappingURL=index.d.ts.map