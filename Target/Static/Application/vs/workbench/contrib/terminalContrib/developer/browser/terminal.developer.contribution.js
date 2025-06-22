var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Delayer } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, dispose } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IStatusbarService } from "../../../../services/statusbar/browser/statusbar.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import "./media/developer.css";
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
var DevModeContribution_1;
registerTerminalAction({
  id: "workbench.action.terminal.showTextureAtlas",
  title: localize2("workbench.action.terminal.showTextureAtlas", "Show Terminal Texture Atlas"),
  category: Categories.Developer,
  precondition: ContextKeyExpr.or(TerminalContextKeys.isOpen),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const fileService = accessor.get(IFileService);
    const openerService = accessor.get(IOpenerService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const bitmap = await c.service.activeInstance?.xterm?.textureAtlas;
    if (!bitmap) {
      return;
    }
    const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
    const fileUri = URI.joinPath(cwdUri, "textureAtlas.png");
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("bitmaprenderer");
    if (!ctx) {
      return;
    }
    ctx.transferFromImageBitmap(bitmap);
    const blob = await new Promise((res) => canvas.toBlob(res));
    if (!blob) {
      return;
    }
    await fileService.writeFile(fileUri, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
    openerService.open(fileUri);
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.writeDataToTerminal",
  title: localize2("workbench.action.terminal.writeDataToTerminal", "Write Data to Terminal"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    const instance = await c.service.getActiveOrCreateInstance();
    await c.service.revealActiveTerminal();
    await instance.processReady;
    if (!instance.xterm) {
      throw new Error("Cannot write data to terminal if xterm isn't initialized");
    }
    const data = await quickInputService.input({
      value: "",
      placeHolder: "Enter data (supports \\n, \\r, \\xAB)",
      prompt: localize("workbench.action.terminal.writeDataToTerminal.prompt", "Enter data to write directly to the terminal, bypassing the pty")
    });
    if (!data) {
      return;
    }
    let escapedData = data.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    while (true) {
      const match = escapedData.match(/\\x([0-9a-fA-F]{2})/);
      if (match === null || match.index === void 0 || match.length < 2) {
        break;
      }
      escapedData = escapedData.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + escapedData.slice(match.index + 4);
    }
    const xterm = instance.xterm;
    xterm._writeText(escapedData);
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.recordSession",
  title: localize2("workbench.action.terminal.recordSession", "Record Terminal Session"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commandService = accessor.get(ICommandService);
    const statusbarService = accessor.get(IStatusbarService);
    const store = new DisposableStore();
    const text = localize("workbench.action.terminal.recordSession.recording", "Recording terminal session...");
    const statusbarEntry = {
      text,
      name: text,
      ariaLabel: text,
      showProgress: true
    };
    const statusbarHandle = statusbarService.addEntry(
      statusbarEntry,
      "recordSession",
      0
      /* StatusbarAlignment.LEFT */
    );
    store.add(statusbarHandle);
    const instance = await c.service.createTerminal();
    c.service.setActiveInstance(instance);
    await c.service.revealActiveTerminal();
    await Promise.all([
      instance.processReady,
      instance.focusWhenReady(true)
    ]);
    return new Promise((resolve) => {
      const events = [];
      const endRecording = /* @__PURE__ */ __name(() => {
        const session = JSON.stringify(events, null, 2);
        clipboardService.writeText(session);
        store.dispose();
        resolve();
      }, "endRecording");
      const timer = store.add(new Delayer(5e3));
      store.add(Event.runAndSubscribe(instance.onDimensionsChanged, () => {
        events.push({
          type: "resize",
          cols: instance.cols,
          rows: instance.rows
        });
        timer.trigger(endRecording);
      }));
      store.add(commandService.onWillExecuteCommand((e) => {
        events.push({
          type: "command",
          id: e.commandId
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.onWillData((data) => {
        events.push({
          type: "output",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.onDidSendText((data) => {
        events.push({
          type: "sendText",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance.xterm.raw.onData((data) => {
        events.push({
          type: "input",
          data
        });
        timer.trigger(endRecording);
      }));
      let commandDetectedRegistered = false;
      store.add(Event.runAndSubscribe(instance.capabilities.onDidAddCapability, (e) => {
        if (commandDetectedRegistered) {
          return;
        }
        const commandDetection = instance.capabilities.get(
          2
          /* TerminalCapability.CommandDetection */
        );
        if (!commandDetection) {
          return;
        }
        store.add(commandDetection.promptInputModel.onDidChangeInput((e2) => {
          events.push({
            type: "promptInputChange",
            data: commandDetection.promptInputModel.getCombinedString()
          });
          timer.trigger(endRecording);
        }));
        commandDetectedRegistered = true;
      }));
    });
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.restartPtyHost",
  title: localize2("workbench.action.terminal.restartPtyHost", "Restart Pty Host"),
  category: Categories.Developer,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const logService = accessor.get(ITerminalLogService);
    const backends = Array.from(c.instanceService.getRegisteredBackends());
    const unresponsiveBackends = backends.filter((e) => !e.isResponsive);
    const restartCandidates = unresponsiveBackends.length > 0 ? unresponsiveBackends : backends;
    for (const backend of restartCandidates) {
      logService.warn(`Restarting pty host for authority "${backend.remoteAuthority}"`);
      backend.restartPtyHost();
    }
  }, "run")
});
var DevModeContributionState;
(function(DevModeContributionState2) {
  DevModeContributionState2[DevModeContributionState2["Off"] = 0] = "Off";
  DevModeContributionState2[DevModeContributionState2["WaitingForCapability"] = 1] = "WaitingForCapability";
  DevModeContributionState2[DevModeContributionState2["On"] = 2] = "On";
})(DevModeContributionState || (DevModeContributionState = {}));
let DevModeContribution = class DevModeContribution2 extends Disposable {
  static {
    __name(this, "DevModeContribution");
  }
  static {
    DevModeContribution_1 = this;
  }
  static {
    this.ID = "terminal.devMode";
  }
  static get(instance) {
    return instance.getContribution(DevModeContribution_1.ID);
  }
  constructor(_ctx, _configurationService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._activeDevModeDisposables = this._register(new MutableDisposable());
    this._currentColor = 0;
    this._state = 0;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.developer.devMode"
        /* TerminalSettingId.DevMode */
      )) {
        this._updateDevMode();
      }
    }));
  }
  xtermReady(xterm) {
    this._xterm = xterm;
    this._updateDevMode();
  }
  _updateDevMode() {
    const devMode = this._isEnabled();
    this._xterm?.raw.element?.classList.toggle("dev-mode", devMode);
    const commandDetection = this._ctx.instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (devMode) {
      if (commandDetection) {
        if (this._state === 2) {
          return;
        }
        this._state = 2;
        const commandDecorations = new DisposableMap();
        const otherDisposables = new DisposableStore();
        this._activeDevModeDisposables.value = combinedDisposable(
          commandDecorations,
          otherDisposables,
          // Prompt input
          this._ctx.instance.onDidBlur(() => this._updateDevMode()),
          this._ctx.instance.onDidFocus(() => this._updateDevMode()),
          commandDetection.promptInputModel.onDidChangeInput(() => this._updateDevMode()),
          // Sequence markers
          commandDetection.onCommandFinished((command) => {
            const colorClass = `color-${this._currentColor}`;
            const decorations = [];
            commandDecorations.set(command, combinedDisposable(...decorations));
            if (command.promptStartMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command.promptStartMarker
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e) => {
                  e.textContent = "A";
                  e.classList.add("xterm-sequence-decoration", "top", "left", colorClass);
                }));
              }
            }
            if (command.marker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command.marker,
                x: command.startX
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e) => {
                  e.textContent = "B";
                  e.classList.add("xterm-sequence-decoration", "top", "right", colorClass);
                }));
              }
            }
            if (command.executedMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command.executedMarker,
                x: command.executedX
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e) => {
                  e.textContent = "C";
                  e.classList.add("xterm-sequence-decoration", "bottom", "left", colorClass);
                }));
              }
            }
            if (command.endMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command.endMarker
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e) => {
                  e.textContent = "D";
                  e.classList.add("xterm-sequence-decoration", "bottom", "right", colorClass);
                }));
              }
            }
            this._currentColor = (this._currentColor + 1) % 2;
          }),
          commandDetection.onCommandInvalidated((commands) => {
            for (const c of commands) {
              const decorations = commandDecorations.get(c);
              if (decorations) {
                dispose(decorations);
              }
              commandDecorations.deleteAndDispose(c);
            }
          })
        );
      } else {
        if (this._state === 1) {
          return;
        }
        this._state = 1;
        this._activeDevModeDisposables.value = this._ctx.instance.capabilities.onDidAddCapabilityType((e) => {
          if (e === 2) {
            this._updateDevMode();
          }
        });
      }
    } else {
      if (this._state === 0) {
        return;
      }
      this._state = 0;
      this._activeDevModeDisposables.clear();
    }
  }
  _isEnabled() {
    return this._configurationService.getValue(
      "terminal.integrated.developer.devMode"
      /* TerminalSettingId.DevMode */
    ) || false;
  }
};
DevModeContribution = DevModeContribution_1 = __decorate([
  __param(1, IConfigurationService)
], DevModeContribution);
registerTerminalContribution(DevModeContribution.ID, DevModeContribution);
//# sourceMappingURL=terminal.developer.contribution.js.map
