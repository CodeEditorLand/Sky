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
var TerminalMouseWheelZoomContribution_1;
import { Event } from "../../../../../base/common/event.js";
import { MouseWheelClassifier } from "../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../../../base/common/platform.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { localize2 } from "../../../../../nls.js";
import { isNumber } from "../../../../../base/common/types.js";
import { defaultTerminalFontSize } from "../../../terminal/common/terminalConfiguration.js";
import * as dom from "../../../../../base/browser/dom.js";
let TerminalMouseWheelZoomContribution = class TerminalMouseWheelZoomContribution2 extends Disposable {
  static {
    __name(this, "TerminalMouseWheelZoomContribution");
  }
  static {
    TerminalMouseWheelZoomContribution_1 = this;
  }
  static {
    this.ID = "terminal.mouseWheelZoom";
  }
  static get(instance) {
    return instance.getContribution(TerminalMouseWheelZoomContribution_1.ID);
  }
  constructor(_ctx, _configurationService) {
    super();
    this._configurationService = _configurationService;
    this._listener = this._register(new MutableDisposable());
  }
  xtermOpen(xterm) {
    this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(
        "terminal.integrated.mouseWheelZoom"
        /* TerminalZoomSettingId.MouseWheelZoom */
      )) {
        if (!!this._configurationService.getValue(
          "terminal.integrated.mouseWheelZoom"
          /* TerminalZoomSettingId.MouseWheelZoom */
        )) {
          this._setupMouseWheelZoomListener(xterm.raw);
        } else {
          this._listener.clear();
        }
      }
    }));
  }
  _getConfigFontSize() {
    return this._configurationService.getValue(
      "terminal.integrated.fontSize"
      /* TerminalSettingId.FontSize */
    );
  }
  _clampFontSize(fontSize) {
    return clampTerminalFontSize(fontSize);
  }
  _setupMouseWheelZoomListener(raw) {
    const classifier = MouseWheelClassifier.INSTANCE;
    let prevMouseWheelTime = 0;
    let gestureStartFontSize = this._getConfigFontSize();
    let gestureHasZoomModifiers = false;
    let gestureAccumulatedDelta = 0;
    const wheelListener = /* @__PURE__ */ __name((browserEvent) => {
      if (classifier.isPhysicalMouseWheel()) {
        if (this._hasMouseWheelZoomModifiers(browserEvent)) {
          const delta = browserEvent.deltaY > 0 ? -1 : 1;
          const newFontSize = this._clampFontSize(this._getConfigFontSize() + delta);
          this._configurationService.updateValue("terminal.integrated.fontSize", newFontSize);
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
        }
      } else {
        if (Date.now() - prevMouseWheelTime > 50) {
          gestureStartFontSize = this._getConfigFontSize();
          gestureHasZoomModifiers = this._hasMouseWheelZoomModifiers(browserEvent);
          gestureAccumulatedDelta = 0;
        }
        prevMouseWheelTime = Date.now();
        gestureAccumulatedDelta += browserEvent.deltaY;
        if (gestureHasZoomModifiers) {
          const deltaAbs = Math.ceil(Math.abs(gestureAccumulatedDelta / 5));
          const deltaDirection = gestureAccumulatedDelta > 0 ? -1 : 1;
          const delta = deltaAbs * deltaDirection;
          const newFontSize = this._clampFontSize(gestureStartFontSize + delta);
          this._configurationService.updateValue("terminal.integrated.fontSize", newFontSize);
          gestureAccumulatedDelta += browserEvent.deltaY;
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
        }
      }
    }, "wheelListener");
    this._listener.value = dom.addDisposableListener(raw.element, dom.EventType.MOUSE_WHEEL, wheelListener, { capture: true, passive: false });
  }
  _hasMouseWheelZoomModifiers(browserEvent) {
    return isMacintosh ? (browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey : browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey;
  }
};
TerminalMouseWheelZoomContribution = TerminalMouseWheelZoomContribution_1 = __decorate([
  __param(1, IConfigurationService)
], TerminalMouseWheelZoomContribution);
registerTerminalContribution(TerminalMouseWheelZoomContribution.ID, TerminalMouseWheelZoomContribution, true);
registerTerminalAction({
  id: "workbench.action.terminal.fontZoomIn",
  title: localize2("fontZoomIn", "Increase Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value = configurationService.getValue(
      "terminal.integrated.fontSize"
      /* TerminalSettingId.FontSize */
    );
    if (isNumber(value)) {
      const newFontSize = clampTerminalFontSize(value + 1);
      await configurationService.updateValue("terminal.integrated.fontSize", newFontSize);
    }
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.fontZoomOut",
  title: localize2("fontZoomOut", "Decrease Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value = configurationService.getValue(
      "terminal.integrated.fontSize"
      /* TerminalSettingId.FontSize */
    );
    if (isNumber(value)) {
      const newFontSize = clampTerminalFontSize(value - 1);
      await configurationService.updateValue("terminal.integrated.fontSize", newFontSize);
    }
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.fontZoomReset",
  title: localize2("fontZoomReset", "Reset Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    await configurationService.updateValue("terminal.integrated.fontSize", defaultTerminalFontSize);
  }, "run")
});
function clampTerminalFontSize(fontSize) {
  return Math.max(6, Math.min(100, fontSize));
}
__name(clampTerminalFontSize, "clampTerminalFontSize");
export {
  clampTerminalFontSize
};
//# sourceMappingURL=terminal.zoom.contribution.js.map
