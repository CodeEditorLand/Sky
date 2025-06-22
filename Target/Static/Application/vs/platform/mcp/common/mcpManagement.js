import { createDecorator } from "../../instantiation/common/instantiation.js";
var PackageType;
(function(PackageType2) {
  PackageType2["NODE"] = "npm";
  PackageType2["DOCKER"] = "docker";
  PackageType2["PYTHON"] = "pypi";
  PackageType2["REMOTE"] = "remote";
})(PackageType || (PackageType = {}));
const IMcpGalleryService = createDecorator("IMcpGalleryService");
const IMcpManagementService = createDecorator("IMcpManagementService");
const mcpGalleryServiceUrlConfig = "chat.mcp.gallery.serviceUrl";
export {
  IMcpGalleryService,
  IMcpManagementService,
  PackageType,
  mcpGalleryServiceUrlConfig
};
//# sourceMappingURL=mcpManagement.js.map
