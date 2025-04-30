var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { compareIgnoreCase } from "../../../base/common/strings.js";
import { getTargetPlatform } from "./extensionManagement.js";
import { ExtensionIdentifier, UNDEFINED_PUBLISHER } from "../../extensions/common/extensions.js";
import { isLinux, platform } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { getErrorMessage } from "../../../base/common/errors.js";
import { arch } from "../../../base/common/process.js";
import { TelemetryTrustedValue } from "../../telemetry/common/telemetryUtils.js";
import { isString } from "../../../base/common/types.js";
function areSameExtensions(a, b) {
  if (a.uuid && b.uuid) {
    return a.uuid === b.uuid;
  }
  if (a.id === b.id) {
    return true;
  }
  return compareIgnoreCase(a.id, b.id) === 0;
}
__name(areSameExtensions, "areSameExtensions");
const ExtensionKeyRegex = /^([^.]+\..+)-(\d+\.\d+\.\d+)(-(.+))?$/;
class ExtensionKey {
  static {
    __name(this, "ExtensionKey");
  }
  static create(extension) {
    const version = extension.manifest ? extension.manifest.version : extension.version;
    const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
    return new ExtensionKey(extension.identifier, version, targetPlatform);
  }
  static parse(key) {
    const matches = ExtensionKeyRegex.exec(key);
    return matches && matches[1] && matches[2] ? new ExtensionKey({ id: matches[1] }, matches[2], matches[4] || void 0) : null;
  }
  constructor(identifier, version, targetPlatform = "undefined") {
    this.identifier = identifier;
    this.version = version;
    this.targetPlatform = targetPlatform;
    this.id = identifier.id;
  }
  toString() {
    return `${this.id}-${this.version}${this.targetPlatform !== "undefined" ? `-${this.targetPlatform}` : ""}`;
  }
  equals(o) {
    if (!(o instanceof ExtensionKey)) {
      return false;
    }
    return areSameExtensions(this, o) && this.version === o.version && this.targetPlatform === o.targetPlatform;
  }
}
const EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;
function getIdAndVersion(id) {
  const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
  if (matches && matches[1]) {
    return [adoptToGalleryExtensionId(matches[1]), matches[2]];
  }
  return [adoptToGalleryExtensionId(id), void 0];
}
__name(getIdAndVersion, "getIdAndVersion");
function getExtensionId(publisher, name) {
  return `${publisher}.${name}`;
}
__name(getExtensionId, "getExtensionId");
function adoptToGalleryExtensionId(id) {
  return id.toLowerCase();
}
__name(adoptToGalleryExtensionId, "adoptToGalleryExtensionId");
function getGalleryExtensionId(publisher, name) {
  return adoptToGalleryExtensionId(getExtensionId(publisher ?? UNDEFINED_PUBLISHER, name));
}
__name(getGalleryExtensionId, "getGalleryExtensionId");
function groupByExtension(extensions, getExtensionIdentifier) {
  const byExtension = [];
  const findGroup = /* @__PURE__ */ __name((extension) => {
    for (const group of byExtension) {
      if (group.some((e) => areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
        return group;
      }
    }
    return null;
  }, "findGroup");
  for (const extension of extensions) {
    const group = findGroup(extension);
    if (group) {
      group.push(extension);
    } else {
      byExtension.push([extension]);
    }
  }
  return byExtension;
}
__name(groupByExtension, "groupByExtension");
function getLocalExtensionTelemetryData(extension) {
  return {
    id: extension.identifier.id,
    name: extension.manifest.name,
    galleryId: null,
    publisherId: extension.publisherId,
    publisherName: extension.manifest.publisher,
    publisherDisplayName: extension.publisherDisplayName,
    dependencies: extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length > 0
  };
}
__name(getLocalExtensionTelemetryData, "getLocalExtensionTelemetryData");
function getGalleryExtensionTelemetryData(extension) {
  return {
    id: new TelemetryTrustedValue(extension.identifier.id),
    name: new TelemetryTrustedValue(extension.name),
    extensionVersion: extension.version,
    galleryId: extension.identifier.uuid,
    publisherId: extension.publisherId,
    publisherName: extension.publisher,
    publisherDisplayName: extension.publisherDisplayName,
    isPreReleaseVersion: extension.properties.isPreReleaseVersion,
    dependencies: !!(extension.properties.dependencies && extension.properties.dependencies.length > 0),
    isSigned: extension.isSigned,
    ...extension.telemetryData
  };
}
__name(getGalleryExtensionTelemetryData, "getGalleryExtensionTelemetryData");
const BetterMergeId = new ExtensionIdentifier("pprice.better-merge");
function getExtensionDependencies(installedExtensions, extension) {
  const dependencies = [];
  const extensions = extension.manifest.extensionDependencies?.slice(0) ?? [];
  while (extensions.length) {
    const id = extensions.shift();
    if (id && dependencies.every((e) => !areSameExtensions(e.identifier, { id }))) {
      const ext = installedExtensions.filter((e) => areSameExtensions(e.identifier, { id }));
      if (ext.length === 1) {
        dependencies.push(ext[0]);
        extensions.push(...ext[0].manifest.extensionDependencies?.slice(0) ?? []);
      }
    }
  }
  return dependencies;
}
__name(getExtensionDependencies, "getExtensionDependencies");
async function isAlpineLinux(fileService, logService) {
  if (!isLinux) {
    return false;
  }
  let content;
  try {
    const fileContent = await fileService.readFile(URI.file("/etc/os-release"));
    content = fileContent.value.toString();
  } catch (error) {
    try {
      const fileContent = await fileService.readFile(URI.file("/usr/lib/os-release"));
      content = fileContent.value.toString();
    } catch (error2) {
      logService.debug(`Error while getting the os-release file.`, getErrorMessage(error2));
    }
  }
  return !!content && (content.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === "alpine";
}
__name(isAlpineLinux, "isAlpineLinux");
async function computeTargetPlatform(fileService, logService) {
  const alpineLinux = await isAlpineLinux(fileService, logService);
  const targetPlatform = getTargetPlatform(alpineLinux ? "alpine" : platform, arch);
  logService.info("ComputeTargetPlatform:", targetPlatform);
  return targetPlatform;
}
__name(computeTargetPlatform, "computeTargetPlatform");
function isMalicious(identifier, malicious) {
  return findMatchingMaliciousEntry(identifier, malicious) !== void 0;
}
__name(isMalicious, "isMalicious");
function findMatchingMaliciousEntry(identifier, malicious) {
  return malicious.find(({ extensionOrPublisher }) => {
    if (isString(extensionOrPublisher)) {
      return compareIgnoreCase(identifier.id.split(".")[0], extensionOrPublisher) === 0;
    }
    return areSameExtensions(identifier, extensionOrPublisher);
  });
}
__name(findMatchingMaliciousEntry, "findMatchingMaliciousEntry");
export {
  BetterMergeId,
  ExtensionKey,
  adoptToGalleryExtensionId,
  areSameExtensions,
  computeTargetPlatform,
  findMatchingMaliciousEntry,
  getExtensionDependencies,
  getExtensionId,
  getGalleryExtensionId,
  getGalleryExtensionTelemetryData,
  getIdAndVersion,
  getLocalExtensionTelemetryData,
  groupByExtension,
  isMalicious
};
//# sourceMappingURL=extensionManagementUtil.js.map
