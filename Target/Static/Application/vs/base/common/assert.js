var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError, onUnexpectedError } from "./errors.js";
function ok(value, message) {
  if (!value) {
    throw new Error(message ? `Assertion failed (${message})` : "Assertion Failed");
  }
}
__name(ok, "ok");
function assertNever(value, message = "Unreachable") {
  throw new Error(message);
}
__name(assertNever, "assertNever");
function softAssertNever(value) {
}
__name(softAssertNever, "softAssertNever");
function assert(condition, messageOrError = "unexpected state") {
  if (!condition) {
    const errorToThrow = typeof messageOrError === "string" ? new BugIndicatingError(`Assertion Failed: ${messageOrError}`) : messageOrError;
    throw errorToThrow;
  }
}
__name(assert, "assert");
function softAssert(condition, message = "Soft Assertion Failed") {
  if (!condition) {
    onUnexpectedError(new BugIndicatingError(message));
  }
}
__name(softAssert, "softAssert");
function assertFn(condition) {
  if (!condition()) {
    debugger;
    condition();
    onUnexpectedError(new BugIndicatingError("Assertion Failed"));
  }
}
__name(assertFn, "assertFn");
function checkAdjacentItems(items, predicate) {
  let i = 0;
  while (i < items.length - 1) {
    const a = items[i];
    const b = items[i + 1];
    if (!predicate(a, b)) {
      return false;
    }
    i++;
  }
  return true;
}
__name(checkAdjacentItems, "checkAdjacentItems");
export {
  assert,
  assertFn,
  assertNever,
  checkAdjacentItems,
  ok,
  softAssert,
  softAssertNever
};
//# sourceMappingURL=assert.js.map
