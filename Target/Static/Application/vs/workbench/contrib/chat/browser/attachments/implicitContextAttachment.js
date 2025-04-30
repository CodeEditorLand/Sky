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
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { localize } from "../../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { FileKind, IFileService } from "../../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
let ImplicitContextAttachmentWidget = class ImplicitContextAttachmentWidget2 extends Disposable {
  static {
    __name(this, "ImplicitContextAttachmentWidget");
  }
  constructor(attachment, resourceLabels, contextKeyService, contextMenuService, hoverService, labelService, menuService, fileService, languageService, modelService) {
    super();
    this.attachment = attachment;
    this.resourceLabels = resourceLabels;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.renderDisposables = this._register(new DisposableStore());
    this.domNode = dom.$(".chat-attached-context-attachment.show-file-icons.implicit");
    this.render();
  }
  render() {
    dom.clearNode(this.domNode);
    this.renderDisposables.clear();
    const attachmentTypeName = this.attachment.isPromptFile === false ? localize("file.lowercase", "file") : localize("prompt.lowercase", "prompt");
    this.domNode.classList.toggle("disabled", !this.attachment.enabled);
    const label = this.resourceLabels.create(this.domNode, { supportIcons: true });
    const file = URI.isUri(this.attachment.value) ? this.attachment.value : this.attachment.value.uri;
    const range = URI.isUri(this.attachment.value) || !this.attachment.isSelection ? void 0 : this.attachment.value.range;
    const fileBasename = basename(file);
    const fileDirname = dirname(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached {0}, {1}, line {2} to line {3}", attachmentTypeName, friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached {0}, {1}", attachmentTypeName, friendlyName);
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    const currentFile = localize("openEditor", "Current {0} context", attachmentTypeName);
    const inactive = localize("enableHint", "disabled");
    const currentFileHint = currentFile + (this.attachment.enabled ? "" : ` (${inactive})`);
    const title = `${currentFileHint}
${uriLabel}`;
    const icon = this.attachment.isPromptFile ? ThemeIcon.fromId(Codicon.bookmark.id) : void 0;
    label.setFile(file, {
      fileKind: FileKind.FILE,
      hidePath: true,
      range,
      title,
      icon
    });
    this.domNode.ariaLabel = ariaLabel;
    this.domNode.tabIndex = 0;
    const hintLabel = localize("hint.label.current", "Current {0}", attachmentTypeName);
    const hintElement = dom.append(this.domNode, dom.$("span.chat-implicit-hint", void 0, hintLabel));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), hintElement, title));
    const buttonMsg = this.attachment.enabled ? localize("disable", "Disable current {0} context", attachmentTypeName) : localize("enable", "Enable current {0} context", attachmentTypeName);
    const toggleButton = this.renderDisposables.add(new Button(this.domNode, { supportIcons: true, title: buttonMsg }));
    toggleButton.icon = this.attachment.enabled ? Codicon.eye : Codicon.eyeClosed;
    this.renderDisposables.add(toggleButton.onDidClick((e) => {
      e.stopPropagation();
      this.attachment.enabled = !this.attachment.enabled;
    }));
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
};
ImplicitContextAttachmentWidget = __decorate([
  __param(2, IContextKeyService),
  __param(3, IContextMenuService),
  __param(4, IHoverService),
  __param(5, ILabelService),
  __param(6, IMenuService),
  __param(7, IFileService),
  __param(8, ILanguageService),
  __param(9, IModelService)
], ImplicitContextAttachmentWidget);
export {
  ImplicitContextAttachmentWidget
};
//# sourceMappingURL=implicitContextAttachment.js.map
