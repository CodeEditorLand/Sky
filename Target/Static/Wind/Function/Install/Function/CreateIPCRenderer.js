var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ValidateIPCChannel } from "./ValidateIPCChannel.js";
function CreateIPCRenderer() {
  const self = {
    send: /* @__PURE__ */ __name((Channel) => {
      if (!ValidateIPCChannel(Channel)) return;
    }, "send"),
    invoke: /* @__PURE__ */ __name(async (Channel) => {
      if (!ValidateIPCChannel(Channel)) {
        throw new Error(`Invalid IPC channel: ${Channel}`);
      }
      return {};
    }, "invoke"),
    on: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "on"),
    once: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "once"),
    removeListener: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "removeListener")
  };
  return self;
}
__name(CreateIPCRenderer, "CreateIPCRenderer");
export {
  CreateIPCRenderer
};
//# sourceMappingURL=CreateIPCRenderer.js.map
