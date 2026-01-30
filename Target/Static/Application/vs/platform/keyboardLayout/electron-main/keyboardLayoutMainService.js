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
import * as platform from "../../../base/common/platform.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
const IKeyboardLayoutMainService = createDecorator("keyboardLayoutMainService");
let KeyboardLayoutMainService = class KeyboardLayoutMainService2 extends Disposable {
  static {
    __name(this, "KeyboardLayoutMainService");
  }
  constructor(lifecycleMainService) {
    super();
    this._onDidChangeKeyboardLayout = this._register(new Emitter());
    this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    this._initPromise = null;
    this._keyboardLayoutData = null;
    lifecycleMainService.when(
      3
      /* LifecycleMainPhase.AfterWindowOpen */
    ).then(() => this._initialize());
  }
  _initialize() {
    if (!this._initPromise) {
      this._initPromise = this._doInitialize();
    }
    return this._initPromise;
  }
  async _doInitialize() {
    const nativeKeymapMod = await import("native-keymap");
    this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
    if (!platform.isCI) {
      nativeKeymapMod.onDidChangeKeyboardLayout(() => {
        this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
        this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData);
      });
    }
  }
  async getKeyboardLayoutData() {
    await this._initialize();
    return this._keyboardLayoutData;
  }
};
KeyboardLayoutMainService = __decorate([
  __param(0, ILifecycleMainService)
], KeyboardLayoutMainService);
function readKeyboardLayoutData(nativeKeymapMod) {
  const keyboardMapping = nativeKeymapMod.getKeyMap();
  const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
  return { keyboardMapping, keyboardLayoutInfo };
}
__name(readKeyboardLayoutData, "readKeyboardLayoutData");
export {
  IKeyboardLayoutMainService,
  KeyboardLayoutMainService
};
//# sourceMappingURL=keyboardLayoutMainService.js.map
