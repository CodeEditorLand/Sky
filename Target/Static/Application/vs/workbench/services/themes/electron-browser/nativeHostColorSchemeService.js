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
var NativeHostColorSchemeService_1;
import { Emitter } from "../../../../base/common/event.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IHostColorSchemeService } from "../common/hostColorSchemeService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { isBoolean, isObject } from "../../../../base/common/types.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
let NativeHostColorSchemeService = class NativeHostColorSchemeService2 extends Disposable {
  static {
    __name(this, "NativeHostColorSchemeService");
  }
  static {
    NativeHostColorSchemeService_1 = this;
  }
  static {
    this.STORAGE_KEY = "HostColorSchemeData";
  }
  constructor(nativeHostService, environmentService, storageService, lifecycleService) {
    super();
    this.nativeHostService = nativeHostService;
    this.storageService = storageService;
    this._onDidChangeColorScheme = this._register(new Emitter());
    this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
    this._register(this.nativeHostService.onDidChangeColorScheme((scheme) => this.update(scheme)));
    let initial = environmentService.window.colorScheme;
    if (lifecycleService.startupKind === 3) {
      initial = this.getStoredValue(initial);
    }
    this.dark = initial.dark;
    this.highContrast = initial.highContrast;
    this.nativeHostService.getOSColorScheme().then((scheme) => this.update(scheme));
  }
  getStoredValue(dftl) {
    const stored = this.storageService.get(
      NativeHostColorSchemeService_1.STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (stored) {
      try {
        const scheme = JSON.parse(stored);
        if (isObject(scheme) && isBoolean(scheme.highContrast) && isBoolean(scheme.dark)) {
          return scheme;
        }
      } catch (e) {
      }
    }
    return dftl;
  }
  update({ highContrast, dark }) {
    if (dark !== this.dark || highContrast !== this.highContrast) {
      this.dark = dark;
      this.highContrast = highContrast;
      this.storageService.store(
        NativeHostColorSchemeService_1.STORAGE_KEY,
        JSON.stringify({ highContrast, dark }),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
      this._onDidChangeColorScheme.fire();
    }
  }
};
NativeHostColorSchemeService = NativeHostColorSchemeService_1 = __decorate([
  __param(0, INativeHostService),
  __param(1, INativeWorkbenchEnvironmentService),
  __param(2, IStorageService),
  __param(3, ILifecycleService)
], NativeHostColorSchemeService);
registerSingleton(
  IHostColorSchemeService,
  NativeHostColorSchemeService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeHostColorSchemeService
};
//# sourceMappingURL=nativeHostColorSchemeService.js.map
