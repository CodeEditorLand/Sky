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
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { discoverySourceLabel, mcpDiscoverySection } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { ClaudeDesktopMpcDiscoveryAdapter, CursorDesktopMpcDiscoveryAdapter, WindsurfDesktopMpcDiscoveryAdapter } from "./nativeMcpDiscoveryAdapters.js";
let FilesystemMcpDiscovery = class FilesystemMcpDiscovery2 extends Disposable {
  static {
    __name(this, "FilesystemMcpDiscovery");
  }
  constructor(configurationService, _fileService, _mcpRegistry) {
    super();
    this._fileService = _fileService;
    this._mcpRegistry = _mcpRegistry;
    this.fromGallery = false;
    this._fsDiscoveryEnabled = observableConfigValue(mcpDiscoverySection, void 0, configurationService);
  }
  _isDiscoveryEnabled(reader, discoverySource) {
    const fsDiscovery = this._fsDiscoveryEnabled.read(reader);
    if (typeof fsDiscovery === "boolean") {
      return fsDiscovery;
    }
    if (discoverySource && fsDiscovery?.[discoverySource] === true) {
      return true;
    }
    return false;
  }
  watchFile(file, collection, discoverySource, adaptFile) {
    const store = new DisposableStore();
    const collectionRegistration = store.add(new MutableDisposable());
    const updateFile = /* @__PURE__ */ __name(async () => {
      let definitions = [];
      try {
        const contents = await this._fileService.readFile(file);
        definitions = await adaptFile(contents.value) || [];
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
    store.add(autorun((reader) => {
      if (!this._isDiscoveryEnabled(reader, discoverySource)) {
        collectionRegistration.clear();
        return;
      }
      const throttler = reader.store.add(new RunOnceScheduler(updateFile, 500));
      const watcher = reader.store.add(this._fileService.createWatcher(file, { recursive: false, excludes: [] }));
      reader.store.add(watcher.onDidChange(() => throttler.schedule()));
      updateFile();
    }));
    return store;
  }
};
FilesystemMcpDiscovery = __decorate([
  __param(0, IConfigurationService),
  __param(1, IFileService),
  __param(2, IMcpRegistry)
], FilesystemMcpDiscovery);
let NativeFilesystemMcpDiscovery = class NativeFilesystemMcpDiscovery2 extends FilesystemMcpDiscovery {
  static {
    __name(this, "NativeFilesystemMcpDiscovery");
  }
  constructor(remoteAuthority, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(configurationService, fileService, mcpRegistry);
    this.suffix = "";
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
        configTarget: 2,
        scope: 0,
        trustBehavior: 1,
        serverDefinitions: observableValue(this, []),
        presentation: {
          origin: file,
          order: adapter.order + (adapter.remoteAuthority ? -50 : 0)
        }
      };
      this._register(this.watchFile(file, collection, adapter.discoverySource, (contents) => adapter.adaptFile(contents, details)));
    }
  }
};
NativeFilesystemMcpDiscovery = __decorate([
  __param(1, ILabelService),
  __param(2, IFileService),
  __param(3, IInstantiationService),
  __param(4, IMcpRegistry),
  __param(5, IConfigurationService)
], NativeFilesystemMcpDiscovery);
export {
  FilesystemMcpDiscovery,
  NativeFilesystemMcpDiscovery
};
//# sourceMappingURL=nativeMcpDiscoveryAbstract.js.map
