var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { HeartbeatConstants, IHeartbeatService } from "../common/terminal.js";
class HeartbeatService extends Disposable {
  static {
    __name(this, "HeartbeatService");
  }
  _onBeat = this._register(new Emitter());
  onBeat = this._onBeat.event;
  constructor() {
    super();
    const interval = setInterval(() => {
      this._onBeat.fire();
    }, HeartbeatConstants.BeatInterval);
    this._register(toDisposable(() => clearInterval(interval)));
  }
}
export {
  HeartbeatService
};
//# sourceMappingURL=heartbeatService.js.map
