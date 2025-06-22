var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceCancellation } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { CancellationError } from "../../../base/common/errors.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { isToolInvocationContext } from "../../contrib/chat/common/languageModelToolsService.js";
import { ExtensionEditToolId, InternalEditToolId } from "../../contrib/chat/common/tools/editFileTool.js";
import { InternalFetchWebPageToolId } from "../../contrib/chat/common/tools/tools.js";
import { checkProposedApiEnabled, isProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { MainContext } from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
import { SearchExtensionsToolId } from "../../contrib/extensions/common/searchExtensionsTool.js";
class Tool {
  static {
    __name(this, "Tool");
  }
  constructor(data) {
    this._data = data;
  }
  update(newData) {
    this._data = newData;
  }
  get data() {
    return this._data;
  }
  get apiObject() {
    if (!this._apiObject) {
      const that = this;
      this._apiObject = Object.freeze({
        get name() {
          return that._data.id;
        },
        get description() {
          return that._data.modelDescription;
        },
        get inputSchema() {
          return that._data.inputSchema;
        },
        get tags() {
          return that._data.tags ?? [];
        }
      });
    }
    return this._apiObject;
  }
}
class ExtHostLanguageModelTools {
  static {
    __name(this, "ExtHostLanguageModelTools");
  }
  constructor(mainContext, _languageModels) {
    this._languageModels = _languageModels;
    this._registeredTools = /* @__PURE__ */ new Map();
    this._tokenCountFuncs = /* @__PURE__ */ new Map();
    this._allTools = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadLanguageModelTools);
    this._proxy.$getTools().then((tools) => {
      for (const tool of tools) {
        this._allTools.set(tool.id, new Tool(revive(tool)));
      }
    });
  }
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
      const result = await this._proxy.$invokeTool({
        toolId,
        callId,
        parameters: options.input,
        tokenBudget: options.tokenizationOptions?.tokenBudget,
        context: options.toolInvocationToken,
        chatRequestId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options.chatRequestId : void 0,
        chatInteractionId: isProposedApiEnabled(extension, "chatParticipantPrivate") ? options.chatInteractionId : void 0
      }, token);
      const dto = result instanceof SerializableObjectWithBuffers ? result.value : result;
      return typeConvert.LanguageModelToolResult2.to(revive(dto));
    } finally {
      this._tokenCountFuncs.delete(callId);
    }
  }
  $onDidChangeTools(tools) {
    const oldTools = new Set(this._registeredTools.keys());
    for (const tool of tools) {
      oldTools.delete(tool.id);
      const existing = this._allTools.get(tool.id);
      if (existing) {
        existing.update(tool);
      } else {
        this._allTools.set(tool.id, new Tool(revive(tool)));
      }
    }
    for (const id of oldTools) {
      this._allTools.delete(id);
    }
  }
  getTools(extension) {
    return Array.from(this._allTools.values()).map((tool) => tool.apiObject).filter((tool) => {
      switch (tool.name) {
        case InternalEditToolId:
        case ExtensionEditToolId:
        case InternalFetchWebPageToolId:
        case SearchExtensionsToolId:
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
    let progress;
    if (isProposedApiEnabled(item.extension, "toolProgress")) {
      progress = {
        report: /* @__PURE__ */ __name((value) => {
          this._proxy.$acceptToolProgress(dto.callId, {
            message: typeConvert.MarkdownString.fromStrict(value.message),
            increment: value.increment,
            total: 100
          });
        }, "report")
      };
    }
    const extensionResult = await raceCancellation(Promise.resolve(item.tool.invoke(options, token, progress)), token);
    if (!extensionResult) {
      throw new CancellationError();
    }
    return typeConvert.LanguageModelToolResult2.from(extensionResult, item.extension);
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
          title: typeof result.confirmationMessages.title === "string" ? result.confirmationMessages.title : typeConvert.MarkdownString.from(result.confirmationMessages.title),
          message: typeof result.confirmationMessages.message === "string" ? result.confirmationMessages.message : typeConvert.MarkdownString.from(result.confirmationMessages.message)
        } : void 0,
        toolSpecificData: {
          kind: "terminal",
          language: result.language,
          command: result.command
        },
        presentation: result.presentation
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
          title: typeof result.confirmationMessages.title === "string" ? result.confirmationMessages.title : typeConvert.MarkdownString.from(result.confirmationMessages.title),
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
