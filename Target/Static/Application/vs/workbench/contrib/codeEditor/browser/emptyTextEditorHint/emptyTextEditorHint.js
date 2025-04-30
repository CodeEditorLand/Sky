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
var EmptyTextEditorHintContentWidget_1;
import "./emptyTextEditorHint.css";
import { $, addDisposableListener, getActiveWindow } from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ChangeLanguageAction } from "../../../../browser/parts/editor/editorStatus.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import { Schemas } from "../../../../../base/common/network.js";
import { Event } from "../../../../../base/common/event.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { registerEditorContribution } from "../../../../../editor/browser/editorExtensions.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { renderFormattedText } from "../../../../../base/browser/formattedTextRenderer.js";
import { ApplyFileSnippetAction } from "../../../snippets/browser/commands/fileTemplateSnippets.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { status } from "../../../../../base/browser/ui/aria/aria.js";
import { LOG_MODE_ID, OUTPUT_MODE_ID } from "../../../../services/output/common/output.js";
import { SEARCH_RESULT_LANGUAGE_ID } from "../../../../services/search/common/search.js";
import { IChatAgentService } from "../../../chat/common/chatAgents.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { StandardMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
const emptyTextEditorHintSetting = "workbench.editor.empty.hint";
let EmptyTextEditorHintContribution = class EmptyTextEditorHintContribution2 extends Disposable {
  static {
    __name(this, "EmptyTextEditorHintContribution");
  }
  static {
    this.ID = "editor.contrib.emptyTextEditorHint";
  }
  constructor(editor, configurationService, inlineChatSessionService, chatAgentService, instantiationService) {
    super();
    this.editor = editor;
    this.configurationService = configurationService;
    this.inlineChatSessionService = inlineChatSessionService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this._register(this.editor.onDidChangeModel(() => this.update()));
    this._register(this.editor.onDidChangeModelLanguage(() => this.update()));
    this._register(this.editor.onDidChangeModelContent(() => this.update()));
    this._register(this.chatAgentService.onDidChangeAgents(() => this.update()));
    this._register(this.editor.onDidChangeModelDecorations(() => this.update()));
    this._register(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(
        96
        /* EditorOption.readOnly */
      )) {
        this.update();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(emptyTextEditorHintSetting)) {
        this.update();
      }
    }));
    this._register(inlineChatSessionService.onWillStartSession((editor2) => {
      if (this.editor === editor2) {
        this.textHintContentWidget?.dispose();
      }
    }));
    this._register(inlineChatSessionService.onDidEndSession((e) => {
      if (this.editor === e.editor) {
        this.update();
      }
    }));
  }
  shouldRenderHint() {
    const configValue = this.configurationService.getValue(emptyTextEditorHintSetting);
    if (configValue === "hidden") {
      return false;
    }
    if (this.editor.getOption(
      96
      /* EditorOption.readOnly */
    )) {
      return false;
    }
    const model = this.editor.getModel();
    const languageId = model?.getLanguageId();
    if (!model || languageId === OUTPUT_MODE_ID || languageId === LOG_MODE_ID || languageId === SEARCH_RESULT_LANGUAGE_ID) {
      return false;
    }
    if (this.inlineChatSessionService.getSession(this.editor, model.uri)) {
      return false;
    }
    if (this.editor.getModel()?.getValueLength()) {
      return false;
    }
    const hasConflictingDecorations = Boolean(this.editor.getLineDecorations(1)?.find((d) => d.options.beforeContentClassName || d.options.afterContentClassName || d.options.before?.content || d.options.after?.content));
    if (hasConflictingDecorations) {
      return false;
    }
    const hasEditorAgents = Boolean(this.chatAgentService.getDefaultAgent(ChatAgentLocation.Editor));
    const shouldRenderDefaultHint = model?.uri.scheme === Schemas.untitled && languageId === PLAINTEXT_LANGUAGE_ID;
    return hasEditorAgents || shouldRenderDefaultHint;
  }
  update() {
    const shouldRenderHint = this.shouldRenderHint();
    if (shouldRenderHint && !this.textHintContentWidget) {
      this.textHintContentWidget = this.instantiationService.createInstance(EmptyTextEditorHintContentWidget, this.editor);
    } else if (!shouldRenderHint && this.textHintContentWidget) {
      this.textHintContentWidget.dispose();
      this.textHintContentWidget = void 0;
    }
  }
  dispose() {
    super.dispose();
    this.textHintContentWidget?.dispose();
  }
};
EmptyTextEditorHintContribution = __decorate([
  __param(1, IConfigurationService),
  __param(2, IInlineChatSessionService),
  __param(3, IChatAgentService),
  __param(4, IInstantiationService)
], EmptyTextEditorHintContribution);
let EmptyTextEditorHintContentWidget = class EmptyTextEditorHintContentWidget2 extends Disposable {
  static {
    __name(this, "EmptyTextEditorHintContentWidget");
  }
  static {
    EmptyTextEditorHintContentWidget_1 = this;
  }
  static {
    this.ID = "editor.widget.emptyHint";
  }
  constructor(editor, editorGroupsService, commandService, configurationService, keybindingService, chatAgentService, telemetryService, contextMenuService) {
    super();
    this.editor = editor;
    this.editorGroupsService = editorGroupsService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.chatAgentService = chatAgentService;
    this.telemetryService = telemetryService;
    this.contextMenuService = contextMenuService;
    this.isVisible = false;
    this.ariaLabel = "";
    this._register(this.editor.onDidChangeConfiguration((e) => {
      if (this.domNode && e.hasChanged(
        52
        /* EditorOption.fontInfo */
      )) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    const onDidFocusEditorText = Event.debounce(this.editor.onDidFocusEditorText, () => void 0, 500);
    this._register(onDidFocusEditorText(() => {
      if (this.editor.hasTextFocus() && this.isVisible && this.ariaLabel && this.configurationService.getValue(
        "accessibility.verbosity.emptyEditorHint"
        /* AccessibilityVerbositySettingId.EmptyEditorHint */
      )) {
        status(this.ariaLabel);
      }
    }));
    this.editor.addContentWidget(this);
  }
  getId() {
    return EmptyTextEditorHintContentWidget_1.ID;
  }
  disableHint(e) {
    const disableHint = /* @__PURE__ */ __name(() => {
      this.configurationService.updateValue(emptyTextEditorHintSetting, "hidden");
      this.dispose();
      this.editor.focus();
    }, "disableHint");
    if (!e) {
      disableHint();
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => {
        return new StandardMouseEvent(getActiveWindow(), e);
      }, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        return [
          {
            id: "workench.action.disableEmptyEditorHint",
            label: localize("disableEditorEmptyHint", "Disable Empty Editor Hint"),
            tooltip: localize("disableEditorEmptyHint", "Disable Empty Editor Hint"),
            enabled: true,
            class: void 0,
            run: /* @__PURE__ */ __name(() => {
              disableHint();
            }, "run")
          }
        ];
      }, "getActions")
    });
  }
  getHint() {
    const hasInlineChatProvider = this.chatAgentService.getActivatedAgents().filter((candidate) => candidate.locations.includes(ChatAgentLocation.Editor)).length > 0;
    const hintHandler = {
      disposables: this._store,
      callback: /* @__PURE__ */ __name((index, event) => {
        switch (index) {
          case "0":
            hasInlineChatProvider ? askSomething(event.browserEvent) : languageOnClickOrTap(event.browserEvent);
            break;
          case "1":
            hasInlineChatProvider ? languageOnClickOrTap(event.browserEvent) : snippetOnClickOrTap(event.browserEvent);
            break;
          case "2":
            hasInlineChatProvider ? snippetOnClickOrTap(event.browserEvent) : chooseEditorOnClickOrTap(event.browserEvent);
            break;
          case "3":
            this.disableHint();
            break;
        }
      }, "callback")
    };
    const askSomethingCommandId = "inlineChat.start";
    const askSomething = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: askSomethingCommandId,
        from: "hint"
      });
      await this.commandService.executeCommand(askSomethingCommandId, { from: "hint" });
    }, "askSomething");
    const languageOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      this.editor.focus();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: ChangeLanguageAction.ID,
        from: "hint"
      });
      await this.commandService.executeCommand(ChangeLanguageAction.ID);
      this.editor.focus();
    }, "languageOnClickOrTap");
    const snippetOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: ApplyFileSnippetAction.Id,
        from: "hint"
      });
      await this.commandService.executeCommand(ApplyFileSnippetAction.Id);
    }, "snippetOnClickOrTap");
    const chooseEditorOnClickOrTap = /* @__PURE__ */ __name(async (e) => {
      e.stopPropagation();
      const activeEditorInput = this.editorGroupsService.activeGroup.activeEditor;
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: "welcome.showNewFileEntries",
        from: "hint"
      });
      const newEditorSelected = await this.commandService.executeCommand("welcome.showNewFileEntries", { from: "hint" });
      if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === Schemas.untitled) {
        this.editorGroupsService.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
      }
    }, "chooseEditorOnClickOrTap");
    const keybindingsLookup = hasInlineChatProvider ? [askSomethingCommandId, ChangeLanguageAction.ID, ApplyFileSnippetAction.Id] : [ChangeLanguageAction.ID, ApplyFileSnippetAction.Id, "welcome.showNewFileEntries"];
    const keybindingLabels = keybindingsLookup.map((id) => this.keybindingService.lookupKeybinding(id)?.getLabel());
    const hintMsg = (hasInlineChatProvider ? localize({
      key: "emptyTextEditorHintWithInlineChat",
      comment: [
        "Preserve double-square brackets and their order",
        "language refers to a programming language"
      ]
    }, "[[Open chat]] ({0}), or [[select a language]] ({1}), or [[fill with template]] ({2}) to get started.\nStart typing to dismiss or [[don't show]] this again.", keybindingLabels.at(0) ?? "", keybindingLabels.at(1) ?? "", keybindingLabels.at(2) ?? "") : localize({
      key: "emptyTextEditorHintWithoutInlineChat",
      comment: [
        "Preserve double-square brackets and their order",
        "language refers to a programming language"
      ]
    }, "[[Select a language]] ({0}), or [[fill with template]] ({1}), or [[open a different editor]] ({2}) to get started.\nStart typing to dismiss or [[don't show]] this again.", keybindingLabels.at(0) ?? "", keybindingLabels.at(1) ?? "", keybindingLabels.at(2) ?? "")).replaceAll("()", "");
    const hintElement = renderFormattedText(hintMsg, {
      actionHandler: hintHandler,
      renderCodeSegments: false
    });
    hintElement.style.fontStyle = "italic";
    const ariaLabel = hasInlineChatProvider ? localize("defaultHintAriaLabelWithInlineChat", "Execute {0} to ask a question, execute {1} to select a language, or execute {2} to fill with template and get started. Start typing to dismiss.", ...keybindingLabels) : localize("defaultHintAriaLabelWithoutInlineChat", "Execute {0} to select a language, execute {1} to fill with template, or execute {2} to open a different editor and get started. Start typing to dismiss.", ...keybindingLabels);
    for (const anchor of hintElement.querySelectorAll("a")) {
      anchor.style.cursor = "pointer";
    }
    return { hintElement, ariaLabel };
  }
  getDomNode() {
    if (!this.domNode) {
      this.domNode = $(".empty-editor-hint");
      this.domNode.style.width = "max-content";
      this.domNode.style.paddingLeft = "4px";
      const { hintElement, ariaLabel } = this.getHint();
      this.domNode.append(hintElement);
      this.ariaLabel = ariaLabel.concat(localize(
        "disableHint",
        " Toggle {0} in settings to disable this hint.",
        "accessibility.verbosity.emptyEditorHint"
        /* AccessibilityVerbositySettingId.EmptyEditorHint */
      ));
      this._register(addDisposableListener(this.domNode, "click", () => {
        this.editor.focus();
      }));
      this.editor.applyFontInfo(this.domNode);
    }
    return this.domNode;
  }
  getPosition() {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [
        0
        /* ContentWidgetPositionPreference.EXACT */
      ]
    };
  }
  dispose() {
    super.dispose();
    this.editor.removeContentWidget(this);
  }
};
EmptyTextEditorHintContentWidget = EmptyTextEditorHintContentWidget_1 = __decorate([
  __param(1, IEditorGroupsService),
  __param(2, ICommandService),
  __param(3, IConfigurationService),
  __param(4, IKeybindingService),
  __param(5, IChatAgentService),
  __param(6, ITelemetryService),
  __param(7, IContextMenuService)
], EmptyTextEditorHintContentWidget);
registerEditorContribution(
  EmptyTextEditorHintContribution.ID,
  EmptyTextEditorHintContribution,
  0
  /* EditorContributionInstantiation.Eager */
);
export {
  EmptyTextEditorHintContribution,
  emptyTextEditorHintSetting
};
//# sourceMappingURL=emptyTextEditorHint.js.map
