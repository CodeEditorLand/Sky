var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { getFlatContextMenuActions } from "../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchAsyncDataTree } from "../../../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ViewPane } from "../../../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../../../common/views.js";
import { CONTEXT_VARIABLE_EXTENSIONID, CONTEXT_VARIABLE_INTERFACES, CONTEXT_VARIABLE_LANGUAGE, CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_VALUE } from "../../../../debug/common/debug.js";
import { NotebookVariableDataSource } from "./notebookVariablesDataSource.js";
import { NOTEBOOK_TITLE, NotebookVariableAccessibilityProvider, NotebookVariableRenderer, NotebookVariablesDelegate, REPL_TITLE } from "./notebookVariablesTree.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../../../common/notebookKernelService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { isCompositeNotebookEditorInput } from "../../../common/notebookEditorInput.js";
let NotebookVariablesView = class NotebookVariablesView2 extends ViewPane {
  static {
    __name(this, "NotebookVariablesView");
  }
  static {
    this.ID = "notebookVariablesView";
  }
  constructor(options, editorService, notebookKernelService, notebookExecutionStateService, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, themeService, hoverService, menuService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.notebookKernelService = notebookKernelService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.menuService = menuService;
    this._register(this.editorService.onDidActiveEditorChange(() => this.handleActiveEditorChange()));
    this._register(this.notebookKernelService.onDidNotebookVariablesUpdate(this.handleVariablesChanged.bind(this)));
    this._register(this.notebookExecutionStateService.onDidChangeExecution(this.handleExecutionStateChange.bind(this)));
    this._register(this.editorService.onDidCloseEditor((e) => this.handleCloseEditor(e)));
    this.accessibilityProvider = new NotebookVariableAccessibilityProvider();
    this.handleActiveEditorChange(false);
    this.dataSource = new NotebookVariableDataSource(this.notebookKernelService);
    this.updateScheduler = this._register(new RunOnceScheduler(() => this.tree?.updateChildren(), 100));
  }
  renderBody(container) {
    super.renderBody(container);
    this.element.classList.add("debug-pane");
    this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, "notebookVariablesTree", container, new NotebookVariablesDelegate(), [this.instantiationService.createInstance(NotebookVariableRenderer)], this.dataSource, {
      accessibilityProvider: this.accessibilityProvider,
      identityProvider: { getId: /* @__PURE__ */ __name((e) => e.id, "getId") }
    });
    this.tree.layout();
    if (this.activeNotebook) {
      this.tree.setInput({ kind: "root", notebook: this.activeNotebook });
    }
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
  }
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    const element = e.element;
    const arg = {
      source: element.notebook.uri.toString(),
      name: element.name,
      value: element.value,
      type: element.type,
      expression: element.expression,
      language: element.language,
      extensionId: element.extensionId
    };
    const overlayedContext = this.contextKeyService.createOverlay([
      [CONTEXT_VARIABLE_NAME.key, element.name],
      [CONTEXT_VARIABLE_VALUE.key, element.value],
      [CONTEXT_VARIABLE_TYPE.key, element.type],
      [CONTEXT_VARIABLE_INTERFACES.key, element.interfaces],
      [CONTEXT_VARIABLE_LANGUAGE.key, element.language],
      [CONTEXT_VARIABLE_EXTENSIONID.key, element.extensionId]
    ]);
    const menuActions = this.menuService.getMenuActions(MenuId.NotebookVariablesContext, overlayedContext, { arg, shouldForwardArgs: true });
    const actions = getFlatContextMenuActions(menuActions);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions")
    });
  }
  focus() {
    super.focus();
    this.tree?.domFocus();
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree?.layout(height, width);
  }
  setActiveNotebook(notebookDocument, editor, doUpdate = true) {
    this.activeNotebook = notebookDocument;
    if (isCompositeNotebookEditorInput(editor.input)) {
      this.updateTitle(REPL_TITLE.value);
      this.accessibilityProvider.updateWidgetAriaLabel(REPL_TITLE.value);
    } else {
      this.updateTitle(NOTEBOOK_TITLE.value);
      this.accessibilityProvider.updateWidgetAriaLabel(NOTEBOOK_TITLE.value);
    }
    if (doUpdate) {
      this.tree?.setInput({ kind: "root", notebook: notebookDocument });
      this.updateScheduler.schedule();
    }
  }
  getActiveNotebook() {
    const notebookEditor = this.editorService.activeEditorPane;
    const notebookDocument = getNotebookEditorFromEditorPane(notebookEditor)?.textModel;
    return notebookDocument && notebookEditor ? { notebookDocument, notebookEditor } : void 0;
  }
  handleCloseEditor(e) {
    if (e.editor.resource && e.editor.resource.toString() === this.activeNotebook?.uri.toString()) {
      this.tree?.setInput({ kind: "empty" });
      this.updateScheduler.schedule();
    }
  }
  handleActiveEditorChange(doUpdate = true) {
    const found = this.getActiveNotebook();
    if (found && found.notebookDocument !== this.activeNotebook) {
      this.setActiveNotebook(found.notebookDocument, found.notebookEditor, doUpdate);
    }
  }
  handleExecutionStateChange(event) {
    if (this.activeNotebook && event.affectsNotebook(this.activeNotebook.uri)) {
      this.dataSource.cancel();
      if (event.changed === void 0) {
        this.updateScheduler.schedule();
      } else {
        this.updateScheduler.cancel();
      }
    } else if (!this.getActiveNotebook()) {
      this.editorService.visibleEditorPanes.forEach((editor) => {
        const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
        if (notebookDocument && event.affectsNotebook(notebookDocument.uri)) {
          this.setActiveNotebook(notebookDocument, editor);
        }
      });
    }
  }
  handleVariablesChanged(notebookUri) {
    if (this.activeNotebook && notebookUri.toString() === this.activeNotebook.uri.toString()) {
      this.updateScheduler.schedule();
    } else if (!this.getActiveNotebook()) {
      this.editorService.visibleEditorPanes.forEach((editor) => {
        const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
        if (notebookDocument && notebookDocument.uri.toString() === notebookUri.toString()) {
          this.setActiveNotebook(notebookDocument, editor);
        }
      });
    }
  }
};
NotebookVariablesView = __decorate([
  __param(1, IEditorService),
  __param(2, INotebookKernelService),
  __param(3, INotebookExecutionStateService),
  __param(4, IKeybindingService),
  __param(5, IContextMenuService),
  __param(6, IContextKeyService),
  __param(7, IConfigurationService),
  __param(8, IInstantiationService),
  __param(9, IViewDescriptorService),
  __param(10, IOpenerService),
  __param(11, IQuickInputService),
  __param(12, ICommandService),
  __param(13, IThemeService),
  __param(14, IHoverService),
  __param(15, IMenuService)
], NotebookVariablesView);
export {
  NotebookVariablesView
};
//# sourceMappingURL=notebookVariablesView.js.map
