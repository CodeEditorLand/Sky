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
import { asArray } from "../../../../base/common/arrays.js";
import { mapFindFirst } from "../../../../base/common/arraysFind.js";
import { Sequencer } from "../../../../base/common/async.js";
import { decodeBase64 } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { getConfigValueInTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { ChatAgentLocation, ChatConfiguration } from "../../chat/common/constants.js";
import { ILanguageModelsService } from "../../chat/common/languageModels.js";
import { mcpServerSamplingSection } from "./mcpConfiguration.js";
import { McpSamplingLog } from "./mcpSamplingLog.js";
import { McpError } from "./mcpTypes.js";
var ModelMatch;
(function(ModelMatch2) {
  ModelMatch2[ModelMatch2["UnsureAllowedDuringChat"] = 0] = "UnsureAllowedDuringChat";
  ModelMatch2[ModelMatch2["UnsureAllowedOutsideChat"] = 1] = "UnsureAllowedOutsideChat";
  ModelMatch2[ModelMatch2["NotAllowed"] = 2] = "NotAllowed";
  ModelMatch2[ModelMatch2["NoMatchingModel"] = 3] = "NoMatchingModel";
})(ModelMatch || (ModelMatch = {}));
let McpSamplingService = class McpSamplingService2 extends Disposable {
  static {
    __name(this, "McpSamplingService");
  }
  constructor(_languageModelsService, _configurationService, _dialogService, _notificationService, _commandService, instaService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._commandService = _commandService;
    this._sessionSets = {
      allowedDuringChat: /* @__PURE__ */ new Map(),
      allowedOutsideChat: /* @__PURE__ */ new Map()
    };
    this._modelSequencer = new Sequencer();
    this._logs = this._register(instaService.createInstance(McpSamplingLog));
  }
  async sample(opts, token = CancellationToken.None) {
    const messages = opts.params.messages.map((message) => {
      const content = asArray(message.content).map((part) => part.type === "text" ? { type: "text", value: part.text } : part.type === "image" || part.type === "audio" ? { type: "image_url", value: { mimeType: part.mimeType, data: decodeBase64(part.data) } } : void 0).filter(isDefined);
      if (!content.length) {
        return void 0;
      }
      return {
        role: message.role === "assistant" ? 2 : 1,
        content
      };
    }).filter(isDefined);
    if (opts.params.systemPrompt) {
      messages.unshift({ role: 0, content: [{ type: "text", value: opts.params.systemPrompt }] });
    }
    const model = await this._modelSequencer.queue(() => this._getMatchingModel(opts));
    const response = await this._languageModelsService.sendChatRequest(model, new ExtensionIdentifier("core"), messages, {}, token);
    let responseText = "";
    const streaming = (async () => {
      for await (const part of response.stream) {
        if (Array.isArray(part)) {
          for (const p of part) {
            if (p.type === "text") {
              responseText += p.value;
            }
          }
        } else if (part.type === "text") {
          responseText += part.value;
        }
      }
    })();
    try {
      await Promise.all([response.result, streaming]);
      this._logs.add(opts.server, opts.params.messages, responseText, model);
      return {
        sample: {
          model,
          content: { type: "text", text: responseText },
          role: "assistant"
          // it came from the model!
        }
      };
    } catch (err) {
      throw McpError.unknown(err);
    }
  }
  hasLogs(server) {
    return this._logs.has(server);
  }
  getLogText(server) {
    return this._logs.getAsText(server);
  }
  async _getMatchingModel(opts) {
    const model = await this._getMatchingModelInner(opts.server, opts.isDuringToolCall, opts.params.modelPreferences);
    const globalAutoApprove = this._configurationService.getValue(ChatConfiguration.GlobalAutoApprove);
    if (model === 0) {
      if (globalAutoApprove) {
        this._sessionSets.allowedDuringChat.set(opts.server.definition.id, true);
        return this._getMatchingModel(opts);
      }
      const retry = await this._showContextual(opts.isDuringToolCall, localize("mcp.sampling.allowDuringChat.title", 'Allow MCP tools from "{0}" to make LLM requests?', opts.server.definition.label), localize("mcp.sampling.allowDuringChat.desc", 'The MCP server "{0}" has issued a request to make a language model call. Do you want to allow it to make requests during chat?', opts.server.definition.label), this.allowButtons(opts.server, "allowedDuringChat"));
      if (retry) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    } else if (model === 1) {
      if (globalAutoApprove) {
        this._sessionSets.allowedOutsideChat.set(opts.server.definition.id, true);
        return this._getMatchingModel(opts);
      }
      const retry = await this._showContextual(opts.isDuringToolCall, localize("mcp.sampling.allowOutsideChat.title", 'Allow MCP server "{0}" to make LLM requests?', opts.server.definition.label), localize("mcp.sampling.allowOutsideChat.desc", 'The MCP server "{0}" has issued a request to make a language model call. Do you want to allow it to make requests, outside of tool calls during chat?', opts.server.definition.label), this.allowButtons(opts.server, "allowedOutsideChat"));
      if (retry) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    } else if (model === 2) {
      throw McpError.notAllowed();
    } else if (model === 3) {
      const newlyPickedModels = opts.isDuringToolCall ? await this._commandService.executeCommand("workbench.mcp.configureSamplingModels", opts.server) : await this._notify(localize("mcp.sampling.needsModels", 'MCP server "{0}" triggered a language model request, but it has no allowlisted models.', opts.server.definition.label), {
        [localize("configure", "Configure")]: () => this._commandService.executeCommand("workbench.mcp.configureSamplingModels", opts.server),
        [localize("cancel", "Cancel")]: () => Promise.resolve(void 0)
      });
      if (newlyPickedModels) {
        return this._getMatchingModel(opts);
      }
      throw McpError.notAllowed();
    }
    return model;
  }
  allowButtons(server, key) {
    return {
      [localize("mcp.sampling.allow.inSession", "Allow in this Session")]: async () => {
        this._sessionSets[key].set(server.definition.id, true);
        return true;
      },
      [localize("mcp.sampling.allow.always", "Always")]: async () => {
        await this.updateConfig(server, (c) => c[key] = true);
        return true;
      },
      [localize("mcp.sampling.allow.notNow", "Not Now")]: async () => {
        this._sessionSets[key].set(server.definition.id, false);
        return false;
      },
      [localize("mcp.sampling.allow.never", "Never")]: async () => {
        await this.updateConfig(server, (c) => c[key] = false);
        return false;
      }
    };
  }
  async _showContextual(isDuringToolCall, title, message, buttons) {
    if (isDuringToolCall) {
      const result = await this._dialogService.prompt({
        type: "question",
        title,
        message,
        buttons: Object.entries(buttons).map(([label, run]) => ({ label, run }))
      });
      return await result.result;
    } else {
      return await this._notify(message, buttons);
    }
  }
  async _notify(message, buttons) {
    return await new Promise((resolve) => {
      const handle = this._notificationService.prompt(Severity.Info, message, Object.entries(buttons).map(([label, action]) => ({
        label,
        run: /* @__PURE__ */ __name(() => resolve(action()), "run")
      })));
      Event.once(handle.onDidClose)(() => resolve(void 0));
    });
  }
  /**
   * Gets the matching model for the MCP server in this context, or
   * a reason why no model could be selected.
   */
  async _getMatchingModelInner(server, isDuringToolCall, preferences) {
    const config = this.getConfig(server);
    if (isDuringToolCall && !config.allowedDuringChat && !this._sessionSets.allowedDuringChat.has(server.definition.id)) {
      return config.allowedDuringChat === void 0 ? 0 : 2;
    } else if (!isDuringToolCall && !config.allowedOutsideChat && !this._sessionSets.allowedOutsideChat.has(server.definition.id)) {
      return config.allowedOutsideChat === void 0 ? 1 : 2;
    }
    const foundModelIdsDeep = config.allowedModels?.filter((m) => !!this._languageModelsService.lookupLanguageModel(m)) || this._languageModelsService.getLanguageModelIds().filter((m) => this._languageModelsService.lookupLanguageModel(m)?.isDefaultForLocation[ChatAgentLocation.Chat]);
    const foundModelIds = foundModelIdsDeep.flat().sort((a, b) => b.length - a.length);
    if (!foundModelIds.length) {
      return 3;
    }
    if (preferences?.hints) {
      const found = mapFindFirst(preferences.hints, (hint) => foundModelIds.find((model) => model.toLowerCase().includes(hint.name.toLowerCase())));
      if (found) {
        return found;
      }
    }
    return foundModelIds[0];
  }
  _configKey(server) {
    return `${server.collection.label}: ${server.definition.label}`;
  }
  getConfig(server) {
    return this._getConfig(server).value || {};
  }
  /**
   * _getConfig reads the sampling config reads the `{ server: data }` mapping
   * from the appropriate config. We read from the most specific possible
   * config up to the default configuration location that the MCP server itself
   * is defined in. We don't go further because then workspace-specific servers
   * would get in the user settings which is not meaningful and could lead
   * to confusion.
   *
   * todo@connor4312: generalize this for other esttings when we have them
   */
  _getConfig(server) {
    const def = server.readDefinitions().get();
    const mostSpecificConfig = 8;
    const leastSpecificConfig = def.collection?.configTarget || 2;
    const key = this._configKey(server);
    const resource = def.collection?.presentation?.origin;
    const configValue = this._configurationService.inspect(mcpServerSamplingSection, { resource });
    for (let target = mostSpecificConfig; target >= leastSpecificConfig; target--) {
      const mapping = getConfigValueInTarget(configValue, target);
      const config = mapping?.[key];
      if (config) {
        return { value: config, key, mapping, target, resource };
      }
    }
    return { value: void 0, mapping: getConfigValueInTarget(configValue, leastSpecificConfig), key, target: leastSpecificConfig, resource };
  }
  async updateConfig(server, mutate) {
    const { value, mapping, key, target, resource } = this._getConfig(server);
    const newConfig = { ...value };
    mutate(newConfig);
    await this._configurationService.updateValue(mcpServerSamplingSection, { ...mapping, [key]: newConfig }, { resource }, target);
    return newConfig;
  }
};
McpSamplingService = __decorate([
  __param(0, ILanguageModelsService),
  __param(1, IConfigurationService),
  __param(2, IDialogService),
  __param(3, INotificationService),
  __param(4, ICommandService),
  __param(5, IInstantiationService)
], McpSamplingService);
export {
  McpSamplingService
};
//# sourceMappingURL=mcpSamplingService.js.map
