var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import SidebarTag from "../Tag/SidebarTag.js";
const makeMockSidebar = /* @__PURE__ */ __name(() => ({
  createPanel: /* @__PURE__ */ __name((panel) => Effect.succeed({
    ...panel,
    id: `mock-sidebar-${Date.now()}`
  }), "createPanel"),
  updatePanel: /* @__PURE__ */ __name((_id, _updates) => Effect.void, "updatePanel"),
  removePanel: /* @__PURE__ */ __name((_id) => Effect.void, "removePanel"),
  getPanel: /* @__PURE__ */ __name((_id) => Effect.succeed(void 0), "getPanel"),
  panels: Effect.succeed([]),
  panelsChanges: Stream.empty,
  setActivePanel: /* @__PURE__ */ __name((_id) => Effect.void, "setActivePanel"),
  getActivePanel: Effect.succeed(void 0),
  activePanelChanges: Stream.empty,
  togglePanel: /* @__PURE__ */ __name((_id) => Effect.void, "togglePanel"),
  collapsePanel: /* @__PURE__ */ __name((_id) => Effect.void, "collapsePanel"),
  expandPanel: /* @__PURE__ */ __name((_id) => Effect.void, "expandPanel"),
  getPanelsByPosition: /* @__PURE__ */ __name((_position) => Effect.succeed([]), "getPanelsByPosition")
}), "makeMockSidebar");
const SidebarMockLive = Layer.succeed(SidebarTag, makeMockSidebar());
var SidebarMock_default = SidebarMockLive;
export {
  SidebarMock_default as default,
  makeMockSidebar
};
//# sourceMappingURL=SidebarMock.js.map
