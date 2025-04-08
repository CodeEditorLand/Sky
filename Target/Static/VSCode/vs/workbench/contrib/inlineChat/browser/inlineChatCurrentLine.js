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
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, MouseTargetType } from "../../../../editor/browser/editorBrowser.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { localize, localize2 } from "../../../../nls.js";
import { ContextKeyExpr, IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { InlineChatController } from "./inlineChatController.js";
import { ACTION_START, CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_VISIBLE, InlineChatConfigKeys } from "../common/inlineChat.js";
import { EditorAction2, ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IPosition, Position } from "../../../../editor/common/core/position.js";
import { AbstractInline1ChatAction } from "./inlineChatActions.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { IValidEditOperation, TrackedRangeStickiness } from "../../../../editor/common/model.js";
import { URI } from "../../../../base/common/uri.js";
import { isEqual } from "../../../../base/common/resources.js";
import { StandardTokenType } from "../../../../editor/common/encodedTokenAttributes.js";
import { autorun, derivedWithStore, observableFromEvent, observableValue } from "../../../../base/common/observable.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import "./media/inlineChat.css";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { IChatAgentService } from "../../chat/common/chatAgents.js";
import { IMarkerDecorationsService } from "../../../../editor/common/services/markerDecorations.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { toAction } from "../../../../base/common/actions.js";
import { IMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { createStyleSheet2 } from "../../../../base/browser/domStylesheets.js";
import { stringValue } from "../../../../base/browser/cssValue.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { Emitter } from "../../../../base/common/event.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
const CTX_INLINE_CHAT_SHOWING_HINT = new RawContextKey("inlineChatShowingHint", false, localize("inlineChatShowingHint", "Whether inline chat shows a contextual hint"));
const _inlineChatActionId = "inlineChat.startWithCurrentLine";
class InlineChatExpandLineAction extends EditorAction2 {
  static {
    __name(this, "InlineChatExpandLineAction");
  }
  constructor() {
    super({
      id: _inlineChatActionId,
      category: AbstractInline1ChatAction.category,
      title: localize2("startWithCurrentLine", "Start in Editor with Current Line"),
      f1: true,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE.negate(), CTX_INLINE_CHAT_HAS_AGENT, EditorContextKeys.writable),
      keybinding: [{
        when: CTX_INLINE_CHAT_SHOWING_HINT,
        weight: KeybindingWeight.WorkbenchContrib + 1,
        primary: KeyMod.CtrlCmd | KeyCode.KeyI
      }, {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyI)
      }]
    });
  }
  async runEditorCommand(_accessor, editor) {
    const ctrl = InlineChatController.get(editor);
    if (!ctrl || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const lineNumber = editor.getSelection().positionLineNumber;
    const lineContent = model.getLineContent(lineNumber);
    const startColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    const endColumn = model.getLineMaxColumn(lineNumber);
    let undoEdits = [];
    model.pushEditOperations(null, [EditOperation.replace(new Range(lineNumber, startColumn, lineNumber, endColumn), "")], (edits) => {
      undoEdits = edits;
      return null;
    });
    const accepted = await ctrl.run({
      autoSend: true,
      message: lineContent.trim(),
      position: new Position(lineNumber, startColumn)
    });
    if (!accepted) {
      model.pushEditOperations(null, undoEdits, () => null);
    }
  }
}
class ShowInlineChatHintAction extends EditorAction2 {
  static {
    __name(this, "ShowInlineChatHintAction");
  }
  constructor() {
    super({
      id: "inlineChat.showHint",
      category: AbstractInline1ChatAction.category,
      title: localize2("showHint", "Show Inline Chat Hint"),
      f1: false,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE.negate(), CTX_INLINE_CHAT_HAS_AGENT, EditorContextKeys.writable)
    });
  }
  async runEditorCommand(_accessor, editor, ...args) {
    if (!editor.hasModel()) {
      return;
    }
    const ctrl = InlineChatHintsController.get(editor);
    if (!ctrl) {
      return;
    }
    const [uri, position] = args;
    if (!URI.isUri(uri) || !Position.isIPosition(position)) {
      ctrl.hide();
      return;
    }
    const model = editor.getModel();
    if (!isEqual(model.uri, uri)) {
      ctrl.hide();
      return;
    }
    model.tokenization.forceTokenization(position.lineNumber);
    const tokens = model.tokenization.getLineTokens(position.lineNumber);
    let totalLength = 0;
    let specialLength = 0;
    let lastTokenType;
    tokens.forEach((idx) => {
      const tokenType = tokens.getStandardTokenType(idx);
      const startOffset = tokens.getStartOffset(idx);
      const endOffset = tokens.getEndOffset(idx);
      totalLength += endOffset - startOffset;
      if (tokenType !== StandardTokenType.Other) {
        specialLength += endOffset - startOffset;
      }
      lastTokenType = tokenType;
    });
    if (specialLength / totalLength > 0.25) {
      ctrl.hide();
      return;
    }
    if (lastTokenType === StandardTokenType.Comment) {
      ctrl.hide();
      return;
    }
    ctrl.show();
  }
}
let InlineChatHintsController = class extends Disposable {
  constructor(editor, contextKeyService, commandService, keybindingService, chatAgentService, markerDecorationService, _contextMenuService, _configurationService) {
    super();
    this._contextMenuService = _contextMenuService;
    this._configurationService = _configurationService;
    this._editor = editor;
    this._ctxShowingHint = CTX_INLINE_CHAT_SHOWING_HINT.bindTo(contextKeyService);
    const ghostCtrl = InlineCompletionsController.get(editor);
    this._store.add(commandService.onWillExecuteCommand((e) => {
      if (e.commandId === _inlineChatActionId || e.commandId === ACTION_START) {
        this.hide();
      }
    }));
    this._store.add(this._editor.onMouseDown((e) => {
      if (e.target.type !== MouseTargetType.CONTENT_TEXT) {
        return;
      }
      if (!e.target.element?.classList.contains("inline-chat-hint-text")) {
        return;
      }
      if (e.event.leftButton) {
        commandService.executeCommand(_inlineChatActionId);
        this.hide();
      } else if (e.event.rightButton) {
        e.event.preventDefault();
        this._showContextMenu(
          e.event,
          e.target.element?.classList.contains("whitespace") ? InlineChatConfigKeys.LineEmptyHint : InlineChatConfigKeys.LineNLHint
        );
      }
    }));
    const markerSuppression = this._store.add(new MutableDisposable());
    const decos = this._editor.createDecorationsCollection();
    const editorObs = observableCodeEditor(editor);
    const keyObs = observableFromEvent(keybindingService.onDidUpdateKeybindings, (_) => keybindingService.lookupKeybinding(ACTION_START)?.getLabel());
    const configHintEmpty = observableConfigValue(InlineChatConfigKeys.LineEmptyHint, false, this._configurationService);
    const configHintNL = observableConfigValue(InlineChatConfigKeys.LineNLHint, false, this._configurationService);
    const showDataObs = derivedWithStore((r, store) => {
      const ghostState = ghostCtrl?.model.read(r)?.state.read(r);
      const textFocus = editorObs.isTextFocused.read(r);
      let position = editorObs.cursorPosition.read(r);
      const model = editorObs.model.read(r);
      const kb = keyObs.read(r);
      if (ghostState !== void 0 || !kb || !position || !model || !textFocus) {
        return void 0;
      }
      if (model.getLanguageId() === PLAINTEXT_LANGUAGE_ID || model.getLanguageId() === "markdown") {
        return void 0;
      }
      const emitter = store.add(new Emitter());
      store.add(model.onDidChangeContent(() => emitter.fire()));
      observableFromEvent(emitter.event, () => model.getVersionId()).read(r);
      position = model.validatePosition(position);
      const visible = this._visibilityObs.read(r);
      const isEol = model.getLineMaxColumn(position.lineNumber) === position.column;
      const isWhitespace = model.getLineLastNonWhitespaceColumn(position.lineNumber) === 0 && model.getValueLength() > 0 && position.column > 1;
      if (isWhitespace) {
        return configHintEmpty.read(r) ? { isEol, isWhitespace, kb, position, model } : void 0;
      }
      if (visible && isEol && configHintNL.read(r)) {
        return { isEol, isWhitespace, kb, position, model };
      }
      return void 0;
    });
    const style = createStyleSheet2();
    this._store.add(style);
    this._store.add(autorun((r) => {
      const showData = showDataObs.read(r);
      if (!showData) {
        decos.clear();
        markerSuppression.clear();
        this._ctxShowingHint.reset();
        return;
      }
      const agentName = chatAgentService.getDefaultAgent(ChatAgentLocation.Editor)?.name ?? localize("defaultTitle", "Chat");
      const { position, isEol, isWhitespace, kb, model } = showData;
      const inlineClassName = ["a", "inline-chat-hint", "inline-chat-hint-text"];
      let content;
      if (isWhitespace) {
        content = "\xA0" + localize("title2", "{0} to edit with {1}", kb, agentName);
      } else if (isEol) {
        content = "\xA0" + localize("title1", "{0} to continue with {1}", kb, agentName);
      } else {
        content = "\u200A" + kb + "\u200A";
        inlineClassName.push("embedded");
      }
      style.setStyle(`.inline-chat-hint-text::after { content: ${stringValue(content)} }`);
      if (isWhitespace) {
        inlineClassName.push("whitespace");
      }
      this._ctxShowingHint.set(true);
      decos.set([{
        range: Range.fromPositions(position),
        options: {
          description: "inline-chat-hint-line",
          showIfCollapsed: true,
          stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          afterContentClassName: inlineClassName.join(" ")
        }
      }]);
      markerSuppression.value = markerDecorationService.addMarkerSuppression(model.uri, model.validateRange(new Range(position.lineNumber, 1, position.lineNumber, Number.MAX_SAFE_INTEGER)));
    }));
  }
  static {
    __name(this, "InlineChatHintsController");
  }
  static ID = "editor.contrib.inlineChatHints";
  static get(editor) {
    return editor.getContribution(InlineChatHintsController.ID);
  }
  _editor;
  _ctxShowingHint;
  _visibilityObs = observableValue(this, false);
  _showContextMenu(event, setting) {
    this._contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => ({ x: event.posx, y: event.posy }), "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => [
        toAction({
          id: "inlineChat.disableHint",
          label: localize("disableHint", "Disable Inline Chat Hint"),
          run: /* @__PURE__ */ __name(async () => {
            await this._configurationService.updateValue(setting, false);
          }, "run")
        })
      ], "getActions")
    });
  }
  show() {
    this._visibilityObs.set(true, void 0);
  }
  hide() {
    this._visibilityObs.set(false, void 0);
  }
};
InlineChatHintsController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IChatAgentService),
  __decorateParam(5, IMarkerDecorationsService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IConfigurationService)
], InlineChatHintsController);
class HideInlineChatHintAction extends EditorAction2 {
  static {
    __name(this, "HideInlineChatHintAction");
  }
  constructor() {
    super({
      id: "inlineChat.hideHint",
      title: localize2("hideHint", "Hide Inline Chat Hint"),
      precondition: CTX_INLINE_CHAT_SHOWING_HINT,
      keybinding: {
        weight: KeybindingWeight.EditorContrib - 10,
        primary: KeyCode.Escape
      }
    });
  }
  async runEditorCommand(_accessor, editor) {
    InlineChatHintsController.get(editor)?.hide();
  }
}
export {
  CTX_INLINE_CHAT_SHOWING_HINT,
  HideInlineChatHintAction,
  InlineChatExpandLineAction,
  InlineChatHintsController,
  ShowInlineChatHintAction
};
//# sourceMappingURL=inlineChatCurrentLine.js.map
