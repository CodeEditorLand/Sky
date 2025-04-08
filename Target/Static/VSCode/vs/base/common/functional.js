var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function createSingleCallFunction(fn, fnDidRunCallback) {
  const _this = this;
  let didCall = false;
  let result;
  return function() {
    if (didCall) {
      return result;
    }
    didCall = true;
    if (fnDidRunCallback) {
      try {
        result = fn.apply(_this, arguments);
      } finally {
        fnDidRunCallback();
      }
    } else {
      result = fn.apply(_this, arguments);
    }
    return result;
  };
}
__name(createSingleCallFunction, "createSingleCallFunction");
export {
  createSingleCallFunction
};
//# sourceMappingURL=functional.js.map
