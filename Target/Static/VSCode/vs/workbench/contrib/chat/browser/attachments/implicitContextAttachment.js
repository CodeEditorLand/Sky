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
import * as dom from "../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
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
import { ResourceLabels } from "../../../../browser/labels.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { IChatRequestImplicitVariableEntry } from "../../common/chatModel.js";
let ImplicitContextAttachmentWidget = class extends Disposable {
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
    this.domNode = dom.$(".chat-attached-context-attachment.show-file-icons.implicit");
    this.render();
  }
  static {
    __name(this, "ImplicitContextAttachmentWidget");
  }
  domNode;
  renderDisposables = this._register(new DisposableStore());
  render() {
    dom.clearNode(this.domNode);
    this.renderDisposables.clear();
    this.domNode.classList.toggle("disabled", !this.attachment.enabled);
    const label = this.resourceLabels.create(this.domNode, { supportIcons: true });
    const file = URI.isUri(this.attachment.value) ? this.attachment.value : this.attachment.value.uri;
    const range = URI.isUri(this.attachment.value) || !this.attachment.isSelection ? void 0 : this.attachment.value.range;
    const fileBasename = basename(file);
    const fileDirname = dirname(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range ? localize("chat.fileAttachmentWithRange", "Attached file, {0}, line {1} to line {2}", friendlyName, range.startLineNumber, range.endLineNumber) : localize("chat.fileAttachment", "Attached file, {0}", friendlyName);
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    const currentFile = localize("openEditor", "Current file context");
    const inactive = localize("enableHint", "disabled");
    const currentFileHint = currentFile + (this.attachment.enabled ? "" : ` (${inactive})`);
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
    const hintElement = dom.append(this.domNode, dom.$("span.chat-implicit-hint", void 0, "Current file"));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), hintElement, title));
    const buttonMsg = this.attachment.enabled ? localize("disable", "Disable current file context") : localize("enable", "Enable current file context");
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
ImplicitContextAttachmentWidget = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IModelService)
], ImplicitContextAttachmentWidget);
export {
  ImplicitContextAttachmentWidget
};
//# sourceMappingURL=implicitContextAttachment.js.map
