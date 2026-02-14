var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Stream } from "effect";
import {
  CreateIPCInvokeError,
  CreateIPCSendError,
  CreateIPCSubscriptionError
} from "../Error/IPCError.js";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { SandboxNotReadyError } from "../../../Types/Sandbox.js";
const TauriIPCLive = Effect.gen(function* () {
  const isTauriAvailable = typeof window !== "undefined" && window.__TAURI__ !== void 0;
  if (!isTauriAvailable) {
    return yield* Effect.die(new SandboxNotReadyError());
  }
  const service = {
    send: /* @__PURE__ */ __name((channel) => (args) => Effect.try({
      try: /* @__PURE__ */ __name(() => emit(channel, args.length === 1 ? args[0] : args), "try"),
      catch: /* @__PURE__ */ __name((error) => CreateIPCSendError(channel, error), "catch")
    }), "send"),
    invoke: /* @__PURE__ */ __name((channel) => (args) => Effect.tryPromise({
      try: /* @__PURE__ */ __name(() => {
        const invokeArgs = args.length === 1 ? args[0] : args;
        return tauriInvoke(channel, invokeArgs);
      }, "try"),
      catch: /* @__PURE__ */ __name((error) => CreateIPCInvokeError(channel, error), "catch")
    }), "invoke"),
    events: /* @__PURE__ */ __name((channel) => Stream.async((emit2) => {
      let cleanup;
      listen(channel, (event) => {
        emit2.single({
          channel,
          args: [event.payload]
        });
      }).then((unlisten) => {
        cleanup = unlisten;
      }).catch((error) => {
        emit2.fail(CreateIPCSubscriptionError(channel, error));
      });
      return Effect.sync(() => cleanup?.());
    }), "events"),
    once: /* @__PURE__ */ __name((channel) => Effect.async((resume) => {
      listen(channel, (event) => {
        resume(
          Effect.succeed({
            channel,
            args: [event.payload]
          })
        );
      }).catch((error) => {
        resume(
          Effect.fail(CreateIPCSubscriptionError(channel, error))
        );
      });
    }), "once"),
    removeAllListeners: /* @__PURE__ */ __name((channel) => Effect.log(`[IPC] Remove all listeners for ${channel}`).pipe(
      Effect.map(() => void 0)
    ), "removeAllListeners")
  };
  return service;
});
var TauriIPC_default = TauriIPCLive;
export {
  TauriIPCLive,
  TauriIPC_default as default
};
//# sourceMappingURL=TauriIPC.js.map
