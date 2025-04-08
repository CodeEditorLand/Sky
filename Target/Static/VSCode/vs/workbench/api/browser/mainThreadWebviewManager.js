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
import { Disposable } from "../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { MainThreadCustomEditors } from "./mainThreadCustomEditors.js";
import { MainThreadWebviewPanels } from "./mainThreadWebviewPanels.js";
import { MainThreadWebviews } from "./mainThreadWebviews.js";
import { MainThreadWebviewsViews } from "./mainThreadWebviewViews.js";
import * as extHostProtocol from "../common/extHost.protocol.js";
import { extHostCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadWebviewManager = class extends Disposable {
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
__name(MainThreadWebviewManager, "MainThreadWebviewManager");
MainThreadWebviewManager = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService)
], MainThreadWebviewManager);
export {
  MainThreadWebviewManager
};
//# sourceMappingURL=mainThreadWebviewManager.js.map
