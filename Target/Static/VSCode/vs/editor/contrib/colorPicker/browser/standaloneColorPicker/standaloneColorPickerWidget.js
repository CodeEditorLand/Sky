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
import "../colorPicker.css";
import { Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { IEditorHoverRenderContext } from "../../../hover/browser/hoverTypes.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../../browser/editorBrowser.js";
import { PositionAffinity } from "../../../../common/model.js";
import { Position } from "../../../../common/core/position.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorHoverStatusBar } from "../../../hover/browser/contentHoverStatusBar.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { Emitter } from "../../../../../base/common/event.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { IColorInformation } from "../../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { IContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IRange } from "../../../../common/core/range.js";
import { DefaultDocumentColorProvider } from "../defaultDocumentColorProvider.js";
import { IEditorWorkerService } from "../../../../common/services/editorWorker.js";
import { StandaloneColorPickerHover, StandaloneColorPickerParticipant, StandaloneColorPickerRenderedParts } from "./standaloneColorPickerParticipant.js";
import * as dom from "../../../../../base/browser/dom.js";
import { InsertButton } from "../colorPickerParts/colorPickerInsertButton.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
class StandaloneColorPickerResult {
  // The color picker result consists of: an array of color results and a boolean indicating if the color was found in the editor
  constructor(value, foundInEditor) {
    this.value = value;
    this.foundInEditor = foundInEditor;
  }
  static {
    __name(this, "StandaloneColorPickerResult");
  }
}
const PADDING = 8;
const CLOSE_BUTTON_WIDTH = 22;
let StandaloneColorPickerWidget = class extends Disposable {
  constructor(_editor, _standaloneColorPickerVisible, _standaloneColorPickerFocused, _instantiationService, _keybindingService, _languageFeaturesService, _editorWorkerService, _hoverService) {
    super();
    this._editor = _editor;
    this._standaloneColorPickerVisible = _standaloneColorPickerVisible;
    this._standaloneColorPickerFocused = _standaloneColorPickerFocused;
    this._keybindingService = _keybindingService;
    this._languageFeaturesService = _languageFeaturesService;
    this._editorWorkerService = _editorWorkerService;
    this._hoverService = _hoverService;
    this._standaloneColorPickerVisible.set(true);
    this._standaloneColorPickerParticipant = _instantiationService.createInstance(StandaloneColorPickerParticipant, this._editor);
    this._position = this._editor._getViewModel()?.getPrimaryCursorState().modelState.position;
    const editorSelection = this._editor.getSelection();
    const selection = editorSelection ? {
      startLineNumber: editorSelection.startLineNumber,
      startColumn: editorSelection.startColumn,
      endLineNumber: editorSelection.endLineNumber,
      endColumn: editorSelection.endColumn
    } : { startLineNumber: 0, endLineNumber: 0, endColumn: 0, startColumn: 0 };
    const focusTracker = this._register(dom.trackFocus(this._body));
    this._register(focusTracker.onDidBlur((_) => {
      this.hide();
    }));
    this._register(focusTracker.onDidFocus((_) => {
      this.focus();
    }));
    this._register(this._editor.onDidChangeCursorPosition(() => {
      if (!this._selectionSetInEditor) {
        this.hide();
      } else {
        this._selectionSetInEditor = false;
      }
    }));
    this._register(this._editor.onMouseMove((e) => {
      const classList = e.target.element?.classList;
      if (classList && classList.contains("colorpicker-color-decoration")) {
        this.hide();
      }
    }));
    this._register(this.onResult((result) => {
      this._render(result.value, result.foundInEditor);
    }));
    this._start(selection);
    this._body.style.zIndex = "50";
    this._editor.addContentWidget(this);
  }
  static {
    __name(this, "StandaloneColorPickerWidget");
  }
  static ID = "editor.contrib.standaloneColorPickerWidget";
  allowEditorOverflow = true;
  _position = void 0;
  _standaloneColorPickerParticipant;
  _body = document.createElement("div");
  _colorHover = null;
  _selectionSetInEditor = false;
  _onResult = this._register(new Emitter());
  onResult = this._onResult.event;
  _renderedHoverParts = this._register(new MutableDisposable());
  _renderedStatusBar = this._register(new MutableDisposable());
  updateEditor() {
    if (this._colorHover) {
      this._standaloneColorPickerParticipant.updateEditorModel(this._colorHover);
    }
  }
  getId() {
    return StandaloneColorPickerWidget.ID;
  }
  getDomNode() {
    return this._body;
  }
  getPosition() {
    if (!this._position) {
      return null;
    }
    const positionPreference = this._editor.getOption(EditorOption.hover).above;
    return {
      position: this._position,
      secondaryPosition: this._position,
      preference: positionPreference ? [ContentWidgetPositionPreference.ABOVE, ContentWidgetPositionPreference.BELOW] : [ContentWidgetPositionPreference.BELOW, ContentWidgetPositionPreference.ABOVE],
      positionAffinity: PositionAffinity.None
    };
  }
  hide() {
    this.dispose();
    this._standaloneColorPickerVisible.set(false);
    this._standaloneColorPickerFocused.set(false);
    this._editor.removeContentWidget(this);
    this._editor.focus();
  }
  focus() {
    this._standaloneColorPickerFocused.set(true);
    this._body.focus();
  }
  async _start(selection) {
    const computeAsyncResult = await this._computeAsync(selection);
    if (!computeAsyncResult) {
      return;
    }
    this._onResult.fire(new StandaloneColorPickerResult(computeAsyncResult.result, computeAsyncResult.foundInEditor));
  }
  async _computeAsync(range) {
    if (!this._editor.hasModel()) {
      return null;
    }
    const colorInfo = {
      range,
      color: { red: 0, green: 0, blue: 0, alpha: 1 }
    };
    const colorHoverResult = await this._standaloneColorPickerParticipant.createColorHover(colorInfo, new DefaultDocumentColorProvider(this._editorWorkerService), this._languageFeaturesService.colorProvider);
    if (!colorHoverResult) {
      return null;
    }
    return { result: colorHoverResult.colorHover, foundInEditor: colorHoverResult.foundInEditor };
  }
  _render(colorHover, foundInEditor) {
    const fragment = document.createDocumentFragment();
    this._renderedStatusBar.value = this._register(new EditorHoverStatusBar(this._keybindingService, this._hoverService));
    const context = {
      fragment,
      statusBar: this._renderedStatusBar.value,
      onContentsChanged: /* @__PURE__ */ __name(() => {
      }, "onContentsChanged"),
      setMinimumDimensions: /* @__PURE__ */ __name(() => {
      }, "setMinimumDimensions"),
      hide: /* @__PURE__ */ __name(() => this.hide(), "hide"),
      focus: /* @__PURE__ */ __name(() => this.focus(), "focus")
    };
    this._colorHover = colorHover;
    this._renderedHoverParts.value = this._standaloneColorPickerParticipant.renderHoverParts(context, [colorHover]);
    if (!this._renderedHoverParts.value) {
      this._renderedStatusBar.clear();
      this._renderedHoverParts.clear();
      return;
    }
    const colorPicker = this._renderedHoverParts.value.colorPicker;
    this._body.classList.add("standalone-colorpicker-body");
    this._body.style.maxHeight = Math.max(this._editor.getLayoutInfo().height / 4, 250) + "px";
    this._body.style.maxWidth = Math.max(this._editor.getLayoutInfo().width * 0.66, 500) + "px";
    this._body.tabIndex = 0;
    this._body.appendChild(fragment);
    colorPicker.layout();
    const colorPickerBody = colorPicker.body;
    const saturationBoxWidth = colorPickerBody.saturationBox.domNode.clientWidth;
    const widthOfOriginalColorBox = colorPickerBody.domNode.clientWidth - saturationBoxWidth - CLOSE_BUTTON_WIDTH - PADDING;
    const enterButton = colorPicker.body.enterButton;
    enterButton?.onClicked(() => {
      this.updateEditor();
      this.hide();
    });
    const colorPickerHeader = colorPicker.header;
    const pickedColorNode = colorPickerHeader.pickedColorNode;
    pickedColorNode.style.width = saturationBoxWidth + PADDING + "px";
    const originalColorNode = colorPickerHeader.originalColorNode;
    originalColorNode.style.width = widthOfOriginalColorBox + "px";
    const closeButton = colorPicker.header.closeButton;
    closeButton?.onClicked(() => {
      this.hide();
    });
    if (foundInEditor) {
      if (enterButton) {
        enterButton.button.textContent = "Replace";
      }
      this._selectionSetInEditor = true;
      this._editor.setSelection(colorHover.range);
    }
    this._editor.layoutContentWidget(this);
  }
};
StandaloneColorPickerWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ILanguageFeaturesService),
  __decorateParam(6, IEditorWorkerService),
  __decorateParam(7, IHoverService)
], StandaloneColorPickerWidget);
export {
  StandaloneColorPickerWidget
};
//# sourceMappingURL=standaloneColorPickerWidget.js.map
