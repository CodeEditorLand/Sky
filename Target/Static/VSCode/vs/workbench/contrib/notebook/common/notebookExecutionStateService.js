import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { NotebookCellExecutionState, NotebookExecutionState } from "./notebookCommon.js";
import { CellExecutionUpdateType, ICellExecuteOutputEdit, ICellExecuteOutputItemEdit } from "./notebookExecutionService.js";
var NotebookExecutionType = /* @__PURE__ */ ((NotebookExecutionType2) => {
  NotebookExecutionType2[NotebookExecutionType2["cell"] = 0] = "cell";
  NotebookExecutionType2[NotebookExecutionType2["notebook"] = 1] = "notebook";
  return NotebookExecutionType2;
})(NotebookExecutionType || {});
const INotebookExecutionStateService = createDecorator("INotebookExecutionStateService");
export {
  INotebookExecutionStateService,
  NotebookExecutionType
};
//# sourceMappingURL=notebookExecutionStateService.js.map
