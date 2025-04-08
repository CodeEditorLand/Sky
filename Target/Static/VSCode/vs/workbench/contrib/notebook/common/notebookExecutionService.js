import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { NotebookCellTextModel } from "./model/notebookCellTextModel.js";
import { INotebookTextModel, IOutputDto, IOutputItemDto } from "./notebookCommon.js";
import { INotebookCellExecution } from "./notebookExecutionStateService.js";
var CellExecutionUpdateType = /* @__PURE__ */ ((CellExecutionUpdateType2) => {
  CellExecutionUpdateType2[CellExecutionUpdateType2["Output"] = 1] = "Output";
  CellExecutionUpdateType2[CellExecutionUpdateType2["OutputItems"] = 2] = "OutputItems";
  CellExecutionUpdateType2[CellExecutionUpdateType2["ExecutionState"] = 3] = "ExecutionState";
  return CellExecutionUpdateType2;
})(CellExecutionUpdateType || {});
const INotebookExecutionService = createDecorator("INotebookExecutionService");
export {
  CellExecutionUpdateType,
  INotebookExecutionService
};
//# sourceMappingURL=notebookExecutionService.js.map
