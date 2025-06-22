var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
var ExtensionHostKind;
(function(ExtensionHostKind2) {
  ExtensionHostKind2[ExtensionHostKind2["LocalProcess"] = 1] = "LocalProcess";
  ExtensionHostKind2[ExtensionHostKind2["LocalWebWorker"] = 2] = "LocalWebWorker";
  ExtensionHostKind2[ExtensionHostKind2["Remote"] = 3] = "Remote";
})(ExtensionHostKind || (ExtensionHostKind = {}));
function extensionHostKindToString(kind) {
  if (kind === null) {
    return "None";
  }
  switch (kind) {
    case 1:
      return "LocalProcess";
    case 2:
      return "LocalWebWorker";
    case 3:
      return "Remote";
  }
}
__name(extensionHostKindToString, "extensionHostKindToString");
var ExtensionRunningPreference;
(function(ExtensionRunningPreference2) {
  ExtensionRunningPreference2[ExtensionRunningPreference2["None"] = 0] = "None";
  ExtensionRunningPreference2[ExtensionRunningPreference2["Local"] = 1] = "Local";
  ExtensionRunningPreference2[ExtensionRunningPreference2["Remote"] = 2] = "Remote";
})(ExtensionRunningPreference || (ExtensionRunningPreference = {}));
function extensionRunningPreferenceToString(preference) {
  switch (preference) {
    case 0:
      return "None";
    case 1:
      return "Local";
    case 2:
      return "Remote";
  }
}
__name(extensionRunningPreferenceToString, "extensionRunningPreferenceToString");
function determineExtensionHostKinds(_localExtensions, _remoteExtensions, getExtensionKind, pickExtensionHostKind) {
  const localExtensions = toExtensionWithKind(_localExtensions, getExtensionKind);
  const remoteExtensions = toExtensionWithKind(_remoteExtensions, getExtensionKind);
  const allExtensions = /* @__PURE__ */ new Map();
  const collectExtension = /* @__PURE__ */ __name((ext) => {
    if (allExtensions.has(ext.key)) {
      return;
    }
    const local = localExtensions.get(ext.key) || null;
    const remote = remoteExtensions.get(ext.key) || null;
    const info = new ExtensionInfo(local, remote);
    allExtensions.set(info.key, info);
  }, "collectExtension");
  localExtensions.forEach((ext) => collectExtension(ext));
  remoteExtensions.forEach((ext) => collectExtension(ext));
  const extensionHostKinds = /* @__PURE__ */ new Map();
  allExtensions.forEach((ext) => {
    const isInstalledLocally = Boolean(ext.local);
    const isInstalledRemotely = Boolean(ext.remote);
    const isLocallyUnderDevelopment = Boolean(ext.local && ext.local.isUnderDevelopment);
    const isRemotelyUnderDevelopment = Boolean(ext.remote && ext.remote.isUnderDevelopment);
    let preference = 0;
    if (isLocallyUnderDevelopment && !isRemotelyUnderDevelopment) {
      preference = 1;
    } else if (isRemotelyUnderDevelopment && !isLocallyUnderDevelopment) {
      preference = 2;
    }
    extensionHostKinds.set(ext.key, pickExtensionHostKind(ext.identifier, ext.kind, isInstalledLocally, isInstalledRemotely, preference));
  });
  return extensionHostKinds;
}
__name(determineExtensionHostKinds, "determineExtensionHostKinds");
function toExtensionWithKind(extensions, getExtensionKind) {
  const result = /* @__PURE__ */ new Map();
  extensions.forEach((desc) => {
    const ext = new ExtensionWithKind(desc, getExtensionKind(desc));
    result.set(ext.key, ext);
  });
  return result;
}
__name(toExtensionWithKind, "toExtensionWithKind");
class ExtensionWithKind {
  static {
    __name(this, "ExtensionWithKind");
  }
  constructor(desc, kind) {
    this.desc = desc;
    this.kind = kind;
  }
  get key() {
    return ExtensionIdentifier.toKey(this.desc.identifier);
  }
  get isUnderDevelopment() {
    return this.desc.isUnderDevelopment;
  }
}
class ExtensionInfo {
  static {
    __name(this, "ExtensionInfo");
  }
  constructor(local, remote) {
    this.local = local;
    this.remote = remote;
  }
  get key() {
    if (this.local) {
      return this.local.key;
    }
    return this.remote.key;
  }
  get identifier() {
    if (this.local) {
      return this.local.desc.identifier;
    }
    return this.remote.desc.identifier;
  }
  get kind() {
    if (this.local) {
      return this.local.kind;
    }
    return this.remote.kind;
  }
}
export {
  ExtensionHostKind,
  ExtensionRunningPreference,
  determineExtensionHostKinds,
  extensionHostKindToString,
  extensionRunningPreferenceToString
};
//# sourceMappingURL=extensionHostKind.js.map
