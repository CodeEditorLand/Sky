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
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { MainThreadCustomEditors } from "./mainThreadCustomEditors.js";
import { MainThreadWebviewPanels } from "./mainThreadWebviewPanels.js";
import { MainThreadWebviews } from "./mainThreadWebviews.js";
import { MainThreadWebviewsViews } from "./mainThreadWebviewViews.js";
import * as extHostProtocol from "../common/extHost.protocol.js";
import { extHostCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadWebviewManager = class MainThreadWebviewManager2 extends Disposable {
  static {
    __name(this, "MainThreadWebviewManager");
  }
  constructor(context, instantiationService) {
    super();
    const webviews = this._register(instantiationService.createInstance(MainThreadWebviews, context));
    context.set(extHostProtocol.MainContext.MainThreadWebviews, webviews);
    const webviewPanels = this._register(instantiationService.createInstance(MainThreadWebviewPanels, context, webviews));
    context.set(extHostProtocol.MainContext.MainThreadWebviewPanels, webviewPanels);
    const customEditors = this._register(instantiationService.createInstance(MainThreadCustomEditors, context, webviews, webviewPanels));
    context.set(extHostProtocol.MainContext.MainThreadCustomEditors, customEditors);
    const webviewViews = this._register(instantiationService.createInstance(MainThreadWebviewsViews, context, webviews));
    context.set(extHostProtocol.MainContext.MainThreadWebviewViews, webviewViews);
  }
};
MainThreadWebviewManager = __decorate([
  extHostCustomer,
  __param(1, IInstantiationService)
], MainThreadWebviewManager);
export {
  MainThreadWebviewManager
};
//# sourceMappingURL=mainThreadWebviewManager.js.map
