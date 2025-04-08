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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { score } from "../../../../editor/common/languageSelector.js";
import { localize } from "../../../../nls.js";
import { ISubmenuItem, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IQuickInputService, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ToggleTitleBarConfigAction } from "../../../browser/parts/titlebar/titlebarActions.js";
import { WorkspaceFolderCountContext } from "../../../common/contextkeys.js";
import { IShareProvider, IShareService, IShareableItem } from "../common/share.js";
const ShareProviderCountContext = new RawContextKey("shareProviderCount", 0, localize("shareProviderCount", "The number of available share providers"));
let ShareService = class {
  constructor(contextKeyService, labelService, quickInputService, codeEditorService, telemetryService) {
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.quickInputService = quickInputService;
    this.codeEditorService = codeEditorService;
    this.telemetryService = telemetryService;
    this.providerCount = ShareProviderCountContext.bindTo(this.contextKeyService);
  }
  static {
    __name(this, "ShareService");
  }
  _serviceBrand;
  providerCount;
  _providers = /* @__PURE__ */ new Set();
  registerShareProvider(provider) {
    this._providers.add(provider);
    this.providerCount.set(this._providers.size);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._providers.delete(provider);
        this.providerCount.set(this._providers.size);
      }, "dispose")
    };
  }
  getShareActions() {
    return [];
  }
  async provideShare(item, token) {
    const language = this.codeEditorService.getActiveCodeEditor()?.getModel()?.getLanguageId() ?? "";
    const providers = [...this._providers.values()].filter((p) => score(p.selector, item.resourceUri, language, true, void 0, void 0) > 0).sort((a, b) => a.priority - b.priority);
    if (providers.length === 0) {
      return void 0;
    }
    if (providers.length === 1) {
      this.telemetryService.publicLog2("shareService.share", { providerId: providers[0].id });
      return providers[0].provideShare(item, token);
    }
    const items = providers.map((p) => ({ label: p.label, provider: p }));
    const selected = await this.quickInputService.pick(items, { canPickMany: false, placeHolder: localize("type to filter", "Choose how to share {0}", this.labelService.getUriLabel(item.resourceUri)) }, token);
    if (selected !== void 0) {
      this.telemetryService.publicLog2("shareService.share", { providerId: selected.provider.id });
      return selected.provider.provideShare(item, token);
    }
    return;
  }
};
ShareService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITelemetryService)
], ShareService);
registerAction2(class ToggleShareControl extends ToggleTitleBarConfigAction {
  static {
    __name(this, "ToggleShareControl");
  }
  constructor() {
    super("workbench.experimental.share.enabled", localize("toggle.share", "Share"), localize("toggle.shareDescription", "Toggle visibility of the Share action in title bar"), 3, false, ContextKeyExpr.and(ContextKeyExpr.has("config.window.commandCenter"), ContextKeyExpr.and(ShareProviderCountContext.notEqualsTo(0), WorkspaceFolderCountContext.notEqualsTo(0))));
  }
});
export {
  ShareProviderCountContext,
  ShareService
};
//# sourceMappingURL=shareService.js.map
