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
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { ILanguageModelToolsService } from "../../common/tools/languageModelToolsService.js";
import { PromptHeaderAttributes } from "../../common/promptSyntax/promptFileParser.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
let PromptFileRewriter = class PromptFileRewriter2 {
  static {
    __name(this, "PromptFileRewriter");
  }
  constructor(_codeEditorService, _promptsService, _languageModelToolsService) {
    this._codeEditorService = _codeEditorService;
    this._promptsService = _promptsService;
    this._languageModelToolsService = _languageModelToolsService;
  }
  async openAndRewriteTools(uri, newTools, token) {
    const editor = await this._codeEditorService.openCodeEditor({ resource: uri }, this._codeEditorService.getFocusedCodeEditor());
    if (!editor || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const promptAST = this._promptsService.getParsedPromptFile(model);
    if (!promptAST.header) {
      return void 0;
    }
    const toolsAttr = promptAST.header.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr) {
      return void 0;
    }
    editor.setSelection(toolsAttr.range);
    if (newTools === void 0) {
      this.rewriteAttribute(model, "", toolsAttr.range);
      return;
    } else {
      this.rewriteTools(model, newTools, toolsAttr.value.range);
    }
  }
  rewriteTools(model, newTools, range) {
    const newToolNames = this._languageModelToolsService.toFullReferenceNames(newTools);
    const newValue = `[${newToolNames.map((s) => `'${s}'`).join(", ")}]`;
    this.rewriteAttribute(model, newValue, range);
  }
  rewriteAttribute(model, newValue, range) {
    model.pushStackElement();
    model.pushEditOperations(null, [EditOperation.replaceMove(range, newValue)], () => null);
    model.pushStackElement();
  }
  async openAndRewriteName(uri, newName, token) {
    const editor = await this._codeEditorService.openCodeEditor({ resource: uri }, this._codeEditorService.getFocusedCodeEditor());
    if (!editor || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const promptAST = this._promptsService.getParsedPromptFile(model);
    if (!promptAST.header) {
      return;
    }
    const nameAttr = promptAST.header.getAttribute(PromptHeaderAttributes.name);
    if (!nameAttr) {
      return;
    }
    if (nameAttr.value.type === "string" && nameAttr.value.value === newName) {
      return;
    }
    editor.setSelection(nameAttr.range);
    this.rewriteAttribute(model, newName, nameAttr.value.range);
  }
};
PromptFileRewriter = __decorate([
  __param(0, ICodeEditorService),
  __param(1, IPromptsService),
  __param(2, ILanguageModelToolsService)
], PromptFileRewriter);
export {
  PromptFileRewriter
};
//# sourceMappingURL=promptFileRewriter.js.map
