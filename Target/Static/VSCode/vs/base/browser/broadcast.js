var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "./window.js";
import { getErrorMessage } from "../common/errors.js";
import { Emitter } from "../common/event.js";
import { Disposable, toDisposable } from "../common/lifecycle.js";
class BroadcastDataChannel extends Disposable {
  constructor(channelName) {
    super();
    this.channelName = channelName;
    if ("BroadcastChannel" in mainWindow) {
      try {
        this.broadcastChannel = new BroadcastChannel(channelName);
        const listener = /* @__PURE__ */ __name((event) => {
          this._onDidReceiveData.fire(event.data);
        }, "listener");
        this.broadcastChannel.addEventListener("message", listener);
        this._register(toDisposable(() => {
          if (this.broadcastChannel) {
            this.broadcastChannel.removeEventListener("message", listener);
            this.broadcastChannel.close();
          }
        }));
      } catch (error) {
        console.warn("Error while creating broadcast channel. Falling back to localStorage.", getErrorMessage(error));
      }
    }
    if (!this.broadcastChannel) {
      this.channelName = `BroadcastDataChannel.${channelName}`;
      this.createBroadcastChannel();
    }
  }
  static {
    __name(this, "BroadcastDataChannel");
  }
  broadcastChannel;
  _onDidReceiveData = this._register(new Emitter());
  onDidReceiveData = this._onDidReceiveData.event;
  createBroadcastChannel() {
    const listener = /* @__PURE__ */ __name((event) => {
      if (event.key === this.channelName && event.newValue) {
        this._onDidReceiveData.fire(JSON.parse(event.newValue));
      }
    }, "listener");
    mainWindow.addEventListener("storage", listener);
    this._register(toDisposable(() => mainWindow.removeEventListener("storage", listener)));
  }
  /**
   * Sends the data to other BroadcastChannel objects set up for this channel. Data can be structured objects, e.g. nested objects and arrays.
   * @param data data to broadcast
   */
  postData(data) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(data);
    } else {
      localStorage.removeItem(this.channelName);
      localStorage.setItem(this.channelName, JSON.stringify(data));
    }
  }
}
export {
  BroadcastDataChannel
};
//# sourceMappingURL=broadcast.js.map
