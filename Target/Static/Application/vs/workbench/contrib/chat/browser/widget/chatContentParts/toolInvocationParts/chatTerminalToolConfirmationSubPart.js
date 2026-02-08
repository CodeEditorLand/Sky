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
import { append, h } from "../../../../../../../base/browser/dom.js";
import { Separator } from "../../../../../../../base/common/actions.js";
import { asArray } from "../../../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { ErrorNoTelemetry } from "../../../../../../../base/common/errors.js";
import { createCommandUri, MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { thenRegisterOrDispose, toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../../../base/common/network.js";
import Severity from "../../../../../../../base/common/severity.js";
import { isObject } from "../../../../../../../base/common/types.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../../../base/common/uuid.js";
import { ILanguageService } from "../../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../../../platform/dialogs/common/dialogs.js";
import { IHoverService } from "../../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { IStorageService } from "../../../../../../../platform/storage/common/storage.js";
import { IPreferencesService } from "../../../../../../services/preferences/common/preferences.js";
import { ITerminalChatService } from "../../../../../terminal/browser/terminal.js";
import { ChatContextKeys } from "../../../../common/actions/chatContextKeys.js";
import { migrateLegacyTerminalToolSpecificData } from "../../../../common/chat.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
import { AcceptToolConfirmationActionId, SkipToolConfirmationActionId } from "../../../actions/chatToolActions.js";
import { IChatWidgetService } from "../../../chat.js";
import { ChatCustomConfirmationWidget } from "../chatConfirmationWidget.js";
import { ChatMarkdownContentPart } from "../chatMarkdownContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
var TerminalToolConfirmationStorageKeys;
(function(TerminalToolConfirmationStorageKeys2) {
  TerminalToolConfirmationStorageKeys2["TerminalAutoApproveWarningAccepted"] = "chat.tools.terminal.autoApprove.warningAccepted";
})(TerminalToolConfirmationStorageKeys || (TerminalToolConfirmationStorageKeys = {}));
let ChatTerminalToolConfirmationSubPart = class ChatTerminalToolConfirmationSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatTerminalToolConfirmationSubPart");
  }
  constructor(toolInvocation, terminalData, context, renderer, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService, dialogService, keybindingService, modelService, languageService, configurationService, contextKeyService, chatWidgetService, preferencesService, storageService, terminalChatService, textModelService, hoverService) {
    super(toolInvocation);
    this.context = context;
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.keybindingService = keybindingService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.preferencesService = preferencesService;
    this.storageService = storageService;
    this.terminalChatService = terminalChatService;
    this.codeblocks = [];
    const state = toolInvocation.state.get();
    if (state.type !== 1 || !state.confirmationMessages?.title) {
      throw new Error("Confirmation messages are missing");
    }
    terminalData = migrateLegacyTerminalToolSpecificData(terminalData);
    const { title, message, disclaimer, terminalCustomActions } = state.confirmationMessages;
    const initialContent = terminalData.presentationOverrides?.commandLine ?? terminalData.confirmation?.commandLine ?? (terminalData.commandLine.toolEdited ?? terminalData.commandLine.original).trimStart();
    const cdPrefix = terminalData.confirmation?.cdPrefix ?? "";
    const isReadOnly = !!terminalData.presentationOverrides;
    const autoApproveEnabled = this.configurationService.getValue(
      "chat.tools.terminal.enableAutoApprove"
      /* TerminalContribSettingId.EnableAutoApprove */
    ) === true;
    const autoApproveWarningAccepted = this.storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted", -1, false);
    let moreActions = void 0;
    if (autoApproveEnabled) {
      moreActions = [];
      if (!autoApproveWarningAccepted) {
        moreActions.push({
          label: localize("autoApprove.enable", "Enable Auto Approve..."),
          data: {
            type: "enable"
          }
        });
        moreActions.push(new Separator());
        if (terminalCustomActions) {
          for (const action of terminalCustomActions) {
            if (!(action instanceof Separator)) {
              action.disabled = true;
            }
          }
        }
      }
      if (terminalCustomActions) {
        moreActions.push(...terminalCustomActions);
      }
      if (moreActions.length === 0) {
        moreActions = void 0;
      }
    }
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on",
        readOnly: isReadOnly,
        tabFocusMode: true,
        ariaLabel: typeof title === "string" ? title : title.value
      }
    };
    const languageId = this.languageService.getLanguageIdByLanguageName(terminalData.presentationOverrides?.language ?? terminalData.language ?? "sh") ?? "shellscript";
    const model = this._register(this.modelService.createModel(initialContent, this.languageService.createById(languageId), this._getUniqueCodeBlockUri(), true));
    thenRegisterOrDispose(textModelService.createModelReference(model.uri), this._store);
    const editor = this._register(this.editorPool.get());
    editor.object.render({
      codeBlockIndex: this.codeBlockStartIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      languageId,
      renderOptions: codeBlockRenderOptions,
      textModel: Promise.resolve(model),
      chatSessionResource: this.context.element.sessionResource
    }, this.currentWidthDelegate());
    this.codeblocks.push({
      codeBlockIndex: this.codeBlockStartIndex,
      codemapperUri: void 0,
      elementId: this.context.element.id,
      focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
      ownerMarkdownPartId: this.codeblocksPartId,
      uri: model.uri,
      uriPromise: Promise.resolve(model.uri),
      chatSessionResource: this.context.element.sessionResource
    });
    this._register(model.onDidChangeContent((e) => {
      const currentValue = model.getValue();
      if (currentValue !== initialContent) {
        terminalData.commandLine.userEdited = cdPrefix + currentValue;
      } else {
        terminalData.commandLine.userEdited = void 0;
      }
    }));
    const elements = h(".chat-confirmation-message-terminal", [
      h(".chat-confirmation-message-terminal-editor@editor"),
      h(".chat-confirmation-message-terminal-disclaimer@disclaimer")
    ]);
    append(elements.editor, editor.object.element);
    this._register(hoverService.setupDelayedHover(elements.editor, {
      content: message || "",
      style: 1,
      position: {
        hoverPosition: 0
        /* HoverPosition.LEFT */
      }
    }));
    const confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, this.context, {
      title,
      icon: Codicon.terminal,
      message: elements.root,
      buttons: this._createButtons(moreActions)
    }));
    if (disclaimer) {
      this._appendMarkdownPart(elements.disclaimer, disclaimer, codeBlockRenderOptions);
    }
    const hasToolConfirmationKey = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmationKey.set(true);
    this._register(toDisposable(() => hasToolConfirmationKey.reset()));
    this._register(confirmWidget.onDidClick(async (button) => {
      let doComplete = true;
      const data = button.data;
      let toolConfirmKind = 0;
      if (typeof data === "boolean") {
        if (data) {
          toolConfirmKind = 4;
          if (terminalData.autoApproveInfo) {
            terminalData.autoApproveInfo = void 0;
          }
        }
      } else if (typeof data !== "boolean") {
        switch (data.type) {
          case "enable": {
            const optedIn = await this._showAutoApproveWarning();
            if (optedIn) {
              this.storageService.store(
                "chat.tools.terminal.autoApprove.warningAccepted",
                true,
                -1,
                0
                /* StorageTarget.USER */
              );
              if (terminalData.autoApproveInfo) {
                toolConfirmKind = 4;
              } else if (terminalCustomActions) {
                for (const action of terminalCustomActions) {
                  if (!(action instanceof Separator)) {
                    action.disabled = false;
                  }
                }
                confirmWidget.updateButtons(this._createButtons(terminalCustomActions));
                doComplete = false;
              }
            } else {
              doComplete = false;
            }
            break;
          }
          case "skip": {
            toolConfirmKind = 5;
            break;
          }
          case "newRule": {
            let formatRuleLinks2 = function(rules, scope) {
              return rules.map((e) => {
                if (scope === "session") {
                  return `\`${e.key}\``;
                }
                const target = scope === "workspace" ? 5 : 2;
                const settingsUri = createCommandUri("workbench.action.terminal.chat.openTerminalSettingsLink", target);
                return `[\`${e.key}\`](${settingsUri.toString()} "${localize("ruleTooltip", "View rule in settings")}")`;
              }).join(", ");
            };
            var formatRuleLinks = formatRuleLinks2;
            __name(formatRuleLinks2, "formatRuleLinks");
            const newRules = asArray(data.rule);
            const sessionRules = newRules.filter((r) => r.scope === "session");
            const workspaceRules = newRules.filter((r) => r.scope === "workspace");
            const userRules = newRules.filter((r) => r.scope === "user");
            const chatSessionResource = this.context.element.sessionResource;
            for (const rule of sessionRules) {
              this.terminalChatService.addSessionAutoApproveRule(chatSessionResource, rule.key, rule.value);
            }
            if (workspaceRules.length > 0) {
              const inspect = this.configurationService.inspect(
                "chat.tools.terminal.autoApprove"
                /* TerminalContribSettingId.AutoApprove */
              );
              const oldValue = inspect.workspaceValue ?? {};
              if (isObject(oldValue)) {
                const newValue = { ...oldValue };
                for (const rule of workspaceRules) {
                  newValue[rule.key] = rule.value;
                }
                await this.configurationService.updateValue(
                  "chat.tools.terminal.autoApprove",
                  newValue,
                  5
                  /* ConfigurationTarget.WORKSPACE */
                );
              } else {
                this.preferencesService.openSettings({
                  jsonEditor: true,
                  target: 5,
                  revealSetting: {
                    key: "chat.tools.terminal.autoApprove"
                    /* TerminalContribSettingId.AutoApprove */
                  }
                });
                throw new ErrorNoTelemetry(`Cannot add new rule, existing workspace setting is unexpected format`);
              }
            }
            if (userRules.length > 0) {
              const inspect = this.configurationService.inspect(
                "chat.tools.terminal.autoApprove"
                /* TerminalContribSettingId.AutoApprove */
              );
              const oldValue = inspect.userValue ?? {};
              if (isObject(oldValue)) {
                const newValue = { ...oldValue };
                for (const rule of userRules) {
                  newValue[rule.key] = rule.value;
                }
                await this.configurationService.updateValue(
                  "chat.tools.terminal.autoApprove",
                  newValue,
                  2
                  /* ConfigurationTarget.USER */
                );
              } else {
                this.preferencesService.openSettings({
                  jsonEditor: true,
                  target: 2,
                  revealSetting: {
                    key: "chat.tools.terminal.autoApprove"
                    /* TerminalContribSettingId.AutoApprove */
                  }
                });
                throw new ErrorNoTelemetry(`Cannot add new rule, existing setting is unexpected format`);
              }
            }
            const mdTrustSettings = {
              isTrusted: {
                enabledCommands: [
                  "workbench.action.terminal.chat.openTerminalSettingsLink"
                  /* TerminalContribCommandId.OpenTerminalSettingsLink */
                ]
              }
            };
            const parts = [];
            if (sessionRules.length > 0) {
              parts.push(sessionRules.length === 1 ? localize("newRule.session", "Session auto approve rule {0} added", formatRuleLinks2(sessionRules, "session")) : localize("newRule.session.plural", "Session auto approve rules {0} added", formatRuleLinks2(sessionRules, "session")));
            }
            if (workspaceRules.length > 0) {
              parts.push(workspaceRules.length === 1 ? localize("newRule.workspace", "Workspace auto approve rule {0} added", formatRuleLinks2(workspaceRules, "workspace")) : localize("newRule.workspace.plural", "Workspace auto approve rules {0} added", formatRuleLinks2(workspaceRules, "workspace")));
            }
            if (userRules.length > 0) {
              parts.push(userRules.length === 1 ? localize("newRule.user", "User auto approve rule {0} added", formatRuleLinks2(userRules, "user")) : localize("newRule.user.plural", "User auto approve rules {0} added", formatRuleLinks2(userRules, "user")));
            }
            if (parts.length > 0) {
              terminalData.autoApproveInfo = new MarkdownString(parts.join(", "), mdTrustSettings);
            }
            toolConfirmKind = 4;
            break;
          }
          case "configure": {
            this.preferencesService.openSettings({
              target: 2,
              query: `@id:${"chat.tools.terminal.autoApprove"}`
            });
            doComplete = false;
            break;
          }
          case "sessionApproval": {
            const sessionResource = this.context.element.sessionResource;
            this.terminalChatService.setChatSessionAutoApproval(sessionResource, true);
            const disableUri = createCommandUri("workbench.action.terminal.chat.disableSessionAutoApproval", sessionResource);
            const mdTrustSettings = {
              isTrusted: {
                enabledCommands: [
                  "workbench.action.terminal.chat.disableSessionAutoApproval"
                  /* TerminalContribCommandId.DisableSessionAutoApproval */
                ]
              }
            };
            terminalData.autoApproveInfo = new MarkdownString(`${localize("sessionApproval", "All commands will be auto approved for this session")} ([${localize("sessionApproval.disable", "Disable")}](${disableUri.toString()}))`, mdTrustSettings);
            toolConfirmKind = 4;
            break;
          }
        }
      }
      if (doComplete) {
        IChatToolInvocation.confirmWith(toolInvocation, { type: toolConfirmKind });
        this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
      }
    }));
    this.domNode = confirmWidget.domNode;
  }
  _createButtons(moreActions) {
    const getLabelAndTooltip = /* @__PURE__ */ __name((label, actionId, tooltipDetail = label) => {
      const tooltip = this.keybindingService.appendKeybinding(tooltipDetail, actionId);
      return { label, tooltip };
    }, "getLabelAndTooltip");
    return [
      {
        ...getLabelAndTooltip(localize("tool.allow", "Allow"), AcceptToolConfirmationActionId),
        data: true,
        moreActions
      },
      {
        ...getLabelAndTooltip(localize("tool.skip", "Skip"), SkipToolConfirmationActionId, localize("skip.detail", "Proceed without executing this command")),
        data: { type: "skip" },
        isSecondary: true
      }
    ];
  }
  async _showAutoApproveWarning() {
    const promptResult = await this.dialogService.prompt({
      type: Severity.Info,
      message: localize("autoApprove.title", "Enable terminal auto approve?"),
      buttons: [{
        label: localize("autoApprove.button.enable", "Enable"),
        run: /* @__PURE__ */ __name(() => true, "run")
      }],
      cancelButton: true,
      custom: {
        icon: Codicon.shield,
        markdownDetails: [{
          markdown: new MarkdownString(localize("autoApprove.markdown", "This will enable a configurable subset of commands to run in the terminal autonomously. It provides *best effort protections* and assumes the agent is not acting maliciously."))
        }, {
          markdown: new MarkdownString(`[${localize("autoApprove.markdown2", "Learn more about the potential risks and how to avoid them.")}](https://code.visualstudio.com/docs/copilot/security#_security-considerations)`)
        }]
      }
    });
    return promptResult.result === true;
  }
  _getUniqueCodeBlockUri() {
    return URI.from({
      scheme: Schemas.vscodeChatCodeBlock,
      path: generateUuid()
    });
  }
  _appendMarkdownPart(container, message, codeBlockRenderOptions) {
    const part = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, {
      kind: "markdownContent",
      content: typeof message === "string" ? new MarkdownString().appendMarkdown(message) : message
    }, this.context, this.editorPool, false, this.codeBlockStartIndex, this.renderer, void 0, this.currentWidthDelegate(), this.codeBlockModelCollection, { codeBlockRenderOptions }));
    append(container, part.domNode);
  }
};
ChatTerminalToolConfirmationSubPart = __decorate([
  __param(8, IInstantiationService),
  __param(9, IDialogService),
  __param(10, IKeybindingService),
  __param(11, IModelService),
  __param(12, ILanguageService),
  __param(13, IConfigurationService),
  __param(14, IContextKeyService),
  __param(15, IChatWidgetService),
  __param(16, IPreferencesService),
  __param(17, IStorageService),
  __param(18, ITerminalChatService),
  __param(19, ITextModelService),
  __param(20, IHoverService)
], ChatTerminalToolConfirmationSubPart);
export {
  ChatTerminalToolConfirmationSubPart,
  TerminalToolConfirmationStorageKeys
};
//# sourceMappingURL=chatTerminalToolConfirmationSubPart.js.map
