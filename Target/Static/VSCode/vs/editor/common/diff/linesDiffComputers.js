var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LegacyLinesDiffComputer } from "./legacyLinesDiffComputer.js";
import { DefaultLinesDiffComputer } from "./defaultLinesDiffComputer/defaultLinesDiffComputer.js";
import { ILinesDiffComputer } from "./linesDiffComputer.js";
const linesDiffComputers = {
  getLegacy: /* @__PURE__ */ __name(() => new LegacyLinesDiffComputer(), "getLegacy"),
  getDefault: /* @__PURE__ */ __name(() => new DefaultLinesDiffComputer(), "getDefault")
};
export {
  linesDiffComputers
};
//# sourceMappingURL=linesDiffComputers.js.map
