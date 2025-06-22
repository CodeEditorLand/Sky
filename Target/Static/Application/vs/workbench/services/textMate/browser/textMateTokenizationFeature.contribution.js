var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ITextMateTokenizationService } from "./textMateTokenizationFeature.js";
import { TextMateTokenizationFeature } from "./textMateTokenizationFeatureImpl.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { TokenizationRegistry } from "../../../../editor/common/languages.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
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
let TextMateTokenizationInstantiator = class TextMateTokenizationInstantiator2 {
  static {
    __name(this, "TextMateTokenizationInstantiator");
  }
  static {
    this.ID = "workbench.contrib.textMateTokenizationInstantiator";
  }
  constructor(_textMateTokenizationService) {
  }
};
TextMateTokenizationInstantiator = __decorate([
  __param(0, ITextMateTokenizationService)
], TextMateTokenizationInstantiator);
registerSingleton(
  ITextMateTokenizationService,
  TextMateTokenizationFeature,
  0
  /* InstantiationType.Eager */
);
registerWorkbenchContribution2(
  TextMateTokenizationInstantiator.ID,
  TextMateTokenizationInstantiator,
  2
  /* WorkbenchPhase.BlockRestore */
);
CommandsRegistry.registerCommand("_workbench.colorizeTextMateTokens", async (accessor, resource) => {
  const textModelService = accessor.get(ITextFileService);
  const textModel = resource ? (await textModelService.files.resolve(resource)).textEditorModel : void 0;
  if (!textModel) {
    throw new Error(`Cannot resolve text model for resource ${resource}`);
  }
  const tokenizer = await TokenizationRegistry.getOrCreate(textModel.getLanguageId());
  if (!tokenizer) {
    throw new Error(`Cannot resolve tokenizer for language ${textModel.getLanguageId()}`);
  }
  const stopwatch = new StopWatch();
  let state = tokenizer.getInitialState();
  for (let i = 1; i <= textModel.getLineCount(); i++) {
    state = tokenizer.tokenizeEncoded(textModel.getLineContent(i), true, state).endState;
  }
  stopwatch.stop();
  return { tokenizeTime: stopwatch.elapsed() };
});
//# sourceMappingURL=textMateTokenizationFeature.contribution.js.map
