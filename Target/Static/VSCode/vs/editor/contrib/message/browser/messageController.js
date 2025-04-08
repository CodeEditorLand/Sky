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
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { Event } from "../../../../base/common/event.js";
import { IMarkdownString, isMarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { DisposableStore, IDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import "./messageController.css";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { EditorCommand, EditorContributionInstantiation, registerEditorCommand, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { IPosition } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IEditorContribution, ScrollType } from "../../../common/editorCommon.js";
import { PositionAffinity } from "../../../common/model.js";
import { openLinkFromMarkdown } from "../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";
import * as nls from "../../../../nls.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import * as dom from "../../../../base/browser/dom.js";
let MessageController = class {
  constructor(editor, contextKeyService, _openerService) {
    this._openerService = _openerService;
    this._editor = editor;
    this._visible = MessageController.MESSAGE_VISIBLE.bindTo(contextKeyService);
  }
  static {
    __name(this, "MessageController");
  }
  static ID = "editor.contrib.messageController";
  static MESSAGE_VISIBLE = new RawContextKey("messageVisible", false, nls.localize("messageVisible", "Whether the editor is currently showing an inline message"));
  static get(editor) {
    return editor.getContribution(MessageController.ID);
  }
  _editor;
  _visible;
  _messageWidget = new MutableDisposable();
  _messageListeners = new DisposableStore();
  _message;
  _mouseOverMessage = false;
  dispose() {
    this._message?.dispose();
    this._messageListeners.dispose();
    this._messageWidget.dispose();
    this._visible.reset();
  }
  isVisible() {
    return this._visible.get();
  }
  showMessage(message, position) {
    alert(isMarkdownString(message) ? message.value : message);
    this._visible.set(true);
    this._messageWidget.clear();
    this._messageListeners.clear();
    this._message = isMarkdownString(message) ? renderMarkdown(message, {
      actionHandler: {
        callback: /* @__PURE__ */ __name((url) => {
          this.closeMessage();
          openLinkFromMarkdown(this._openerService, url, isMarkdownString(message) ? message.isTrusted : void 0);
        }, "callback"),
        disposables: this._messageListeners
      }
    }) : void 0;
    this._messageWidget.value = new MessageWidget(this._editor, position, typeof message === "string" ? message : this._message.element);
    this._messageListeners.add(Event.debounce(this._editor.onDidBlurEditorText, (last, event) => event, 0)(
      () => {
        if (this._mouseOverMessage) {
          return;
        }
        if (this._messageWidget.value && dom.isAncestor(dom.getActiveElement(), this._messageWidget.value.getDomNode())) {
          return;
        }
        this.closeMessage();
      }
    ));
    this._messageListeners.add(this._editor.onDidChangeCursorPosition(() => this.closeMessage()));
    this._messageListeners.add(this._editor.onDidDispose(() => this.closeMessage()));
    this._messageListeners.add(this._editor.onDidChangeModel(() => this.closeMessage()));
    this._messageListeners.add(dom.addDisposableListener(this._messageWidget.value.getDomNode(), dom.EventType.MOUSE_ENTER, () => this._mouseOverMessage = true, true));
    this._messageListeners.add(dom.addDisposableListener(this._messageWidget.value.getDomNode(), dom.EventType.MOUSE_LEAVE, () => this._mouseOverMessage = false, true));
    let bounds;
    this._messageListeners.add(this._editor.onMouseMove((e) => {
      if (!e.target.position) {
        return;
      }
      if (!bounds) {
        bounds = new Range(position.lineNumber - 3, 1, e.target.position.lineNumber + 3, 1);
      } else if (!bounds.containsPosition(e.target.position)) {
        this.closeMessage();
      }
    }));
  }
  closeMessage() {
    this._visible.reset();
    this._messageListeners.clear();
    if (this._messageWidget.value) {
      this._messageListeners.add(MessageWidget.fadeOut(this._messageWidget.value));
    }
  }
};
MessageController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IOpenerService)
], MessageController);
const MessageCommand = EditorCommand.bindToContribution(MessageController.get);
registerEditorCommand(new MessageCommand({
  id: "leaveEditorMessage",
  precondition: MessageController.MESSAGE_VISIBLE,
  handler: /* @__PURE__ */ __name((c) => c.closeMessage(), "handler"),
  kbOpts: {
    weight: KeybindingWeight.EditorContrib + 30,
    primary: KeyCode.Escape
  }
}));
class MessageWidget {
  static {
    __name(this, "MessageWidget");
  }
  // Editor.IContentWidget.allowEditorOverflow
  allowEditorOverflow = true;
  suppressMouseDown = false;
  _editor;
  _position;
  _domNode;
  static fadeOut(messageWidget) {
    const dispose = /* @__PURE__ */ __name(() => {
      messageWidget.dispose();
      clearTimeout(handle);
      messageWidget.getDomNode().removeEventListener("animationend", dispose);
    }, "dispose");
    const handle = setTimeout(dispose, 110);
    messageWidget.getDomNode().addEventListener("animationend", dispose);
    messageWidget.getDomNode().classList.add("fadeOut");
    return { dispose };
  }
  constructor(editor, { lineNumber, column }, text) {
    this._editor = editor;
    this._editor.revealLinesInCenterIfOutsideViewport(lineNumber, lineNumber, ScrollType.Smooth);
    this._position = { lineNumber, column };
    this._domNode = document.createElement("div");
    this._domNode.classList.add("monaco-editor-overlaymessage");
    this._domNode.style.marginLeft = "-6px";
    const anchorTop = document.createElement("div");
    anchorTop.classList.add("anchor", "top");
    this._domNode.appendChild(anchorTop);
    const message = document.createElement("div");
    if (typeof text === "string") {
      message.classList.add("message");
      message.textContent = text;
    } else {
      text.classList.add("message");
      message.appendChild(text);
    }
    this._domNode.appendChild(message);
    const anchorBottom = document.createElement("div");
    anchorBottom.classList.add("anchor", "below");
    this._domNode.appendChild(anchorBottom);
    this._editor.addContentWidget(this);
    this._domNode.classList.add("fadeIn");
  }
  dispose() {
    this._editor.removeContentWidget(this);
  }
  getId() {
    return "messageoverlay";
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      position: this._position,
      preference: [
        ContentWidgetPositionPreference.ABOVE,
        ContentWidgetPositionPreference.BELOW
      ],
      positionAffinity: PositionAffinity.Right
    };
  }
  afterRender(position) {
    this._domNode.classList.toggle("below", position === ContentWidgetPositionPreference.BELOW);
  }
}
registerEditorContribution(MessageController.ID, MessageController, EditorContributionInstantiation.Lazy);
export {
  MessageController
};
//# sourceMappingURL=messageController.js.map
