var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer } from "effect";
import { Sandbox } from "../Tag/SandboxTag.js";
import {
  SandboxNotReadyError,
  ConfigurationNotReadyError
} from "../../../Types/Sandbox.js";
const SandboxLive = Layer.effect(
  Context.GenericTag("Sandbox"),
  Effect.gen(function* () {
    const checkReady = Effect.sync(() => {
      const vscode = window.vscode;
      return !!vscode && typeof vscode === "object";
    });
    const getGlobals = Effect.sync(() => {
      const vscode = window.vscode;
      if (!vscode) throw new SandboxNotReadyError();
      return vscode;
    }).pipe(Effect.mapError(() => new SandboxNotReadyError()));
    const awaitReady = Effect.gen(function* () {
      let attempts = 0;
      const maxAttempts = 300;
      while (attempts < maxAttempts) {
        const preloadGlobals = window.preloadGlobals;
        if (preloadGlobals && preloadGlobals.process && preloadGlobals.ipcRenderer) {
          const vscode = window.vscode;
          if (vscode) {
            console.log("[Sandbox] Preload globals and window.vscode ready");
            return vscode;
          }
        }
        attempts++;
        yield* Effect.sleep("100 millis");
      }
      throw new SandboxNotReadyError();
    }).pipe(
      Effect.timeout("30 seconds"),
      Effect.mapError(() => new SandboxNotReadyError())
    );
    const ipc = Effect.gen(function* () {
      const g = yield* getGlobals;
      if (!g.ipcRenderer) {
        return yield* Effect.fail(new SandboxNotReadyError());
      }
      return g.ipcRenderer;
    });
    const configuration = Effect.gen(function* () {
      const g = yield* getGlobals;
      if (!g.context) {
        return yield* Effect.fail(new SandboxNotReadyError());
      }
      return g.context;
    });
    const resolveConfiguration = Effect.gen(function* () {
      const ctx = yield* configuration;
      return yield* Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => ctx.resolveConfiguration(), "try"),
        catch: /* @__PURE__ */ __name(() => new ConfigurationNotReadyError(), "catch")
      });
    }).pipe(
      Effect.catchAll(
        (error) => error instanceof SandboxNotReadyError ? Effect.fail(new ConfigurationNotReadyError()) : Effect.fail(error)
      )
    );
    const service = {
      globals: getGlobals,
      isReady: checkReady,
      awaitReady,
      ipc,
      configuration,
      resolveConfiguration
    };
    return service;
  })
);
var SandboxLive_default = SandboxLive;
export {
  SandboxLive_default as default
};
//# sourceMappingURL=SandboxLive.js.map
