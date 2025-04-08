var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(async function() {
  const bootstrapWindow = window.MonacoBootstrapWindow;
  const { result, configuration } = await bootstrapWindow.load("vs/code/electron-sandbox/processExplorer/processExplorerMain", {
    configureDeveloperSettings: /* @__PURE__ */ __name(function() {
      return {
        forceEnableDeveloperKeybindings: true
      };
    }, "configureDeveloperSettings")
  });
  result.startup(configuration);
})();
//# sourceMappingURL=processExplorer.js.map
