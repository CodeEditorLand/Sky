var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import SidebarTag from "../Tag/SidebarTag.js";
import SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";
import SidebarUpdateError from "../Error/SidebarUpdateError.js";
import { Telemetry } from "../../Telemetry.js";
const SidebarLive = Layer.effect(
  SidebarTag,
  Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const PanelsRef = yield* SubscriptionRef.make([]);
    const ActivePanelRef = yield* SubscriptionRef.make(void 0);
    const CreatePanel = /* @__PURE__ */ __name((Panel) => Effect.gen(function* () {
      const Id = `sidebar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const NewPanel = { ...Panel, id: Id };
      yield* SubscriptionRef.modify(PanelsRef, (Panels2) => [void 0, [...Panels2, NewPanel].sort((a, b) => a.priority - b.priority)]);
      yield* TelemetryService.log("info", `Created sidebar panel: ${Id}`);
      return NewPanel;
    }), "CreatePanel");
    const UpdatePanel = /* @__PURE__ */ __name((Id, updates) => Effect.gen(function* () {
      const Existing = yield* GetPanel(Id);
      if (!Existing) {
        return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
      }
      try {
        yield* SubscriptionRef.modify(PanelsRef, (Panels2) => [
          void 0,
          Panels2.map((Panel) => Panel.id === Id ? { ...Panel, ...updates } : Panel).sort((a, b) => a.priority - b.priority)
        ]);
        yield* TelemetryService.log("info", `Updated sidebar panel: ${Id}`);
      } catch (error) {
        return yield* Effect.fail(new SidebarUpdateError(Id, error));
      }
    }), "UpdatePanel");
    const RemovePanel = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetPanel(Id);
      if (!Existing) {
        return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
      }
      yield* SubscriptionRef.modify(PanelsRef, (Panels2) => [void 0, Panels2.filter((Panel) => Panel.id !== Id)]);
      const CurrentActive = yield* ActivePanelRef.get;
      if (CurrentActive === Id) {
        yield* SubscriptionRef.set(ActivePanelRef, void 0);
      }
      yield* TelemetryService.log("info", `Removed sidebar panel: ${Id}`);
    }), "RemovePanel");
    const GetPanel = /* @__PURE__ */ __name((Id) => Effect.map(PanelsRef.get, (Panels2) => Panels2.find((Panel) => Panel.id === Id)), "GetPanel");
    const Panels = PanelsRef.get;
    const PanelsChanges = PanelsRef.changes;
    const SetActivePanel = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetPanel(Id);
      if (!Existing) {
        return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
      }
      yield* SubscriptionRef.modify(PanelsRef, (Panels2) => [void 0, Panels2.map((Panel) => Panel.id === Id ? { ...Panel, collapsed: false } : Panel)]);
      yield* SubscriptionRef.set(ActivePanelRef, Id);
      yield* TelemetryService.log("info", `Set active sidebar panel: ${Id}`);
    }), "SetActivePanel");
    const GetActivePanel = ActivePanelRef.get;
    const ActivePanelChanges = ActivePanelRef.changes;
    const TogglePanel = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetPanel(Id);
      if (!Existing) {
        return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
      }
      yield* UpdatePanel(Id, { collapsed: !Existing.collapsed });
      yield* TelemetryService.log("info", `Toggled sidebar panel: ${Id}`);
    }), "TogglePanel");
    const CollapsePanel = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* UpdatePanel(Id, { collapsed: true });
      yield* TelemetryService.log("info", `Collapsed sidebar panel: ${Id}`);
    }), "CollapsePanel");
    const ExpandPanel = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* UpdatePanel(Id, { collapsed: false });
      yield* TelemetryService.log("info", `Expanded sidebar panel: ${Id}`);
    }), "ExpandPanel");
    const GetPanelsByPosition = /* @__PURE__ */ __name((Position) => Effect.map(Panels, (Panels2) => Panels2.filter((Panel) => Panel.position === Position)), "GetPanelsByPosition");
    yield* TelemetryService.log("info", "Sidebar service initialized");
    const service = {
      createPanel: CreatePanel,
      updatePanel: UpdatePanel,
      removePanel: RemovePanel,
      getPanel: GetPanel,
      panels: Panels,
      panelsChanges: PanelsChanges,
      setActivePanel: SetActivePanel,
      getActivePanel: GetActivePanel,
      activePanelChanges: ActivePanelChanges,
      togglePanel: TogglePanel,
      collapsePanel: CollapsePanel,
      expandPanel: ExpandPanel,
      getPanelsByPosition: GetPanelsByPosition
    };
    return service;
  })
);
var SidebarLive_default = SidebarLive;
export {
  SidebarLive_default as default
};
//# sourceMappingURL=SidebarLive.js.map
