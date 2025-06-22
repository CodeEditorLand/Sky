var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NOTEBOOK_EDITOR_ID, NOTEBOOK_DIFF_EDITOR_ID } from "../common/notebookCommon.js";
import { isCompositeNotebookEditorInput } from "../common/notebookEditorInput.js";
import { cellRangesToIndexes, reduceCellRanges } from "../common/notebookRange.js";
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
var RenderOutputType;
(function(RenderOutputType2) {
  RenderOutputType2[RenderOutputType2["Html"] = 0] = "Html";
  RenderOutputType2[RenderOutputType2["Extension"] = 1] = "Extension";
})(RenderOutputType || (RenderOutputType = {}));
var ScrollToRevealBehavior;
(function(ScrollToRevealBehavior2) {
  ScrollToRevealBehavior2[ScrollToRevealBehavior2["fullCell"] = 0] = "fullCell";
  ScrollToRevealBehavior2[ScrollToRevealBehavior2["firstLine"] = 1] = "firstLine";
})(ScrollToRevealBehavior || (ScrollToRevealBehavior = {}));
var CellLayoutState;
(function(CellLayoutState2) {
  CellLayoutState2[CellLayoutState2["Uninitialized"] = 0] = "Uninitialized";
  CellLayoutState2[CellLayoutState2["Estimated"] = 1] = "Estimated";
  CellLayoutState2[CellLayoutState2["FromCache"] = 2] = "FromCache";
  CellLayoutState2[CellLayoutState2["Measured"] = 3] = "Measured";
})(CellLayoutState || (CellLayoutState = {}));
var CellLayoutContext;
(function(CellLayoutContext2) {
  CellLayoutContext2[CellLayoutContext2["Fold"] = 0] = "Fold";
})(CellLayoutContext || (CellLayoutContext = {}));
var NotebookOverviewRulerLane;
(function(NotebookOverviewRulerLane2) {
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Left"] = 1] = "Left";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Center"] = 2] = "Center";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Right"] = 4] = "Right";
  NotebookOverviewRulerLane2[NotebookOverviewRulerLane2["Full"] = 7] = "Full";
})(NotebookOverviewRulerLane || (NotebookOverviewRulerLane = {}));
function isNotebookCellDecoration(obj) {
  return !!obj && typeof obj.handle === "number";
}
__name(isNotebookCellDecoration, "isNotebookCellDecoration");
function isNotebookViewZoneDecoration(obj) {
  return !!obj && typeof obj.viewZoneId === "string";
}
__name(isNotebookViewZoneDecoration, "isNotebookViewZoneDecoration");
var CellRevealType;
(function(CellRevealType2) {
  CellRevealType2[CellRevealType2["Default"] = 1] = "Default";
  CellRevealType2[CellRevealType2["Top"] = 2] = "Top";
  CellRevealType2[CellRevealType2["Center"] = 3] = "Center";
  CellRevealType2[CellRevealType2["CenterIfOutsideViewport"] = 4] = "CenterIfOutsideViewport";
  CellRevealType2[CellRevealType2["NearTopIfOutsideViewport"] = 5] = "NearTopIfOutsideViewport";
  CellRevealType2[CellRevealType2["FirstLineIfOutsideViewport"] = 6] = "FirstLineIfOutsideViewport";
})(CellRevealType || (CellRevealType = {}));
var CellRevealRangeType;
(function(CellRevealRangeType2) {
  CellRevealRangeType2[CellRevealRangeType2["Default"] = 1] = "Default";
  CellRevealRangeType2[CellRevealRangeType2["Center"] = 2] = "Center";
  CellRevealRangeType2[CellRevealRangeType2["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
})(CellRevealRangeType || (CellRevealRangeType = {}));
var CellEditState;
(function(CellEditState2) {
  CellEditState2[CellEditState2["Preview"] = 0] = "Preview";
  CellEditState2[CellEditState2["Editing"] = 1] = "Editing";
})(CellEditState || (CellEditState = {}));
var CellFocusMode;
(function(CellFocusMode2) {
  CellFocusMode2[CellFocusMode2["Container"] = 0] = "Container";
  CellFocusMode2[CellFocusMode2["Editor"] = 1] = "Editor";
  CellFocusMode2[CellFocusMode2["Output"] = 2] = "Output";
  CellFocusMode2[CellFocusMode2["ChatInput"] = 3] = "ChatInput";
})(CellFocusMode || (CellFocusMode = {}));
var CursorAtBoundary;
(function(CursorAtBoundary2) {
  CursorAtBoundary2[CursorAtBoundary2["None"] = 0] = "None";
  CursorAtBoundary2[CursorAtBoundary2["Top"] = 1] = "Top";
  CursorAtBoundary2[CursorAtBoundary2["Bottom"] = 2] = "Bottom";
  CursorAtBoundary2[CursorAtBoundary2["Both"] = 3] = "Both";
})(CursorAtBoundary || (CursorAtBoundary = {}));
var CursorAtLineBoundary;
(function(CursorAtLineBoundary2) {
  CursorAtLineBoundary2[CursorAtLineBoundary2["None"] = 0] = "None";
  CursorAtLineBoundary2[CursorAtLineBoundary2["Start"] = 1] = "Start";
  CursorAtLineBoundary2[CursorAtLineBoundary2["End"] = 2] = "End";
  CursorAtLineBoundary2[CursorAtLineBoundary2["Both"] = 3] = "Both";
})(CursorAtLineBoundary || (CursorAtLineBoundary = {}));
function getNotebookEditorFromEditorPane(editorPane) {
  if (!editorPane) {
    return;
  }
  if (editorPane.getId() === NOTEBOOK_EDITOR_ID) {
    return editorPane.getControl();
  }
  if (editorPane.getId() === NOTEBOOK_DIFF_EDITOR_ID) {
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
var CellFoldingState;
(function(CellFoldingState2) {
  CellFoldingState2[CellFoldingState2["None"] = 0] = "None";
  CellFoldingState2[CellFoldingState2["Expanded"] = 1] = "Expanded";
  CellFoldingState2[CellFoldingState2["Collapsed"] = 2] = "Collapsed";
})(CellFoldingState || (CellFoldingState = {}));
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
