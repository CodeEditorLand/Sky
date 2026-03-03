var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function logBrowserOpen(telemetryService, source) {
  telemetryService.publicLog2("integratedBrowser.open", { source });
}
__name(logBrowserOpen, "logBrowserOpen");
export {
  logBrowserOpen
};
//# sourceMappingURL=browserViewTelemetry.js.map
