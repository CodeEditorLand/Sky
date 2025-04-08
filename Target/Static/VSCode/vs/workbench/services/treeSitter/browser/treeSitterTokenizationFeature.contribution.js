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
import { registerSingleton, InstantiationType } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { TreeSitterTextModelService } from "../../../../editor/common/services/treeSitter/treeSitterParserService.js";
import { ITreeSitterImporter, ITreeSitterParserService, TreeSitterImporter } from "../../../../editor/common/services/treeSitterParserService.js";
import { ITreeSitterTokenizationFeature } from "./treeSitterTokenizationFeature.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { URI } from "../../../../base/common/uri.js";
import { TreeSitterTokenizationRegistry } from "../../../../editor/common/languages.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
let TreeSitterTokenizationInstantiator = class {
  static {
    __name(this, "TreeSitterTokenizationInstantiator");
  }
  static ID = "workbench.contrib.treeSitterTokenizationInstantiator";
  constructor(_treeSitterTokenizationService, _treeSitterTokenizationFeature) {
  }
};
TreeSitterTokenizationInstantiator = __decorateClass([
  __decorateParam(0, ITreeSitterParserService),
  __decorateParam(1, ITreeSitterTokenizationFeature)
], TreeSitterTokenizationInstantiator);
registerSingleton(ITreeSitterImporter, TreeSitterImporter, InstantiationType.Eager);
registerSingleton(ITreeSitterParserService, TreeSitterTextModelService, InstantiationType.Eager);
registerWorkbenchContribution2(TreeSitterTokenizationInstantiator.ID, TreeSitterTokenizationInstantiator, WorkbenchPhase.BlockRestore);
CommandsRegistry.registerCommand("_workbench.colorizeTreeSitterTokens", async (accessor, resource) => {
  const treeSitterParserService = accessor.get(ITreeSitterParserService);
  const textModelService = accessor.get(ITextFileService);
  const textModel = resource ? (await textModelService.files.resolve(resource)).textEditorModel : void 0;
  if (!textModel) {
    throw new Error(`Cannot resolve text model for resource ${resource}`);
  }
  const tokenizer = await TreeSitterTokenizationRegistry.getOrCreate(textModel.getLanguageId());
  if (!tokenizer) {
    throw new Error(`Cannot resolve tokenizer for language ${textModel.getLanguageId()}`);
  }
  const textModelTreeSitter = await treeSitterParserService.getTextModelTreeSitter(textModel);
  if (!textModelTreeSitter) {
    throw new Error(`Cannot resolve tree sitter parser for language ${textModel.getLanguageId()}`);
  }
  const stopwatch = new StopWatch();
  await textModelTreeSitter.parse();
  stopwatch.stop();
  let captureTime = 0;
  let metadataTime = 0;
  for (let i = 1; i <= textModel.getLineCount(); i++) {
    const result = tokenizer.tokenizeEncodedInstrumented(i, textModel);
    if (result) {
      captureTime += result.captureTime;
      metadataTime += result.metadataTime;
    }
  }
  textModelTreeSitter.dispose();
  textModel.dispose();
  return { parseTime: stopwatch.elapsed(), captureTime, metadataTime };
});
//# sourceMappingURL=treeSitterTokenizationFeature.contribution.js.map
