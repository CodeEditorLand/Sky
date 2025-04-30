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
import { IChatWidgetService } from "./chat.js";
import { ChatDynamicVariableModel } from "./contrib/chatDynamicVariables.js";
let ChatVariablesService = class ChatVariablesService2 {
  static {
    __name(this, "ChatVariablesService");
  }
  constructor(chatWidgetService) {
    this.chatWidgetService = chatWidgetService;
  }
  getDynamicVariables(sessionId) {
    const widget = this.chatWidgetService.getWidgetBySessionId(sessionId);
    if (!widget || !widget.viewModel || !widget.supportsFileReferences) {
      return [];
    }
    const model = widget.getContrib(ChatDynamicVariableModel.ID);
    if (!model) {
      return [];
    }
    return model.variables;
  }
  getSelectedTools(sessionId) {
    const widget = this.chatWidgetService.getWidgetBySessionId(sessionId);
    if (!widget) {
      return [];
    }
    return widget.input.selectedToolsModel.tools.get();
  }
};
ChatVariablesService = __decorate([
  __param(0, IChatWidgetService)
], ChatVariablesService);
export {
  ChatVariablesService
};
//# sourceMappingURL=chatVariables.js.map
