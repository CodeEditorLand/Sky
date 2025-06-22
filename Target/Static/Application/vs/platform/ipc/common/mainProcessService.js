var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IMainProcessService = createDecorator("mainProcessService");
class MainProcessService {
  static {
    __name(this, "MainProcessService");
  }
  constructor(server, router) {
    this.server = server;
    this.router = router;
  }
  getChannel(channelName) {
    return this.server.getChannel(channelName, this.router);
  }
  registerChannel(channelName, channel) {
    this.server.registerChannel(channelName, channel);
  }
}
export {
  IMainProcessService,
  MainProcessService
};
//# sourceMappingURL=mainProcessService.js.map
