var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
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
let ContextMenuContribution = class ContextMenuContribution2 extends Disposable {
  static {
    __name(this, "ContextMenuContribution");
  }
  constructor(layoutService, contextMenuService) {
    super();
    const update = /* @__PURE__ */ __name((visible) => layoutService.activeContainer.classList.toggle("context-menu-visible", visible), "update");
    this._register(contextMenuService.onDidShowContextMenu(() => update(true)));
    this._register(contextMenuService.onDidHideContextMenu(() => update(false)));
  }
};
ContextMenuContribution = __decorate([
  __param(0, ILayoutService),
  __param(1, IContextMenuService)
], ContextMenuContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  ContextMenuContribution,
  4
  /* LifecyclePhase.Eventually */
);
//# sourceMappingURL=contextmenu.contribution.js.map
