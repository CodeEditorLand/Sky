import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "../model.js";
import { ILanguageSelection } from "../languages/language.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider } from "../languages.js";
const IModelService = createDecorator("modelService");
export {
  IModelService
};
//# sourceMappingURL=model.js.map
