var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const CreateNotAvailableError = /* @__PURE__ */ __name((Reason) => ({
  _tag: "ClipboardNotAvailable",
  reason: Reason
}), "CreateNotAvailableError");
const CreateReadError = /* @__PURE__ */ __name((Error2) => ({
  _tag: "ClipboardReadError",
  error: Error2
}), "CreateReadError");
const CreateWriteError = /* @__PURE__ */ __name((Error2) => ({
  _tag: "ClipboardWriteError",
  error: Error2
}), "CreateWriteError");
const CreatePermissionDeniedError = /* @__PURE__ */ __name((Reason) => ({
  _tag: "ClipboardPermissionDenied",
  reason: Reason
}), "CreatePermissionDeniedError");
const CreateFormatNotSupportedError = /* @__PURE__ */ __name((Format) => ({
  _tag: "ClipboardFormatNotSupported",
  format: Format
}), "CreateFormatNotSupportedError");
const CreateSizeExceededError = /* @__PURE__ */ __name((Size, Limit) => ({
  _tag: "ClipboardSizeExceeded",
  size: Size,
  limit: Limit
}), "CreateSizeExceededError");
const helpers = {
  CreateNotAvailableError,
  CreateReadError,
  CreateWriteError,
  CreatePermissionDeniedError,
  CreateFormatNotSupportedError,
  CreateSizeExceededError
};
var ClipboardHelper_default = helpers;
export {
  CreateFormatNotSupportedError,
  CreateNotAvailableError,
  CreatePermissionDeniedError,
  CreateReadError,
  CreateSizeExceededError,
  CreateWriteError,
  ClipboardHelper_default as default
};
//# sourceMappingURL=ClipboardHelper.js.map
