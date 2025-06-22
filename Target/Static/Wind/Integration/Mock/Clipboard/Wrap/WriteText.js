var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../../../effect";
const MockWriteText = /* @__PURE__ */ __name((Text) => Effect.logInfo(`MockWriteText received: "${Text}"`).pipe(Effect.asUnit), "MockWriteText");
export {
  MockWriteText
};
//# sourceMappingURL=WriteText.js.map
