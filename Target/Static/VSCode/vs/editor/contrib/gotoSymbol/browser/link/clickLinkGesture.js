var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import * as platform from "../../../../../base/common/platform.js";
import { ICodeEditor, IEditorMouseEvent, IMouseTarget } from "../../../../browser/editorBrowser.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { ICursorSelectionChangedEvent } from "../../../../common/cursorEvents.js";
function hasModifier(e, modifier) {
  return !!e[modifier];
}
__name(hasModifier, "hasModifier");
class ClickLinkMouseEvent {
  static {
    __name(this, "ClickLinkMouseEvent");
  }
  target;
  hasTriggerModifier;
  hasSideBySideModifier;
  isNoneOrSingleMouseDown;
  isLeftClick;
  isMiddleClick;
  isRightClick;
  constructor(source, opts) {
    this.target = source.target;
    this.isLeftClick = source.event.leftButton;
    this.isMiddleClick = source.event.middleButton;
    this.isRightClick = source.event.rightButton;
    this.hasTriggerModifier = hasModifier(source.event, opts.triggerModifier);
    this.hasSideBySideModifier = hasModifier(source.event, opts.triggerSideBySideModifier);
    this.isNoneOrSingleMouseDown = source.event.detail <= 1;
  }
}
class ClickLinkKeyboardEvent {
  static {
    __name(this, "ClickLinkKeyboardEvent");
  }
  keyCodeIsTriggerKey;
  keyCodeIsSideBySideKey;
  hasTriggerModifier;
  constructor(source, opts) {
    this.keyCodeIsTriggerKey = source.keyCode === opts.triggerKey;
    this.keyCodeIsSideBySideKey = source.keyCode === opts.triggerSideBySideKey;
    this.hasTriggerModifier = hasModifier(source, opts.triggerModifier);
  }
}
class ClickLinkOptions {
  static {
    __name(this, "ClickLinkOptions");
  }
  triggerKey;
  triggerModifier;
  triggerSideBySideKey;
  triggerSideBySideModifier;
  constructor(triggerKey, triggerModifier, triggerSideBySideKey, triggerSideBySideModifier) {
    this.triggerKey = triggerKey;
    this.triggerModifier = triggerModifier;
    this.triggerSideBySideKey = triggerSideBySideKey;
    this.triggerSideBySideModifier = triggerSideBySideModifier;
  }
  equals(other) {
    return this.triggerKey === other.triggerKey && this.triggerModifier === other.triggerModifier && this.triggerSideBySideKey === other.triggerSideBySideKey && this.triggerSideBySideModifier === other.triggerSideBySideModifier;
  }
}
function createOptions(multiCursorModifier) {
  if (multiCursorModifier === "altKey") {
    if (platform.isMacintosh) {
      return new ClickLinkOptions(KeyCode.Meta, "metaKey", KeyCode.Alt, "altKey");
    }
    return new ClickLinkOptions(KeyCode.Ctrl, "ctrlKey", KeyCode.Alt, "altKey");
  }
  if (platform.isMacintosh) {
    return new ClickLinkOptions(KeyCode.Alt, "altKey", KeyCode.Meta, "metaKey");
  }
  return new ClickLinkOptions(KeyCode.Alt, "altKey", KeyCode.Ctrl, "ctrlKey");
}
__name(createOptions, "createOptions");
class ClickLinkGesture extends Disposable {
  static {
    __name(this, "ClickLinkGesture");
  }
  _onMouseMoveOrRelevantKeyDown = this._register(new Emitter());
  onMouseMoveOrRelevantKeyDown = this._onMouseMoveOrRelevantKeyDown.event;
  _onExecute = this._register(new Emitter());
  onExecute = this._onExecute.event;
  _onCancel = this._register(new Emitter());
  onCancel = this._onCancel.event;
  _editor;
  _extractLineNumberFromMouseEvent;
  _opts;
  _lastMouseMoveEvent;
  _hasTriggerKeyOnMouseDown;
  _lineNumberOnMouseDown;
  constructor(editor, opts) {
    super();
    this._editor = editor;
    this._extractLineNumberFromMouseEvent = opts?.extractLineNumberFromMouseEvent ?? ((e) => e.target.position ? e.target.position.lineNumber : 0);
    this._opts = createOptions(this._editor.getOption(EditorOption.multiCursorModifier));
    this._lastMouseMoveEvent = null;
    this._hasTriggerKeyOnMouseDown = false;
    this._lineNumberOnMouseDown = 0;
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.multiCursorModifier)) {
        const newOpts = createOptions(this._editor.getOption(EditorOption.multiCursorModifier));
        if (this._opts.equals(newOpts)) {
          return;
        }
        this._opts = newOpts;
        this._lastMouseMoveEvent = null;
        this._hasTriggerKeyOnMouseDown = false;
        this._lineNumberOnMouseDown = 0;
        this._onCancel.fire();
      }
    }));
    this._register(this._editor.onMouseMove((e) => this._onEditorMouseMove(new ClickLinkMouseEvent(e, this._opts))));
    this._register(this._editor.onMouseDown((e) => this._onEditorMouseDown(new ClickLinkMouseEvent(e, this._opts))));
    this._register(this._editor.onMouseUp((e) => this._onEditorMouseUp(new ClickLinkMouseEvent(e, this._opts))));
    this._register(this._editor.onKeyDown((e) => this._onEditorKeyDown(new ClickLinkKeyboardEvent(e, this._opts))));
    this._register(this._editor.onKeyUp((e) => this._onEditorKeyUp(new ClickLinkKeyboardEvent(e, this._opts))));
    this._register(this._editor.onMouseDrag(() => this._resetHandler()));
    this._register(this._editor.onDidChangeCursorSelection((e) => this._onDidChangeCursorSelection(e)));
    this._register(this._editor.onDidChangeModel((e) => this._resetHandler()));
    this._register(this._editor.onDidChangeModelContent(() => this._resetHandler()));
    this._register(this._editor.onDidScrollChange((e) => {
      if (e.scrollTopChanged || e.scrollLeftChanged) {
        this._resetHandler();
      }
    }));
  }
  _onDidChangeCursorSelection(e) {
    if (e.selection && e.selection.startColumn !== e.selection.endColumn) {
      this._resetHandler();
    }
  }
  _onEditorMouseMove(mouseEvent) {
    this._lastMouseMoveEvent = mouseEvent;
    this._onMouseMoveOrRelevantKeyDown.fire([mouseEvent, null]);
  }
  _onEditorMouseDown(mouseEvent) {
    this._hasTriggerKeyOnMouseDown = mouseEvent.hasTriggerModifier;
    this._lineNumberOnMouseDown = this._extractLineNumberFromMouseEvent(mouseEvent);
  }
  _onEditorMouseUp(mouseEvent) {
    const currentLineNumber = this._extractLineNumberFromMouseEvent(mouseEvent);
    if (this._hasTriggerKeyOnMouseDown && this._lineNumberOnMouseDown && this._lineNumberOnMouseDown === currentLineNumber) {
      this._onExecute.fire(mouseEvent);
    }
  }
  _onEditorKeyDown(e) {
    if (this._lastMouseMoveEvent && (e.keyCodeIsTriggerKey || e.keyCodeIsSideBySideKey && e.hasTriggerModifier)) {
      this._onMouseMoveOrRelevantKeyDown.fire([this._lastMouseMoveEvent, e]);
    } else if (e.hasTriggerModifier) {
      this._onCancel.fire();
    }
  }
  _onEditorKeyUp(e) {
    if (e.keyCodeIsTriggerKey) {
      this._onCancel.fire();
    }
  }
  _resetHandler() {
    this._lastMouseMoveEvent = null;
    this._hasTriggerKeyOnMouseDown = false;
    this._onCancel.fire();
  }
}
export {
  ClickLinkGesture,
  ClickLinkKeyboardEvent,
  ClickLinkMouseEvent,
  ClickLinkOptions
};
//# sourceMappingURL=clickLinkGesture.js.map
