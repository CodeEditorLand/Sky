var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isEqualOrParent } from "../../../../base/common/resources.js";
import { score } from "../../../../editor/common/languageSelector.js";
import { Emitter } from "../../../../base/common/event.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
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
var QuickDiffService_1;
function createProviderComparer(uri) {
  return (a, b) => {
    if (a.rootUri && !b.rootUri) {
      return -1;
    } else if (!a.rootUri && b.rootUri) {
      return 1;
    } else if (!a.rootUri && !b.rootUri) {
      return 0;
    }
    const aIsParent = isEqualOrParent(uri, a.rootUri);
    const bIsParent = isEqualOrParent(uri, b.rootUri);
    if (aIsParent && bIsParent) {
      return providerComparer(a, b);
    } else if (aIsParent) {
      return -1;
    } else if (bIsParent) {
      return 1;
    } else {
      return 0;
    }
  };
}
__name(createProviderComparer, "createProviderComparer");
function providerComparer(a, b) {
  if (a.kind === "primary") {
    return -1;
  } else if (b.kind === "primary") {
    return 1;
  } else if (a.kind === "secondary") {
    return -1;
  } else if (b.kind === "secondary") {
    return 1;
  }
  return 0;
}
__name(providerComparer, "providerComparer");
let QuickDiffService = class QuickDiffService2 extends Disposable {
  static {
    __name(this, "QuickDiffService");
  }
  static {
    QuickDiffService_1 = this;
  }
  static {
    this.STORAGE_KEY = "workbench.scm.quickDiffProviders.hidden";
  }
  get providers() {
    return Array.from(this.quickDiffProviders).sort(providerComparer);
  }
  constructor(storageService, uriIdentityService) {
    super();
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.quickDiffProviders = /* @__PURE__ */ new Set();
    this._onDidChangeQuickDiffProviders = this._register(new Emitter());
    this.onDidChangeQuickDiffProviders = this._onDidChangeQuickDiffProviders.event;
    this.hiddenQuickDiffProviders = /* @__PURE__ */ new Set();
    this.loadState();
  }
  addQuickDiffProvider(quickDiff) {
    this.quickDiffProviders.add(quickDiff);
    this._onDidChangeQuickDiffProviders.fire();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.quickDiffProviders.delete(quickDiff);
        this._onDidChangeQuickDiffProviders.fire();
      }, "dispose")
    };
  }
  async getQuickDiffs(uri, language = "", isSynchronized = false) {
    const providers = Array.from(this.quickDiffProviders).filter((provider) => !provider.rootUri || this.uriIdentityService.extUri.isEqualOrParent(uri, provider.rootUri)).sort(createProviderComparer(uri));
    const quickDiffOriginalResources = await Promise.allSettled(providers.map(async (provider) => {
      const scoreValue = provider.selector ? score(provider.selector, uri, language, isSynchronized, void 0, void 0) : 10;
      const originalResource = scoreValue > 0 ? await provider.getOriginalResource(uri) ?? void 0 : void 0;
      return { provider, originalResource };
    }));
    const quickDiffs = [];
    for (const quickDiffOriginalResource of quickDiffOriginalResources) {
      if (quickDiffOriginalResource.status === "rejected") {
        continue;
      }
      const { provider, originalResource } = quickDiffOriginalResource.value;
      if (!originalResource) {
        continue;
      }
      quickDiffs.push({
        id: provider.id,
        label: provider.label,
        kind: provider.kind,
        originalResource
      });
    }
    return quickDiffs;
  }
  toggleQuickDiffProviderVisibility(id) {
    if (this.isQuickDiffProviderVisible(id)) {
      this.hiddenQuickDiffProviders.add(id);
    } else {
      this.hiddenQuickDiffProviders.delete(id);
    }
    this.saveState();
    this._onDidChangeQuickDiffProviders.fire();
  }
  isQuickDiffProviderVisible(id) {
    return !this.hiddenQuickDiffProviders.has(id);
  }
  loadState() {
    const raw = this.storageService.get(
      QuickDiffService_1.STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (raw) {
      try {
        this.hiddenQuickDiffProviders = new Set(JSON.parse(raw));
      } catch {
      }
    }
  }
  saveState() {
    if (this.hiddenQuickDiffProviders.size === 0) {
      this.storageService.remove(
        QuickDiffService_1.STORAGE_KEY,
        0
        /* StorageScope.PROFILE */
      );
    } else {
      this.storageService.store(
        QuickDiffService_1.STORAGE_KEY,
        JSON.stringify(Array.from(this.hiddenQuickDiffProviders)),
        0,
        0
        /* StorageTarget.USER */
      );
    }
  }
};
QuickDiffService = QuickDiffService_1 = __decorate([
  __param(0, IStorageService),
  __param(1, IUriIdentityService)
], QuickDiffService);
async function getOriginalResource(quickDiffService, uri, language, isSynchronized) {
  const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
  return quickDiffs.length > 0 ? quickDiffs[0].originalResource : null;
}
__name(getOriginalResource, "getOriginalResource");
export {
  QuickDiffService,
  getOriginalResource
};
//# sourceMappingURL=quickDiffService.js.map
