var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IChannel, IPCServer, IServerChannel, StaticRouter } from "../../../base/parts/ipc/common/ipc.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IRemoteService } from "./services.js";
const IMainProcessService = createDecorator("mainProcessService");
class MainProcessService {
  constructor(server, router) {
    this.server = server;
    this.router = router;
  }
  static {
    __name(this, "MainProcessService");
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
