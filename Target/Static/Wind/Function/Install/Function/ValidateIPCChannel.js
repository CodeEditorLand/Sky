var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function ValidateIPCChannel(Channel) {
  if (!Channel || typeof Channel !== "string") return false;
  if (typeof navigator !== "undefined" && !Channel.startsWith("vscode:"))
    return false;
  return true;
}
__name(ValidateIPCChannel, "ValidateIPCChannel");
export {
  ValidateIPCChannel
};
//# sourceMappingURL=ValidateIPCChannel.js.map
