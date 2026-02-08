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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { Extensions, IOutputService } from "../../../services/output/common/output.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { localize } from "../../../../nls.js";
const hooksOutputChannelId = "hooksExecution";
const hooksOutputChannelLabel = localize("hooksExecutionChannel", "Hooks");
var HookResultKind;
(function(HookResultKind2) {
  HookResultKind2[HookResultKind2["Success"] = 1] = "Success";
  HookResultKind2[HookResultKind2["Error"] = 2] = "Error";
})(HookResultKind || (HookResultKind = {}));
const IHooksExecutionService = createDecorator("hooksExecutionService");
let HooksExecutionService = class HooksExecutionService2 {
  static {
    __name(this, "HooksExecutionService");
  }
  constructor(_logService, _outputService) {
    this._logService = _logService;
    this._outputService = _outputService;
    this._sessionHooks = /* @__PURE__ */ new Map();
    this._channelRegistered = false;
    this._requestCounter = 0;
  }
  setProxy(proxy) {
    this._proxy = proxy;
  }
  _ensureOutputChannel() {
    if (this._channelRegistered) {
      return;
    }
    Registry.as(Extensions.OutputChannels).registerChannel({
      id: hooksOutputChannelId,
      label: hooksOutputChannelLabel,
      log: false
    });
    this._channelRegistered = true;
  }
  _log(requestId, hookType, message) {
    this._ensureOutputChannel();
    const channel = this._outputService.getChannel(hooksOutputChannelId);
    if (channel) {
      channel.append(`[${(/* @__PURE__ */ new Date()).toISOString()}] [#${requestId}] [${hookType}] ${message}
`);
    }
  }
  async _runSingleHook(requestId, hookType, hookCommand, input, token) {
    const hookCommandJson = JSON.stringify({
      ...hookCommand,
      cwd: hookCommand.cwd?.fsPath
    });
    this._log(requestId, hookType, `Running: ${hookCommandJson}`);
    if (input !== void 0) {
      this._log(requestId, hookType, `Input: ${JSON.stringify(input)}`);
    }
    const sw = StopWatch.create();
    try {
      const result = await this._proxy.runHookCommand(hookCommand, input, token);
      this._logResult(requestId, hookType, result, sw.elapsed());
      return result;
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      this._log(requestId, hookType, `Error in ${sw.elapsed()}ms: ${errMessage}`);
      return { kind: 2, result: errMessage };
    }
  }
  _logResult(requestId, hookType, result, elapsed) {
    const resultKindStr = result.kind === 1 ? "Success" : "Error";
    const resultStr = typeof result.result === "string" ? result.result : JSON.stringify(result.result);
    const hasOutput = resultStr.length > 0 && resultStr !== "{}" && resultStr !== "[]";
    if (hasOutput) {
      this._log(requestId, hookType, `Completed (${resultKindStr}) in ${elapsed}ms`);
      this._log(requestId, hookType, `Output: ${resultStr}`);
    } else {
      this._log(requestId, hookType, `Completed (${resultKindStr}) in ${elapsed}ms, no output`);
    }
  }
  registerHooks(sessionResource, hooks) {
    const key = sessionResource.toString();
    this._sessionHooks.set(key, hooks);
    return toDisposable(() => {
      this._sessionHooks.delete(key);
    });
  }
  getHooksForSession(sessionResource) {
    return this._sessionHooks.get(sessionResource.toString());
  }
  async executeHook(hookType, sessionResource, options) {
    if (!this._proxy) {
      return [];
    }
    const hooks = this.getHooksForSession(sessionResource);
    if (!hooks) {
      return [];
    }
    const hookCommands = hooks[hookType];
    if (!hookCommands || hookCommands.length === 0) {
      return [];
    }
    const requestId = this._requestCounter++;
    const token = options?.token ?? CancellationToken.None;
    this._logService.debug(`[HooksExecutionService] Executing ${hookCommands.length} hook(s) for type '${hookType}'`);
    this._log(requestId, hookType, `Executing ${hookCommands.length} hook(s)`);
    const results = [];
    for (const hookCommand of hookCommands) {
      const result = await this._runSingleHook(requestId, hookType, hookCommand, options?.input, token);
      results.push(result);
    }
    return results;
  }
};
HooksExecutionService = __decorate([
  __param(0, ILogService),
  __param(1, IOutputService)
], HooksExecutionService);
export {
  HookResultKind,
  HooksExecutionService,
  IHooksExecutionService,
  hooksOutputChannelId
};
//# sourceMappingURL=hooksExecutionService.js.map
