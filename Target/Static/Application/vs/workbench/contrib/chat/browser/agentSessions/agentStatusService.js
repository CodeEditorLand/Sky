var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
var AgentStatusMode;
(function(AgentStatusMode2) {
  AgentStatusMode2["Default"] = "default";
  AgentStatusMode2["Session"] = "session";
})(AgentStatusMode || (AgentStatusMode = {}));
const IAgentStatusService = createDecorator("agentStatusService");
class AgentStatusService extends Disposable {
  static {
    __name(this, "AgentStatusService");
  }
  constructor() {
    super(...arguments);
    this._mode = AgentStatusMode.Default;
    this._onDidChangeMode = this._register(new Emitter());
    this.onDidChangeMode = this._onDidChangeMode.event;
    this._onDidChangeSessionInfo = this._register(new Emitter());
    this.onDidChangeSessionInfo = this._onDidChangeSessionInfo.event;
  }
  get mode() {
    return this._mode;
  }
  get sessionInfo() {
    return this._sessionInfo;
  }
  enterSessionMode(sessionId, title) {
    const newInfo = { sessionId, title };
    const modeChanged = this._mode !== AgentStatusMode.Session;
    this._mode = AgentStatusMode.Session;
    this._sessionInfo = newInfo;
    if (modeChanged) {
      this._onDidChangeMode.fire(this._mode);
    }
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
  exitSessionMode() {
    if (this._mode === AgentStatusMode.Default) {
      return;
    }
    this._mode = AgentStatusMode.Default;
    this._sessionInfo = void 0;
    this._onDidChangeMode.fire(this._mode);
    this._onDidChangeSessionInfo.fire(void 0);
  }
  updateSessionTitle(title) {
    if (this._mode !== AgentStatusMode.Session || !this._sessionInfo) {
      return;
    }
    this._sessionInfo = { ...this._sessionInfo, title };
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
}
export {
  AgentStatusMode,
  AgentStatusService,
  IAgentStatusService
};
//# sourceMappingURL=agentStatusService.js.map
