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
import { SerializedError, onUnexpectedError, transformErrorFromSerialization } from "../../../base/common/errors.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { MainContext, MainThreadErrorsShape } from "../common/extHost.protocol.js";
let MainThreadErrors = class {
  dispose() {
  }
  $onUnexpectedError(err) {
    if (err && err.$isError) {
      err = transformErrorFromSerialization(err);
    }
    onUnexpectedError(err);
  }
};
__name(MainThreadErrors, "MainThreadErrors");
MainThreadErrors = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadErrors)
], MainThreadErrors);
export {
  MainThreadErrors
};
//# sourceMappingURL=mainThreadErrors.js.map
