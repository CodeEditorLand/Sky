var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Fiber, Layer, Schedule, Stream, SubscriptionRef } from "effect";
import { MountainTag } from "../Tag/MountainTag.js";
import { MountainConnectionError } from "../Error/MountainConnectionError.js";
import { MountainRPCError } from "../Error/MountainRPCError.js";
import { MountainSyncError } from "../Error/MountainSyncError.js";
import { MountainStateError } from "../Error/MountainStateError.js";
import { Configuration } from "../../Configuration.js";
import { IPC } from "../../IPC.js";
import { Telemetry } from "../../Telemetry.js";
const MountainLive = Layer.effect(
  MountainTag,
  Effect.gen(function* () {
    const IPCService = yield* IPC;
    const ConfigurationService = yield* Configuration;
    const TelemetryService = yield* Telemetry;
    const StateRef = yield* SubscriptionRef.make({
      _tag: "Idle"
    });
    const SyncEventsRef = yield* SubscriptionRef.make([]);
    const RetrySchedule = Schedule.exponential("100 millis").pipe(
      Schedule.union(Schedule.spaced("5 seconds")),
      Schedule.intersect(Schedule.recurs(10))
    );
    const WithSpanLocal = /* @__PURE__ */ __name((Name, EffectPayload) => Effect.gen(function* () {
      const Span = yield* TelemetryService.startSpan(Name);
      return yield* EffectPayload.pipe(
        Effect.tap(() => Span.end(true)),
        Effect.catchAll(
          (Error2) => Effect.gen(function* () {
            const ErrorValue = Error2;
            const ErrorMsg = ErrorValue.message;
            yield* Span.end(false, ErrorMsg);
            return yield* Effect.fail(ErrorValue);
          })
        )
      );
    }), "WithSpanLocal");
    const SetState = /* @__PURE__ */ __name((State) => Effect.gen(function* () {
      yield* SubscriptionRef.modify(StateRef, () => [void 0, State]);
      yield* TelemetryService.log("info", `Mountain state: ${State._tag}`);
    }), "SetState");
    const ConnectionState = StateRef.get;
    const ConnectionChanges = StateRef.changes;
    const Connect = Effect.gen(function* () {
      yield* SetState({ _tag: "Connecting", attempt: 1 });
      const ConnectionEffect = Effect.gen(function* () {
        const Status = yield* IPCService.invoke("mountain_get_status")([]).pipe(
          Effect.map((Result) => {
            const APIStatus = Result;
            return {
              connected: APIStatus.connected ?? false,
              version: APIStatus.version ?? "unknown"
            };
          }),
          Effect.mapError(
            (Error2) => new MountainConnectionError(Error2)
          )
        );
        if (!Status.connected) {
          yield* Effect.fail(
            new MountainConnectionError("Mountain not ready")
          );
        }
        yield* SetState({
          _tag: "Connected",
          version: Status.version
        });
        yield* TelemetryService.log(
          "info",
          `Connected to Mountain v${Status.version}`
        );
      });
      return yield* Effect.retry(
        WithSpanLocal("mountain_connect", ConnectionEffect),
        RetrySchedule
      ).pipe(
        Effect.catchAll(
          (Error2) => Effect.gen(function* () {
            const ErrorObj = Error2 instanceof Error2 ? Error2 : new Error2(String(Error2));
            yield* SetState({ _tag: "Error", error: ErrorObj });
            yield* TelemetryService.log(
              "error",
              `Failed to connect: ${ErrorObj.message}`
            );
            yield* Effect.fail(Error2);
          })
        )
      );
    });
    const Disconnect = Effect.gen(function* () {
      yield* SetState({ _tag: "Disconnected", reason: "manual" });
      yield* TelemetryService.log("info", "Disconnected from Mountain");
    });
    const RPC = /* @__PURE__ */ __name((Method) => (Args) => Effect.gen(function* () {
      const CurrentState = yield* StateRef.get;
      if (CurrentState._tag !== "Connected") {
        yield* Connect;
      }
      const Span = yield* TelemetryService.startSpan(`rpc_${Method}`);
      return yield* IPCService.invoke(Method)(Args ? [Args] : []).pipe(
        Effect.mapError(
          (Error2) => new MountainRPCError(Method, Error2)
        ),
        Effect.tap(() => Span.end(true)),
        Effect.catchAll(
          (Error2) => Effect.gen(function* () {
            const ErrorMessage = Error2 instanceof Error2 ? Error2.message : String(Error2);
            yield* Span.end(false, ErrorMessage);
            if (ErrorMessage.includes("connection") || ErrorMessage.includes("network")) {
              yield* SetState({
                _tag: "Disconnected",
                reason: "connection_lost"
              });
            }
            yield* Effect.fail(Error2);
          })
        )
      );
    }), "RPC");
    const Sync = /* @__PURE__ */ __name((ResourceType) => Effect.gen(function* () {
      const Span = yield* TelemetryService.startSpan(`sync_${ResourceType}`);
      const StartTime = Date.now();
      yield* TelemetryService.log(
        "info",
        `Starting sync for ${ResourceType}`
      );
      const Result = yield* Effect.gen(function* () {
        switch (ResourceType) {
          case "configuration": {
            const MountainConfig = yield* RPC("mountain_get_configuration")();
            const LocalConfig = yield* ConfigurationService.get;
            const MountainHash = JSON.stringify(MountainConfig);
            const LocalHash = JSON.stringify(LocalConfig);
            if (MountainHash !== LocalHash) {
              yield* ConfigurationService.apply(MountainConfig);
              const Resource = {
                type: "configuration",
                id: "main",
                data: MountainConfig,
                timestamp: Date.now(),
                hash: MountainHash
              };
              yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [void 0, [...Events, Resource].slice(-1e3)]);
            }
            return {
              success: true,
              resourcesSynced: 1,
              errors: []
            };
          }
          case "services": {
            const Services = yield* RPC("mountain_get_services_status")();
            const Resource = {
              type: "services",
              id: "all",
              data: Services,
              timestamp: Date.now(),
              hash: JSON.stringify(Services)
            };
            yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [void 0, [...Events, Resource].slice(-1e3)]);
            return {
              success: true,
              resourcesSynced: Object.keys(Services).length,
              errors: []
            };
          }
          case "state": {
            const State = yield* RPC("mountain_get_state")();
            const Resource = {
              type: "state",
              id: "main",
              data: State,
              timestamp: Date.now(),
              hash: JSON.stringify(State)
            };
            yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [void 0, [...Events, Resource].slice(-1e3)]);
            return {
              success: true,
              resourcesSynced: 1,
              errors: []
            };
          }
          default:
            return {
              success: false,
              resourcesSynced: 0,
              errors: [
                `Unknown resource type: ${ResourceType}`
              ]
            };
        }
      }).pipe(
        Effect.tap(
          (InnerResult) => Span.end(InnerResult.success, InnerResult.errors[0])
        ),
        Effect.catchAll(
          (Error2) => Effect.gen(function* () {
            const ErrorMessage = Error2 instanceof Error2 ? Error2.message : String(Error2);
            yield* Span.end(false, ErrorMessage);
            yield* Effect.fail(
              new MountainSyncError(ResourceType, Error2)
            );
          })
        )
      );
      const Duration = Date.now() - StartTime;
      return {
        ...Result,
        duration: Duration
      };
    }), "Sync");
    const SyncEvents = SyncEventsRef.changes.pipe(
      Stream.flatMap((Events) => Stream.fromIterable(Events))
    );
    const Version = Effect.gen(function* () {
      const Status = yield* IPCService.invoke("mountain_get_status")([]).pipe(
        Effect.map((Result) => {
          const APIStatus = Result;
          return { version: APIStatus.version ?? "unknown" };
        }),
        Effect.mapError((Error2) => new MountainConnectionError(Error2))
      );
      return Status.version;
    });
    const HealthCheck = Effect.gen(function* () {
      return yield* Effect.orElse(
        RPC("mountain_get_status")().pipe(
          Effect.map((Status) => Status.connected === true)
        ),
        () => Effect.succeed(false)
      );
    });
    const SetupBackgroundSync = Effect.gen(function* () {
      yield* Stream.runForEach(
        ConnectionChanges,
        (State) => State._tag === "Connected" ? Effect.gen(function* () {
          yield* TelemetryService.log(
            "info",
            "Starting background sync"
          );
          yield* Sync("configuration").pipe(
            Effect.catchAll(
              (Error2) => TelemetryService.log(
                "error",
                `Initial config sync failed: ${Error2.message}`
              )
            )
          );
          const SyncFiber = yield* Stream.fromSchedule(
            Schedule.spaced("5 seconds")
          ).pipe(
            Stream.runForEach(
              () => Sync("configuration").pipe(
                Effect.catchAll(
                  (Error2) => TelemetryService.log(
                    "error",
                    `Periodic sync failed: ${Error2.message}`
                  )
                )
              )
            ),
            Effect.fork
          );
          yield* ConnectionChanges.pipe(
            Stream.filter(
              (S) => S._tag === "Disconnected" || S._tag === "Error"
            ),
            Stream.runForEach(
              () => Fiber.interrupt(SyncFiber)
            )
          );
        }) : Effect.void
      );
    }).pipe(Effect.fork);
    yield* SetupBackgroundSync;
    yield* TelemetryService.log("info", "Mountain service initialized");
    return {
      connectionState: ConnectionState,
      connectionChanges: ConnectionChanges,
      connect: Connect,
      disconnect: Disconnect,
      rpc: RPC,
      sync: Sync,
      syncEvents: SyncEvents,
      version: Version,
      healthCheck: HealthCheck
    };
  })
);
var MountainImplementation_default = MountainLive;
export {
  MountainLive,
  MountainImplementation_default as default
};
//# sourceMappingURL=MountainImplementation.js.map
