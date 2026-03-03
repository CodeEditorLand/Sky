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
var LifecycleMainService_1;
import electron from "electron";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { Barrier, Promises, timeout } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { isMacintosh, isWindows } from "../../../base/common/platform.js";
import { cwd } from "../../../base/common/process.js";
import { assertReturnsDefined } from "../../../base/common/types.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { getAllWindowsExcludingOffscreen } from "../../windows/electron-main/windows.js";
const ILifecycleMainService = createDecorator("lifecycleMainService");
var ShutdownReason;
(function(ShutdownReason2) {
  ShutdownReason2[ShutdownReason2["QUIT"] = 1] = "QUIT";
  ShutdownReason2[ShutdownReason2["KILL"] = 2] = "KILL";
})(ShutdownReason || (ShutdownReason = {}));
var LifecycleMainPhase;
(function(LifecycleMainPhase2) {
  LifecycleMainPhase2[LifecycleMainPhase2["Starting"] = 1] = "Starting";
  LifecycleMainPhase2[LifecycleMainPhase2["Ready"] = 2] = "Ready";
  LifecycleMainPhase2[LifecycleMainPhase2["AfterWindowOpen"] = 3] = "AfterWindowOpen";
  LifecycleMainPhase2[LifecycleMainPhase2["Eventually"] = 4] = "Eventually";
})(LifecycleMainPhase || (LifecycleMainPhase = {}));
let LifecycleMainService = class LifecycleMainService2 extends Disposable {
  static {
    __name(this, "LifecycleMainService");
  }
  static {
    LifecycleMainService_1 = this;
  }
  static {
    this.QUIT_AND_RESTART_KEY = "lifecycle.quitAndRestart";
  }
  get quitRequested() {
    return this._quitRequested;
  }
  get wasRestarted() {
    return this._wasRestarted;
  }
  get phase() {
    return this._phase;
  }
  constructor(logService, stateService, environmentMainService) {
    super();
    this.logService = logService;
    this.stateService = stateService;
    this.environmentMainService = environmentMainService;
    this._onBeforeShutdown = this._register(new Emitter());
    this.onBeforeShutdown = this._onBeforeShutdown.event;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onWillLoadWindow = this._register(new Emitter());
    this.onWillLoadWindow = this._onWillLoadWindow.event;
    this._onBeforeCloseWindow = this._register(new Emitter());
    this.onBeforeCloseWindow = this._onBeforeCloseWindow.event;
    this._quitRequested = false;
    this._wasRestarted = false;
    this._phase = 1;
    this.windowToCloseRequest = /* @__PURE__ */ new Set();
    this.oneTimeListenerTokenGenerator = 0;
    this.windowCounter = 0;
    this.pendingQuitPromise = void 0;
    this.pendingQuitPromiseResolve = void 0;
    this.pendingWillShutdownPromise = void 0;
    this.mapWindowIdToPendingUnload = /* @__PURE__ */ new Map();
    this.phaseWhen = /* @__PURE__ */ new Map();
    this.relaunchHandler = void 0;
    this.resolveRestarted();
    this.when(
      2
      /* LifecycleMainPhase.Ready */
    ).then(() => this.registerListeners());
  }
  resolveRestarted() {
    this._wasRestarted = !!this.stateService.getItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY);
    if (this._wasRestarted) {
      this.stateService.removeItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY);
    }
  }
  registerListeners() {
    const beforeQuitListener = /* @__PURE__ */ __name(() => {
      if (this._quitRequested) {
        return;
      }
      this.trace("Lifecycle#app.on(before-quit)");
      this._quitRequested = true;
      this.trace("Lifecycle#onBeforeShutdown.fire()");
      this._onBeforeShutdown.fire();
      if (isMacintosh && this.windowCounter === 0) {
        this.fireOnWillShutdown(
          1
          /* ShutdownReason.QUIT */
        );
      }
    }, "beforeQuitListener");
    electron.app.addListener("before-quit", beforeQuitListener);
    const windowAllClosedListener = /* @__PURE__ */ __name(() => {
      this.trace("Lifecycle#app.on(window-all-closed)");
      if (this._quitRequested || !isMacintosh) {
        electron.app.quit();
      }
    }, "windowAllClosedListener");
    electron.app.addListener("window-all-closed", windowAllClosedListener);
    electron.app.once("will-quit", (e) => {
      this.trace("Lifecycle#app.on(will-quit) - begin");
      e.preventDefault();
      const shutdownPromise = this.fireOnWillShutdown(
        1
        /* ShutdownReason.QUIT */
      );
      shutdownPromise.finally(() => {
        this.trace("Lifecycle#app.on(will-quit) - after fireOnWillShutdown");
        this.resolvePendingQuitPromise(
          false
          /* no veto */
        );
        electron.app.removeListener("before-quit", beforeQuitListener);
        electron.app.removeListener("window-all-closed", windowAllClosedListener);
        this.trace("Lifecycle#app.on(will-quit) - calling app.quit()");
        electron.app.quit();
      });
    });
  }
  fireOnWillShutdown(reason) {
    if (this.pendingWillShutdownPromise) {
      return this.pendingWillShutdownPromise;
    }
    const logService = this.logService;
    this.trace("Lifecycle#onWillShutdown.fire()");
    const joiners = [];
    this._onWillShutdown.fire({
      reason,
      join(id, promise) {
        logService.trace(`Lifecycle#onWillShutdown - begin '${id}'`);
        joiners.push(promise.finally(() => {
          logService.trace(`Lifecycle#onWillShutdown - end '${id}'`);
        }));
      }
    });
    this.pendingWillShutdownPromise = (async () => {
      try {
        await Promises.settled(joiners);
      } catch (error) {
        this.logService.error(error);
      }
      try {
        await this.stateService.close();
      } catch (error) {
        this.logService.error(error);
      }
    })();
    return this.pendingWillShutdownPromise;
  }
  set phase(value) {
    if (value < this.phase) {
      throw new Error("Lifecycle cannot go backwards");
    }
    if (this._phase === value) {
      return;
    }
    this.trace(`lifecycle (main): phase changed (value: ${value})`);
    this._phase = value;
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
  registerWindow(window) {
    const windowListeners = new DisposableStore();
    this.windowCounter++;
    windowListeners.add(window.onWillLoad((e) => this._onWillLoadWindow.fire({ window, workspace: e.workspace, reason: e.reason })));
    const win = assertReturnsDefined(window.win);
    windowListeners.add(Event.fromNodeEventEmitter(win, "close")((e) => {
      const windowId = window.id;
      if (this.windowToCloseRequest.delete(windowId)) {
        return;
      }
      this.trace(`Lifecycle#window.on('close') - window ID ${window.id}`);
      e.preventDefault();
      this.unload(
        window,
        1
        /* UnloadReason.CLOSE */
      ).then((veto) => {
        if (veto) {
          this.windowToCloseRequest.delete(windowId);
          return;
        }
        this.windowToCloseRequest.add(windowId);
        this.trace(`Lifecycle#onBeforeCloseWindow.fire() - window ID ${windowId}`);
        this._onBeforeCloseWindow.fire(window);
        window.close();
      });
    }));
    windowListeners.add(Event.fromNodeEventEmitter(win, "closed")(() => {
      this.trace(`Lifecycle#window.on('closed') - window ID ${window.id}`);
      this.windowCounter--;
      windowListeners.dispose();
      if (this.windowCounter === 0 && (!isMacintosh || this._quitRequested)) {
        this.fireOnWillShutdown(
          1
          /* ShutdownReason.QUIT */
        );
      }
    }));
  }
  registerAuxWindow(auxWindow) {
    const win = assertReturnsDefined(auxWindow.win);
    const windowListeners = new DisposableStore();
    windowListeners.add(Event.fromNodeEventEmitter(win, "close")((e) => {
      this.trace(`Lifecycle#auxWindow.on('close') - window ID ${auxWindow.id}`);
      if (this._quitRequested) {
        this.trace(`Lifecycle#auxWindow.on('close') - preventDefault() because quit requested`);
        e.preventDefault();
      }
    }));
    windowListeners.add(Event.fromNodeEventEmitter(win, "closed")(() => {
      this.trace(`Lifecycle#auxWindow.on('closed') - window ID ${auxWindow.id}`);
      windowListeners.dispose();
    }));
  }
  async reload(window, cli) {
    const veto = await this.unload(
      window,
      3
      /* UnloadReason.RELOAD */
    );
    if (!veto) {
      window.reload(cli);
    }
  }
  unload(window, reason) {
    const pendingUnloadPromise = this.mapWindowIdToPendingUnload.get(window.id);
    if (pendingUnloadPromise) {
      return pendingUnloadPromise;
    }
    const unloadPromise = this.doUnload(window, reason).finally(() => {
      this.mapWindowIdToPendingUnload.delete(window.id);
    });
    this.mapWindowIdToPendingUnload.set(window.id, unloadPromise);
    return unloadPromise;
  }
  async doUnload(window, reason) {
    if (!window.isReady) {
      return false;
    }
    this.trace(`Lifecycle#unload() - window ID ${window.id}`);
    const windowUnloadReason = this._quitRequested ? 2 : reason;
    const veto = await this.onBeforeUnloadWindowInRenderer(window, windowUnloadReason);
    if (veto) {
      this.trace(`Lifecycle#unload() - veto in renderer (window ID ${window.id})`);
      return this.handleWindowUnloadVeto(veto);
    }
    await this.onWillUnloadWindowInRenderer(window, windowUnloadReason);
    return false;
  }
  handleWindowUnloadVeto(veto) {
    if (!veto) {
      return false;
    }
    this.resolvePendingQuitPromise(
      true
      /* veto */
    );
    this._quitRequested = false;
    return true;
  }
  resolvePendingQuitPromise(veto) {
    if (this.pendingQuitPromiseResolve) {
      this.pendingQuitPromiseResolve(veto);
      this.pendingQuitPromiseResolve = void 0;
      this.pendingQuitPromise = void 0;
    }
  }
  onBeforeUnloadWindowInRenderer(window, reason) {
    return new Promise((resolve) => {
      const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
      const okChannel = `vscode:ok${oneTimeEventToken}`;
      const cancelChannel = `vscode:cancel${oneTimeEventToken}`;
      validatedIpcMain.once(okChannel, () => {
        resolve(false);
      });
      validatedIpcMain.once(cancelChannel, () => {
        resolve(true);
      });
      window.send("vscode:onBeforeUnload", { okChannel, cancelChannel, reason });
    });
  }
  onWillUnloadWindowInRenderer(window, reason) {
    return new Promise((resolve) => {
      const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
      const replyChannel = `vscode:reply${oneTimeEventToken}`;
      validatedIpcMain.once(replyChannel, () => resolve());
      window.send("vscode:onWillUnload", { replyChannel, reason });
    });
  }
  quit(willRestart) {
    return this.doQuit(willRestart).then((veto) => {
      if (!veto && willRestart) {
        try {
          if (isWindows) {
            const currentWorkingDir = cwd();
            if (currentWorkingDir !== process.cwd()) {
              process.chdir(currentWorkingDir);
            }
          }
        } catch (err) {
          this.logService.error(err);
        }
      }
      return veto;
    });
  }
  doQuit(willRestart) {
    this.trace(`Lifecycle#quit() - begin (willRestart: ${willRestart})`);
    if (this.pendingQuitPromise) {
      this.trace("Lifecycle#quit() - returning pending quit promise");
      return this.pendingQuitPromise;
    }
    if (willRestart) {
      this.stateService.setItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY, true);
    }
    this.pendingQuitPromise = new Promise((resolve) => {
      this.pendingQuitPromiseResolve = resolve;
      this.trace("Lifecycle#quit() - calling app.quit()");
      electron.app.quit();
    });
    return this.pendingQuitPromise;
  }
  trace(msg) {
    if (this.environmentMainService.args["enable-smoke-test-driver"]) {
      this.logService.info(msg);
    } else {
      this.logService.trace(msg);
    }
  }
  setRelaunchHandler(handler) {
    this.relaunchHandler = handler;
  }
  async relaunch(options) {
    this.trace("Lifecycle#relaunch()");
    const args = process.argv.slice(1);
    if (options?.addArgs) {
      args.push(...options.addArgs);
    }
    if (options?.removeArgs) {
      for (const a of options.removeArgs) {
        const idx = args.indexOf(a);
        if (idx >= 0) {
          args.splice(idx, 1);
        }
      }
    }
    const quitListener = /* @__PURE__ */ __name(() => {
      if (!this.relaunchHandler?.handleRelaunch(options)) {
        this.trace("Lifecycle#relaunch() - calling app.relaunch()");
        electron.app.relaunch({ args });
      }
    }, "quitListener");
    electron.app.once("quit", quitListener);
    const veto = await this.quit(
      true
      /* will restart */
    );
    if (veto) {
      electron.app.removeListener("quit", quitListener);
    }
  }
  async kill(code) {
    this.trace("Lifecycle#kill()");
    await this.fireOnWillShutdown(
      2
      /* ShutdownReason.KILL */
    );
    await Promise.race([
      // Still do not block more than 1s
      timeout(1e3),
      // Destroy any opened window: we do not unload windows here because
      // there is a chance that the unload is veto'd or long running due
      // to a participant within the window. this is not wanted when we
      // are asked to kill the application.
      (async () => {
        for (const window of getAllWindowsExcludingOffscreen()) {
          if (window && !window.isDestroyed()) {
            let whenWindowClosed;
            if (window.webContents && !window.webContents.isDestroyed()) {
              whenWindowClosed = new Promise((resolve) => window.once("closed", resolve));
            } else {
              whenWindowClosed = Promise.resolve();
            }
            window.destroy();
            await whenWindowClosed;
          }
        }
      })()
    ]);
    electron.app.exit(code);
  }
};
LifecycleMainService = LifecycleMainService_1 = __decorate([
  __param(0, ILogService),
  __param(1, IStateService),
  __param(2, IEnvironmentMainService)
], LifecycleMainService);
export {
  ILifecycleMainService,
  LifecycleMainPhase,
  LifecycleMainService,
  ShutdownReason
};
//# sourceMappingURL=lifecycleMainService.js.map
