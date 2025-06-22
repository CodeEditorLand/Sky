var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../nls.js";
import { Extensions } from "../../configuration/common/configurationRegistry.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Registry } from "../../registry/common/platform.js";
const EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";
const EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
const WEB_EXTENSION_TAG = "__web_extension";
const EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = "skipWalkthrough";
const EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT = "skipPublisherTrust";
const EXTENSION_INSTALL_SOURCE_CONTEXT = "extensionInstallSource";
const EXTENSION_INSTALL_DEP_PACK_CONTEXT = "dependecyOrPackExtensionInstall";
const EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = "clientTargetPlatform";
var ExtensionInstallSource;
(function(ExtensionInstallSource2) {
  ExtensionInstallSource2["COMMAND"] = "command";
  ExtensionInstallSource2["SETTINGS_SYNC"] = "settingsSync";
})(ExtensionInstallSource || (ExtensionInstallSource = {}));
function TargetPlatformToString(targetPlatform) {
  switch (targetPlatform) {
    case "win32-x64":
      return "Windows 64 bit";
    case "win32-arm64":
      return "Windows ARM";
    case "linux-x64":
      return "Linux 64 bit";
    case "linux-arm64":
      return "Linux ARM 64";
    case "linux-armhf":
      return "Linux ARM";
    case "alpine-x64":
      return "Alpine Linux 64 bit";
    case "alpine-arm64":
      return "Alpine ARM 64";
    case "darwin-x64":
      return "Mac";
    case "darwin-arm64":
      return "Mac Silicon";
    case "web":
      return "Web";
    case "universal":
      return "universal";
    case "unknown":
      return "unknown";
    case "undefined":
      return "undefined";
  }
}
__name(TargetPlatformToString, "TargetPlatformToString");
function toTargetPlatform(targetPlatform) {
  switch (targetPlatform) {
    case "win32-x64":
      return "win32-x64";
    case "win32-arm64":
      return "win32-arm64";
    case "linux-x64":
      return "linux-x64";
    case "linux-arm64":
      return "linux-arm64";
    case "linux-armhf":
      return "linux-armhf";
    case "alpine-x64":
      return "alpine-x64";
    case "alpine-arm64":
      return "alpine-arm64";
    case "darwin-x64":
      return "darwin-x64";
    case "darwin-arm64":
      return "darwin-arm64";
    case "web":
      return "web";
    case "universal":
      return "universal";
    default:
      return "unknown";
  }
}
__name(toTargetPlatform, "toTargetPlatform");
function getTargetPlatform(platform, arch) {
  switch (platform) {
    case 3:
      if (arch === "x64") {
        return "win32-x64";
      }
      if (arch === "arm64") {
        return "win32-arm64";
      }
      return "unknown";
    case 2:
      if (arch === "x64") {
        return "linux-x64";
      }
      if (arch === "arm64") {
        return "linux-arm64";
      }
      if (arch === "arm") {
        return "linux-armhf";
      }
      return "unknown";
    case "alpine":
      if (arch === "x64") {
        return "alpine-x64";
      }
      if (arch === "arm64") {
        return "alpine-arm64";
      }
      return "unknown";
    case 1:
      if (arch === "x64") {
        return "darwin-x64";
      }
      if (arch === "arm64") {
        return "darwin-arm64";
      }
      return "unknown";
    case 0:
      return "web";
  }
}
__name(getTargetPlatform, "getTargetPlatform");
function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
  return productTargetPlatform === "web" && !allTargetPlatforms.includes(
    "web"
    /* TargetPlatform.WEB */
  );
}
__name(isNotWebExtensionInWebTargetPlatform, "isNotWebExtensionInWebTargetPlatform");
function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
  if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
    return false;
  }
  if (extensionTargetPlatform === "undefined") {
    return true;
  }
  if (extensionTargetPlatform === "universal") {
    return true;
  }
  if (extensionTargetPlatform === "unknown") {
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
var SortBy;
(function(SortBy2) {
  SortBy2["NoneOrRelevance"] = "NoneOrRelevance";
  SortBy2["LastUpdatedDate"] = "LastUpdatedDate";
  SortBy2["Title"] = "Title";
  SortBy2["PublisherName"] = "PublisherName";
  SortBy2["InstallCount"] = "InstallCount";
  SortBy2["PublishedDate"] = "PublishedDate";
  SortBy2["AverageRating"] = "AverageRating";
  SortBy2["WeightedRating"] = "WeightedRating";
})(SortBy || (SortBy = {}));
var SortOrder;
(function(SortOrder2) {
  SortOrder2[SortOrder2["Default"] = 0] = "Default";
  SortOrder2[SortOrder2["Ascending"] = 1] = "Ascending";
  SortOrder2[SortOrder2["Descending"] = 2] = "Descending";
})(SortOrder || (SortOrder = {}));
var FilterType;
(function(FilterType2) {
  FilterType2["Category"] = "Category";
  FilterType2["ExtensionId"] = "ExtensionId";
  FilterType2["ExtensionName"] = "ExtensionName";
  FilterType2["ExcludeWithFlags"] = "ExcludeWithFlags";
  FilterType2["Featured"] = "Featured";
  FilterType2["SearchText"] = "SearchText";
  FilterType2["Tag"] = "Tag";
  FilterType2["Target"] = "Target";
})(FilterType || (FilterType = {}));
var StatisticType;
(function(StatisticType2) {
  StatisticType2["Install"] = "install";
  StatisticType2["Uninstall"] = "uninstall";
})(StatisticType || (StatisticType = {}));
var InstallOperation;
(function(InstallOperation2) {
  InstallOperation2[InstallOperation2["None"] = 1] = "None";
  InstallOperation2[InstallOperation2["Install"] = 2] = "Install";
  InstallOperation2[InstallOperation2["Update"] = 3] = "Update";
  InstallOperation2[InstallOperation2["Migrate"] = 4] = "Migrate";
})(InstallOperation || (InstallOperation = {}));
const IExtensionGalleryService = createDecorator("extensionGalleryService");
var ExtensionGalleryErrorCode;
(function(ExtensionGalleryErrorCode2) {
  ExtensionGalleryErrorCode2["Timeout"] = "Timeout";
  ExtensionGalleryErrorCode2["Cancelled"] = "Cancelled";
  ExtensionGalleryErrorCode2["Failed"] = "Failed";
  ExtensionGalleryErrorCode2["DownloadFailedWriting"] = "DownloadFailedWriting";
  ExtensionGalleryErrorCode2["Offline"] = "Offline";
})(ExtensionGalleryErrorCode || (ExtensionGalleryErrorCode = {}));
class ExtensionGalleryError extends Error {
  static {
    __name(this, "ExtensionGalleryError");
  }
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
  }
}
var ExtensionManagementErrorCode;
(function(ExtensionManagementErrorCode2) {
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
  ExtensionManagementErrorCode2["DownloadFailedWriting"] = "DownloadFailedWriting";
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
})(ExtensionManagementErrorCode || (ExtensionManagementErrorCode = {}));
var ExtensionSignatureVerificationCode;
(function(ExtensionSignatureVerificationCode2) {
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
})(ExtensionSignatureVerificationCode || (ExtensionSignatureVerificationCode = {}));
class ExtensionManagementError extends Error {
  static {
    __name(this, "ExtensionManagementError");
  }
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = code;
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
    if (e.fileOperationResult === 1) {
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
const AllowedExtensionsConfigKey = "extensions.allowed";
const VerifyExtensionSignatureConfigKey = "extensions.verifySignature";
Registry.as(Extensions.Configuration).registerConfiguration({
  id: "extensions",
  order: 30,
  title: localize("extensionsConfigurationTitle", "Extensions"),
  type: "object",
  properties: {
    [AllowedExtensionsConfigKey]: {
      // Note: Type is set only to object because to support policies generation during build time, where single type is expected.
      type: "object",
      markdownDescription: localize("extensions.allowed", "Specify a list of extensions that are allowed to use. This helps maintain a secure and consistent development environment by restricting the use of unauthorized extensions. For more information on how to configure this setting, please visit the [Configure Allowed Extensions](https://code.visualstudio.com/docs/setup/enterprise#_configure-allowed-extensions) section."),
      default: "*",
      defaultSnippets: [{
        body: {},
        description: localize("extensions.allowed.none", "No extensions are allowed.")
      }, {
        body: {
          "*": true
        },
        description: localize("extensions.allowed.all", "All extensions are allowed.")
      }],
      scope: 1,
      policy: {
        name: "AllowedExtensions",
        minimumVersion: "1.96",
        description: localize("extensions.allowed.policy", "Specify a list of extensions that are allowed to use. This helps maintain a secure and consistent development environment by restricting the use of unauthorized extensions. More information: https://code.visualstudio.com/docs/setup/enterprise#_configure-allowed-extensions")
      },
      additionalProperties: false,
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          anyOf: [
            {
              type: ["boolean", "string"],
              enum: [true, false, "stable"],
              description: localize("extensions.allow.description", "Allow or disallow the extension."),
              enumDescriptions: [
                localize("extensions.allowed.enable.desc", "Extension is allowed."),
                localize("extensions.allowed.disable.desc", "Extension is not allowed."),
                localize("extensions.allowed.disable.stable.desc", "Allow only stable versions of the extension.")
              ]
            },
            {
              type: "array",
              items: {
                type: "string"
              },
              description: localize("extensions.allow.version.description", "Allow or disallow specific versions of the extension. To specifcy a platform specific version, use the format `platform@1.2.3`, e.g. `win32-x64@1.2.3`. Supported platforms are `win32-x64`, `win32-arm64`, `linux-x64`, `linux-arm64`, `linux-armhf`, `alpine-x64`, `alpine-arm64`, `darwin-x64`, `darwin-arm64`")
            }
          ]
        },
        "([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: ["boolean", "string"],
          enum: [true, false, "stable"],
          description: localize("extension.publisher.allow.description", "Allow or disallow all extensions from the publisher."),
          enumDescriptions: [
            localize("extensions.publisher.allowed.enable.desc", "All extensions from the publisher are allowed."),
            localize("extensions.publisher.allowed.disable.desc", "All extensions from the publisher are not allowed."),
            localize("extensions.publisher.allowed.disable.stable.desc", "Allow only stable versions of the extensions from the publisher.")
          ]
        },
        "\\*": {
          type: "boolean",
          enum: [true, false],
          description: localize("extensions.allow.all.description", "Allow or disallow all extensions."),
          enumDescriptions: [
            localize("extensions.allow.all.enable", "Allow all extensions."),
            localize("extensions.allow.all.disable", "Disallow all extensions.")
          ]
        }
      }
    }
  }
});
function shouldRequireRepositorySignatureFor(isPrivate, galleryManifest) {
  if (isPrivate) {
    return galleryManifest?.capabilities.signing?.allPrivateRepositorySigned === true;
  }
  return galleryManifest?.capabilities.signing?.allPublicRepositorySigned === true;
}
__name(shouldRequireRepositorySignatureFor, "shouldRequireRepositorySignatureFor");
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
  VerifyExtensionSignatureConfigKey,
  WEB_EXTENSION_TAG,
  computeSize,
  getTargetPlatform,
  isIExtensionIdentifier,
  isNotWebExtensionInWebTargetPlatform,
  isTargetPlatformCompatible,
  shouldRequireRepositorySignatureFor,
  toTargetPlatform
};
//# sourceMappingURL=extensionManagement.js.map
