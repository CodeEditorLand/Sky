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
import { h } from "../../../../../../base/browser/dom.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, derived, observableFromEvent } from "../../../../../../base/common/observable.js";
import { EditorExtensionsRegistry } from "../../../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { Selection } from "../../../../../../editor/common/core/selection.js";
import { CodeLensContribution } from "../../../../../../editor/contrib/codelens/browser/codelensController.js";
import { FoldingController } from "../../../../../../editor/contrib/folding/browser/folding.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from "../../../../../browser/parts/editor/editor.js";
import { setStyle } from "../../utils.js";
import { observableConfigValue } from "../../../../../../platform/observable/common/platformObservableUtils.js";
class CodeEditorView extends Disposable {
  static {
    __name(this, "CodeEditorView");
  }
  updateOptions(newOptions) {
    this.editor.updateOptions(newOptions);
  }
  constructor(instantiationService, viewModel, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.viewModel = viewModel;
    this.configurationService = configurationService;
    this.model = this.viewModel.map((m) => (
      /** @description model */
      m?.model
    ));
    this.htmlElements = h("div.code-view", [
      h("div.header@header", [
        h("span.title@title"),
        h("span.description@description"),
        h("span.detail@detail"),
        h("span.toolbar@toolbar")
      ]),
      h("div.container", [
        h("div.gutter@gutterDiv"),
        h("div@editor")
      ])
    ]);
    this._onDidViewChange = this._register(new Emitter());
    this.view = {
      element: this.htmlElements.root,
      minimumWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
      maximumWidth: DEFAULT_EDITOR_MAX_DIMENSIONS.width,
      minimumHeight: DEFAULT_EDITOR_MIN_DIMENSIONS.height,
      maximumHeight: DEFAULT_EDITOR_MAX_DIMENSIONS.height,
      onDidChange: this._onDidViewChange.event,
      layout: /* @__PURE__ */ __name((width, height, top, left) => {
        setStyle(this.htmlElements.root, { width, height, top, left });
        this.editor.layout({
          width: width - this.htmlElements.gutterDiv.clientWidth,
          height: height - this.htmlElements.header.clientHeight
        });
      }, "layout")
      // preferredWidth?: number | undefined;
      // preferredHeight?: number | undefined;
      // priority?: LayoutPriority | undefined;
      // snap?: boolean | undefined;
    };
    this.checkboxesVisible = observableConfigValue("mergeEditor.showCheckboxes", false, this.configurationService);
    this.showDeletionMarkers = observableConfigValue("mergeEditor.showDeletionMarkers", true, this.configurationService);
    this.useSimplifiedDecorations = observableConfigValue("mergeEditor.useSimplifiedDecorations", false, this.configurationService);
    this.editor = this.instantiationService.createInstance(CodeEditorWidget, this.htmlElements.editor, {}, {
      contributions: this.getEditorContributions()
    });
    this.isFocused = observableFromEvent(this, Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget), () => (
      /** @description editor.hasWidgetFocus */
      this.editor.hasWidgetFocus()
    ));
    this.cursorPosition = observableFromEvent(this, this.editor.onDidChangeCursorPosition, () => (
      /** @description editor.getPosition */
      this.editor.getPosition()
    ));
    this.selection = observableFromEvent(this, this.editor.onDidChangeCursorSelection, () => (
      /** @description editor.getSelections */
      this.editor.getSelections()
    ));
    this.cursorLineNumber = this.cursorPosition.map((p) => (
      /** @description cursorPosition.lineNumber */
      p?.lineNumber
    ));
  }
  getEditorContributions() {
    return EditorExtensionsRegistry.getEditorContributions().filter((c) => c.id !== FoldingController.ID && c.id !== CodeLensContribution.ID);
  }
}
function createSelectionsAutorun(codeEditorView, translateRange) {
  const selections = derived((reader) => {
    const viewModel = codeEditorView.viewModel.read(reader);
    if (!viewModel) {
      return [];
    }
    const baseRange = viewModel.selectionInBase.read(reader);
    if (!baseRange || baseRange.sourceEditor === codeEditorView) {
      return [];
    }
    return baseRange.rangesInBase.map((r) => translateRange(r, viewModel));
  });
  return autorun((reader) => {
    const ranges = selections.read(reader);
    if (ranges.length === 0) {
      return;
    }
    codeEditorView.editor.setSelections(ranges.map((r) => new Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)));
  });
}
__name(createSelectionsAutorun, "createSelectionsAutorun");
let TitleMenu = class TitleMenu2 extends Disposable {
  static {
    __name(this, "TitleMenu");
  }
  constructor(menuId, targetHtmlElement, instantiationService) {
    super();
    const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, targetHtmlElement, menuId, {
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name((g) => g === "primary", "primaryGroup") }
    });
    this._store.add(toolbar);
  }
};
TitleMenu = __decorate([
  __param(2, IInstantiationService)
], TitleMenu);
export {
  CodeEditorView,
  TitleMenu,
  createSelectionsAutorun
};
//# sourceMappingURL=codeEditorView.js.map
