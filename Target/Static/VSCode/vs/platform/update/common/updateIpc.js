var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { IUpdateService, State } from "./update.js";
class UpdateChannel {
  constructor(service) {
    this.service = service;
  }
  static {
    __name(this, "UpdateChannel");
  }
  listen(_, event) {
    switch (event) {
      case "onStateChange":
        return this.service.onStateChange;
    }
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, arg) {
    switch (command) {
      case "checkForUpdates":
        return this.service.checkForUpdates(arg);
      case "downloadUpdate":
        return this.service.downloadUpdate();
      case "applyUpdate":
        return this.service.applyUpdate();
      case "quitAndInstall":
        return this.service.quitAndInstall();
      case "_getInitialState":
        return Promise.resolve(this.service.state);
      case "isLatestVersion":
        return this.service.isLatestVersion();
      case "_applySpecificUpdate":
        return this.service._applySpecificUpdate(arg);
    }
    throw new Error(`Call not found: ${command}`);
  }
}
class UpdateChannelClient {
  constructor(channel) {
    this.channel = channel;
    this.disposables.add(this.channel.listen("onStateChange")((state) => this.state = state));
    this.channel.call("_getInitialState").then((state) => this.state = state);
  }
  static {
    __name(this, "UpdateChannelClient");
  }
  disposables = new DisposableStore();
  _onStateChange = new Emitter();
  onStateChange = this._onStateChange.event;
  _state = State.Uninitialized;
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
    this._onStateChange.fire(state);
  }
  checkForUpdates(explicit) {
    return this.channel.call("checkForUpdates", explicit);
  }
  downloadUpdate() {
    return this.channel.call("downloadUpdate");
  }
  applyUpdate() {
    return this.channel.call("applyUpdate");
  }
  quitAndInstall() {
    return this.channel.call("quitAndInstall");
  }
  isLatestVersion() {
    return this.channel.call("isLatestVersion");
  }
  _applySpecificUpdate(packagePath) {
    return this.channel.call("_applySpecificUpdate", packagePath);
  }
  dispose() {
    this.disposables.dispose();
  }
}
export {
  UpdateChannel,
  UpdateChannelClient
};
//# sourceMappingURL=updateIpc.js.map
