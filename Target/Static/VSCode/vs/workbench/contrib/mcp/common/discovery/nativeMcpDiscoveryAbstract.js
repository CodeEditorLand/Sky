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
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorunWithStore, IObservable, IReader, ISettableObservable, observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { INativeMcpDiscoveryData } from "../../../../../platform/mcp/common/nativeMcpDiscoveryHelper.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { StorageScope } from "../../../../../platform/storage/common/storage.js";
import { Dto } from "../../../../services/extensions/common/proxyIdentifier.js";
import { DiscoverySource, discoverySourceLabel, mcpDiscoverySection } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { McpCollectionDefinition, McpCollectionSortOrder, McpServerDefinition } from "../mcpTypes.js";
import { IMcpDiscovery } from "./mcpDiscovery.js";
import { ClaudeDesktopMpcDiscoveryAdapter, CursorDesktopMpcDiscoveryAdapter, NativeMpcDiscoveryAdapter, WindsurfDesktopMpcDiscoveryAdapter } from "./nativeMcpDiscoveryAdapters.js";
let FilesystemMcpDiscovery = class extends Disposable {
  constructor(configurationService, _fileService, _mcpRegistry) {
    super();
    this._fileService = _fileService;
    this._mcpRegistry = _mcpRegistry;
    this._fsDiscoveryEnabled = observableConfigValue(mcpDiscoverySection, true, configurationService);
  }
  static {
    __name(this, "FilesystemMcpDiscovery");
  }
  _fsDiscoveryEnabled;
  _isDiscoveryEnabled(reader, discoverySource) {
    const fsDiscovery = this._fsDiscoveryEnabled.read(reader);
    if (typeof fsDiscovery === "boolean") {
      return fsDiscovery;
    }
    if (discoverySource && fsDiscovery[discoverySource] === false) {
      return false;
    }
    return true;
  }
  watchFile(file, collection, discoverySource, adaptFile) {
    const store = new DisposableStore();
    const collectionRegistration = store.add(new MutableDisposable());
    const updateFile = /* @__PURE__ */ __name(async () => {
      let definitions = [];
      try {
        const contents = await this._fileService.readFile(file);
        definitions = adaptFile(contents.value) || [];
      } catch {
      }
      if (!definitions.length) {
        collectionRegistration.clear();
      } else {
        collection.serverDefinitions.set(definitions, void 0);
        if (!collectionRegistration.value) {
          collectionRegistration.value = this._mcpRegistry.registerCollection(collection);
        }
      }
    }, "updateFile");
    store.add(autorunWithStore((reader, store2) => {
      if (!this._isDiscoveryEnabled(reader, discoverySource)) {
        collectionRegistration.clear();
        return;
      }
      const throttler = store2.add(new RunOnceScheduler(updateFile, 500));
      const watcher = store2.add(this._fileService.createWatcher(file, { recursive: false, excludes: [] }));
      store2.add(watcher.onDidChange(() => throttler.schedule()));
      updateFile();
    }));
    return store;
  }
};
FilesystemMcpDiscovery = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IMcpRegistry)
], FilesystemMcpDiscovery);
let NativeFilesystemMcpDiscovery = class extends FilesystemMcpDiscovery {
  static {
    __name(this, "NativeFilesystemMcpDiscovery");
  }
  adapters;
  suffix = "";
  constructor(remoteAuthority, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(configurationService, fileService, mcpRegistry);
    if (remoteAuthority) {
      this.suffix = " " + localize("onRemoteLabel", " on {0}", labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority));
    }
    this.adapters = [
      instantiationService.createInstance(ClaudeDesktopMpcDiscoveryAdapter, remoteAuthority),
      instantiationService.createInstance(CursorDesktopMpcDiscoveryAdapter, remoteAuthority),
      instantiationService.createInstance(WindsurfDesktopMpcDiscoveryAdapter, remoteAuthority)
    ];
  }
  setDetails(detailsDto) {
    if (!detailsDto) {
      return;
    }
    const details = {
      ...detailsDto,
      homedir: URI.revive(detailsDto.homedir),
      xdgHome: detailsDto.xdgHome ? URI.revive(detailsDto.xdgHome) : void 0,
      winAppData: detailsDto.winAppData ? URI.revive(detailsDto.winAppData) : void 0
    };
    for (const adapter of this.adapters) {
      const file = adapter.getFilePath(details);
      if (!file) {
        continue;
      }
      const collection = {
        id: adapter.id,
        label: discoverySourceLabel[adapter.discoverySource] + this.suffix,
        remoteAuthority: adapter.remoteAuthority,
        scope: StorageScope.PROFILE,
        isTrustedByDefault: false,
        serverDefinitions: observableValue(this, []),
        presentation: {
          origin: file,
          order: adapter.order + (adapter.remoteAuthority ? McpCollectionSortOrder.RemoteBoost : 0)
        }
      };
      this._register(this.watchFile(file, collection, adapter.discoverySource, (contents) => adapter.adaptFile(contents, details)));
    }
  }
};
NativeFilesystemMcpDiscovery = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IMcpRegistry),
  __decorateParam(5, IConfigurationService)
], NativeFilesystemMcpDiscovery);
export {
  FilesystemMcpDiscovery,
  NativeFilesystemMcpDiscovery
};
//# sourceMappingURL=nativeMcpDiscoveryAbstract.js.map
