var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { Client as IPCElectronClient } from "../../../base/parts/ipc/electron-sandbox/ipc.electron.js";
import { IMainProcessService } from "../common/mainProcessService.js";
class ElectronIPCMainProcessService extends Disposable {
  static {
    __name(this, "ElectronIPCMainProcessService");
  }
  mainProcessConnection;
  constructor(windowId) {
    super();
    this.mainProcessConnection = this._register(new IPCElectronClient(`window:${windowId}`));
  }
  getChannel(channelName) {
    return this.mainProcessConnection.getChannel(channelName);
  }
  registerChannel(channelName, channel) {
    this.mainProcessConnection.registerChannel(channelName, channel);
  }
}
export {
  ElectronIPCMainProcessService
};
//# sourceMappingURL=mainProcessService.js.map
