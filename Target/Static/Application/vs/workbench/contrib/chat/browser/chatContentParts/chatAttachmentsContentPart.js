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
import * as dom from "../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { createInstantHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../../base/common/path.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService, RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { fillInSymbolsDragData } from "../../../../../platform/dnd/browser/dnd.js";
import { FileKind, IFileService } from "../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { FolderThemeIcon, IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { ResourceLabels } from "../../../../browser/labels.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { revealInSideBarCommand } from "../../../files/browser/fileActions.contribution.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { isElementVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry } from "../../common/chatModel.js";
import { ChatResponseReferencePartStatusKind } from "../../common/chatService.js";
import { convertUint8ArrayToString } from "../imageUtils.js";
const chatAttachmentResourceContextKey = new RawContextKey("chatAttachmentResource", void 0, { type: "URI", description: localize("resource", "The full value of the chat attachment resource, including scheme and path") });
let ChatAttachmentsContentPart = class ChatAttachmentsContentPart2 extends Disposable {
  static {
    __name(this, "ChatAttachmentsContentPart");
  }
  constructor(variables, contentReferences = [], domNode = dom.$(".chat-attached-context"), contextKeyService, instantiationService, openerService, hoverService, commandService, themeService, labelService, notebookService, editorService) {
    super();
    this.variables = variables;
    this.contentReferences = contentReferences;
    this.domNode = domNode;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.hoverService = hoverService;
    this.commandService = commandService;
    this.themeService = themeService;
    this.labelService = labelService;
    this.notebookService = notebookService;
    this.editorService = editorService;
    this.attachedContextDisposables = this._register(new DisposableStore());
    this._onDidChangeVisibility = this._register(new Emitter());
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this.initAttachedContext(domNode);
    if (!domNode.childElementCount) {
      this.domNode = void 0;
    }
  }
  // TODO@joyceerhl adopt chat attachment widgets
  initAttachedContext(container) {
    dom.clearNode(container);
    this.attachedContextDisposables.clear();
    const hoverDelegate = this.attachedContextDisposables.add(createInstantHoverDelegate());
    this.variables.forEach(async (attachment) => {
      let resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
      let range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
      const widget = dom.append(container, dom.$(".chat-attached-context-attachment.show-file-icons"));
      const label = this._contextResourceLabels.create(widget, { supportIcons: true, hoverDelegate, hoverTargetOverride: widget });
      this.attachedContextDisposables.add(label);
      const correspondingContentReference = this.contentReferences.find((ref) => typeof ref.reference === "object" && "variableName" in ref.reference && ref.reference.variableName === attachment.name || URI.isUri(ref.reference) && basename(ref.reference.path) === attachment.name);
      const isAttachmentOmitted = correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted;
      const isAttachmentPartialOrOmitted = isAttachmentOmitted || correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial;
      let ariaLabel;
      const renderFileAttachment = /* @__PURE__ */ __name((ariaLabel2, friendlyName, resource2, icon) => {
        if (attachment.omittedState === 2) {
          this.customAttachment(widget, friendlyName, hoverDelegate, ariaLabel2, isAttachmentOmitted);
        } else {
          const fileOptions = {
            hidePath: true,
            title: correspondingContentReference?.options?.status?.description
          };
          label.setFile(resource2, attachment.kind === "file" ? {
            ...fileOptions,
            fileKind: FileKind.FILE,
            range
          } : {
            ...fileOptions,
            fileKind: FileKind.FOLDER,
            icon: icon || (!this.themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : void 0)
          });
        }
        this.instantiationService.invokeFunction((accessor) => {
          if (resource2) {
            this.attachedContextDisposables.add(hookUpResourceAttachmentDragAndContextMenu(accessor, widget, resource2));
          }
        });
      }, "renderFileAttachment");
      const renderImageAttachment = /* @__PURE__ */ __name((ariaLabel2, resource2, fullName, buffer) => {
        const isURL = isImageVariableEntry(attachment) && attachment.isURL;
        const hoverElement = this.customAttachment(widget, attachment.name, hoverDelegate, ariaLabel2, isAttachmentOmitted, true, isURL, attachment.value);
        if (resource2) {
          widget.style.cursor = "pointer";
          const clickHandler = /* @__PURE__ */ __name(() => {
            this.openResource(resource2, false, void 0);
          }, "clickHandler");
          this.attachedContextDisposables.add(dom.addDisposableListener(widget, "click", clickHandler));
        }
        const omissionType = attachment.omittedState === 1 ? 1 : isAttachmentOmitted ? 2 : void 0;
        this.createImageElements(buffer, widget, hoverElement, fullName, resource2, omissionType);
        this.attachedContextDisposables.add(this.hoverService.setupDelayedHover(widget, { content: hoverElement, appearance: { showPointer: true } }));
        widget.style.position = "relative";
      }, "renderImageAttachment");
      const renderLabelWithIcon = /* @__PURE__ */ __name((attachment2) => {
        const attachmentLabel = attachment2.fullName ?? attachment2.name;
        const withIcon = attachment2.icon?.id ? `$(${attachment2.icon.id}) ${attachmentLabel}` : attachmentLabel;
        label.setLabel(withIcon, correspondingContentReference?.options?.status?.description);
      }, "renderLabelWithIcon");
      if (resource && isNotebookOutputVariableEntry(attachment)) {
        const friendlyName = attachment.name;
        const output = this.getOutputItem(resource, attachment);
        if (output?.mime.startsWith("image/")) {
          if (attachment.omittedState === 2) {
            ariaLabel = localize("chat.notebookOutputOmittedImageAttachment", "Omitted: {0}", friendlyName);
          } else if (attachment.omittedState === 1) {
            ariaLabel = localize("chat.notebookOutputPartiallyOmittedImageAttachment", "Partially omitted: {0}", friendlyName);
          } else {
            ariaLabel = localize("chat.notebookOutputImageAttachment", "Attached: {0}", friendlyName);
          }
        } else {
          if (isAttachmentOmitted) {
            ariaLabel = localize("chat.notebookOutputOmittedFileAttachment", "Omitted: {0}.", friendlyName);
          } else if (isAttachmentPartialOrOmitted) {
            ariaLabel = localize("chat.notebookOutputPartialFileAttachment", "Partially attached: {0}.", friendlyName);
          } else {
            ariaLabel = localize("chat.notebookOutputFileAttachment3", "Attached: {0}.", friendlyName);
          }
        }
        switch (output?.mime) {
          case "application/vnd.code.notebook.error": {
            renderLabelWithIcon(attachment);
            break;
          }
          case "image/png":
          case "image/jpeg":
          case "image/svg": {
            renderImageAttachment(ariaLabel, resource, attachment.name, output.data.buffer);
            break;
          }
          default: {
            renderFileAttachment(ariaLabel, attachment.name, resource, ThemeIcon.fromId("output"));
          }
        }
        this.instantiationService.invokeFunction((accessor) => {
          if (resource) {
            this.attachedContextDisposables.add(hookUpResourceAttachmentDragAndContextMenu(accessor, widget, resource));
          }
        });
      } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
        const fileBasename = basename(resource.path);
        const fileDirname = dirname(resource.path);
        const friendlyName = `${fileBasename} ${fileDirname}`;
        if (isAttachmentOmitted) {
          ariaLabel = range ? localize("chat.omittedFileAttachmentWithRange", "Omitted: {0}, line {1} to line {2}.", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.omittedFileAttachment", "Omitted: {0}.", friendlyName);
        } else if (isAttachmentPartialOrOmitted) {
          ariaLabel = range ? localize("chat.partialFileAttachmentWithRange", "Partially attached: {0}, line {1} to line {2}.", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.partialFileAttachment", "Partially attached: {0}.", friendlyName);
        } else {
          ariaLabel = range ? localize("chat.fileAttachmentWithRange3", "Attached: {0}, line {1} to line {2}.", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment3", "Attached: {0}.", friendlyName);
        }
        renderFileAttachment(ariaLabel, friendlyName, resource);
      } else if (isImageVariableEntry(attachment)) {
        if (attachment.omittedState === 2) {
          ariaLabel = localize("chat.omittedImageAttachment", "Omitted this image: {0}", attachment.name);
        } else if (attachment.omittedState === 1) {
          ariaLabel = localize("chat.partiallyOmittedImageAttachment", "Partially omitted this image: {0}", attachment.name);
        } else {
          ariaLabel = localize("chat.imageAttachment", "Attached image, {0}", attachment.name);
        }
        const ref = attachment.references?.[0]?.reference;
        const resource2 = ref && URI.isUri(ref) ? ref : void 0;
        renderImageAttachment(ariaLabel, resource2, resource2?.toString() ?? "", attachment.value);
      } else if (isElementVariableEntry(attachment)) {
        ariaLabel = localize("chat.elementAttachment", "Attached element, {0}", attachment.name);
        widget.style.cursor = "pointer";
        const attachmentLabel = attachment.name;
        const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
        label.setLabel(withIcon, void 0, { title: localize("chat.clickToViewContents", "Click to view the contents of: {0}", attachmentLabel) });
        this._register(dom.addDisposableListener(widget, dom.EventType.CLICK, async () => {
          const content = attachment.value?.toString() || "";
          await this.editorService.openEditor({
            resource: void 0,
            contents: content,
            options: {
              pinned: true
            }
          });
        }));
      } else if (isPasteVariableEntry(attachment)) {
        ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
        const classNames = ["file-icon", `${attachment.language}-lang-file-icon`];
        if (attachment.copiedFrom) {
          resource = attachment.copiedFrom.uri;
          range = attachment.copiedFrom.range;
          const filename = basename(resource.path);
          label.setLabel(filename, void 0, { extraClasses: classNames });
        } else {
          label.setLabel(attachment.fileName, void 0, { extraClasses: classNames });
        }
        widget.appendChild(dom.$("span.attachment-additional-info", {}, `Pasted ${attachment.pastedLines}`));
        widget.style.position = "relative";
        const hoverContent = {
          markdown: {
            value: `**${attachment.copiedFrom ? this.labelService.getUriLabel(attachment.copiedFrom.uri, { relative: true }) : attachment.fileName}**

---

\`\`\`${attachment.language}
${attachment.code}
\`\`\``
          },
          markdownNotSupportedFallback: attachment.code
        };
        if (!this.attachedContextDisposables.isDisposed) {
          this.attachedContextDisposables.add(this.hoverService.setupManagedHover(hoverDelegate, widget, hoverContent, { trapFocus: true }));
          const resource2 = attachment.copiedFrom?.uri;
          if (resource2) {
            this.attachedContextDisposables.add(this.instantiationService.invokeFunction((accessor) => hookUpResourceAttachmentDragAndContextMenu(accessor, widget, resource2)));
          }
        }
      } else {
        ariaLabel = localize("chat.attachment3", "Attached context: {0}.", attachment.name);
        renderLabelWithIcon(attachment);
      }
      if (attachment.kind === "symbol") {
        const scopedContextKeyService = this.attachedContextDisposables.add(this.contextKeyService.createScoped(widget));
        this.attachedContextDisposables.add(this.instantiationService.invokeFunction((accessor) => hookUpSymbolAttachmentDragAndContextMenu(accessor, widget, scopedContextKeyService, { ...attachment, kind: attachment.symbolKind }, MenuId.ChatInputSymbolAttachmentContext)));
      }
      if (isAttachmentPartialOrOmitted) {
        widget.classList.add("warning");
      }
      const description = correspondingContentReference?.options?.status?.description;
      if (isAttachmentPartialOrOmitted) {
        ariaLabel = `${ariaLabel}${description ? ` ${description}` : ""}`;
        for (const selector of [".monaco-icon-suffix-container", ".monaco-icon-name-container"]) {
          const element = label.element.querySelector(selector);
          if (element) {
            element.classList.add("warning");
          }
        }
      }
      if (this.attachedContextDisposables.isDisposed) {
        return;
      }
      if (resource) {
        widget.style.cursor = "pointer";
        if (!this.attachedContextDisposables.isDisposed) {
          this.attachedContextDisposables.add(dom.addDisposableListener(widget, dom.EventType.CLICK, async (e) => {
            dom.EventHelper.stop(e, true);
            if (attachment.kind === "directory") {
              this.openResource(resource, true);
            } else {
              this.openResource(resource, false, range);
            }
          }));
        }
      }
      widget.ariaLabel = ariaLabel;
      widget.tabIndex = 0;
    });
  }
  getOutputItem(resource, attachment) {
    const parsedInfo = CellUri.parseCellOutputUri(resource);
    if (!parsedInfo || typeof parsedInfo.cellHandle !== "number" || typeof parsedInfo.outputIndex !== "number") {
      return void 0;
    }
    const notebook = this.notebookService.getNotebookTextModel(parsedInfo.notebook);
    if (!notebook) {
      return void 0;
    }
    const cell = notebook.cells.find((c) => c.handle === parsedInfo.cellHandle);
    if (!cell) {
      return void 0;
    }
    const output = cell.outputs.length > parsedInfo.outputIndex ? cell.outputs[parsedInfo.outputIndex] : void 0;
    return output?.outputs.find((o) => o.mime === attachment.mimeType);
  }
  customAttachment(widget, friendlyName, hoverDelegate, ariaLabel, isAttachmentOmitted, isImage, isURL, value) {
    const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$(isAttachmentOmitted ? "span.codicon.codicon-warning" : "span.codicon.codicon-file-media"));
    const textLabel = dom.$("span.chat-attached-context-custom-text", {}, friendlyName);
    widget.appendChild(pillIcon);
    widget.appendChild(textLabel);
    const hoverElement = dom.$("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    if (isURL && !isAttachmentOmitted && value) {
      hoverElement.textContent = localize("chat.imageAttachmentHover", "{0}", convertUint8ArrayToString(value));
      this.attachedContextDisposables.add(this.hoverService.setupDelayedHover(widget, { content: hoverElement, appearance: { showPointer: true } }));
    }
    if (isAttachmentOmitted) {
      widget.classList.add("warning");
      hoverElement.textContent = localize("chat.fileAttachmentHover", "Selected model does not support this {0} type.", isImage ? "image" : "file");
      this.attachedContextDisposables.add(this.hoverService.setupDelayedHover(widget, { content: hoverElement, appearance: { showPointer: true } }));
    }
    return hoverElement;
  }
  openResource(resource, isDirectory, range) {
    if (isDirectory) {
      this.commandService.executeCommand(revealInSideBarCommand.id, resource);
      return;
    }
    const openTextEditorOptions = range ? { selection: range } : void 0;
    const options = {
      fromUserGesture: true,
      editorOptions: openTextEditorOptions
    };
    this.openerService.open(resource, options);
  }
  // Helper function to create and replace image
  createImageElements(buffer, widget, hoverElement, fullName, reference, omittedState) {
    if (omittedState === 2) {
      return;
    }
    if (omittedState === 1) {
      widget.classList.add("partial-warning");
    }
    const blob = new Blob([buffer], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const pillImg = dom.$("img.chat-attached-context-pill-image", { src: url, alt: "" });
    const pill = dom.$("div.chat-attached-context-pill", {}, pillImg);
    const existingPill = widget.querySelector(".chat-attached-context-pill");
    if (existingPill) {
      existingPill.replaceWith(pill);
    }
    const hoverImage = dom.$("img.chat-attached-context-image", { src: url, alt: "" });
    const imageContainer = dom.$("div.chat-attached-context-image-container", {}, hoverImage);
    hoverElement.appendChild(imageContainer);
    if (reference) {
      const urlContainer = dom.$("a.chat-attached-context-url", {}, omittedState === 1 ? localize("chat.imageAttachmentWarning", "This GIF was partially omitted - current frame was be sent.") : fullName);
      const separator = dom.$("div.chat-attached-context-url-separator");
      this._register(dom.addDisposableListener(urlContainer, "click", () => this.openResource(reference, false, void 0)));
      hoverElement.append(separator, urlContainer);
    }
    hoverImage.onload = () => {
      URL.revokeObjectURL(url);
    };
    hoverImage.onerror = () => {
      const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$("span.codicon.codicon-file-media"));
      const pill2 = dom.$("div.chat-attached-context-pill", {}, pillIcon);
      const existingPill2 = widget.querySelector(".chat-attached-context-pill");
      if (existingPill2) {
        existingPill2.replaceWith(pill2);
      }
    };
  }
};
ChatAttachmentsContentPart = __decorate([
  __param(3, IContextKeyService),
  __param(4, IInstantiationService),
  __param(5, IOpenerService),
  __param(6, IHoverService),
  __param(7, ICommandService),
  __param(8, IThemeService),
  __param(9, ILabelService),
  __param(10, INotebookService),
  __param(11, IEditorService)
], ChatAttachmentsContentPart);
function hookUpResourceAttachmentDragAndContextMenu(accessor, widget, resource) {
  const contextKeyService = accessor.get(IContextKeyService);
  const instantiationService = accessor.get(IInstantiationService);
  const store = new DisposableStore();
  const scopedContextKeyService = store.add(contextKeyService.createScoped(widget));
  store.add(setResourceContext(accessor, scopedContextKeyService, resource));
  widget.draggable = true;
  store.add(dom.addDisposableListener(widget, "dragstart", (e) => {
    instantiationService.invokeFunction((accessor2) => fillEditorsDragData(accessor2, [resource], e));
    e.dataTransfer?.setDragImage(widget, 0, 0);
  }));
  store.add(addBasicContextMenu(accessor, widget, scopedContextKeyService, MenuId.ChatInputResourceAttachmentContext, resource));
  return store;
}
__name(hookUpResourceAttachmentDragAndContextMenu, "hookUpResourceAttachmentDragAndContextMenu");
function hookUpSymbolAttachmentDragAndContextMenu(accessor, widget, scopedContextKeyService, attachment, contextMenuId) {
  const instantiationService = accessor.get(IInstantiationService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const textModelService = accessor.get(ITextModelService);
  const store = new DisposableStore();
  store.add(setResourceContext(accessor, scopedContextKeyService, attachment.value.uri));
  const chatResourceContext = chatAttachmentResourceContextKey.bindTo(scopedContextKeyService);
  chatResourceContext.set(attachment.value.uri.toString());
  widget.draggable = true;
  store.add(dom.addDisposableListener(widget, "dragstart", (e) => {
    instantiationService.invokeFunction((accessor2) => fillEditorsDragData(accessor2, [{ resource: attachment.value.uri, selection: attachment.value.range }], e));
    fillInSymbolsDragData([{
      fsPath: attachment.value.uri.fsPath,
      range: attachment.value.range,
      name: attachment.name,
      kind: attachment.kind
    }], e);
    e.dataTransfer?.setDragImage(widget, 0, 0);
  }));
  const providerContexts = [
    [EditorContextKeys.hasDefinitionProvider.bindTo(scopedContextKeyService), languageFeaturesService.definitionProvider],
    [EditorContextKeys.hasReferenceProvider.bindTo(scopedContextKeyService), languageFeaturesService.referenceProvider],
    [EditorContextKeys.hasImplementationProvider.bindTo(scopedContextKeyService), languageFeaturesService.implementationProvider],
    [EditorContextKeys.hasTypeDefinitionProvider.bindTo(scopedContextKeyService), languageFeaturesService.typeDefinitionProvider]
  ];
  const updateContextKeys = /* @__PURE__ */ __name(async () => {
    const modelRef = await textModelService.createModelReference(attachment.value.uri);
    try {
      const model = modelRef.object.textEditorModel;
      for (const [contextKey, registry] of providerContexts) {
        contextKey.set(registry.has(model));
      }
    } finally {
      modelRef.dispose();
    }
  }, "updateContextKeys");
  store.add(addBasicContextMenu(accessor, widget, scopedContextKeyService, contextMenuId, attachment.value, updateContextKeys));
  return store;
}
__name(hookUpSymbolAttachmentDragAndContextMenu, "hookUpSymbolAttachmentDragAndContextMenu");
function setResourceContext(accessor, scopedContextKeyService, resource) {
  const fileService = accessor.get(IFileService);
  const languageService = accessor.get(ILanguageService);
  const modelService = accessor.get(IModelService);
  const resourceContextKey = new ResourceContextKey(scopedContextKeyService, fileService, languageService, modelService);
  resourceContextKey.set(resource);
  return resourceContextKey;
}
__name(setResourceContext, "setResourceContext");
function addBasicContextMenu(accessor, widget, scopedContextKeyService, menuId, arg, updateContextKeys) {
  const contextMenuService = accessor.get(IContextMenuService);
  const menuService = accessor.get(IMenuService);
  return dom.addDisposableListener(widget, dom.EventType.CONTEXT_MENU, async (domEvent) => {
    const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
    dom.EventHelper.stop(domEvent, true);
    try {
      await updateContextKeys?.();
    } catch (e) {
      console.error(e);
    }
    contextMenuService.showContextMenu({
      contextKeyService: scopedContextKeyService,
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        const menu = menuService.getMenuActions(menuId, scopedContextKeyService, { arg });
        return getFlatContextMenuActions(menu);
      }, "getActions")
    });
  });
}
__name(addBasicContextMenu, "addBasicContextMenu");
export {
  ChatAttachmentsContentPart,
  chatAttachmentResourceContextKey,
  hookUpResourceAttachmentDragAndContextMenu,
  hookUpSymbolAttachmentDragAndContextMenu
};
//# sourceMappingURL=chatAttachmentsContentPart.js.map
