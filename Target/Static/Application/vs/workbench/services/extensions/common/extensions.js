var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { getExtensionId, getGalleryExtensionId } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ImplicitActivationEvents } from "../../../../platform/extensionManagement/common/implicitActivationEvents.js";
import { ExtensionIdentifier, ExtensionIdentifierMap, ExtensionIdentifierSet } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const nullExtensionDescription = Object.freeze({
  identifier: new ExtensionIdentifier("nullExtensionDescription"),
  name: "Null Extension Description",
  version: "0.0.0",
  publisher: "vscode",
  engines: { vscode: "" },
  extensionLocation: URI.parse("void:location"),
  isBuiltin: false,
  targetPlatform: "undefined",
  isUserBuiltin: false,
  isUnderDevelopment: false,
  preRelease: false
});
const webWorkerExtHostConfig = "extensions.webWorker";
const IExtensionService = createDecorator("extensionService");
class MissingExtensionDependency {
  static {
    __name(this, "MissingExtensionDependency");
  }
  constructor(dependency) {
    this.dependency = dependency;
  }
}
var ExtensionHostStartup;
(function(ExtensionHostStartup2) {
  ExtensionHostStartup2[ExtensionHostStartup2["EagerAutoStart"] = 1] = "EagerAutoStart";
  ExtensionHostStartup2[ExtensionHostStartup2["EagerManualStart"] = 2] = "EagerManualStart";
  ExtensionHostStartup2[ExtensionHostStartup2["Lazy"] = 3] = "Lazy";
})(ExtensionHostStartup || (ExtensionHostStartup = {}));
class ExtensionHostExtensions {
  static {
    __name(this, "ExtensionHostExtensions");
  }
  get versionId() {
    return this._versionId;
  }
  get allExtensions() {
    return this._allExtensions;
  }
  get myExtensions() {
    return this._myExtensions;
  }
  constructor(versionId, allExtensions, myExtensions) {
    this._versionId = versionId;
    this._allExtensions = allExtensions.slice(0);
    this._myExtensions = myExtensions.slice(0);
    this._myActivationEvents = null;
  }
  toSnapshot() {
    return {
      versionId: this._versionId,
      allExtensions: this._allExtensions,
      myExtensions: this._myExtensions,
      activationEvents: ImplicitActivationEvents.createActivationEventsMap(this._allExtensions)
    };
  }
  set(versionId, allExtensions, myExtensions) {
    if (this._versionId > versionId) {
      throw new Error(`ExtensionHostExtensions: invalid versionId ${versionId} (current: ${this._versionId})`);
    }
    const toRemove = [];
    const toAdd = [];
    const myToRemove = [];
    const myToAdd = [];
    const oldExtensionsMap = extensionDescriptionArrayToMap(this._allExtensions);
    const newExtensionsMap = extensionDescriptionArrayToMap(allExtensions);
    const extensionsAreTheSame = /* @__PURE__ */ __name((a, b) => {
      return a.extensionLocation.toString() === b.extensionLocation.toString() || a.isBuiltin === b.isBuiltin || a.isUserBuiltin === b.isUserBuiltin || a.isUnderDevelopment === b.isUnderDevelopment;
    }, "extensionsAreTheSame");
    for (const oldExtension of this._allExtensions) {
      const newExtension = newExtensionsMap.get(oldExtension.identifier);
      if (!newExtension) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
      if (!extensionsAreTheSame(oldExtension, newExtension)) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
    }
    for (const newExtension of allExtensions) {
      const oldExtension = oldExtensionsMap.get(newExtension.identifier);
      if (!oldExtension) {
        toAdd.push(newExtension);
        continue;
      }
      if (!extensionsAreTheSame(oldExtension, newExtension)) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
    }
    const myOldExtensionsSet = new ExtensionIdentifierSet(this._myExtensions);
    const myNewExtensionsSet = new ExtensionIdentifierSet(myExtensions);
    for (const oldExtensionId of this._myExtensions) {
      if (!myNewExtensionsSet.has(oldExtensionId)) {
        myToRemove.push(oldExtensionId);
      }
    }
    for (const newExtensionId of myExtensions) {
      if (!myOldExtensionsSet.has(newExtensionId)) {
        myToAdd.push(newExtensionId);
      }
    }
    const addActivationEvents = ImplicitActivationEvents.createActivationEventsMap(toAdd);
    const delta = { versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd };
    this.delta(delta);
    return delta;
  }
  delta(extensionsDelta) {
    if (this._versionId >= extensionsDelta.versionId) {
      return null;
    }
    const { toRemove, toAdd, myToRemove, myToAdd } = extensionsDelta;
    const toRemoveSet = new ExtensionIdentifierSet(toRemove);
    const myToRemoveSet = new ExtensionIdentifierSet(myToRemove);
    for (let i = 0; i < this._allExtensions.length; i++) {
      if (toRemoveSet.has(this._allExtensions[i].identifier)) {
        this._allExtensions.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this._myExtensions.length; i++) {
      if (myToRemoveSet.has(this._myExtensions[i])) {
        this._myExtensions.splice(i, 1);
        i--;
      }
    }
    for (const extension of toAdd) {
      this._allExtensions.push(extension);
    }
    for (const extensionId of myToAdd) {
      this._myExtensions.push(extensionId);
    }
    this._myActivationEvents = null;
    return extensionsDelta;
  }
  containsExtension(extensionId) {
    for (const myExtensionId of this._myExtensions) {
      if (ExtensionIdentifier.equals(myExtensionId, extensionId)) {
        return true;
      }
    }
    return false;
  }
  containsActivationEvent(activationEvent) {
    if (!this._myActivationEvents) {
      this._myActivationEvents = this._readMyActivationEvents();
    }
    return this._myActivationEvents.has(activationEvent);
  }
  _readMyActivationEvents() {
    const result = /* @__PURE__ */ new Set();
    for (const extensionDescription of this._allExtensions) {
      if (!this.containsExtension(extensionDescription.identifier)) {
        continue;
      }
      const activationEvents = ImplicitActivationEvents.readActivationEvents(extensionDescription);
      for (const activationEvent of activationEvents) {
        result.add(activationEvent);
      }
    }
    return result;
  }
}
function extensionDescriptionArrayToMap(extensions) {
  const result = new ExtensionIdentifierMap();
  for (const extension of extensions) {
    result.set(extension.identifier, extension);
  }
  return result;
}
__name(extensionDescriptionArrayToMap, "extensionDescriptionArrayToMap");
function isProposedApiEnabled(extension, proposal) {
  if (!extension.enabledApiProposals) {
    return false;
  }
  return extension.enabledApiProposals.includes(proposal);
}
__name(isProposedApiEnabled, "isProposedApiEnabled");
function checkProposedApiEnabled(extension, proposal) {
  if (!isProposedApiEnabled(extension, proposal)) {
    throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.
Its package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(", ") ?? "[]"} but NOT ${proposal}.
 The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
  }
}
__name(checkProposedApiEnabled, "checkProposedApiEnabled");
class ActivationTimes {
  static {
    __name(this, "ActivationTimes");
  }
  constructor(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
    this.codeLoadingTime = codeLoadingTime;
    this.activateCallTime = activateCallTime;
    this.activateResolvedTime = activateResolvedTime;
    this.activationReason = activationReason;
  }
}
class ExtensionPointContribution {
  static {
    __name(this, "ExtensionPointContribution");
  }
  constructor(description, value) {
    this.description = description;
    this.value = value;
  }
}
var ActivationKind;
(function(ActivationKind2) {
  ActivationKind2[ActivationKind2["Normal"] = 0] = "Normal";
  ActivationKind2[ActivationKind2["Immediate"] = 1] = "Immediate";
})(ActivationKind || (ActivationKind = {}));
function toExtension(extensionDescription) {
  return {
    type: extensionDescription.isBuiltin ? 0 : 1,
    isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
    identifier: { id: getGalleryExtensionId(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
    manifest: extensionDescription,
    location: extensionDescription.extensionLocation,
    targetPlatform: extensionDescription.targetPlatform,
    validations: [],
    isValid: true,
    preRelease: extensionDescription.preRelease,
    publisherDisplayName: extensionDescription.publisherDisplayName
  };
}
__name(toExtension, "toExtension");
function toExtensionDescription(extension, isUnderDevelopment) {
  const id = getExtensionId(extension.manifest.publisher, extension.manifest.name);
  return {
    id,
    identifier: new ExtensionIdentifier(id),
    isBuiltin: extension.type === 0,
    isUserBuiltin: extension.type === 1 && extension.isBuiltin,
    isUnderDevelopment: !!isUnderDevelopment,
    extensionLocation: extension.location,
    uuid: extension.identifier.uuid,
    targetPlatform: extension.targetPlatform,
    publisherDisplayName: extension.publisherDisplayName,
    preRelease: extension.preRelease,
    ...extension.manifest
  };
}
__name(toExtensionDescription, "toExtensionDescription");
class NullExtensionService {
  static {
    __name(this, "NullExtensionService");
  }
  constructor() {
    this.onDidRegisterExtensions = Event.None;
    this.onDidChangeExtensionsStatus = Event.None;
    this.onDidChangeExtensions = Event.None;
    this.onWillActivateByEvent = Event.None;
    this.onDidChangeResponsiveChange = Event.None;
    this.onWillStop = Event.None;
    this.extensions = [];
  }
  activateByEvent(_activationEvent) {
    return Promise.resolve(void 0);
  }
  activateById(extensionId, reason) {
    return Promise.resolve(void 0);
  }
  activationEventIsDone(_activationEvent) {
    return false;
  }
  whenInstalledExtensionsRegistered() {
    return Promise.resolve(true);
  }
  getExtension() {
    return Promise.resolve(void 0);
  }
  readExtensionPointContributions(_extPoint) {
    return Promise.resolve(/* @__PURE__ */ Object.create(null));
  }
  getExtensionsStatus() {
    return /* @__PURE__ */ Object.create(null);
  }
  getInspectPorts(_extensionHostKind, _tryEnableInspector) {
    return Promise.resolve([]);
  }
  async stopExtensionHosts() {
    return true;
  }
  async startExtensionHosts() {
  }
  async setRemoteEnvironment(_env) {
  }
  canAddExtension() {
    return false;
  }
  canRemoveExtension() {
    return false;
  }
}
export {
  ActivationKind,
  ActivationTimes,
  ExtensionHostExtensions,
  ExtensionHostStartup,
  ExtensionPointContribution,
  IExtensionService,
  MissingExtensionDependency,
  NullExtensionService,
  checkProposedApiEnabled,
  isProposedApiEnabled,
  nullExtensionDescription,
  toExtension,
  toExtensionDescription,
  webWorkerExtHostConfig
};
//# sourceMappingURL=extensions.js.map
