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
import { h } from "../../../../../../base/browser/dom.js";
import { IView, IViewSize } from "../../../../../../base/browser/ui/grid/grid.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../../base/common/lifecycle.js";
import { IObservable, autorun, derived, observableFromEvent } from "../../../../../../base/common/observable.js";
import { EditorExtensionsRegistry, IEditorContributionDescription } from "../../../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../../editor/common/core/selection.js";
import { CodeLensContribution } from "../../../../../../editor/contrib/codelens/browser/codelensController.js";
import { FoldingController } from "../../../../../../editor/contrib/folding/browser/folding.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from "../../../../../browser/parts/editor/editor.js";
import { setStyle } from "../../utils.js";
import { observableConfigValue } from "../../../../../../platform/observable/common/platformObservableUtils.js";
import { MergeEditorViewModel } from "../viewModel.js";
class CodeEditorView extends Disposable {
  constructor(instantiationService, viewModel, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.viewModel = viewModel;
    this.configurationService = configurationService;
  }
  static {
    __name(this, "CodeEditorView");
  }
  model = this.viewModel.map((m) => (
    /** @description model */
    m?.model
  ));
  htmlElements = h("div.code-view", [
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
  _onDidViewChange = new Emitter();
  view = {
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
  checkboxesVisible = observableConfigValue("mergeEditor.showCheckboxes", false, this.configurationService);
  showDeletionMarkers = observableConfigValue("mergeEditor.showDeletionMarkers", true, this.configurationService);
  useSimplifiedDecorations = observableConfigValue("mergeEditor.useSimplifiedDecorations", false, this.configurationService);
  editor = this.instantiationService.createInstance(
    CodeEditorWidget,
    this.htmlElements.editor,
    {},
    {
      contributions: this.getEditorContributions()
    }
  );
  updateOptions(newOptions) {
    this.editor.updateOptions(newOptions);
  }
  isFocused = observableFromEvent(
    this,
    Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget),
    () => (
      /** @description editor.hasWidgetFocus */
      this.editor.hasWidgetFocus()
    )
  );
  cursorPosition = observableFromEvent(
    this,
    this.editor.onDidChangeCursorPosition,
    () => (
      /** @description editor.getPosition */
      this.editor.getPosition()
    )
  );
  selection = observableFromEvent(
    this,
    this.editor.onDidChangeCursorSelection,
    () => (
      /** @description editor.getSelections */
      this.editor.getSelections()
    )
  );
  cursorLineNumber = this.cursorPosition.map((p) => (
    /** @description cursorPosition.lineNumber */
    p?.lineNumber
  ));
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
let TitleMenu = class extends Disposable {
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
TitleMenu = __decorateClass([
  __decorateParam(2, IInstantiationService)
], TitleMenu);
export {
  CodeEditorView,
  TitleMenu,
  createSelectionsAutorun
};
//# sourceMappingURL=codeEditorView.js.map
