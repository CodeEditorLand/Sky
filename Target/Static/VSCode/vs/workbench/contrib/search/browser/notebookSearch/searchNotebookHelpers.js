var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FindMatch } from "../../../../../editor/common/model.js";
import { IFileMatch, ITextSearchMatch, TextSearchMatch } from "../../../../services/search/common/search.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { INotebookCellMatchNoModel, INotebookFileMatchNoModel, genericCellMatchesToTextSearchMatches, rawCellPrefix } from "../../common/searchNotebookHelpers.js";
import { CellWebviewFindMatch, ICellViewModel } from "../../../notebook/browser/notebookBrowser.js";
import { URI } from "../../../../../base/common/uri.js";
function getIDFromINotebookCellMatch(match) {
  if (isINotebookCellMatchWithModel(match)) {
    return match.cell.id;
  } else {
    return `${rawCellPrefix}${match.index}`;
  }
}
__name(getIDFromINotebookCellMatch, "getIDFromINotebookCellMatch");
function isINotebookFileMatchWithModel(object) {
  return "cellResults" in object && object.cellResults instanceof Array && object.cellResults.every(isINotebookCellMatchWithModel);
}
__name(isINotebookFileMatchWithModel, "isINotebookFileMatchWithModel");
function isINotebookCellMatchWithModel(object) {
  return "cell" in object;
}
__name(isINotebookCellMatchWithModel, "isINotebookCellMatchWithModel");
function contentMatchesToTextSearchMatches(contentMatches, cell) {
  return genericCellMatchesToTextSearchMatches(
    contentMatches,
    cell.textBuffer
  );
}
__name(contentMatchesToTextSearchMatches, "contentMatchesToTextSearchMatches");
function webviewMatchesToTextSearchMatches(webviewMatches) {
  return webviewMatches.map(
    (rawMatch) => rawMatch.searchPreviewInfo ? new TextSearchMatch(
      rawMatch.searchPreviewInfo.line,
      new Range(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end),
      void 0,
      rawMatch.index
    ) : void 0
  ).filter((e) => !!e);
}
__name(webviewMatchesToTextSearchMatches, "webviewMatchesToTextSearchMatches");
export {
  contentMatchesToTextSearchMatches,
  getIDFromINotebookCellMatch,
  isINotebookCellMatchWithModel,
  isINotebookFileMatchWithModel,
  webviewMatchesToTextSearchMatches
};
//# sourceMappingURL=searchNotebookHelpers.js.map
