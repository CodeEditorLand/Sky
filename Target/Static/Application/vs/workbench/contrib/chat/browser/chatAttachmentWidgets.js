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
import * as dom from "../../../../base/browser/dom.js";
import * as event from "../../../../base/common/event.js";
import { $ } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService, FolderThemeIcon } from "../../../../platform/theme/common/themeService.js";
import { revealInSideBarCommand } from "../../files/browser/fileActions.contribution.js";
import { ILanguageModelsService } from "../common/languageModels.js";
import { hookUpResourceAttachmentDragAndContextMenu, hookUpSymbolAttachmentDragAndContextMenu } from "./chatContentParts/chatAttachmentsContentPart.js";
import { basename, dirname } from "../../../../base/common/path.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
let AbstractChatAttachmentWidget = class AbstractChatAttachmentWidget2 extends Disposable {
  static {
    __name(this, "AbstractChatAttachmentWidget");
  }
  get onDidDelete() {
    return this._onDidDelete.event;
  }
  constructor(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService) {
    super();
    this.attachment = attachment;
    this.shouldFocusClearButton = shouldFocusClearButton;
    this.hoverDelegate = hoverDelegate;
    this.currentLanguageModel = currentLanguageModel;
    this.commandService = commandService;
    this.openerService = openerService;
    this._onDidDelete = this._register(new event.Emitter());
    this.element = dom.append(container, $(".chat-attached-context-attachment.show-file-icons"));
    this.label = contextResourceLabels.create(this.element, { supportIcons: true, hoverDelegate, hoverTargetOverride: this.element });
    this._register(this.label);
    this.element.tabIndex = 0;
  }
  modelSupportsVision() {
    return modelSupportsVision(this.currentLanguageModel);
  }
  attachClearButton() {
    if (this.attachment.range) {
      return;
    }
    const clearButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: this.hoverDelegate,
      title: localize("chat.attachment.clearButton", "Remove from context")
    });
    clearButton.icon = Codicon.close;
    this._register(clearButton);
    this._register(event.Event.once(clearButton.onDidClick)((e) => {
      this._onDidDelete.fire(e);
    }));
    this._register(dom.addStandardDisposableListener(this.element, dom.EventType.KEY_DOWN, (e) => {
      if (e.keyCode === 1 || e.keyCode === 20) {
        this._onDidDelete.fire(e.browserEvent);
      }
    }));
    if (this.shouldFocusClearButton) {
      clearButton.focus();
    }
  }
  addResourceOpenHandlers(resource, range) {
    this.element.style.cursor = "pointer";
    this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      if (this.attachment.kind === "directory") {
        this.openResource(resource, true);
      } else {
        this.openResource(resource, false, range);
      }
    }));
    this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, (e) => {
      const event2 = new StandardKeyboardEvent(e);
      if (event2.equals(
        3
        /* KeyCode.Enter */
      ) || event2.equals(
        10
        /* KeyCode.Space */
      )) {
        dom.EventHelper.stop(e, true);
        if (this.attachment.kind === "directory") {
          this.openResource(resource, true);
        } else {
          this.openResource(resource, false, range);
        }
      }
    }));
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
};
AbstractChatAttachmentWidget = __decorate([
  __param(6, ICommandService),
  __param(7, IOpenerService)
], AbstractChatAttachmentWidget);
function modelSupportsVision(currentLanguageModel) {
  return currentLanguageModel?.metadata.capabilities?.vision ?? false;
}
__name(modelSupportsVision, "modelSupportsVision");
let FileAttachmentWidget = class FileAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "FileAttachmentWidget");
  }
  constructor(resource, range, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, themeService, hoverService, languageModelsService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.instantiationService = instantiationService;
    const fileBasename = basename(resource.path);
    const fileDirname = dirname(resource.path);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    let ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached file, {0}, line {1} to line {2}", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached file, {0}", friendlyName);
    if (attachment.omittedState === 2) {
      ariaLabel = localize("chat.omittedFileAttachment", "Omitted this file: {0}", attachment.name);
      this.renderOmittedWarning(friendlyName, ariaLabel, hoverDelegate);
    } else {
      const fileOptions = { hidePath: true };
      this.label.setFile(resource, attachment.kind === "file" ? {
        ...fileOptions,
        fileKind: FileKind.FILE,
        range
      } : {
        ...fileOptions,
        fileKind: FileKind.FOLDER,
        icon: !this.themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : void 0
      });
    }
    this.element.ariaLabel = ariaLabel;
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
    });
    this.addResourceOpenHandlers(resource, range);
    this.attachClearButton();
  }
  renderOmittedWarning(friendlyName, ariaLabel, hoverDelegate) {
    const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$("span.codicon.codicon-warning"));
    const textLabel = dom.$("span.chat-attached-context-custom-text", {}, friendlyName);
    this.element.appendChild(pillIcon);
    this.element.appendChild(textLabel);
    const hoverElement = dom.$("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    this.element.classList.add("warning");
    hoverElement.textContent = localize("chat.fileAttachmentHover", "{0} does not support this {1} type.", this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name : this.currentLanguageModel, "file");
    this._register(this.hoverService.setupManagedHover(hoverDelegate, this.element, hoverElement, { trapFocus: true }));
  }
};
FileAttachmentWidget = __decorate([
  __param(8, ICommandService),
  __param(9, IOpenerService),
  __param(10, IThemeService),
  __param(11, IHoverService),
  __param(12, ILanguageModelsService),
  __param(13, IInstantiationService)
], FileAttachmentWidget);
let ImageAttachmentWidget = class ImageAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "ImageAttachmentWidget");
  }
  constructor(resource, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, hoverService, languageModelsService, telemetryService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.telemetryService = telemetryService;
    let ariaLabel;
    if (attachment.omittedState === 2) {
      ariaLabel = localize("chat.omittedImageAttachment", "Omitted this image: {0}", attachment.name);
    } else if (attachment.omittedState === 1) {
      ariaLabel = localize("chat.partiallyOmittedImageAttachment", "Partially omitted this image: {0}", attachment.name);
    } else {
      ariaLabel = localize("chat.imageAttachment", "Attached image, {0}", attachment.name);
    }
    const ref = attachment.references?.[0]?.reference;
    resource = ref && URI.isUri(ref) ? ref : void 0;
    const clickHandler = /* @__PURE__ */ __name(() => {
      if (resource) {
        this.openResource(resource, false, void 0);
      }
    }, "clickHandler");
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : "unknown";
    const supportsVision = this.modelSupportsVision();
    this.telemetryService.publicLog2("copilot.attachImage", {
      currentModel: currentLanguageModelName,
      supportsVision
    });
    const fullName = resource?.toString() || attachment.fullName || attachment.name;
    this._register(createImageElements(resource, attachment.name, fullName, this.element, attachment.value, this.hoverService, ariaLabel, currentLanguageModelName, clickHandler, this.currentLanguageModel, attachment.omittedState));
    if (resource) {
      this.addResourceOpenHandlers(resource, void 0);
    }
    this.attachClearButton();
  }
};
ImageAttachmentWidget = __decorate([
  __param(7, ICommandService),
  __param(8, IOpenerService),
  __param(9, IHoverService),
  __param(10, ILanguageModelsService),
  __param(11, ITelemetryService)
], ImageAttachmentWidget);
function createImageElements(resource, name, fullName, element, buffer, hoverService, ariaLabel, currentLanguageModelName, clickHandler, currentLanguageModel, omittedState) {
  const disposable = new DisposableStore();
  if (omittedState === 1) {
    element.classList.add("partial-warning");
  }
  element.ariaLabel = ariaLabel;
  element.style.position = "relative";
  if (resource) {
    element.style.cursor = "pointer";
    disposable.add(dom.addDisposableListener(element, "click", clickHandler));
  }
  const supportsVision = modelSupportsVision(currentLanguageModel);
  const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$(supportsVision ? "span.codicon.codicon-file-media" : "span.codicon.codicon-warning"));
  const textLabel = dom.$("span.chat-attached-context-custom-text", {}, name);
  element.appendChild(pillIcon);
  element.appendChild(textLabel);
  const hoverElement = dom.$("div.chat-attached-context-hover");
  hoverElement.setAttribute("aria-label", ariaLabel);
  if (!supportsVision && currentLanguageModel) {
    element.classList.add("warning");
    hoverElement.textContent = localize("chat.fileAttachmentHover", "{0} does not support this {1} type.", currentLanguageModelName, "image");
    disposable.add(hoverService.setupDelayedHover(element, { content: hoverElement, appearance: { showPointer: true } }));
  } else {
    disposable.add(hoverService.setupDelayedHover(element, { content: hoverElement, appearance: { showPointer: true } }));
    const blob = new Blob([buffer], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const pillImg = dom.$("img.chat-attached-context-pill-image", { src: url, alt: "" });
    const pill = dom.$("div.chat-attached-context-pill", {}, pillImg);
    const existingPill = element.querySelector(".chat-attached-context-pill");
    if (existingPill) {
      existingPill.replaceWith(pill);
    }
    const hoverImage = dom.$("img.chat-attached-context-image", { src: url, alt: "" });
    const imageContainer = dom.$("div.chat-attached-context-image-container", {}, hoverImage);
    hoverElement.appendChild(imageContainer);
    if (resource) {
      const urlContainer = dom.$("a.chat-attached-context-url", {}, omittedState === 1 ? localize("chat.imageAttachmentWarning", "This GIF was partially omitted - current frame will be sent.") : fullName);
      const separator = dom.$("div.chat-attached-context-url-separator");
      disposable.add(dom.addDisposableListener(urlContainer, "click", () => clickHandler()));
      hoverElement.append(separator, urlContainer);
    }
    hoverImage.onload = () => {
      URL.revokeObjectURL(url);
    };
    hoverImage.onerror = () => {
      const pillIcon2 = dom.$("div.chat-attached-context-pill", {}, dom.$("span.codicon.codicon-file-media"));
      const pill2 = dom.$("div.chat-attached-context-pill", {}, pillIcon2);
      const existingPill2 = element.querySelector(".chat-attached-context-pill");
      if (existingPill2) {
        existingPill2.replaceWith(pill2);
      }
    };
  }
  return disposable;
}
__name(createImageElements, "createImageElements");
let PasteAttachmentWidget = class PasteAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "PasteAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, hoverService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    const ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
    this.element.ariaLabel = ariaLabel;
    const classNames = ["file-icon", `${attachment.language}-lang-file-icon`];
    let resource;
    let range;
    if (attachment.copiedFrom) {
      resource = attachment.copiedFrom.uri;
      range = attachment.copiedFrom.range;
      const filename = basename(resource.path);
      this.label.setLabel(filename, void 0, { extraClasses: classNames });
    } else {
      this.label.setLabel(attachment.fileName, void 0, { extraClasses: classNames });
    }
    this.element.appendChild(dom.$("span.attachment-additional-info", {}, `Pasted ${attachment.pastedLines}`));
    this.element.style.position = "relative";
    const sourceUri = attachment.copiedFrom?.uri;
    const hoverContent = {
      markdown: {
        value: `${sourceUri ? this.instantiationService.invokeFunction((accessor) => accessor.get(ILabelService).getUriLabel(sourceUri, { relative: true })) : attachment.fileName}

---

\`\`\`${attachment.language}

${attachment.code}
\`\`\``
      },
      markdownNotSupportedFallback: attachment.code
    };
    this._register(this.hoverService.setupManagedHover(hoverDelegate, this.element, hoverContent, { trapFocus: true }));
    const copiedFromResource = attachment.copiedFrom?.uri;
    if (copiedFromResource) {
      this._register(this.instantiationService.invokeFunction(hookUpResourceAttachmentDragAndContextMenu, this.element, copiedFromResource));
      this.addResourceOpenHandlers(copiedFromResource, range);
    }
    this.attachClearButton();
  }
};
PasteAttachmentWidget = __decorate([
  __param(6, ICommandService),
  __param(7, IOpenerService),
  __param(8, IHoverService),
  __param(9, IInstantiationService)
], PasteAttachmentWidget);
let DefaultChatAttachmentWidget = class DefaultChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "DefaultChatAttachmentWidget");
  }
  constructor(resource, range, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, contextKeyService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    const attachmentLabel = attachment.fullName ?? attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    this.label.setLabel(withIcon, void 0);
    this.element.ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
    if (attachment.kind === "diagnostic") {
      if (attachment.filterUri) {
        resource = attachment.filterUri ? URI.revive(attachment.filterUri) : void 0;
        range = attachment.filterRange;
      } else {
        this.element.style.cursor = "pointer";
        this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, () => {
          this.commandService.executeCommand("workbench.panel.markers.view.focus");
        }));
      }
    }
    if (attachment.kind === "symbol") {
      const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
      this._register(this.instantiationService.invokeFunction(hookUpSymbolAttachmentDragAndContextMenu, this.element, scopedContextKeyService, { ...attachment, kind: attachment.symbolKind }, MenuId.ChatInputSymbolAttachmentContext));
    }
    if (resource) {
      this.addResourceOpenHandlers(resource, range);
    }
    this.attachClearButton();
  }
};
DefaultChatAttachmentWidget = __decorate([
  __param(8, ICommandService),
  __param(9, IOpenerService),
  __param(10, IContextKeyService),
  __param(11, IInstantiationService)
], DefaultChatAttachmentWidget);
let NotebookCellOutputChatAttachmentWidget = class NotebookCellOutputChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "NotebookCellOutputChatAttachmentWidget");
  }
  constructor(resource, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, hoverService, languageModelsService, notebookService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.notebookService = notebookService;
    this.instantiationService = instantiationService;
    switch (attachment.mimeType) {
      case "application/vnd.code.notebook.error": {
        this.renderErrorOutput(resource, attachment);
        break;
      }
      case "image/png":
      case "image/jpeg":
      case "image/svg": {
        this.renderImageOutput(resource, attachment);
        break;
      }
      default: {
        this.renderGenericOutput(resource, attachment);
      }
    }
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
    });
    this.addResourceOpenHandlers(resource, void 0);
    this.attachClearButton();
  }
  getAriaLabel(attachment) {
    return localize("chat.NotebookImageAttachment", "Attached Notebook output, {0}", attachment.name);
  }
  renderErrorOutput(resource, attachment) {
    const attachmentLabel = attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    const buffer = this.getOutputItem(resource, attachment)?.data.buffer ?? new Uint8Array();
    let title = void 0;
    try {
      const error = JSON.parse(new TextDecoder().decode(buffer));
      if (error.name && error.message) {
        title = `${error.name}: ${error.message}`;
      }
    } catch {
    }
    this.label.setLabel(withIcon, void 0, { title });
    this.element.ariaLabel = this.getAriaLabel(attachment);
  }
  renderGenericOutput(resource, attachment) {
    this.element.ariaLabel = this.getAriaLabel(attachment);
    this.label.setFile(resource, { hidePath: true, icon: ThemeIcon.fromId("output") });
  }
  renderImageOutput(resource, attachment) {
    let ariaLabel;
    if (attachment.omittedState === 2) {
      ariaLabel = localize("chat.omittedNotebookImageAttachment", "Omitted this Notebook ouput: {0}", attachment.name);
    } else if (attachment.omittedState === 1) {
      ariaLabel = localize("chat.partiallyOmittedNotebookImageAttachment", "Partially omitted this Notebook output: {0}", attachment.name);
    } else {
      ariaLabel = this.getAriaLabel(attachment);
    }
    const clickHandler = /* @__PURE__ */ __name(() => this.openResource(resource, false, void 0), "clickHandler");
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : "unknown";
    const buffer = this.getOutputItem(resource, attachment)?.data.buffer ?? new Uint8Array();
    this._register(createImageElements(resource, attachment.name, attachment.name, this.element, buffer, this.hoverService, ariaLabel, currentLanguageModelName, clickHandler, this.currentLanguageModel, attachment.omittedState));
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
};
NotebookCellOutputChatAttachmentWidget = __decorate([
  __param(7, ICommandService),
  __param(8, IOpenerService),
  __param(9, IHoverService),
  __param(10, ILanguageModelsService),
  __param(11, INotebookService),
  __param(12, IInstantiationService)
], NotebookCellOutputChatAttachmentWidget);
let ElementChatAttachmentWidget = class ElementChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "ElementChatAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, editorService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    const ariaLabel = localize("chat.elementAttachment", "Attached element, {0}", attachment.name);
    this.element.ariaLabel = ariaLabel;
    this.element.style.position = "relative";
    this.element.style.cursor = "pointer";
    const attachmentLabel = attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    this.label.setLabel(withIcon, void 0, { title: localize("chat.clickToViewContents", "Click to view the contents of: {0}", attachmentLabel) });
    this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, async () => {
      const content = attachment.value?.toString() || "";
      await editorService.openEditor({
        resource: void 0,
        contents: content,
        options: {
          pinned: true
        }
      });
    }));
    this.attachClearButton();
  }
};
ElementChatAttachmentWidget = __decorate([
  __param(6, ICommandService),
  __param(7, IOpenerService),
  __param(8, IEditorService)
], ElementChatAttachmentWidget);
export {
  DefaultChatAttachmentWidget,
  ElementChatAttachmentWidget,
  FileAttachmentWidget,
  ImageAttachmentWidget,
  NotebookCellOutputChatAttachmentWidget,
  PasteAttachmentWidget
};
//# sourceMappingURL=chatAttachmentWidgets.js.map
