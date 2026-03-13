var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IDataChannelService } from "../../../../platform/dataChannel/common/dataChannel.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
class DataChannelService extends Disposable {
  static {
    __name(this, "DataChannelService");
  }
  constructor() {
    super();
    this._onDidSendData = this._register(new Emitter());
    this.onDidSendData = this._onDidSendData.event;
  }
  getDataChannel(channelId) {
    return new CoreDataChannelImpl(channelId, this._onDidSendData);
  }
}
class CoreDataChannelImpl {
  static {
    __name(this, "CoreDataChannelImpl");
  }
  constructor(channelId, _onDidSendData) {
    this.channelId = channelId;
    this._onDidSendData = _onDidSendData;
  }
  sendData(data) {
    this._onDidSendData.fire({
      channelId: this.channelId,
      data
    });
  }
}
registerSingleton(
  IDataChannelService,
  DataChannelService,
  1
  /* InstantiationType.Delayed */
);
export {
  DataChannelService
};
//# sourceMappingURL=dataChannelService.js.map
