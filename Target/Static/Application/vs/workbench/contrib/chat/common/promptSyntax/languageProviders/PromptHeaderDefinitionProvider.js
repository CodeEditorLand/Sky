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
import { Range } from "../../../../../../editor/common/core/range.js";
import { IChatModeService } from "../../chatModes.js";
import { getPromptsTypeForLanguageId } from "../promptTypes.js";
import { PromptHeaderAttributes } from "../promptFileParser.js";
import { IPromptsService } from "../service/promptsService.js";
let PromptHeaderDefinitionProvider = class PromptHeaderDefinitionProvider2 {
  static {
    __name(this, "PromptHeaderDefinitionProvider");
  }
  constructor(promptsService, chatModeService) {
    this.promptsService = promptsService;
    this.chatModeService = chatModeService;
    this._debugDisplayName = "PromptHeaderDefinitionProvider";
  }
  async provideDefinition(model, position, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    const header = promptAST.header;
    if (!header) {
      return void 0;
    }
    const agentAttr = header.getAttribute(PromptHeaderAttributes.agent) ?? header.getAttribute(PromptHeaderAttributes.mode);
    if (agentAttr && agentAttr.value.type === "scalar" && agentAttr.range.containsPosition(position)) {
      const agent = this.chatModeService.findModeByName(agentAttr.value.value);
      if (agent && agent.uri) {
        return {
          uri: agent.uri.get(),
          range: new Range(1, 1, 1, 1)
        };
      }
    }
    return void 0;
  }
};
PromptHeaderDefinitionProvider = __decorate([
  __param(0, IPromptsService),
  __param(1, IChatModeService)
], PromptHeaderDefinitionProvider);
export {
  PromptHeaderDefinitionProvider
};
//# sourceMappingURL=PromptHeaderDefinitionProvider.js.map
