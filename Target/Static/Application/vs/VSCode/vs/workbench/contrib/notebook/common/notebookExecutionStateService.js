import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var NotebookExecutionType;
(function(NotebookExecutionType2) {
  NotebookExecutionType2[NotebookExecutionType2["cell"] = 0] = "cell";
  NotebookExecutionType2[NotebookExecutionType2["notebook"] = 1] = "notebook";
})(NotebookExecutionType || (NotebookExecutionType = {}));
const INotebookExecutionStateService = createDecorator("INotebookExecutionStateService");
export {
  INotebookExecutionStateService,
  NotebookExecutionType
};
//# sourceMappingURL=notebookExecutionStateService.js.map
