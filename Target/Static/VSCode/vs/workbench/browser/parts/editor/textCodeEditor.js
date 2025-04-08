var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { URI } from "../../../../base/common/uri.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { ITextEditorPane } from "../../../common/editor.js";
import { applyTextEditorOptions } from "../../../common/editor/editorOptions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { isEqual } from "../../../../base/common/resources.js";
import { IEditorOptions as ICodeEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IEditorViewState, ScrollType } from "../../../../editor/common/editorCommon.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { AbstractTextEditor } from "./textEditor.js";
import { Dimension } from "../../../../base/browser/dom.js";
class AbstractTextCodeEditor extends AbstractTextEditor {
  static {
    __name(this, "AbstractTextCodeEditor");
  }
  editorControl = void 0;
  get scopedContextKeyService() {
    return this.editorControl?.invokeWithinContext((accessor) => accessor.get(IContextKeyService));
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize("textEditor", "Text Editor");
  }
  createEditorControl(parent, initialOptions) {
    this.editorControl = this._register(this.instantiationService.createInstance(CodeEditorWidget, parent, initialOptions, this.getCodeEditorWidgetOptions()));
  }
  getCodeEditorWidgetOptions() {
    return /* @__PURE__ */ Object.create(null);
  }
  updateEditorControlOptions(options) {
    this.editorControl?.updateOptions(options);
  }
  getMainControl() {
    return this.editorControl;
  }
  getControl() {
    return this.editorControl;
  }
  computeEditorViewState(resource) {
    if (!this.editorControl) {
      return void 0;
    }
    const model = this.editorControl.getModel();
    if (!model) {
      return void 0;
    }
    const modelUri = model.uri;
    if (!modelUri) {
      return void 0;
    }
    if (!isEqual(modelUri, resource)) {
      return void 0;
    }
    return this.editorControl.saveViewState() ?? void 0;
  }
  setOptions(options) {
    super.setOptions(options);
    if (options) {
      applyTextEditorOptions(options, assertIsDefined(this.editorControl), ScrollType.Smooth);
    }
  }
  focus() {
    super.focus();
    this.editorControl?.focus();
  }
  hasFocus() {
    return this.editorControl?.hasTextFocus() || super.hasFocus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (visible) {
      this.editorControl?.onVisible();
    } else {
      this.editorControl?.onHide();
    }
  }
  layout(dimension) {
    this.editorControl?.layout(dimension);
  }
}
export {
  AbstractTextCodeEditor
};
//# sourceMappingURL=textCodeEditor.js.map
