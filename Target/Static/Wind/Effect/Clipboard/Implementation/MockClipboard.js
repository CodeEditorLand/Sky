var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
const MockClipboardService = {
  readText: /* @__PURE__ */ __name(() => Effect.succeed("mock clipboard text"), "readText"),
  writeText: /* @__PURE__ */ __name((_text) => Effect.void, "writeText"),
  readHTML: /* @__PURE__ */ __name(() => Effect.succeed(""), "readHTML"),
  writeHTML: /* @__PURE__ */ __name(() => Effect.void, "writeHTML"),
  readImage: /* @__PURE__ */ __name(() => Effect.succeed(new Blob()), "readImage"),
  writeImage: /* @__PURE__ */ __name(() => Effect.void, "writeImage"),
  hasText: /* @__PURE__ */ __name(() => Effect.succeed(true), "hasText"),
  clear: /* @__PURE__ */ __name(() => Effect.void, "clear")
};
var MockClipboard_default = MockClipboardService;
export {
  MockClipboardService,
  MockClipboard_default as default
};
//# sourceMappingURL=MockClipboard.js.map
