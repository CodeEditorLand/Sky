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
import { Orientation, Sash } from "../../../../base/browser/ui/sash/sash.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { IQuickInputService, IQuickWidget } from "../../../../platform/quickinput/common/quickInput.js";
import { editorBackground, inputBackground, quickInputBackground, quickInputForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IQuickChatOpenOptions, IQuickChatService, showChatView } from "./chat.js";
import { ChatWidget } from "./chatWidget.js";
import { ChatModel, isCellTextEditOperation } from "../common/chatModel.js";
import { IParsedChatRequest } from "../common/chatParserTypes.js";
import { IChatProgress, IChatService } from "../common/chatService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "../../../common/theme.js";
import { ChatAgentLocation } from "../common/constants.js";
let QuickChatService = class extends Disposable {
  constructor(quickInputService, chatService, instantiationService) {
    super();
    this.quickInputService = quickInputService;
    this.chatService = chatService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "QuickChatService");
  }
  _serviceBrand;
  _onDidClose = this._register(new Emitter());
  onDidClose = this._onDidClose.event;
  _input;
  // TODO@TylerLeonhardt: support multiple chat providers eventually
  _currentChat;
  _container;
  get enabled() {
    return !!this.chatService.isEnabled(ChatAgentLocation.Panel);
  }
  get focused() {
    const widget = this._input?.widget;
    if (!widget) {
      return false;
    }
    return dom.isAncestorOfActiveElement(widget);
  }
  toggle(options) {
    if (this.focused && !options?.query) {
      this.close();
    } else {
      this.open(options);
      if (options?.isPartialQuery) {
        const disposable = this._store.add(Event.once(this.onDidClose)(() => {
          this._currentChat?.clearValue();
          this._store.delete(disposable);
        }));
      }
    }
  }
  open(options) {
    if (this._input) {
      if (this._currentChat && options?.query) {
        this._currentChat.focus();
        this._currentChat.setValue(options.query, options.selection);
        if (!options.isPartialQuery) {
          this._currentChat.acceptInput();
        }
        return;
      }
      return this.focus();
    }
    const disposableStore = new DisposableStore();
    this._input = this.quickInputService.createQuickWidget();
    this._input.contextKey = "chatInputVisible";
    this._input.ignoreFocusOut = true;
    disposableStore.add(this._input);
    this._container ??= dom.$(".interactive-session");
    this._input.widget = this._container;
    this._input.show();
    if (!this._currentChat) {
      this._currentChat = this.instantiationService.createInstance(QuickChat);
      this._currentChat.render(this._container);
    } else {
      this._currentChat.show();
    }
    disposableStore.add(this._input.onDidHide(() => {
      disposableStore.dispose();
      this._currentChat.hide();
      this._input = void 0;
      this._onDidClose.fire();
    }));
    this._currentChat.focus();
    if (options?.query) {
      this._currentChat.setValue(options.query, options.selection);
      if (!options.isPartialQuery) {
        this._currentChat.acceptInput();
      }
    }
  }
  focus() {
    this._currentChat?.focus();
  }
  close() {
    this._input?.dispose();
    this._input = void 0;
  }
  async openInChatView() {
    await this._currentChat?.openChatView();
    this.close();
  }
};
QuickChatService = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IInstantiationService)
], QuickChatService);
let QuickChat = class extends Disposable {
  constructor(instantiationService, contextKeyService, chatService, layoutService, viewsService) {
    super();
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.layoutService = layoutService;
    this.viewsService = viewsService;
  }
  static {
    __name(this, "QuickChat");
  }
  // TODO@TylerLeonhardt: be responsive to window size
  static DEFAULT_MIN_HEIGHT = 200;
  static DEFAULT_HEIGHT_OFFSET = 100;
  widget;
  sash;
  model;
  _currentQuery;
  maintainScrollTimer = this._register(new MutableDisposable());
  _deferUpdatingDynamicLayout = false;
  clear() {
    this.model?.dispose();
    this.model = void 0;
    this.updateModel();
    this.widget.inputEditor.setValue("");
  }
  focus(selection) {
    if (this.widget) {
      this.widget.focusInput();
      const value = this.widget.inputEditor.getValue();
      if (value) {
        this.widget.inputEditor.setSelection(selection ?? {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: value.length + 1
        });
      }
    }
  }
  hide() {
    this.widget.setVisible(false);
    this.maintainScrollTimer.value = disposableTimeout(() => {
      this.maintainScrollTimer.clear();
    }, 30 * 1e3);
  }
  show() {
    this.widget.setVisible(true);
    if (this._deferUpdatingDynamicLayout) {
      this._deferUpdatingDynamicLayout = false;
      this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
    }
    if (!this.maintainScrollTimer.value) {
      this.widget.layoutDynamicChatTreeItemMode();
    }
  }
  render(parent) {
    if (this.widget) {
      throw new Error("Cannot render quick chat twice");
    }
    const scopedInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this._register(this.contextKeyService.createScoped(parent))
      ])
    ));
    this.widget = this._register(
      scopedInstantiationService.createInstance(
        ChatWidget,
        ChatAgentLocation.Panel,
        { isQuickChat: true },
        { autoScroll: true, renderInputOnTop: true, renderStyle: "compact", menus: { inputSideToolbar: MenuId.ChatInputSide }, enableImplicitContext: true },
        {
          listForeground: quickInputForeground,
          listBackground: quickInputBackground,
          overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
          inputEditorBackground: inputBackground,
          resultEditorBackground: editorBackground
        }
      )
    );
    this.widget.render(parent);
    this.widget.setVisible(true);
    this.widget.setDynamicChatTreeItemLayout(2, this.maxHeight);
    this.updateModel();
    this.sash = this._register(new Sash(parent, { getHorizontalSashTop: /* @__PURE__ */ __name(() => parent.offsetHeight, "getHorizontalSashTop") }, { orientation: Orientation.HORIZONTAL }));
    this.registerListeners(parent);
  }
  get maxHeight() {
    return this.layoutService.mainContainerDimension.height - QuickChat.DEFAULT_HEIGHT_OFFSET;
  }
  registerListeners(parent) {
    this._register(this.layoutService.onDidLayoutMainContainer(() => {
      if (this.widget.visible) {
        this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
      } else {
        this._deferUpdatingDynamicLayout = true;
      }
    }));
    this._register(this.widget.inputEditor.onDidChangeModelContent((e) => {
      this._currentQuery = this.widget.inputEditor.getValue();
    }));
    this._register(this.widget.onDidClear(() => this.clear()));
    this._register(this.widget.onDidChangeHeight((e) => this.sash.layout()));
    const width = parent.offsetWidth;
    this._register(this.sash.onDidStart(() => {
      this.widget.isDynamicChatTreeItemLayoutEnabled = false;
    }));
    this._register(this.sash.onDidChange((e) => {
      if (e.currentY < QuickChat.DEFAULT_MIN_HEIGHT || e.currentY > this.maxHeight) {
        return;
      }
      this.widget.layout(e.currentY, width);
      this.sash.layout();
    }));
    this._register(this.sash.onDidReset(() => {
      this.widget.isDynamicChatTreeItemLayoutEnabled = true;
      this.widget.layoutDynamicChatTreeItemMode();
    }));
  }
  async acceptInput() {
    return this.widget.acceptInput();
  }
  async openChatView() {
    const widget = await showChatView(this.viewsService);
    if (!widget?.viewModel || !this.model) {
      return;
    }
    for (const request of this.model.getRequests()) {
      if (request.response?.response.value || request.response?.result) {
        const message = [];
        for (const item of request.response.response.value) {
          if (item.kind === "textEditGroup") {
            for (const group of item.edits) {
              message.push({
                kind: "textEdit",
                edits: group,
                uri: item.uri
              });
            }
          } else if (item.kind === "notebookEditGroup") {
            for (const group of item.edits) {
              if (isCellTextEditOperation(group)) {
                message.push({
                  kind: "textEdit",
                  edits: [group.edit],
                  uri: group.uri
                });
              } else {
                message.push({
                  kind: "notebookEdit",
                  edits: [group],
                  uri: item.uri
                });
              }
            }
          } else {
            message.push(item);
          }
        }
        this.chatService.addCompleteRequest(
          widget.viewModel.sessionId,
          request.message,
          request.variableData,
          request.attempt,
          {
            message,
            result: request.response.result,
            followups: request.response.followups
          }
        );
      } else if (request.message) {
      }
    }
    const value = this.widget.inputEditor.getValue();
    if (value) {
      widget.inputEditor.setValue(value);
    }
    widget.focusInput();
  }
  setValue(value, selection) {
    this.widget.inputEditor.setValue(value);
    this.focus(selection);
  }
  clearValue() {
    this.widget.inputEditor.setValue("");
  }
  updateModel() {
    this.model ??= this.chatService.startSession(ChatAgentLocation.Panel, CancellationToken.None);
    if (!this.model) {
      throw new Error("Could not start chat session");
    }
    this.widget.setModel(this.model, { inputValue: this._currentQuery });
  }
};
QuickChat = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IChatService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IViewsService)
], QuickChat);
export {
  QuickChatService
};
//# sourceMappingURL=chatQuick.js.map
