var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../../platform/instantiation/common/instantiation.js";
var AgentStatusMode;
(function(AgentStatusMode2) {
  AgentStatusMode2["Default"] = "default";
  AgentStatusMode2["SessionReady"] = "sessionReady";
  AgentStatusMode2["Session"] = "session";
})(AgentStatusMode || (AgentStatusMode = {}));
const IAgentTitleBarStatusService = createDecorator("agentTitleBarStatusService");
class AgentTitleBarStatusService extends Disposable {
  static {
    __name(this, "AgentTitleBarStatusService");
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
  enterSessionMode(sessionResource, title) {
    const newInfo = { sessionResource, title };
    const modeChanged = this._mode !== AgentStatusMode.Session;
    this._mode = AgentStatusMode.Session;
    this._sessionInfo = newInfo;
    if (modeChanged) {
      this._onDidChangeMode.fire(this._mode);
    }
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
  enterSessionReadyMode(sessionResource, title) {
    const newInfo = { sessionResource, title };
    const modeChanged = this._mode !== AgentStatusMode.SessionReady;
    this._mode = AgentStatusMode.SessionReady;
    this._sessionInfo = newInfo;
    if (modeChanged) {
      this._onDidChangeMode.fire(this._mode);
    }
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
  exitSessionReadyMode() {
    if (this._mode !== AgentStatusMode.SessionReady) {
      return;
    }
    this._mode = AgentStatusMode.Default;
    this._sessionInfo = void 0;
    this._onDidChangeMode.fire(this._mode);
    this._onDidChangeSessionInfo.fire(void 0);
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
  AgentTitleBarStatusService,
  IAgentTitleBarStatusService
};
//# sourceMappingURL=agentTitleBarStatusService.js.map
