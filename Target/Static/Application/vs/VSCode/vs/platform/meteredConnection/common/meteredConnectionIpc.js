var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
const METERED_CONNECTION_CHANNEL = "meteredConnection";
var MeteredConnectionCommand;
(function(MeteredConnectionCommand2) {
  MeteredConnectionCommand2["OnDidChangeIsConnectionMetered"] = "OnDidChangeIsConnectionMetered";
  MeteredConnectionCommand2["IsConnectionMetered"] = "IsConnectionMetered";
  MeteredConnectionCommand2["SetIsBrowserConnectionMetered"] = "SetIsBrowserConnectionMetered";
})(MeteredConnectionCommand || (MeteredConnectionCommand = {}));
class MeteredConnectionChannelClient extends Disposable {
  static {
    __name(this, "MeteredConnectionChannelClient");
  }
  get isConnectionMetered() {
    return this._isConnectionMetered;
  }
  constructor(channel) {
    super();
    this._onDidChangeIsConnectionMetered = this._register(new Emitter());
    this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
    this._isConnectionMetered = false;
    channel.call(MeteredConnectionCommand.IsConnectionMetered).then((value) => {
      this._isConnectionMetered = value;
      if (value) {
        this._onDidChangeIsConnectionMetered.fire(value);
      }
    });
    this._register(channel.listen(MeteredConnectionCommand.OnDidChangeIsConnectionMetered)((value) => {
      if (this._isConnectionMetered !== value) {
        this._isConnectionMetered = value;
        this._onDidChangeIsConnectionMetered.fire(value);
      }
    }));
  }
}
export {
  METERED_CONNECTION_CHANNEL,
  MeteredConnectionChannelClient,
  MeteredConnectionCommand
};
//# sourceMappingURL=meteredConnectionIpc.js.map
