var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceCancellation } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { CancellationError } from "../../../base/common/errors.js";
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { IPreparedToolInvocation, isToolInvocationContext, IToolInvocation, IToolInvocationContext, IToolResult } from "../../contrib/chat/common/languageModelToolsService.js";
import { checkProposedApiEnabled, isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { ExtHostLanguageModelToolsShape, IMainContext, IToolDataDto, MainContext, MainThreadLanguageModelToolsShape } from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
import { InternalFetchWebPageToolId, IToolInputProcessor } from "../../contrib/chat/common/tools/tools.js";
import { EditToolData, InternalEditToolId, EditToolInputProcessor, ExtensionEditToolId } from "../../contrib/chat/common/tools/editFileTool.js";
import { Dto } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostLanguageModels } from "./extHostLanguageModels.js";
class ExtHostLanguageModelTools {
  constructor(mainContext, _languageModels) {
    this._languageModels = _languageModels;
    this._proxy = mainContext.getProxy(MainContext.MainThreadLanguageModelTools);
    this._proxy.$getTools().then((tools) => {
      for (const tool of tools) {
        this._allTools.set(tool.id, revive(tool));
      }
    });
    this._toolInputProcessors.set(EditToolData.id, new EditToolInputProcessor());
  }
  static {
    __name(this, "ExtHostLanguageModelTools");
  }
  /** A map of tools that were registered in this EH */
  _registeredTools = /* @__PURE__ */ new Map();
  _proxy;
  _tokenCountFuncs = /* @__PURE__ */ new Map();
  /** A map of all known tools, from other EHs or registered in vscode core */
  _allTools = /* @__PURE__ */ new Map();
  _toolInputProcessors = /* @__PURE__ */ new Map();
  async $countTokensForInvocation(callId, input, token) {
    const fn = this._tokenCountFuncs.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return await fn(input, token);
  }
  async invokeTool(extension, toolId, options, token) {
    const callId = generateUuid();
    if (options.tokenizationOptions) {
      this._tokenCountFuncs.set(callId, options.tokenizationOptions.countTokens);
    }
    try {
      if (options.toolInvocationToken && !isToolInvocationContext(options.toolInvocationToken)) {
        throw new Error(`Invalid tool invocation token`);
      }
      if ((toolId === InternalEditToolId || toolId === ExtensionEditToolId) && !isProposedApiEnabled(extension, "chatParticipantPrivate")) {
        throw new Error(`Invalid tool: ${toolId}`);
      }
      const processedInput = this._toolInputProcessors.get(toolId)?.processInput(options.input) ?? options.input;
      const result = await this._proxy.$invokeTool({
        toolId,
        callId,
        parameters: processedInput,
        tokenBudget: options.tokenizationOptions?.tokenBudget,
        context: options.toolInvocationToken,
        chatRequestId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options.chatRequestId : void 0,
        chatInteractionId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options.chatInteractionId : void 0
      }, token);
      return typeConvert.LanguageModelToolResult.to(revive(result));
    } finally {
      this._tokenCountFuncs.delete(callId);
    }
  }
  $onDidChangeTools(tools) {
    this._allTools.clear();
    for (const tool of tools) {
      this._allTools.set(tool.id, tool);
    }
  }
  getTools(extension) {
    return Array.from(this._allTools.values()).map((tool) => typeConvert.LanguageModelToolDescription.to(tool)).filter((tool) => {
      switch (tool.name) {
        case InternalEditToolId:
        case ExtensionEditToolId:
        case InternalFetchWebPageToolId:
          return isProposedApiEnabled(extension, "chatParticipantPrivate");
        default:
          return true;
      }
    });
  }
  async $invokeTool(dto, token) {
    const item = this._registeredTools.get(dto.toolId);
    if (!item) {
      throw new Error(`Unknown tool ${dto.toolId}`);
    }
    const options = {
      input: dto.parameters,
      toolInvocationToken: dto.context
    };
    if (isProposedApiEnabled(item.extension, "chatParticipantPrivate")) {
      options.chatRequestId = dto.chatRequestId;
      options.chatInteractionId = dto.chatInteractionId;
      options.chatSessionId = dto.context?.sessionId;
      if (dto.toolSpecificData?.kind === "terminal") {
        options.terminalCommand = dto.toolSpecificData.command;
      }
    }
    if (isProposedApiEnabled(item.extension, "chatParticipantAdditions") && dto.modelId) {
      options.model = await this.getModel(dto.modelId, item.extension);
    }
    if (dto.tokenBudget !== void 0) {
      options.tokenizationOptions = {
        tokenBudget: dto.tokenBudget,
        countTokens: this._tokenCountFuncs.get(dto.callId) || ((value, token2 = CancellationToken.None) => this._proxy.$countTokensForInvocation(dto.callId, value, token2))
      };
    }
    const extensionResult = await raceCancellation(Promise.resolve(item.tool.invoke(options, token)), token);
    if (!extensionResult) {
      throw new CancellationError();
    }
    return typeConvert.LanguageModelToolResult.from(extensionResult, item.extension);
  }
  async getModel(modelId, extension) {
    let model;
    if (modelId) {
      model = await this._languageModels.getLanguageModelByIdentifier(extension, modelId);
    }
    if (!model) {
      model = await this._languageModels.getDefaultLanguageModel(extension);
      if (!model) {
        throw new Error("Language model unavailable");
      }
    }
    return model;
  }
  async $prepareToolInvocation(toolId, input, token) {
    const item = this._registeredTools.get(toolId);
    if (!item) {
      throw new Error(`Unknown tool ${toolId}`);
    }
    const options = { input };
    if (isProposedApiEnabled(item.extension, "chatParticipantPrivate") && item.tool.prepareInvocation2) {
      const result = await item.tool.prepareInvocation2(options, token);
      if (!result) {
        return void 0;
      }
      return {
        confirmationMessages: result.confirmationMessages ? {
          title: result.confirmationMessages.title,
          message: typeof result.confirmationMessages.message === "string" ? result.confirmationMessages.message : typeConvert.MarkdownString.from(result.confirmationMessages.message)
        } : void 0,
        toolSpecificData: {
          kind: "terminal",
          language: result.language,
          command: result.command
        }
      };
    } else if (item.tool.prepareInvocation) {
      const result = await item.tool.prepareInvocation(options, token);
      if (!result) {
        return void 0;
      }
      if (result.pastTenseMessage || result.presentation) {
        checkProposedApiEnabled(item.extension, "chatParticipantPrivate");
      }
      return {
        confirmationMessages: result.confirmationMessages ? {
          title: result.confirmationMessages.title,
          message: typeof result.confirmationMessages.message === "string" ? result.confirmationMessages.message : typeConvert.MarkdownString.from(result.confirmationMessages.message)
        } : void 0,
        invocationMessage: typeConvert.MarkdownString.fromStrict(result.invocationMessage),
        pastTenseMessage: typeConvert.MarkdownString.fromStrict(result.pastTenseMessage),
        presentation: result.presentation
      };
    }
    return void 0;
  }
  registerTool(extension, id, tool) {
    this._registeredTools.set(id, { extension, tool });
    this._proxy.$registerTool(id);
    return toDisposable(() => {
      this._registeredTools.delete(id);
      this._proxy.$unregisterTool(id);
    });
  }
}
export {
  ExtHostLanguageModelTools
};
//# sourceMappingURL=extHostLanguageModelTools.js.map
