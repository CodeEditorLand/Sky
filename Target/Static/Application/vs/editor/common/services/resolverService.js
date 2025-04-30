var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const ITextModelService = createDecorator("textModelService");
function isResolvedTextEditorModel(model) {
  const candidate = model;
  return !!candidate.textEditorModel;
}
__name(isResolvedTextEditorModel, "isResolvedTextEditorModel");
export {
  ITextModelService,
  isResolvedTextEditorModel
};
//# sourceMappingURL=resolverService.js.map
