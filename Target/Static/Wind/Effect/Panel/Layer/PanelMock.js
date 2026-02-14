var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import PanelTag from "../Tag/PanelTag.js";
const makeMockPanel = /* @__PURE__ */ __name(() => ({
  createView: /* @__PURE__ */ __name((view) => Effect.succeed({
    ...view,
    id: `mock-panel-${Date.now()}`
  }), "createView"),
  updateView: /* @__PURE__ */ __name((_id, _updates) => Effect.void, "updateView"),
  removeView: /* @__PURE__ */ __name((_id) => Effect.void, "removeView"),
  getView: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getView"),
  views: Effect.succeed([]),
  viewsChanges: Stream.empty,
  setActiveView: /* @__PURE__ */ __name((_id) => Effect.void, "setActiveView"),
  getActiveView: Effect.succeed(void 0),
  activeViewChanges: Stream.empty,
  showView: /* @__PURE__ */ __name((_id) => Effect.void, "showView"),
  hideView: /* @__PURE__ */ __name((_id) => Effect.void, "hideView"),
  toggleView: /* @__PURE__ */ __name((_id) => Effect.void, "toggleView"),
  maximizeView: /* @__PURE__ */ __name((_id) => Effect.void, "maximizeView"),
  restoreView: /* @__PURE__ */ __name((_id) => Effect.void, "restoreView"),
  getViewsByType: /* @__PURE__ */ __name((_type) => Effect.succeed([]), "getViewsByType"),
  getVisibleViews: Effect.succeed([]),
  getMaximizedView: Effect.succeed(void 0)
}), "makeMockPanel");
const PanelMockLive = Layer.succeed(PanelTag, makeMockPanel());
var PanelMock_default = PanelMockLive;
export {
  PanelMock_default as default,
  makeMockPanel
};
//# sourceMappingURL=PanelMock.js.map
