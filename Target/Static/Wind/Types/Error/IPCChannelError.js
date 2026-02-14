var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class IPCChannelError extends Error {
  constructor(channel, cause) {
    super(`IPC channel '${channel}' error: ${String(cause)}`);
    this.channel = channel;
    this.cause = cause;
  }
  static {
    __name(this, "IPCChannelError");
  }
  _tag = "IPCChannelError";
}
export {
  IPCChannelError
};
//# sourceMappingURL=IPCChannelError.js.map
