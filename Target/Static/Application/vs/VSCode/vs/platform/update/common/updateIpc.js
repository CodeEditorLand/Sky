var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { State } from "./update.js";
class UpdateChannel {
  static {
    __name(this, "UpdateChannel");
  }
  constructor(service) {
    this.service = service;
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
        return this.service.downloadUpdate(arg);
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
      case "setInternalOrg":
        return this.service.setInternalOrg(arg);
    }
    throw new Error(`Call not found: ${command}`);
  }
}
class UpdateChannelClient {
  static {
    __name(this, "UpdateChannelClient");
  }
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
    this._onStateChange.fire(state);
  }
  constructor(channel) {
    this.channel = channel;
    this.disposables = new DisposableStore();
    this._onStateChange = this.disposables.add(new Emitter());
    this.onStateChange = this._onStateChange.event;
    this._state = State.Uninitialized;
    this.disposables.add(this.channel.listen("onStateChange")((state) => this.state = state));
    this.channel.call("_getInitialState").then((state) => this.state = state);
  }
  checkForUpdates(explicit) {
    return this.channel.call("checkForUpdates", explicit);
  }
  downloadUpdate(explicit) {
    return this.channel.call("downloadUpdate", explicit);
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
  setInternalOrg(internalOrg) {
    return this.channel.call("setInternalOrg", internalOrg);
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
