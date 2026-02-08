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
var ChatToolOutputContentSubPart_1;
import * as dom from "../../../../../../base/browser/dom.js";
import { disposableTimeout } from "../../../../../../base/common/async.js";
import { decodeBase64 } from "../../../../../../base/common/buffer.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { basename, joinPath } from "../../../../../../base/common/resources.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { Action2, MenuId, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IFileDialogService } from "../../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../../../platform/notification/common/notification.js";
import { IProgressService } from "../../../../../../platform/progress/common/progress.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "../../../../files/browser/fileConstants.js";
import { getAttachableImageExtension } from "../../../common/model/chatModel.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { IMarkdownRendererService } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { ChatAttachmentsContentPart } from "./chatAttachmentsContentPart.js";
let ChatToolOutputContentSubPart = class ChatToolOutputContentSubPart2 extends Disposable {
  static {
    __name(this, "ChatToolOutputContentSubPart");
  }
  static {
    ChatToolOutputContentSubPart_1 = this;
  }
  constructor(context, parts, _instantiationService, contextKeyService, _contextMenuService, _fileService, _markdownRendererService, modelService, languageService) {
    super();
    this.context = context;
    this.parts = parts;
    this._instantiationService = _instantiationService;
    this.contextKeyService = contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._fileService = _fileService;
    this._markdownRendererService = _markdownRendererService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._editorReferences = [];
    this.codeblocks = [];
    this.domNode = this.createOutputContents();
  }
  toMdString(value) {
    if (typeof value === "string") {
      return new MarkdownString("").appendText(value);
    }
    return new MarkdownString(value.value, { isTrusted: value.isTrusted });
  }
  createOutputContents() {
    const container = dom.$("div");
    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];
      if (part.kind === "code") {
        const codeParts = [part];
        while (i + 1 < this.parts.length && this.parts[i + 1].kind === "code") {
          codeParts.push(this.parts[++i]);
        }
        this.addCodeBlock(codeParts, container);
        continue;
      }
      const group = [];
      for (let k = i; k < this.parts.length; k++) {
        const part2 = this.parts[k];
        if (part2.kind !== "data") {
          break;
        }
        group.push(part2);
      }
      this.addResourceGroup(group, container);
      i += group.length - 1;
    }
    return container;
  }
  addResourceGroup(parts, container) {
    const el = dom.h(".chat-collapsible-io-resource-group", [
      dom.h(".chat-collapsible-io-resource-items@items"),
      dom.h(".chat-collapsible-io-resource-actions@actions")
    ]);
    this.fillInResourceGroup(parts, el.items, el.actions);
    container.appendChild(el.root);
    return el.root;
  }
  static {
    this.IMAGE_DECODE_DELAY_MS = 100;
  }
  async fillInResourceGroup(parts, itemsContainer, actionsContainer) {
    const entries = [];
    const deferredImageParts = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.mimeType && getAttachableImageExtension(part.mimeType)) {
        if (part.base64Value) {
          entries.push({ kind: "file", id: generateUuid(), name: basename(part.uri), fullName: part.uri.path, value: part.uri });
          deferredImageParts.push({ index: i, part });
        } else if (part.value) {
          entries.push({ kind: "image", id: generateUuid(), name: basename(part.uri), value: part.value, mimeType: part.mimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] });
        } else {
          const value = await this._fileService.readFile(part.uri).then((f) => f.value.buffer, () => void 0);
          if (!value) {
            entries.push({ kind: "file", id: generateUuid(), name: basename(part.uri), fullName: part.uri.path, value: part.uri });
          } else {
            entries.push({ kind: "image", id: generateUuid(), name: basename(part.uri), value, mimeType: part.mimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] });
          }
        }
      } else {
        entries.push({ kind: "file", id: generateUuid(), name: basename(part.uri), fullName: part.uri.path, value: part.uri });
      }
    }
    if (this._store.isDisposed) {
      return;
    }
    const attachments = this._register(this._instantiationService.createInstance(ChatAttachmentsContentPart, {
      variables: entries,
      limit: 5,
      contentReferences: void 0,
      domNode: void 0
    }));
    attachments.contextMenuHandler = (attachment, event) => {
      const index = entries.indexOf(attachment);
      const part = parts[index];
      if (part) {
        event.preventDefault();
        event.stopPropagation();
        this._contextMenuService.showContextMenu({
          menuId: MenuId.ChatToolOutputResourceContext,
          menuActionOptions: { shouldForwardArgs: true },
          getAnchor: /* @__PURE__ */ __name(() => ({ x: event.pageX, y: event.pageY }), "getAnchor"),
          getActionsContext: /* @__PURE__ */ __name(() => ({ parts: [part] }), "getActionsContext")
        });
      }
    };
    itemsContainer.appendChild(attachments.domNode);
    const toolbar = this._register(this._instantiationService.createInstance(MenuWorkbenchToolBar, actionsContainer, MenuId.ChatToolOutputResourceToolbar, {
      menuOptions: {
        shouldForwardArgs: true
      }
    }));
    toolbar.context = { parts };
    if (deferredImageParts.length > 0) {
      this._register(disposableTimeout(() => {
        for (const { index, part } of deferredImageParts) {
          try {
            const value = decodeBase64(part.base64Value).buffer;
            entries[index] = { kind: "image", id: generateUuid(), name: basename(part.uri), value, mimeType: part.mimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] };
          } catch {
          }
        }
        attachments.updateVariables(entries);
      }, ChatToolOutputContentSubPart_1.IMAGE_DECODE_DELAY_MS));
    }
  }
  addCodeBlock(parts, container) {
    const firstPart = parts[0];
    if (firstPart.title) {
      const title = dom.$("div.chat-confirmation-widget-title");
      const renderedTitle = this._register(this._markdownRendererService.render(this.toMdString(firstPart.title)));
      title.appendChild(renderedTitle.element);
      container.appendChild(title);
    }
    const combinedText = parts.map((p) => p.data).join("\n");
    const textModel = this._register(this.modelService.createModel(combinedText, this.languageService.createById(firstPart.languageId), void 0, true));
    const data = {
      languageId: firstPart.languageId,
      textModel: Promise.resolve(textModel),
      codeBlockIndex: firstPart.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: firstPart.options,
      chatSessionResource: this.context.element.sessionResource
    };
    const editorReference = this._register(this.context.editorPool.get());
    editorReference.object.render(data, this.context.currentWidth.get());
    container.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
    this.codeblocks.push({
      ownerMarkdownPartId: firstPart.ownerMarkdownPartId,
      codeBlockIndex: firstPart.codeBlockIndex,
      elementId: this.context.element.id,
      uri: textModel.uri,
      uriPromise: Promise.resolve(textModel.uri),
      codemapperUri: void 0,
      chatSessionResource: this.context.element.sessionResource,
      focus: /* @__PURE__ */ __name(() => {
      }, "focus")
    });
  }
  layout(width) {
    this._editorReferences.forEach((r) => r.object.layout(width));
  }
};
ChatToolOutputContentSubPart = ChatToolOutputContentSubPart_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, IContextKeyService),
  __param(4, IContextMenuService),
  __param(5, IFileService),
  __param(6, IMarkdownRendererService),
  __param(7, IModelService),
  __param(8, ILanguageService)
], ChatToolOutputContentSubPart);
class SaveResourcesAction extends Action2 {
  static {
    __name(this, "SaveResourcesAction");
  }
  static {
    this.ID = "chat.toolOutput.save";
  }
  constructor() {
    super({
      id: SaveResourcesAction.ID,
      title: localize2("chat.saveResources", "Save As..."),
      icon: Codicon.cloudDownload,
      menu: [{
        id: MenuId.ChatToolOutputResourceToolbar,
        group: "navigation",
        order: 1
      }, {
        id: MenuId.ChatToolOutputResourceContext
      }]
    });
  }
  async run(accessor, context) {
    const fileDialog = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    const progressService = accessor.get(IProgressService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const commandService = accessor.get(ICommandService);
    const labelService = accessor.get(ILabelService);
    const defaultFilepath = await fileDialog.defaultFilePath();
    const savePart = /* @__PURE__ */ __name(async (part, isFolder, uri) => {
      const target = isFolder ? joinPath(uri, basename(part.uri)) : uri;
      try {
        if (part.kind === "data") {
          await fileService.copy(part.uri, target, true);
        } else {
          const contents = await fileService.readFile(part.uri);
          await fileService.writeFile(target, contents.value);
        }
      } catch (e) {
        notificationService.error(localize("chat.saveResources.error", "Failed to save {0}: {1}", basename(part.uri), e));
      }
    }, "savePart");
    const withProgress = /* @__PURE__ */ __name(async (thenReveal, todo) => {
      await progressService.withProgress({
        location: 15,
        delay: 5e3,
        title: localize("chat.saveResources.progress", "Saving resources...")
      }, async (report) => {
        for (const task of todo) {
          await task();
          report.report({ increment: 1, total: todo.length });
        }
      });
      if (workspaceContextService.isInsideWorkspace(thenReveal)) {
        commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, thenReveal);
      } else {
        notificationService.info(localize("chat.saveResources.reveal", "Saved resources to {0}", labelService.getUriLabel(thenReveal)));
      }
    }, "withProgress");
    if (context.parts.length === 1) {
      const part = context.parts[0];
      const uri = await fileDialog.pickFileToSave(joinPath(defaultFilepath, basename(part.uri)));
      if (!uri) {
        return;
      }
      await withProgress(uri, [() => savePart(part, false, uri)]);
    } else {
      const uris = await fileDialog.showOpenDialog({
        title: localize("chat.saveResources.title", "Pick folder to save resources"),
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: workspaceContextService.getWorkspace().folders[0]?.uri
      });
      if (!uris?.length) {
        return;
      }
      await withProgress(uris[0], context.parts.map((part) => () => savePart(part, true, uris[0])));
    }
  }
}
registerAction2(SaveResourcesAction);
export {
  ChatToolOutputContentSubPart
};
//# sourceMappingURL=chatToolOutputContentSubPart.js.map
