var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IPager } from "../../../base/common/paging.js";
import { Platform } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { localize2 } from "../../../nls.js";
import { ExtensionType, IExtension, IExtensionManifest, TargetPlatform } from "../../extensions/common/extensions.js";
import { FileOperationError, FileOperationResult, IFileService, IFileStat } from "../../files/common/files.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";
const EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
const WEB_EXTENSION_TAG = "__web_extension";
const EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = "skipWalkthrough";
const EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT = "skipPublisherTrust";
const EXTENSION_INSTALL_SOURCE_CONTEXT = "extensionInstallSource";
const EXTENSION_INSTALL_DEP_PACK_CONTEXT = "dependecyOrPackExtensionInstall";
const EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = "clientTargetPlatform";
var ExtensionInstallSource = /* @__PURE__ */ ((ExtensionInstallSource2) => {
  ExtensionInstallSource2["COMMAND"] = "command";
  ExtensionInstallSource2["SETTINGS_SYNC"] = "settingsSync";
  return ExtensionInstallSource2;
})(ExtensionInstallSource || {});
function TargetPlatformToString(targetPlatform) {
  switch (targetPlatform) {
    case TargetPlatform.WIN32_X64:
      return "Windows 64 bit";
    case TargetPlatform.WIN32_ARM64:
      return "Windows ARM";
    case TargetPlatform.LINUX_X64:
      return "Linux 64 bit";
    case TargetPlatform.LINUX_ARM64:
      return "Linux ARM 64";
    case TargetPlatform.LINUX_ARMHF:
      return "Linux ARM";
    case TargetPlatform.ALPINE_X64:
      return "Alpine Linux 64 bit";
    case TargetPlatform.ALPINE_ARM64:
      return "Alpine ARM 64";
    case TargetPlatform.DARWIN_X64:
      return "Mac";
    case TargetPlatform.DARWIN_ARM64:
      return "Mac Silicon";
    case TargetPlatform.WEB:
      return "Web";
    case TargetPlatform.UNIVERSAL:
      return TargetPlatform.UNIVERSAL;
    case TargetPlatform.UNKNOWN:
      return TargetPlatform.UNKNOWN;
    case TargetPlatform.UNDEFINED:
      return TargetPlatform.UNDEFINED;
  }
}
__name(TargetPlatformToString, "TargetPlatformToString");
function toTargetPlatform(targetPlatform) {
  switch (targetPlatform) {
    case TargetPlatform.WIN32_X64:
      return TargetPlatform.WIN32_X64;
    case TargetPlatform.WIN32_ARM64:
      return TargetPlatform.WIN32_ARM64;
    case TargetPlatform.LINUX_X64:
      return TargetPlatform.LINUX_X64;
    case TargetPlatform.LINUX_ARM64:
      return TargetPlatform.LINUX_ARM64;
    case TargetPlatform.LINUX_ARMHF:
      return TargetPlatform.LINUX_ARMHF;
    case TargetPlatform.ALPINE_X64:
      return TargetPlatform.ALPINE_X64;
    case TargetPlatform.ALPINE_ARM64:
      return TargetPlatform.ALPINE_ARM64;
    case TargetPlatform.DARWIN_X64:
      return TargetPlatform.DARWIN_X64;
    case TargetPlatform.DARWIN_ARM64:
      return TargetPlatform.DARWIN_ARM64;
    case TargetPlatform.WEB:
      return TargetPlatform.WEB;
    case TargetPlatform.UNIVERSAL:
      return TargetPlatform.UNIVERSAL;
    default:
      return TargetPlatform.UNKNOWN;
  }
}
__name(toTargetPlatform, "toTargetPlatform");
function getTargetPlatform(platform, arch) {
  switch (platform) {
    case Platform.Windows:
      if (arch === "x64") {
        return TargetPlatform.WIN32_X64;
      }
      if (arch === "arm64") {
        return TargetPlatform.WIN32_ARM64;
      }
      return TargetPlatform.UNKNOWN;
    case Platform.Linux:
      if (arch === "x64") {
        return TargetPlatform.LINUX_X64;
      }
      if (arch === "arm64") {
        return TargetPlatform.LINUX_ARM64;
      }
      if (arch === "arm") {
        return TargetPlatform.LINUX_ARMHF;
      }
      return TargetPlatform.UNKNOWN;
    case "alpine":
      if (arch === "x64") {
        return TargetPlatform.ALPINE_X64;
      }
      if (arch === "arm64") {
        return TargetPlatform.ALPINE_ARM64;
      }
      return TargetPlatform.UNKNOWN;
    case Platform.Mac:
      if (arch === "x64") {
        return TargetPlatform.DARWIN_X64;
      }
      if (arch === "arm64") {
        return TargetPlatform.DARWIN_ARM64;
      }
      return TargetPlatform.UNKNOWN;
    case Platform.Web:
      return TargetPlatform.WEB;
  }
}
__name(getTargetPlatform, "getTargetPlatform");
function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
  return productTargetPlatform === TargetPlatform.WEB && !allTargetPlatforms.includes(TargetPlatform.WEB);
}
__name(isNotWebExtensionInWebTargetPlatform, "isNotWebExtensionInWebTargetPlatform");
function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
  if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
    return false;
  }
  if (extensionTargetPlatform === TargetPlatform.UNDEFINED) {
    return true;
  }
  if (extensionTargetPlatform === TargetPlatform.UNIVERSAL) {
    return true;
  }
  if (extensionTargetPlatform === TargetPlatform.UNKNOWN) {
    return false;
  }
  if (extensionTargetPlatform === productTargetPlatform) {
    return true;
  }
  return false;
}
__name(isTargetPlatformCompatible, "isTargetPlatformCompatible");
function isIExtensionIdentifier(thing) {
  return thing && typeof thing === "object" && typeof thing.id === "string" && (!thing.uuid || typeof thing.uuid === "string");
}
__name(isIExtensionIdentifier, "isIExtensionIdentifier");
var SortBy = /* @__PURE__ */ ((SortBy2) => {
  SortBy2["NoneOrRelevance"] = "NoneOrRelevance";
  SortBy2["LastUpdatedDate"] = "LastUpdatedDate";
  SortBy2["Title"] = "Title";
  SortBy2["PublisherName"] = "PublisherName";
  SortBy2["InstallCount"] = "InstallCount";
  SortBy2["PublishedDate"] = "PublishedDate";
  SortBy2["AverageRating"] = "AverageRating";
  SortBy2["WeightedRating"] = "WeightedRating";
  return SortBy2;
})(SortBy || {});
var SortOrder = /* @__PURE__ */ ((SortOrder2) => {
  SortOrder2[SortOrder2["Default"] = 0] = "Default";
  SortOrder2[SortOrder2["Ascending"] = 1] = "Ascending";
  SortOrder2[SortOrder2["Descending"] = 2] = "Descending";
  return SortOrder2;
})(SortOrder || {});
var FilterType = /* @__PURE__ */ ((FilterType2) => {
  FilterType2["Category"] = "Category";
  FilterType2["ExtensionId"] = "ExtensionId";
  FilterType2["ExtensionName"] = "ExtensionName";
  FilterType2["ExcludeWithFlags"] = "ExcludeWithFlags";
  FilterType2["Featured"] = "Featured";
  FilterType2["SearchText"] = "SearchText";
  FilterType2["Tag"] = "Tag";
  FilterType2["Target"] = "Target";
  return FilterType2;
})(FilterType || {});
var StatisticType = /* @__PURE__ */ ((StatisticType2) => {
  StatisticType2["Install"] = "install";
  StatisticType2["Uninstall"] = "uninstall";
  return StatisticType2;
})(StatisticType || {});
var InstallOperation = /* @__PURE__ */ ((InstallOperation2) => {
  InstallOperation2[InstallOperation2["None"] = 1] = "None";
  InstallOperation2[InstallOperation2["Install"] = 2] = "Install";
  InstallOperation2[InstallOperation2["Update"] = 3] = "Update";
  InstallOperation2[InstallOperation2["Migrate"] = 4] = "Migrate";
  return InstallOperation2;
})(InstallOperation || {});
const IExtensionGalleryService = createDecorator("extensionGalleryService");
var ExtensionGalleryErrorCode = /* @__PURE__ */ ((ExtensionGalleryErrorCode2) => {
  ExtensionGalleryErrorCode2["Timeout"] = "Timeout";
  ExtensionGalleryErrorCode2["Cancelled"] = "Cancelled";
  ExtensionGalleryErrorCode2["Failed"] = "Failed";
  ExtensionGalleryErrorCode2["DownloadFailedWriting"] = "DownloadFailedWriting";
  ExtensionGalleryErrorCode2["Offline"] = "Offline";
  return ExtensionGalleryErrorCode2;
})(ExtensionGalleryErrorCode || {});
class ExtensionGalleryError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
  }
  static {
    __name(this, "ExtensionGalleryError");
  }
}
var ExtensionManagementErrorCode = /* @__PURE__ */ ((ExtensionManagementErrorCode2) => {
  ExtensionManagementErrorCode2["NotFound"] = "NotFound";
  ExtensionManagementErrorCode2["Unsupported"] = "Unsupported";
  ExtensionManagementErrorCode2["Deprecated"] = "Deprecated";
  ExtensionManagementErrorCode2["Malicious"] = "Malicious";
  ExtensionManagementErrorCode2["Incompatible"] = "Incompatible";
  ExtensionManagementErrorCode2["IncompatibleApi"] = "IncompatibleApi";
  ExtensionManagementErrorCode2["IncompatibleTargetPlatform"] = "IncompatibleTargetPlatform";
  ExtensionManagementErrorCode2["ReleaseVersionNotFound"] = "ReleaseVersionNotFound";
  ExtensionManagementErrorCode2["Invalid"] = "Invalid";
  ExtensionManagementErrorCode2["Download"] = "Download";
  ExtensionManagementErrorCode2["DownloadSignature"] = "DownloadSignature";
  ExtensionManagementErrorCode2["DownloadFailedWriting"] = "DownloadFailedWriting" /* DownloadFailedWriting */;
  ExtensionManagementErrorCode2["UpdateMetadata"] = "UpdateMetadata";
  ExtensionManagementErrorCode2["Extract"] = "Extract";
  ExtensionManagementErrorCode2["Scanning"] = "Scanning";
  ExtensionManagementErrorCode2["ScanningExtension"] = "ScanningExtension";
  ExtensionManagementErrorCode2["ReadRemoved"] = "ReadRemoved";
  ExtensionManagementErrorCode2["UnsetRemoved"] = "UnsetRemoved";
  ExtensionManagementErrorCode2["Delete"] = "Delete";
  ExtensionManagementErrorCode2["Rename"] = "Rename";
  ExtensionManagementErrorCode2["IntializeDefaultProfile"] = "IntializeDefaultProfile";
  ExtensionManagementErrorCode2["AddToProfile"] = "AddToProfile";
  ExtensionManagementErrorCode2["InstalledExtensionNotFound"] = "InstalledExtensionNotFound";
  ExtensionManagementErrorCode2["PostInstall"] = "PostInstall";
  ExtensionManagementErrorCode2["CorruptZip"] = "CorruptZip";
  ExtensionManagementErrorCode2["IncompleteZip"] = "IncompleteZip";
  ExtensionManagementErrorCode2["PackageNotSigned"] = "PackageNotSigned";
  ExtensionManagementErrorCode2["SignatureVerificationInternal"] = "SignatureVerificationInternal";
  ExtensionManagementErrorCode2["SignatureVerificationFailed"] = "SignatureVerificationFailed";
  ExtensionManagementErrorCode2["NotAllowed"] = "NotAllowed";
  ExtensionManagementErrorCode2["Gallery"] = "Gallery";
  ExtensionManagementErrorCode2["Cancelled"] = "Cancelled";
  ExtensionManagementErrorCode2["Unknown"] = "Unknown";
  ExtensionManagementErrorCode2["Internal"] = "Internal";
  return ExtensionManagementErrorCode2;
})(ExtensionManagementErrorCode || {});
var ExtensionSignatureVerificationCode = /* @__PURE__ */ ((ExtensionSignatureVerificationCode2) => {
  ExtensionSignatureVerificationCode2["NotSigned"] = "NotSigned";
  ExtensionSignatureVerificationCode2["Success"] = "Success";
  ExtensionSignatureVerificationCode2["RequiredArgumentMissing"] = "RequiredArgumentMissing";
  ExtensionSignatureVerificationCode2["InvalidArgument"] = "InvalidArgument";
  ExtensionSignatureVerificationCode2["PackageIsUnreadable"] = "PackageIsUnreadable";
  ExtensionSignatureVerificationCode2["UnhandledException"] = "UnhandledException";
  ExtensionSignatureVerificationCode2["SignatureManifestIsMissing"] = "SignatureManifestIsMissing";
  ExtensionSignatureVerificationCode2["SignatureManifestIsUnreadable"] = "SignatureManifestIsUnreadable";
  ExtensionSignatureVerificationCode2["SignatureIsMissing"] = "SignatureIsMissing";
  ExtensionSignatureVerificationCode2["SignatureIsUnreadable"] = "SignatureIsUnreadable";
  ExtensionSignatureVerificationCode2["CertificateIsUnreadable"] = "CertificateIsUnreadable";
  ExtensionSignatureVerificationCode2["SignatureArchiveIsUnreadable"] = "SignatureArchiveIsUnreadable";
  ExtensionSignatureVerificationCode2["FileAlreadyExists"] = "FileAlreadyExists";
  ExtensionSignatureVerificationCode2["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
  ExtensionSignatureVerificationCode2["SignatureArchiveHasSameSignatureFile"] = "SignatureArchiveHasSameSignatureFile";
  ExtensionSignatureVerificationCode2["PackageIntegrityCheckFailed"] = "PackageIntegrityCheckFailed";
  ExtensionSignatureVerificationCode2["SignatureIsInvalid"] = "SignatureIsInvalid";
  ExtensionSignatureVerificationCode2["SignatureManifestIsInvalid"] = "SignatureManifestIsInvalid";
  ExtensionSignatureVerificationCode2["SignatureIntegrityCheckFailed"] = "SignatureIntegrityCheckFailed";
  ExtensionSignatureVerificationCode2["EntryIsMissing"] = "EntryIsMissing";
  ExtensionSignatureVerificationCode2["EntryIsTampered"] = "EntryIsTampered";
  ExtensionSignatureVerificationCode2["Untrusted"] = "Untrusted";
  ExtensionSignatureVerificationCode2["CertificateRevoked"] = "CertificateRevoked";
  ExtensionSignatureVerificationCode2["SignatureIsNotValid"] = "SignatureIsNotValid";
  ExtensionSignatureVerificationCode2["UnknownError"] = "UnknownError";
  ExtensionSignatureVerificationCode2["PackageIsInvalidZip"] = "PackageIsInvalidZip";
  ExtensionSignatureVerificationCode2["SignatureArchiveHasTooManyEntries"] = "SignatureArchiveHasTooManyEntries";
  return ExtensionSignatureVerificationCode2;
})(ExtensionSignatureVerificationCode || {});
class ExtensionManagementError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
  }
  static {
    __name(this, "ExtensionManagementError");
  }
}
const IExtensionManagementService = createDecorator("extensionManagementService");
const DISABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/disabled";
const ENABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/enabled";
const IGlobalExtensionEnablementService = createDecorator("IGlobalExtensionEnablementService");
const IExtensionTipsService = createDecorator("IExtensionTipsService");
const IAllowedExtensionsService = createDecorator("IAllowedExtensionsService");
async function computeSize(location, fileService) {
  let stat;
  try {
    stat = await fileService.resolve(location);
  } catch (e) {
    if (e.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
      return 0;
    }
    throw e;
  }
  if (stat.children) {
    const sizes = await Promise.all(stat.children.map((c) => computeSize(c.resource, fileService)));
    return sizes.reduce((r, s) => r + s, 0);
  }
  return stat.size ?? 0;
}
__name(computeSize, "computeSize");
const ExtensionsLocalizedLabel = localize2("extensions", "Extensions");
const PreferencesLocalizedLabel = localize2("preferences", "Preferences");
const UseUnpkgResourceApiConfigKey = "extensions.gallery.useUnpkgResourceApi";
const AllowedExtensionsConfigKey = "extensions.allowed";
export {
  AllowedExtensionsConfigKey,
  DISABLED_EXTENSIONS_STORAGE_PATH,
  ENABLED_EXTENSIONS_STORAGE_PATH,
  EXTENSION_IDENTIFIER_PATTERN,
  EXTENSION_IDENTIFIER_REGEX,
  EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT,
  EXTENSION_INSTALL_DEP_PACK_CONTEXT,
  EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT,
  EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT,
  EXTENSION_INSTALL_SOURCE_CONTEXT,
  ExtensionGalleryError,
  ExtensionGalleryErrorCode,
  ExtensionInstallSource,
  ExtensionManagementError,
  ExtensionManagementErrorCode,
  ExtensionSignatureVerificationCode,
  ExtensionsLocalizedLabel,
  FilterType,
  IAllowedExtensionsService,
  IExtensionGalleryService,
  IExtensionManagementService,
  IExtensionTipsService,
  IGlobalExtensionEnablementService,
  InstallOperation,
  PreferencesLocalizedLabel,
  SortBy,
  SortOrder,
  StatisticType,
  TargetPlatformToString,
  UseUnpkgResourceApiConfigKey,
  WEB_EXTENSION_TAG,
  computeSize,
  getTargetPlatform,
  isIExtensionIdentifier,
  isNotWebExtensionInWebTargetPlatform,
  isTargetPlatformCompatible,
  toTargetPlatform
};
//# sourceMappingURL=extensionManagement.js.map
