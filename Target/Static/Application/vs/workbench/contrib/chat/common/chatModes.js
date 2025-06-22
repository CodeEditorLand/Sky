var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IChatAgentService } from "./chatAgents.js";
import { ChatContextKeys } from "./chatContextKeys.js";
import { ChatMode, modeToString } from "./constants.js";
import { IPromptsService } from "./promptSyntax/service/promptsService.js";
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
const IChatModeService = createDecorator("chatModeService");
let ChatModeService = class ChatModeService2 extends Disposable {
  static {
    __name(this, "ChatModeService");
  }
  constructor(promptsService, chatAgentService, contextKeyService, logService) {
    super();
    this.promptsService = promptsService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this._onDidChangeChatModes = new Emitter();
    this.onDidChangeChatModes = this._onDidChangeChatModes.event;
    void this.refreshCustomPromptModes(true);
    this.hasCustomModes = ChatContextKeys.Modes.hasCustomChatModes.bindTo(contextKeyService);
    this._register(this.promptsService.onDidChangeCustomChatModes(() => {
      void this.refreshCustomPromptModes(true);
    }));
  }
  async refreshCustomPromptModes(fireChangeEvent) {
    try {
      const modes = await this.promptsService.getCustomChatModes(CancellationToken.None);
      this.latestCustomPromptModes = modes.map((customMode) => new CustomChatMode(customMode));
      this.hasCustomModes.set(modes.length > 0);
      if (fireChangeEvent) {
        this._onDidChangeChatModes.fire();
      }
    } catch (error) {
      this.logService.error(error, "Failed to load custom chat modes");
      this.latestCustomPromptModes = [];
      this.hasCustomModes.set(false);
    }
  }
  getModes() {
    return { builtin: this.getBuiltinModes(), custom: this.latestCustomPromptModes };
  }
  async getModesAsync() {
    await this.refreshCustomPromptModes();
    return { builtin: this.getBuiltinModes(), custom: this.latestCustomPromptModes };
  }
  getBuiltinModes() {
    const builtinModes = [
      ChatMode2.Ask
    ];
    if (this.chatAgentService.hasToolsAgent) {
      builtinModes.push(ChatMode2.Agent);
    }
    builtinModes.push(ChatMode2.Edit);
    return builtinModes;
  }
};
ChatModeService = __decorate([
  __param(0, IPromptsService),
  __param(1, IChatAgentService),
  __param(2, IContextKeyService),
  __param(3, ILogService)
], ChatModeService);
function isIChatMode(mode) {
  if (typeof mode === "object" && mode !== null) {
    const chatMode = mode;
    return typeof chatMode.id === "string" && typeof chatMode.kind === "string";
  }
  return false;
}
__name(isIChatMode, "isIChatMode");
class CustomChatMode {
  static {
    __name(this, "CustomChatMode");
  }
  get id() {
    return this.customChatMode.uri.toString();
  }
  get name() {
    return this.customChatMode.name;
  }
  get description() {
    return this.customChatMode.description;
  }
  get customTools() {
    return this.customChatMode.tools;
  }
  get body() {
    return this.customChatMode.body;
  }
  constructor(customChatMode) {
    this.customChatMode = customChatMode;
    this.kind = ChatMode.Agent;
  }
  /**
   * Getters are not json-stringified
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      kind: this.kind,
      customTools: this.customTools,
      body: this.body
    };
  }
}
class BuiltinChatMode {
  static {
    __name(this, "BuiltinChatMode");
  }
  constructor(kind, description) {
    this.kind = kind;
    this.description = description;
  }
  get id() {
    return this.kind;
  }
  get name() {
    return modeToString(this.kind);
  }
  /**
   * Getters are not json-stringified
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      kind: this.kind
    };
  }
}
var ChatMode2;
(function(ChatMode22) {
  ChatMode22.Ask = new BuiltinChatMode(ChatMode.Ask, localize("chatDescription", "Ask Copilot"));
  ChatMode22.Edit = new BuiltinChatMode(ChatMode.Edit, localize("editsDescription", "Edit files in your workspace"));
  ChatMode22.Agent = new BuiltinChatMode(ChatMode.Agent, localize("agentDescription", "Edit files in your workspace in agent mode"));
})(ChatMode2 || (ChatMode2 = {}));
function validateChatMode2(mode) {
  switch (mode) {
    case ChatMode.Ask:
      return ChatMode2.Ask;
    case ChatMode.Edit:
      return ChatMode2.Edit;
    case ChatMode.Agent:
      return ChatMode2.Agent;
    default:
      if (isIChatMode(mode)) {
        return mode;
      }
      return void 0;
  }
}
__name(validateChatMode2, "validateChatMode2");
function isBuiltinChatMode(mode) {
  return mode.id === ChatMode2.Ask.id || mode.id === ChatMode2.Edit.id || mode.id === ChatMode2.Agent.id;
}
__name(isBuiltinChatMode, "isBuiltinChatMode");
export {
  BuiltinChatMode,
  ChatMode2,
  ChatModeService,
  CustomChatMode,
  IChatModeService,
  isBuiltinChatMode,
  isIChatMode,
  validateChatMode2
};
//# sourceMappingURL=chatModes.js.map
