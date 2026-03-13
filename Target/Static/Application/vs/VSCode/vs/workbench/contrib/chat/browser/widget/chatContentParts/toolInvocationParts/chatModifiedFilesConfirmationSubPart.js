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
import * as dom from "../../../../../../../base/browser/dom.js";
import { Button, ButtonWithIcon } from "../../../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { hasKey } from "../../../../../../../base/common/types.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { localize } from "../../../../../../../nls.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { IMarkdownRendererService } from "../../../../../../../platform/markdown/browser/markdownRenderer.js";
import { defaultButtonStyles } from "../../../../../../../platform/theme/browser/defaultStyles.js";
import { ILanguageModelToolsService } from "../../../../common/tools/languageModelToolsService.js";
import { ChatContextKeys } from "../../../../common/actions/chatContextKeys.js";
import { IChatWidgetService } from "../../../chat.js";
import { ChatCustomConfirmationWidget } from "../chatConfirmationWidget.js";
import { IEditorService } from "../../../../../../services/editor/common/editorService.js";
import { AbstractToolConfirmationSubPart } from "./abstractToolConfirmationSubPart.js";
let ChatModifiedFilesConfirmationSubPart = class ChatModifiedFilesConfirmationSubPart2 extends AbstractToolConfirmationSubPart {
  static {
    __name(this, "ChatModifiedFilesConfirmationSubPart");
  }
  constructor(toolInvocation, context, listPool, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, markdownRendererService, editorService, commandService) {
    super(toolInvocation, context, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService);
    this.listPool = listPool;
    this.markdownRendererService = markdownRendererService;
    this.editorService = editorService;
    this.commandService = commandService;
    this.codeblocks = [];
    const state = toolInvocation.state.get();
    if (state.type !== 1 || !state.confirmationMessages?.title) {
      throw new Error("Modified files confirmation messages are missing");
    }
    const data = toolInvocation.toolSpecificData;
    if (!data || data.kind !== "modifiedFilesConfirmation") {
      throw new Error("Modified files confirmation data is missing");
    }
    const tool = languageModelToolsService.getTool(toolInvocation.toolId);
    const confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, this.context, {
      title: this.getTitle(),
      icon: tool?.icon && hasKey(tool.icon, { id: true }) ? tool.icon : Codicon.tools,
      subtitle: typeof toolInvocation.originMessage === "string" ? toolInvocation.originMessage : toolInvocation.originMessage?.value,
      buttons: this.createButtons(data.options),
      message: this.createWidgetContentElement(state.confirmationMessages.message, data)
    }));
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick((button) => {
      button.data();
      this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
    }));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    this.domNode = confirmWidget.domNode;
  }
  createButtons(options) {
    const [primaryOption, ...secondaryOptions] = options;
    return [
      {
        label: primaryOption,
        data: /* @__PURE__ */ __name(() => this.confirmWith(this.toolInvocation, { type: 4, selectedButton: primaryOption }), "data"),
        moreActions: secondaryOptions.map((option) => ({
          label: option,
          data: /* @__PURE__ */ __name(() => this.confirmWith(this.toolInvocation, { type: 4, selectedButton: option }), "data")
        }))
      },
      {
        label: localize("cancel", "Cancel"),
        data: /* @__PURE__ */ __name(() => this.confirmWith(this.toolInvocation, {
          type: 5
          /* ToolConfirmKind.Skipped */
        }), "data"),
        isSecondary: true
      }
    ];
  }
  createWidgetContentElement(message, data) {
    const container = dom.$(".chat-modified-files-confirmation");
    if (message) {
      const renderedMessage = this._register(this.markdownRendererService.render(typeof message === "string" ? new MarkdownString(message) : message));
      container.append(renderedMessage.element);
    }
    container.append(this.createModifiedFilesElement(data));
    return container;
  }
  createModifiedFilesElement(data) {
    const container = dom.$(".chat-modified-files-confirmation-list.chat-editing-session-container.show-file-icons");
    const overview = dom.append(container, dom.$(".chat-editing-session-overview"));
    const title = dom.append(overview, dom.$(".working-set-title"));
    const titleButton = this._register(new ButtonWithIcon(title, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      supportIcons: true
    }));
    const actions = dom.append(overview, dom.$(".chat-editing-session-actions"));
    const countsContainer = dom.$(".working-set-line-counts");
    const addedSpan = dom.append(countsContainer, dom.$(".working-set-lines-added"));
    const removedSpan = dom.append(countsContainer, dom.$(".working-set-lines-removed"));
    titleButton.element.appendChild(countsContainer);
    const filesLabel = data.modifiedFiles.length === 1 ? localize("oneFileChanged", "1 file changed") : localize("manyFilesChanged", "{0} files changed", data.modifiedFiles.length);
    titleButton.label = filesLabel;
    let added = 0;
    let removed = 0;
    let hasDiffStats = false;
    for (const file of data.modifiedFiles) {
      if (typeof file.insertions === "number" || typeof file.deletions === "number") {
        hasDiffStats = true;
        added += file.insertions ?? 0;
        removed += file.deletions ?? 0;
      }
    }
    if (hasDiffStats) {
      addedSpan.textContent = `+${added}`;
      removedSpan.textContent = `-${removed}`;
      titleButton.element.setAttribute("aria-label", localize("modifiedFilesSummaryWithCounts", "{0}, {1} lines added, {2} lines removed", filesLabel, added, removed));
      countsContainer.setAttribute("aria-label", localize("modifiedFilesCounts", "{0} lines added, {1} lines removed", added, removed));
    } else {
      countsContainer.remove();
      titleButton.element.setAttribute("aria-label", filesLabel);
    }
    const viewAllChangesButton = this._register(new Button(actions, {
      ...defaultButtonStyles,
      secondary: true,
      small: true,
      supportIcons: true,
      ariaLabel: localize("viewAllChanges", "View All Changes"),
      title: localize("viewAllChanges", "View All Changes")
    }));
    viewAllChangesButton.element.classList.add("default-colors");
    viewAllChangesButton.icon = Codicon.diffMultiple;
    viewAllChangesButton.label = " ";
    this._register(viewAllChangesButton.onDidClick(async () => {
      await this.openAllChanges(data);
    }));
    const listReference = this._register(this.listPool.get());
    const list = listReference.object;
    const listItems = data.modifiedFiles.map((file) => {
      const resource = URI.revive(file.uri);
      const originalUri = file.originalUri ? URI.revive(file.originalUri) : void 0;
      return {
        kind: "reference",
        reference: resource,
        title: file.title,
        description: file.description,
        state: 1,
        showModifiedState: true,
        options: {
          diffMeta: typeof file.insertions === "number" || typeof file.deletions === "number" ? {
            added: file.insertions ?? 0,
            removed: file.deletions ?? 0
          } : void 0,
          originalUri,
          status: void 0
        }
      };
    });
    this._register(list.onDidOpen(async (e) => {
      if (e.element?.kind !== "reference" || !URI.isUri(e.element.reference)) {
        return;
      }
      const modifiedUri = e.element.reference;
      const originalUri = e.element.options?.originalUri;
      if (originalUri) {
        await this.editorService.openEditor({
          original: { resource: originalUri },
          modified: { resource: modifiedUri },
          options: e.editorOptions
        });
        return;
      }
      await this.editorService.openEditor({
        resource: modifiedUri,
        options: e.editorOptions
      });
    }));
    const maxItemsShown = 6;
    const itemsShown = Math.min(listItems.length, maxItemsShown);
    const height = itemsShown * 22;
    const workingSetContainer = dom.append(container, dom.$(".chat-editing-session-list.collapsed"));
    list.layout(height);
    list.getHTMLElement().style.height = `${height}px`;
    list.splice(0, list.length, listItems);
    workingSetContainer.append(list.getHTMLElement());
    let isCollapsed = true;
    const setExpansionState = /* @__PURE__ */ __name(() => {
      titleButton.icon = isCollapsed ? Codicon.chevronRight : Codicon.chevronDown;
      workingSetContainer.classList.toggle("collapsed", isCollapsed);
    }, "setExpansionState");
    setExpansionState();
    const toggleWorkingSet = /* @__PURE__ */ __name(() => {
      isCollapsed = !isCollapsed;
      setExpansionState();
    }, "toggleWorkingSet");
    this._register(titleButton.onDidClick(toggleWorkingSet));
    this._register(dom.addDisposableListener(overview, "click", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      const target = e.target;
      if (target.closest(".monaco-button")) {
        return;
      }
      toggleWorkingSet();
    }));
    return container;
  }
  async openAllChanges(data) {
    await this.commandService.executeCommand("_workbench.openMultiDiffEditor", {
      title: localize("modifiedFilesAllChangesTitle", "All Changes"),
      resources: data.modifiedFiles.map((file) => ({
        originalUri: file.originalUri ? URI.revive(file.originalUri) : void 0,
        modifiedUri: URI.revive(file.uri)
      }))
    });
  }
  createContentElement() {
    throw new Error("Not used");
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type !== 1) {
      return "";
    }
    const title = state.confirmationMessages?.title;
    return typeof title === "string" ? title : title?.value ?? "";
  }
};
ChatModifiedFilesConfirmationSubPart = __decorate([
  __param(3, IInstantiationService),
  __param(4, IKeybindingService),
  __param(5, IContextKeyService),
  __param(6, IChatWidgetService),
  __param(7, ILanguageModelToolsService),
  __param(8, IMarkdownRendererService),
  __param(9, IEditorService),
  __param(10, ICommandService)
], ChatModifiedFilesConfirmationSubPart);
export {
  ChatModifiedFilesConfirmationSubPart
};
//# sourceMappingURL=chatModifiedFilesConfirmationSubPart.js.map
