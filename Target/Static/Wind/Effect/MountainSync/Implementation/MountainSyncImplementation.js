var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Fiber } from "effect";
import SyncNowEffect from "./MountainSyncHelper.js";
const defaultSyncConfig = {
  enabled: true,
  syncIntervalMs: 5e3,
  autoRetry: true,
  maxRetries: 3,
  batchSize: 100
};
const makeMountainSync = /* @__PURE__ */ __name((Mountain, IPC, TelemetryService) => {
  let SyncFiber = null;
  let SyncStatus = "idle";
  let LastSyncTime = 0;
  let SyncCount = 0;
  let SuccessCount = 0;
  let ErrorCount = 0;
  let ItemsSynced = 0;
  return {
    start: /* @__PURE__ */ __name((Config) => Effect.gen(function* () {
      const FullConfig = {
        ...defaultSyncConfig,
        ...Config
      };
      if (!FullConfig.enabled) {
        yield* TelemetryService.log("info", "[MountainSync] Sync disabled in config");
        return;
      }
      yield* TelemetryService.log(
        "info",
        `[MountainSync] Starting sync with ${FullConfig.syncIntervalMs}ms interval`
      );
      SyncStatus = "syncing";
      const StartSyncing = Effect.gen(function* () {
        yield* Effect.forever(
          Effect.gen(function* () {
            yield* Effect.sleep(`${FullConfig.syncIntervalMs} millis`);
            const Result = yield* SyncNowEffect(Mountain, IPC, TelemetryService);
            LastSyncTime = Date.now();
            SyncCount++;
            ItemsSynced += Result.itemsSynced;
            if (Result.success) {
              SuccessCount++;
              yield* TelemetryService.log(
                "info",
                `[MountainSync] Synced ${Result.itemsSynced} items in ${Result.duration}ms`
              );
            } else if (FullConfig.autoRetry) {
              ErrorCount++;
              yield* TelemetryService.log(
                "warn",
                `[MountainSync] Sync failed, will retry: ${Result.error?.message}`
              );
            }
          })
        );
      });
      SyncFiber = yield* StartSyncing.pipe(Effect.fork);
    }), "start"),
    stop: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      if (SyncFiber) {
        yield* Fiber.interrupt(SyncFiber);
        SyncFiber = null;
        SyncStatus = "idle";
        yield* TelemetryService.log("info", "[MountainSync] Stopped");
      }
    }), "stop"),
    syncNow: /* @__PURE__ */ __name(() => SyncNowEffect(Mountain, IPC, TelemetryService), "syncNow"),
    getStatus: /* @__PURE__ */ __name(() => Effect.sync(() => SyncStatus), "getStatus"),
    getStats: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      return {
        lastSyncTime: LastSyncTime,
        syncCount: SyncCount,
        successCount: SuccessCount,
        errorCount: ErrorCount,
        itemsSynced: ItemsSynced
      };
    }), "getStats"),
    pause: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      SyncStatus = "paused";
      yield* TelemetryService.log("info", "[MountainSync] Pausing...");
    }), "pause"),
    resume: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      SyncStatus = "syncing";
      yield* TelemetryService.log("info", "[MountainSync] Resuming...");
    }), "resume")
  };
}, "makeMountainSync");
var MountainSyncImplementation_default = makeMountainSync;
export {
  MountainSyncImplementation_default as default
};
//# sourceMappingURL=MountainSyncImplementation.js.map
