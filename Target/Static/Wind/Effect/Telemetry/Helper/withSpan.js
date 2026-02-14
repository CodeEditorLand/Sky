var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
import { Telemetry } from "../../Telemetry.js";
function withSpan(name, effect, labels) {
  return Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const span = yield* telemetry.startSpan(name, labels);
    return effect.pipe(
      Effect.tap(() => span.end(true)),
      Effect.catchAll(
        (error) => Effect.gen(function* () {
          yield* span.end(false, String(error));
          return yield* Effect.fail(error);
        })
      )
    );
  });
}
__name(withSpan, "withSpan");
export {
  withSpan as default
};
//# sourceMappingURL=withSpan.js.map
