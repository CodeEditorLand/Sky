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
import { getPromptsTypeForLanguageId } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { isGithubTarget } from "./promptValidator.js";
let PromptDocumentSemanticTokensProvider = class PromptDocumentSemanticTokensProvider2 {
  static {
    __name(this, "PromptDocumentSemanticTokensProvider");
  }
  constructor(promptsService) {
    this.promptsService = promptsService;
    this._debugDisplayName = "PromptDocumentSemanticTokensProvider";
  }
  provideDocumentSemanticTokens(model, lastResultId, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    if (!promptAST.body) {
      return void 0;
    }
    if (isGithubTarget(promptType, promptAST.header?.target)) {
      return void 0;
    }
    const variableReferences = promptAST.body.variableReferences;
    if (!variableReferences.length) {
      return void 0;
    }
    const data = [];
    let lastLine = 0;
    let lastChar = 0;
    const ordered = [...variableReferences].sort((a, b) => a.range.startLineNumber === b.range.startLineNumber ? a.range.startColumn - b.range.startColumn : a.range.startLineNumber - b.range.startLineNumber);
    for (const ref of ordered) {
      const extraCharCount = "#tool:".length;
      const line = ref.range.startLineNumber - 1;
      const char = ref.range.startColumn - extraCharCount - 1;
      const length = ref.range.endColumn - ref.range.startColumn + extraCharCount;
      const deltaLine = line - lastLine;
      const deltaChar = deltaLine === 0 ? char - lastChar : char;
      data.push(
        deltaLine,
        deltaChar,
        length,
        0,
        0
        /* no modifiers */
      );
      lastLine = line;
      lastChar = char;
      if (token.isCancellationRequested) {
        break;
      }
    }
    return { data: new Uint32Array(data) };
  }
  getLegend() {
    return { tokenTypes: ["variable"], tokenModifiers: [] };
  }
  releaseDocumentSemanticTokens(resultId) {
  }
};
PromptDocumentSemanticTokensProvider = __decorate([
  __param(0, IPromptsService)
], PromptDocumentSemanticTokensProvider);
export {
  PromptDocumentSemanticTokensProvider
};
//# sourceMappingURL=promptDocumentSemanticTokensProvider.js.map
