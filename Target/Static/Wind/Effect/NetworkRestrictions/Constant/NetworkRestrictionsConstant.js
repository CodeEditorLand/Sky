const DEFAULT_NETWORK_RESTRICTIONS = {
  blockHTTP: true,
  blockHTTPS: true,
  blockWebSocket: true,
  blockMarketplace: true,
  blockExtensionUpdates: true,
  blockTelemetry: true,
  blockExtensionTelemetry: true,
  allowInternal: true,
  allowLocalhost: true,
  allowMountain: true,
  logBlocked: true,
  allowedDomains: [],
  blockedDomains: [
    // Microsoft telemetry endpoints
    "*.microsoft.com",
    "*.azureedge.net",
    "*.vscode.azure.net",
    "*.vscode-remote.azureedge.net",
    "*.vscode-remote.azureedge-extentions.azureedge.net",
    "*.vscode-extensions.azureedge.net",
    // Microsoft marketplace
    "*.marketplace.visualstudio.com",
    "*.marketplace.extensions.visualstudio.com",
    // Extension telemetry
    "*.gallery.vsassets.io",
    // Update servers
    "*.update.code.visualstudio.com",
    "*.vscode-update.azurewebsites.net"
  ]
};
const TelemetryEndpoint = [
  "vortex.data.microsoft.com",
  "vortex.data.microsoft.com/collect/v1",
  "*.telemetry.vscode.azure.net",
  "*.vscode-extensions.azureedge.net",
  "*.vscode-telemetry.microsoft.com"
];
const MarketplaceEndpoint = [
  "*.marketplace.visualstudio.com",
  "*.marketplace.extensions.visualstudio.com",
  "*.gallery.vsassets.io"
];
const UpdateEndpoint = [
  "*.update.code.visualstudio.com",
  "*.vscode-update.azurewebsites.net"
];
const AiEndpoint = [
  "*.api.githubcopilot.com",
  "*.copilot.githubusercontent.com"
];
const ALLOWED_IPC_CHANNELS = [
  "vscode:",
  "vscode:workspace",
  "vscode:file",
  "vscode:editor",
  "vscode:terminal",
  "vscode:debug",
  "vscode:sandbox",
  "vscode:mountain",
  "vscode:ipc"
];
const BLOCKED_IPC_CHANNELS = [
  "vscode:telemetryAppender",
  "vscode:telemetryLog",
  "vscode:customEndpointTelemetry",
  "vscode:extensions.*"
];
const constants = {
  DEFAULT_NETWORK_RESTRICTIONS,
  TelemetryEndpoint,
  MarketplaceEndpoint,
  UpdateEndpoint,
  AiEndpoint,
  ALLOWED_IPC_CHANNELS,
  BLOCKED_IPC_CHANNELS
};
var NetworkRestrictionsConstant_default = constants;
export {
  ALLOWED_IPC_CHANNELS,
  AiEndpoint,
  BLOCKED_IPC_CHANNELS,
  DEFAULT_NETWORK_RESTRICTIONS,
  MarketplaceEndpoint,
  TelemetryEndpoint,
  UpdateEndpoint,
  NetworkRestrictionsConstant_default as default
};
//# sourceMappingURL=NetworkRestrictionsConstant.js.map
