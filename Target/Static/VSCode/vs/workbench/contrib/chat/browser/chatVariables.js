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
import { coalesce } from "../../../../base/common/arrays.js";
import { URI } from "../../../../base/common/uri.js";
import { Location } from "../../../../editor/common/languages.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IChatRequestVariableData, IChatRequestVariableEntry } from "../common/chatModel.js";
import { ChatRequestDynamicVariablePart, ChatRequestToolPart, IParsedChatRequest } from "../common/chatParserTypes.js";
import { IChatVariablesService, IDynamicVariable } from "../common/chatVariables.js";
import { ChatAgentLocation } from "../common/constants.js";
import { IChatWidgetService, showChatView } from "./chat.js";
import { ChatDynamicVariableModel } from "./contrib/chatDynamicVariables.js";
let ChatVariablesService = class {
  constructor(chatWidgetService, viewsService) {
    this.chatWidgetService = chatWidgetService;
    this.viewsService = viewsService;
  }
  static {
    __name(this, "ChatVariablesService");
  }
  resolveVariables(prompt, attachedContextVariables) {
    let resolvedVariables = [];
    prompt.parts.forEach((part, i) => {
      if (part instanceof ChatRequestDynamicVariablePart || part instanceof ChatRequestToolPart) {
        resolvedVariables[i] = part.toVariableEntry();
      }
    });
    resolvedVariables = coalesce(resolvedVariables);
    resolvedVariables.sort((a, b) => b.range.start - a.range.start);
    if (attachedContextVariables) {
      resolvedVariables.push(...attachedContextVariables);
    }
    return {
      variables: resolvedVariables
    };
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
  async attachContext(name, value, location) {
    if (location !== ChatAgentLocation.Panel) {
      return;
    }
    const widget = this.chatWidgetService.lastFocusedWidget ?? await showChatView(this.viewsService);
    if (!widget || !widget.viewModel) {
      return;
    }
    const key = name.toLowerCase();
    if (key === "file" && typeof value !== "string") {
      const uri = URI.isUri(value) ? value : value.uri;
      const range = "range" in value ? value.range : void 0;
      await widget.attachmentModel.addFile(uri, range);
      return;
    }
    if (key === "folder" && URI.isUri(value)) {
      widget.attachmentModel.addFolder(value);
      return;
    }
  }
};
ChatVariablesService = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IViewsService)
], ChatVariablesService);
export {
  ChatVariablesService
};
//# sourceMappingURL=chatVariables.js.map
