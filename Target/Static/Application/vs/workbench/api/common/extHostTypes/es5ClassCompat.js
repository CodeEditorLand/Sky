var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function es5ClassCompat(target) {
  const interceptFunctions = {
    apply: /* @__PURE__ */ __name(function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const argsList = args.length === 1 ? [] : args[1];
        return Reflect.construct(target, argsList, args[0].constructor);
      }
    }, "apply"),
    call: /* @__PURE__ */ __name(function(...args) {
      if (args.length === 0) {
        return Reflect.construct(target, []);
      } else {
        const [thisArg, ...restArgs] = args;
        return Reflect.construct(target, restArgs, thisArg.constructor);
      }
    }, "call")
  };
  return Object.assign(target, interceptFunctions);
}
__name(es5ClassCompat, "es5ClassCompat");
export {
  es5ClassCompat
};
//# sourceMappingURL=es5ClassCompat.js.map
