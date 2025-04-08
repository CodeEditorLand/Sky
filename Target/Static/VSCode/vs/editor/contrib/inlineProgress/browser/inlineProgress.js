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
import * as dom from "../../../../base/browser/dom.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { noBreakWhitespace } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import "./inlineProgressWidget.css";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IPosition } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IEditorDecorationsCollection } from "../../../common/editorCommon.js";
import { TrackedRangeStickiness } from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
const inlineProgressDecoration = ModelDecorationOptions.register({
  description: "inline-progress-widget",
  stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
  showIfCollapsed: true,
  after: {
    content: noBreakWhitespace,
    inlineClassName: "inline-editor-progress-decoration",
    inlineClassNameAffectsLetterSpacing: true
  }
});
class InlineProgressWidget extends Disposable {
  constructor(typeId, editor, range, title, delegate) {
    super();
    this.typeId = typeId;
    this.editor = editor;
    this.range = range;
    this.delegate = delegate;
    this.create(title);
    this.editor.addContentWidget(this);
    this.editor.layoutContentWidget(this);
  }
  static {
    __name(this, "InlineProgressWidget");
  }
  static baseId = "editor.widget.inlineProgressWidget";
  allowEditorOverflow = false;
  suppressMouseDown = true;
  domNode;
  create(title) {
    this.domNode = dom.$(".inline-progress-widget");
    this.domNode.role = "button";
    this.domNode.title = title;
    const iconElement = dom.$("span.icon");
    this.domNode.append(iconElement);
    iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
    const updateSize = /* @__PURE__ */ __name(() => {
      const lineHeight = this.editor.getOption(EditorOption.lineHeight);
      this.domNode.style.height = `${lineHeight}px`;
      this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
    }, "updateSize");
    updateSize();
    this._register(this.editor.onDidChangeConfiguration((c) => {
      if (c.hasChanged(EditorOption.fontSize) || c.hasChanged(EditorOption.lineHeight)) {
        updateSize();
      }
    }));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, (e) => {
      this.delegate.cancel();
    }));
  }
  getId() {
    return InlineProgressWidget.baseId + "." + this.typeId;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return {
      position: { lineNumber: this.range.startLineNumber, column: this.range.startColumn },
      preference: [ContentWidgetPositionPreference.EXACT]
    };
  }
  dispose() {
    super.dispose();
    this.editor.removeContentWidget(this);
  }
}
let InlineProgressManager = class extends Disposable {
  constructor(id, _editor, _instantiationService) {
    super();
    this.id = id;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._currentDecorations = _editor.createDecorationsCollection();
  }
  static {
    __name(this, "InlineProgressManager");
  }
  /** Delay before showing the progress widget */
  _showDelay = 500;
  // ms
  _showPromise = this._register(new MutableDisposable());
  _currentDecorations;
  _currentWidget = this._register(new MutableDisposable());
  _operationIdPool = 0;
  _currentOperation;
  dispose() {
    super.dispose();
    this._currentDecorations.clear();
  }
  async showWhile(position, title, promise, delegate, delayOverride) {
    const operationId = this._operationIdPool++;
    this._currentOperation = operationId;
    this.clear();
    this._showPromise.value = disposableTimeout(() => {
      const range = Range.fromPositions(position);
      const decorationIds = this._currentDecorations.set([{
        range,
        options: inlineProgressDecoration
      }]);
      if (decorationIds.length > 0) {
        this._currentWidget.value = this._instantiationService.createInstance(InlineProgressWidget, this.id, this._editor, range, title, delegate);
      }
    }, delayOverride ?? this._showDelay);
    try {
      return await promise;
    } finally {
      if (this._currentOperation === operationId) {
        this.clear();
        this._currentOperation = void 0;
      }
    }
  }
  clear() {
    this._showPromise.clear();
    this._currentDecorations.clear();
    this._currentWidget.clear();
  }
};
InlineProgressManager = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineProgressManager);
export {
  InlineProgressManager
};
//# sourceMappingURL=inlineProgress.js.map
