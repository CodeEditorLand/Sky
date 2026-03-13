var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IPowerService } from "../common/powerService.js";
class BrowserPowerService extends Disposable {
  static {
    __name(this, "BrowserPowerService");
  }
  constructor() {
    super(...arguments);
    this.onDidSuspend = Event.None;
    this.onDidResume = Event.None;
    this.onDidChangeOnBatteryPower = Event.None;
    this.onDidChangeThermalState = Event.None;
    this.onDidChangeSpeedLimit = Event.None;
    this.onWillShutdown = Event.None;
    this.onDidLockScreen = Event.None;
    this.onDidUnlockScreen = Event.None;
  }
  async getSystemIdleState(_idleThreshold) {
    return "unknown";
  }
  async getSystemIdleTime() {
    return 0;
  }
  async getCurrentThermalState() {
    return "unknown";
  }
  async isOnBatteryPower() {
    return false;
  }
  async startPowerSaveBlocker(_type) {
    return -1;
  }
  async stopPowerSaveBlocker(_id) {
    return false;
  }
  async isPowerSaveBlockerStarted(_id) {
    return false;
  }
}
registerSingleton(
  IPowerService,
  BrowserPowerService,
  1
  /* InstantiationType.Delayed */
);
export {
  BrowserPowerService
};
//# sourceMappingURL=powerService.js.map
