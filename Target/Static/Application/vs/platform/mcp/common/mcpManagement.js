import { createDecorator } from "../../instantiation/common/instantiation.js";
var RegistryType;
(function(RegistryType2) {
  RegistryType2["NODE"] = "npm";
  RegistryType2["PYTHON"] = "pypi";
  RegistryType2["DOCKER"] = "oci";
  RegistryType2["NUGET"] = "nuget";
  RegistryType2["MCPB"] = "mcpb";
  RegistryType2["REMOTE"] = "remote";
})(RegistryType || (RegistryType = {}));
var TransportType;
(function(TransportType2) {
  TransportType2["STDIO"] = "stdio";
  TransportType2["STREAMABLE_HTTP"] = "streamable-http";
  TransportType2["SSE"] = "sse";
})(TransportType || (TransportType = {}));
var GalleryMcpServerStatus;
(function(GalleryMcpServerStatus2) {
  GalleryMcpServerStatus2["Active"] = "active";
  GalleryMcpServerStatus2["Deprecated"] = "deprecated";
})(GalleryMcpServerStatus || (GalleryMcpServerStatus = {}));
const IMcpGalleryService = createDecorator("IMcpGalleryService");
const IMcpManagementService = createDecorator("IMcpManagementService");
const IAllowedMcpServersService = createDecorator("IAllowedMcpServersService");
const mcpAccessConfig = "chat.mcp.access";
const mcpGalleryServiceUrlConfig = "chat.mcp.gallery.serviceUrl";
const mcpGalleryServiceEnablementConfig = "chat.mcp.gallery.enabled";
const mcpAutoStartConfig = "chat.mcp.autostart";
const mcpAppsEnabledConfig = "chat.mcp.apps.enabled";
var McpAutoStartValue;
(function(McpAutoStartValue2) {
  McpAutoStartValue2["Never"] = "never";
  McpAutoStartValue2["OnlyNew"] = "onlyNew";
  McpAutoStartValue2["NewAndOutdated"] = "newAndOutdated";
})(McpAutoStartValue || (McpAutoStartValue = {}));
var McpAccessValue;
(function(McpAccessValue2) {
  McpAccessValue2["None"] = "none";
  McpAccessValue2["Registry"] = "registry";
  McpAccessValue2["All"] = "all";
})(McpAccessValue || (McpAccessValue = {}));
export {
  GalleryMcpServerStatus,
  IAllowedMcpServersService,
  IMcpGalleryService,
  IMcpManagementService,
  McpAccessValue,
  McpAutoStartValue,
  RegistryType,
  TransportType,
  mcpAccessConfig,
  mcpAppsEnabledConfig,
  mcpAutoStartConfig,
  mcpGalleryServiceEnablementConfig,
  mcpGalleryServiceUrlConfig
};
//# sourceMappingURL=mcpManagement.js.map
