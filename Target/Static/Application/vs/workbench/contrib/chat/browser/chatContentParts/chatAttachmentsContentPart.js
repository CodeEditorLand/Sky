var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { createInstantHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ResourceLabels } from "../../../../browser/labels.js";
import { isElementVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemVariableEntry } from "../../common/chatVariableEntries.js";
import { ChatResponseReferencePartStatusKind } from "../../common/chatService.js";
import { DefaultChatAttachmentWidget, ElementChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, NotebookCellOutputChatAttachmentWidget, PasteAttachmentWidget, PromptFileAttachmentWidget, SCMHistoryItemAttachmentWidget, ToolSetOrToolItemAttachmentWidget } from "../chatAttachmentWidgets.js";
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
let ChatAttachmentsContentPart = class ChatAttachmentsContentPart2 extends Disposable {
  static {
    __name(this, "ChatAttachmentsContentPart");
  }
  constructor(variables, contentReferences = [], domNode = dom.$(".chat-attached-context"), instantiationService) {
    super();
    this.variables = variables;
    this.contentReferences = contentReferences;
    this.domNode = domNode;
    this.instantiationService = instantiationService;
    this.attachedContextDisposables = this._register(new DisposableStore());
    this._onDidChangeVisibility = this._register(new Emitter());
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this.initAttachedContext(domNode);
    if (!domNode.childElementCount) {
      this.domNode = void 0;
    }
  }
  initAttachedContext(container) {
    dom.clearNode(container);
    this.attachedContextDisposables.clear();
    const hoverDelegate = this.attachedContextDisposables.add(createInstantHoverDelegate());
    for (const attachment of this.variables) {
      const resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
      const range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
      const correspondingContentReference = this.contentReferences.find((ref) => typeof ref.reference === "object" && "variableName" in ref.reference && ref.reference.variableName === attachment.name || URI.isUri(ref.reference) && basename(ref.reference.path) === attachment.name);
      const isAttachmentOmitted = correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted;
      const isAttachmentPartialOrOmitted = isAttachmentOmitted || correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial;
      let widget;
      if (attachment.kind === "tool" || attachment.kind === "toolset") {
        widget = this.instantiationService.createInstance(ToolSetOrToolItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (isElementVariableEntry(attachment)) {
        widget = this.instantiationService.createInstance(ElementChatAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (isImageVariableEntry(attachment)) {
        attachment.omittedState = isAttachmentPartialOrOmitted ? 2 : attachment.omittedState;
        widget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (resource && isPromptFileVariableEntry(attachment)) {
        widget = this.instantiationService.createInstance(PromptFileAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (isPromptTextVariableEntry(attachment)) {
        continue;
      } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
        widget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (isPasteVariableEntry(attachment)) {
        widget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (resource && isNotebookOutputVariableEntry(attachment)) {
        widget = this.instantiationService.createInstance(NotebookCellOutputChatAttachmentWidget, resource, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else if (isSCMHistoryItemVariableEntry(attachment)) {
        widget = this.instantiationService.createInstance(SCMHistoryItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      } else {
        widget = this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels, hoverDelegate);
      }
      let ariaLabel = null;
      if (isAttachmentPartialOrOmitted) {
        widget.element.classList.add("warning");
      }
      const description = correspondingContentReference?.options?.status?.description;
      if (isAttachmentPartialOrOmitted) {
        ariaLabel = `${ariaLabel}${description ? ` ${description}` : ""}`;
        for (const selector of [".monaco-icon-suffix-container", ".monaco-icon-name-container"]) {
          const element = widget.label.element.querySelector(selector);
          if (element) {
            element.classList.add("warning");
          }
        }
      }
      this._register(dom.addDisposableListener(widget.element, "contextmenu", (e) => this.contextMenuHandler?.(attachment, e)));
      if (this.attachedContextDisposables.isDisposed) {
        widget.dispose();
        return;
      }
      if (ariaLabel) {
        widget.element.ariaLabel = ariaLabel;
      }
      this.attachedContextDisposables.add(widget);
    }
  }
};
ChatAttachmentsContentPart = __decorate([
  __param(3, IInstantiationService)
], ChatAttachmentsContentPart);
export {
  ChatAttachmentsContentPart
};
//# sourceMappingURL=chatAttachmentsContentPart.js.map
