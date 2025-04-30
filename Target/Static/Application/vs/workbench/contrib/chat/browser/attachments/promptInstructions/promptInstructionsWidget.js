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
import { localize } from "../../../../../../nls.js";
import { URI } from "../../../../../../base/common/uri.js";
import * as dom from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { ResourceContextKey } from "../../../../../common/contextkeys.js";
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { basename, dirname } from "../../../../../../base/common/resources.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { StandardMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { FileKind, IFileService } from "../../../../../../platform/files/common/files.js";
import { IMenuService, MenuId } from "../../../../../../platform/actions/common/actions.js";
import { getCleanPromptName } from "../../../../../../platform/prompts/common/constants.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { getDefaultHoverDelegate } from "../../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { getFlatContextMenuActions } from "../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
let InstructionsAttachmentWidget = class InstructionsAttachmentWidget2 extends Disposable {
  static {
    __name(this, "InstructionsAttachmentWidget");
  }
  /**
   * Get the `URI` associated with the model reference.
   */
  get uri() {
    return this.model.reference.uri;
  }
  /**
   * Subscribe to the `onDispose` event.
   * @param callback Function to invoke on dispose.
   */
  onDispose(callback) {
    this._register(this._onDispose.event(callback));
    return this;
  }
  constructor(model, resourceLabels, contextKeyService, contextMenuService, hoverService, labelService, menuService, fileService, languageService, modelService) {
    super();
    this.model = model;
    this.resourceLabels = resourceLabels;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
    this._onDispose = this._register(new Emitter());
    this.renderDisposables = this._register(new DisposableStore());
    this.domNode = dom.$(".chat-prompt-attachment.chat-attached-context-attachment.show-file-icons.implicit");
    this.render = this.render.bind(this);
    this.dispose = this.dispose.bind(this);
    this.model.onUpdate(this.render);
    this.model.onDispose(this.dispose);
    this.render();
  }
  /**
   * Render this widget.
   */
  render() {
    dom.clearNode(this.domNode);
    this.renderDisposables.clear();
    this.domNode.classList.remove("warning", "error", "disabled");
    const { topError } = this.model;
    const label = this.resourceLabels.create(this.domNode, { supportIcons: true });
    const file = this.model.reference.uri;
    const fileBasename = basename(file);
    const fileDirname = dirname(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const isPrompt = this.languageService.guessLanguageIdByFilepathOrFirstLine(file) === "prompt";
    const ariaLabel = isPrompt ? localize("chat.promptAttachment", "Prompt file, {0}", friendlyName) : localize("chat.instructionsAttachment", "Instructions attachment, {0}", friendlyName);
    const typeLabel = isPrompt ? localize("prompt", "Prompt") : localize("instructions", "Instructions");
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    let title = `${typeLabel} ${uriLabel}`;
    if (topError) {
      const { errorSubject: subject } = topError;
      const isError = subject === "root";
      this.domNode.classList.add(isError ? "error" : "warning");
      const severity = isError ? localize("error", "Error") : localize("warning", "Warning");
      title += `
[${severity}]: ${topError.localizedMessage}`;
    }
    const fileWithoutExtension = getCleanPromptName(file);
    label.setFile(URI.file(fileWithoutExtension), {
      fileKind: FileKind.FILE,
      hidePath: true,
      range: void 0,
      title,
      icon: ThemeIcon.fromId(Codicon.bookmark.id),
      extraClasses: []
    });
    this.domNode.ariaLabel = ariaLabel;
    this.domNode.tabIndex = 0;
    const hintElement = dom.append(this.domNode, dom.$("span.chat-implicit-hint", void 0, typeLabel));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), hintElement, title));
    const removeButton = this.renderDisposables.add(new Button(this.domNode, {
      supportIcons: true,
      title: localize("remove", "Remove")
    }));
    removeButton.icon = Codicon.close;
    this.renderDisposables.add(removeButton.onDidClick((e) => {
      e.stopPropagation();
      this.model.dispose();
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
  dispose() {
    this._onDispose.fire();
    super.dispose();
  }
};
InstructionsAttachmentWidget = __decorate([
  __param(2, IContextKeyService),
  __param(3, IContextMenuService),
  __param(4, IHoverService),
  __param(5, ILabelService),
  __param(6, IMenuService),
  __param(7, IFileService),
  __param(8, ILanguageService),
  __param(9, IModelService)
], InstructionsAttachmentWidget);
export {
  InstructionsAttachmentWidget
};
//# sourceMappingURL=promptInstructionsWidget.js.map
