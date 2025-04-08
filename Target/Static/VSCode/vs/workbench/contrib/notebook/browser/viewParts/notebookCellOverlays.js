var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createFastDomNode, FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IsDevelopmentContext } from "../../../../../platform/contextkey/common/contextkeys.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { CellKind } from "../../common/notebookCommon.js";
import { getNotebookEditorFromEditorPane, INotebookCellOverlay, INotebookCellOverlayChangeAccessor, INotebookViewCellsUpdateEvent } from "../notebookBrowser.js";
import { NotebookCellListView } from "../view/notebookCellListView.js";
import { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
class NotebookCellOverlays extends Disposable {
  constructor(listView) {
    super();
    this.listView = listView;
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("cell-overlays");
    this.domNode.setPosition("absolute");
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setWidth("100%");
    this.listView.containerDomNode.appendChild(this.domNode.domNode);
  }
  static {
    __name(this, "NotebookCellOverlays");
  }
  _lastOverlayId = 0;
  domNode;
  _overlays = /* @__PURE__ */ Object.create(null);
  changeCellOverlays(callback) {
    let overlaysHaveChanged = false;
    const changeAccessor = {
      addOverlay: /* @__PURE__ */ __name((overlay) => {
        overlaysHaveChanged = true;
        return this._addOverlay(overlay);
      }, "addOverlay"),
      removeOverlay: /* @__PURE__ */ __name((id) => {
        overlaysHaveChanged = true;
        this._removeOverlay(id);
      }, "removeOverlay"),
      layoutOverlay: /* @__PURE__ */ __name((id) => {
        overlaysHaveChanged = true;
        this._layoutOverlay(id);
      }, "layoutOverlay")
    };
    callback(changeAccessor);
    return overlaysHaveChanged;
  }
  onCellsChanged(e) {
    this.layout();
  }
  onHiddenRangesChange() {
    this.layout();
  }
  layout() {
    for (const id in this._overlays) {
      this._layoutOverlay(id);
    }
  }
  _addOverlay(overlay) {
    const overlayId = `${++this._lastOverlayId}`;
    const overlayWidget = {
      overlayId,
      overlay,
      domNode: createFastDomNode(overlay.domNode)
    };
    this._overlays[overlayId] = overlayWidget;
    overlayWidget.domNode.setClassName("cell-overlay");
    overlayWidget.domNode.setPosition("absolute");
    this.domNode.appendChild(overlayWidget.domNode);
    return overlayId;
  }
  _removeOverlay(id) {
    const overlay = this._overlays[id];
    if (overlay) {
      try {
        this.domNode.removeChild(overlay.domNode);
      } catch {
      }
      delete this._overlays[id];
    }
  }
  _layoutOverlay(id) {
    const overlay = this._overlays[id];
    if (!overlay) {
      return;
    }
    const isInHiddenRanges = this._isInHiddenRanges(overlay);
    if (isInHiddenRanges) {
      overlay.domNode.setDisplay("none");
      return;
    }
    overlay.domNode.setDisplay("block");
    const index = this.listView.indexOf(overlay.overlay.cell);
    if (index === -1) {
      return;
    }
    const top = this.listView.elementTop(index);
    overlay.domNode.setTop(top);
  }
  _isInHiddenRanges(zone) {
    const index = this.listView.indexOf(zone.overlay.cell);
    if (index === -1) {
      return true;
    }
    return false;
  }
}
class ToggleNotebookCellOverlaysDeveloperAction extends Action2 {
  static {
    __name(this, "ToggleNotebookCellOverlaysDeveloperAction");
  }
  static cellOverlayIds = [];
  constructor() {
    super({
      id: "notebook.developer.addCellOverlays",
      title: localize2("workbench.notebook.developer.addCellOverlays", "Toggle Notebook Cell Overlays"),
      category: Categories.Developer,
      precondition: IsDevelopmentContext,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (ToggleNotebookCellOverlaysDeveloperAction.cellOverlayIds.length > 0) {
      editor.changeCellOverlays((accessor2) => {
        ToggleNotebookCellOverlaysDeveloperAction.cellOverlayIds.forEach((id) => {
          accessor2.removeOverlay(id);
        });
        ToggleNotebookCellOverlaysDeveloperAction.cellOverlayIds = [];
      });
    } else {
      editor.changeCellOverlays((accessor2) => {
        const cells = editor.getCellsInRange();
        if (cells.length === 0) {
          return;
        }
        const cellOverlayIds = [];
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].cellKind !== CellKind.Markup) {
            continue;
          }
          const domNode = document.createElement("div");
          domNode.innerText = `Cell Overlay ${i}`;
          domNode.style.top = "10px";
          domNode.style.right = "10px";
          domNode.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
          const overlayId = accessor2.addOverlay({
            cell: cells[i],
            domNode
          });
          cellOverlayIds.push(overlayId);
        }
        ToggleNotebookCellOverlaysDeveloperAction.cellOverlayIds = cellOverlayIds;
      });
    }
  }
}
registerAction2(ToggleNotebookCellOverlaysDeveloperAction);
export {
  NotebookCellOverlays
};
//# sourceMappingURL=notebookCellOverlays.js.map
