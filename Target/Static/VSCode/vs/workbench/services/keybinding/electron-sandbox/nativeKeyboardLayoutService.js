var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IKeyboardLayoutInfo, IKeyboardMapping, IMacLinuxKeyboardMapping, IWindowsKeyboardMapping, macLinuxKeyboardMappingEquals, windowsKeyboardMappingEquals } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { OperatingSystem, OS } from "../../../../base/common/platform.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { INativeKeyboardLayoutService as IBaseNativeKeyboardLayoutService } from "../../../../platform/keyboardLayout/common/keyboardLayoutService.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const INativeKeyboardLayoutService = createDecorator("nativeKeyboardLayoutService");
let NativeKeyboardLayoutService = class extends Disposable {
  static {
    __name(this, "NativeKeyboardLayoutService");
  }
  _onDidChangeKeyboardLayout = this._register(new Emitter());
  onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
  _keyboardLayoutService;
  _initPromise;
  _keyboardMapping;
  _keyboardLayoutInfo;
  constructor(mainProcessService) {
    super();
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
NativeKeyboardLayoutService = __decorateClass([
  __decorateParam(0, IMainProcessService)
], NativeKeyboardLayoutService);
function keyboardMappingEquals(a, b) {
  if (OS === OperatingSystem.Windows) {
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
