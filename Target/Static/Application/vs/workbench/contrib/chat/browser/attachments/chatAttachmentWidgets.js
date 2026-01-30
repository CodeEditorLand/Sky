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
import { $ } from "../../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { createInstantHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import * as event from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename, dirname } from "../../../../../base/common/path.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
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
import { registerOpenEditorListeners } from "../../../../../platform/editor/browser/editor.js";
import { FileKind, IFileService } from "../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { FolderThemeIcon, IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { IEditorService, SIDE_GROUP } from "../../../../services/editor/common/editorService.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import { revealInSideBarCommand } from "../../../files/browser/fileActions.contribution.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { toHistoryItemHoverContent } from "../../../scm/browser/scmHistory.js";
import { getHistoryItemEditorTitle } from "../../../scm/browser/util.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { PromptFileVariableKind, isStringVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { ILanguageModelsService } from "../../common/languageModels.js";
import { ILanguageModelToolsService, ToolSet } from "../../common/tools/languageModelToolsService.js";
import { getCleanPromptName } from "../../common/promptSyntax/config/promptFileLocations.js";
import { IChatContextService } from "../contextContrib/chatContextService.js";
const commonHoverOptions = {
  style: 1,
  position: {
    hoverPosition: 2
    /* HoverPosition.BELOW */
  },
  trapFocus: true
};
const commonHoverLifecycleOptions = {
  groupId: "chat-attachments"
};
let AbstractChatAttachmentWidget = class AbstractChatAttachmentWidget2 extends Disposable {
  static {
    __name(this, "AbstractChatAttachmentWidget");
  }
  get onDidDelete() {
    return this._onDidDelete.event;
  }
  get onDidOpen() {
    return this._onDidOpen.event;
  }
  constructor(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService, terminalService) {
    super();
    this.attachment = attachment;
    this.options = options;
    this.currentLanguageModel = currentLanguageModel;
    this.commandService = commandService;
    this.openerService = openerService;
    this.terminalService = terminalService;
    this._onDidDelete = this._register(new event.Emitter());
    this._onDidOpen = this._register(new event.Emitter());
    this.element = dom.append(container, $(".chat-attached-context-attachment.show-file-icons"));
    this.attachClearButton();
    this.label = contextResourceLabels.create(this.element, { supportIcons: true, hoverTargetOverride: this.element });
    this._register(this.label);
    this.element.tabIndex = 0;
    this.element.role = "button";
    this._register(dom.addDisposableListener(this.element, dom.EventType.AUXCLICK, (e) => {
      if (e.button === 1 && this.options.supportsDeletion && !this.attachment.range) {
        e.preventDefault();
        e.stopPropagation();
        this._onDidDelete.fire(e);
      }
    }));
  }
  modelSupportsVision() {
    return modelSupportsVision(this.currentLanguageModel);
  }
  attachClearButton() {
    if (this.attachment.range || !this.options.supportsDeletion) {
      return;
    }
    const clearButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: createInstantHoverDelegate(),
      title: localize("chat.attachment.clearButton", "Remove from context")
    });
    clearButton.element.tabIndex = -1;
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
  }
  addResourceOpenHandlers(resource, range) {
    this.element.style.cursor = "pointer";
    this._register(registerOpenEditorListeners(this.element, async (options) => {
      if (this.attachment.kind === "directory") {
        await this.openResource(resource, options, true);
      } else {
        await this.openResource(resource, options, false, range);
      }
    }));
  }
  async openResource(resource, openOptions, isDirectory, range) {
    if (isDirectory) {
      this.commandService.executeCommand(revealInSideBarCommand.id, resource);
      return;
    }
    if (resource.scheme === Schemas.vscodeTerminal) {
      this.terminalService?.openResource(resource);
      return;
    }
    const openTextEditorOptions = range ? { selection: range } : void 0;
    const options = {
      fromUserGesture: true,
      openToSide: openOptions.openToSide,
      editorOptions: {
        ...openTextEditorOptions,
        ...openOptions.editorOptions
      }
    };
    await this.openerService.open(resource, options);
    this._onDidOpen.fire();
    this.element.focus();
  }
};
AbstractChatAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, ITerminalService)
], AbstractChatAttachmentWidget);
function modelSupportsVision(currentLanguageModel) {
  return currentLanguageModel?.metadata.capabilities?.vision ?? false;
}
__name(modelSupportsVision, "modelSupportsVision");
let FileAttachmentWidget = class FileAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "FileAttachmentWidget");
  }
  constructor(resource, range, attachment, correspondingContentReference, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, themeService, hoverService, languageModelsService, instantiationService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
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
      this.renderOmittedWarning(friendlyName, ariaLabel);
    } else {
      const fileOptions = { hidePath: true, title: correspondingContentReference?.options?.status?.description };
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
  }
  renderOmittedWarning(friendlyName, ariaLabel) {
    const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$("span.codicon.codicon-warning"));
    const textLabel = dom.$("span.chat-attached-context-custom-text", {}, friendlyName);
    this.element.appendChild(pillIcon);
    this.element.appendChild(textLabel);
    const hoverElement = dom.$("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    this.element.classList.add("warning");
    hoverElement.textContent = localize("chat.fileAttachmentHover", "{0} does not support this file type.", this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name : this.currentLanguageModel ?? "This model");
    this._register(this.hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: hoverElement
    }, commonHoverLifecycleOptions));
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
let TerminalCommandAttachmentWidget = class TerminalCommandAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "TerminalCommandAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, hoverService, terminalService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService, terminalService);
    this.hoverService = hoverService;
    this.terminalService = terminalService;
    const ariaLabel = localize("chat.terminalCommand", "Terminal command, {0}", attachment.command);
    const clickHandler = /* @__PURE__ */ __name(() => this.openResource(attachment.resource, { editorOptions: { preserveFocus: true } }, false, void 0), "clickHandler");
    this._register(createTerminalCommandElements(this.element, attachment, ariaLabel, this.hoverService, clickHandler));
    this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, async (e) => {
      const event2 = new StandardKeyboardEvent(e);
      if (event2.equals(
        3
        /* KeyCode.Enter */
      ) || event2.equals(
        10
        /* KeyCode.Space */
      )) {
        dom.EventHelper.stop(e, true);
        await clickHandler();
      }
    }));
  }
};
TerminalCommandAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, IHoverService),
  __param(8, ITerminalService)
], TerminalCommandAttachmentWidget);
var TerminalConstants;
(function(TerminalConstants2) {
  TerminalConstants2[TerminalConstants2["MaxAttachmentOutputLineCount"] = 5] = "MaxAttachmentOutputLineCount";
  TerminalConstants2[TerminalConstants2["MaxAttachmentOutputLineLength"] = 80] = "MaxAttachmentOutputLineLength";
})(TerminalConstants || (TerminalConstants = {}));
function createTerminalCommandElements(element, attachment, ariaLabel, hoverService, clickHandler) {
  const disposable = new DisposableStore();
  element.ariaLabel = ariaLabel;
  element.style.cursor = "pointer";
  const terminalIconSpan = dom.$("span");
  terminalIconSpan.classList.add(...ThemeIcon.asClassNameArray(Codicon.terminal));
  const pillIcon = dom.$("div.chat-attached-context-pill", {}, terminalIconSpan);
  const textLabel = dom.$("span.chat-attached-context-custom-text", {}, attachment.command);
  element.appendChild(pillIcon);
  element.appendChild(textLabel);
  disposable.add(dom.addDisposableListener(element, dom.EventType.CLICK, (e) => {
    e.preventDefault();
    e.stopPropagation();
    clickHandler();
  }));
  disposable.add(hoverService.setupDelayedHover(element, () => getHoverContent(ariaLabel, attachment), commonHoverLifecycleOptions));
  return disposable;
}
__name(createTerminalCommandElements, "createTerminalCommandElements");
function getHoverContent(ariaLabel, attachment) {
  {
    const hoverElement = dom.$("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    const commandTitle = dom.$("div", {}, typeof attachment.exitCode === "number" ? localize("chat.terminalCommandHoverCommandTitleExit", "Command: {0}, exit code: {1}", attachment.command, attachment.exitCode) : localize("chat.terminalCommandHoverCommandTitle", "Command"));
    commandTitle.classList.add("attachment-additional-info");
    const commandBlock = dom.$("pre.chat-terminal-command-block");
    hoverElement.append(commandTitle, commandBlock);
    if (attachment.output && attachment.output.trim().length > 0) {
      const outputTitle = dom.$("div", {}, localize("chat.terminalCommandHoverOutputTitle", "Output:"));
      outputTitle.classList.add("attachment-additional-info");
      const outputBlock = dom.$("pre.chat-terminal-command-output");
      const fullOutputLines = attachment.output.split("\n");
      const hoverOutputLines = [];
      for (const line of fullOutputLines) {
        if (hoverOutputLines.length >= 5) {
          hoverOutputLines.push("...");
          break;
        }
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          continue;
        }
        if (trimmed.length > 80) {
          hoverOutputLines.push(`${trimmed.slice(
            0,
            80
            /* TerminalConstants.MaxAttachmentOutputLineLength */
          )}...`);
        } else {
          hoverOutputLines.push(trimmed);
        }
      }
      outputBlock.textContent = hoverOutputLines.join("\n");
      hoverElement.append(outputTitle, outputBlock);
    }
    return {
      ...commonHoverOptions,
      content: hoverElement
    };
  }
}
__name(getHoverContent, "getHoverContent");
let ImageAttachmentWidget = class ImageAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "ImageAttachmentWidget");
  }
  constructor(resource, attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, hoverService, languageModelsService, instantiationService, labelService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.labelService = labelService;
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
    const clickHandler = /* @__PURE__ */ __name(async () => {
      if (resource) {
        await this.openResource(resource, { editorOptions: { preserveFocus: true } }, false, void 0);
      }
    }, "clickHandler");
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : "Current model";
    const fullName = resource ? this.labelService.getUriLabel(resource) : attachment.fullName || attachment.name;
    this._register(createImageElements(resource, attachment.name, fullName, this.element, attachment.value, this.hoverService, ariaLabel, currentLanguageModelName, clickHandler, this.currentLanguageModel, attachment.omittedState));
    if (resource) {
      this.addResourceOpenHandlers(resource, void 0);
      instantiationService.invokeFunction((accessor) => {
        this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
      });
    }
  }
};
ImageAttachmentWidget = __decorate([
  __param(6, ICommandService),
  __param(7, IOpenerService),
  __param(8, IHoverService),
  __param(9, ILanguageModelsService),
  __param(10, IInstantiationService),
  __param(11, ILabelService)
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
  if (!supportsVision && currentLanguageModel || omittedState === 2) {
    element.classList.add("warning");
    hoverElement.textContent = localize("chat.imageAttachmentHover", "{0} does not support images.", currentLanguageModelName ?? "This model");
    disposable.add(hoverService.setupDelayedHover(element, {
      content: hoverElement,
      style: 1
    }));
  } else {
    disposable.add(hoverService.setupDelayedHover(element, {
      content: hoverElement,
      style: 1
    }));
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
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, hoverService, instantiationService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
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
    const hoverContent = new MarkdownString(`${sourceUri ? this.instantiationService.invokeFunction((accessor) => accessor.get(ILabelService).getUriLabel(sourceUri, { relative: true })) : attachment.fileName}

---

\`\`\`${attachment.language}

${attachment.code}
\`\`\``);
    this._register(this.hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: hoverContent
    }, commonHoverLifecycleOptions));
    const copiedFromResource = attachment.copiedFrom?.uri;
    if (copiedFromResource) {
      this._register(this.instantiationService.invokeFunction(hookUpResourceAttachmentDragAndContextMenu, this.element, copiedFromResource));
      this.addResourceOpenHandlers(copiedFromResource, range);
    }
  }
};
PasteAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, IHoverService),
  __param(8, IInstantiationService)
], PasteAttachmentWidget);
let DefaultChatAttachmentWidget = class DefaultChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "DefaultChatAttachmentWidget");
  }
  constructor(resource, range, attachment, correspondingContentReference, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, contextKeyService, instantiationService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    const attachmentLabel = attachment.fullName ?? attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    this.label.setLabel(withIcon, correspondingContentReference?.options?.status?.description);
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
    if (isStringVariableEntry(attachment) && attachment.commandId) {
      this.element.style.cursor = "pointer";
      const contextItemHandle = attachment.handle;
      this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, async () => {
        const chatContextService = this.instantiationService.invokeFunction((accessor) => accessor.get(IChatContextService));
        await chatContextService.executeChatContextItemCommand(contextItemHandle);
      }));
    }
    if (resource) {
      this.addResourceOpenHandlers(resource, range);
    }
  }
};
DefaultChatAttachmentWidget = __decorate([
  __param(8, ICommandService),
  __param(9, IOpenerService),
  __param(10, IContextKeyService),
  __param(11, IInstantiationService)
], DefaultChatAttachmentWidget);
let PromptFileAttachmentWidget = class PromptFileAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "PromptFileAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, labelService, instantiationService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.hintElement = dom.append(this.element, dom.$("span.prompt-type"));
    this.updateLabel(attachment);
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, attachment.value));
    });
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  updateLabel(attachment) {
    const resource = attachment.value;
    const fileBasename = basename(resource.path);
    const fileDirname = dirname(resource.path);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const isPrompt = attachment.id.startsWith(PromptFileVariableKind.PromptFile);
    const ariaLabel = isPrompt ? localize("chat.promptAttachment", "Prompt file, {0}", friendlyName) : localize("chat.instructionsAttachment", "Instructions attachment, {0}", friendlyName);
    const typeLabel = isPrompt ? localize("prompt", "Prompt") : localize("instructions", "Instructions");
    const title = this.labelService.getUriLabel(resource) + (attachment.originLabel ? `
${attachment.originLabel}` : "");
    this.element.classList.remove("warning", "error");
    const fileWithoutExtension = getCleanPromptName(resource);
    this.label.setFile(URI.file(fileWithoutExtension), {
      fileKind: FileKind.FILE,
      hidePath: true,
      range: void 0,
      title,
      icon: ThemeIcon.fromId(Codicon.bookmark.id),
      extraClasses: []
    });
    this.hintElement.innerText = typeLabel;
    this.element.ariaLabel = ariaLabel;
  }
};
PromptFileAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, ILabelService),
  __param(8, IInstantiationService)
], PromptFileAttachmentWidget);
let PromptTextAttachmentWidget = class PromptTextAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "PromptTextAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, preferencesService, hoverService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    if (attachment.settingId) {
      const openSettings = /* @__PURE__ */ __name(() => preferencesService.openSettings({ jsonEditor: false, query: `@id:${attachment.settingId}` }), "openSettings");
      this.element.style.cursor = "pointer";
      this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, async (e) => {
        dom.EventHelper.stop(e, true);
        openSettings();
      }));
      this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, async (e) => {
        const event2 = new StandardKeyboardEvent(e);
        if (event2.equals(
          3
          /* KeyCode.Enter */
        ) || event2.equals(
          10
          /* KeyCode.Space */
        )) {
          dom.EventHelper.stop(e, true);
          openSettings();
        }
      }));
    }
    this.label.setLabel(localize("instructions.label", "Additional Instructions"), void 0, void 0);
    this._register(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: attachment.value
    }, commonHoverLifecycleOptions));
  }
};
PromptTextAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, IPreferencesService),
  __param(8, IHoverService)
], PromptTextAttachmentWidget);
let ToolSetOrToolItemAttachmentWidget = class ToolSetOrToolItemAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "ToolSetOrToolItemAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, toolsService, commandService, openerService, hoverService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    const toolOrToolSet = Iterable.find(toolsService.getTools(), (tool) => tool.id === attachment.id) ?? Iterable.find(toolsService.toolSets.get(), (toolSet) => toolSet.id === attachment.id);
    let name = attachment.name;
    const icon = attachment.icon ?? Codicon.tools;
    if (toolOrToolSet instanceof ToolSet) {
      name = toolOrToolSet.referenceName;
    } else if (toolOrToolSet) {
      name = toolOrToolSet.toolReferenceName ?? name;
    }
    this.label.setLabel(`$(${icon.id})\xA0${name}`, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = localize("chat.attachment", "Attached context, {0}", name);
    let hoverContent;
    if (toolOrToolSet instanceof ToolSet) {
      hoverContent = localize("toolset", "{0} - {1}", toolOrToolSet.description ?? toolOrToolSet.referenceName, toolOrToolSet.source.label);
    } else if (toolOrToolSet) {
      hoverContent = localize("tool", "{0} - {1}", toolOrToolSet.userDescription ?? toolOrToolSet.modelDescription, toolOrToolSet.source.label);
    }
    if (hoverContent) {
      this._register(hoverService.setupDelayedHover(this.element, {
        ...commonHoverOptions,
        content: hoverContent
      }, commonHoverLifecycleOptions));
    }
  }
};
ToolSetOrToolItemAttachmentWidget = __decorate([
  __param(5, ILanguageModelToolsService),
  __param(6, ICommandService),
  __param(7, IOpenerService),
  __param(8, IHoverService)
], ToolSetOrToolItemAttachmentWidget);
let NotebookCellOutputChatAttachmentWidget = class NotebookCellOutputChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "NotebookCellOutputChatAttachmentWidget");
  }
  constructor(resource, attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, hoverService, languageModelsService, notebookService, instantiationService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
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
    const clickHandler = /* @__PURE__ */ __name(async () => await this.openResource(resource, { editorOptions: { preserveFocus: true } }, false, void 0), "clickHandler");
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : void 0;
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
  __param(6, ICommandService),
  __param(7, IOpenerService),
  __param(8, IHoverService),
  __param(9, ILanguageModelsService),
  __param(10, INotebookService),
  __param(11, IInstantiationService)
], NotebookCellOutputChatAttachmentWidget);
let ElementChatAttachmentWidget = class ElementChatAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "ElementChatAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, editorService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
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
  }
};
ElementChatAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, IEditorService)
], ElementChatAttachmentWidget);
let SCMHistoryItemAttachmentWidget = class SCMHistoryItemAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "SCMHistoryItemAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, markdownRendererService, hoverService, openerService, themeService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.label.setLabel(attachment.name, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
    const { content, disposables } = toHistoryItemHoverContent(markdownRendererService, attachment.historyItem, false);
    this._store.add(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content
    }, commonHoverLifecycleOptions));
    this._store.add(disposables);
    this._store.add(dom.addDisposableListener(this.element, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      this._openAttachment(attachment);
    }));
    this._store.add(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, (e) => {
      const event2 = new StandardKeyboardEvent(e);
      if (event2.equals(
        3
        /* KeyCode.Enter */
      ) || event2.equals(
        10
        /* KeyCode.Space */
      )) {
        dom.EventHelper.stop(e, true);
        this._openAttachment(attachment);
      }
    }));
  }
  async _openAttachment(attachment) {
    await this.commandService.executeCommand("_workbench.openMultiDiffEditor", {
      title: getHistoryItemEditorTitle(attachment.historyItem),
      multiDiffSourceUri: attachment.value
    });
  }
};
SCMHistoryItemAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IMarkdownRendererService),
  __param(7, IHoverService),
  __param(8, IOpenerService),
  __param(9, IThemeService)
], SCMHistoryItemAttachmentWidget);
let SCMHistoryItemChangeAttachmentWidget = class SCMHistoryItemChangeAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "SCMHistoryItemChangeAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, hoverService, markdownRendererService, openerService, themeService, editorService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.editorService = editorService;
    const nameSuffix = `\xA0$(${Codicon.gitCommit.id})${attachment.historyItem.displayId ?? attachment.historyItem.id}`;
    this.label.setFile(attachment.value, { fileKind: FileKind.FILE, hidePath: true, nameSuffix });
    this.element.ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
    const { content, disposables } = toHistoryItemHoverContent(markdownRendererService, attachment.historyItem, false);
    this._store.add(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content
    }, commonHoverLifecycleOptions));
    this._store.add(disposables);
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  async openResource(resource, options, isDirectory, range) {
    const attachment = this.attachment;
    const historyItem = attachment.historyItem;
    await this.editorService.openEditor({
      resource,
      label: `${basename(resource.path)} (${historyItem.displayId ?? historyItem.id})`,
      options: { ...options.editorOptions }
    }, options.openToSide ? SIDE_GROUP : void 0);
  }
};
SCMHistoryItemChangeAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IHoverService),
  __param(7, IMarkdownRendererService),
  __param(8, IOpenerService),
  __param(9, IThemeService),
  __param(10, IEditorService)
], SCMHistoryItemChangeAttachmentWidget);
let SCMHistoryItemChangeRangeAttachmentWidget = class SCMHistoryItemChangeRangeAttachmentWidget2 extends AbstractChatAttachmentWidget {
  static {
    __name(this, "SCMHistoryItemChangeRangeAttachmentWidget");
  }
  constructor(attachment, currentLanguageModel, options, container, contextResourceLabels, commandService, openerService, editorService) {
    super(attachment, options, container, contextResourceLabels, currentLanguageModel, commandService, openerService);
    this.editorService = editorService;
    const historyItemStartId = attachment.historyItemChangeStart.historyItem.displayId ?? attachment.historyItemChangeStart.historyItem.id;
    const historyItemEndId = attachment.historyItemChangeEnd.historyItem.displayId ?? attachment.historyItemChangeEnd.historyItem.id;
    const nameSuffix = `\xA0$(${Codicon.gitCommit.id})${historyItemStartId}..${historyItemEndId}`;
    this.label.setFile(attachment.value, { fileKind: FileKind.FILE, hidePath: true, nameSuffix });
    this.element.ariaLabel = localize("chat.attachment", "Attached context, {0}", attachment.name);
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  async openResource(resource, options, isDirectory, range) {
    const attachment = this.attachment;
    const historyItemChangeStart = attachment.historyItemChangeStart;
    const historyItemChangeEnd = attachment.historyItemChangeEnd;
    const originalUriTitle = `${basename(historyItemChangeStart.uri.fsPath)} (${historyItemChangeStart.historyItem.displayId ?? historyItemChangeStart.historyItem.id})`;
    const modifiedUriTitle = `${basename(historyItemChangeEnd.uri.fsPath)} (${historyItemChangeEnd.historyItem.displayId ?? historyItemChangeEnd.historyItem.id})`;
    await this.editorService.openEditor({
      original: { resource: historyItemChangeStart.uri },
      modified: { resource: historyItemChangeEnd.uri },
      label: `${originalUriTitle} \u2194 ${modifiedUriTitle}`,
      options: { ...options.editorOptions }
    }, options.openToSide ? SIDE_GROUP : void 0);
  }
};
SCMHistoryItemChangeRangeAttachmentWidget = __decorate([
  __param(5, ICommandService),
  __param(6, IOpenerService),
  __param(7, IEditorService)
], SCMHistoryItemChangeRangeAttachmentWidget);
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
    const event2 = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
    dom.EventHelper.stop(domEvent, true);
    try {
      await updateContextKeys?.();
    } catch (e) {
      console.error(e);
    }
    contextMenuService.showContextMenu({
      contextKeyService: scopedContextKeyService,
      getAnchor: /* @__PURE__ */ __name(() => event2, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        const menu = menuService.getMenuActions(menuId, scopedContextKeyService, { arg });
        return getFlatContextMenuActions(menu);
      }, "getActions")
    });
  });
}
__name(addBasicContextMenu, "addBasicContextMenu");
const chatAttachmentResourceContextKey = new RawContextKey("chatAttachmentResource", void 0, { type: "URI", description: localize("resource", "The full value of the chat attachment resource, including scheme and path") });
export {
  DefaultChatAttachmentWidget,
  ElementChatAttachmentWidget,
  FileAttachmentWidget,
  ImageAttachmentWidget,
  NotebookCellOutputChatAttachmentWidget,
  PasteAttachmentWidget,
  PromptFileAttachmentWidget,
  PromptTextAttachmentWidget,
  SCMHistoryItemAttachmentWidget,
  SCMHistoryItemChangeAttachmentWidget,
  SCMHistoryItemChangeRangeAttachmentWidget,
  TerminalCommandAttachmentWidget,
  ToolSetOrToolItemAttachmentWidget,
  chatAttachmentResourceContextKey,
  hookUpResourceAttachmentDragAndContextMenu,
  hookUpSymbolAttachmentDragAndContextMenu
};
//# sourceMappingURL=chatAttachmentWidgets.js.map
