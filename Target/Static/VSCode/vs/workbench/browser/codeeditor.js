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
import { IAction } from "../../base/common/actions.js";
import { Emitter } from "../../base/common/event.js";
import { Disposable, DisposableStore } from "../../base/common/lifecycle.js";
import { isEqual } from "../../base/common/resources.js";
import { URI } from "../../base/common/uri.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference, isCodeEditor, isCompositeEditor } from "../../editor/browser/editorBrowser.js";
import { EmbeddedCodeEditorWidget } from "../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorOption } from "../../editor/common/config/editorOptions.js";
import { IRange } from "../../editor/common/core/range.js";
import { CursorChangeReason, ICursorPositionChangedEvent } from "../../editor/common/cursorEvents.js";
import { IEditorContribution } from "../../editor/common/editorCommon.js";
import { IModelDecorationsChangeAccessor, TrackedRangeStickiness } from "../../editor/common/model.js";
import { ModelDecorationOptions } from "../../editor/common/model/textModel.js";
import { AbstractFloatingClickMenu, FloatingClickWidget } from "../../platform/actions/browser/floatingMenu.js";
import { IMenuService, MenuId } from "../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../platform/keybinding/common/keybinding.js";
import { IEditorService } from "../services/editor/common/editorService.js";
let RangeHighlightDecorations = class extends Disposable {
  constructor(editorService) {
    super();
    this.editorService = editorService;
  }
  static {
    __name(this, "RangeHighlightDecorations");
  }
  _onHighlightRemoved = this._register(new Emitter());
  onHighlightRemoved = this._onHighlightRemoved.event;
  rangeHighlightDecorationId = null;
  editor = null;
  editorDisposables = this._register(new DisposableStore());
  removeHighlightRange() {
    if (this.editor && this.rangeHighlightDecorationId) {
      const decorationId = this.rangeHighlightDecorationId;
      this.editor.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
      });
      this._onHighlightRemoved.fire();
    }
    this.rangeHighlightDecorationId = null;
  }
  highlightRange(range, editor) {
    editor = editor ?? this.getEditor(range);
    if (isCodeEditor(editor)) {
      this.doHighlightRange(editor, range);
    } else if (isCompositeEditor(editor) && isCodeEditor(editor.activeCodeEditor)) {
      this.doHighlightRange(editor.activeCodeEditor, range);
    }
  }
  doHighlightRange(editor, selectionRange) {
    this.removeHighlightRange();
    editor.changeDecorations((changeAccessor) => {
      this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, this.createRangeHighlightDecoration(selectionRange.isWholeLine));
    });
    this.setEditor(editor);
  }
  getEditor(resourceRange) {
    const resource = this.editorService.activeEditor?.resource;
    if (resource && isEqual(resource, resourceRange.resource) && isCodeEditor(this.editorService.activeTextEditorControl)) {
      return this.editorService.activeTextEditorControl;
    }
    return void 0;
  }
  setEditor(editor) {
    if (this.editor !== editor) {
      this.editorDisposables.clear();
      this.editor = editor;
      this.editorDisposables.add(this.editor.onDidChangeCursorPosition((e) => {
        if (e.reason === CursorChangeReason.NotSet || e.reason === CursorChangeReason.Explicit || e.reason === CursorChangeReason.Undo || e.reason === CursorChangeReason.Redo) {
          this.removeHighlightRange();
        }
      }));
      this.editorDisposables.add(this.editor.onDidChangeModel(() => {
        this.removeHighlightRange();
      }));
      this.editorDisposables.add(this.editor.onDidDispose(() => {
        this.removeHighlightRange();
        this.editor = null;
      }));
    }
  }
  static _WHOLE_LINE_RANGE_HIGHLIGHT = ModelDecorationOptions.register({
    description: "codeeditor-range-highlight-whole",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "rangeHighlight",
    isWholeLine: true
  });
  static _RANGE_HIGHLIGHT = ModelDecorationOptions.register({
    description: "codeeditor-range-highlight",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "rangeHighlight"
  });
  createRangeHighlightDecoration(isWholeLine = true) {
    return isWholeLine ? RangeHighlightDecorations._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations._RANGE_HIGHLIGHT;
  }
  dispose() {
    super.dispose();
    if (this.editor?.getModel()) {
      this.removeHighlightRange();
      this.editor = null;
    }
  }
};
RangeHighlightDecorations = __decorateClass([
  __decorateParam(0, IEditorService)
], RangeHighlightDecorations);
let FloatingEditorClickWidget = class extends FloatingClickWidget {
  constructor(editor, label, keyBindingAction, keybindingService) {
    super(
      keyBindingAction && keybindingService.lookupKeybinding(keyBindingAction) ? `${label} (${keybindingService.lookupKeybinding(keyBindingAction).getLabel()})` : label
    );
    this.editor = editor;
  }
  static {
    __name(this, "FloatingEditorClickWidget");
  }
  getId() {
    return "editor.overlayWidget.floatingClickWidget";
  }
  getPosition() {
    return {
      preference: OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
    };
  }
  render() {
    super.render();
    this.editor.addOverlayWidget(this);
  }
  dispose() {
    this.editor.removeOverlayWidget(this);
    super.dispose();
  }
};
FloatingEditorClickWidget = __decorateClass([
  __decorateParam(3, IKeybindingService)
], FloatingEditorClickWidget);
let FloatingEditorClickMenu = class extends AbstractFloatingClickMenu {
  constructor(editor, instantiationService, menuService, contextKeyService) {
    super(MenuId.EditorContent, menuService, contextKeyService);
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.render();
  }
  static {
    __name(this, "FloatingEditorClickMenu");
  }
  static ID = "editor.contrib.floatingClickMenu";
  createWidget(action) {
    return this.instantiationService.createInstance(FloatingEditorClickWidget, this.editor, action.label, action.id);
  }
  isVisible() {
    return !(this.editor instanceof EmbeddedCodeEditorWidget) && this.editor?.hasModel() && !this.editor.getOption(EditorOption.inDiffEditor);
  }
  getActionArg() {
    return this.editor.getModel()?.uri;
  }
};
FloatingEditorClickMenu = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], FloatingEditorClickMenu);
export {
  FloatingEditorClickMenu,
  FloatingEditorClickWidget,
  RangeHighlightDecorations
};
//# sourceMappingURL=codeeditor.js.map
