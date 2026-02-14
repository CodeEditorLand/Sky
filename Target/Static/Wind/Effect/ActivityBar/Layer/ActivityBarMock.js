var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
const ActivityBarMockLive = Layer.succeed(ActivityBarTag, {
  createItem: /* @__PURE__ */ __name((item) => Effect.succeed({
    ...item,
    id: `mock-activitybar-${Date.now()}`
  }), "createItem"),
  updateItem: /* @__PURE__ */ __name((_id, _updates) => Effect.void, "updateItem"),
  removeItem: /* @__PURE__ */ __name((_id) => Effect.void, "removeItem"),
  getItem: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getItem"),
  items: Effect.succeed([]),
  itemsChanges: Stream.empty,
  setActiveItem: /* @__PURE__ */ __name((_id) => Effect.void, "setActiveItem"),
  getActiveItem: Effect.succeed(void 0),
  activeItemChanges: Stream.empty,
  setBadge: /* @__PURE__ */ __name((_id, _badge) => Effect.void, "setBadge"),
  getBadge: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getBadge"),
  clearBadge: /* @__PURE__ */ __name((_id) => Effect.void, "clearBadge")
});
var ActivityBarMock_default = ActivityBarMockLive;
export {
  ActivityBarMockLive,
  ActivityBarMock_default as default
};
//# sourceMappingURL=ActivityBarMock.js.map
