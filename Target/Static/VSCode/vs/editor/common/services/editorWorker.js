import { URI } from "../../../base/common/uri.js";
import { IRange } from "../core/range.js";
import { IDocumentDiff, IDocumentDiffProviderOptions } from "../diff/documentDiffProvider.js";
import { IChange } from "../diff/legacyLinesDiffComputer.js";
import { IColorInformation, IInplaceReplaceSupportResult, TextEdit } from "../languages.js";
import { UnicodeHighlighterOptions } from "./unicodeTextModelHighlighter.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { SectionHeader, FindSectionHeaderOptions } from "./findSectionHeaders.js";
const IEditorWorkerService = createDecorator("editorWorkerService");
export {
  IEditorWorkerService
};
//# sourceMappingURL=editorWorker.js.map
