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
var InputEditorDecorations_1;
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { Disposable, MutableDisposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../../base/common/observable.js";
import { themeColorFromId } from "../../../../../../../base/common/themables.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../../../../editor/common/core/range.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../../../platform/label/common/label.js";
import { inputPlaceholderForeground } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.js";
import { IChatAgentService } from "../../../../common/participants/chatAgents.js";
import { chatSlashCommandBackground, chatSlashCommandForeground } from "../../../../common/widget/chatColors.js";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestToolSetPart, chatAgentLeader, chatSubcommandLeader } from "../../../../common/requestParser/chatParserTypes.js";
import { ChatRequestParser } from "../../../../common/requestParser/chatRequestParser.js";
import { getDynamicVariablesForWidget, getSelectedToolAndToolSetsForWidget } from "../../../attachments/chatVariables.js";
import { IPromptsService } from "../../../../common/promptSyntax/service/promptsService.js";
import { ChatWidget } from "../../chatWidget.js";
import { dynamicVariableDecorationType } from "../../../attachments/chatDynamicVariables.js";
import { NativeEditContextRegistry } from "../../../../../../../editor/browser/controller/editContext/native/nativeEditContextRegistry.js";
import { TextAreaEditContextRegistry } from "../../../../../../../editor/browser/controller/editContext/textArea/textAreaEditContextRegistry.js";
import { ThrottledDelayer } from "../../../../../../../base/common/async.js";
const decorationDescription = "chat";
const placeholderDecorationType = "chat-session-detail";
const slashCommandTextDecorationType = "chat-session-text";
const variableTextDecorationType = "chat-variable-text";
function agentAndCommandToKey(agent, subcommand) {
  return subcommand ? `${agent.id}__${subcommand}` : agent.id;
}
__name(agentAndCommandToKey, "agentAndCommandToKey");
function isWhitespaceOrPromptPart(p) {
  return p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestSlashPromptPart;
}
__name(isWhitespaceOrPromptPart, "isWhitespaceOrPromptPart");
function exactlyOneSpaceAfterPart(parsedRequest, part) {
  const partIdx = parsedRequest.indexOf(part);
  if (parsedRequest.length > partIdx + 2) {
    return false;
  }
  const nextPart = parsedRequest[partIdx + 1];
  return nextPart && nextPart instanceof ChatRequestTextPart && nextPart.text === " ";
}
__name(exactlyOneSpaceAfterPart, "exactlyOneSpaceAfterPart");
function getRangeForPlaceholder(part) {
  return {
    startLineNumber: part.editorRange.startLineNumber,
    endLineNumber: part.editorRange.endLineNumber,
    startColumn: part.editorRange.endColumn + 1,
    endColumn: 1e3
  };
}
__name(getRangeForPlaceholder, "getRangeForPlaceholder");
let InputEditorDecorations = class InputEditorDecorations2 extends Disposable {
  static {
    __name(this, "InputEditorDecorations");
  }
  static {
    InputEditorDecorations_1 = this;
  }
  static {
    this.UPDATE_DELAY = 200;
  }
  constructor(widget, codeEditorService, themeService, chatAgentService, labelService, promptsService) {
    super();
    this.widget = widget;
    this.codeEditorService = codeEditorService;
    this.themeService = themeService;
    this.chatAgentService = chatAgentService;
    this.labelService = labelService;
    this.promptsService = promptsService;
    this.id = "inputEditorDecorations";
    this.previouslyUsedAgents = /* @__PURE__ */ new Set();
    this.viewModelDisposables = this._register(new MutableDisposable());
    this.updateThrottle = this._register(new ThrottledDelayer(InputEditorDecorations_1.UPDATE_DELAY));
    this.registeredDecorationTypes();
    this.triggerInputEditorDecorationsUpdate();
    this._register(this.widget.inputEditor.onDidChangeModelContent(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.widget.onDidChangeParsedInput(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.widget.onDidChangeViewModel(() => {
      this.registerViewModelListeners();
      this.previouslyUsedAgents.clear();
      this.triggerInputEditorDecorationsUpdate();
    }));
    this._register(this.widget.onDidSubmitAgent((e) => {
      this.previouslyUsedAgents.add(agentAndCommandToKey(e.agent, e.slashCommand?.name));
    }));
    this._register(this.chatAgentService.onDidChangeAgents(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(autorun((reader) => {
      const currentMode = this.widget.input.currentModeObs.read(reader);
      if (currentMode) {
        currentMode.description.read(reader);
      }
      this.triggerInputEditorDecorationsUpdate();
    }));
    this.registerViewModelListeners();
  }
  registerViewModelListeners() {
    this.viewModelDisposables.value = this.widget.viewModel?.onDidChange((e) => {
      if (e?.kind === "changePlaceholder" || e?.kind === "initialize") {
        this.triggerInputEditorDecorationsUpdate();
      }
    });
  }
  registeredDecorationTypes() {
    this._register(this.codeEditorService.registerDecorationType(decorationDescription, placeholderDecorationType, {}));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription, slashCommandTextDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px"
    }));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription, variableTextDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px"
    }));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription, dynamicVariableDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px",
      rangeBehavior: 1
      /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
    }));
  }
  getPlaceholderColor() {
    const theme = this.themeService.getColorTheme();
    const transparentForeground = theme.getColor(inputPlaceholderForeground);
    return transparentForeground?.toString();
  }
  triggerInputEditorDecorationsUpdate() {
    this.updateInputPlaceholderDecoration();
    this.updateThrottle.trigger((token) => this.updateAsyncInputEditorDecorations(token));
  }
  updateInputPlaceholderDecoration() {
    const inputValue = this.widget.inputEditor.getValue();
    const viewModel = this.widget.viewModel;
    if (!viewModel) {
      this.updateAriaPlaceholder(void 0);
      return;
    }
    if (!inputValue) {
      const mode = this.widget.input.currentModeObs.get();
      const placeholder = mode.argumentHint?.get() ?? mode.description.get() ?? "";
      const displayPlaceholder = viewModel.inputPlaceholder || placeholder;
      const decoration = [
        {
          range: {
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: 1e3
          },
          renderOptions: {
            after: {
              contentText: displayPlaceholder,
              color: this.getPlaceholderColor()
            }
          }
        }
      ];
      this.updateAriaPlaceholder(displayPlaceholder || void 0);
      this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, decoration);
      return;
    }
    this.updateAriaPlaceholder(void 0);
    const parsedRequest = this.widget.parsedInput.parts;
    let placeholderDecoration;
    const agentPart = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
    const agentSubcommandPart = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart);
    const onlyAgentAndWhitespace = agentPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentPart);
    if (onlyAgentAndWhitespace) {
      const isFollowupSlashCommand = this.previouslyUsedAgents.has(agentAndCommandToKey(agentPart.agent, void 0));
      const shouldRenderFollowupPlaceholder = isFollowupSlashCommand && agentPart.agent.metadata.followupPlaceholder;
      if (agentPart.agent.description && exactlyOneSpaceAfterPart(parsedRequest, agentPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentPart),
          renderOptions: {
            after: {
              contentText: shouldRenderFollowupPlaceholder ? agentPart.agent.metadata.followupPlaceholder : agentPart.agent.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    const onlyAgentAndAgentCommandAndWhitespace = agentPart && agentSubcommandPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentPart || p instanceof ChatRequestAgentSubcommandPart);
    if (onlyAgentAndAgentCommandAndWhitespace) {
      const isFollowupSlashCommand = this.previouslyUsedAgents.has(agentAndCommandToKey(agentPart.agent, agentSubcommandPart.command.name));
      const shouldRenderFollowupPlaceholder = isFollowupSlashCommand && agentSubcommandPart.command.followupPlaceholder;
      if (agentSubcommandPart?.command.description && exactlyOneSpaceAfterPart(parsedRequest, agentSubcommandPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentSubcommandPart),
          renderOptions: {
            after: {
              contentText: shouldRenderFollowupPlaceholder ? agentSubcommandPart.command.followupPlaceholder : agentSubcommandPart.command.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    const onlyAgentCommandAndWhitespace = agentSubcommandPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentSubcommandPart);
    if (onlyAgentCommandAndWhitespace) {
      if (agentSubcommandPart?.command.description && exactlyOneSpaceAfterPart(parsedRequest, agentSubcommandPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentSubcommandPart),
          renderOptions: {
            after: {
              contentText: agentSubcommandPart.command.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, placeholderDecoration ?? []);
  }
  async updateAsyncInputEditorDecorations(token) {
    const parsedRequest = this.widget.parsedInput.parts;
    const agentPart = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
    const agentSubcommandPart = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart);
    const slashCommandPart = parsedRequest.find((p) => p instanceof ChatRequestSlashCommandPart);
    const slashPromptPart = parsedRequest.find((p) => p instanceof ChatRequestSlashPromptPart);
    const promptSlashCommand = slashPromptPart ? await this.promptsService.resolvePromptSlashCommand(slashPromptPart.name, token) : void 0;
    if (token.isCancellationRequested) {
      return;
    }
    if (slashPromptPart && promptSlashCommand) {
      const onlyPromptCommandAndWhitespace = slashPromptPart && parsedRequest.every(isWhitespaceOrPromptPart);
      if (onlyPromptCommandAndWhitespace && exactlyOneSpaceAfterPart(parsedRequest, slashPromptPart) && promptSlashCommand) {
        const description = promptSlashCommand.argumentHint ?? promptSlashCommand.description;
        if (description) {
          this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, [{
            range: getRangeForPlaceholder(slashPromptPart),
            renderOptions: {
              after: {
                contentText: description,
                color: this.getPlaceholderColor()
              }
            }
          }]);
        }
      }
    }
    const textDecorations = [];
    if (agentPart) {
      textDecorations.push({ range: agentPart.editorRange });
    }
    if (agentSubcommandPart) {
      textDecorations.push({ range: agentSubcommandPart.editorRange, hoverMessage: new MarkdownString(agentSubcommandPart.command.description) });
    }
    if (slashCommandPart) {
      textDecorations.push({ range: slashCommandPart.editorRange });
    }
    if (slashPromptPart && promptSlashCommand) {
      textDecorations.push({ range: slashPromptPart.editorRange });
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription, slashCommandTextDecorationType, textDecorations);
    const varDecorations = [];
    const toolParts = parsedRequest.filter((p) => p instanceof ChatRequestToolPart || p instanceof ChatRequestToolSetPart);
    for (const tool of toolParts) {
      varDecorations.push({ range: tool.editorRange });
    }
    const dynamicVariableParts = parsedRequest.filter((p) => p instanceof ChatRequestDynamicVariablePart);
    const isEditingPreviousRequest = !!this.widget.viewModel?.editing;
    if (isEditingPreviousRequest) {
      for (const variable of dynamicVariableParts) {
        varDecorations.push({ range: variable.editorRange, hoverMessage: URI.isUri(variable.data) ? new MarkdownString(this.labelService.getUriLabel(variable.data, { relative: true })) : void 0 });
      }
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription, variableTextDecorationType, varDecorations);
  }
  updateAriaPlaceholder(value) {
    const nativeEditContext = NativeEditContextRegistry.get(this.widget.inputEditor.getId());
    if (nativeEditContext) {
      const domNode = nativeEditContext.domNode.domNode;
      if (value && value.trim().length) {
        domNode.setAttribute("aria-placeholder", value);
      } else {
        domNode.removeAttribute("aria-placeholder");
      }
    } else {
      const textAreaEditContext = TextAreaEditContextRegistry.get(this.widget.inputEditor.getId());
      if (textAreaEditContext) {
        const textArea = textAreaEditContext.textArea.domNode;
        if (value && value.trim().length) {
          textArea.setAttribute("aria-placeholder", value);
        } else {
          textArea.removeAttribute("aria-placeholder");
        }
      }
    }
  }
};
InputEditorDecorations = InputEditorDecorations_1 = __decorate([
  __param(1, ICodeEditorService),
  __param(2, IThemeService),
  __param(3, IChatAgentService),
  __param(4, ILabelService),
  __param(5, IPromptsService)
], InputEditorDecorations);
class InputEditorSlashCommandMode extends Disposable {
  static {
    __name(this, "InputEditorSlashCommandMode");
  }
  constructor(widget) {
    super();
    this.widget = widget;
    this.id = "InputEditorSlashCommandMode";
    this._register(this.widget.onDidChangeAgent((e) => {
      if (e.slashCommand && e.slashCommand.isSticky || !e.slashCommand && e.agent.metadata.isSticky) {
        this.repopulateAgentCommand(e.agent, e.slashCommand);
      }
    }));
    this._register(this.widget.onDidSubmitAgent((e) => {
      this.repopulateAgentCommand(e.agent, e.slashCommand);
    }));
  }
  async repopulateAgentCommand(agent, slashCommand) {
    if (this.widget.inputEditor.getValue().trim()) {
      return;
    }
    let value;
    if (slashCommand && slashCommand.isSticky) {
      value = `${chatAgentLeader}${agent.name} ${chatSubcommandLeader}${slashCommand.name} `;
    } else if (agent.metadata.isSticky) {
      value = `${chatAgentLeader}${agent.name} `;
    }
    if (value) {
      this.widget.inputEditor.setValue(value);
      this.widget.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
    }
  }
}
ChatWidget.CONTRIBS.push(InputEditorDecorations, InputEditorSlashCommandMode);
let ChatTokenDeleter = class ChatTokenDeleter2 extends Disposable {
  static {
    __name(this, "ChatTokenDeleter");
  }
  constructor(widget, instantiationService) {
    super();
    this.widget = widget;
    this.instantiationService = instantiationService;
    this.id = "chatTokenDeleter";
    const parser = this.instantiationService.createInstance(ChatRequestParser);
    const inputValue = this.widget.inputEditor.getValue();
    let previousInputValue;
    let previousSelectedAgent;
    this._register(this.widget.inputEditor.onDidChangeModelContent((e) => {
      if (!previousInputValue) {
        previousInputValue = inputValue;
        previousSelectedAgent = this.widget.lastSelectedAgent;
      }
      const change = e.changes[0];
      if (!change.text && this.widget.viewModel) {
        const attachmentCapabilities = previousSelectedAgent?.capabilities ?? this.widget.attachmentCapabilities;
        const previousParsedValue = parser.parseChatRequestWithReferences(getDynamicVariablesForWidget(this.widget), getSelectedToolAndToolSetsForWidget(this.widget), previousInputValue, this.widget.location, { selectedAgent: previousSelectedAgent, mode: this.widget.input.currentModeKind, attachmentCapabilities });
        const deletableTokens = previousParsedValue.parts.filter((p) => p instanceof ChatRequestAgentPart || p instanceof ChatRequestAgentSubcommandPart || p instanceof ChatRequestSlashCommandPart || p instanceof ChatRequestSlashPromptPart || p instanceof ChatRequestToolPart);
        deletableTokens.forEach((token) => {
          const deletedRangeOfToken = Range.intersectRanges(token.editorRange, change.range);
          if (deletedRangeOfToken && Range.compareRangesUsingStarts(token.editorRange, change.range) < 0) {
            if (previousInputValue && Range.isEmpty(deletedRangeOfToken)) {
              const deletedText = previousInputValue.substring(change.rangeOffset, change.rangeOffset + change.rangeLength);
              if (deletedText !== " ") {
                return;
              }
            }
            const length = deletedRangeOfToken.endColumn - deletedRangeOfToken.startColumn;
            const rangeToDelete = new Range(token.editorRange.startLineNumber, token.editorRange.startColumn, token.editorRange.endLineNumber, token.editorRange.endColumn - length);
            this.widget.inputEditor.executeEdits(this.id, [{
              range: rangeToDelete,
              text: ""
            }]);
            this.widget.refreshParsedInput();
          }
        });
      }
      previousInputValue = this.widget.inputEditor.getValue();
      previousSelectedAgent = this.widget.lastSelectedAgent;
    }));
  }
};
ChatTokenDeleter = __decorate([
  __param(1, IInstantiationService)
], ChatTokenDeleter);
ChatWidget.CONTRIBS.push(ChatTokenDeleter);
//# sourceMappingURL=chatInputEditorContrib.js.map
