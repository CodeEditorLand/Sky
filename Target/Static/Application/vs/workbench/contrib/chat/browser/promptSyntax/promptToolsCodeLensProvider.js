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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { isITextModel } from "../../../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../../nls.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { showToolsPicker } from "../actions/chatToolPicker.js";
import { ILanguageModelToolsService } from "../../common/tools/languageModelToolsService.js";
import { ALL_PROMPTS_LANGUAGE_SELECTOR, getPromptsTypeForLanguageId, PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { registerEditorFeature } from "../../../../../editor/common/editorFeatures.js";
import { PromptFileRewriter } from "./promptFileRewriter.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { isTarget, parseCommaSeparatedList, PromptHeaderAttributes } from "../../common/promptSyntax/promptFileParser.js";
import { getTarget, isVSCodeOrDefaultTarget } from "../../common/promptSyntax/languageProviders/promptValidator.js";
import { isBoolean } from "../../../../../base/common/types.js";
let PromptToolsCodeLensProvider = class PromptToolsCodeLensProvider2 extends Disposable {
  static {
    __name(this, "PromptToolsCodeLensProvider");
  }
  constructor(promptsService, languageService, languageModelToolsService, instantiationService) {
    super();
    this.promptsService = promptsService;
    this.languageService = languageService;
    this.languageModelToolsService = languageModelToolsService;
    this.instantiationService = instantiationService;
    this.cmdId = `_configure/${generateUuid()}`;
    this._register(this.languageService.codeLensProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, this));
    this._register(CommandsRegistry.registerCommand(this.cmdId, (_accessor, ...args) => {
      const [modelArg, rangeArg, isStringArg, toolsArg, targetArg] = args;
      const model = modelArg;
      if (isITextModel(model) && Range.isIRange(rangeArg) && isBoolean(isStringArg) && Array.isArray(toolsArg) && isTarget(targetArg)) {
        this.updateTools(model, Range.lift(rangeArg), isStringArg, toolsArg, targetArg);
      }
    }));
  }
  async provideCodeLenses(model, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType || promptType === PromptsType.instructions) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    const header = promptAST.header;
    if (!header) {
      return void 0;
    }
    const target = getTarget(promptType, header);
    if (!isVSCodeOrDefaultTarget(target)) {
      return void 0;
    }
    const toolsAttr = header.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr) {
      return void 0;
    }
    let value = toolsAttr.value;
    if (value.type === "scalar") {
      value = parseCommaSeparatedList(value);
    }
    if (value.type !== "sequence") {
      return void 0;
    }
    const items = value.items;
    const selectedTools = items.filter((item) => item.type === "scalar").map((item) => item.value);
    const codeLens = {
      range: toolsAttr.range.collapseToStart(),
      command: {
        title: localize("configure-tools.capitalized.ellipsis", "Configure Tools..."),
        id: this.cmdId,
        arguments: [model, toolsAttr.value.range, toolsAttr.value.type === "scalar", selectedTools, target]
      }
    };
    return { lenses: [codeLens] };
  }
  async updateTools(model, range, isString, selectedTools, target) {
    const selectedToolsNow = /* @__PURE__ */ __name(() => this.languageModelToolsService.toToolAndToolSetEnablementMap(selectedTools, void 0), "selectedToolsNow");
    const newSelectedAfter = await this.instantiationService.invokeFunction(showToolsPicker, localize("placeholder", "Select tools"), "codeLens", void 0, selectedToolsNow);
    if (!newSelectedAfter) {
      return;
    }
    this.instantiationService.createInstance(PromptFileRewriter).rewriteTools(model, newSelectedAfter, range, isString);
  }
};
PromptToolsCodeLensProvider = __decorate([
  __param(0, IPromptsService),
  __param(1, ILanguageFeaturesService),
  __param(2, ILanguageModelToolsService),
  __param(3, IInstantiationService)
], PromptToolsCodeLensProvider);
registerEditorFeature(PromptToolsCodeLensProvider);
//# sourceMappingURL=promptToolsCodeLensProvider.js.map
