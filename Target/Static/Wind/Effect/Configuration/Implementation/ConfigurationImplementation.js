import { Effect, Layer, Schedule, Stream, SubscriptionRef } from "effect";
import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import { ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import { IPC } from "../../IPC.js";
import { Sandbox } from "../../Sandbox.js";
import { MountainTag } from "../../Mountain.js";
import { Telemetry } from "../../Telemetry.js";
import { MakeValidate, MakeApply } from "./ConfigurationHelper.js";
const ConfigurationLive = Layer.effect(
  ConfigurationTag,
  Effect.gen(function* () {
    const SandboxService = yield* Sandbox;
    const IPCService = yield* IPC;
    const Validate = MakeValidate();
    const ConfigRef = yield* SubscriptionRef.make(null);
    const Fetch = Effect.gen(function* () {
      const FromSandbox = yield* SandboxService.resolveConfiguration.pipe(
        Effect.either
      );
      if (FromSandbox._tag === "Right") {
        return FromSandbox.right;
      }
      return yield* IPCService.invoke("mountain_get_workbench_configuration")([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
    });
    const Apply = MakeApply();
    const Changes = ConfigRef.changes.pipe(
      Stream.filter((Config) => Config !== null)
    );
    const Get = Effect.gen(function* () {
      const Current = yield* ConfigRef.get;
      if (!Current) {
        return yield* Effect.fail(
          new ConfigurationNotReadyError()
        );
      }
      return Current;
    });
    const Refresh = Effect.gen(function* () {
      const Config = yield* Fetch;
      yield* SubscriptionRef.set(ConfigRef, Config);
      return Config;
    });
    yield* Fetch.pipe(Effect.flatMap((Config) => SubscriptionRef.set(ConfigRef, Config)));
    yield* Effect.log("[Configuration] Configuration service initialized");
    return {
      get: Get,
      fetch: Fetch,
      validate: Validate,
      apply: Apply,
      changes: Changes,
      refresh: Refresh
    };
  })
);
const ConfigurationWithSyncLive = Layer.effect(
  ConfigurationTag,
  Effect.gen(function* () {
    const SandboxService = yield* Sandbox;
    const IPCService = yield* IPC;
    const Mountain = yield* MountainTag;
    const Validate = MakeValidate();
    const Apply = MakeApply();
    const ConfigRef = yield* SubscriptionRef.make(null);
    const Fetch = Effect.gen(function* () {
      const FromSandbox = yield* SandboxService.resolveConfiguration.pipe(
        Effect.either
      );
      if (FromSandbox._tag === "Right") {
        return FromSandbox.right;
      }
      return yield* IPCService.invoke("mountain_get_workbench_configuration")([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
    });
    const Changes = ConfigRef.changes.pipe(
      Stream.filter((Config) => Config !== null)
    );
    const Get = Effect.gen(function* () {
      const Current = yield* ConfigRef.get;
      if (!Current) {
        return yield* Effect.fail(
          new ConfigurationNotReadyError()
        );
      }
      return Current;
    });
    const Refresh = Effect.gen(function* () {
      const Config = yield* Fetch;
      yield* SubscriptionRef.set(ConfigRef, Config);
      return Config;
    });
    yield* Fetch.pipe(Effect.flatMap((Config) => SubscriptionRef.set(ConfigRef, Config)));
    yield* Effect.fork(
      Effect.gen(function* () {
        const ConnectionState = yield* Mountain.connectionState;
        if (ConnectionState._tag === "Connected") {
          yield* Effect.repeat(
            Effect.gen(function* () {
              const Config = yield* Mountain.rpc("mountain_get_configuration")();
              if (Config) {
                yield* Validate(Config).pipe(
                  Effect.flatMap((ValidatedConfig) => {
                    return Effect.gen(function* () {
                      const Current = yield* ConfigRef.get;
                      if (!Current || JSON.stringify(Current) !== JSON.stringify(ValidatedConfig)) {
                        yield* SubscriptionRef.set(ConfigRef, ValidatedConfig);
                        yield* Apply(ValidatedConfig);
                      }
                    });
                  }),
                  Effect.catchAll(
                    (error) => Effect.sync(() => {
                      console.error("[Configuration] Sync error:", error);
                    })
                  )
                );
              }
            }),
            Schedule.spaced("5 seconds")
          );
        }
      })
    );
    yield* Effect.log("[Configuration] Configuration service with sync initialized");
    return {
      get: Get,
      fetch: Fetch,
      validate: Validate,
      apply: Apply,
      changes: Changes,
      refresh: Refresh
    };
  })
);
var ConfigurationImplementation_default = ConfigurationLive;
export {
  ConfigurationLive,
  ConfigurationWithSyncLive,
  ConfigurationImplementation_default as default
};
//# sourceMappingURL=ConfigurationImplementation.js.map
