var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore, dispose } from "../../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../../nls.js";
import { Categories } from "../../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { INotebookService } from "../../../common/notebookService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { n } from "../../../../../../base/browser/dom.js";
class TroubleshootController extends Disposable {
  static {
    __name(this, "TroubleshootController");
  }
  static {
    this.id = "workbench.notebook.troubleshoot";
  }
  constructor(_notebookEditor) {
    super();
    this._notebookEditor = _notebookEditor;
    this._localStore = this._register(new DisposableStore());
    this._cellStateListeners = [];
    this._enabled = false;
    this._cellStatusItems = [];
    this._cellOverlayIds = [];
    this._register(this._notebookEditor.onDidChangeModel(() => {
      this._update();
    }));
    this._update();
  }
  toggle() {
    this._enabled = !this._enabled;
    this._update();
  }
  _update() {
    this._localStore.clear();
    this._cellStateListeners.forEach((listener) => listener.dispose());
    this._removeCellOverlays();
    this._removeNotebookOverlay();
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    this._updateListener();
    if (this._enabled) {
      this._createNotebookOverlay();
      this._createCellOverlays();
    }
  }
  _log(cell, e) {
    if (this._enabled) {
      const oldHeight = this._notebookEditor.getViewHeight(cell);
      console.log(`cell#${cell.handle}`, e, `${oldHeight} -> ${cell.layoutInfo.totalHeight}`);
    }
  }
  _createCellOverlays() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    for (let i = 0; i < this._notebookEditor.getLength(); i++) {
      const cell = this._notebookEditor.cellAt(i);
      this._createCellOverlay(cell, i);
    }
    this._localStore.add(this._notebookEditor.onDidChangeViewCells((e) => {
      const addedCells = e.splices.reduce((acc, [, , newCells]) => [...acc, ...newCells], []);
      for (let i = 0; i < addedCells.length; i++) {
        const cellIndex = this._notebookEditor.getCellIndex(addedCells[i]);
        if (cellIndex !== void 0) {
          this._createCellOverlay(addedCells[i], cellIndex);
        }
      }
    }));
  }
  _createNotebookOverlay() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const listViewTop = this._notebookEditor.getLayoutInfo().listViewOffsetTop;
    const scrollTop = this._notebookEditor.scrollTop;
    const overlay = n.div({
      style: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "1000"
      }
    }, [
      // Top line
      n.div({
        style: {
          position: "absolute",
          top: `${listViewTop}px`,
          left: "0",
          width: "100%",
          height: "2px",
          backgroundColor: "rgba(0, 0, 255, 0.7)"
        }
      }),
      // Text label for the notebook overlay
      n.div({
        style: {
          position: "absolute",
          top: `${listViewTop}px`,
          left: "10px",
          backgroundColor: "rgba(0, 0, 255, 0.7)",
          color: "white",
          fontSize: "11px",
          fontWeight: "bold",
          padding: "2px 6px",
          borderRadius: "3px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: "1001"
        }
      }, [`ScrollTop: ${scrollTop}px`])
    ]).keepUpdated(this._store);
    this._notebookOverlayDomNode = overlay.element;
    if (this._notebookOverlayDomNode) {
      this._notebookEditor.getDomNode().appendChild(this._notebookOverlayDomNode);
    }
    this._localStore.add(this._notebookEditor.onDidScroll(() => {
      const scrollTop2 = this._notebookEditor.scrollTop;
      const listViewTop2 = this._notebookEditor.getLayoutInfo().listViewOffsetTop;
      if (this._notebookOverlayDomNode) {
        const labelElement = this._notebookOverlayDomNode.querySelector("div:nth-child(2)");
        if (labelElement) {
          labelElement.textContent = `ScrollTop: ${scrollTop2}px`;
          labelElement.style.top = `${listViewTop2}px`;
        }
        const topLineElement = this._notebookOverlayDomNode.querySelector("div:first-child");
        if (topLineElement) {
          topLineElement.style.top = `${listViewTop2}px`;
        }
      }
    }));
  }
  _createCellOverlay(cell, index) {
    const overlayContainer = document.createElement("div");
    overlayContainer.style.position = "absolute";
    overlayContainer.style.top = "0";
    overlayContainer.style.left = "0";
    overlayContainer.style.width = "100%";
    overlayContainer.style.height = "100%";
    overlayContainer.style.pointerEvents = "none";
    overlayContainer.style.zIndex = "1000";
    const topLine = document.createElement("div");
    topLine.style.position = "absolute";
    topLine.style.top = "0";
    topLine.style.left = "0";
    topLine.style.width = "100%";
    topLine.style.height = "2px";
    topLine.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
    overlayContainer.appendChild(topLine);
    const cellTop = this._notebookEditor.getAbsoluteTopOfElement(cell);
    const label = document.createElement("div");
    label.textContent = `cell #${index} (handle: ${cell.handle}) | AbsoluteTopOfElement: ${cellTop}px`;
    label.style.position = "absolute";
    label.style.top = "0px";
    label.style.right = "10px";
    label.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    label.style.color = "white";
    label.style.fontSize = "11px";
    label.style.fontWeight = "bold";
    label.style.padding = "2px 6px";
    label.style.borderRadius = "3px";
    label.style.whiteSpace = "nowrap";
    label.style.pointerEvents = "none";
    label.style.zIndex = "1001";
    overlayContainer.appendChild(label);
    let overlayId = void 0;
    this._notebookEditor.changeCellOverlays((accessor) => {
      overlayId = accessor.addOverlay({
        cell,
        domNode: overlayContainer
      });
    });
    if (overlayId) {
      this._cellOverlayIds.push(overlayId);
      const updateLayout = /* @__PURE__ */ __name(() => {
        const scrollTop = this._notebookEditor.getAbsoluteTopOfElement(cell);
        label.textContent = `cell #${index} (handle: ${cell.handle}) | AbsoluteTopOfElement: ${scrollTop}px`;
        if (overlayId) {
          this._notebookEditor.changeCellOverlays((accessor) => {
            accessor.layoutOverlay(overlayId);
          });
        }
      }, "updateLayout");
      this._localStore.add(cell.onDidChangeLayout((e) => {
        updateLayout();
      }));
      this._localStore.add(this._notebookEditor.onDidChangeLayout(() => {
        updateLayout();
      }));
    }
  }
  _removeCellOverlays() {
    if (this._cellOverlayIds.length > 0) {
      this._notebookEditor.changeCellOverlays((accessor) => {
        for (const id of this._cellOverlayIds) {
          accessor.removeOverlay(id);
        }
      });
      this._cellOverlayIds = [];
    }
  }
  _removeNotebookOverlay() {
    if (this._notebookOverlayDomNode) {
      this._notebookOverlayDomNode.remove();
      this._notebookOverlayDomNode = void 0;
    }
  }
  _updateListener() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    for (let i = 0; i < this._notebookEditor.getLength(); i++) {
      const cell = this._notebookEditor.cellAt(i);
      this._cellStateListeners.push(cell.onDidChangeLayout((e) => {
        this._log(cell, e);
      }));
    }
    this._localStore.add(this._notebookEditor.onDidChangeViewCells((e) => {
      [...e.splices].reverse().forEach((splice) => {
        const [start, deleted, newCells] = splice;
        const deletedCells = this._cellStateListeners.splice(start, deleted, ...newCells.map((cell) => {
          return cell.onDidChangeLayout((e2) => {
            this._log(cell, e2);
          });
        }));
        dispose(deletedCells);
      });
    }));
    const vm = this._notebookEditor.getViewModel();
    let items = [];
    if (this._enabled) {
      items = this._getItemsForCells();
    }
    this._cellStatusItems = vm.deltaCellStatusBarItems(this._cellStatusItems, items);
  }
  _getItemsForCells() {
    const items = [];
    for (let i = 0; i < this._notebookEditor.getLength(); i++) {
      items.push({
        handle: i,
        items: [
          {
            text: `index: ${i}`,
            alignment: 1,
            priority: Number.MAX_SAFE_INTEGER
          }
        ]
      });
    }
    return items;
  }
  dispose() {
    dispose(this._cellStateListeners);
    this._removeCellOverlays();
    this._removeNotebookOverlay();
    this._localStore.clear();
    super.dispose();
  }
}
registerNotebookContribution(TroubleshootController.id, TroubleshootController);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.toggleLayoutTroubleshoot",
      title: localize2("workbench.notebook.toggleLayoutTroubleshoot", "Toggle Notebook Layout Troubleshoot"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(TroubleshootController.id);
    controller?.toggle();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.inspectLayout",
      title: localize2("workbench.notebook.inspectLayout", "Inspect Notebook Layout"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor || !editor.hasModel()) {
      return;
    }
    for (let i = 0; i < editor.getLength(); i++) {
      const cell = editor.cellAt(i);
      console.log(`cell#${cell.handle}`, cell.layoutInfo);
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.clearNotebookEdtitorTypeCache",
      title: localize2("workbench.notebook.clearNotebookEdtitorTypeCache", "Clear Notebook Editor Type Cache"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const notebookService = accessor.get(INotebookService);
    notebookService.clearEditorCache();
  }
});
export {
  TroubleshootController
};
//# sourceMappingURL=layout.js.map
