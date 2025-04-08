var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Schemas } from "../../../../base/common/network.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ExtensionKind } from "../../../../platform/environment/common/environment.js";
import { ExtensionIdentifier, ExtensionIdentifierMap, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IReadOnlyExtensionDescriptionRegistry } from "./extensionDescriptionRegistry.js";
import { ExtensionHostKind, ExtensionRunningPreference, IExtensionHostKindPicker, determineExtensionHostKinds } from "./extensionHostKind.js";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionManifestPropertiesService } from "./extensionManifestPropertiesService.js";
import { ExtensionRunningLocation, LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation } from "./extensionRunningLocation.js";
let ExtensionRunningLocationTracker = class {
  constructor(_registry, _extensionHostKindPicker, _environmentService, _configurationService, _logService, _extensionManifestPropertiesService) {
    this._registry = _registry;
    this._extensionHostKindPicker = _extensionHostKindPicker;
    this._environmentService = _environmentService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
  }
  static {
    __name(this, "ExtensionRunningLocationTracker");
  }
  _runningLocation = new ExtensionIdentifierMap();
  _maxLocalProcessAffinity = 0;
  _maxLocalWebWorkerAffinity = 0;
  get maxLocalProcessAffinity() {
    return this._maxLocalProcessAffinity;
  }
  get maxLocalWebWorkerAffinity() {
    return this._maxLocalWebWorkerAffinity;
  }
  set(extensionId, runningLocation) {
    this._runningLocation.set(extensionId, runningLocation);
  }
  readExtensionKinds(extensionDescription) {
    if (extensionDescription.isUnderDevelopment && this._environmentService.extensionDevelopmentKind) {
      return this._environmentService.extensionDevelopmentKind;
    }
    return this._extensionManifestPropertiesService.getExtensionKind(extensionDescription);
  }
  getRunningLocation(extensionId) {
    return this._runningLocation.get(extensionId) || null;
  }
  filterByRunningLocation(extensions, desiredRunningLocation) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => desiredRunningLocation.equals(extRunningLocation));
  }
  filterByExtensionHostKind(extensions, desiredExtensionHostKind) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => extRunningLocation.kind === desiredExtensionHostKind);
  }
  filterByExtensionHostManager(extensions, extensionHostManager) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => extensionHostManager.representsRunningLocation(extRunningLocation));
  }
  _computeAffinity(inputExtensions, extensionHostKind, isInitialAllocation) {
    const extensions = new ExtensionIdentifierMap();
    for (const extension of inputExtensions) {
      if (extension.main || extension.browser) {
        extensions.set(extension.identifier, extension);
      }
    }
    for (const extension of this._registry.getAllExtensionDescriptions()) {
      if (extension.main || extension.browser) {
        const runningLocation = this._runningLocation.get(extension.identifier);
        if (runningLocation && runningLocation.kind === extensionHostKind) {
          extensions.set(extension.identifier, extension);
        }
      }
    }
    const groups = new ExtensionIdentifierMap();
    let groupNumber = 0;
    for (const [_, extension] of extensions) {
      groups.set(extension.identifier, ++groupNumber);
    }
    const changeGroup = /* @__PURE__ */ __name((from, to) => {
      for (const [key, group] of groups) {
        if (group === from) {
          groups.set(key, to);
        }
      }
    }, "changeGroup");
    for (const [_, extension] of extensions) {
      if (!extension.extensionDependencies) {
        continue;
      }
      const myGroup = groups.get(extension.identifier);
      for (const depId of extension.extensionDependencies) {
        const depGroup = groups.get(depId);
        if (!depGroup) {
          continue;
        }
        if (depGroup === myGroup) {
          continue;
        }
        changeGroup(depGroup, myGroup);
      }
    }
    const resultingAffinities = /* @__PURE__ */ new Map();
    let lastAffinity = 0;
    for (const [_, extension] of extensions) {
      const runningLocation = this._runningLocation.get(extension.identifier);
      if (runningLocation) {
        const group = groups.get(extension.identifier);
        resultingAffinities.set(group, runningLocation.affinity);
        lastAffinity = Math.max(lastAffinity, runningLocation.affinity);
      }
    }
    if (!this._environmentService.isExtensionDevelopment) {
      const configuredAffinities = this._configurationService.getValue("extensions.experimental.affinity") || {};
      const configuredExtensionIds = Object.keys(configuredAffinities);
      const configuredAffinityToResultingAffinity = /* @__PURE__ */ new Map();
      for (const extensionId of configuredExtensionIds) {
        const configuredAffinity = configuredAffinities[extensionId];
        if (typeof configuredAffinity !== "number" || configuredAffinity <= 0 || Math.floor(configuredAffinity) !== configuredAffinity) {
          this._logService.info(`Ignoring configured affinity for '${extensionId}' because the value is not a positive integer.`);
          continue;
        }
        const group = groups.get(extensionId);
        if (!group) {
          continue;
        }
        const affinity1 = resultingAffinities.get(group);
        if (affinity1) {
          configuredAffinityToResultingAffinity.set(configuredAffinity, affinity1);
          continue;
        }
        const affinity2 = configuredAffinityToResultingAffinity.get(configuredAffinity);
        if (affinity2) {
          resultingAffinities.set(group, affinity2);
          continue;
        }
        if (!isInitialAllocation) {
          this._logService.info(`Ignoring configured affinity for '${extensionId}' because extension host(s) are already running. Reload window.`);
          continue;
        }
        const affinity3 = ++lastAffinity;
        configuredAffinityToResultingAffinity.set(configuredAffinity, affinity3);
        resultingAffinities.set(group, affinity3);
      }
    }
    const result = new ExtensionIdentifierMap();
    for (const extension of inputExtensions) {
      const group = groups.get(extension.identifier) || 0;
      const affinity = resultingAffinities.get(group) || 0;
      result.set(extension.identifier, affinity);
    }
    if (lastAffinity > 0 && isInitialAllocation) {
      for (let affinity = 1; affinity <= lastAffinity; affinity++) {
        const extensionIds = [];
        for (const extension of inputExtensions) {
          if (result.get(extension.identifier) === affinity) {
            extensionIds.push(extension.identifier);
          }
        }
        this._logService.info(`Placing extension(s) ${extensionIds.map((e) => e.value).join(", ")} on a separate extension host.`);
      }
    }
    return { affinities: result, maxAffinity: lastAffinity };
  }
  computeRunningLocation(localExtensions, remoteExtensions, isInitialAllocation) {
    return this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, isInitialAllocation).runningLocation;
  }
  _doComputeRunningLocation(existingRunningLocation, localExtensions, remoteExtensions, isInitialAllocation) {
    localExtensions = localExtensions.filter((extension) => !existingRunningLocation.has(extension.identifier));
    remoteExtensions = remoteExtensions.filter((extension) => !existingRunningLocation.has(extension.identifier));
    const extensionHostKinds = determineExtensionHostKinds(
      localExtensions,
      remoteExtensions,
      (extension) => this.readExtensionKinds(extension),
      (extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this._extensionHostKindPicker.pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference)
    );
    const extensions = new ExtensionIdentifierMap();
    for (const extension of localExtensions) {
      extensions.set(extension.identifier, extension);
    }
    for (const extension of remoteExtensions) {
      extensions.set(extension.identifier, extension);
    }
    const result = new ExtensionIdentifierMap();
    const localProcessExtensions = [];
    const localWebWorkerExtensions = [];
    for (const [extensionIdKey, extensionHostKind] of extensionHostKinds) {
      let runningLocation = null;
      if (extensionHostKind === ExtensionHostKind.LocalProcess) {
        const extensionDescription = extensions.get(extensionIdKey);
        if (extensionDescription) {
          localProcessExtensions.push(extensionDescription);
        }
      } else if (extensionHostKind === ExtensionHostKind.LocalWebWorker) {
        const extensionDescription = extensions.get(extensionIdKey);
        if (extensionDescription) {
          localWebWorkerExtensions.push(extensionDescription);
        }
      } else if (extensionHostKind === ExtensionHostKind.Remote) {
        runningLocation = new RemoteRunningLocation();
      }
      result.set(extensionIdKey, runningLocation);
    }
    const { affinities, maxAffinity } = this._computeAffinity(localProcessExtensions, ExtensionHostKind.LocalProcess, isInitialAllocation);
    for (const extension of localProcessExtensions) {
      const affinity = affinities.get(extension.identifier) || 0;
      result.set(extension.identifier, new LocalProcessRunningLocation(affinity));
    }
    const { affinities: localWebWorkerAffinities, maxAffinity: maxLocalWebWorkerAffinity } = this._computeAffinity(localWebWorkerExtensions, ExtensionHostKind.LocalWebWorker, isInitialAllocation);
    for (const extension of localWebWorkerExtensions) {
      const affinity = localWebWorkerAffinities.get(extension.identifier) || 0;
      result.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
    }
    for (const [extensionIdKey, runningLocation] of existingRunningLocation) {
      if (runningLocation) {
        result.set(extensionIdKey, runningLocation);
      }
    }
    return { runningLocation: result, maxLocalProcessAffinity: maxAffinity, maxLocalWebWorkerAffinity };
  }
  initializeRunningLocation(localExtensions, remoteExtensions) {
    const { runningLocation, maxLocalProcessAffinity, maxLocalWebWorkerAffinity } = this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, true);
    this._runningLocation = runningLocation;
    this._maxLocalProcessAffinity = maxLocalProcessAffinity;
    this._maxLocalWebWorkerAffinity = maxLocalWebWorkerAffinity;
  }
  /**
   * Returns the running locations for the removed extensions.
   */
  deltaExtensions(toAdd, toRemove) {
    const removedRunningLocation = new ExtensionIdentifierMap();
    for (const extensionId of toRemove) {
      const extensionKey = extensionId;
      removedRunningLocation.set(extensionKey, this._runningLocation.get(extensionKey) || null);
      this._runningLocation.delete(extensionKey);
    }
    this._updateRunningLocationForAddedExtensions(toAdd);
    return removedRunningLocation;
  }
  /**
   * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
   */
  _updateRunningLocationForAddedExtensions(toAdd) {
    const localProcessExtensions = [];
    const localWebWorkerExtensions = [];
    for (const extension of toAdd) {
      const extensionKind = this.readExtensionKinds(extension);
      const isRemote = extension.extensionLocation.scheme === Schemas.vscodeRemote;
      const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKind, !isRemote, isRemote, ExtensionRunningPreference.None);
      let runningLocation = null;
      if (extensionHostKind === ExtensionHostKind.LocalProcess) {
        localProcessExtensions.push(extension);
      } else if (extensionHostKind === ExtensionHostKind.LocalWebWorker) {
        localWebWorkerExtensions.push(extension);
      } else if (extensionHostKind === ExtensionHostKind.Remote) {
        runningLocation = new RemoteRunningLocation();
      }
      this._runningLocation.set(extension.identifier, runningLocation);
    }
    const { affinities } = this._computeAffinity(localProcessExtensions, ExtensionHostKind.LocalProcess, false);
    for (const extension of localProcessExtensions) {
      const affinity = affinities.get(extension.identifier) || 0;
      this._runningLocation.set(extension.identifier, new LocalProcessRunningLocation(affinity));
    }
    const { affinities: webWorkerExtensionsAffinities } = this._computeAffinity(localWebWorkerExtensions, ExtensionHostKind.LocalWebWorker, false);
    for (const extension of localWebWorkerExtensions) {
      const affinity = webWorkerExtensionsAffinities.get(extension.identifier) || 0;
      this._runningLocation.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
    }
  }
};
ExtensionRunningLocationTracker = __decorateClass([
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IExtensionManifestPropertiesService)
], ExtensionRunningLocationTracker);
function filterExtensionDescriptions(extensions, runningLocation, predicate) {
  return extensions.filter((ext) => {
    const extRunningLocation = runningLocation.get(ext.identifier);
    return extRunningLocation && predicate(extRunningLocation);
  });
}
__name(filterExtensionDescriptions, "filterExtensionDescriptions");
function filterExtensionIdentifiers(extensions, runningLocation, predicate) {
  return extensions.filter((ext) => {
    const extRunningLocation = runningLocation.get(ext);
    return extRunningLocation && predicate(extRunningLocation);
  });
}
__name(filterExtensionIdentifiers, "filterExtensionIdentifiers");
export {
  ExtensionRunningLocationTracker,
  filterExtensionDescriptions,
  filterExtensionIdentifiers
};
//# sourceMappingURL=extensionRunningLocationTracker.js.map
