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
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { isFalsyOrWhitespace } from "../../../../../base/common/strings.js";
import { localize } from "../../../../../nls.js";
import { IMcpCollectionContribution } from "../../../../../platform/extensions/common/extensions.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
import { mcpActivationEvent, mcpContributionPoint } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { extensionPrefixedIdentifier, McpServerDefinition } from "../mcpTypes.js";
import { IMcpDiscovery } from "./mcpDiscovery.js";
const cacheKey = "mcp.extCachedServers";
const _mcpExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(mcpContributionPoint);
let ExtensionMcpDiscovery = class extends Disposable {
  constructor(_mcpRegistry, storageService, _extensionService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._extensionService = _extensionService;
    this.cachedServers = storageService.getObject(cacheKey, StorageScope.WORKSPACE, {});
    this._register(storageService.onWillSaveState(() => {
      let updated = false;
      for (const collectionId of this._extensionCollectionIdsToPersist) {
        const collection = this._mcpRegistry.collections.get().find((c) => c.id === collectionId);
        if (!collection || collection.lazy) {
          continue;
        }
        const defs = collection.serverDefinitions.get();
        if (defs) {
          updated = true;
          this.cachedServers[collectionId] = { servers: defs.map(McpServerDefinition.toSerialized) };
        }
      }
      if (updated) {
        storageService.store(cacheKey, this.cachedServers, StorageScope.WORKSPACE, StorageTarget.MACHINE);
      }
    }));
  }
  static {
    __name(this, "ExtensionMcpDiscovery");
  }
  _extensionCollectionIdsToPersist = /* @__PURE__ */ new Set();
  cachedServers;
  start() {
    const extensionCollections = this._register(new DisposableMap());
    this._register(_mcpExtensionPoint.setHandler((_extensions, delta) => {
      const { added, removed } = delta;
      for (const collections of removed) {
        for (const coll of collections.value) {
          extensionCollections.deleteAndDispose(extensionPrefixedIdentifier(collections.description.identifier, coll.id));
        }
      }
      for (const collections of added) {
        if (!ExtensionMcpDiscovery._validate(collections)) {
          continue;
        }
        for (const coll of collections.value) {
          const id = extensionPrefixedIdentifier(collections.description.identifier, coll.id);
          this._extensionCollectionIdsToPersist.add(id);
          const serverDefs = this.cachedServers.hasOwnProperty(id) ? this.cachedServers[id].servers : void 0;
          const dispo = this._mcpRegistry.registerCollection({
            id,
            label: coll.label,
            remoteAuthority: null,
            isTrustedByDefault: true,
            scope: StorageScope.WORKSPACE,
            serverDefinitions: observableValue(this, serverDefs?.map(McpServerDefinition.fromSerialized) || []),
            lazy: {
              isCached: !!serverDefs,
              load: /* @__PURE__ */ __name(() => this._activateExtensionServers(coll.id), "load"),
              removed: /* @__PURE__ */ __name(() => extensionCollections.deleteAndDispose(id), "removed")
            }
          });
          extensionCollections.set(id, dispo);
        }
      }
    }));
  }
  async _activateExtensionServers(collectionId) {
    await this._extensionService.activateByEvent(mcpActivationEvent(collectionId));
    await Promise.all(this._mcpRegistry.delegates.map((r) => r.waitForInitialProviderPromises()));
  }
  static _validate(user) {
    if (!Array.isArray(user.value)) {
      user.collector.error(localize("invalidData", "Expected an array of MCP collections"));
      return false;
    }
    for (const contribution of user.value) {
      if (typeof contribution.id !== "string" || isFalsyOrWhitespace(contribution.id)) {
        user.collector.error(localize("invalidId", "Expected 'id' to be a non-empty string."));
        return false;
      }
      if (typeof contribution.label !== "string" || isFalsyOrWhitespace(contribution.label)) {
        user.collector.error(localize("invalidLabel", "Expected 'label' to be a non-empty string."));
        return false;
      }
    }
    return true;
  }
};
ExtensionMcpDiscovery = __decorateClass([
  __decorateParam(0, IMcpRegistry),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IExtensionService)
], ExtensionMcpDiscovery);
export {
  ExtensionMcpDiscovery
};
//# sourceMappingURL=extensionMcpDiscovery.js.map
