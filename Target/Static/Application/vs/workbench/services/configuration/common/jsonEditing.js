var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IJSONEditingService = createDecorator("jsonEditingService");
var JSONEditingErrorCode;
(function(JSONEditingErrorCode2) {
  JSONEditingErrorCode2[JSONEditingErrorCode2["ERROR_INVALID_FILE"] = 0] = "ERROR_INVALID_FILE";
})(JSONEditingErrorCode || (JSONEditingErrorCode = {}));
class JSONEditingError extends Error {
  static {
    __name(this, "JSONEditingError");
  }
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
export {
  IJSONEditingService,
  JSONEditingError,
  JSONEditingErrorCode
};
//# sourceMappingURL=jsonEditing.js.map
