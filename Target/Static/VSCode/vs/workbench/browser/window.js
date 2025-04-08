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
import { isSafari, setFullscreen } from "../../base/browser/browser.js";
import { addDisposableListener, EventHelper, EventType, getActiveWindow, getWindow, getWindowById, getWindows, getWindowsCount, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess } from "../../base/browser/dom.js";
import { DomEmitter } from "../../base/browser/event.js";
import { HidDeviceData, requestHidDevice, requestSerialPort, requestUsbDevice, SerialPortData, UsbDeviceData } from "../../base/browser/deviceAccess.js";
import { timeout } from "../../base/common/async.js";
import { Event } from "../../base/common/event.js";
import { Disposable, IDisposable, dispose, toDisposable } from "../../base/common/lifecycle.js";
import { matchesScheme, Schemas } from "../../base/common/network.js";
import { isIOS, isMacintosh } from "../../base/common/platform.js";
import Severity from "../../base/common/severity.js";
import { URI } from "../../base/common/uri.js";
import { localize } from "../../nls.js";
import { CommandsRegistry } from "../../platform/commands/common/commands.js";
import { IDialogService, IPromptButton } from "../../platform/dialogs/common/dialogs.js";
import { IInstantiationService, ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../platform/label/common/label.js";
import { IOpenerService } from "../../platform/opener/common/opener.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { IBrowserWorkbenchEnvironmentService } from "../services/environment/browser/environmentService.js";
import { IWorkbenchLayoutService } from "../services/layout/browser/layoutService.js";
import { BrowserLifecycleService } from "../services/lifecycle/browser/lifecycleService.js";
import { ILifecycleService, ShutdownReason } from "../services/lifecycle/common/lifecycle.js";
import { IHostService } from "../services/host/browser/host.js";
import { registerWindowDriver } from "../services/driver/browser/driver.js";
import { CodeWindow, isAuxiliaryWindow, mainWindow } from "../../base/browser/window.js";
import { createSingleCallFunction } from "../../base/common/functional.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { IWorkbenchEnvironmentService } from "../services/environment/common/environmentService.js";
let BaseWindow = class extends Disposable {
  constructor(targetWindow, dom = { getWindowsCount, getWindows }, hostService, environmentService) {
    super();
    this.hostService = hostService;
    this.environmentService = environmentService;
    this.enableWindowFocusOnElementFocus(targetWindow);
    this.enableMultiWindowAwareTimeout(targetWindow, dom);
    this.registerFullScreenListeners(targetWindow.vscodeWindowId);
  }
  static {
    __name(this, "BaseWindow");
  }
  static TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER;
  // try to not compete with the IDs of native `setTimeout`
  static TIMEOUT_DISPOSABLES = /* @__PURE__ */ new Map();
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
      const timeoutHandle = BaseWindow.TIMEOUT_HANDLES++;
      BaseWindow.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);
      const handlerFn = createSingleCallFunction(handler, () => {
        dispose(timeoutDisposables);
        BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      });
      for (const { window, disposables } of dom.getWindows()) {
        if (isAuxiliaryWindow(window) && window.document.visibilityState === "hidden") {
          continue;
        }
        let didClear = false;
        const handle = window.vscodeOriginalSetTimeout.apply(this, [(...args2) => {
          if (didClear) {
            return;
          }
          handlerFn(...args2);
        }, timeout2, ...args]);
        const timeoutDisposable = toDisposable(() => {
          didClear = true;
          window.vscodeOriginalClearTimeout(handle);
          timeoutDisposables.delete(timeoutDisposable);
        });
        disposables.add(timeoutDisposable);
        timeoutDisposables.add(timeoutDisposable);
      }
      return timeoutHandle;
    };
    targetWindow.clearTimeout = function(timeoutHandle) {
      const timeoutDisposables = typeof timeoutHandle === "number" ? BaseWindow.TIMEOUT_DISPOSABLES.get(timeoutHandle) : void 0;
      if (timeoutDisposables) {
        dispose(timeoutDisposables);
        BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      } else {
        originalClearTimeout.apply(this, [timeoutHandle]);
      }
    };
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
  //#region Confirm on Shutdown
  static async confirmOnShutdown(accessor, reason) {
    const dialogService = accessor.get(IDialogService);
    const configurationService = accessor.get(IConfigurationService);
    const message = reason === ShutdownReason.QUIT ? isMacintosh ? localize("quitMessageMac", "Are you sure you want to quit?") : localize("quitMessage", "Are you sure you want to exit?") : localize("closeWindowMessage", "Are you sure you want to close the window?");
    const primaryButton = reason === ShutdownReason.QUIT ? isMacintosh ? localize({ key: "quitButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Quit") : localize({ key: "exitButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Exit") : localize({ key: "closeWindowButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Close Window");
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
};
BaseWindow = __decorateClass([
  __decorateParam(2, IHostService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], BaseWindow);
let BrowserWindow = class extends BaseWindow {
  constructor(openerService, lifecycleService, dialogService, labelService, productService, browserEnvironmentService, layoutService, instantiationService, hostService) {
    super(mainWindow, void 0, hostService, browserEnvironmentService);
    this.openerService = openerService;
    this.lifecycleService = lifecycleService;
    this.dialogService = dialogService;
    this.labelService = labelService;
    this.productService = productService;
    this.browserEnvironmentService = browserEnvironmentService;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.registerListeners();
    this.create();
  }
  static {
    __name(this, "BrowserWindow");
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
    Event.toPromise(Event.any(
      Event.once(new DomEmitter(mainWindow.document.body, EventType.KEY_DOWN, true).event),
      Event.once(new DomEmitter(mainWindow.document.body, EventType.MOUSE_DOWN, true).event)
    )).then(async () => {
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
                message: localize("unableToOpenExternal", "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),
                detail: href,
                buttons: [
                  {
                    label: localize({ key: "open", comment: ["&& denotes a mnemonic"] }, "&&Open"),
                    run: /* @__PURE__ */ __name(() => isAllowedOpener ? windowOpenPopup(href) : windowOpenNoOpener(href), "run")
                  },
                  {
                    label: localize({ key: "learnMore", comment: ["&& denotes a mnemonic"] }, "&&Learn More"),
                    run: /* @__PURE__ */ __name(() => this.openerService.open(URI.parse("https://aka.ms/allow-vscode-popup")), "run")
                  }
                ],
                cancelButton: true
              });
            }
          } else {
            isAllowedOpener ? windowOpenPopup(href) : windowOpenNoOpener(href);
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
              detail = localize(
                "openExternalDialogDetail.v2",
                "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.",
                this.productService.nameLong,
                this.productService.nameLong
              );
              buttons.push({
                label: localize({ key: "openExternalDialogButtonInstall.v3", comment: ["&& denotes a mnemonic"] }, "&&Install"),
                run: /* @__PURE__ */ __name(async () => {
                  await this.openerService.open(URI.parse(downloadUrl));
                  showProtocolUrlOpenedDialog();
                }, "run")
              });
            } else {
              detail = localize(
                "openExternalDialogDetailNoInstall",
                "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.",
                this.productService.nameLong,
                this.productService.nameLong
              );
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
BrowserWindow = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IHostService)
], BrowserWindow);
export {
  BaseWindow,
  BrowserWindow
};
//# sourceMappingURL=window.js.map
