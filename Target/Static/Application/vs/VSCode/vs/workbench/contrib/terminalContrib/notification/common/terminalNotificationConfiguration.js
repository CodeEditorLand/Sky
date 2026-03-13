import { localize } from "../../../../../nls.js";
var TerminalOscNotificationsSettingId;
(function(TerminalOscNotificationsSettingId2) {
  TerminalOscNotificationsSettingId2["EnableNotifications"] = "terminal.integrated.enableNotifications";
})(TerminalOscNotificationsSettingId || (TerminalOscNotificationsSettingId = {}));
const terminalOscNotificationsConfiguration = {
  [
    "terminal.integrated.enableNotifications"
    /* TerminalOscNotificationsSettingId.EnableNotifications */
  ]: {
    description: localize("terminal.integrated.enableNotifications", "Controls whether notifications sent from the terminal via OSC 99 are shown. This uses notifications inside the product instead of desktop notifications. Sounds, icons and filtering are not supported."),
    type: "boolean",
    default: true
  }
};
export {
  TerminalOscNotificationsSettingId,
  terminalOscNotificationsConfiguration
};
//# sourceMappingURL=terminalNotificationConfiguration.js.map
