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
var BaseWindow_1;
import { isSafari, setFullscreen } from "../../base/browser/browser.js";
import { addDisposableListener, EventHelper, EventType, getActiveWindow, getWindow, getWindowById, getWindows, getWindowsCount, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess } from "../../base/browser/dom.js";
import { DomEmitter } from "../../base/browser/event.js";
import { requestHidDevice, requestSerialPort, requestUsbDevice } from "../../base/browser/deviceAccess.js";
import { timeout } from "../../base/common/async.js";
import { Event } from "../../base/common/event.js";
import { Disposable, dispose, toDisposable } from "../../base/common/lifecycle.js";
import { matchesScheme, Schemas } from "../../base/common/network.js";
import { isIOS, isMacintosh } from "../../base/common/platform.js";
import Severity from "../../base/common/severity.js";
import { URI } from "../../base/common/uri.js";
import { localize } from "../../nls.js";
import { CommandsRegistry } from "../../platform/commands/common/commands.js";
import { IDialogService } from "../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../platform/label/common/label.js";
import { IOpenerService } from "../../platform/opener/common/opener.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { IBrowserWorkbenchEnvironmentService } from "../services/environment/browser/environmentService.js";
import { IWorkbenchLayoutService } from "../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../services/lifecycle/common/lifecycle.js";
import { IHostService } from "../services/host/browser/host.js";
import { registerWindowDriver } from "../services/driver/browser/driver.js";
import { isAuxiliaryWindow, mainWindow } from "../../base/browser/window.js";
import { createSingleCallFunction } from "../../base/common/functional.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { IWorkbenchEnvironmentService } from "../services/environment/common/environmentService.js";
import { MarkdownString } from "../../base/common/htmlContent.js";
import { IContextMenuService } from "../../platform/contextview/browser/contextView.js";
let BaseWindow = class BaseWindow2 extends Disposable {
  static {
    __name(this, "BaseWindow");
  }
  static {
    BaseWindow_1 = this;
  }
  static {
    this.TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER;
  }
  static {
    this.TIMEOUT_DISPOSABLES = /* @__PURE__ */ new Map();
  }
  constructor(targetWindow, dom = { getWindowsCount, getWindows }, hostService, environmentService, contextMenuService, layoutService) {
    super();
    this.hostService = hostService;
    this.environmentService = environmentService;
    this.contextMenuService = contextMenuService;
    this.layoutService = layoutService;
    this.enableWindowFocusOnElementFocus(targetWindow);
    this.enableMultiWindowAwareTimeout(targetWindow, dom);
    this.registerFullScreenListeners(targetWindow.vscodeWindowId);
    this.registerContextMenuListeners(targetWindow);
  }
  //#region focus handling in multi-window applications
  enableWindowFocusOnElementFocus(targetWindow) {
    const originalFocus = targetWindow.HTMLElement.prototype.focus;
    const that = this;
    targetWindow.HTMLElement.prototype.focus = function(options) {
      that.onElementFocus(getWindow(this));
      originalFocus.apply(this, [options]);
    };
  }
  onElementFocus(targetWindow) {
    const activeWindow = getActiveWindow();
    if (activeWindow !== targetWindow && activeWindow.document.hasFocus()) {
      targetWindow.focus();
      if (!this.environmentService.extensionTestsLocationURI && !targetWindow.document.hasFocus()) {
        this.hostService.focus(targetWindow);
      }
    }
  }
  //#endregion
  //#region timeout handling in multi-window applications
  enableMultiWindowAwareTimeout(targetWindow, dom = { getWindowsCount, getWindows }) {
    const originalSetTimeout = targetWindow.setTimeout;
    Object.defineProperty(targetWindow, "vscodeOriginalSetTimeout", { get: /* @__PURE__ */ __name(() => originalSetTimeout, "get") });
    const originalClearTimeout = targetWindow.clearTimeout;
    Object.defineProperty(targetWindow, "vscodeOriginalClearTimeout", { get: /* @__PURE__ */ __name(() => originalClearTimeout, "get") });
    targetWindow.setTimeout = function(handler, timeout2 = 0, ...args) {
      if (dom.getWindowsCount() === 1 || typeof handler === "string" || timeout2 === 0) {
        return originalSetTimeout.apply(this, [handler, timeout2, ...args]);
      }
      const timeoutDisposables = /* @__PURE__ */ new Set();
      const timeoutHandle = BaseWindow_1.TIMEOUT_HANDLES++;
      BaseWindow_1.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);
      const handlerFn = createSingleCallFunction(handler, () => {
        dispose(timeoutDisposables);
        BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      });
      for (const { window, disposables } of dom.getWindows()) {
        if (isAuxiliaryWindow(window) && window.document.visibilityState === "hidden") {
          continue;
        }
        let didClear = false;
        const handle = window.vscodeOriginalSetTimeout?.apply(this, [(...args2) => {
          if (didClear) {
            return;
          }
          handlerFn(...args2);
        }, timeout2, ...args]);
        const timeoutDisposable = toDisposable(() => {
          didClear = true;
          window.vscodeOriginalClearTimeout?.apply(this, [handle]);
          timeoutDisposables.delete(timeoutDisposable);
        });
        disposables.add(timeoutDisposable);
        timeoutDisposables.add(timeoutDisposable);
      }
      return timeoutHandle;
    };
    targetWindow.clearTimeout = function(timeoutHandle) {
      const timeoutDisposables = typeof timeoutHandle === "number" ? BaseWindow_1.TIMEOUT_DISPOSABLES.get(timeoutHandle) : void 0;
      if (timeoutDisposables) {
        dispose(timeoutDisposables);
        BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      } else {
        originalClearTimeout.apply(this, [timeoutHandle]);
      }
    };
  }
  //#endregion
  //#region Confirm on Shutdown
  static async confirmOnShutdown(accessor, reason) {
    const dialogService = accessor.get(IDialogService);
    const configurationService = accessor.get(IConfigurationService);
    const message = reason === 2 ? isMacintosh ? localize("quitMessageMac", "Are you sure you want to quit?") : localize("quitMessage", "Are you sure you want to exit?") : localize("closeWindowMessage", "Are you sure you want to close the window?");
    const primaryButton = reason === 2 ? isMacintosh ? localize({ key: "quitButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Quit") : localize({ key: "exitButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Exit") : localize({ key: "closeWindowButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Close Window");
    const res = await dialogService.confirm({
      message,
      primaryButton,
      checkbox: {
        label: localize("doNotAskAgain", "Do not ask me again")
      }
    });
    if (res.confirmed && res.checkboxChecked) {
      await configurationService.updateValue("window.confirmBeforeClose", "never");
    }
    return res.confirmed;
  }
  //#endregion
  registerFullScreenListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFullScreen(({ windowId, fullscreen }) => {
      if (windowId === targetWindowId) {
        const targetWindow = getWindowById(targetWindowId);
        if (targetWindow) {
          setFullscreen(fullscreen, targetWindow.window);
        }
      }
    }));
  }
  registerContextMenuListeners(targetWindow) {
    if (targetWindow !== mainWindow) {
      return;
    }
    const update = /* @__PURE__ */ __name((visible) => this.layoutService.activeContainer.classList.toggle("context-menu-visible", visible), "update");
    this._register(this.contextMenuService.onDidShowContextMenu(() => update(true)));
    this._register(this.contextMenuService.onDidHideContextMenu(() => update(false)));
  }
};
BaseWindow = BaseWindow_1 = __decorate([
  __param(2, IHostService),
  __param(3, IWorkbenchEnvironmentService),
  __param(4, IContextMenuService),
  __param(5, IWorkbenchLayoutService)
], BaseWindow);
let BrowserWindow = class BrowserWindow2 extends BaseWindow {
  static {
    __name(this, "BrowserWindow");
  }
  constructor(openerService, lifecycleService, dialogService, labelService, productService, browserEnvironmentService, layoutService, instantiationService, hostService, contextMenuService) {
    super(mainWindow, void 0, hostService, browserEnvironmentService, contextMenuService, layoutService);
    this.openerService = openerService;
    this.lifecycleService = lifecycleService;
    this.dialogService = dialogService;
    this.labelService = labelService;
    this.productService = productService;
    this.browserEnvironmentService = browserEnvironmentService;
    this.instantiationService = instantiationService;
    this.registerListeners();
    this.create();
  }
  registerListeners() {
    this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
    const viewport = isIOS && mainWindow.visualViewport ? mainWindow.visualViewport : mainWindow;
    this._register(addDisposableListener(viewport, EventType.RESIZE, () => {
      this.layoutService.layout();
      if (isIOS) {
        mainWindow.scrollTo(0, 0);
      }
    }));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.WHEEL, (e) => e.preventDefault(), { passive: false }));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.CONTEXT_MENU, (e) => EventHelper.stop(e, true)));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.DROP, (e) => EventHelper.stop(e, true)));
  }
  onWillShutdown() {
    Event.toPromise(Event.any(Event.once(new DomEmitter(mainWindow.document.body, EventType.KEY_DOWN, true).event), Event.once(new DomEmitter(mainWindow.document.body, EventType.MOUSE_DOWN, true).event))).then(async () => {
      await timeout(3e3);
      await this.dialogService.prompt({
        type: Severity.Error,
        message: localize("shutdownError", "An unexpected error occurred that requires a reload of this page."),
        detail: localize("shutdownErrorDetail", "The workbench was unexpectedly disposed while running."),
        buttons: [
          {
            label: localize({ key: "reload", comment: ["&& denotes a mnemonic"] }, "&&Reload"),
            run: /* @__PURE__ */ __name(() => mainWindow.location.reload(), "run")
            // do not use any services at this point since they are likely not functional at this point
          }
        ]
      });
    });
  }
  create() {
    this.setupOpenHandlers();
    this.registerLabelFormatters();
    this.registerCommands();
    this.setupDriver();
  }
  setupDriver() {
    if (this.environmentService.enableSmokeTestDriver) {
      registerWindowDriver(this.instantiationService);
    }
  }
  setupOpenHandlers() {
    this.openerService.setDefaultExternalOpener({
      openExternal: /* @__PURE__ */ __name(async (href) => {
        let isAllowedOpener = false;
        if (this.browserEnvironmentService.options?.openerAllowedExternalUrlPrefixes) {
          for (const trustedPopupPrefix of this.browserEnvironmentService.options.openerAllowedExternalUrlPrefixes) {
            if (href.startsWith(trustedPopupPrefix)) {
              isAllowedOpener = true;
              break;
            }
          }
        }
        if (matchesScheme(href, Schemas.http) || matchesScheme(href, Schemas.https)) {
          if (isSafari) {
            const opened = windowOpenWithSuccess(href, !isAllowedOpener);
            if (!opened) {
              await this.dialogService.prompt({
                type: Severity.Warning,
                message: localize("unableToOpenExternal", "The browser blocked opening a new tab or window. Press 'Retry' to try again."),
                custom: {
                  markdownDetails: [{ markdown: new MarkdownString(localize("unableToOpenWindowDetail", "Please allow pop-ups for this website in your [browser settings]({0}).", "https://aka.ms/allow-vscode-popup"), true) }]
                },
                buttons: [
                  {
                    label: localize({ key: "retry", comment: ["&& denotes a mnemonic"] }, "&&Retry"),
                    run: /* @__PURE__ */ __name(() => isAllowedOpener ? windowOpenPopup(href) : windowOpenNoOpener(href), "run")
                  }
                ],
                cancelButton: true
              });
            }
          } else {
            if (isAllowedOpener) {
              windowOpenPopup(href);
            } else {
              windowOpenNoOpener(href);
            }
          }
        } else {
          const invokeProtocolHandler = /* @__PURE__ */ __name(() => {
            this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => mainWindow.location.href = href);
          }, "invokeProtocolHandler");
          invokeProtocolHandler();
          const showProtocolUrlOpenedDialog = /* @__PURE__ */ __name(async () => {
            const { downloadUrl } = this.productService;
            let detail;
            const buttons = [
              {
                label: localize({ key: "openExternalDialogButtonRetry.v2", comment: ["&& denotes a mnemonic"] }, "&&Try Again"),
                run: /* @__PURE__ */ __name(() => invokeProtocolHandler(), "run")
              }
            ];
            if (downloadUrl !== void 0) {
              detail = localize("openExternalDialogDetail.v2", "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.", this.productService.nameLong, this.productService.nameLong);
              buttons.push({
                label: localize({ key: "openExternalDialogButtonInstall.v3", comment: ["&& denotes a mnemonic"] }, "&&Install"),
                run: /* @__PURE__ */ __name(async () => {
                  await this.openerService.open(URI.parse(downloadUrl));
                  showProtocolUrlOpenedDialog();
                }, "run")
              });
            } else {
              detail = localize("openExternalDialogDetailNoInstall", "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.", this.productService.nameLong, this.productService.nameLong);
            }
            await this.hostService.withExpectedShutdown(() => this.dialogService.prompt({
              type: Severity.Info,
              message: localize("openExternalDialogTitle", "All done. You can close this tab now."),
              detail,
              buttons,
              cancelButton: true
            }));
          }, "showProtocolUrlOpenedDialog");
          if (matchesScheme(href, this.productService.urlProtocol)) {
            await showProtocolUrlOpenedDialog();
          }
        }
        return true;
      }, "openExternal")
    });
  }
  registerLabelFormatters() {
    this._register(this.labelService.registerFormatter({
      scheme: Schemas.vscodeUserData,
      priority: true,
      formatting: {
        label: "(Settings) ${path}",
        separator: "/"
      }
    }));
  }
  registerCommands() {
    CommandsRegistry.registerCommand("workbench.experimental.requestUsbDevice", async (_accessor, options) => {
      return requestUsbDevice(options);
    });
    CommandsRegistry.registerCommand("workbench.experimental.requestSerialPort", async (_accessor, options) => {
      return requestSerialPort(options);
    });
    CommandsRegistry.registerCommand("workbench.experimental.requestHidDevice", async (_accessor, options) => {
      return requestHidDevice(options);
    });
  }
};
BrowserWindow = __decorate([
  __param(0, IOpenerService),
  __param(1, ILifecycleService),
  __param(2, IDialogService),
  __param(3, ILabelService),
  __param(4, IProductService),
  __param(5, IBrowserWorkbenchEnvironmentService),
  __param(6, IWorkbenchLayoutService),
  __param(7, IInstantiationService),
  __param(8, IHostService),
  __param(9, IContextMenuService)
], BrowserWindow);
export {
  BaseWindow,
  BrowserWindow
};
//# sourceMappingURL=window.js.map
