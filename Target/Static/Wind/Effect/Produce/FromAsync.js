var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
function FromAsync(Source, CreateProblem, StaticData) {
  return (...args) => Effect.tryPromise({
    try: /* @__PURE__ */ __name(() => Source(...args), "try"),
    catch: /* @__PURE__ */ __name((cause) => CreateProblem({ ...StaticData, cause }), "catch")
  });
}
__name(FromAsync, "FromAsync");
export {
  FromAsync
};
//# sourceMappingURL=FromAsync.js.map
