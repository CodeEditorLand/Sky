(function() {
  const { contextBridge } = require("electron");
  const globals = {
    /**
     * Get the currently selected text in the page.
     */
    getSelectedText() {
      try {
        return window.getSelection()?.toString() ?? "";
      } catch {
        return "";
      }
    }
  };
  try {
    contextBridge.exposeInIsolatedWorld(999, "browserViewAPI", globals);
  } catch (error) {
    console.error(error);
  }
})();
//# sourceMappingURL=preload-browserView.js.map
