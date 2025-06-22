import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var CellExecutionUpdateType;
(function(CellExecutionUpdateType2) {
  CellExecutionUpdateType2[CellExecutionUpdateType2["Output"] = 1] = "Output";
  CellExecutionUpdateType2[CellExecutionUpdateType2["OutputItems"] = 2] = "OutputItems";
  CellExecutionUpdateType2[CellExecutionUpdateType2["ExecutionState"] = 3] = "ExecutionState";
})(CellExecutionUpdateType || (CellExecutionUpdateType = {}));
const INotebookExecutionService = createDecorator("INotebookExecutionService");
export {
  CellExecutionUpdateType,
  INotebookExecutionService
};
//# sourceMappingURL=notebookExecutionService.js.map
