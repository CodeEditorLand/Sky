var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatAgentService } from "../../../chat/common/chatAgents.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { TerminalChatContextKeys } from "./terminalChat.js";
let TerminalChatEnabler = class {
  static {
    __name(this, "TerminalChatEnabler");
  }
  static Id = "terminalChat.enabler";
  _ctxHasProvider;
  _store = new DisposableStore();
  constructor(chatAgentService, contextKeyService) {
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
TerminalChatEnabler = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IContextKeyService)
], TerminalChatEnabler);
export {
  TerminalChatEnabler
};
//# sourceMappingURL=terminalChatEnabler.js.map
