var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
const SyncNowEffect = /* @__PURE__ */ __name((_mountain, _ipc, telemetry) => Effect.gen(function* () {
  const StartTime = Date.now();
  yield* telemetry.log("info", "[MountainSync] Performing sync...");
  yield* Effect.sleep(10);
  return {
    success: true,
    itemsSynced: 0,
    duration: Date.now() - StartTime
  };
}), "SyncNowEffect");
var MountainSyncHelper_default = SyncNowEffect;
export {
  MountainSyncHelper_default as default
};
//# sourceMappingURL=MountainSyncHelper.js.map
