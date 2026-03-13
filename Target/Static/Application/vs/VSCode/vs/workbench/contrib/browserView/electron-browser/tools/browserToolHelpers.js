var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function playwrightInvokeRaw(playwrightService, pageId, fn, ...args) {
  return playwrightService.invokeFunctionRaw(pageId, fn.toString(), ...args);
}
__name(playwrightInvokeRaw, "playwrightInvokeRaw");
async function playwrightInvoke(playwrightService, pageId, fn, ...args) {
  try {
    const result = await playwrightService.invokeFunction(pageId, fn.toString(), ...args);
    return {
      content: [
        { kind: "text", value: result.result ? JSON.stringify(result.result) : "Script executed successfully" },
        { kind: "text", value: result.summary }
      ]
    };
  } catch (e) {
    return errorResult(e instanceof Error ? e.message : String(e));
  }
}
__name(playwrightInvoke, "playwrightInvoke");
function errorResult(message) {
  return {
    content: [{ kind: "text", value: message }],
    toolResultError: message
  };
}
__name(errorResult, "errorResult");
export {
  errorResult,
  playwrightInvoke,
  playwrightInvokeRaw
};
//# sourceMappingURL=browserToolHelpers.js.map
