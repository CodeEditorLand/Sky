var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function sendInlineCompletionsEndOfLifeTelemetry(dataChannel, endOfLifeSummary) {
  dataChannel.publicLog2("inlineCompletion.endOfLife", endOfLifeSummary);
}
__name(sendInlineCompletionsEndOfLifeTelemetry, "sendInlineCompletionsEndOfLifeTelemetry");
export {
  sendInlineCompletionsEndOfLifeTelemetry
};
//# sourceMappingURL=telemetry.js.map
