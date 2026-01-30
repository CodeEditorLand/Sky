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
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { isLocation } from "../../../../../editor/common/languages.js";
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
  constructor(widgetRef, attachment, resourceLabels, attachmentModel, contextKeyService, contextMenuService, labelService, menuService, fileService, languageService, modelService, hoverService, configService, chatContextService) {
    super();
    this.widgetRef = widgetRef;
    this.attachment = attachment;
    this.resourceLabels = resourceLabels;
    this.attachmentModel = attachmentModel;
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
    this.domNode = dom.$(".chat-attached-context-attachment.show-file-icons.implicit");
    this.render();
  }
  render() {
    dom.clearNode(this.domNode);
    this.renderDisposables.clear();
    this.domNode.classList.toggle("disabled", !this.attachment.enabled);
    const file = this.attachment.uri;
    const attachmentTypeName = file?.scheme === Schemas.vscodeNotebookCell ? localize("cell.lowercase", "cell") : localize("file.lowercase", "file");
    const isSuggestedEnabled = this.configService.getValue("chat.implicitContext.suggestedContext");
    if (isSuggestedEnabled) {
      if (!this.attachment.isSelection) {
        const buttonMsg = this.attachment.enabled ? localize("disable", "Disable current {0} context", attachmentTypeName) : "";
        const toggleButton = this.renderDisposables.add(new Button(this.domNode, { supportIcons: true, title: buttonMsg }));
        toggleButton.icon = this.attachment.enabled ? Codicon.x : Codicon.plus;
        this.renderDisposables.add(toggleButton.onDidClick(async (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (!this.attachment.enabled) {
            await this.convertToRegularAttachment();
          }
          this.attachment.enabled = false;
        }));
      } else {
        const pinButtonMsg = localize("pinSelection", "Pin selection");
        const pinButton = this.renderDisposables.add(new Button(this.domNode, { supportIcons: true, title: pinButtonMsg }));
        pinButton.icon = Codicon.pinned;
        this.renderDisposables.add(pinButton.onDidClick(async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await this.pinSelection();
        }));
      }
      if (!this.attachment.enabled && this.attachment.isSelection) {
        this.domNode.classList.remove("disabled");
      }
      this.renderDisposables.add(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, async (e) => {
        if (!this.attachment.enabled && !this.attachment.isSelection) {
          await this.convertToRegularAttachment();
        }
      }));
      this.renderDisposables.add(dom.addDisposableListener(this.domNode, dom.EventType.KEY_DOWN, async (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(
          3
          /* KeyCode.Enter */
        ) || event.equals(
          10
          /* KeyCode.Space */
        )) {
          if (!this.attachment.enabled && !this.attachment.isSelection) {
            e.preventDefault();
            e.stopPropagation();
            await this.convertToRegularAttachment();
          }
        }
      }));
    } else {
      const buttonMsg = this.attachment.enabled ? localize("disable", "Disable current {0} context", attachmentTypeName) : localize("enable", "Enable current {0} context", attachmentTypeName);
      const toggleButton = this.renderDisposables.add(new Button(this.domNode, { supportIcons: true, title: buttonMsg }));
      toggleButton.icon = this.attachment.enabled ? Codicon.eye : Codicon.eyeClosed;
      this.renderDisposables.add(toggleButton.onDidClick((e) => {
        e.stopPropagation();
        this.attachment.enabled = !this.attachment.enabled;
      }));
    }
    const label = this.resourceLabels.create(this.domNode, { supportIcons: true });
    let title;
    if (isStringImplicitContextValue(this.attachment.value)) {
      title = this.renderString(label);
    } else {
      title = this.renderResource(this.attachment.value, label);
    }
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.domNode, title));
    const scopedContextKeyService = this.renderDisposables.add(this.contextKeyService.createScoped(this.domNode));
    const resourceContextKey = this.renderDisposables.add(new ResourceContextKey(scopedContextKeyService, this.fileService, this.languageService, this.modelService));
    resourceContextKey.set(file);
    this.renderDisposables.add(dom.addDisposableListener(this.domNode, dom.EventType.CONTEXT_MENU, async (domEvent) => {
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
  renderString(resourceLabel) {
    const label = this.attachment.name;
    const icon = this.attachment.icon;
    const title = localize("openFile", "Current file context");
    resourceLabel.setLabel(label, void 0, { iconPath: icon, title });
    return title;
  }
  renderResource(attachmentValue, label) {
    const file = URI.isUri(attachmentValue) ? attachmentValue : attachmentValue.uri;
    const range = URI.isUri(attachmentValue) || !this.attachment.isSelection ? void 0 : attachmentValue.range;
    const attachmentTypeName = file.scheme === Schemas.vscodeNotebookCell ? localize("cell.lowercase", "cell") : localize("file.lowercase", "file");
    const fileBasename = basename(file);
    const fileDirname = dirname(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached {0}, {1}, line {2} to line {3}", attachmentTypeName, friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached {0}, {1}", attachmentTypeName, friendlyName);
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    const currentFile = localize("openEditor", "Current {0} context", attachmentTypeName);
    const inactive = localize("enableHint", "Enable current {0} context", attachmentTypeName);
    const currentFileHint = this.attachment.enabled || this.attachment.isSelection ? currentFile : inactive;
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
  async convertToRegularAttachment() {
    if (!this.attachment.value) {
      return;
    }
    if (isStringImplicitContextValue(this.attachment.value)) {
      if (this.attachment.value.value === void 0) {
        await this.chatContextService.resolveChatContext(this.attachment.value);
      }
      const context = {
        kind: "string",
        value: this.attachment.value.value,
        id: this.attachment.id,
        name: this.attachment.name,
        icon: this.attachment.value.icon,
        modelDescription: this.attachment.value.modelDescription,
        uri: this.attachment.value.uri,
        commandId: this.attachment.value.commandId,
        handle: this.attachment.value.handle
      };
      this.attachmentModel.addContext(context);
    } else {
      const file = URI.isUri(this.attachment.value) ? this.attachment.value : this.attachment.value.uri;
      if (file.scheme === Schemas.vscodeNotebookCell && isLocation(this.attachment.value)) {
        this.attachmentModel.addFile(file, this.attachment.value.range);
      } else {
        this.attachmentModel.addFile(file);
      }
    }
    this.widgetRef()?.focusInput();
  }
  async pinSelection() {
    if (!this.attachment.value || !this.attachment.isSelection) {
      return;
    }
    if (!URI.isUri(this.attachment.value) && !isStringImplicitContextValue(this.attachment.value)) {
      const location = this.attachment.value;
      this.attachmentModel.addFile(location.uri, location.range);
    }
    this.widgetRef()?.focusInput();
  }
};
ImplicitContextAttachmentWidget = __decorate([
  __param(4, IContextKeyService),
  __param(5, IContextMenuService),
  __param(6, ILabelService),
  __param(7, IMenuService),
  __param(8, IFileService),
  __param(9, ILanguageService),
  __param(10, IModelService),
  __param(11, IHoverService),
  __param(12, IConfigurationService),
  __param(13, IChatContextService)
], ImplicitContextAttachmentWidget);
export {
  ImplicitContextAttachmentWidget
};
//# sourceMappingURL=implicitContextAttachment.js.map
