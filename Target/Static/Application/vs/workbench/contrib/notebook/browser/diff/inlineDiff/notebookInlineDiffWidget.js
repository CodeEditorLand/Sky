var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { EditorExtensionsRegistry } from "../../../../../../editor/browser/editorExtensions.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { NotebookInlineDiffDecorationContribution } from "./notebookInlineDiff.js";
import { NotebookEditorExtensionsRegistry } from "../../notebookEditorExtensions.js";
import { INotebookEditorService } from "../../services/notebookEditorService.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let NotebookInlineDiffWidget = class NotebookInlineDiffWidget2 extends Disposable {
  static {
    __name(this, "NotebookInlineDiffWidget");
  }
  get editorWidget() {
    return this.widget.value;
  }
  constructor(rootElement, groupId, window, options, dimension, instantiationService, widgetService) {
    super();
    this.rootElement = rootElement;
    this.groupId = groupId;
    this.window = window;
    this.options = options;
    this.dimension = dimension;
    this.instantiationService = instantiationService;
    this.widgetService = widgetService;
    this.widget = { value: void 0 };
  }
  async show(input, model, previousModel, options) {
    if (!this.widget.value) {
      this.createNotebookWidget(input, this.groupId, this.rootElement);
    }
    if (this.dimension) {
      this.widget.value?.layout(this.dimension, this.rootElement, this.position);
    }
    if (model) {
      await this.widget.value?.setOptions({ ...options });
      this.widget.value?.notebookOptions.previousModelToCompare.set(previousModel, void 0);
      await this.widget.value.setModel(model, options?.viewState);
    }
  }
  hide() {
    if (this.widget.value) {
      this.widget.value.notebookOptions.previousModelToCompare.set(void 0, void 0);
      this.widget.value.onWillHide();
    }
  }
  setLayout(dimension, position) {
    this.dimension = dimension;
    this.position = position;
  }
  createNotebookWidget(input, groupId, rootElement) {
    const contributions = NotebookEditorExtensionsRegistry.getSomeEditorContributions([NotebookInlineDiffDecorationContribution.ID]);
    const menuIds = {
      notebookToolbar: MenuId.NotebookToolbar,
      cellTitleToolbar: MenuId.NotebookCellTitle,
      cellDeleteToolbar: MenuId.NotebookCellDelete,
      cellInsertToolbar: MenuId.NotebookCellBetween,
      cellTopInsertToolbar: MenuId.NotebookCellListTop,
      cellExecuteToolbar: MenuId.NotebookCellExecute,
      cellExecutePrimary: void 0
    };
    const skipContributions = [
      "editor.contrib.review",
      "editor.contrib.floatingClickMenu",
      "editor.contrib.dirtydiff",
      "editor.contrib.testingOutputPeek",
      "editor.contrib.testingDecorations",
      "store.contrib.stickyScrollController",
      "editor.contrib.findController",
      "editor.contrib.emptyTextEditorHint"
    ];
    const cellEditorContributions = EditorExtensionsRegistry.getEditorContributions().filter((c) => skipContributions.indexOf(c.id) === -1);
    this.widget = this.instantiationService.invokeFunction(this.widgetService.retrieveWidget, groupId, input, { contributions, menuIds, cellEditorContributions, options: this.options }, this.dimension, this.window);
    if (this.rootElement && this.widget.value.getDomNode()) {
      this.rootElement.setAttribute("aria-flowto", this.widget.value.getDomNode().id || "");
      DOM.setParentFlowTo(this.widget.value.getDomNode(), this.rootElement);
    }
  }
  dispose() {
    super.dispose();
    if (this.widget.value) {
      this.widget.value.dispose();
    }
  }
};
NotebookInlineDiffWidget = __decorate([
  __param(5, IInstantiationService),
  __param(6, INotebookEditorService)
], NotebookInlineDiffWidget);
export {
  NotebookInlineDiffWidget
};
//# sourceMappingURL=notebookInlineDiffWidget.js.map
