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
import { Emitter, Event } from "../../../../base/common/event.js";
import { $ } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IManagedHoverTooltipMarkdownString } from "../../../../base/browser/ui/hover/hover.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IOpenerService, OpenInternalOptions } from "../../../../platform/opener/common/opener.js";
import { IThemeService, FolderThemeIcon } from "../../../../platform/theme/common/themeService.js";
import { IResourceLabel, ResourceLabels, IFileLabelOptions } from "../../../browser/labels.js";
import { revealInSideBarCommand } from "../../files/browser/fileActions.contribution.js";
import { IChatRequestPasteVariableEntry, IChatRequestVariableEntry, OmittedState } from "../common/chatModel.js";
import { ILanguageModelChatMetadataAndIdentifier, ILanguageModelsService } from "../common/languageModels.js";
import { hookUpResourceAttachmentDragAndContextMenu, hookUpSymbolAttachmentDragAndContextMenu } from "./chatContentParts/chatAttachmentsContentPart.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { basename, dirname } from "../../../../base/common/path.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
let AbstractChatAttachmentWidget = class extends Disposable {
  constructor(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService) {
    super();
    this.attachment = attachment;
    this.shouldFocusClearButton = shouldFocusClearButton;
    this.hoverDelegate = hoverDelegate;
    this.currentLanguageModel = currentLanguageModel;
    this.commandService = commandService;
    this.openerService = openerService;
    this.element = dom.append(container, $(".chat-attached-context-attachment.show-file-icons"));
    this.label = contextResourceLabels.create(this.element, { supportIcons: true, hoverDelegate, hoverTargetOverride: this.element });
    this._register(this.label);
    this.element.tabIndex = 0;
  }
  static {
    __name(this, "AbstractChatAttachmentWidget");
  }
  element;
  label;
  _onDidDelete = this._register(new Emitter());
  get onDidDelete() {
    return this._onDidDelete.event;
  }
  modelSupportsVision() {
    return this.currentLanguageModel?.metadata.capabilities?.vision ?? false;
  }
  attachClearButton() {
    const clearButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: this.hoverDelegate,
      title: localize("chat.attachment.clearButton", "Remove from context")
    });
    clearButton.icon = Codicon.close;
    this._register(clearButton);
    this._register(Event.once(clearButton.onDidClick)((e) => {
      this._onDidDelete.fire(e);
    }));
    if (this.shouldFocusClearButton) {
      clearButton.focus();
    }
  }
  addResourceOpenHandlers(resource, range) {
    this.element.style.cursor = "pointer";
    this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      if (this.attachment.isDirectory) {
        this.openResource(resource, true);
      } else {
        this.openResource(resource, false, range);
      }
    }));
    this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
        dom.EventHelper.stop(e, true);
        if (this.attachment.isDirectory) {
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
AbstractChatAttachmentWidget = __decorateClass([
  __decorateParam(6, ICommandService),
  __decorateParam(7, IOpenerService)
], AbstractChatAttachmentWidget);
let FileAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, range, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, themeService, hoverService, languageModelsService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.instantiationService = instantiationService;
    const fileBasename = basename(resource.path);
    const fileDirname = dirname(resource.path);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached file, {0}, line {1} to line {2}", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached file, {0}", friendlyName);
    this.element.ariaLabel = ariaLabel;
    if (attachment.omittedState === OmittedState.Full) {
      this.renderOmittedWarning(friendlyName, ariaLabel, hoverDelegate);
    } else {
      const fileOptions = { hidePath: true };
      this.label.setFile(resource, attachment.isFile ? {
        ...fileOptions,
        fileKind: FileKind.FILE,
        range
      } : {
        ...fileOptions,
        fileKind: FileKind.FOLDER,
        icon: !this.themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : void 0
      });
    }
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
    });
    this.addResourceOpenHandlers(resource, range);
    this.attachClearButton();
  }
  static {
    __name(this, "FileAttachmentWidget");
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
FileAttachmentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, ILanguageModelsService),
  __decorateParam(13, IInstantiationService)
], FileAttachmentWidget);
let ImageAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, hoverService, languageModelsService, telemetryService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.telemetryService = telemetryService;
    let ariaLabel;
    if (attachment.omittedState === OmittedState.Full) {
      ariaLabel = localize("chat.omittedImageAttachment", "Omitted this image: {0}", attachment.name);
    } else if (attachment.omittedState === OmittedState.Partial) {
      ariaLabel = localize("chat.partiallyOmittedImageAttachment", "Partially omitted this image: {0}", attachment.name);
    } else {
      ariaLabel = localize("chat.imageAttachment", "Attached image, {0}", attachment.name);
    }
    this.element.ariaLabel = ariaLabel;
    this.element.style.position = "relative";
    const ref = attachment.references?.[0]?.reference;
    if (ref && URI.isUri(ref)) {
      this.element.style.cursor = "pointer";
      const clickHandler = /* @__PURE__ */ __name(() => {
        this.openResource(ref, false, void 0);
      }, "clickHandler");
      this._register(dom.addDisposableListener(this.element, "click", clickHandler));
    }
    const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$(this.modelSupportsVision() ? "span.codicon.codicon-file-media" : "span.codicon.codicon-warning"));
    const textLabel = dom.$("span.chat-attached-context-custom-text", {}, attachment.name);
    this.element.appendChild(pillIcon);
    this.element.appendChild(textLabel);
    const hoverElement = dom.$("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : "unknown";
    const supportsVision = this.modelSupportsVision();
    this.telemetryService.publicLog2("copilot.attachImage", {
      currentModel: currentLanguageModelName,
      supportsVision
    });
    if (!supportsVision && this.currentLanguageModel) {
      this.element.classList.add("warning");
      hoverElement.textContent = localize("chat.fileAttachmentHover", "{0} does not support this {1} type.", currentLanguageModelName, "image");
      this._register(this.hoverService.setupDelayedHover(this.element, { content: hoverElement, appearance: { showPointer: true } }));
    } else {
      const buffer = attachment.value;
      this.createImageElements(buffer, this.element, hoverElement, URI.isUri(ref) ? ref : void 0, attachment.omittedState);
      this._register(this.hoverService.setupDelayedHover(this.element, { content: hoverElement, appearance: { showPointer: true } }));
    }
    if (resource) {
      this.addResourceOpenHandlers(resource, void 0);
    }
    this.attachClearButton();
  }
  static {
    __name(this, "ImageAttachmentWidget");
  }
  createImageElements(buffer, widget, hoverElement, reference, omittedState) {
    if (omittedState === OmittedState.Partial) {
      this.element.classList.add("partial-warning");
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
      const urlContainer = dom.$("a.chat-attached-context-url", {}, omittedState === OmittedState.Partial ? localize("chat.imageAttachmentWarning", "This GIF was partially omitted - current frame will be sent.") : reference.toString());
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
ImageAttachmentWidget = __decorateClass([
  __decorateParam(7, ICommandService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ILanguageModelsService),
  __decorateParam(11, ITelemetryService)
], ImageAttachmentWidget);
let PasteAttachmentWidget = class extends AbstractChatAttachmentWidget {
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
      this._register(this.instantiationService.invokeFunction((accessor) => hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, copiedFromResource)));
      this.addResourceOpenHandlers(copiedFromResource, range);
    }
    this.attachClearButton();
  }
  static {
    __name(this, "PasteAttachmentWidget");
  }
};
PasteAttachmentWidget = __decorateClass([
  __decorateParam(6, ICommandService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, IInstantiationService)
], PasteAttachmentWidget);
let DefaultChatAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, range, attachment, currentLanguageModel, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, commandService, openerService, contextKeyService, instantiationService) {
    super(attachment, shouldFocusClearButton, container, contextResourceLabels, hoverDelegate, currentLanguageModel, commandService, openerService);
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    const attachmentLabel = attachment.fullName ?? attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id}) ${attachmentLabel}` : attachmentLabel;
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
      this._register(this.instantiationService.invokeFunction((accessor) => hookUpSymbolAttachmentDragAndContextMenu(accessor, this.element, scopedContextKeyService, { ...attachment, kind: attachment.symbolKind }, MenuId.ChatInputSymbolAttachmentContext)));
    }
    if (resource) {
      this.addResourceOpenHandlers(resource, range);
    }
    this.attachClearButton();
  }
  static {
    __name(this, "DefaultChatAttachmentWidget");
  }
};
DefaultChatAttachmentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IInstantiationService)
], DefaultChatAttachmentWidget);
export {
  DefaultChatAttachmentWidget,
  FileAttachmentWidget,
  ImageAttachmentWidget,
  PasteAttachmentWidget
};
//# sourceMappingURL=chatAttachmentWidgets.js.map
