var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../nls.js";
const commandPrefix = "workbench.action.browser";
var BrowserViewCommandId;
(function(BrowserViewCommandId2) {
  BrowserViewCommandId2["Open"] = "workbench.action.browser.open";
  BrowserViewCommandId2["NewTab"] = "workbench.action.browser.newTab";
  BrowserViewCommandId2["GoBack"] = "workbench.action.browser.goBack";
  BrowserViewCommandId2["GoForward"] = "workbench.action.browser.goForward";
  BrowserViewCommandId2["Reload"] = "workbench.action.browser.reload";
  BrowserViewCommandId2["HardReload"] = "workbench.action.browser.hardReload";
  BrowserViewCommandId2["FocusUrlInput"] = "workbench.action.browser.focusUrlInput";
  BrowserViewCommandId2["AddElementToChat"] = "workbench.action.browser.addElementToChat";
  BrowserViewCommandId2["AddConsoleLogsToChat"] = "workbench.action.browser.addConsoleLogsToChat";
  BrowserViewCommandId2["ToggleDevTools"] = "workbench.action.browser.toggleDevTools";
  BrowserViewCommandId2["OpenExternal"] = "workbench.action.browser.openExternal";
  BrowserViewCommandId2["ClearGlobalStorage"] = "workbench.action.browser.clearGlobalStorage";
  BrowserViewCommandId2["ClearWorkspaceStorage"] = "workbench.action.browser.clearWorkspaceStorage";
  BrowserViewCommandId2["ClearEphemeralStorage"] = "workbench.action.browser.clearEphemeralStorage";
  BrowserViewCommandId2["OpenSettings"] = "workbench.action.browser.openSettings";
  BrowserViewCommandId2["ShowFind"] = "workbench.action.browser.showFind";
  BrowserViewCommandId2["HideFind"] = "workbench.action.browser.hideFind";
  BrowserViewCommandId2["FindNext"] = "workbench.action.browser.findNext";
  BrowserViewCommandId2["FindPrevious"] = "workbench.action.browser.findPrevious";
})(BrowserViewCommandId || (BrowserViewCommandId = {}));
var BrowserNewPageLocation;
(function(BrowserNewPageLocation2) {
  BrowserNewPageLocation2["Foreground"] = "foreground";
  BrowserNewPageLocation2["Background"] = "background";
  BrowserNewPageLocation2["NewWindow"] = "newWindow";
})(BrowserNewPageLocation || (BrowserNewPageLocation = {}));
var BrowserViewStorageScope;
(function(BrowserViewStorageScope2) {
  BrowserViewStorageScope2["Global"] = "global";
  BrowserViewStorageScope2["Workspace"] = "workspace";
  BrowserViewStorageScope2["Ephemeral"] = "ephemeral";
})(BrowserViewStorageScope || (BrowserViewStorageScope = {}));
const ipcBrowserViewChannelName = "browserView";
const browserZoomFactors = [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
const browserZoomDefaultIndex = browserZoomFactors.indexOf(1);
function browserZoomLabel(zoomFactor) {
  return localize("browserZoomPercent", "{0}%", Math.round(zoomFactor * 100));
}
__name(browserZoomLabel, "browserZoomLabel");
const browserViewIsolatedWorldId = 999;
export {
  BrowserNewPageLocation,
  BrowserViewCommandId,
  BrowserViewStorageScope,
  browserViewIsolatedWorldId,
  browserZoomDefaultIndex,
  browserZoomFactors,
  browserZoomLabel,
  ipcBrowserViewChannelName
};
//# sourceMappingURL=browserView.js.map
