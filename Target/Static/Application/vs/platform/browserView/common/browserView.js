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
const browserViewIsolatedWorldId = 999;
export {
  BrowserNewPageLocation,
  BrowserViewStorageScope,
  browserViewIsolatedWorldId,
  ipcBrowserViewChannelName
};
//# sourceMappingURL=browserView.js.map
