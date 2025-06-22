var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ListResizeColumnAction } from "./listResizeColumnAction.js";
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
let ListContext = class ListContext2 {
  static {
    __name(this, "ListContext");
  }
  static {
    this.ID = "workbench.contrib.listContext";
  }
  constructor(contextKeyService) {
    contextKeyService.createKey("listSupportsTypeNavigation", true);
    contextKeyService.createKey("listSupportsKeyboardNavigation", true);
  }
};
ListContext = __decorate([
  __param(0, IContextKeyService)
], ListContext);
registerWorkbenchContribution2(
  ListContext.ID,
  ListContext,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerAction2(ListResizeColumnAction);
export {
  ListContext
};
//# sourceMappingURL=list.contribution.js.map
