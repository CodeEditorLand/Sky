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
import { Emitter } from "../../../../base/common/event.js";
import { Barrier } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILifecycleService, WillShutdownEvent, StartupKind, LifecyclePhase, LifecyclePhaseToString, ShutdownReason, BeforeShutdownErrorEvent, InternalBeforeShutdownEvent } from "./lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { mark } from "../../../../base/common/performance.js";
import { IStorageService, StorageScope, StorageTarget, WillSaveStateReason } from "../../../../platform/storage/common/storage.js";
let AbstractLifecycleService = class extends Disposable {
  constructor(logService, storageService) {
    super();
    this.logService = logService;
    this.storageService = storageService;
    this._startupKind = this.resolveStartupKind();
    this._register(this.storageService.onWillSaveState((e) => {
      if (e.reason === WillSaveStateReason.SHUTDOWN) {
        this.storageService.store(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, StorageScope.WORKSPACE, StorageTarget.MACHINE);
      }
    }));
  }
  static {
    __name(this, "AbstractLifecycleService");
  }
  static LAST_SHUTDOWN_REASON_KEY = "lifecyle.lastShutdownReason";
  _onBeforeShutdown = this._register(new Emitter());
  onBeforeShutdown = this._onBeforeShutdown.event;
  _onWillShutdown = this._register(new Emitter());
  onWillShutdown = this._onWillShutdown.event;
  _onDidShutdown = this._register(new Emitter());
  onDidShutdown = this._onDidShutdown.event;
  _onBeforeShutdownError = this._register(new Emitter());
  onBeforeShutdownError = this._onBeforeShutdownError.event;
  _onShutdownVeto = this._register(new Emitter());
  onShutdownVeto = this._onShutdownVeto.event;
  _startupKind;
  get startupKind() {
    return this._startupKind;
  }
  _phase = LifecyclePhase.Starting;
  get phase() {
    return this._phase;
  }
  _willShutdown = false;
  get willShutdown() {
    return this._willShutdown;
  }
  phaseWhen = /* @__PURE__ */ new Map();
  shutdownReason;
  resolveStartupKind() {
    const startupKind = this.doResolveStartupKind() ?? StartupKind.NewWindow;
    this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
    return startupKind;
  }
  doResolveStartupKind() {
    const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, StorageScope.WORKSPACE);
    this.storageService.remove(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, StorageScope.WORKSPACE);
    let startupKind = void 0;
    switch (lastShutdownReason) {
      case ShutdownReason.RELOAD:
        startupKind = StartupKind.ReloadedWindow;
        break;
      case ShutdownReason.LOAD:
        startupKind = StartupKind.ReopenedWindow;
        break;
    }
    return startupKind;
  }
  set phase(value) {
    if (value < this.phase) {
      throw new Error("Lifecycle cannot go backwards");
    }
    if (this._phase === value) {
      return;
    }
    this.logService.trace(`lifecycle: phase changed (value: ${value})`);
    this._phase = value;
    mark(`code/LifecyclePhase/${LifecyclePhaseToString(value)}`);
    const barrier = this.phaseWhen.get(this._phase);
    if (barrier) {
      barrier.open();
      this.phaseWhen.delete(this._phase);
    }
  }
  async when(phase) {
    if (phase <= this._phase) {
      return;
    }
    let barrier = this.phaseWhen.get(phase);
    if (!barrier) {
      barrier = new Barrier();
      this.phaseWhen.set(phase, barrier);
    }
    await barrier.wait();
  }
};
AbstractLifecycleService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IStorageService)
], AbstractLifecycleService);
export {
  AbstractLifecycleService
};
//# sourceMappingURL=lifecycleService.js.map
