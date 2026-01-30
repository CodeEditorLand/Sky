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
import { IChatWidgetService } from "../chat.js";
import { ChatDynamicVariableModel } from "./chatDynamicVariables.js";
import { Range } from "../../../../../editor/common/core/range.js";
let ChatVariablesService = class ChatVariablesService2 {
  static {
    __name(this, "ChatVariablesService");
  }
  constructor(chatWidgetService) {
    this.chatWidgetService = chatWidgetService;
  }
  getDynamicVariables(sessionResource) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget || !widget.viewModel || !widget.supportsFileReferences) {
      return [];
    }
    const model = widget.getContrib(ChatDynamicVariableModel.ID);
    if (!model) {
      return [];
    }
    if (widget.input.attachmentModel.attachments.length > 0 && widget.viewModel.editing) {
      const references = [];
      for (const attachment of widget.input.attachmentModel.attachments) {
        if (attachment.range) {
          const referenceObj = {
            id: attachment.id,
            fullName: attachment.name,
            modelDescription: attachment.modelDescription,
            range: new Range(1, attachment.range.start + 1, 1, attachment.range.endExclusive + 1),
            icon: attachment.icon,
            isFile: attachment.kind === "file",
            isDirectory: attachment.kind === "directory",
            data: attachment.value
          };
          references.push(referenceObj);
        }
      }
      return [...model.variables, ...references];
    }
    return model.variables;
  }
  getSelectedToolAndToolSets(sessionResource) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return /* @__PURE__ */ new Map();
    }
    return widget.input.selectedToolsModel.entriesMap.get();
  }
};
ChatVariablesService = __decorate([
  __param(0, IChatWidgetService)
], ChatVariablesService);
export {
  ChatVariablesService
};
//# sourceMappingURL=chatVariables.js.map
