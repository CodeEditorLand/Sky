var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertDefined } from "../../../../../base/common/types.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { chatSubcommandLeader } from "../../common/chatParserTypes.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { PROMPT_LANGUAGE_ID } from "../../common/promptSyntax/promptTypes.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
const SAVE_TO_PROMPT_ACTION_ID = "workbench.action.chat.save-to-prompt";
const SAVE_TO_PROMPT_SLASH_COMMAND_NAME = "save";
class SaveToPromptAction extends Action2 {
  static {
    __name(this, "SaveToPromptAction");
  }
  constructor() {
    super({
      id: SAVE_TO_PROMPT_ACTION_ID,
      title: localize2("workbench.actions.save-to-prompt.label", "Save chat session to a prompt file"),
      f1: false,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, options) {
    const logService = accessor.get(ILogService);
    const editorService = accessor.get(IEditorService);
    const toolsService = accessor.get(ILanguageModelToolsService);
    const logPrefix = "save to prompt";
    const { chat } = options;
    const { viewModel } = chat;
    assertDefined(viewModel, "No view model found on currently the active chat widget.");
    const { model } = viewModel;
    const turns = [];
    for (const request of model.getRequests()) {
      const { message, response: responseModel } = request;
      if (isSaveToPromptSlashCommand(message)) {
        continue;
      }
      if (responseModel === void 0) {
        logService.warn(`[${logPrefix}]: skipping request '${request.id}' with no response`);
        continue;
      }
      const { response } = responseModel;
      const tools = /* @__PURE__ */ new Set();
      for (const record of response.value) {
        if ("toolId" in record === false || !record.toolId) {
          continue;
        }
        const tool = toolsService.getTool(record.toolId);
        if (tool === void 0 || !tool.toolReferenceName) {
          continue;
        }
        tools.add(tool.toolReferenceName);
      }
      turns.push({
        request: message.text,
        response: response.getMarkdown(),
        tools
      });
    }
    const promptText = renderPrompt(turns);
    const editor = await editorService.openEditor({
      resource: void 0,
      contents: promptText,
      languageId: PROMPT_LANGUAGE_ID
    });
    assertDefined(editor, "Failed to open untitled editor for the prompt.");
    editor.focus();
    return editor;
  }
}
function isSaveToPromptSlashCommand(message) {
  const { parts } = message;
  if (parts.length < 1) {
    return false;
  }
  const firstPart = parts[0];
  if (firstPart.kind !== "slash") {
    return false;
  }
  if (firstPart.text !== `${chatSubcommandLeader}${SAVE_TO_PROMPT_SLASH_COMMAND_NAME}`) {
    return false;
  }
  return true;
}
__name(isSaveToPromptSlashCommand, "isSaveToPromptSlashCommand");
function renderResponse(response) {
  const delimiter = response.startsWith("```") ? "\n>" : " ";
  const quotedResponse = response.replaceAll("\n", "\n> ");
  return `> Copilot:${delimiter}${quotedResponse}`;
}
__name(renderResponse, "renderResponse");
function renderTurn(turn) {
  const { request, response } = turn;
  return `
${request}

${renderResponse(response)}`;
}
__name(renderTurn, "renderTurn");
function renderPrompt(turns) {
  const content = [];
  const allTools = /* @__PURE__ */ new Set();
  for (const turn of turns) {
    content.push(renderTurn(turn));
    for (const tool of turn.tools) {
      allTools.add(tool);
    }
  }
  const result = [];
  if (allTools.size !== 0) {
    result.push(renderHeader(allTools));
  }
  result.push(content.join("\n"));
  result.push("");
  return result.join("\n");
}
__name(renderPrompt, "renderPrompt");
function renderTools(tools) {
  const toolStrings = [...tools].map((tool) => {
    return `'${tool}'`;
  });
  return `tools: [${toolStrings.join(", ")}]`;
}
__name(renderTools, "renderTools");
function renderHeader(tools) {
  if (tools.size === 0) {
    return "";
  }
  return [
    "---",
    renderTools(tools),
    "---"
  ].join("\n");
}
__name(renderHeader, "renderHeader");
function runSaveToPromptAction(options, commandService) {
  return commandService.executeCommand(SAVE_TO_PROMPT_ACTION_ID, options);
}
__name(runSaveToPromptAction, "runSaveToPromptAction");
function registerSaveToPromptActions() {
  registerAction2(SaveToPromptAction);
}
__name(registerSaveToPromptActions, "registerSaveToPromptActions");
export {
  SAVE_TO_PROMPT_SLASH_COMMAND_NAME,
  registerSaveToPromptActions,
  runSaveToPromptAction
};
//# sourceMappingURL=saveToPromptAction.js.map
