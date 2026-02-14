var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import StatusBarTag from "../Tag/StatusBarTag.js";
import StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";
import StatusBarUpdateError from "../Error/StatusBarUpdateError.js";
import { Telemetry } from "../../Telemetry.js";
const StatusBarLive = Layer.effect(
  StatusBarTag,
  Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const ItemsRef = yield* SubscriptionRef.make([]);
    const CreateItem = /* @__PURE__ */ __name((Item) => Effect.gen(function* () {
      const Id = `statusbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const NewItem = { ...Item, id: Id };
      yield* SubscriptionRef.modify(ItemsRef, (Items2) => [void 0, [...Items2, NewItem].sort((a, b) => a.priority - b.priority)]);
      yield* TelemetryService.log("info", `Created status bar item: ${Id}`);
      return NewItem;
    }), "CreateItem");
    const UpdateItem = /* @__PURE__ */ __name((Id, updates) => Effect.gen(function* () {
      const Existing = yield* GetItem(Id);
      if (!Existing) {
        return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
      }
      try {
        yield* SubscriptionRef.modify(ItemsRef, (Items2) => [
          void 0,
          Items2.map((Item) => Item.id === Id ? { ...Item, ...updates } : Item).sort((a, b) => a.priority - b.priority)
        ]);
        yield* TelemetryService.log("info", `Updated status bar item: ${Id}`);
      } catch (error) {
        return yield* Effect.fail(new StatusBarUpdateError(Id, error));
      }
    }), "UpdateItem");
    const RemoveItem = /* @__PURE__ */ __name((Id) => Effect.gen(function* () {
      const Existing = yield* GetItem(Id);
      if (!Existing) {
        return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
      }
      yield* SubscriptionRef.modify(ItemsRef, (Items2) => [void 0, Items2.filter((Item) => Item.id !== Id)]);
      yield* TelemetryService.log("info", `Removed status bar item: ${Id}`);
    }), "RemoveItem");
    const GetItem = /* @__PURE__ */ __name((Id) => Effect.map(ItemsRef.get, (Items2) => Items2.find((Item) => Item.id === Id)), "GetItem");
    const Items = ItemsRef.get;
    const ItemsChanges = ItemsRef.changes;
    const SetItemVisibility = /* @__PURE__ */ __name((Id, visible) => Effect.gen(function* () {
      const Existing = yield* GetItem(Id);
      if (!Existing) {
        return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
      }
      if (!visible) {
        yield* RemoveItem(Id);
      } else {
        yield* Effect.void;
      }
    }), "SetItemVisibility");
    const GetItemText = /* @__PURE__ */ __name((Id) => Effect.map(GetItem(Id), (Item) => Item?.text), "GetItemText");
    const SetItemText = /* @__PURE__ */ __name((Id, text) => UpdateItem(Id, { text }), "SetItemText");
    yield* TelemetryService.log("info", "StatusBar service initialized");
    const service = {
      createItem: CreateItem,
      updateItem: UpdateItem,
      removeItem: RemoveItem,
      getItem: GetItem,
      items: Items,
      itemsChanges: ItemsChanges,
      setItemVisibility: SetItemVisibility,
      getItemText: GetItemText,
      setItemText: SetItemText
    };
    return service;
  })
);
var StatusBarLive_default = StatusBarLive;
export {
  StatusBarLive_default as default
};
//# sourceMappingURL=StatusBarLive.js.map
