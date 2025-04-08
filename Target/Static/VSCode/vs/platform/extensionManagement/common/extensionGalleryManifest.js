var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
var ExtensionGalleryResourceType = /* @__PURE__ */ ((ExtensionGalleryResourceType2) => {
  ExtensionGalleryResourceType2["ExtensionQueryService"] = "ExtensionQueryService";
  ExtensionGalleryResourceType2["ExtensionLatestVersionUri"] = "ExtensionLatestVersionUriTemplate";
  ExtensionGalleryResourceType2["ExtensionStatisticsUri"] = "ExtensionStatisticsUriTemplate";
  ExtensionGalleryResourceType2["WebExtensionStatisticsUri"] = "WebExtensionStatisticsUriTemplate";
  ExtensionGalleryResourceType2["PublisherViewUri"] = "PublisherViewUriTemplate";
  ExtensionGalleryResourceType2["ExtensionDetailsViewUri"] = "ExtensionDetailsViewUriTemplate";
  ExtensionGalleryResourceType2["ExtensionRatingViewUri"] = "ExtensionRatingViewUriTemplate";
  ExtensionGalleryResourceType2["ExtensionResourceUri"] = "ExtensionResourceUriTemplate";
  ExtensionGalleryResourceType2["ReportIssueUri"] = "ReportIssueUri";
  return ExtensionGalleryResourceType2;
})(ExtensionGalleryResourceType || {});
var Flag = /* @__PURE__ */ ((Flag2) => {
  Flag2["None"] = "None";
  Flag2["IncludeVersions"] = "IncludeVersions";
  Flag2["IncludeFiles"] = "IncludeFiles";
  Flag2["IncludeCategoryAndTags"] = "IncludeCategoryAndTags";
  Flag2["IncludeSharedAccounts"] = "IncludeSharedAccounts";
  Flag2["IncludeVersionProperties"] = "IncludeVersionProperties";
  Flag2["ExcludeNonValidated"] = "ExcludeNonValidated";
  Flag2["IncludeInstallationTargets"] = "IncludeInstallationTargets";
  Flag2["IncludeAssetUri"] = "IncludeAssetUri";
  Flag2["IncludeStatistics"] = "IncludeStatistics";
  Flag2["IncludeLatestVersionOnly"] = "IncludeLatestVersionOnly";
  Flag2["Unpublished"] = "Unpublished";
  Flag2["IncludeNameConflictInfo"] = "IncludeNameConflictInfo";
  Flag2["IncludeLatestPrereleaseAndStableVersionOnly"] = "IncludeLatestPrereleaseAndStableVersionOnly";
  return Flag2;
})(Flag || {});
const IExtensionGalleryManifestService = createDecorator("IExtensionGalleryManifestService");
function getExtensionGalleryManifestResourceUri(manifest, type, version) {
  for (const resource of manifest.resources) {
    const [r, v] = resource.type.split("/");
    if (r !== type) {
      continue;
    }
    if (!version || v === version) {
      return resource.id;
    }
    break;
  }
  return void 0;
}
__name(getExtensionGalleryManifestResourceUri, "getExtensionGalleryManifestResourceUri");
const ExtensionGalleryServiceUrlConfigKey = "extensions.gallery.serviceUrl";
export {
  ExtensionGalleryResourceType,
  ExtensionGalleryServiceUrlConfigKey,
  Flag,
  IExtensionGalleryManifestService,
  getExtensionGalleryManifestResourceUri
};
//# sourceMappingURL=extensionGalleryManifest.js.map
