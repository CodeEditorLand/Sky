var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import StatusBarTag from "../Tag/StatusBarTag.js";
const makeMockStatusBar = /* @__PURE__ */ __name(() => ({
  createItem: /* @__PURE__ */ __name((item) => Effect.succeed({
    ...item,
    id: `mock-statusbar-${Date.now()}`
  }), "createItem"),
  updateItem: /* @__PURE__ */ __name((_id, _updates) => Effect.void, "updateItem"),
  removeItem: /* @__PURE__ */ __name((_id) => Effect.void, "removeItem"),
  getItem: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getItem"),
  items: Effect.succeed([]),
  itemsChanges: Stream.empty,
  setItemVisibility: /* @__PURE__ */ __name((_id, _visible) => Effect.void, "setItemVisibility"),
  getItemText: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getItemText"),
  setItemText: /* @__PURE__ */ __name((_id, _text) => Effect.void, "setItemText")
}), "makeMockStatusBar");
const StatusBarMockLive = Layer.succeed(StatusBarTag, makeMockStatusBar());
var StatusBarMock_default = StatusBarMockLive;
export {
  StatusBarMock_default as default,
  makeMockStatusBar
};
//# sourceMappingURL=StatusBarMock.js.map
