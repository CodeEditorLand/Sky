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
import { URI } from "../../../../base/common/uri.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { IQuickDiffService, QuickDiff, QuickDiffProvider } from "./quickDiff.js";
import { isEqualOrParent } from "../../../../base/common/resources.js";
import { score } from "../../../../editor/common/languageSelector.js";
import { Emitter } from "../../../../base/common/event.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
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
      return a.rootUri.fsPath.length - b.rootUri.fsPath.length;
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
let QuickDiffService = class extends Disposable {
  constructor(uriIdentityService) {
    super();
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "QuickDiffService");
  }
  quickDiffProviders = /* @__PURE__ */ new Set();
  _onDidChangeQuickDiffProviders = this._register(new Emitter());
  onDidChangeQuickDiffProviders = this._onDidChangeQuickDiffProviders.event;
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
  isQuickDiff(diff) {
    return !!diff.originalResource && typeof diff.label === "string" && typeof diff.isSCM === "boolean";
  }
  async getQuickDiffs(uri, language = "", isSynchronized = false) {
    const providers = Array.from(this.quickDiffProviders).filter((provider) => !provider.rootUri || this.uriIdentityService.extUri.isEqualOrParent(uri, provider.rootUri)).sort(createProviderComparer(uri));
    const diffs = await Promise.all(providers.map(async (provider) => {
      const scoreValue = provider.selector ? score(provider.selector, uri, language, isSynchronized, void 0, void 0) : 10;
      const diff = {
        originalResource: scoreValue > 0 ? await provider.getOriginalResource(uri) ?? void 0 : void 0,
        label: provider.label,
        isSCM: provider.isSCM,
        visible: provider.visible
      };
      return diff;
    }));
    return diffs.filter(this.isQuickDiff);
  }
};
QuickDiffService = __decorateClass([
  __decorateParam(0, IUriIdentityService)
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
