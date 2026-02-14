var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CreateIPCInvokeError = /* @__PURE__ */ __name((channel, cause) => ({
  _tag: "IPCInvokeError",
  channel,
  cause,
  message: `IPC invoke failed on channel '${channel}': ${String(cause)}`,
  name: "IPCInvokeError"
}), "CreateIPCInvokeError");
const CreateIPCSendError = /* @__PURE__ */ __name((channel, cause) => ({
  _tag: "IPCSendError",
  channel,
  cause,
  message: `IPC send failed on channel '${channel}': ${String(cause)}`,
  name: "IPCSendError"
}), "CreateIPCSendError");
const CreateIPCSubscriptionError = /* @__PURE__ */ __name((channel, cause) => ({
  _tag: "IPCSubscriptionError",
  channel,
  cause,
  message: `IPC subscription failed on channel '${channel}': ${String(cause)}`,
  name: "IPCSubscriptionError"
}), "CreateIPCSubscriptionError");
var IPCError_default = {
  CreateIPCInvokeError,
  CreateIPCSendError,
  CreateIPCSubscriptionError
};
export {
  CreateIPCInvokeError,
  CreateIPCSendError,
  CreateIPCSubscriptionError,
  IPCError_default as default
};
//# sourceMappingURL=IPCError.js.map
