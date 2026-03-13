var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
var McpGalleryResourceType;
(function(McpGalleryResourceType2) {
  McpGalleryResourceType2["McpServersQueryService"] = "McpServersQueryService";
  McpGalleryResourceType2["McpServerWebUri"] = "McpServerWebUriTemplate";
  McpGalleryResourceType2["McpServerVersionUri"] = "McpServerVersionUriTemplate";
  McpGalleryResourceType2["McpServerIdUri"] = "McpServerIdUriTemplate";
  McpGalleryResourceType2["McpServerLatestVersionUri"] = "McpServerLatestVersionUriTemplate";
  McpGalleryResourceType2["McpServerNamedResourceUri"] = "McpServerNamedResourceUriTemplate";
  McpGalleryResourceType2["PublisherUriTemplate"] = "PublisherUriTemplate";
  McpGalleryResourceType2["ContactSupportUri"] = "ContactSupportUri";
  McpGalleryResourceType2["PrivacyPolicyUri"] = "PrivacyPolicyUri";
  McpGalleryResourceType2["TermsOfServiceUri"] = "TermsOfServiceUri";
  McpGalleryResourceType2["ReportUri"] = "ReportUri";
})(McpGalleryResourceType || (McpGalleryResourceType = {}));
var McpGalleryManifestStatus;
(function(McpGalleryManifestStatus2) {
  McpGalleryManifestStatus2["Available"] = "available";
  McpGalleryManifestStatus2["Unavailable"] = "unavailable";
})(McpGalleryManifestStatus || (McpGalleryManifestStatus = {}));
const IMcpGalleryManifestService = createDecorator("IMcpGalleryManifestService");
function getMcpGalleryManifestResourceUri(manifest, type) {
  const [name, version] = type.split("/");
  for (const resource of manifest.resources) {
    const [r, v] = resource.type.split("/");
    if (r !== name) {
      continue;
    }
    if (!version || v === version) {
      return resource.id;
    }
    break;
  }
  return void 0;
}
__name(getMcpGalleryManifestResourceUri, "getMcpGalleryManifestResourceUri");
export {
  IMcpGalleryManifestService,
  McpGalleryManifestStatus,
  McpGalleryResourceType,
  getMcpGalleryManifestResourceUri
};
//# sourceMappingURL=mcpGalleryManifest.js.map
