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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { macLinuxKeyboardMappingEquals, windowsKeyboardMappingEquals } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import { Emitter } from "../../../../base/common/event.js";
import { OS } from "../../../../base/common/platform.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const INativeKeyboardLayoutService = createDecorator("nativeKeyboardLayoutService");
let NativeKeyboardLayoutService = class NativeKeyboardLayoutService2 extends Disposable {
  static {
    __name(this, "NativeKeyboardLayoutService");
  }
  constructor(mainProcessService) {
    super();
    this._onDidChangeKeyboardLayout = this._register(new Emitter());
    this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    this._keyboardLayoutService = ProxyChannel.toService(mainProcessService.getChannel("keyboardLayout"));
    this._initPromise = null;
    this._keyboardMapping = null;
    this._keyboardLayoutInfo = null;
    this._register(this._keyboardLayoutService.onDidChangeKeyboardLayout(async ({ keyboardLayoutInfo, keyboardMapping }) => {
      await this.initialize();
      if (keyboardMappingEquals(this._keyboardMapping, keyboardMapping)) {
        return;
      }
      this._keyboardMapping = keyboardMapping;
      this._keyboardLayoutInfo = keyboardLayoutInfo;
      this._onDidChangeKeyboardLayout.fire();
    }));
  }
  initialize() {
    if (!this._initPromise) {
      this._initPromise = this._doInitialize();
    }
    return this._initPromise;
  }
  async _doInitialize() {
    const keyboardLayoutData = await this._keyboardLayoutService.getKeyboardLayoutData();
    const { keyboardLayoutInfo, keyboardMapping } = keyboardLayoutData;
    this._keyboardMapping = keyboardMapping;
    this._keyboardLayoutInfo = keyboardLayoutInfo;
  }
  getRawKeyboardMapping() {
    return this._keyboardMapping;
  }
  getCurrentKeyboardLayout() {
    return this._keyboardLayoutInfo;
  }
};
NativeKeyboardLayoutService = __decorate([
  __param(0, IMainProcessService)
], NativeKeyboardLayoutService);
function keyboardMappingEquals(a, b) {
  if (OS === 1) {
    return windowsKeyboardMappingEquals(a, b);
  }
  return macLinuxKeyboardMappingEquals(a, b);
}
__name(keyboardMappingEquals, "keyboardMappingEquals");
export {
  INativeKeyboardLayoutService,
  NativeKeyboardLayoutService
};
//# sourceMappingURL=nativeKeyboardLayoutService.js.map
