var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtHostTestItemEvent, InvalidTestItemError } from "../../contrib/testing/common/testItemCollection.js";
import * as vscode from "vscode";
const eventPrivateApis = /* @__PURE__ */ new WeakMap();
const createPrivateApiFor = /* @__PURE__ */ __name((impl, controllerId) => {
  const api = { controllerId };
  eventPrivateApis.set(impl, api);
  return api;
}, "createPrivateApiFor");
const getPrivateApiFor = /* @__PURE__ */ __name((impl) => {
  const api = eventPrivateApis.get(impl);
  if (!api) {
    throw new InvalidTestItemError(impl?.id || "<unknown>");
  }
  return api;
}, "getPrivateApiFor");
export {
  createPrivateApiFor,
  getPrivateApiFor
};
//# sourceMappingURL=extHostTestingPrivateApi.js.map
