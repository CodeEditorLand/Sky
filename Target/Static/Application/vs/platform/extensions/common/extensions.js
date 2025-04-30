var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../base/common/strings.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { getRemoteName } from "../../remote/common/remoteHosts.js";
const USER_MANIFEST_CACHE_FILE = "extensions.user.cache";
const BUILTIN_MANIFEST_CACHE_FILE = "extensions.builtin.cache";
const UNDEFINED_PUBLISHER = "undefined_publisher";
const ALL_EXTENSION_KINDS = ["ui", "workspace", "web"];
function getWorkspaceSupportTypeMessage(supportType) {
  if (typeof supportType === "object" && supportType !== null) {
    if (supportType.supported !== true) {
      return supportType.description;
    }
  }
  return void 0;
}
__name(getWorkspaceSupportTypeMessage, "getWorkspaceSupportTypeMessage");
const EXTENSION_CATEGORIES = [
  "AI",
  "Azure",
  "Chat",
  "Data Science",
  "Debuggers",
  "Extension Packs",
  "Education",
  "Formatters",
  "Keymaps",
  "Language Packs",
  "Linters",
  "Machine Learning",
  "Notebooks",
  "Programming Languages",
  "SCM Providers",
  "Snippets",
  "Testing",
  "Themes",
  "Visualization",
  "Other"
];
var ExtensionType;
(function(ExtensionType2) {
  ExtensionType2[ExtensionType2["System"] = 0] = "System";
  ExtensionType2[ExtensionType2["User"] = 1] = "User";
})(ExtensionType || (ExtensionType = {}));
var TargetPlatform;
(function(TargetPlatform2) {
  TargetPlatform2["WIN32_X64"] = "win32-x64";
  TargetPlatform2["WIN32_ARM64"] = "win32-arm64";
  TargetPlatform2["LINUX_X64"] = "linux-x64";
  TargetPlatform2["LINUX_ARM64"] = "linux-arm64";
  TargetPlatform2["LINUX_ARMHF"] = "linux-armhf";
  TargetPlatform2["ALPINE_X64"] = "alpine-x64";
  TargetPlatform2["ALPINE_ARM64"] = "alpine-arm64";
  TargetPlatform2["DARWIN_X64"] = "darwin-x64";
  TargetPlatform2["DARWIN_ARM64"] = "darwin-arm64";
  TargetPlatform2["WEB"] = "web";
  TargetPlatform2["UNIVERSAL"] = "universal";
  TargetPlatform2["UNKNOWN"] = "unknown";
  TargetPlatform2["UNDEFINED"] = "undefined";
})(TargetPlatform || (TargetPlatform = {}));
class ExtensionIdentifier {
  static {
    __name(this, "ExtensionIdentifier");
  }
  constructor(value) {
    this.value = value;
    this._lower = value.toLowerCase();
  }
  static equals(a, b) {
    if (typeof a === "undefined" || a === null) {
      return typeof b === "undefined" || b === null;
    }
    if (typeof b === "undefined" || b === null) {
      return false;
    }
    if (typeof a === "string" || typeof b === "string") {
      const aValue = typeof a === "string" ? a : a.value;
      const bValue = typeof b === "string" ? b : b.value;
      return strings.equalsIgnoreCase(aValue, bValue);
    }
    return a._lower === b._lower;
  }
  /**
   * Gives the value by which to index (for equality).
   */
  static toKey(id) {
    if (typeof id === "string") {
      return id.toLowerCase();
    }
    return id._lower;
  }
}
class ExtensionIdentifierSet {
  static {
    __name(this, "ExtensionIdentifierSet");
  }
  get size() {
    return this._set.size;
  }
  constructor(iterable) {
    this._set = /* @__PURE__ */ new Set();
    if (iterable) {
      for (const value of iterable) {
        this.add(value);
      }
    }
  }
  add(id) {
    this._set.add(ExtensionIdentifier.toKey(id));
  }
  delete(extensionId) {
    return this._set.delete(ExtensionIdentifier.toKey(extensionId));
  }
  has(id) {
    return this._set.has(ExtensionIdentifier.toKey(id));
  }
}
class ExtensionIdentifierMap {
  static {
    __name(this, "ExtensionIdentifierMap");
  }
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  clear() {
    this._map.clear();
  }
  delete(id) {
    this._map.delete(ExtensionIdentifier.toKey(id));
  }
  get(id) {
    return this._map.get(ExtensionIdentifier.toKey(id));
  }
  has(id) {
    return this._map.has(ExtensionIdentifier.toKey(id));
  }
  set(id, value) {
    this._map.set(ExtensionIdentifier.toKey(id), value);
  }
  values() {
    return this._map.values();
  }
  forEach(callbackfn) {
    this._map.forEach(callbackfn);
  }
  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}
class ExtensionError extends Error {
  static {
    __name(this, "ExtensionError");
  }
  constructor(extensionIdentifier, cause, message) {
    super(`Error in extension ${ExtensionIdentifier.toKey(extensionIdentifier)}: ${message ?? cause.message}`, { cause });
    this.name = "ExtensionError";
    this.extension = extensionIdentifier;
  }
}
function isApplicationScopedExtension(manifest) {
  return isLanguagePackExtension(manifest);
}
__name(isApplicationScopedExtension, "isApplicationScopedExtension");
function isLanguagePackExtension(manifest) {
  return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
}
__name(isLanguagePackExtension, "isLanguagePackExtension");
function isAuthenticationProviderExtension(manifest) {
  return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
}
__name(isAuthenticationProviderExtension, "isAuthenticationProviderExtension");
function isResolverExtension(manifest, remoteAuthority) {
  if (remoteAuthority) {
    const activationEvent = `onResolveRemoteAuthority:${getRemoteName(remoteAuthority)}`;
    return !!manifest.activationEvents?.includes(activationEvent);
  }
  return false;
}
__name(isResolverExtension, "isResolverExtension");
function parseApiProposals(enabledApiProposals) {
  return enabledApiProposals.map((proposal) => {
    const [proposalName, version] = proposal.split("@");
    return { proposalName, version: version ? parseInt(version) : void 0 };
  });
}
__name(parseApiProposals, "parseApiProposals");
function parseEnabledApiProposalNames(enabledApiProposals) {
  return enabledApiProposals.map((proposal) => proposal.split("@")[0]);
}
__name(parseEnabledApiProposalNames, "parseEnabledApiProposalNames");
const IBuiltinExtensionsScannerService = createDecorator("IBuiltinExtensionsScannerService");
export {
  ALL_EXTENSION_KINDS,
  BUILTIN_MANIFEST_CACHE_FILE,
  EXTENSION_CATEGORIES,
  ExtensionError,
  ExtensionIdentifier,
  ExtensionIdentifierMap,
  ExtensionIdentifierSet,
  ExtensionType,
  IBuiltinExtensionsScannerService,
  TargetPlatform,
  UNDEFINED_PUBLISHER,
  USER_MANIFEST_CACHE_FILE,
  getWorkspaceSupportTypeMessage,
  isApplicationScopedExtension,
  isAuthenticationProviderExtension,
  isLanguagePackExtension,
  isResolverExtension,
  parseApiProposals,
  parseEnabledApiProposalNames
};
//# sourceMappingURL=extensions.js.map
