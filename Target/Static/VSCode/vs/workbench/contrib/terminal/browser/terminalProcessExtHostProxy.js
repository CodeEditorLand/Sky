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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IProcessReadyEvent, IShellLaunchConfig, ITerminalChildProcess, ITerminalDimensions, ITerminalLaunchError, IProcessProperty, ProcessPropertyType, IProcessPropertyMap } from "../../../../platform/terminal/common/terminal.js";
import { ITerminalService } from "./terminal.js";
import { ITerminalProcessExtHostProxy } from "../common/terminal.js";
let TerminalProcessExtHostProxy = class extends Disposable {
  constructor(instanceId, _cols, _rows, _terminalService) {
    super();
    this.instanceId = instanceId;
    this._cols = _cols;
    this._rows = _rows;
    this._terminalService = _terminalService;
  }
  static {
    __name(this, "TerminalProcessExtHostProxy");
  }
  id = 0;
  shouldPersist = false;
  _onProcessData = this._register(new Emitter());
  onProcessData = this._onProcessData.event;
  _onProcessReady = this._register(new Emitter());
  get onProcessReady() {
    return this._onProcessReady.event;
  }
  _onStart = this._register(new Emitter());
  onStart = this._onStart.event;
  _onInput = this._register(new Emitter());
  onInput = this._onInput.event;
  _onBinary = this._register(new Emitter());
  onBinary = this._onBinary.event;
  _onResize = this._register(new Emitter());
  onResize = this._onResize.event;
  _onAcknowledgeDataEvent = this._register(new Emitter());
  onAcknowledgeDataEvent = this._onAcknowledgeDataEvent.event;
  _onShutdown = this._register(new Emitter());
  onShutdown = this._onShutdown.event;
  _onRequestInitialCwd = this._register(new Emitter());
  onRequestInitialCwd = this._onRequestInitialCwd.event;
  _onRequestCwd = this._register(new Emitter());
  onRequestCwd = this._onRequestCwd.event;
  _onDidChangeProperty = this._register(new Emitter());
  onDidChangeProperty = this._onDidChangeProperty.event;
  _onProcessExit = this._register(new Emitter());
  onProcessExit = this._onProcessExit.event;
  _pendingInitialCwdRequests = [];
  _pendingCwdRequests = [];
  emitData(data) {
    this._onProcessData.fire(data);
  }
  emitTitle(title) {
    this._onDidChangeProperty.fire({ type: ProcessPropertyType.Title, value: title });
  }
  emitReady(pid, cwd) {
    this._onProcessReady.fire({ pid, cwd, windowsPty: void 0 });
  }
  emitProcessProperty({ type, value }) {
    switch (type) {
      case ProcessPropertyType.Cwd:
        this.emitCwd(value);
        break;
      case ProcessPropertyType.InitialCwd:
        this.emitInitialCwd(value);
        break;
      case ProcessPropertyType.Title:
        this.emitTitle(value);
        break;
      case ProcessPropertyType.OverrideDimensions:
        this.emitOverrideDimensions(value);
        break;
      case ProcessPropertyType.ResolvedShellLaunchConfig:
        this.emitResolvedShellLaunchConfig(value);
        break;
    }
  }
  emitExit(exitCode) {
    this._onProcessExit.fire(exitCode);
    this.dispose();
  }
  emitOverrideDimensions(dimensions) {
    this._onDidChangeProperty.fire({ type: ProcessPropertyType.OverrideDimensions, value: dimensions });
  }
  emitResolvedShellLaunchConfig(shellLaunchConfig) {
    this._onDidChangeProperty.fire({ type: ProcessPropertyType.ResolvedShellLaunchConfig, value: shellLaunchConfig });
  }
  emitInitialCwd(initialCwd) {
    while (this._pendingInitialCwdRequests.length > 0) {
      this._pendingInitialCwdRequests.pop()(initialCwd);
    }
  }
  emitCwd(cwd) {
    while (this._pendingCwdRequests.length > 0) {
      this._pendingCwdRequests.pop()(cwd);
    }
  }
  async start() {
    return this._terminalService.requestStartExtensionTerminal(this, this._cols, this._rows);
  }
  shutdown(immediate) {
    this._onShutdown.fire(immediate);
  }
  input(data) {
    this._onInput.fire(data);
  }
  resize(cols, rows) {
    this._onResize.fire({ cols, rows });
  }
  clearBuffer() {
  }
  acknowledgeDataEvent() {
  }
  async setUnicodeVersion(version) {
  }
  async processBinary(data) {
    this._onBinary.fire(data);
  }
  getInitialCwd() {
    return new Promise((resolve) => {
      this._onRequestInitialCwd.fire();
      this._pendingInitialCwdRequests.push(resolve);
    });
  }
  getCwd() {
    return new Promise((resolve) => {
      this._onRequestCwd.fire();
      this._pendingCwdRequests.push(resolve);
    });
  }
  async refreshProperty(type) {
  }
  async updateProperty(type, value) {
  }
};
TerminalProcessExtHostProxy = __decorateClass([
  __decorateParam(3, ITerminalService)
], TerminalProcessExtHostProxy);
export {
  TerminalProcessExtHostProxy
};
//# sourceMappingURL=terminalProcessExtHostProxy.js.map
