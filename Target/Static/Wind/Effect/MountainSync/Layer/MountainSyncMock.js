var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer } from "effect";
import MountainSyncTag from "../Tag/MountainSyncTag.js";
const makeMockMountainSync = /* @__PURE__ */ __name(() => ({
  start: /* @__PURE__ */ __name(() => Effect.void, "start"),
  stop: /* @__PURE__ */ __name(() => Effect.void, "stop"),
  syncNow: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    return {
      success: true,
      itemsSynced: 0,
      duration: 1
    };
  }), "syncNow"),
  getStatus: /* @__PURE__ */ __name(() => Effect.succeed("idle"), "getStatus"),
  getStats: /* @__PURE__ */ __name(() => Effect.succeed({
    lastSyncTime: Date.now(),
    syncCount: 0,
    successCount: 0,
    errorCount: 0,
    itemsSynced: 0
  }), "getStats"),
  pause: /* @__PURE__ */ __name(() => Effect.void, "pause"),
  resume: /* @__PURE__ */ __name(() => Effect.void, "resume")
}), "makeMockMountainSync");
const MountainSyncMock = Layer.effect(MountainSyncTag, Effect.succeed(makeMockMountainSync()));
var MountainSyncMock_default = MountainSyncMock;
export {
  MountainSyncMock_default as default,
  makeMockMountainSync
};
//# sourceMappingURL=MountainSyncMock.js.map
