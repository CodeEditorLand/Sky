var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray } from "../../../../../base/common/arrays.js";
import { DeferredPromise, isThenable } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isObject } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { AbstractGotoSymbolQuickAccessProvider } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IListService } from "../../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { resolveCommandsContext } from "../../../../browser/parts/editor/editorCommandsContext.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { EditorResourceAccessor, isEditorCommandsContext, SideBySideEditor } from "../../../../common/editor.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ExplorerFolderContext } from "../../../files/common/files.js";
import { CTX_INLINE_CHAT_V2_ENABLED } from "../../../inlineChat/common/inlineChat.js";
import { AnythingQuickAccessProvider } from "../../../search/browser/anythingQuickAccess.js";
import { isSearchTreeFileMatch, isSearchTreeMatch } from "../../../search/browser/searchTreeModel/searchTreeCommon.js";
import { SymbolsQuickAccessProvider } from "../../../search/browser/symbolsQuickAccess.js";
import { SearchContext } from "../../../search/common/constants.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ChatAgentLocation, isSupportedChatFileScheme } from "../../common/constants.js";
import { IChatWidgetService, IQuickChatService } from "../chat.js";
import { IChatContextPickService, isChatContextPickerPickItem } from "../attachments/chatContextPickService.js";
import { isQuickChat } from "../widget/chatWidget.js";
import { resizeImage } from "../chatImageUtils.js";
import { registerPromptActions } from "../promptSyntax/promptFileActions.js";
import { CHAT_CATEGORY } from "./chatActions.js";
function registerChatContextActions() {
  registerAction2(AttachContextAction);
  registerAction2(AttachFileToChatAction);
  registerAction2(AttachFolderToChatAction);
  registerAction2(AttachSelectionToChatAction);
  registerAction2(AttachSearchResultAction);
  registerPromptActions();
}
__name(registerChatContextActions, "registerChatContextActions");
async function withChatView(accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const lastFocusedWidget = chatWidgetService.lastFocusedWidget;
  if (!lastFocusedWidget || lastFocusedWidget.location === ChatAgentLocation.Chat) {
    return chatWidgetService.revealWidget();
  }
  return lastFocusedWidget;
}
__name(withChatView, "withChatView");
class AttachResourceAction extends Action2 {
  static {
    __name(this, "AttachResourceAction");
  }
  async run(accessor, ...args) {
    const instaService = accessor.get(IInstantiationService);
    const widget = await instaService.invokeFunction(withChatView);
    if (!widget) {
      return;
    }
    return instaService.invokeFunction(this.runWithWidget.bind(this), widget, ...args);
  }
  _getResources(accessor, ...args) {
    const editorService = accessor.get(IEditorService);
    const contexts = isEditorCommandsContext(args[1]) ? this._getEditorResources(accessor, args) : Array.isArray(args[1]) ? args[1] : [args[0]];
    const files = [];
    for (const context of contexts) {
      let uri;
      if (URI.isUri(context)) {
        uri = context;
      } else if (isSearchTreeFileMatch(context)) {
        uri = context.resource;
      } else if (isSearchTreeMatch(context)) {
        uri = context.parent().resource;
      } else if (!context && editorService.activeTextEditorControl) {
        uri = EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
      }
      if (uri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(uri.scheme)) {
        files.push(uri);
      }
    }
    return files;
  }
  _getEditorResources(accessor, ...args) {
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    return resolvedContext.groupedEditors.flatMap((groupedEditor) => groupedEditor.editors).map((editor) => EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY })).filter((uri) => uri !== void 0);
  }
}
class AttachFileToChatAction extends AttachResourceAction {
  static {
    __name(this, "AttachFileToChatAction");
  }
  static {
    this.ID = "workbench.action.chat.attachFile";
  }
  constructor() {
    super({
      id: AttachFileToChatAction.ID,
      title: localize2("workbench.action.chat.attachFile.label", "Add File to Chat"),
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      f1: true,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, SearchContext.FileMatchOrMatchFocusKey, SearchContext.SearchResultHeaderFocused.negate())
      }, {
        id: MenuId.ExplorerContext,
        group: "5_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ExplorerFolderContext.negate(), ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)))
      }, {
        id: MenuId.EditorTitleContext,
        group: "2_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)))
      }, {
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 2,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote), ResourceContextKey.Scheme.isEqualTo(Schemas.untitled), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData)))
      }]
    });
  }
  async runWithWidget(accessor, widget, ...args) {
    const files = this._getResources(accessor, ...args);
    if (!files.length) {
      return;
    }
    if (widget) {
      widget.focusInput();
      for (const file of files) {
        widget.attachmentModel.addFile(file);
      }
    }
  }
}
class AttachFolderToChatAction extends AttachResourceAction {
  static {
    __name(this, "AttachFolderToChatAction");
  }
  static {
    this.ID = "workbench.action.chat.attachFolder";
  }
  constructor() {
    super({
      id: AttachFolderToChatAction.ID,
      title: localize2("workbench.action.chat.attachFolder.label", "Add Folder to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: {
        id: MenuId.ExplorerContext,
        group: "5_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ExplorerFolderContext, ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote)))
      }
    });
  }
  async runWithWidget(accessor, widget, ...args) {
    const folders = this._getResources(accessor, ...args);
    if (!folders.length) {
      return;
    }
    if (widget) {
      widget.focusInput();
      for (const folder of folders) {
        widget.attachmentModel.addFolder(folder);
      }
    }
  }
}
class AttachSelectionToChatAction extends Action2 {
  static {
    __name(this, "AttachSelectionToChatAction");
  }
  static {
    this.ID = "workbench.action.chat.attachSelection";
  }
  constructor() {
    super({
      id: AttachSelectionToChatAction.ID,
      title: localize2("workbench.action.chat.attachSelection.label", "Add Selection to Chat"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorContextKeys.hasNonEmptySelection, ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote), ResourceContextKey.Scheme.isEqualTo(Schemas.untitled), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData)))
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async run(accessor, ...args) {
    const editorService = accessor.get(IEditorService);
    const widget = await accessor.get(IInstantiationService).invokeFunction(withChatView);
    if (!widget) {
      return;
    }
    const [_, matches] = args;
    if (matches && matches.length > 0) {
      const uris = /* @__PURE__ */ new Map();
      for (const match of matches) {
        if (isSearchTreeFileMatch(match)) {
          uris.set(match.resource, void 0);
        } else {
          const context = { uri: match._parent.resource, range: match._range };
          const range = uris.get(context.uri);
          if (!range || range.startLineNumber !== context.range.startLineNumber && range.endLineNumber !== context.range.endLineNumber) {
            uris.set(context.uri, context.range);
            widget.attachmentModel.addFile(context.uri, context.range);
          }
        }
      }
      for (const uri of uris) {
        const [resource, range] = uri;
        if (!range) {
          widget.attachmentModel.addFile(resource);
        }
      }
    } else {
      const activeEditor = editorService.activeTextEditorControl;
      const activeUri = EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
      if (activeEditor && activeUri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(activeUri.scheme)) {
        const selection = activeEditor.getSelection();
        if (selection) {
          widget.focusInput();
          const range = selection.isEmpty() ? new Range(selection.startLineNumber, 1, selection.startLineNumber + 1, 1) : selection;
          widget.attachmentModel.addFile(activeUri, range);
        }
      }
    }
  }
}
class AttachSearchResultAction extends Action2 {
  static {
    __name(this, "AttachSearchResultAction");
  }
  static {
    this.Name = "searchResults";
  }
  constructor() {
    super({
      id: "workbench.action.chat.insertSearchResults",
      title: localize2("chat.insertSearchResults", "Add Search Results to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 3,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, SearchContext.SearchResultHeaderFocused)
      }]
    });
  }
  async run(accessor) {
    const logService = accessor.get(ILogService);
    const widget = await accessor.get(IInstantiationService).invokeFunction(withChatView);
    if (!widget) {
      logService.trace("InsertSearchResultAction: no chat view available");
      return;
    }
    const editor = widget.inputEditor;
    const originalRange = editor.getSelection() ?? editor.getModel()?.getFullModelRange().collapseToEnd();
    if (!originalRange) {
      logService.trace("InsertSearchResultAction: no selection");
      return;
    }
    let insertText = `#${AttachSearchResultAction.Name}`;
    const varRange = new Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.startLineNumber + insertText.length);
    const model = editor.getModel();
    if (model && model.getValueInRange(new Range(originalRange.startLineNumber, originalRange.startColumn - 1, originalRange.startLineNumber, originalRange.startColumn)) !== " ") {
      insertText = " " + insertText;
    }
    const success = editor.executeEdits("chatInsertSearch", [{ range: varRange, text: insertText + " " }]);
    if (!success) {
      logService.trace(`InsertSearchResultAction: failed to insert "${insertText}"`);
      return;
    }
  }
}
function isIContextPickItemItem(obj) {
  return isObject(obj) && typeof obj.kind === "string" && obj.kind === "contextPick";
}
__name(isIContextPickItemItem, "isIContextPickItemItem");
function isIGotoSymbolQuickPickItem(obj) {
  return isObject(obj) && typeof obj.symbolName === "string" && !!obj.uri && !!obj.range;
}
__name(isIGotoSymbolQuickPickItem, "isIGotoSymbolQuickPickItem");
function isIQuickPickItemWithResource(obj) {
  return isObject(obj) && URI.isUri(obj.resource);
}
__name(isIQuickPickItemWithResource, "isIQuickPickItemWithResource");
class AttachContextAction extends Action2 {
  static {
    __name(this, "AttachContextAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.attachContext",
      title: localize2("workbench.action.chat.attachContext.label.2", "Add Context..."),
      icon: Codicon.attach,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat)),
        primary: 2048 | 90,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: {
        when: ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat), ContextKeyExpr.and(ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditorInline), CTX_INLINE_CHAT_V2_ENABLED)), ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.agentSupportsAttachments)),
        id: MenuId.ChatInputAttachmentToolbar,
        group: "navigation",
        order: 3
      }
    });
  }
  async run(accessor, ...args) {
    const instantiationService = accessor.get(IInstantiationService);
    const widgetService = accessor.get(IChatWidgetService);
    const contextKeyService = accessor.get(IContextKeyService);
    const keybindingService = accessor.get(IKeybindingService);
    const contextPickService = accessor.get(IChatContextPickService);
    const context = args[0];
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const quickPickItems = [];
    for (const item of contextPickService.items) {
      if (item.isEnabled && !await item.isEnabled(widget)) {
        continue;
      }
      quickPickItems.push({
        kind: "contextPick",
        item,
        label: item.label,
        iconClass: ThemeIcon.asClassName(item.icon),
        keybinding: item.commandId ? keybindingService.lookupKeybinding(item.commandId, contextKeyService) : void 0
      });
    }
    instantiationService.invokeFunction(this._show.bind(this), widget, quickPickItems, context?.placeholder);
  }
  _show(accessor, widget, additionPicks, placeholder) {
    const quickInputService = accessor.get(IQuickInputService);
    const quickChatService = accessor.get(IQuickChatService);
    const instantiationService = accessor.get(IInstantiationService);
    const commandService = accessor.get(ICommandService);
    const providerOptions = {
      filter: /* @__PURE__ */ __name((pick) => {
        if (isIQuickPickItemWithResource(pick) && pick.resource) {
          return instantiationService.invokeFunction((accessor2) => isSupportedChatFileScheme(accessor2, pick.resource.scheme));
        }
        return true;
      }, "filter"),
      additionPicks,
      handleAccept: /* @__PURE__ */ __name(async (item, isBackgroundAccept) => {
        if (isIContextPickItemItem(item)) {
          let isDone = true;
          if (item.item.type === "valuePick") {
            this._handleContextPick(item.item, widget);
          } else if (item.item.type === "pickerPick") {
            isDone = await this._handleContextPickerItem(quickInputService, commandService, item.item, widget);
          }
          if (!isDone) {
            instantiationService.invokeFunction(this._show.bind(this), widget, additionPicks, placeholder);
            return;
          }
        } else {
          instantiationService.invokeFunction(this._handleQPPick.bind(this), widget, isBackgroundAccept, item);
        }
        if (isQuickChat(widget)) {
          quickChatService.open();
        }
      }, "handleAccept")
    };
    quickInputService.quickAccess.show("", {
      enabledProviderPrefixes: [
        AnythingQuickAccessProvider.PREFIX,
        SymbolsQuickAccessProvider.PREFIX,
        AbstractGotoSymbolQuickAccessProvider.PREFIX
      ],
      placeholder: placeholder ?? localize("chatContext.attach.placeholder", "Search attachments"),
      providerOptions
    });
  }
  async _handleQPPick(accessor, widget, isInBackground, pick) {
    const fileService = accessor.get(IFileService);
    const textModelService = accessor.get(ITextModelService);
    const toAttach = [];
    if (isIQuickPickItemWithResource(pick) && pick.resource) {
      if (/\.(png|jpg|jpeg|bmp|gif|tiff)$/i.test(pick.resource.path)) {
        if (URI.isUri(pick.resource)) {
          const readFile = await fileService.readFile(pick.resource);
          const resizedImage = await resizeImage(readFile.value.buffer);
          toAttach.push({
            id: pick.resource.toString(),
            name: pick.label,
            fullName: pick.label,
            value: resizedImage,
            kind: "image",
            references: [{ reference: pick.resource, kind: "reference" }]
          });
        }
      } else {
        let omittedState = 0;
        try {
          const createdModel = await textModelService.createModelReference(pick.resource);
          createdModel.dispose();
        } catch {
          omittedState = 2;
        }
        toAttach.push({
          kind: "file",
          id: pick.resource.toString(),
          value: pick.resource,
          name: pick.label,
          omittedState
        });
      }
    } else if (isIGotoSymbolQuickPickItem(pick) && pick.uri && pick.range) {
      toAttach.push({
        kind: "generic",
        id: JSON.stringify({ uri: pick.uri, range: pick.range.decoration }),
        value: { uri: pick.uri, range: pick.range.decoration },
        fullName: pick.label,
        name: pick.symbolName
      });
    }
    widget.attachmentModel.addContext(...toAttach);
    if (!isInBackground) {
      widget.focusInput();
    }
  }
  async _handleContextPick(item, widget) {
    const value = await item.asAttachment(widget);
    if (Array.isArray(value)) {
      widget.attachmentModel.addContext(...value);
    } else if (value) {
      widget.attachmentModel.addContext(value);
    }
  }
  async _handleContextPickerItem(quickInputService, commandService, item, widget) {
    const pickerConfig = item.asPicker(widget);
    const store = new DisposableStore();
    const goBackItem = {
      label: localize("goBack", "Go back \u21A9"),
      alwaysShow: true
    };
    const configureItem = pickerConfig.configure ? {
      label: pickerConfig.configure.label,
      commandId: pickerConfig.configure.commandId,
      alwaysShow: true
    } : void 0;
    const extraPicks = [{ type: "separator" }];
    if (configureItem) {
      extraPicks.push(configureItem);
    }
    extraPicks.push(goBackItem);
    const qp = store.add(quickInputService.createQuickPick({ useSeparators: true }));
    const cts = new CancellationTokenSource();
    store.add(qp.onDidHide(() => cts.cancel()));
    store.add(toDisposable(() => cts.dispose(true)));
    qp.placeholder = pickerConfig.placeholder;
    qp.matchOnDescription = true;
    qp.matchOnDetail = true;
    qp.canAcceptInBackground = true;
    qp.busy = true;
    qp.show();
    if (isThenable(pickerConfig.picks)) {
      const items = await pickerConfig.picks.then((value) => {
        return [].concat(value, extraPicks);
      });
      qp.items = items;
      qp.busy = false;
    } else {
      const query = observableValue("attachContext.query", qp.value);
      store.add(qp.onDidChangeValue(() => query.set(qp.value, void 0)));
      const picksObservable = pickerConfig.picks(query, cts.token);
      store.add(autorun((reader) => {
        const { busy, picks } = picksObservable.read(reader);
        qp.items = [].concat(picks, extraPicks);
        qp.busy = busy;
      }));
    }
    if (cts.token.isCancellationRequested) {
      pickerConfig.dispose?.();
      return true;
    }
    const defer = new DeferredPromise();
    const addPromises = [];
    store.add(qp.onDidAccept(async (e) => {
      const noop = "noop";
      const [selected] = qp.selectedItems;
      if (isChatContextPickerPickItem(selected)) {
        const attachment = selected.asAttachment();
        if (!attachment || attachment === noop) {
          return;
        }
        if (isThenable(attachment)) {
          addPromises.push(attachment.then((v) => {
            if (v !== noop) {
              widget.attachmentModel.addContext(...asArray(v));
            }
          }));
        } else {
          widget.attachmentModel.addContext(...asArray(attachment));
        }
      }
      if (selected === goBackItem) {
        if (pickerConfig.goBack?.()) {
          return;
        }
        defer.complete(false);
      }
      if (selected === configureItem) {
        defer.complete(true);
        commandService.executeCommand(configureItem.commandId);
      }
      if (!e.inBackground) {
        defer.complete(true);
      }
    }));
    store.add(qp.onDidHide(() => {
      defer.complete(true);
      pickerConfig.dispose?.();
    }));
    try {
      const result = await defer.p;
      qp.busy = true;
      await Promise.all(addPromises);
      return result;
    } finally {
      store.dispose();
    }
  }
}
export {
  AttachContextAction,
  AttachSearchResultAction,
  registerChatContextActions
};
//# sourceMappingURL=chatContextActions.js.map
