var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CodeWindow } from "../../../../base/browser/window.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IEditorContributionDescription } from "../../../../editor/browser/editorExtensions.js";
import * as editorCommon from "../../../../editor/common/editorCommon.js";
import { FontInfo } from "../../../../editor/common/config/fontInfo.js";
import { IPosition } from "../../../../editor/common/core/position.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { FindMatch, IModelDeltaDecoration, IReadonlyTextBuffer, ITextModel, TrackedRangeStickiness } from "../../../../editor/common/model.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ITextEditorOptions, ITextResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { IConstructorSignature } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorPane, IEditorPaneWithSelection } from "../../../common/editor.js";
import { CellViewModelStateChangeEvent, NotebookCellStateChangedEvent, NotebookLayoutInfo } from "./notebookViewEvents.js";
import { NotebookCellTextModel } from "../common/model/notebookCellTextModel.js";
import { NotebookTextModel } from "../common/model/notebookTextModel.js";
import { CellKind, ICellOutput, INotebookCellStatusBarItem, INotebookRendererInfo, INotebookFindOptions, IOrderedMimeType, NotebookCellInternalMetadata, NotebookCellMetadata, NOTEBOOK_EDITOR_ID } from "../common/notebookCommon.js";
import { isCompositeNotebookEditorInput } from "../common/notebookEditorInput.js";
import { INotebookKernel } from "../common/notebookKernelService.js";
import { NotebookOptions } from "./notebookOptions.js";
import { cellRangesToIndexes, ICellRange, reduceCellRanges } from "../common/notebookRange.js";
import { IWebviewElement } from "../../webview/browser/webview.js";
import { IEditorCommentsOptions, IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IObservable } from "../../../../base/common/observable.js";
import { NotebookTextDiffEditor } from "./diff/notebookDiffEditor.js";
import { INotebookTextDiffEditor } from "./diff/notebookDiffEditorBrowser.js";
const EXPAND_CELL_INPUT_COMMAND_ID = "notebook.cell.expandCellInput";
const EXECUTE_CELL_COMMAND_ID = "notebook.cell.execute";
const DETECT_CELL_LANGUAGE = "notebook.cell.detectLanguage";
const CHANGE_CELL_LANGUAGE = "notebook.cell.changeLanguage";
const QUIT_EDIT_CELL_COMMAND_ID = "notebook.cell.quitEdit";
const EXPAND_CELL_OUTPUT_COMMAND_ID = "notebook.cell.expandCellOutput";
const IPYNB_VIEW_TYPE = "jupyter-notebook";
const JUPYTER_EXTENSION_ID = "ms-toolsai.jupyter";
const KERNEL_EXTENSIONS = /* @__PURE__ */ new Map([
  [IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID]
]);
const KERNEL_RECOMMENDATIONS = /* @__PURE__ */ new Map();
KERNEL_RECOMMENDATIONS.set(IPYNB_VIEW_TYPE, /* @__PURE__ */ new Map());
KERNEL_RECOMMENDATIONS.get(IPYNB_VIEW_TYPE)?.set("python", {
  extensionIds: [
    "ms-python.python",
    JUPYTER_EXTENSION_ID
  ],
  displayName: "Python + Jupyter"
});
var RenderOutputType = /* @__PURE__ */ ((RenderOutputType2) => {
  RenderOutputType2[RenderOutputType2["Html"] = 0] = "Html";
  RenderOutputType2[RenderOutputType2["Extension"] = 1] = "Extension";
  return RenderOutputType2;
})(RenderOutputType || {});
var ScrollToRevealBehavior = /* @__PURE__ */ ((ScrollToRevealBehavior2) => {
  ScrollToRevealBehavior2[ScrollToRevealBehavior2["fullCell"] = 0] = "fullCell";
  ScrollToRevealBehavior2[ScrollToRevealBehavior2["firstLine"] = 1] = "firstLine";
  return ScrollToRevealBehavior2;
})(ScrollToRevealBehavior || {});
var CellLayoutState = /* @__PURE__ */ ((CellLayoutState2) => {
  CellLayoutState2[CellLayoutState2["Uninitialized"] = 0] = "Uninitialized";
  CellLayoutState2[CellLayoutState2["Estimated"] = 1] = "Estimated";
  CellLayoutState2[CellLayoutState2["FromCache"] = 2] = "FromCache";
  CellLayoutState2[CellLayoutState2["Measured"] = 3] = "Measured";
  return CellLayoutState2;
})(CellLayoutState || {});
var CellLayoutContext = /* @__PURE__ */ ((CellLayoutContext2) => {
  CellLayoutContext2[CellLayoutContext2["Fold"] = 0] = "Fold";
  return CellLayoutContext2;
})(CellLayoutContext || {});
var NotebookOverviewRulerLane = /* @__PURE__ */ ((NotebookOverviewRulerLane2) => {
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Left"] = 1] = "Left";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Center"] = 2] = "Center";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Right"] = 4] = "Right";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Full"] = 7] = "Full";
  return NotebookOverviewRulerLane2;
})(NotebookOverviewRulerLane || {});
function isNotebookCellDecoration(obj) {
  return !!obj && typeof obj.handle === "number";
}
__name(isNotebookCellDecoration, "isNotebookCellDecoration");
function isNotebookViewZoneDecoration(obj) {
  return !!obj && typeof obj.viewZoneId === "string";
}
__name(isNotebookViewZoneDecoration, "isNotebookViewZoneDecoration");
var CellRevealType = /* @__PURE__ */ ((CellRevealType2) => {
  CellRevealType2[CellRevealType2["Default"] = 1] = "Default";
  CellRevealType2[CellRevealType2["Top"] = 2] = "Top";
  CellRevealType2[CellRevealType2["Center"] = 3] = "Center";
  CellRevealType2[CellRevealType2["CenterIfOutsideViewport"] = 4] = "CenterIfOutsideViewport";
  CellRevealType2[CellRevealType2["NearTopIfOutsideViewport"] = 5] = "NearTopIfOutsideViewport";
  CellRevealType2[CellRevealType2["FirstLineIfOutsideViewport"] = 6] = "FirstLineIfOutsideViewport";
  return CellRevealType2;
})(CellRevealType || {});
var CellRevealRangeType = /* @__PURE__ */ ((CellRevealRangeType2) => {
  CellRevealRangeType2[CellRevealRangeType2["Default"] = 1] = "Default";
  CellRevealRangeType2[CellRevealRangeType2["Center"] = 2] = "Center";
  CellRevealRangeType2[CellRevealRangeType2["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
  return CellRevealRangeType2;
})(CellRevealRangeType || {});
var CellEditState = /* @__PURE__ */ ((CellEditState2) => {
  CellEditState2[CellEditState2["Preview"] = 0] = "Preview";
  CellEditState2[CellEditState2["Editing"] = 1] = "Editing";
  return CellEditState2;
})(CellEditState || {});
var CellFocusMode = /* @__PURE__ */ ((CellFocusMode2) => {
  CellFocusMode2[CellFocusMode2["Container"] = 0] = "Container";
  CellFocusMode2[CellFocusMode2["Editor"] = 1] = "Editor";
  CellFocusMode2[CellFocusMode2["Output"] = 2] = "Output";
  CellFocusMode2[CellFocusMode2["ChatInput"] = 3] = "ChatInput";
  return CellFocusMode2;
})(CellFocusMode || {});
var CursorAtBoundary = /* @__PURE__ */ ((CursorAtBoundary2) => {
  CursorAtBoundary2[CursorAtBoundary2["None"] = 0] = "None";
  CursorAtBoundary2[CursorAtBoundary2["Top"] = 1] = "Top";
  CursorAtBoundary2[CursorAtBoundary2["Bottom"] = 2] = "Bottom";
  CursorAtBoundary2[CursorAtBoundary2["Both"] = 3] = "Both";
  return CursorAtBoundary2;
})(CursorAtBoundary || {});
var CursorAtLineBoundary = /* @__PURE__ */ ((CursorAtLineBoundary2) => {
  CursorAtLineBoundary2[CursorAtLineBoundary2["None"] = 0] = "None";
  CursorAtLineBoundary2[CursorAtLineBoundary2["Start"] = 1] = "Start";
  CursorAtLineBoundary2[CursorAtLineBoundary2["End"] = 2] = "End";
  CursorAtLineBoundary2[CursorAtLineBoundary2["Both"] = 3] = "Both";
  return CursorAtLineBoundary2;
})(CursorAtLineBoundary || {});
function getNotebookEditorFromEditorPane(editorPane) {
  if (!editorPane) {
    return;
  }
  if (editorPane.getId() === NOTEBOOK_EDITOR_ID) {
    return editorPane.getControl();
  }
  if (editorPane.getId() === NotebookTextDiffEditor.ID) {
    return editorPane.getControl().inlineNotebookEditor;
  }
  const input = editorPane.input;
  const isCompositeNotebook = input && isCompositeNotebookEditorInput(input);
  if (isCompositeNotebook) {
    return editorPane.getControl()?.notebookEditor;
  }
  return void 0;
}
__name(getNotebookEditorFromEditorPane, "getNotebookEditorFromEditorPane");
function expandCellRangesWithHiddenCells(editor, ranges) {
  const indexes = cellRangesToIndexes(ranges);
  const modelRanges = [];
  indexes.forEach((index) => {
    const viewCell = editor.cellAt(index);
    if (!viewCell) {
      return;
    }
    const viewIndex = editor.getViewIndexByModelIndex(index);
    if (viewIndex < 0) {
      return;
    }
    const nextViewIndex = viewIndex + 1;
    const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
    if (range) {
      modelRanges.push(range);
    }
  });
  return reduceCellRanges(modelRanges);
}
__name(expandCellRangesWithHiddenCells, "expandCellRangesWithHiddenCells");
function cellRangeToViewCells(editor, ranges) {
  const cells = [];
  reduceCellRanges(ranges).forEach((range) => {
    cells.push(...editor.getCellsInRange(range));
  });
  return cells;
}
__name(cellRangeToViewCells, "cellRangeToViewCells");
var CellFoldingState = /* @__PURE__ */ ((CellFoldingState2) => {
  CellFoldingState2[CellFoldingState2["None"] = 0] = "None";
  CellFoldingState2[CellFoldingState2["Expanded"] = 1] = "Expanded";
  CellFoldingState2[CellFoldingState2["Collapsed"] = 2] = "Collapsed";
  return CellFoldingState2;
})(CellFoldingState || {});
export {
  CHANGE_CELL_LANGUAGE,
  CellEditState,
  CellFocusMode,
  CellFoldingState,
  CellLayoutContext,
  CellLayoutState,
  CellRevealRangeType,
  CellRevealType,
  CursorAtBoundary,
  CursorAtLineBoundary,
  DETECT_CELL_LANGUAGE,
  EXECUTE_CELL_COMMAND_ID,
  EXPAND_CELL_INPUT_COMMAND_ID,
  EXPAND_CELL_OUTPUT_COMMAND_ID,
  IPYNB_VIEW_TYPE,
  JUPYTER_EXTENSION_ID,
  KERNEL_EXTENSIONS,
  KERNEL_RECOMMENDATIONS,
  NotebookOverviewRulerLane,
  QUIT_EDIT_CELL_COMMAND_ID,
  RenderOutputType,
  ScrollToRevealBehavior,
  cellRangeToViewCells,
  expandCellRangesWithHiddenCells,
  getNotebookEditorFromEditorPane,
  isNotebookCellDecoration,
  isNotebookViewZoneDecoration
};
//# sourceMappingURL=notebookBrowser.js.map
