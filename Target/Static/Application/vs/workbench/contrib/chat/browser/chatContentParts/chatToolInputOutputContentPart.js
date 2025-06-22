var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { ButtonWithIcon } from "../../../../../base/browser/ui/button/button.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { basename, joinPath } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize, localize2 } from "../../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IFileDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IProgressService } from "../../../../../platform/progress/common/progress.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "../../../files/browser/fileConstants.js";
import { getAttachableImageExtension } from "../../common/chatModel.js";
import { ChatAttachmentsContentPart } from "./chatAttachmentsContentPart.js";
import { ChatQueryTitlePart } from "./chatConfirmationWidget.js";
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
let ChatCollapsibleInputOutputContentPart = class ChatCollapsibleInputOutputContentPart2 extends Disposable {
  static {
    __name(this, "ChatCollapsibleInputOutputContentPart");
  }
  set title(s) {
    this._titlePart.title = s;
  }
  get title() {
    return this._titlePart.title;
  }
  get expanded() {
    return this._expanded.get();
  }
  constructor(title, subtitle, context, editorPool, input, output, isError, initiallyExpanded, width, contextKeyService, _instantiationService, _contextMenuService) {
    super();
    this.context = context;
    this.editorPool = editorPool;
    this.input = input;
    this.output = output;
    this.contextKeyService = contextKeyService;
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._currentWidth = 0;
    this._editorReferences = [];
    this.codeblocks = [];
    this._currentWidth = width;
    const titleEl = dom.h(".chat-confirmation-widget-title-inner");
    const iconEl = dom.h(".chat-confirmation-widget-title-icon");
    const elements = dom.h(".chat-confirmation-widget");
    this.domNode = elements.root;
    const titlePart = this._titlePart = this._register(_instantiationService.createInstance(ChatQueryTitlePart, titleEl.root, title, subtitle, _instantiationService.createInstance(MarkdownRenderer, {})));
    this._register(titlePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    const spacer = document.createElement("span");
    spacer.style.flexGrow = "1";
    const btn = this._register(new ButtonWithIcon(elements.root, {}));
    btn.element.classList.add("chat-confirmation-widget-title", "monaco-text-button");
    btn.labelElement.append(titleEl.root, iconEl.root);
    const check = dom.h(isError ? ThemeIcon.asCSSSelector(Codicon.error) : output ? ThemeIcon.asCSSSelector(Codicon.check) : ThemeIcon.asCSSSelector(ThemeIcon.modify(Codicon.loading, "spin")));
    iconEl.root.appendChild(check.root);
    const expanded = this._expanded = observableValue(this, initiallyExpanded);
    this._register(autorun((r) => {
      const value = expanded.read(r);
      btn.icon = value ? Codicon.chevronDown : Codicon.chevronRight;
      elements.root.classList.toggle("collapsed", !value);
      this._onDidChangeHeight.fire();
    }));
    const toggle = /* @__PURE__ */ __name((e) => {
      if (!e.defaultPrevented) {
        const value = expanded.get();
        expanded.set(!value, void 0);
        e.preventDefault();
      }
    }, "toggle");
    this._register(btn.onDidClick(toggle));
    const message = dom.h(".chat-confirmation-widget-message");
    message.root.appendChild(this.createMessageContents());
    elements.root.appendChild(message.root);
  }
  createMessageContents() {
    const contents = dom.h("div", [
      dom.h("h3@inputTitle"),
      dom.h("div@input"),
      dom.h("h3@outputTitle"),
      dom.h("div@output")
    ]);
    const { input, output } = this;
    contents.inputTitle.textContent = localize("chat.input", "Input");
    this.addCodeBlock(input, contents.input);
    if (!output) {
      contents.output.remove();
      contents.outputTitle.remove();
    } else {
      contents.outputTitle.textContent = localize("chat.output", "Output");
      for (let i = 0; i < output.parts.length; i++) {
        const part = output.parts[i];
        if (part.kind === "code") {
          this.addCodeBlock(part, contents.output);
          continue;
        }
        const group = [];
        for (let k = i; k < output.parts.length; k++) {
          const part2 = output.parts[k];
          if (part2.kind !== "data") {
            break;
          }
          group.push(part2);
        }
        this.addResourceGroup(group, contents.output);
        i += group.length - 1;
      }
    }
    return contents.root;
  }
  addResourceGroup(parts, container) {
    const el = dom.h(".chat-collapsible-io-resource-group", [
      dom.h(".chat-collapsible-io-resource-items@items"),
      dom.h(".chat-collapsible-io-resource-actions@actions")
    ]);
    const entries = parts.map((part) => {
      if (part.mimeType && getAttachableImageExtension(part.mimeType)) {
        return { kind: "image", id: generateUuid(), name: basename(part.uri), value: part.value, mimeType: part.mimeType, isURL: false, references: [{ kind: "reference", reference: part.uri }] };
      } else {
        return { kind: "file", id: generateUuid(), name: basename(part.uri), fullName: part.uri.path, value: part.uri };
      }
    });
    const attachments = this._register(this._instantiationService.createInstance(ChatAttachmentsContentPart, entries, void 0, void 0));
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
    el.items.appendChild(attachments.domNode);
    const toolbar = this._register(this._instantiationService.createInstance(MenuWorkbenchToolBar, el.actions, MenuId.ChatToolOutputResourceToolbar, {
      menuOptions: {
        shouldForwardArgs: true
      }
    }));
    toolbar.context = { parts };
    container.appendChild(el.root);
  }
  addCodeBlock(part, container) {
    const data = {
      languageId: part.languageId,
      textModel: Promise.resolve(part.textModel),
      codeBlockIndex: part.codeBlockInfo.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: part.options,
      chatSessionId: this.context.element.sessionId
    };
    const editorReference = this._register(this.editorPool.get());
    editorReference.object.render(data, this._currentWidth || 300);
    this._register(editorReference.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
    container.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
  layout(width) {
    this._currentWidth = width;
    this._editorReferences.forEach((r) => r.object.layout(width));
  }
};
ChatCollapsibleInputOutputContentPart = __decorate([
  __param(9, IContextKeyService),
  __param(10, IInstantiationService),
  __param(11, IContextMenuService)
], ChatCollapsibleInputOutputContentPart);
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
          await fileService.writeFile(target, VSBuffer.wrap(part.value));
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
  ChatCollapsibleInputOutputContentPart
};
//# sourceMappingURL=chatToolInputOutputContentPart.js.map
