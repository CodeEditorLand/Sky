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
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { isLocation } from "../../../../../editor/common/languages.js";
import { getIconClasses } from "../../../../../editor/common/services/getIconClasses.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { localize } from "../../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { FileKind, IFileService } from "../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { isStringImplicitContextValue } from "../../common/attachments/chatVariableEntries.js";
import { IChatContextService } from "../contextContrib/chatContextService.js";
let ImplicitContextAttachmentWidget = class ImplicitContextAttachmentWidget2 extends Disposable {
  static {
    __name(this, "ImplicitContextAttachmentWidget");
  }
  constructor(widgetRef, isAttachmentAlreadyAttached, attachment, resourceLabels, attachmentModel, domNode, contextKeyService, contextMenuService, labelService, menuService, fileService, languageService, modelService, hoverService, configService, chatContextService) {
    super();
    this.widgetRef = widgetRef;
    this.isAttachmentAlreadyAttached = isAttachmentAlreadyAttached;
    this.attachment = attachment;
    this.resourceLabels = resourceLabels;
    this.attachmentModel = attachmentModel;
    this.domNode = domNode;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.hoverService = hoverService;
    this.configService = configService;
    this.chatContextService = chatContextService;
    this.renderDisposables = this._register(new DisposableStore());
    this.renderedCount = 0;
    this.render();
  }
  render() {
    this.renderDisposables.clear();
    this.renderedCount = 0;
    for (const context of this.attachment.values) {
      const targetUri = context.uri;
      const targetRange = isLocation(context.value) ? context.value.range : void 0;
      const targetHandle = isStringImplicitContextValue(context.value) ? context.value.handle : void 0;
      const currentlyAttached = this.isAttachmentAlreadyAttached(targetUri, targetRange, targetHandle);
      if (!currentlyAttached) {
        this.renderMainContext(context, context.isSelection);
        this.renderedCount++;
      }
    }
  }
  get hasRenderedContexts() {
    return this.renderedCount > 0;
  }
  renderMainContext(context, isSelection) {
    const contextNode = dom.$(".chat-attached-context-attachment.show-file-icons.implicit");
    this.domNode.appendChild(contextNode);
    contextNode.classList.toggle("disabled", !context.enabled);
    const file = context.uri;
    const attachmentTypeName = file?.scheme === Schemas.vscodeNotebookCell ? localize("cell.lowercase", "cell") : localize("file.lowercase", "file");
    const isSuggestedEnabled = this.configService.getValue("chat.implicitContext.suggestedContext");
    if (isSuggestedEnabled) {
      if (!isSelection) {
        const buttonMsg = context.enabled ? localize("disable", "Disable current {0} context", attachmentTypeName) : "";
        const toggleButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: buttonMsg }));
        toggleButton.icon = context.enabled ? Codicon.x : Codicon.plus;
        this.renderDisposables.add(toggleButton.onDidClick(async (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (!context.enabled) {
            await this.convertToRegularAttachment(context);
          }
          context.enabled = false;
        }));
      } else {
        const pinButtonMsg = localize("pinSelection", "Pin selection");
        const pinButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: pinButtonMsg }));
        pinButton.icon = Codicon.pinned;
        this.renderDisposables.add(pinButton.onDidClick(async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await this.pinSelection();
        }));
      }
      if (!context.enabled && isSelection) {
        contextNode.classList.remove("disabled");
      }
      this.renderDisposables.add(dom.addDisposableListener(contextNode, dom.EventType.CLICK, async (e) => {
        if (!context.enabled && !isSelection) {
          await this.convertToRegularAttachment(context);
        }
      }));
      this.renderDisposables.add(dom.addDisposableListener(contextNode, dom.EventType.KEY_DOWN, async (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(
          3
          /* KeyCode.Enter */
        ) || event.equals(
          10
          /* KeyCode.Space */
        )) {
          if (!context.enabled && !isSelection) {
            e.preventDefault();
            e.stopPropagation();
            await this.convertToRegularAttachment(context);
          }
        }
      }));
    } else {
      const buttonMsg = context.enabled ? localize("disable", "Disable current {0} context", attachmentTypeName) : localize("enable", "Enable current {0} context", attachmentTypeName);
      const toggleButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: buttonMsg }));
      toggleButton.icon = context.enabled ? Codicon.eye : Codicon.eyeClosed;
      this.renderDisposables.add(toggleButton.onDidClick((e) => {
        e.stopPropagation();
        context.enabled = !context.enabled;
      }));
    }
    const label = this.resourceLabels.create(contextNode, { supportIcons: true });
    let title;
    let markdownTooltip;
    if (isStringImplicitContextValue(context.value)) {
      markdownTooltip = context.value.tooltip;
      title = this.renderString(label, context.name, context.icon, context.value.resourceUri, markdownTooltip, localize("openFile", "Current file context"));
    } else {
      title = this.renderResource(context.value, context.isSelection, context.enabled, label);
    }
    if (markdownTooltip || title) {
      this.renderDisposables.add(this.hoverService.setupDelayedHover(contextNode, {
        content: markdownTooltip ?? title,
        appearance: { showPointer: true }
      }));
    }
    const scopedContextKeyService = this.renderDisposables.add(this.contextKeyService.createScoped(contextNode));
    const resourceContextKey = this.renderDisposables.add(new ResourceContextKey(scopedContextKeyService, this.fileService, this.languageService, this.modelService));
    resourceContextKey.set(file);
    this.renderDisposables.add(dom.addDisposableListener(contextNode, dom.EventType.CONTEXT_MENU, async (domEvent) => {
      const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
      dom.EventHelper.stop(domEvent, true);
      this.contextMenuService.showContextMenu({
        contextKeyService: scopedContextKeyService,
        getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => {
          const menu = this.menuService.getMenuActions(MenuId.ChatInputResourceAttachmentContext, scopedContextKeyService, { arg: file });
          return getFlatContextMenuActions(menu);
        }, "getActions")
      });
    }));
  }
  renderString(resourceLabel, name, icon, resourceUri, markdownTooltip, defaultTitle) {
    const title = markdownTooltip ? void 0 : defaultTitle;
    if (icon && (ThemeIcon.isFile(icon) || ThemeIcon.isFolder(icon)) && resourceUri) {
      const fileKind = ThemeIcon.isFolder(icon) ? FileKind.FOLDER : FileKind.FILE;
      const iconClasses = getIconClasses(this.modelService, this.languageService, resourceUri, fileKind);
      resourceLabel.setLabel(name, void 0, { extraClasses: iconClasses, title });
    } else {
      resourceLabel.setLabel(name, void 0, { iconPath: icon, title });
    }
    return title;
  }
  renderResource(attachmentValue, isSelection, enabled, label) {
    const file = URI.isUri(attachmentValue) ? attachmentValue : attachmentValue.uri;
    const range = URI.isUri(attachmentValue) || !isSelection ? void 0 : attachmentValue.range;
    const attachmentTypeName = file.scheme === Schemas.vscodeNotebookCell ? localize("cell.lowercase", "cell") : localize("file.lowercase", "file");
    const fileBasename = basename(file);
    const fileDirname = dirname(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached {0}, {1}, line {2} to line {3}", attachmentTypeName, friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached {0}, {1}", attachmentTypeName, friendlyName);
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    const currentFile = localize("openEditor", "Current {0} context", attachmentTypeName);
    const inactive = localize("enableHint", "Enable current {0} context", attachmentTypeName);
    const currentFileHint = enabled || isSelection ? currentFile : inactive;
    const title = `${currentFileHint}
${uriLabel}`;
    label.setFile(file, {
      fileKind: FileKind.FILE,
      hidePath: true,
      range,
      title
    });
    this.domNode.ariaLabel = ariaLabel;
    this.domNode.tabIndex = 0;
    return title;
  }
  async convertToRegularAttachment(attachment) {
    if (!attachment.value) {
      return;
    }
    if (isStringImplicitContextValue(attachment.value)) {
      if (attachment.value.value === void 0) {
        await this.chatContextService.resolveChatContext(attachment.value);
      }
      const context = {
        kind: "string",
        value: attachment.value.value,
        id: attachment.id,
        name: attachment.name,
        icon: attachment.value.icon,
        modelDescription: attachment.modelDescription,
        uri: attachment.value.uri,
        resourceUri: attachment.value.resourceUri,
        tooltip: attachment.value.tooltip,
        commandId: attachment.value.commandId,
        handle: attachment.value.handle
      };
      this.attachmentModel.addContext(context);
    } else {
      const file = URI.isUri(attachment.value) ? attachment.value : attachment.value.uri;
      if (file.scheme === Schemas.vscodeNotebookCell && isLocation(attachment.value)) {
        this.attachmentModel.addFile(file, attachment.value.range);
      } else {
        this.attachmentModel.addFile(file);
      }
    }
    this.widgetRef()?.focusInput();
  }
  async pinSelection() {
    for (const attachment of this.attachment.values) {
      if (!attachment.value || !attachment.isSelection) {
        continue;
      }
      if (!URI.isUri(attachment.value) && !isStringImplicitContextValue(attachment.value)) {
        const location = attachment.value;
        this.attachmentModel.addFile(location.uri, location.range);
      }
    }
    this.widgetRef()?.focusInput();
  }
};
ImplicitContextAttachmentWidget = __decorate([
  __param(6, IContextKeyService),
  __param(7, IContextMenuService),
  __param(8, ILabelService),
  __param(9, IMenuService),
  __param(10, IFileService),
  __param(11, ILanguageService),
  __param(12, IModelService),
  __param(13, IHoverService),
  __param(14, IConfigurationService),
  __param(15, IChatContextService)
], ImplicitContextAttachmentWidget);
export {
  ImplicitContextAttachmentWidget
};
//# sourceMappingURL=implicitContextAttachment.js.map
