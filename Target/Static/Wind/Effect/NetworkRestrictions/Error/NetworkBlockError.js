var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CreateNetworkBlockError = /* @__PURE__ */ __name((url, reason) => ({
  _tag: "NetworkBlockError",
  url,
  reason,
  message: `Network request blocked: ${reason}`,
  name: "NetworkBlockError",
  cause: url
}), "CreateNetworkBlockError");
var NetworkBlockError_default = CreateNetworkBlockError;
export {
  NetworkBlockError_default as default
};
//# sourceMappingURL=NetworkBlockError.js.map
