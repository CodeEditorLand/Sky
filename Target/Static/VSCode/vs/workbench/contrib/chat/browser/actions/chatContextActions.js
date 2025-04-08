var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ResolvedKeybinding } from "../../../../../base/common/keybindings.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isElectron } from "../../../../../base/common/platform.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { compare } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { WithUriValue } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { IRange, Range } from "../../../../../editor/common/core/range.js";
import { Command } from "../../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, IAction2Options, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { AnythingQuickAccessProviderRunOptions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService, IQuickPickItem, IQuickPickItemWithResource, IQuickPickSeparator, QuickPickItem } from "../../../../../platform/quickinput/common/quickInput.js";
import { ActiveEditorContext, TextCompareEditorActiveContext } from "../../../../common/contextkeys.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionService, isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { VIEW_ID as SEARCH_VIEW_ID } from "../../../../services/search/common/search.js";
import { UntitledTextEditorInput } from "../../../../services/untitled/common/untitledTextEditorInput.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { FileEditorInput } from "../../../files/browser/editors/fileEditorInput.js";
import { TEXT_FILE_EDITOR_ID } from "../../../files/common/files.js";
import { NotebookEditorInput } from "../../../notebook/common/notebookEditorInput.js";
import { AnythingQuickAccessProvider } from "../../../search/browser/anythingQuickAccess.js";
import { isSearchTreeFileMatch, isSearchTreeMatch } from "../../../search/browser/searchTreeModel/searchTreeCommon.js";
import { SearchView } from "../../../search/browser/searchView.js";
import { ISymbolQuickPickItem, SymbolsQuickAccessProvider } from "../../../search/browser/symbolsQuickAccess.js";
import { SearchContext } from "../../../search/common/constants.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { IChatRequestVariableEntry, IDiagnosticVariableEntryFilterData, OmittedState } from "../../common/chatModel.js";
import { ChatRequestAgentPart } from "../../common/chatParserTypes.js";
import { IChatVariablesService } from "../../common/chatVariables.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { IChatWidget, IChatWidgetService, IQuickChatService, showChatView } from "../chat.js";
import { imageToHash, isImage } from "../chatPasteProviders.js";
import { isQuickChat } from "../chatWidget.js";
import { createFolderQuickPick, createMarkersQuickPick } from "../contrib/chatDynamicVariables.js";
import { convertBufferToScreenshotVariable, ScreenshotVariableId } from "../contrib/screenshot.js";
import { resizeImage } from "../imageUtils.js";
import { COMMAND_ID as USE_PROMPT_COMMAND_ID } from "../promptSyntax/contributions/usePromptCommand.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { ATTACH_PROMPT_ACTION_ID, AttachPromptAction, IChatAttachPromptActionOptions } from "./chatAttachPromptAction/chatAttachPromptAction.js";
function registerChatContextActions() {
  registerAction2(AttachContextAction);
  registerAction2(AttachFileToChatAction);
  registerAction2(AttachFolderToChatAction);
  registerAction2(AttachSelectionToChatAction);
  registerAction2(AttachSearchResultAction);
}
__name(registerChatContextActions, "registerChatContextActions");
function isIGotoSymbolQuickPickItem(obj) {
  return typeof obj === "object" && typeof obj.symbolName === "string" && !!obj.uri && !!obj.range;
}
__name(isIGotoSymbolQuickPickItem, "isIGotoSymbolQuickPickItem");
function isISymbolQuickPickItem(obj) {
  return typeof obj === "object" && typeof obj.symbol === "object" && !!obj.symbol;
}
__name(isISymbolQuickPickItem, "isISymbolQuickPickItem");
function isIFolderSearchResultQuickPickItem(obj) {
  return typeof obj === "object" && obj.kind === "folder-search-result";
}
__name(isIFolderSearchResultQuickPickItem, "isIFolderSearchResultQuickPickItem");
function isIDiagnosticsQuickPickItemWithFilter(obj) {
  return typeof obj === "object" && obj.kind === "diagnostic-filter";
}
__name(isIDiagnosticsQuickPickItemWithFilter, "isIDiagnosticsQuickPickItemWithFilter");
function isIQuickPickItemWithResource(obj) {
  return typeof obj === "object" && typeof obj.resource === "object" && URI.isUri(obj.resource);
}
__name(isIQuickPickItemWithResource, "isIQuickPickItemWithResource");
function isIOpenEditorsQuickPickItem(obj) {
  return typeof obj === "object" && obj.id === "open-editors";
}
__name(isIOpenEditorsQuickPickItem, "isIOpenEditorsQuickPickItem");
function isISearchResultsQuickPickItem(obj) {
  return typeof obj === "object" && obj.kind === "search-results";
}
__name(isISearchResultsQuickPickItem, "isISearchResultsQuickPickItem");
function isScreenshotQuickPickItem(obj) {
  return typeof obj === "object" && obj.kind === "screenshot";
}
__name(isScreenshotQuickPickItem, "isScreenshotQuickPickItem");
function isRelatedFileQuickPickItem(obj) {
  return typeof obj === "object" && obj.kind === "related-files";
}
__name(isRelatedFileQuickPickItem, "isRelatedFileQuickPickItem");
function isPromptInstructionsQuickPickItem(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return "kind" in obj && obj.kind === "reusable-prompt";
}
__name(isPromptInstructionsQuickPickItem, "isPromptInstructionsQuickPickItem");
const REUSABLE_PROMPT_PICK_ID = "reusable-prompt";
class AttachResourceAction extends Action2 {
  static {
    __name(this, "AttachResourceAction");
  }
  getResources(accessor, ...args) {
    const editorService = accessor.get(IEditorService);
    const contexts = Array.isArray(args[1]) ? args[1] : [args[0]];
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
}
class AttachFileToChatAction extends AttachResourceAction {
  static {
    __name(this, "AttachFileToChatAction");
  }
  static ID = "workbench.action.chat.attachFile";
  constructor() {
    super({
      id: AttachFileToChatAction.ID,
      title: localize2("workbench.action.chat.attachFile.label", "Add File to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID), TextCompareEditorActiveContext), SearchContext.SearchResultHeaderFocused.negate())
      }]
    });
  }
  async run(accessor, ...args) {
    const variablesService = accessor.get(IChatVariablesService);
    const files = this.getResources(accessor, ...args);
    if (files.length) {
      (await showChatView(accessor.get(IViewsService)))?.focusInput();
      for (const file of files) {
        variablesService.attachContext("file", file, ChatAgentLocation.Panel);
      }
    }
  }
}
class AttachFolderToChatAction extends AttachResourceAction {
  static {
    __name(this, "AttachFolderToChatAction");
  }
  static ID = "workbench.action.chat.attachFolder";
  constructor() {
    super({
      id: AttachFolderToChatAction.ID,
      title: localize2("workbench.action.chat.attachFolder.label", "Add Folder to Chat"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args) {
    const variablesService = accessor.get(IChatVariablesService);
    const folders = this.getResources(accessor, ...args);
    if (folders.length) {
      (await showChatView(accessor.get(IViewsService)))?.focusInput();
      for (const folder of folders) {
        variablesService.attachContext("folder", folder, ChatAgentLocation.Panel);
      }
    }
  }
}
class AttachSelectionToChatAction extends Action2 {
  static {
    __name(this, "AttachSelectionToChatAction");
  }
  static ID = "workbench.action.chat.attachSelection";
  constructor() {
    super({
      id: AttachSelectionToChatAction.ID,
      title: localize2("workbench.action.chat.attachSelection.label", "Add Selection to Chat"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args) {
    const variablesService = accessor.get(IChatVariablesService);
    const editorService = accessor.get(IEditorService);
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
            variablesService.attachContext("file", context, ChatAgentLocation.Panel);
          }
        }
      }
      for (const uri of uris) {
        const [resource, range] = uri;
        if (!range) {
          variablesService.attachContext("file", { uri: resource }, ChatAgentLocation.Panel);
        }
      }
    } else {
      const activeEditor = editorService.activeTextEditorControl;
      const activeUri = EditorResourceAccessor.getCanonicalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
      if (editorService.activeTextEditorControl && activeUri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(activeUri.scheme)) {
        const selection = activeEditor?.getSelection();
        if (selection) {
          (await showChatView(accessor.get(IViewsService)))?.focusInput();
          const range = selection.isEmpty() ? new Range(selection.startLineNumber, 1, selection.startLineNumber + 1, 1) : selection;
          variablesService.attachContext("file", { uri: activeUri, range }, ChatAgentLocation.Panel);
        }
      }
    }
  }
}
class AttachSearchResultAction extends Action2 {
  static {
    __name(this, "AttachSearchResultAction");
  }
  static Name = "searchResults";
  static ID = "workbench.action.chat.insertSearchResults";
  constructor() {
    super({
      id: AttachSearchResultAction.ID,
      title: localize2("chat.insertSearchResults", "Add Search Results to Chat"),
      category: CHAT_CATEGORY,
      f1: false,
      menu: [{
        id: MenuId.SearchContext,
        group: "z_chat",
        order: 3,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          SearchContext.SearchResultHeaderFocused
        )
      }]
    });
  }
  async run(accessor, ...args) {
    const logService = accessor.get(ILogService);
    const widget = await showChatView(accessor.get(IViewsService));
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
    const varRange = new Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.startColumn + insertText.length);
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
class AttachContextAction extends Action2 {
  static {
    __name(this, "AttachContextAction");
  }
  static ID = "workbench.action.chat.attachContext";
  constructor(desc = {
    id: AttachContextAction.ID,
    title: localize2("workbench.action.chat.attachContext.label.2", "Add Context..."),
    icon: Codicon.attach,
    category: CHAT_CATEGORY,
    keybinding: {
      when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel)),
      primary: KeyMod.CtrlCmd | KeyCode.Slash,
      weight: KeybindingWeight.EditorContrib
    },
    menu: {
      when: ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel),
      id: MenuId.ChatInputAttachmentToolbar,
      group: "navigation",
      order: 3
    }
  }) {
    super(desc);
  }
  _getFileContextId(item) {
    if ("resource" in item) {
      return item.resource.toString();
    }
    return item.uri.toString() + (item.range.startLineNumber !== item.range.endLineNumber ? `:${item.range.startLineNumber}-${item.range.endLineNumber}` : `:${item.range.startLineNumber}`);
  }
  async _attachContext(widget, quickInputService, commandService, clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, isInBackground, ...picks) {
    const toAttach = [];
    for (const pick of picks) {
      if (isISymbolQuickPickItem(pick) && pick.symbol) {
        toAttach.push({
          kind: "symbol",
          id: this._getFileContextId(pick.symbol.location),
          value: pick.symbol.location,
          symbolKind: pick.symbol.kind,
          fullName: pick.label,
          name: pick.symbol.name
        });
      } else if (isIFolderSearchResultQuickPickItem(pick)) {
        const folder = pick.resource;
        toAttach.push({
          id: pick.id,
          value: folder,
          name: basename(folder),
          isFile: false,
          isDirectory: true
        });
      } else if (isIDiagnosticsQuickPickItemWithFilter(pick)) {
        toAttach.push({
          id: pick.id,
          name: pick.label,
          value: pick.filter,
          kind: "diagnostic",
          icon: pick.icon,
          ...pick.filter
        });
      } else if (isIQuickPickItemWithResource(pick) && pick.resource) {
        if (/\.(png|jpg|jpeg|bmp|gif|tiff)$/i.test(pick.resource.path)) {
          if (URI.isUri(pick.resource)) {
            const readFile = await fileService.readFile(pick.resource);
            const resizedImage = await resizeImage(readFile.value.buffer);
            toAttach.push({
              id: pick.resource.toString(),
              name: pick.label,
              fullName: pick.label,
              value: resizedImage,
              kind: "image"
            });
          }
        } else {
          let omittedState = OmittedState.NotOmitted;
          try {
            const createdModel = await textModelService.createModelReference(pick.resource);
            createdModel.dispose();
          } catch {
            omittedState = OmittedState.Full;
          }
          toAttach.push({
            id: this._getFileContextId({ resource: pick.resource }),
            value: pick.resource,
            name: pick.label,
            isFile: true,
            omittedState
          });
        }
      } else if (isIGotoSymbolQuickPickItem(pick) && pick.uri && pick.range) {
        toAttach.push({
          range: void 0,
          id: this._getFileContextId({ uri: pick.uri, range: pick.range.decoration }),
          value: { uri: pick.uri, range: pick.range.decoration },
          fullName: pick.label,
          name: pick.symbolName
        });
      } else if (isIOpenEditorsQuickPickItem(pick)) {
        for (const editor of editorService.editors.filter((e) => e instanceof FileEditorInput || e instanceof DiffEditorInput || e instanceof UntitledTextEditorInput || e instanceof NotebookEditorInput)) {
          const uri = editor instanceof DiffEditorInput ? editor.modified.resource : editor.resource;
          if (uri) {
            toAttach.push({
              id: this._getFileContextId({ resource: uri }),
              value: uri,
              name: labelService.getUriBasenameLabel(uri),
              isFile: true
            });
          }
        }
      } else if (isISearchResultsQuickPickItem(pick)) {
        const searchView = viewsService.getViewWithId(SEARCH_VIEW_ID);
        for (const result of searchView.model.searchResult.matches()) {
          toAttach.push({
            id: this._getFileContextId({ resource: result.resource }),
            value: result.resource,
            name: labelService.getUriBasenameLabel(result.resource),
            isFile: true
          });
        }
      } else if (isRelatedFileQuickPickItem(pick)) {
        const chatSessionId = widget.viewModel?.sessionId;
        if (!chatSessionId || !chatEditingService) {
          continue;
        }
        const relatedFiles = await chatEditingService.getRelatedFiles(chatSessionId, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None);
        if (!relatedFiles) {
          continue;
        }
        const attachments = widget.attachmentModel.getAttachmentIDs();
        const itemsPromise = chatEditingService.getRelatedFiles(chatSessionId, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None).then((files) => (files ?? []).reduce((acc, cur) => {
          acc.push({ type: "separator", label: cur.group });
          for (const file of cur.files) {
            acc.push({
              type: "item",
              label: labelService.getUriBasenameLabel(file.uri),
              description: labelService.getUriLabel(dirname(file.uri), { relative: true }),
              value: file.uri,
              disabled: attachments.has(this._getFileContextId({ resource: file.uri })),
              picked: true
            });
          }
          return acc;
        }, []));
        const selectedFiles = await quickInputService.pick(itemsPromise, { placeHolder: localize("relatedFiles", "Add related files to your working set"), canPickMany: true });
        for (const file of selectedFiles ?? []) {
          toAttach.push({
            id: this._getFileContextId({ resource: file.value }),
            value: file.value,
            name: file.label,
            isFile: true,
            omittedState: OmittedState.NotOmitted
          });
        }
      } else if (isScreenshotQuickPickItem(pick)) {
        const blob = await hostService.getScreenshot();
        if (blob) {
          toAttach.push(convertBufferToScreenshotVariable(blob));
        }
      } else if (isPromptInstructionsQuickPickItem(pick)) {
        const options = { widget };
        await commandService.executeCommand(ATTACH_PROMPT_ACTION_ID, options);
      } else {
        const attachmentPick = pick;
        if (attachmentPick.kind === "command") {
          const selection = await commandService.executeCommand(attachmentPick.command.id, ...attachmentPick.command.arguments ?? []);
          if (!selection) {
            continue;
          }
          toAttach.push({
            ...attachmentPick,
            value: attachmentPick.value,
            name: `${typeof attachmentPick.value === "string" && attachmentPick.value.startsWith("#") ? attachmentPick.value.slice(1) : ""}${selection}`,
            // Apply the original icon with the new name
            fullName: selection
          });
        } else if (attachmentPick.kind === "tool") {
          toAttach.push({
            id: attachmentPick.id,
            name: attachmentPick.label,
            fullName: attachmentPick.label,
            value: void 0,
            icon: attachmentPick.icon,
            isTool: true
          });
        } else if (attachmentPick.kind === "image") {
          const fileBuffer = await clipboardService.readImage();
          toAttach.push({
            id: await imageToHash(fileBuffer),
            name: localize("pastedImage", "Pasted Image"),
            fullName: localize("pastedImage", "Pasted Image"),
            value: fileBuffer,
            kind: "image"
          });
        }
      }
    }
    widget.attachmentModel.addContext(...toAttach);
    if (!isInBackground) {
      widget.focusInput();
    }
  }
  async run(accessor, ...args) {
    const quickInputService = accessor.get(IQuickInputService);
    const chatAgentService = accessor.get(IChatAgentService);
    const commandService = accessor.get(ICommandService);
    const widgetService = accessor.get(IChatWidgetService);
    const languageModelToolsService = accessor.get(ILanguageModelToolsService);
    const quickChatService = accessor.get(IQuickChatService);
    const clipboardService = accessor.get(IClipboardService);
    const editorService = accessor.get(IEditorService);
    const labelService = accessor.get(ILabelService);
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    const hostService = accessor.get(IHostService);
    const extensionService = accessor.get(IExtensionService);
    const fileService = accessor.get(IFileService);
    const textModelService = accessor.get(ITextModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const keybindingService = accessor.get(IKeybindingService);
    const context = args[0];
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const chatEditingService = accessor.get(IChatEditingService);
    const quickPickItems = [];
    if (extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData"))) {
      const imageData = await clipboardService.readImage();
      if (isImage(imageData)) {
        quickPickItems.push({
          kind: "image",
          id: await imageToHash(imageData),
          label: localize("imageFromClipboard", "Image from Clipboard"),
          iconClass: ThemeIcon.asClassName(Codicon.fileMedia)
        });
      }
      quickPickItems.push({
        kind: "screenshot",
        id: ScreenshotVariableId,
        icon: ThemeIcon.fromId(Codicon.deviceCamera.id),
        iconClass: ThemeIcon.asClassName(Codicon.deviceCamera),
        label: isElectron ? localize("chatContext.attachScreenshot.labelElectron.Window", "Screenshot Window") : localize("chatContext.attachScreenshot.labelWeb", "Screenshot")
      });
    }
    if (widget.viewModel?.sessionId) {
      const agentPart = widget.parsedInput.parts.find((part) => part instanceof ChatRequestAgentPart);
      if (agentPart) {
        const completions = await chatAgentService.getAgentCompletionItems(agentPart.agent.id, "", CancellationToken.None);
        for (const variable of completions) {
          if (variable.fullName && variable.command) {
            quickPickItems.push({
              kind: "command",
              label: variable.fullName,
              id: variable.id,
              command: variable.command,
              icon: variable.icon,
              iconClass: variable.icon ? ThemeIcon.asClassName(variable.icon) : void 0,
              value: variable.value,
              name: variable.name
            });
          } else {
          }
        }
      }
    }
    for (const tool of languageModelToolsService.getTools()) {
      if (tool.canBeReferencedInPrompt) {
        const item = {
          kind: "tool",
          label: tool.displayName ?? "",
          id: tool.id,
          icon: ThemeIcon.isThemeIcon(tool.icon) ? tool.icon : void 0
          // TODO need to support icon path?
        };
        if (ThemeIcon.isThemeIcon(tool.icon)) {
          item.iconClass = ThemeIcon.asClassName(tool.icon);
        } else if (tool.icon) {
          item.iconPath = tool.icon;
        }
        quickPickItems.push(item);
      }
    }
    quickPickItems.push({
      kind: "quickaccess",
      label: localize("chatContext.symbol", "Symbol..."),
      iconClass: ThemeIcon.asClassName(Codicon.symbolField),
      prefix: SymbolsQuickAccessProvider.PREFIX,
      id: "symbol"
    });
    quickPickItems.push({
      kind: "folder",
      label: localize("chatContext.folder", "Folder..."),
      iconClass: ThemeIcon.asClassName(Codicon.folder),
      id: "folder"
    });
    quickPickItems.push({
      kind: "diagnostic",
      label: localize("chatContext.diagnstic", "Problem..."),
      iconClass: ThemeIcon.asClassName(Codicon.error),
      id: "diagnostic"
    });
    if (widget.location === ChatAgentLocation.Notebook) {
      quickPickItems.push({
        kind: "command",
        id: "chatContext.notebook.kernelVariable",
        icon: ThemeIcon.fromId(Codicon.serverEnvironment.id),
        iconClass: ThemeIcon.asClassName(Codicon.serverEnvironment),
        value: "kernelVariable",
        label: localize("chatContext.notebook.kernelVariable", "Kernel Variable..."),
        command: {
          id: "notebook.chat.selectAndInsertKernelVariable",
          title: localize("chatContext.notebook.selectkernelVariable", "Select and Insert Kernel Variable"),
          arguments: [{ widget, range: void 0 }]
        }
      });
    }
    if (context?.showFilesOnly) {
      if (chatEditingService?.hasRelatedFilesProviders() && (widget.getInput() || widget.attachmentModel.fileAttachments.length > 0)) {
        quickPickItems.unshift({
          kind: "related-files",
          id: "related-files",
          label: localize("chatContext.relatedFiles", "Related Files"),
          iconClass: ThemeIcon.asClassName(Codicon.sparkle)
        });
      }
      if (editorService.editors.filter((e) => e instanceof FileEditorInput || e instanceof DiffEditorInput || e instanceof UntitledTextEditorInput).length > 0) {
        quickPickItems.unshift({
          kind: "open-editors",
          id: "open-editors",
          label: localize("chatContext.editors", "Open Editors"),
          iconClass: ThemeIcon.asClassName(Codicon.files)
        });
      }
      if (SearchContext.HasSearchResults.getValue(contextKeyService)) {
        quickPickItems.unshift({
          kind: "search-results",
          id: "search-results",
          label: localize("chatContext.searchResults", "Search Results"),
          iconClass: ThemeIcon.asClassName(Codicon.search)
        });
      }
    }
    if (widget.attachmentModel.promptInstructions.featureEnabled) {
      const keybinding = keybindingService.lookupKeybinding(USE_PROMPT_COMMAND_ID, contextKeyService);
      quickPickItems.push({
        id: REUSABLE_PROMPT_PICK_ID,
        kind: REUSABLE_PROMPT_PICK_ID,
        label: localize("chatContext.attach.prompt.label", "Prompt..."),
        iconClass: ThemeIcon.asClassName(Codicon.bookmark),
        keybinding
      });
    }
    function extractTextFromIconLabel(label) {
      if (!label) {
        return "";
      }
      const match = label.match(/\$\([^\)]+\)\s*(.+)/);
      return match ? match[1] : label;
    }
    __name(extractTextFromIconLabel, "extractTextFromIconLabel");
    this._show(quickInputService, commandService, widget, quickChatService, quickPickItems.sort(function(a, b) {
      if (a.kind === "open-editors") {
        return -1;
      }
      if (b.kind === "open-editors") {
        return 1;
      }
      const first = extractTextFromIconLabel(a.label).toUpperCase();
      const second = extractTextFromIconLabel(b.label).toUpperCase();
      return compare(first, second);
    }), clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, instantiationService, "", context?.placeholder);
  }
  async _showDiagnosticsPick(instantiationService, onBackgroundAccept) {
    const convert = /* @__PURE__ */ __name((item) => ({
      kind: "diagnostic-filter",
      id: IDiagnosticVariableEntryFilterData.id(item),
      label: IDiagnosticVariableEntryFilterData.label(item),
      icon: IDiagnosticVariableEntryFilterData.icon,
      filter: item
    }), "convert");
    const filter = await instantiationService.invokeFunction((accessor) => createMarkersQuickPick(accessor, "problem", (items) => onBackgroundAccept(items.map(convert))));
    return filter && convert(filter);
  }
  _show(quickInputService, commandService, widget, quickChatService, quickPickItems, clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, instantiationService, query = "", placeholder) {
    const attach = /* @__PURE__ */ __name((isBackgroundAccept, ...items) => {
      this._attachContext(widget, quickInputService, commandService, clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, isBackgroundAccept, ...items);
    }, "attach");
    const providerOptions = {
      handleAccept: /* @__PURE__ */ __name(async (inputItem, isBackgroundAccept) => {
        let item = inputItem;
        if ("kind" in item && item.kind === "folder") {
          item = await this._showFolders(instantiationService);
        } else if ("kind" in item && item.kind === "diagnostic") {
          item = await this._showDiagnosticsPick(instantiationService, (i) => attach(true, ...i));
        }
        if (!item) {
          this._show(quickInputService, commandService, widget, quickChatService, quickPickItems, clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, instantiationService, "", placeholder);
          return;
        }
        if ("prefix" in item) {
          this._show(quickInputService, commandService, widget, quickChatService, quickPickItems, clipboardService, editorService, labelService, viewsService, chatEditingService, hostService, fileService, textModelService, instantiationService, item.prefix, placeholder);
        } else {
          if (!clipboardService) {
            return;
          }
          attach(isBackgroundAccept, item);
          if (isQuickChat(widget)) {
            quickChatService.open();
          }
        }
      }, "handleAccept"),
      additionPicks: quickPickItems,
      filter: /* @__PURE__ */ __name((item) => {
        const attachedContext = widget.attachmentModel.getAttachmentIDs();
        if (isIOpenEditorsQuickPickItem(item)) {
          for (const editor of editorService.editors.filter((e) => e instanceof FileEditorInput || e instanceof DiffEditorInput || e instanceof UntitledTextEditorInput)) {
            if (editor.resource && !attachedContext.has(this._getFileContextId({ resource: editor.resource }))) {
              return true;
            }
          }
          return false;
        }
        if ("kind" in item && item.kind === "image") {
          return !attachedContext.has(item.id);
        }
        if ("symbol" in item && item.symbol) {
          return !attachedContext.has(this._getFileContextId(item.symbol.location));
        }
        if (item && typeof item === "object" && "resource" in item && URI.isUri(item.resource)) {
          return [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(item.resource.scheme) && !attachedContext.has(this._getFileContextId({ resource: item.resource }));
        }
        if (item && typeof item === "object" && "uri" in item && item.uri && item.range) {
          return !attachedContext.has(this._getFileContextId({ uri: item.uri, range: item.range.decoration }));
        }
        if (!("command" in item) && item.id) {
          return !attachedContext.has(item.id);
        }
        return true;
      }, "filter")
    };
    quickInputService.quickAccess.show(query, {
      enabledProviderPrefixes: [
        AnythingQuickAccessProvider.PREFIX,
        SymbolsQuickAccessProvider.PREFIX,
        AbstractGotoSymbolQuickAccessProvider.PREFIX
      ],
      placeholder: placeholder ?? localize("chatContext.attach.placeholder", "Search attachments"),
      providerOptions
    });
  }
  async _showFolders(instantiationService) {
    const folder = await instantiationService.invokeFunction((accessor) => createFolderQuickPick(accessor));
    if (!folder) {
      return void 0;
    }
    return {
      kind: "folder-search-result",
      id: folder.toString(),
      label: basename(folder),
      resource: folder
    };
  }
}
registerAction2(AttachPromptAction);
export {
  AttachContextAction,
  AttachSearchResultAction,
  registerChatContextActions
};
//# sourceMappingURL=chatContextActions.js.map
