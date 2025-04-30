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
import { DisposableMap, DisposableStore, Disposable } from "../../../../base/common/lifecycle.js";
import { ExtensionContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { FocusedViewContext } from "../../../common/contextkeys.js";
import { Extensions } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
let ExtensionAccessibilityHelpDialogContribution = class ExtensionAccessibilityHelpDialogContribution2 extends Disposable {
  static {
    __name(this, "ExtensionAccessibilityHelpDialogContribution");
  }
  static {
    this.ID = "extensionAccessibilityHelpDialogContribution";
  }
  constructor(keybindingService) {
    super();
    this._viewHelpDialogMap = this._register(new DisposableMap());
    this._register(Registry.as(Extensions.ViewsRegistry).onViewsRegistered((e) => {
      for (const view of e) {
        for (const viewDescriptor of view.views) {
          if (viewDescriptor.accessibilityHelpContent) {
            this._viewHelpDialogMap.set(viewDescriptor.id, registerAccessibilityHelpAction(keybindingService, viewDescriptor));
          }
        }
      }
    }));
    this._register(Registry.as(Extensions.ViewsRegistry).onViewsDeregistered((e) => {
      for (const viewDescriptor of e.views) {
        if (viewDescriptor.accessibilityHelpContent) {
          this._viewHelpDialogMap.get(viewDescriptor.id)?.dispose();
        }
      }
    }));
  }
};
ExtensionAccessibilityHelpDialogContribution = __decorate([
  __param(0, IKeybindingService)
], ExtensionAccessibilityHelpDialogContribution);
function registerAccessibilityHelpAction(keybindingService, viewDescriptor) {
  const disposableStore = new DisposableStore();
  const content = viewDescriptor.accessibilityHelpContent?.value;
  if (!content) {
    throw new Error("No content provided for the accessibility help dialog");
  }
  disposableStore.add(AccessibleViewRegistry.register({
    priority: 95,
    name: viewDescriptor.id,
    type: "help",
    when: FocusedViewContext.isEqualTo(viewDescriptor.id),
    getProvider: /* @__PURE__ */ __name((accessor) => {
      const viewsService = accessor.get(IViewsService);
      return new ExtensionContentProvider(viewDescriptor.id, {
        type: "help"
        /* AccessibleViewType.Help */
      }, () => content, () => viewsService.openView(viewDescriptor.id, true));
    }, "getProvider")
  }));
  disposableStore.add(keybindingService.onDidUpdateKeybindings(() => {
    disposableStore.clear();
    disposableStore.add(registerAccessibilityHelpAction(keybindingService, viewDescriptor));
  }));
  return disposableStore;
}
__name(registerAccessibilityHelpAction, "registerAccessibilityHelpAction");
export {
  ExtensionAccessibilityHelpDialogContribution
};
//# sourceMappingURL=extensionAccesibilityHelp.contribution.js.map
