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
import * as dom from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalNotificationHandler } from "./terminalNotificationHandler.js";
let TerminalOscNotificationsContribution = class TerminalOscNotificationsContribution2 extends Disposable {
  static {
    __name(this, "TerminalOscNotificationsContribution");
  }
  static {
    this.ID = "terminal.oscNotifications";
  }
  constructor(_ctx, _configurationService, _notificationService, _logService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._notificationService = _notificationService;
    this._logService = _logService;
    this._handler = this._register(new TerminalNotificationHandler({
      isEnabled: /* @__PURE__ */ __name(() => this._configurationService.getValue(
        "terminal.integrated.enableNotifications"
        /* TerminalOscNotificationsSettingId.EnableNotifications */
      ) === true, "isEnabled"),
      isWindowFocused: /* @__PURE__ */ __name(() => dom.getActiveWindow().document.hasFocus(), "isWindowFocused"),
      isTerminalVisible: /* @__PURE__ */ __name(() => this._ctx.instance.isVisible, "isTerminalVisible"),
      focusTerminal: /* @__PURE__ */ __name(() => this._ctx.instance.focus(true), "focusTerminal"),
      notify: /* @__PURE__ */ __name((notification) => this._notificationService.notify(notification), "notify"),
      updateEnableNotifications: /* @__PURE__ */ __name((value) => this._configurationService.updateValue("terminal.integrated.enableNotifications", value), "updateEnableNotifications"),
      logWarn: /* @__PURE__ */ __name((message) => this._logService.warn(message), "logWarn"),
      writeToProcess: /* @__PURE__ */ __name((data) => {
        void this._ctx.instance.sendText(data, false);
      }, "writeToProcess")
    }));
  }
  xtermReady(xterm) {
    this._register(xterm.raw.parser.registerOscHandler(99, (data) => this._handler.handleSequence(data)));
  }
};
TerminalOscNotificationsContribution = __decorate([
  __param(1, IConfigurationService),
  __param(2, INotificationService),
  __param(3, ITerminalLogService)
], TerminalOscNotificationsContribution);
registerTerminalContribution(TerminalOscNotificationsContribution.ID, TerminalOscNotificationsContribution);
function getTerminalOscNotifications(instance) {
  return instance.getContribution(TerminalOscNotificationsContribution.ID);
}
__name(getTerminalOscNotifications, "getTerminalOscNotifications");
export {
  getTerminalOscNotifications
};
//# sourceMappingURL=terminal.notification.contribution.js.map
