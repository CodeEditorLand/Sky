var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "./commonFacade/deps.js";
function handleBugIndicatingErrorRecovery(message) {
  const err = new Error("BugIndicatingErrorRecovery: " + message);
  onUnexpectedError(err);
  console.error("recovered from an error that indicates a bug", err);
}
__name(handleBugIndicatingErrorRecovery, "handleBugIndicatingErrorRecovery");
export {
  handleBugIndicatingErrorRecovery
};
//# sourceMappingURL=base.js.map
