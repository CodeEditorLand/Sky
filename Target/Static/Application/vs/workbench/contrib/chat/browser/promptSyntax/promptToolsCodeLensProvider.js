var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { isITextModel } from "../../../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../../nls.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { showToolsPicker } from "../actions/chatToolPicker.js";
import { ILanguageModelToolsService, ToolSet } from "../../common/languageModelToolsService.js";
import { ALL_PROMPTS_LANGUAGE_SELECTOR } from "../../common/promptSyntax/promptTypes.js";
import { PromptToolsMetadata } from "../../common/promptSyntax/parsers/promptHeader/metadata/tools.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { registerEditorFeature } from "../../../../../editor/common/editorFeatures.js";
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
      const [first, second] = args;
      if (isITextModel(first) && second instanceof PromptToolsMetadata) {
        this.updateTools(first, second);
      }
    }));
  }
  async provideCodeLenses(model, token) {
    const parser = this.promptsService.getSyntaxParserFor(model);
    const { header } = await parser.start(token).settled();
    if (header === void 0 || token.isCancellationRequested) {
      return void 0;
    }
    if ("tools" in header.metadataUtility === false) {
      return void 0;
    }
    const { tools } = header.metadataUtility;
    if (tools === void 0) {
      return void 0;
    }
    const codeLens = {
      range: tools.range.collapseToStart(),
      command: {
        title: localize("configure-tools.capitalized.ellipsis", "Configure Tools..."),
        id: this.cmdId,
        arguments: [model, tools]
      }
    };
    return { lenses: [codeLens] };
  }
  async updateTools(model, tools) {
    const toolNames = new Set(tools.value);
    const selectedToolsNow = /* @__PURE__ */ new Map();
    for (const tool of this.languageModelToolsService.getTools()) {
      selectedToolsNow.set(tool, toolNames.has(tool.toolReferenceName ?? tool.displayName));
    }
    for (const toolSet of this.languageModelToolsService.toolSets.get()) {
      selectedToolsNow.set(toolSet, toolNames.has(toolSet.referenceName));
    }
    const newSelectedAfter = await this.instantiationService.invokeFunction(showToolsPicker, localize("placeholder", "Select tools"), selectedToolsNow);
    if (!newSelectedAfter) {
      return;
    }
    const newToolNames = [];
    for (const [item, picked] of newSelectedAfter) {
      if (picked) {
        if (item instanceof ToolSet) {
          newToolNames.push(item.referenceName);
        } else {
          newToolNames.push(item.toolReferenceName ?? item.displayName);
        }
      }
    }
    model.pushStackElement();
    model.pushEditOperations(null, [EditOperation.replaceMove(tools.range, `tools: [${newToolNames.map((s) => `'${s}'`).join(", ")}]`)], () => null);
    model.pushStackElement();
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
