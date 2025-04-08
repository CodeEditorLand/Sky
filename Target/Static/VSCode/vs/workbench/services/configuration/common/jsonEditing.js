var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { JSONPath } from "../../../../base/common/json.js";
const IJSONEditingService = createDecorator("jsonEditingService");
var JSONEditingErrorCode = /* @__PURE__ */ ((JSONEditingErrorCode2) => {
  JSONEditingErrorCode2[JSONEditingErrorCode2["ERROR_INVALID_FILE"] = 0] = "ERROR_INVALID_FILE";
  return JSONEditingErrorCode2;
})(JSONEditingErrorCode || {});
class JSONEditingError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  static {
    __name(this, "JSONEditingError");
  }
}
export {
  IJSONEditingService,
  JSONEditingError,
  JSONEditingErrorCode
};
//# sourceMappingURL=jsonEditing.js.map
