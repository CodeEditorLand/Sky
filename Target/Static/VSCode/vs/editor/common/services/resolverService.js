var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IDisposable, IReference } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ITextModel, ITextSnapshot } from "../model.js";
import { IResolvableEditorModel } from "../../../platform/editor/common/editor.js";
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
