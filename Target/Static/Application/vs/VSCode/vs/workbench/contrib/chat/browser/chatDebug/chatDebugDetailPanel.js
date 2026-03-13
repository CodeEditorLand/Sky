var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import * as DOM from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
import { formatEventDetail } from "./chatDebugEventDetailRenderer.js";
import { renderCustomizationDiscoveryContent, fileListToPlainText } from "./chatCustomizationDiscoveryRenderer.js";
import { renderUserMessageContent, renderAgentResponseContent, messageEventToPlainText, renderResolvedMessageContent, resolvedMessageToPlainText } from "./chatDebugMessageContentRenderer.js";
import { renderToolCallContent, toolCallContentToPlainText } from "./chatDebugToolCallContentRenderer.js";
import { renderModelTurnContent, modelTurnContentToPlainText } from "./chatDebugModelTurnContentRenderer.js";
const $ = DOM.$;
let ChatDebugDetailPanel = class ChatDebugDetailPanel2 extends Disposable {
  static {
    __name(this, "ChatDebugDetailPanel");
  }
  constructor(parent, chatDebugService, instantiationService, editorService, clipboardService, hoverService, openerService) {
    super();
    this.chatDebugService = chatDebugService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.clipboardService = clipboardService;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this.detailDisposables = this._register(new DisposableStore());
    this.currentDetailText = "";
    this.element = DOM.append(parent, $(".chat-debug-detail-panel"));
    this.contentContainer = $(".chat-debug-detail-content");
    DOM.hide(this.element);
    this._register(DOM.addDisposableListener(this.element, DOM.EventType.KEY_DOWN, (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const target = e.target;
        if (target && this.element.contains(target)) {
          e.preventDefault();
          const targetWindow = DOM.getWindow(target);
          const selection = targetWindow.getSelection();
          if (selection) {
            const range = targetWindow.document.createRange();
            range.selectNodeContents(target);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }));
  }
  async show(event) {
    if (event.id && event.id === this.currentDetailEventId) {
      return;
    }
    this.currentDetailEventId = event.id;
    const resolved = event.id ? await this.chatDebugService.resolveEvent(event.id) : void 0;
    DOM.show(this.element);
    DOM.clearNode(this.element);
    DOM.clearNode(this.contentContainer);
    this.detailDisposables.clear();
    const header = DOM.append(this.element, $(".chat-debug-detail-header"));
    this.element.appendChild(this.contentContainer);
    const fullScreenButton = this.detailDisposables.add(new Button(header, { ariaLabel: localize("chatDebug.openInEditor", "Open in Editor"), title: localize("chatDebug.openInEditor", "Open in Editor") }));
    fullScreenButton.element.classList.add("chat-debug-detail-button");
    fullScreenButton.icon = Codicon.goToFile;
    this.firstFocusableElement = fullScreenButton.element;
    this.detailDisposables.add(fullScreenButton.onDidClick(() => {
      this.editorService.openEditor({ contents: this.currentDetailText, resource: void 0 });
    }));
    const copyButton = this.detailDisposables.add(new Button(header, { ariaLabel: localize("chatDebug.copyToClipboard", "Copy"), title: localize("chatDebug.copyToClipboard", "Copy") }));
    copyButton.element.classList.add("chat-debug-detail-button");
    copyButton.icon = Codicon.copy;
    this.detailDisposables.add(copyButton.onDidClick(() => {
      this.clipboardService.writeText(this.currentDetailText);
    }));
    const closeButton = this.detailDisposables.add(new Button(header, { ariaLabel: localize("chatDebug.closeDetail", "Close"), title: localize("chatDebug.closeDetail", "Close") }));
    closeButton.element.classList.add("chat-debug-detail-button");
    closeButton.icon = Codicon.close;
    this.detailDisposables.add(closeButton.onDidClick(() => {
      this.hide();
    }));
    if (resolved && resolved.kind === "fileList") {
      this.currentDetailText = fileListToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = this.instantiationService.invokeFunction((accessor) => renderCustomizationDiscoveryContent(resolved, this.openerService, accessor.get(IModelService), accessor.get(ILanguageService), this.hoverService, accessor.get(ILabelService)));
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "toolCall") {
      this.currentDetailText = toolCallContentToPlainText(resolved);
      const languageService = this.instantiationService.invokeFunction((accessor) => accessor.get(ILanguageService));
      const { element: contentEl, disposables: contentDisposables } = await renderToolCallContent(resolved, languageService);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "message") {
      this.currentDetailText = resolvedMessageToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = renderResolvedMessageContent(resolved);
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "modelTurn") {
      this.currentDetailText = modelTurnContentToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = renderModelTurnContent(resolved);
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (event.kind === "userMessage") {
      this.currentDetailText = messageEventToPlainText(event);
      const { element: contentEl, disposables: contentDisposables } = renderUserMessageContent(event);
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (event.kind === "agentResponse") {
      this.currentDetailText = messageEventToPlainText(event);
      const { element: contentEl, disposables: contentDisposables } = renderAgentResponseContent(event);
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else {
      const pre = DOM.append(this.contentContainer, $("pre"));
      pre.tabIndex = 0;
      if (resolved) {
        this.currentDetailText = resolved.value;
      } else {
        this.currentDetailText = formatEventDetail(event);
      }
      pre.textContent = this.currentDetailText;
    }
  }
  get isVisible() {
    return this.element.style.display !== "none";
  }
  focus() {
    this.firstFocusableElement?.focus();
  }
  hide() {
    this.currentDetailEventId = void 0;
    this.firstFocusableElement = void 0;
    DOM.hide(this.element);
    DOM.clearNode(this.element);
    DOM.clearNode(this.contentContainer);
    this.detailDisposables.clear();
    this._onDidHide.fire();
  }
};
ChatDebugDetailPanel = __decorate([
  __param(1, IChatDebugService),
  __param(2, IInstantiationService),
  __param(3, IEditorService),
  __param(4, IClipboardService),
  __param(5, IHoverService),
  __param(6, IOpenerService)
], ChatDebugDetailPanel);
export {
  ChatDebugDetailPanel
};
//# sourceMappingURL=chatDebugDetailPanel.js.map
