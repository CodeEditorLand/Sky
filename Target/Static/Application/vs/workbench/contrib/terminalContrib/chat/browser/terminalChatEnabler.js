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
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatAgentService } from "../../../chat/common/participants/chatAgents.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { TerminalChatContextKeys } from "./terminalChat.js";
let TerminalChatEnabler = class TerminalChatEnabler2 {
  static {
    __name(this, "TerminalChatEnabler");
  }
  static {
    this.Id = "terminalChat.enabler";
  }
  constructor(chatAgentService, contextKeyService) {
    this._store = new DisposableStore();
    this._ctxHasProvider = TerminalChatContextKeys.hasChatAgent.bindTo(contextKeyService);
    this._store.add(Event.runAndSubscribe(chatAgentService.onDidChangeAgents, () => {
      const hasTerminalAgent = Boolean(chatAgentService.getDefaultAgent(ChatAgentLocation.Terminal));
      this._ctxHasProvider.set(hasTerminalAgent);
    }));
  }
  dispose() {
    this._ctxHasProvider.reset();
    this._store.dispose();
  }
};
TerminalChatEnabler = __decorate([
  __param(0, IChatAgentService),
  __param(1, IContextKeyService)
], TerminalChatEnabler);
export {
  TerminalChatEnabler
};
//# sourceMappingURL=terminalChatEnabler.js.map
