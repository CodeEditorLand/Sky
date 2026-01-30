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
import { IPromptsService } from "../service/promptsService.js";
let PromptLinkProvider = class PromptLinkProvider2 {
  static {
    __name(this, "PromptLinkProvider");
  }
  constructor(promptsService) {
    this.promptsService = promptsService;
  }
  /**
   * Provide list of links for the provided text model.
   */
  async provideLinks(model, token) {
    const promptAST = this.promptsService.getParsedPromptFile(model);
    if (!promptAST.body) {
      return;
    }
    const links = [];
    for (const ref of promptAST.body.fileReferences) {
      if (!ref.isMarkdownLink) {
        const url = promptAST.body.resolveFilePath(ref.content);
        if (url) {
          links.push({ range: ref.range, url });
        }
      }
    }
    return { links };
  }
};
PromptLinkProvider = __decorate([
  __param(0, IPromptsService)
], PromptLinkProvider);
export {
  PromptLinkProvider
};
//# sourceMappingURL=promptLinkProvider.js.map
