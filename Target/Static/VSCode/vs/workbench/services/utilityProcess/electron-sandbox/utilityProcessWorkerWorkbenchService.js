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
import { ILogService } from "../../../../platform/log/common/log.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { Client as MessagePortClient } from "../../../../base/parts/ipc/common/ipc.mp.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IPCClient, ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { acquirePort } from "../../../../base/parts/ipc/electron-sandbox/ipc.mp.js";
import { IOnDidTerminateUtilityrocessWorkerProcess, ipcUtilityProcessWorkerChannelName, IUtilityProcessWorkerProcess, IUtilityProcessWorkerService } from "../../../../platform/utilityProcess/common/utilityProcessWorkerService.js";
import { Barrier, timeout } from "../../../../base/common/async.js";
const IUtilityProcessWorkerWorkbenchService = createDecorator("utilityProcessWorkerWorkbenchService");
let UtilityProcessWorkerWorkbenchService = class extends Disposable {
  constructor(windowId, logService, mainProcessService) {
    super();
    this.windowId = windowId;
    this.logService = logService;
    this.mainProcessService = mainProcessService;
  }
  static {
    __name(this, "UtilityProcessWorkerWorkbenchService");
  }
  _utilityProcessWorkerService = void 0;
  get utilityProcessWorkerService() {
    if (!this._utilityProcessWorkerService) {
      const channel = this.mainProcessService.getChannel(ipcUtilityProcessWorkerChannelName);
      this._utilityProcessWorkerService = ProxyChannel.toService(channel);
    }
    return this._utilityProcessWorkerService;
  }
  restoredBarrier = new Barrier();
  async createWorker(process) {
    this.logService.trace("Renderer->UtilityProcess#createWorker");
    await Promise.race([this.restoredBarrier.wait(), timeout(2e3)]);
    const nonce = generateUuid();
    const responseChannel = "vscode:createUtilityProcessWorkerMessageChannelResult";
    const portPromise = acquirePort(void 0, responseChannel, nonce);
    const onDidTerminate = this.utilityProcessWorkerService.createWorker({
      process,
      reply: { windowId: this.windowId, channel: responseChannel, nonce }
    });
    const disposables = new DisposableStore();
    disposables.add(toDisposable(() => {
      this.logService.trace("Renderer->UtilityProcess#disposeWorker", process);
      this.utilityProcessWorkerService.disposeWorker({
        process,
        reply: { windowId: this.windowId }
      });
    }));
    const port = await portPromise;
    const client = disposables.add(new MessagePortClient(port, `window:${this.windowId},module:${process.moduleId}`));
    this.logService.trace("Renderer->UtilityProcess#createWorkerChannel: connection established");
    onDidTerminate.then(({ reason }) => {
      if (reason?.code === 0) {
        this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
      } else {
        this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason?.code}, signal: ${reason?.signal}`);
      }
    });
    return { client, onDidTerminate, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") };
  }
  notifyRestored() {
    if (!this.restoredBarrier.isOpen()) {
      this.restoredBarrier.open();
    }
  }
};
UtilityProcessWorkerWorkbenchService = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IMainProcessService)
], UtilityProcessWorkerWorkbenchService);
export {
  IUtilityProcessWorkerWorkbenchService,
  UtilityProcessWorkerWorkbenchService
};
//# sourceMappingURL=utilityProcessWorkerWorkbenchService.js.map
