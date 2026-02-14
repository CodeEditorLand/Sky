var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class TelemetryTag extends Context.Tag("Telemetry")() {
  static {
    __name(this, "TelemetryTag");
  }
}
const Telemetry = TelemetryTag;
export {
  Telemetry,
  TelemetryTag as default
};
//# sourceMappingURL=TelemetryTag.js.map
