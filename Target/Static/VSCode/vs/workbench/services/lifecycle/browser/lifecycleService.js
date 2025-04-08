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
import { ShutdownReason, ILifecycleService, StartupKind } from "../common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractLifecycleService } from "../common/lifecycleService.js";
import { localize } from "../../../../nls.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { addDisposableListener, EventType } from "../../../../base/browser/dom.js";
import { IStorageService, WillSaveStateReason } from "../../../../platform/storage/common/storage.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { mainWindow } from "../../../../base/browser/window.js";
let BrowserLifecycleService = class extends AbstractLifecycleService {
  static {
    __name(this, "BrowserLifecycleService");
  }
  beforeUnloadListener = void 0;
  unloadListener = void 0;
  ignoreBeforeUnload = false;
  didUnload = false;
  constructor(logService, storageService) {
    super(logService, storageService);
    this.registerListeners();
  }
  registerListeners() {
    this.beforeUnloadListener = addDisposableListener(mainWindow, EventType.BEFORE_UNLOAD, (e) => this.onBeforeUnload(e));
    this.unloadListener = addDisposableListener(mainWindow, EventType.PAGE_HIDE, () => this.onUnload());
  }
  onBeforeUnload(event) {
    if (this.ignoreBeforeUnload) {
      this.logService.info("[lifecycle] onBeforeUnload triggered but ignored once");
      this.ignoreBeforeUnload = false;
    } else {
      this.logService.info("[lifecycle] onBeforeUnload triggered and handled with veto support");
      this.doShutdown(() => this.vetoBeforeUnload(event));
    }
  }
  vetoBeforeUnload(event) {
    event.preventDefault();
    event.returnValue = localize("lifecycleVeto", "Changes that you made may not be saved. Please check press 'Cancel' and try again.");
  }
  withExpectedShutdown(reason, callback) {
    if (typeof reason === "number") {
      this.shutdownReason = reason;
      return this.storageService.flush(WillSaveStateReason.SHUTDOWN);
    } else {
      this.ignoreBeforeUnload = true;
      try {
        callback?.();
      } finally {
        this.ignoreBeforeUnload = false;
      }
    }
  }
  async shutdown() {
    this.logService.info("[lifecycle] shutdown triggered");
    this.beforeUnloadListener?.dispose();
    this.unloadListener?.dispose();
    await this.storageService.flush(WillSaveStateReason.SHUTDOWN);
    this.doShutdown();
  }
  doShutdown(vetoShutdown) {
    const logService = this.logService;
    this.storageService.flush(WillSaveStateReason.SHUTDOWN);
    let veto = false;
    function handleVeto(vetoResult, id) {
      if (typeof vetoShutdown !== "function") {
        return;
      }
      if (vetoResult instanceof Promise) {
        logService.error(`[lifecycle] Long running operations before shutdown are unsupported in the web (id: ${id})`);
        veto = true;
      }
      if (vetoResult === true) {
        logService.info(`[lifecycle]: Unload was prevented (id: ${id})`);
        veto = true;
      }
    }
    __name(handleVeto, "handleVeto");
    this._onBeforeShutdown.fire({
      reason: ShutdownReason.QUIT,
      veto(value, id) {
        handleVeto(value, id);
      },
      finalVeto(valueFn, id) {
        handleVeto(valueFn(), id);
      }
    });
    if (veto && typeof vetoShutdown === "function") {
      return vetoShutdown();
    }
    return this.onUnload();
  }
  onUnload() {
    if (this.didUnload) {
      return;
    }
    this.didUnload = true;
    this._willShutdown = true;
    this._register(addDisposableListener(mainWindow, EventType.PAGE_SHOW, (e) => this.onLoadAfterUnload(e)));
    const logService = this.logService;
    this._onWillShutdown.fire({
      reason: ShutdownReason.QUIT,
      joiners: /* @__PURE__ */ __name(() => [], "joiners"),
      // Unsupported in web
      token: CancellationToken.None,
      // Unsupported in web
      join(promise, joiner) {
        if (typeof promise === "function") {
          promise();
        }
        logService.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${joiner.id})`);
      },
      force: /* @__PURE__ */ __name(() => {
      }, "force")
    });
    this._onDidShutdown.fire();
  }
  onLoadAfterUnload(event) {
    const wasRestoredFromCache = event.persisted;
    if (!wasRestoredFromCache) {
      return;
    }
    this.withExpectedShutdown({ disableShutdownHandling: true }, () => mainWindow.location.reload());
  }
  doResolveStartupKind() {
    let startupKind = super.doResolveStartupKind();
    if (typeof startupKind !== "number") {
      const timing = performance.getEntriesByType("navigation").at(0);
      if (timing?.type === "reload") {
        startupKind = StartupKind.ReloadedWindow;
      }
    }
    return startupKind;
  }
};
BrowserLifecycleService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IStorageService)
], BrowserLifecycleService);
registerSingleton(ILifecycleService, BrowserLifecycleService, InstantiationType.Eager);
export {
  BrowserLifecycleService
};
//# sourceMappingURL=lifecycleService.js.map
