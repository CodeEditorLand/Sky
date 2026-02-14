var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CreateIPCBlockError = /* @__PURE__ */ __name((channel, reason) => ({
  _tag: "IPCBlockError",
  channel,
  reason,
  message: `IPC channel blocked: ${reason}`,
  name: "IPCBlockError",
  cause: channel
}), "CreateIPCBlockError");
var IPCBlockError_default = CreateIPCBlockError;
export {
  IPCBlockError_default as default
};
//# sourceMappingURL=IPCBlockError.js.map
