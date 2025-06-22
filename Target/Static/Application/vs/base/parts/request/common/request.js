var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const offlineName = "Offline";
function isOfflineError(error) {
  if (error instanceof OfflineError) {
    return true;
  }
  return error instanceof Error && error.name === offlineName && error.message === offlineName;
}
__name(isOfflineError, "isOfflineError");
class OfflineError extends Error {
  static {
    __name(this, "OfflineError");
  }
  constructor() {
    super(offlineName);
    this.name = this.message;
  }
}
export {
  OfflineError,
  isOfflineError
};
//# sourceMappingURL=request.js.map
