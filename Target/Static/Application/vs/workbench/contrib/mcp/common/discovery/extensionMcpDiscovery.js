var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var ExtensionMcpDiscovery_1;
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { isFalsyOrWhitespace } from "../../../../../base/common/strings.js";
import { localize } from "../../../../../nls.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import * as extensionsRegistry from "../../../../services/extensions/common/extensionsRegistry.js";
import { mcpActivationEvent, mcpContributionPoint } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { extensionPrefixedIdentifier, McpServerDefinition } from "../mcpTypes.js";
const cacheKey = "mcp.extCachedServers";
const _mcpExtensionPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(mcpContributionPoint);
var PersistWhen;
(function(PersistWhen2) {
  PersistWhen2[PersistWhen2["CollectionExists"] = 0] = "CollectionExists";
  PersistWhen2[PersistWhen2["Always"] = 1] = "Always";
})(PersistWhen || (PersistWhen = {}));
let ExtensionMcpDiscovery = ExtensionMcpDiscovery_1 = class ExtensionMcpDiscovery2 extends Disposable {
  static {
    __name(this, "ExtensionMcpDiscovery");
  }
  constructor(_mcpRegistry, storageService, _extensionService, _contextKeyService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this.fromGallery = false;
    this._extensionCollectionIdsToPersist = /* @__PURE__ */ new Map();
    this._conditionalCollections = this._register(new DisposableMap());
    this.cachedServers = storageService.getObject(cacheKey, 1, {});
    this._register(storageService.onWillSaveState(() => {
      let updated = false;
      for (const [collectionId, behavior] of this._extensionCollectionIdsToPersist.entries()) {
        const collection = this._mcpRegistry.collections.get().find((c) => c.id === collectionId);
        let defs = collection?.serverDefinitions.get();
        if (!collection || collection.lazy) {
          if (behavior === 1) {
            defs = [];
          } else {
            continue;
          }
        }
        if (defs) {
          updated = true;
          this.cachedServers[collectionId] = { servers: defs.map(McpServerDefinition.toSerialized) };
        }
      }
      if (updated) {
        storageService.store(
          cacheKey,
          this.cachedServers,
          1,
          1
          /* StorageTarget.MACHINE */
        );
      }
    }));
  }
  start() {
    const extensionCollections = this._register(new DisposableMap());
    this._register(_mcpExtensionPoint.setHandler((_extensions, delta) => {
      const { added, removed } = delta;
      for (const collections of removed) {
        for (const coll of collections.value) {
          const id = extensionPrefixedIdentifier(collections.description.identifier, coll.id);
          extensionCollections.deleteAndDispose(id);
          this._conditionalCollections.deleteAndDispose(id);
        }
      }
      for (const collections of added) {
        if (!ExtensionMcpDiscovery_1._validate(collections)) {
          continue;
        }
        for (const coll of collections.value) {
          const id = extensionPrefixedIdentifier(collections.description.identifier, coll.id);
          this._extensionCollectionIdsToPersist.set(
            id,
            0
            /* PersistWhen.CollectionExists */
          );
          if (coll.when) {
            this._registerConditionalCollection(id, coll, collections, extensionCollections);
          } else {
            this._registerCollection(id, coll, collections, extensionCollections);
          }
        }
      }
    }));
  }
  _registerCollection(id, coll, collections, extensionCollections) {
    const serverDefs = this.cachedServers.hasOwnProperty(id) ? this.cachedServers[id].servers : void 0;
    const dispo = this._mcpRegistry.registerCollection({
      id,
      label: coll.label,
      remoteAuthority: null,
      trustBehavior: 0,
      scope: 1,
      configTarget: 2,
      serverDefinitions: observableValue(this, serverDefs?.map(McpServerDefinition.fromSerialized) || []),
      lazy: {
        isCached: !!serverDefs,
        load: /* @__PURE__ */ __name(() => this._activateExtensionServers(coll.id).then(() => {
          this._extensionCollectionIdsToPersist.set(
            id,
            1
            /* PersistWhen.Always */
          );
        }), "load"),
        removed: /* @__PURE__ */ __name(() => {
          extensionCollections.deleteAndDispose(id);
          this._conditionalCollections.deleteAndDispose(id);
        }, "removed")
      },
      source: collections.description.identifier
    });
    extensionCollections.set(id, dispo);
  }
  _registerConditionalCollection(id, coll, collections, extensionCollections) {
    const whenClause = ContextKeyExpr.deserialize(coll.when);
    if (!whenClause) {
      return;
    }
    const evaluate = /* @__PURE__ */ __name(() => {
      const nowSatisfied = this._contextKeyService.contextMatchesRules(whenClause);
      const isRegistered = extensionCollections.has(id);
      if (nowSatisfied && !isRegistered) {
        this._registerCollection(id, coll, collections, extensionCollections);
      } else if (!nowSatisfied && isRegistered) {
        extensionCollections.deleteAndDispose(id);
      }
    }, "evaluate");
    const contextKeyListener = this._contextKeyService.onDidChangeContext(evaluate);
    evaluate();
    this._conditionalCollections.set(id, contextKeyListener);
  }
  async _activateExtensionServers(collectionId) {
    await this._extensionService.activateByEvent(mcpActivationEvent(collectionId));
    await Promise.all(this._mcpRegistry.delegates.get().map((r) => r.waitForInitialProviderPromises()));
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
      if (contribution.when !== void 0 && (typeof contribution.when !== "string" || isFalsyOrWhitespace(contribution.when))) {
        user.collector.error(localize("invalidWhen", "Expected 'when' to be a non-empty string."));
        return false;
      }
    }
    return true;
  }
};
ExtensionMcpDiscovery = ExtensionMcpDiscovery_1 = __decorate([
  __param(0, IMcpRegistry),
  __param(1, IStorageService),
  __param(2, IExtensionService),
  __param(3, IContextKeyService)
], ExtensionMcpDiscovery);
export {
  ExtensionMcpDiscovery
};
//# sourceMappingURL=extensionMcpDiscovery.js.map
