var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { score } from "../../../../editor/common/languageSelector.js";
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ToggleTitleBarConfigAction } from "../../../browser/parts/titlebar/titlebarActions.js";
import { IsCompactTitleBarContext, WorkspaceFolderCountContext } from "../../../common/contextkeys.js";
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
const ShareProviderCountContext = new RawContextKey("shareProviderCount", 0, localize("shareProviderCount", "The number of available share providers"));
let ShareService = class ShareService2 {
  static {
    __name(this, "ShareService");
  }
  constructor(contextKeyService, labelService, quickInputService, codeEditorService, telemetryService) {
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.quickInputService = quickInputService;
    this.codeEditorService = codeEditorService;
    this.telemetryService = telemetryService;
    this._providers = /* @__PURE__ */ new Set();
    this.providerCount = ShareProviderCountContext.bindTo(this.contextKeyService);
  }
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
ShareService = __decorate([
  __param(0, IContextKeyService),
  __param(1, ILabelService),
  __param(2, IQuickInputService),
  __param(3, ICodeEditorService),
  __param(4, ITelemetryService)
], ShareService);
registerAction2(class ToggleShareControl extends ToggleTitleBarConfigAction {
  static {
    __name(this, "ToggleShareControl");
  }
  constructor() {
    super("workbench.experimental.share.enabled", localize("toggle.share", "Share"), localize("toggle.shareDescription", "Toggle visibility of the Share action in title bar"), 3, ContextKeyExpr.and(IsCompactTitleBarContext.toNegated(), ContextKeyExpr.has("config.window.commandCenter"), ContextKeyExpr.and(ShareProviderCountContext.notEqualsTo(0), WorkspaceFolderCountContext.notEqualsTo(0))));
  }
});
export {
  ShareProviderCountContext,
  ShareService
};
//# sourceMappingURL=shareService.js.map
