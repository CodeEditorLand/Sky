var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IDataChannelService = createDecorator("dataChannelService");
class NullDataChannelService {
  static {
    __name(this, "NullDataChannelService");
  }
  get onDidSendData() {
    return Event.None;
  }
  getDataChannel(_channelId) {
    return {
      sendData: /* @__PURE__ */ __name(() => {
      }, "sendData")
    };
  }
}
export {
  IDataChannelService,
  NullDataChannelService
};
//# sourceMappingURL=dataChannel.js.map
