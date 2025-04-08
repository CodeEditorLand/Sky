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
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import { StandaloneColorPickerWidget } from "./standaloneColorPickerWidget.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
let StandaloneColorPickerController = class extends Disposable {
  constructor(_editor, _contextKeyService, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._standaloneColorPickerVisible = EditorContextKeys.standaloneColorPickerVisible.bindTo(_contextKeyService);
    this._standaloneColorPickerFocused = EditorContextKeys.standaloneColorPickerFocused.bindTo(_contextKeyService);
  }
  static {
    __name(this, "StandaloneColorPickerController");
  }
  static ID = "editor.contrib.standaloneColorPickerController";
  _standaloneColorPickerWidget = null;
  _standaloneColorPickerVisible;
  _standaloneColorPickerFocused;
  showOrFocus() {
    if (!this._editor.hasModel()) {
      return;
    }
    if (!this._standaloneColorPickerVisible.get()) {
      this._standaloneColorPickerWidget = this._instantiationService.createInstance(
        StandaloneColorPickerWidget,
        this._editor,
        this._standaloneColorPickerVisible,
        this._standaloneColorPickerFocused
      );
    } else if (!this._standaloneColorPickerFocused.get()) {
      this._standaloneColorPickerWidget?.focus();
    }
  }
  hide() {
    this._standaloneColorPickerFocused.set(false);
    this._standaloneColorPickerVisible.set(false);
    this._standaloneColorPickerWidget?.hide();
    this._editor.focus();
  }
  insertColor() {
    this._standaloneColorPickerWidget?.updateEditor();
    this.hide();
  }
  static get(editor) {
    return editor.getContribution(StandaloneColorPickerController.ID);
  }
};
StandaloneColorPickerController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], StandaloneColorPickerController);
export {
  StandaloneColorPickerController
};
//# sourceMappingURL=standaloneColorPickerController.js.map
