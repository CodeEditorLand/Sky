var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
import { Telemetry } from "../../Telemetry.js";
function withMetric(name, effect, labels) {
  return Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const startTime = Date.now();
    return effect.pipe(
      Effect.tap(
        () => telemetry.recordMetric(
          `${name}_duration`,
          Date.now() - startTime,
          labels
        )
      ),
      Effect.tapError(
        (error) => telemetry.log("error", `${name} failed`, {
          error: String(error)
        })
      )
    );
  });
}
__name(withMetric, "withMetric");
export {
  withMetric as default
};
//# sourceMappingURL=withMetric.js.map
