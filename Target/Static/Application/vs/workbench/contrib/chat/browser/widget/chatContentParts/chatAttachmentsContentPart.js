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
import * as dom from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../../base/common/path.js";
import { URI } from "../../../../../../base/common/uri.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ResourceLabels } from "../../../../../browser/labels.js";
import { isElementVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemChangeRangeVariableEntry, isSCMHistoryItemChangeVariableEntry, isSCMHistoryItemVariableEntry, isTerminalVariableEntry, isWorkspaceVariableEntry } from "../../../common/attachments/chatVariableEntries.js";
import { ChatResponseReferencePartStatusKind } from "../../../common/chatService/chatService.js";
import { DefaultChatAttachmentWidget, ElementChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, NotebookCellOutputChatAttachmentWidget, PasteAttachmentWidget, PromptFileAttachmentWidget, PromptTextAttachmentWidget, SCMHistoryItemAttachmentWidget, SCMHistoryItemChangeAttachmentWidget, SCMHistoryItemChangeRangeAttachmentWidget, TerminalCommandAttachmentWidget, ToolSetOrToolItemAttachmentWidget } from "../../attachments/chatAttachmentWidgets.js";
let ChatAttachmentsContentPart = class ChatAttachmentsContentPart2 extends Disposable {
  static {
    __name(this, "ChatAttachmentsContentPart");
  }
  constructor(options, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.attachedContextDisposables = this._register(new DisposableStore());
    this._onDidChangeVisibility = this._register(new Emitter());
    this._showingAll = false;
    this._variables = options.variables;
    this.contentReferences = options.contentReferences ?? [];
    this.limit = options.limit;
    this.domNode = options.domNode ?? dom.$(".chat-attached-context");
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this.initAttachedContext(this.domNode);
    if (!this.domNode.childElementCount) {
      this.domNode = void 0;
    }
  }
  /**
   * Update the variables and re-render the attachments in place.
   */
  updateVariables(variables) {
    this._variables = variables;
    if (this.domNode) {
      this.initAttachedContext(this.domNode);
    }
  }
  initAttachedContext(container) {
    dom.clearNode(container);
    this.attachedContextDisposables.clear();
    const visibleAttachments = this.getVisibleAttachments();
    const hasMoreAttachments = this.limit && this._variables.length > this.limit && !this._showingAll;
    for (const attachment of visibleAttachments) {
      this.renderAttachment(attachment, container);
    }
    if (hasMoreAttachments) {
      this.renderShowMoreButton(container);
    }
  }
  getVisibleAttachments() {
    if (!this.limit || this._showingAll) {
      return this._variables;
    }
    return this._variables.slice(0, this.limit);
  }
  renderShowMoreButton(container) {
    const remainingCount = this._variables.length - (this.limit ?? 0);
    const showMoreButton = dom.$("div.chat-attached-context-attachment.chat-attachments-show-more-button");
    showMoreButton.setAttribute("role", "button");
    showMoreButton.setAttribute("tabindex", "0");
    showMoreButton.style.cursor = "pointer";
    const pillIcon = dom.$("div.chat-attached-context-pill", {}, dom.$("span.codicon.codicon-ellipsis"));
    const textLabel = dom.$("span.chat-attached-context-custom-text");
    textLabel.textContent = `${remainingCount} more`;
    showMoreButton.appendChild(pillIcon);
    showMoreButton.appendChild(textLabel);
    const clickHandler = /* @__PURE__ */ __name(() => {
      this._showingAll = true;
      this.initAttachedContext(container);
    }, "clickHandler");
    this.attachedContextDisposables.add(dom.addDisposableListener(showMoreButton, "click", clickHandler));
    this.attachedContextDisposables.add(dom.addDisposableListener(showMoreButton, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        clickHandler();
      }
    }));
    container.appendChild(showMoreButton);
    this.attachedContextDisposables.add({ dispose: /* @__PURE__ */ __name(() => showMoreButton.remove(), "dispose") });
  }
  renderAttachment(attachment, container) {
    const resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
    const range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
    const correspondingContentReference = this.contentReferences.find((ref) => typeof ref.reference === "object" && "variableName" in ref.reference && ref.reference.variableName === attachment.name || URI.isUri(ref.reference) && basename(ref.reference.path) === attachment.name);
    const isAttachmentOmitted = correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted;
    const isAttachmentPartialOrOmitted = isAttachmentOmitted || correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial;
    let widget;
    if (attachment.kind === "tool" || attachment.kind === "toolset") {
      widget = this.instantiationService.createInstance(ToolSetOrToolItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isElementVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(ElementChatAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isImageVariableEntry(attachment)) {
      attachment.omittedState = isAttachmentPartialOrOmitted ? 2 : attachment.omittedState;
      widget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isPromptFileVariableEntry(attachment)) {
      if (attachment.automaticallyAdded) {
        return;
      }
      widget = this.instantiationService.createInstance(PromptFileAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isPromptTextVariableEntry(attachment)) {
      if (attachment.automaticallyAdded) {
        return;
      }
      widget = this.instantiationService.createInstance(PromptTextAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
      widget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isTerminalVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(TerminalCommandAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isPasteVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (resource && isNotebookOutputVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(NotebookCellOutputChatAttachmentWidget, resource, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isSCMHistoryItemVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isSCMHistoryItemChangeVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemChangeAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isSCMHistoryItemChangeRangeVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemChangeRangeAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
    } else if (isWorkspaceVariableEntry(attachment)) {
      return;
    } else {
      widget = this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container, this._contextResourceLabels);
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
};
ChatAttachmentsContentPart = __decorate([
  __param(1, IInstantiationService)
], ChatAttachmentsContentPart);
export {
  ChatAttachmentsContentPart
};
//# sourceMappingURL=chatAttachmentsContentPart.js.map
