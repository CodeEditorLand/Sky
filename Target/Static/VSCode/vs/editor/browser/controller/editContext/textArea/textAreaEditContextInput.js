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
import * as browser from "../../../../../base/browser/browser.js";
import * as dom from "../../../../../base/browser/dom.js";
import { DomEmitter } from "../../../../../base/browser/event.js";
import { IKeyboardEvent, StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { inputLatency } from "../../../../../base/browser/performance.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { Disposable, IDisposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../../base/common/platform.js";
import * as strings from "../../../../../base/common/strings.js";
import { Position } from "../../../../common/core/position.js";
import { Selection } from "../../../../common/core/selection.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { ClipboardDataToCopy, ClipboardEventUtils, ClipboardStoredMetadata, InMemoryClipboardMetadataManager } from "../clipboardUtils.js";
import { _debugComposition, ITextAreaWrapper, ITypeData, TextAreaState } from "./textAreaEditContextState.js";
var TextAreaSyntethicEvents;
((TextAreaSyntethicEvents2) => {
  TextAreaSyntethicEvents2.Tap = "-monaco-textarea-synthetic-tap";
})(TextAreaSyntethicEvents || (TextAreaSyntethicEvents = {}));
class CompositionContext {
  static {
    __name(this, "CompositionContext");
  }
  _lastTypeTextLength;
  constructor() {
    this._lastTypeTextLength = 0;
  }
  handleCompositionUpdate(text) {
    text = text || "";
    const typeInput = {
      text,
      replacePrevCharCnt: this._lastTypeTextLength,
      replaceNextCharCnt: 0,
      positionDelta: 0
    };
    this._lastTypeTextLength = text.length;
    return typeInput;
  }
}
let TextAreaInput = class extends Disposable {
  constructor(_host, _textArea, _OS, _browser, _accessibilityService, _logService) {
    super();
    this._host = _host;
    this._textArea = _textArea;
    this._OS = _OS;
    this._browser = _browser;
    this._accessibilityService = _accessibilityService;
    this._logService = _logService;
    this._asyncTriggerCut = this._register(new RunOnceScheduler(() => this._onCut.fire(), 0));
    this._textAreaState = TextAreaState.EMPTY;
    this._selectionChangeListener = null;
    if (this._accessibilityService.isScreenReaderOptimized()) {
      this.writeNativeTextAreaContent("ctor");
    }
    this._register(Event.runAndSubscribe(this._accessibilityService.onDidChangeScreenReaderOptimized, () => {
      if (this._accessibilityService.isScreenReaderOptimized() && !this._asyncFocusGainWriteScreenReaderContent.value) {
        this._asyncFocusGainWriteScreenReaderContent.value = this._register(new RunOnceScheduler(() => this.writeNativeTextAreaContent("asyncFocusGain"), 0));
      } else {
        this._asyncFocusGainWriteScreenReaderContent.clear();
      }
    }));
    this._hasFocus = false;
    this._currentComposition = null;
    let lastKeyDown = null;
    this._register(this._textArea.onKeyDown((_e) => {
      const e = new StandardKeyboardEvent(_e);
      if (e.keyCode === KeyCode.KEY_IN_COMPOSITION || this._currentComposition && e.keyCode === KeyCode.Backspace) {
        e.stopPropagation();
      }
      if (e.equals(KeyCode.Escape)) {
        e.preventDefault();
      }
      lastKeyDown = e;
      this._onKeyDown.fire(e);
    }));
    this._register(this._textArea.onKeyUp((_e) => {
      const e = new StandardKeyboardEvent(_e);
      this._onKeyUp.fire(e);
    }));
    this._register(this._textArea.onCompositionStart((e) => {
      if (_debugComposition) {
        console.log(`[compositionstart]`, e);
      }
      const currentComposition = new CompositionContext();
      if (this._currentComposition) {
        this._currentComposition = currentComposition;
        return;
      }
      this._currentComposition = currentComposition;
      if (this._OS === OperatingSystem.Macintosh && lastKeyDown && lastKeyDown.equals(KeyCode.KEY_IN_COMPOSITION) && this._textAreaState.selectionStart === this._textAreaState.selectionEnd && this._textAreaState.selectionStart > 0 && this._textAreaState.value.substr(this._textAreaState.selectionStart - 1, 1) === e.data && (lastKeyDown.code === "ArrowRight" || lastKeyDown.code === "ArrowLeft")) {
        if (_debugComposition) {
          console.log(`[compositionstart] Handling long press case on macOS + arrow key`, e);
        }
        currentComposition.handleCompositionUpdate("x");
        this._onCompositionStart.fire({ data: e.data });
        return;
      }
      if (this._browser.isAndroid) {
        this._onCompositionStart.fire({ data: e.data });
        return;
      }
      this._onCompositionStart.fire({ data: e.data });
    }));
    this._register(this._textArea.onCompositionUpdate((e) => {
      if (_debugComposition) {
        console.log(`[compositionupdate]`, e);
      }
      const currentComposition = this._currentComposition;
      if (!currentComposition) {
        return;
      }
      if (this._browser.isAndroid) {
        const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
        const typeInput2 = TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
        this._textAreaState = newState;
        this._onType.fire(typeInput2);
        this._onCompositionUpdate.fire(e);
        return;
      }
      const typeInput = currentComposition.handleCompositionUpdate(e.data);
      this._textAreaState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      this._onType.fire(typeInput);
      this._onCompositionUpdate.fire(e);
    }));
    this._register(this._textArea.onCompositionEnd((e) => {
      if (_debugComposition) {
        console.log(`[compositionend]`, e);
      }
      const currentComposition = this._currentComposition;
      if (!currentComposition) {
        return;
      }
      this._currentComposition = null;
      if (this._browser.isAndroid) {
        const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
        const typeInput2 = TextAreaState.deduceAndroidCompositionInput(this._textAreaState, newState);
        this._textAreaState = newState;
        this._onType.fire(typeInput2);
        this._onCompositionEnd.fire();
        return;
      }
      const typeInput = currentComposition.handleCompositionUpdate(e.data);
      this._textAreaState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      this._onType.fire(typeInput);
      this._onCompositionEnd.fire();
    }));
    this._register(this._textArea.onInput((e) => {
      if (_debugComposition) {
        console.log(`[input]`, e);
      }
      this._textArea.setIgnoreSelectionChangeTime("received input event");
      if (this._currentComposition) {
        return;
      }
      const newState = TextAreaState.readFromTextArea(this._textArea, this._textAreaState);
      const typeInput = TextAreaState.deduceInput(
        this._textAreaState,
        newState,
        /*couldBeEmojiInput*/
        this._OS === OperatingSystem.Macintosh
      );
      if (typeInput.replacePrevCharCnt === 0 && typeInput.text.length === 1) {
        if (strings.isHighSurrogate(typeInput.text.charCodeAt(0)) || typeInput.text.charCodeAt(0) === 127) {
          return;
        }
      }
      this._textAreaState = newState;
      if (typeInput.text !== "" || typeInput.replacePrevCharCnt !== 0 || typeInput.replaceNextCharCnt !== 0 || typeInput.positionDelta !== 0) {
        this._onType.fire(typeInput);
      }
    }));
    this._register(this._textArea.onCut((e) => {
      this._textArea.setIgnoreSelectionChangeTime("received cut event");
      this._ensureClipboardGetsEditorSelection(e);
      this._asyncTriggerCut.schedule();
    }));
    this._register(this._textArea.onCopy((e) => {
      this._ensureClipboardGetsEditorSelection(e);
    }));
    this._register(this._textArea.onPaste((e) => {
      this._textArea.setIgnoreSelectionChangeTime("received paste event");
      e.preventDefault();
      if (!e.clipboardData) {
        return;
      }
      let [text, metadata] = ClipboardEventUtils.getTextData(e.clipboardData);
      if (!text) {
        return;
      }
      metadata = metadata || InMemoryClipboardMetadataManager.INSTANCE.get(text);
      this._onPaste.fire({
        text,
        metadata
      });
    }));
    this._register(this._textArea.onFocus(() => {
      const hadFocus = this._hasFocus;
      this._setHasFocus(true);
      if (this._accessibilityService.isScreenReaderOptimized() && this._browser.isSafari && !hadFocus && this._hasFocus) {
        if (!this._asyncFocusGainWriteScreenReaderContent.value) {
          this._asyncFocusGainWriteScreenReaderContent.value = new RunOnceScheduler(() => this.writeNativeTextAreaContent("asyncFocusGain"), 0);
        }
        this._asyncFocusGainWriteScreenReaderContent.value.schedule();
      }
    }));
    this._register(this._textArea.onBlur(() => {
      if (this._currentComposition) {
        this._currentComposition = null;
        this.writeNativeTextAreaContent("blurWithoutCompositionEnd");
        this._onCompositionEnd.fire();
      }
      this._setHasFocus(false);
    }));
    this._register(this._textArea.onSyntheticTap(() => {
      if (this._browser.isAndroid && this._currentComposition) {
        this._currentComposition = null;
        this.writeNativeTextAreaContent("tapWithoutCompositionEnd");
        this._onCompositionEnd.fire();
      }
    }));
  }
  static {
    __name(this, "TextAreaInput");
  }
  _onFocus = this._register(new Emitter());
  onFocus = this._onFocus.event;
  _onBlur = this._register(new Emitter());
  onBlur = this._onBlur.event;
  _onKeyDown = this._register(new Emitter());
  onKeyDown = this._onKeyDown.event;
  _onKeyUp = this._register(new Emitter());
  onKeyUp = this._onKeyUp.event;
  _onCut = this._register(new Emitter());
  onCut = this._onCut.event;
  _onPaste = this._register(new Emitter());
  onPaste = this._onPaste.event;
  _onType = this._register(new Emitter());
  onType = this._onType.event;
  _onCompositionStart = this._register(new Emitter());
  onCompositionStart = this._onCompositionStart.event;
  _onCompositionUpdate = this._register(new Emitter());
  onCompositionUpdate = this._onCompositionUpdate.event;
  _onCompositionEnd = this._register(new Emitter());
  onCompositionEnd = this._onCompositionEnd.event;
  _onSelectionChangeRequest = this._register(new Emitter());
  onSelectionChangeRequest = this._onSelectionChangeRequest.event;
  // ---
  _asyncTriggerCut;
  _asyncFocusGainWriteScreenReaderContent = this._register(new MutableDisposable());
  _textAreaState;
  get textAreaState() {
    return this._textAreaState;
  }
  _selectionChangeListener;
  _hasFocus;
  _currentComposition;
  _initializeFromTest() {
    this._hasFocus = true;
    this._textAreaState = TextAreaState.readFromTextArea(this._textArea, null);
  }
  _installSelectionChangeListener() {
    let previousSelectionChangeEventTime = 0;
    return dom.addDisposableListener(this._textArea.ownerDocument, "selectionchange", (e) => {
      inputLatency.onSelectionChange();
      if (!this._hasFocus) {
        return;
      }
      if (this._currentComposition) {
        return;
      }
      if (!this._browser.isChrome) {
        return;
      }
      const now = Date.now();
      const delta1 = now - previousSelectionChangeEventTime;
      previousSelectionChangeEventTime = now;
      if (delta1 < 5) {
        return;
      }
      const delta2 = now - this._textArea.getIgnoreSelectionChangeTime();
      this._textArea.resetSelectionChangeTime();
      if (delta2 < 100) {
        return;
      }
      if (!this._textAreaState.selection) {
        return;
      }
      const newValue = this._textArea.getValue();
      if (this._textAreaState.value !== newValue) {
        return;
      }
      const newSelectionStart = this._textArea.getSelectionStart();
      const newSelectionEnd = this._textArea.getSelectionEnd();
      if (this._textAreaState.selectionStart === newSelectionStart && this._textAreaState.selectionEnd === newSelectionEnd) {
        return;
      }
      const _newSelectionStartPosition = this._textAreaState.deduceEditorPosition(newSelectionStart);
      const newSelectionStartPosition = this._host.deduceModelPosition(_newSelectionStartPosition[0], _newSelectionStartPosition[1], _newSelectionStartPosition[2]);
      const _newSelectionEndPosition = this._textAreaState.deduceEditorPosition(newSelectionEnd);
      const newSelectionEndPosition = this._host.deduceModelPosition(_newSelectionEndPosition[0], _newSelectionEndPosition[1], _newSelectionEndPosition[2]);
      const newSelection = new Selection(
        newSelectionStartPosition.lineNumber,
        newSelectionStartPosition.column,
        newSelectionEndPosition.lineNumber,
        newSelectionEndPosition.column
      );
      this._onSelectionChangeRequest.fire(newSelection);
    });
  }
  dispose() {
    super.dispose();
    if (this._selectionChangeListener) {
      this._selectionChangeListener.dispose();
      this._selectionChangeListener = null;
    }
  }
  focusTextArea() {
    this._setHasFocus(true);
    this.refreshFocusState();
  }
  isFocused() {
    return this._hasFocus;
  }
  refreshFocusState() {
    this._setHasFocus(this._textArea.hasFocus());
  }
  _setHasFocus(newHasFocus) {
    if (this._hasFocus === newHasFocus) {
      return;
    }
    this._hasFocus = newHasFocus;
    if (this._selectionChangeListener) {
      this._selectionChangeListener.dispose();
      this._selectionChangeListener = null;
    }
    if (this._hasFocus) {
      this._selectionChangeListener = this._installSelectionChangeListener();
    }
    if (this._hasFocus) {
      this.writeNativeTextAreaContent("focusgain");
    }
    if (this._hasFocus) {
      this._onFocus.fire();
    } else {
      this._onBlur.fire();
    }
  }
  _setAndWriteTextAreaState(reason, textAreaState) {
    if (!this._hasFocus) {
      textAreaState = textAreaState.collapseSelection();
    }
    if (!textAreaState.isWrittenToTextArea(this._textArea, this._hasFocus)) {
      this._logService.trace(`writeTextAreaState(reason: ${reason})`);
    }
    textAreaState.writeToTextArea(reason, this._textArea, this._hasFocus);
    this._textAreaState = textAreaState;
  }
  writeNativeTextAreaContent(reason) {
    if (!this._accessibilityService.isScreenReaderOptimized() && reason === "render" || this._currentComposition) {
      return;
    }
    this._setAndWriteTextAreaState(reason, this._host.getScreenReaderContent());
  }
  _ensureClipboardGetsEditorSelection(e) {
    const dataToCopy = this._host.getDataToCopy();
    const storedMetadata = {
      version: 1,
      isFromEmptySelection: dataToCopy.isFromEmptySelection,
      multicursorText: dataToCopy.multicursorText,
      mode: dataToCopy.mode
    };
    InMemoryClipboardMetadataManager.INSTANCE.set(
      // When writing "LINE\r\n" to the clipboard and then pasting,
      // Firefox pastes "LINE\n", so let's work around this quirk
      this._browser.isFirefox ? dataToCopy.text.replace(/\r\n/g, "\n") : dataToCopy.text,
      storedMetadata
    );
    e.preventDefault();
    if (e.clipboardData) {
      ClipboardEventUtils.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, storedMetadata);
    }
  }
};
TextAreaInput = __decorateClass([
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, ILogService)
], TextAreaInput);
class TextAreaWrapper extends Disposable {
  constructor(_actual) {
    super();
    this._actual = _actual;
    this._ignoreSelectionChangeTime = 0;
    this.onKeyDown = this._register(new DomEmitter(this._actual, "keydown")).event;
    this.onKeyPress = this._register(new DomEmitter(this._actual, "keypress")).event;
    this.onKeyUp = this._register(new DomEmitter(this._actual, "keyup")).event;
    this.onCompositionStart = this._register(new DomEmitter(this._actual, "compositionstart")).event;
    this.onCompositionUpdate = this._register(new DomEmitter(this._actual, "compositionupdate")).event;
    this.onCompositionEnd = this._register(new DomEmitter(this._actual, "compositionend")).event;
    this.onBeforeInput = this._register(new DomEmitter(this._actual, "beforeinput")).event;
    this.onInput = this._register(new DomEmitter(this._actual, "input")).event;
    this.onCut = this._register(new DomEmitter(this._actual, "cut")).event;
    this.onCopy = this._register(new DomEmitter(this._actual, "copy")).event;
    this.onPaste = this._register(new DomEmitter(this._actual, "paste")).event;
    this.onFocus = this._register(new DomEmitter(this._actual, "focus")).event;
    this.onBlur = this._register(new DomEmitter(this._actual, "blur")).event;
    this._register(this.onKeyDown(() => inputLatency.onKeyDown()));
    this._register(this.onBeforeInput(() => inputLatency.onBeforeInput()));
    this._register(this.onInput(() => inputLatency.onInput()));
    this._register(this.onKeyUp(() => inputLatency.onKeyUp()));
    this._register(dom.addDisposableListener(this._actual, TextAreaSyntethicEvents.Tap, () => this._onSyntheticTap.fire()));
  }
  static {
    __name(this, "TextAreaWrapper");
  }
  onKeyDown;
  onKeyPress;
  onKeyUp;
  onCompositionStart;
  onCompositionUpdate;
  onCompositionEnd;
  onBeforeInput;
  onInput;
  onCut;
  onCopy;
  onPaste;
  onFocus;
  onBlur;
  //  = this._register(new DomEmitter(this._actual, 'blur')).event;
  get ownerDocument() {
    return this._actual.ownerDocument;
  }
  _onSyntheticTap = this._register(new Emitter());
  onSyntheticTap = this._onSyntheticTap.event;
  _ignoreSelectionChangeTime;
  hasFocus() {
    const shadowRoot = dom.getShadowRoot(this._actual);
    if (shadowRoot) {
      return shadowRoot.activeElement === this._actual;
    } else if (this._actual.isConnected) {
      return dom.getActiveElement() === this._actual;
    } else {
      return false;
    }
  }
  setIgnoreSelectionChangeTime(reason) {
    this._ignoreSelectionChangeTime = Date.now();
  }
  getIgnoreSelectionChangeTime() {
    return this._ignoreSelectionChangeTime;
  }
  resetSelectionChangeTime() {
    this._ignoreSelectionChangeTime = 0;
  }
  getValue() {
    return this._actual.value;
  }
  setValue(reason, value) {
    const textArea = this._actual;
    if (textArea.value === value) {
      return;
    }
    this.setIgnoreSelectionChangeTime("setValue");
    textArea.value = value;
  }
  getSelectionStart() {
    return this._actual.selectionDirection === "backward" ? this._actual.selectionEnd : this._actual.selectionStart;
  }
  getSelectionEnd() {
    return this._actual.selectionDirection === "backward" ? this._actual.selectionStart : this._actual.selectionEnd;
  }
  setSelectionRange(reason, selectionStart, selectionEnd) {
    const textArea = this._actual;
    let activeElement = null;
    const shadowRoot = dom.getShadowRoot(textArea);
    if (shadowRoot) {
      activeElement = shadowRoot.activeElement;
    } else {
      activeElement = dom.getActiveElement();
    }
    const activeWindow = dom.getWindow(activeElement);
    const currentIsFocused = activeElement === textArea;
    const currentSelectionStart = textArea.selectionStart;
    const currentSelectionEnd = textArea.selectionEnd;
    if (currentIsFocused && currentSelectionStart === selectionStart && currentSelectionEnd === selectionEnd) {
      if (browser.isFirefox && activeWindow.parent !== activeWindow) {
        textArea.focus();
      }
      return;
    }
    if (currentIsFocused) {
      this.setIgnoreSelectionChangeTime("setSelectionRange");
      textArea.setSelectionRange(selectionStart, selectionEnd);
      if (browser.isFirefox && activeWindow.parent !== activeWindow) {
        textArea.focus();
      }
      return;
    }
    try {
      const scrollState = dom.saveParentsScrollTop(textArea);
      this.setIgnoreSelectionChangeTime("setSelectionRange");
      textArea.focus();
      textArea.setSelectionRange(selectionStart, selectionEnd);
      dom.restoreParentsScrollTop(textArea, scrollState);
    } catch (e) {
    }
  }
}
export {
  TextAreaInput,
  TextAreaSyntethicEvents,
  TextAreaWrapper
};
//# sourceMappingURL=textAreaEditContextInput.js.map
