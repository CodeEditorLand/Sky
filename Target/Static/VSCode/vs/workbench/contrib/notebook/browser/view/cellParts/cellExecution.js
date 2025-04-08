var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as DOM from "../../../../../../base/browser/dom.js";
import { disposableTimeout } from "../../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { clamp } from "../../../../../../base/common/numbers.js";
import { ICellViewModel, INotebookEditorDelegate } from "../../notebookBrowser.js";
import { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { CellContentPart } from "../cellPart.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { NotebookCellInternalMetadata } from "../../../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
const UPDATE_EXECUTION_ORDER_GRACE_PERIOD = 200;
let CellExecutionPart = class extends CellContentPart {
  constructor(_notebookEditor, _executionOrderLabel, _notebookExecutionStateService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._executionOrderLabel = _executionOrderLabel;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._register(this._notebookEditor.onDidChangeActiveKernel(() => {
      if (this.currentCell) {
        this.kernelDisposables.clear();
        if (this._notebookEditor.activeKernel) {
          this.kernelDisposables.add(this._notebookEditor.activeKernel.onDidChange(() => {
            if (this.currentCell) {
              this.updateExecutionOrder(this.currentCell.internalMetadata);
            }
          }));
        }
        this.updateExecutionOrder(this.currentCell.internalMetadata);
      }
    }));
    this._register(this._notebookEditor.onDidScroll(() => {
      this._updatePosition();
    }));
  }
  static {
    __name(this, "CellExecutionPart");
  }
  kernelDisposables = this._register(new DisposableStore());
  didRenderCell(element) {
    this.updateExecutionOrder(element.internalMetadata, true);
  }
  updateExecutionOrder(internalMetadata, forceClear = false) {
    if (this._notebookEditor.activeKernel?.implementsExecutionOrder || !this._notebookEditor.activeKernel && typeof internalMetadata.executionOrder === "number") {
      if (typeof internalMetadata.executionOrder !== "number" && !forceClear && !!this._notebookExecutionStateService.getCellExecution(this.currentCell.uri)) {
        const renderingCell = this.currentCell;
        disposableTimeout(() => {
          if (this.currentCell === renderingCell) {
            this.updateExecutionOrder(this.currentCell.internalMetadata, true);
          }
        }, UPDATE_EXECUTION_ORDER_GRACE_PERIOD, this.cellDisposables);
        return;
      }
      const executionOrderLabel = typeof internalMetadata.executionOrder === "number" ? `[${internalMetadata.executionOrder}]` : "[ ]";
      this._executionOrderLabel.innerText = executionOrderLabel;
    } else {
      this._executionOrderLabel.innerText = "";
    }
  }
  updateState(element, e) {
    if (e.internalMetadataChanged) {
      this.updateExecutionOrder(element.internalMetadata);
    }
  }
  updateInternalLayoutNow(element) {
    this._updatePosition();
  }
  _updatePosition() {
    if (this.currentCell) {
      if (this.currentCell.isInputCollapsed) {
        DOM.hide(this._executionOrderLabel);
      } else {
        DOM.show(this._executionOrderLabel);
        let top = this.currentCell.layoutInfo.editorHeight - 22 + this.currentCell.layoutInfo.statusBarHeight;
        if (this.currentCell instanceof CodeCellViewModel) {
          const elementTop = this._notebookEditor.getAbsoluteTopOfElement(this.currentCell);
          const editorBottom = elementTop + this.currentCell.layoutInfo.outputContainerOffset;
          const scrollBottom = this._notebookEditor.scrollBottom;
          const lineHeight = 22;
          if (scrollBottom <= editorBottom) {
            const offset = editorBottom - scrollBottom;
            top -= offset;
            top = clamp(
              top,
              lineHeight + 12,
              // line height + padding for single line
              this.currentCell.layoutInfo.editorHeight - lineHeight + this.currentCell.layoutInfo.statusBarHeight
            );
          }
        }
        this._executionOrderLabel.style.top = `${top}px`;
      }
    }
  }
};
CellExecutionPart = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService)
], CellExecutionPart);
export {
  CellExecutionPart
};
//# sourceMappingURL=cellExecution.js.map
