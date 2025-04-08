var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { CellFocusMode, ICellViewModel } from "../notebookBrowser.js";
import { CodeCellViewModel } from "../viewModel/codeCellViewModel.js";
import { CellKind, NotebookCellExecutionState, NotebookSetting } from "../../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../../common/notebookExecutionStateService.js";
import { Event } from "../../../../../base/common/event.js";
import { ScrollEvent } from "../../../../../base/common/scrollable.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IListView } from "../../../../../base/browser/ui/list/listView.js";
import { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
class NotebookCellAnchor {
  constructor(notebookExecutionStateService, configurationService, scrollEvent) {
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.configurationService = configurationService;
    this.scrollEvent = scrollEvent;
  }
  static {
    __name(this, "NotebookCellAnchor");
  }
  stopAnchoring = false;
  executionWatcher;
  scrollWatcher;
  shouldAnchor(cellListView, focusedIndex, heightDelta, executingCellUri) {
    if (cellListView.element(focusedIndex).focusMode === CellFocusMode.Editor) {
      return true;
    }
    if (this.stopAnchoring) {
      return false;
    }
    const newFocusBottom = cellListView.elementTop(focusedIndex) + cellListView.elementHeight(focusedIndex) + heightDelta;
    const viewBottom = cellListView.renderHeight + cellListView.getScrollTop();
    const focusStillVisible = viewBottom > newFocusBottom;
    const allowScrolling = this.configurationService.getValue(NotebookSetting.scrollToRevealCell) !== "none";
    const growing = heightDelta > 0;
    const autoAnchor = allowScrolling && growing && !focusStillVisible;
    if (autoAnchor) {
      this.watchAchorDuringExecution(executingCellUri);
      return true;
    }
    return false;
  }
  watchAchorDuringExecution(executingCell) {
    if (!this.executionWatcher && executingCell.cellKind === CellKind.Code) {
      const executionState = this.notebookExecutionStateService.getCellExecution(executingCell.uri);
      if (executionState && executionState.state === NotebookCellExecutionState.Executing) {
        this.executionWatcher = executingCell.onDidStopExecution(() => {
          this.executionWatcher?.dispose();
          this.executionWatcher = void 0;
          this.scrollWatcher?.dispose();
          this.stopAnchoring = false;
        });
        this.scrollWatcher = this.scrollEvent((scrollEvent) => {
          if (scrollEvent.scrollTop < scrollEvent.oldScrollTop) {
            this.stopAnchoring = true;
            this.scrollWatcher?.dispose();
          }
        });
      }
    }
  }
  dispose() {
    this.executionWatcher?.dispose();
    this.scrollWatcher?.dispose();
  }
}
export {
  NotebookCellAnchor
};
//# sourceMappingURL=notebookCellAnchor.js.map
