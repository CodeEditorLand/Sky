var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import PanelTag from "../Tag/PanelTag.js";
import PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import PanelUpdateError from "../Error/PanelUpdateError.js";
import { Telemetry } from "../../Telemetry.js";
const PanelLive = Layer.effect(
  PanelTag,
  Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const ViewsRef = yield* SubscriptionRef.make([]);
    const ActiveViewRef = yield* SubscriptionRef.make(void 0);
    const CreateView = /* @__PURE__ */ __name((View) => Effect.gen(function* () {
      const Id = `panel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const NewView = { ...View, id: Id };
      yield* SubscriptionRef.modify(ViewsRef, (Views2) => [
        void 0,
        [...Views2, NewView].sort((a, b) => a.priority - b.priority)
      ]);
      yield* TelemetryService.log("info", `Created panel view: ${Id}`);
      return NewView;
    }), "CreateView");
    const UpdateView = /* @__PURE__ */ __name((Id, updates) => Effect.gen(function* () {
      const Existing = yield* GetView(Id);
      if (!Existing) {
        return yield* Effect.fail(new PanelViewNotFoundError(Id));
      }
      try {
        yield* SubscriptionRef.modify(ViewsRef, (Views2) => [
          void 0,
          Views2.map((View) => View.id === Id ? { ...View, ...updates } : View).sort((a, b) => a.priority - b.priority)
        ]);
        yield* TelemetryService.log("info", `Updated panel view: ${Id}`);
      } catch (error) {
        return yield* Effect.fail(new PanelUpdateError(Id, error));
      }
    }), "UpdateView");
    const RemoveView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetView(Id);
      if (!Existing) {
        return yield* Effect.fail(new PanelViewNotFoundError(Id));
      }
      yield* SubscriptionRef.modify(ViewsRef, (Views2) => [void 0, Views2.filter((View) => View.id !== Id)]);
      const CurrentActive = yield* ActiveViewRef.get;
      if (CurrentActive === Id) {
        yield* SubscriptionRef.set(ActiveViewRef, void 0);
      }
      yield* TelemetryService.log("info", `Removed panel view: ${Id}`);
    }), "RemoveView");
    const GetView = /* @__PURE__ */ __name((Id) => Effect.map(ViewsRef.get, (Views2) => Views2.find((View) => View.id === Id)), "GetView");
    const Views = ViewsRef.get;
    const ViewsChanges = ViewsRef.changes;
    const SetActiveView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetView(Id);
      if (!Existing) {
        return yield* Effect.fail(new PanelViewNotFoundError(Id));
      }
      yield* SubscriptionRef.modify(ViewsRef, (Views2) => [
        void 0,
        Views2.map((View) => View.id === Id ? { ...View, visible: true, maximized: false } : View)
      ]);
      yield* SubscriptionRef.set(ActiveViewRef, Id);
      yield* TelemetryService.log("info", `Set active panel view: ${Id}`);
    }), "SetActiveView");
    const GetActiveView = ActiveViewRef.get;
    const ActiveViewChanges = ActiveViewRef.changes;
    const ShowView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* UpdateView(Id, { visible: true });
      yield* TelemetryService.log("info", `Showed panel view: ${Id}`);
    }), "ShowView");
    const HideView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* UpdateView(Id, { visible: false });
      yield* TelemetryService.log("info", `Hid panel view: ${Id}`);
    }), "HideView");
    const ToggleView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetView(Id);
      if (!Existing) {
        return yield* Effect.fail(new PanelViewNotFoundError(Id));
      }
      yield* UpdateView(Id, { visible: !Existing.visible });
      yield* TelemetryService.log("info", `Toggled panel view: ${Id}`);
    }), "ToggleView");
    const MaximizeView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* SubscriptionRef.modify(ViewsRef, (Views2) => [
        void 0,
        Views2.map((View) => View.id === Id ? { ...View, maximized: true } : { ...View, maximized: false })
      ]);
      yield* TelemetryService.log("info", `Maximized panel view: ${Id}`);
    }), "MaximizeView");
    const RestoreView = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      yield* UpdateView(Id, { maximized: false });
      yield* TelemetryService.log("info", `Restored panel view: ${Id}`);
    }), "RestoreView");
    const GetViewsByType = /* @__PURE__ */ __name((Type) => Effect.map(Views, (Views2) => Views2.filter((View) => View.type === Type)), "GetViewsByType");
    const GetVisibleViews = Effect.map(Views, (Views2) => Views2.filter((View) => View.visible));
    const GetMaximizedView = Effect.map(Views, (Views2) => Views2.find((View) => View.maximized));
    yield* TelemetryService.log("info", "Panel service initialized");
    const service = {
      createView: CreateView,
      updateView: UpdateView,
      removeView: RemoveView,
      getView: GetView,
      views: Views,
      viewsChanges: ViewsChanges,
      setActiveView: SetActiveView,
      getActiveView: GetActiveView,
      activeViewChanges: ActiveViewChanges,
      showView: ShowView,
      hideView: HideView,
      toggleView: ToggleView,
      maximizeView: MaximizeView,
      restoreView: RestoreView,
      getViewsByType: GetViewsByType,
      getVisibleViews: GetVisibleViews,
      getMaximizedView: GetMaximizedView
    };
    return service;
  })
);
var PanelLive_default = PanelLive;
export {
  PanelLive_default as default
};
//# sourceMappingURL=PanelLive.js.map
