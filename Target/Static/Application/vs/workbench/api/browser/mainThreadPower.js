var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Disposable } from "../../../base/common/lifecycle.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IPowerService } from "../../services/power/common/powerService.js";
let MainThreadPower = class MainThreadPower2 extends Disposable {
  static {
    __name(this, "MainThreadPower");
  }
  constructor(extHostContext, powerService) {
    super();
    this.powerService = powerService;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostPower);
    this._register(this.powerService.onDidSuspend(this.proxy.$onDidSuspend, this.proxy));
    this._register(this.powerService.onDidResume(this.proxy.$onDidResume, this.proxy));
    this._register(this.powerService.onDidChangeOnBatteryPower(this.proxy.$onDidChangeOnBatteryPower, this.proxy));
    this._register(this.powerService.onDidChangeThermalState((state) => this.proxy.$onDidChangeThermalState(state), this));
    this._register(this.powerService.onDidChangeSpeedLimit(this.proxy.$onDidChangeSpeedLimit, this.proxy));
    this._register(this.powerService.onWillShutdown(this.proxy.$onWillShutdown, this.proxy));
    this._register(this.powerService.onDidLockScreen(this.proxy.$onDidLockScreen, this.proxy));
    this._register(this.powerService.onDidUnlockScreen(this.proxy.$onDidUnlockScreen, this.proxy));
  }
  async $getSystemIdleState(idleThreshold) {
    return this.powerService.getSystemIdleState(idleThreshold);
  }
  async $getSystemIdleTime() {
    return this.powerService.getSystemIdleTime();
  }
  async $getCurrentThermalState() {
    return this.powerService.getCurrentThermalState();
  }
  async $isOnBatteryPower() {
    return this.powerService.isOnBatteryPower();
  }
  async $startPowerSaveBlocker(type) {
    return this.powerService.startPowerSaveBlocker(type);
  }
  async $stopPowerSaveBlocker(id) {
    return this.powerService.stopPowerSaveBlocker(id);
  }
  async $isPowerSaveBlockerStarted(id) {
    return this.powerService.isPowerSaveBlockerStarted(id);
  }
};
MainThreadPower = __decorate([
  extHostNamedCustomer(MainContext.MainThreadPower),
  __param(1, IPowerService)
], MainThreadPower);
export {
  MainThreadPower
};
//# sourceMappingURL=mainThreadPower.js.map
