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
import { Event } from "../../../../../base/common/event.js";
import { IMouseWheelEvent } from "../../../../../base/browser/mouseEvent.js";
import { MouseWheelClassifier } from "../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Disposable, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../../../base/common/platform.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalInstance, IXtermTerminal } from "../../../terminal/browser/terminal.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { localize2 } from "../../../../../nls.js";
import { isNumber } from "../../../../../base/common/types.js";
import { defaultTerminalFontSize } from "../../../terminal/common/terminalConfiguration.js";
import { TerminalZoomCommandId, TerminalZoomSettingId } from "../common/terminal.zoom.js";
let TerminalMouseWheelZoomContribution = class extends Disposable {
  constructor(_ctx, _configurationService) {
    super();
    this._configurationService = _configurationService;
  }
  static {
    __name(this, "TerminalMouseWheelZoomContribution");
  }
  static ID = "terminal.mouseWheelZoom";
  /**
   * Currently focused find widget. This is used to track action context since
   * 'active terminals' are only tracked for non-detached terminal instanecs.
   */
  static activeFindWidget;
  static get(instance) {
    return instance.getContribution(TerminalMouseWheelZoomContribution.ID);
  }
  _listener = this._register(new MutableDisposable());
  xtermOpen(xterm) {
    this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(TerminalZoomSettingId.MouseWheelZoom)) {
        if (!!this._configurationService.getValue(TerminalZoomSettingId.MouseWheelZoom)) {
          this._setupMouseWheelZoomListener(xterm.raw);
        } else {
          this._listener.clear();
        }
      }
    }));
  }
  _getConfigFontSize() {
    return this._configurationService.getValue(TerminalSettingId.FontSize);
  }
  _setupMouseWheelZoomListener(raw) {
    const classifier = MouseWheelClassifier.INSTANCE;
    let prevMouseWheelTime = 0;
    let gestureStartFontSize = this._getConfigFontSize();
    let gestureHasZoomModifiers = false;
    let gestureAccumulatedDelta = 0;
    raw.attachCustomWheelEventHandler((e) => {
      const browserEvent = e;
      if (classifier.isPhysicalMouseWheel()) {
        if (this._hasMouseWheelZoomModifiers(browserEvent)) {
          const delta = browserEvent.deltaY > 0 ? -1 : 1;
          this._configurationService.updateValue(TerminalSettingId.FontSize, this._getConfigFontSize() + delta);
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
          return false;
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
          this._configurationService.updateValue(TerminalSettingId.FontSize, gestureStartFontSize + delta);
          gestureAccumulatedDelta += browserEvent.deltaY;
          browserEvent.preventDefault();
          browserEvent.stopPropagation();
          return false;
        }
      }
      return true;
    });
    this._listener.value = toDisposable(() => raw.attachCustomWheelEventHandler(() => true));
  }
  _hasMouseWheelZoomModifiers(browserEvent) {
    return isMacintosh ? (browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey : browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey;
  }
};
TerminalMouseWheelZoomContribution = __decorateClass([
  __decorateParam(1, IConfigurationService)
], TerminalMouseWheelZoomContribution);
registerTerminalContribution(TerminalMouseWheelZoomContribution.ID, TerminalMouseWheelZoomContribution, true);
registerTerminalAction({
  id: TerminalZoomCommandId.FontZoomIn,
  title: localize2("fontZoomIn", "Increase Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value = configurationService.getValue(TerminalSettingId.FontSize);
    if (isNumber(value)) {
      await configurationService.updateValue(TerminalSettingId.FontSize, value + 1);
    }
  }, "run")
});
registerTerminalAction({
  id: TerminalZoomCommandId.FontZoomOut,
  title: localize2("fontZoomOut", "Decrease Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const value = configurationService.getValue(TerminalSettingId.FontSize);
    if (isNumber(value)) {
      await configurationService.updateValue(TerminalSettingId.FontSize, value - 1);
    }
  }, "run")
});
registerTerminalAction({
  id: TerminalZoomCommandId.FontZoomReset,
  title: localize2("fontZoomReset", "Reset Font Size"),
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    await configurationService.updateValue(TerminalSettingId.FontSize, defaultTerminalFontSize);
  }, "run")
});
//# sourceMappingURL=terminal.zoom.contribution.js.map
