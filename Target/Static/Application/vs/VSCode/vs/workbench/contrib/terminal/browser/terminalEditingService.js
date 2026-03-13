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
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { TERMINAL_VIEW_ID } from "../common/terminal.js";
let TerminalEditingService = class TerminalEditingService2 {
  static {
    __name(this, "TerminalEditingService");
  }
  constructor(_viewsService) {
    this._viewsService = _viewsService;
  }
  getEditableData(instance) {
    return this._editable && this._editable.instance === instance ? this._editable.data : void 0;
  }
  setEditable(instance, data) {
    if (!data) {
      this._editable = void 0;
    } else {
      this._editable = { instance, data };
    }
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    const isEditing = this.isEditable(instance);
    pane?.terminalTabbedView?.setEditable(isEditing);
  }
  isEditable(instance) {
    return !!this._editable && (this._editable.instance === instance || !instance);
  }
  getEditingTerminal() {
    return this._editingTerminal;
  }
  setEditingTerminal(instance) {
    this._editingTerminal = instance;
  }
};
TerminalEditingService = __decorate([
  __param(0, IViewsService)
], TerminalEditingService);
export {
  TerminalEditingService
};
//# sourceMappingURL=terminalEditingService.js.map
