var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer, Queue, Ref, Stream } from "effect";
import { FileSystemProviderTag } from "../../FileSystem/Implementation/FileSystemProviderImplementation.js";
import { URI } from "../../FileSystem/Type/URI.js";
import {
  WorkbenchState,
  WorkbenchIntegrationError,
  WorkbenchIntegrationErrorCode
} from "../Type/WorkbenchIntegrationType.js";
const DEFAULT_POLL_INTERVAL = 100;
const DEFAULT_INIT_TIMEOUT = 3e4;
const DEFAULT_REGISTRATION_TIMEOUT = 1e4;
const updateState = /* @__PURE__ */ __name((context, state, error) => Effect.gen(function* () {
  const newState = {
    state,
    lastUpdated: Date.now()
  };
  yield* Ref.set(context.stateRef, newState);
  yield* Queue.offer(context.stateQueue, newState);
  return newState;
}), "updateState");
const addMessage = /* @__PURE__ */ __name((context, type, message) => Ref.update(context.messagesRef, (messages) => [
  ...messages,
  { type, message, timestamp: Date.now() }
]), "addMessage");
const debugLog = /* @__PURE__ */ __name((context, message) => Effect.gen(function* () {
  const debugMode = yield* Ref.get(context.debugModeRef);
  if (debugMode) {
    console.log(`[WorkbenchIntegration] ${message}`);
  }
}), "debugLog");
const toWorkbenchError = /* @__PURE__ */ __name((error, code) => {
  if (error instanceof WorkbenchIntegrationError) {
    return error;
  }
  if (error instanceof Error) {
    return new WorkbenchIntegrationError(error.message, code);
  }
  return new WorkbenchIntegrationError(
    String(error),
    WorkbenchIntegrationErrorCode.Unknown
  );
}, "toWorkbenchError");
const isVSCodeAvailable = /* @__PURE__ */ __name(() => {
  return typeof window !== "undefined" && typeof window.vscode !== "undefined";
}, "isVSCodeAvailable");
const isMonacoAvailable = /* @__PURE__ */ __name(() => {
  return typeof window !== "undefined" && typeof window.monaco !== "undefined";
}, "isMonacoAvailable");
const getVSCodeAPI = /* @__PURE__ */ __name(() => {
  if (typeof window === "undefined") {
    return void 0;
  }
  return window.vscode;
}, "getVSCodeAPI");
const pollUntil = /* @__PURE__ */ __name((condition, timeout, interval = DEFAULT_POLL_INTERVAL) => Effect.gen(function* () {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return void 0;
    }
    yield* Effect.sleep(interval);
  }
  return yield* Effect.fail(
    new WorkbenchIntegrationError(
      `Timeout after ${timeout}ms waiting for condition to be met`,
      WorkbenchIntegrationErrorCode.InitTimeout
    )
  );
}), "pollUntil");
class WorkbenchIntegrationTag extends Context.Tag("WorkbenchIntegration")() {
  static {
    __name(this, "WorkbenchIntegrationTag");
  }
}
const WorkbenchIntegrationServiceLive = Effect.gen(function* () {
  const stateRef = yield* Ref.make({
    state: WorkbenchState.NotInitialized,
    lastUpdated: Date.now()
  });
  const stateQueue = yield* Queue.unbounded();
  const registrationResultRef = yield* Ref.make(void 0);
  const workspaceContextRef = yield* Ref.make(void 0);
  const debugModeRef = yield* Ref.make(false);
  const messagesRef = yield* Ref.make([]);
  const defaultProvidersUnregisteredRef = yield* Ref.make(false);
  const context = {
    stateRef,
    stateQueue,
    registrationResultRef,
    workspaceContextRef,
    debugModeRef,
    messagesRef,
    defaultProvidersUnregisteredRef
  };
  const isWorkbenchReady = Effect.sync(() => {
    const vscode = getVSCodeAPI();
    const monacoAvailable = isMonacoAvailable();
    return vscode !== void 0 && vscode.workspace !== void 0 && monacoAvailable;
  });
  const waitForWorkbench = /* @__PURE__ */ __name((timeout) => Effect.gen(function* () {
    yield* updateState(context, WorkbenchState.WaitingForReady);
    yield* debugLog(context, `Waiting for workbench to be ready (timeout: ${timeout}ms)...`);
    const vsCodeReady = yield* Effect.either(
      pollUntil(isVSCodeAvailable, timeout).pipe(
        Effect.mapError(
          (_) => new WorkbenchIntegrationError(
            `VSCode API not available after ${timeout}ms`,
            WorkbenchIntegrationErrorCode.InitTimeout
          )
        )
      )
    );
    if (vsCodeReady._tag === "Left") {
      yield* debugLog(context, "VSCode API check failed");
      return yield* Effect.fail(vsCodeReady.left);
    }
    const monacoReady = yield* Effect.either(
      pollUntil(isMonacoAvailable, timeout).pipe(
        Effect.mapError(
          (_) => new WorkbenchIntegrationError(
            `Monaco editor not available after ${timeout}ms`,
            WorkbenchIntegrationErrorCode.InitTimeout
          )
        )
      )
    );
    if (monacoReady._tag === "Left") {
      yield* debugLog(context, "Monaco editor check failed");
      return yield* Effect.fail(monacoReady.left);
    }
    yield* debugLog(context, "Workbench is ready");
    yield* updateState(context, WorkbenchState.ReadyForProviderRegistration);
  }), "waitForWorkbench");
  const unregisterDefaultProviders = Effect.gen(function* () {
    yield* debugLog(context, "Unregistering default VSCode providers...");
    yield* addMessage(
      context,
      "info",
      "Default providers will be overridden by Mountain provider"
    );
    yield* Ref.set(defaultProvidersUnregisteredRef, true);
    yield* updateState(context, WorkbenchState.DefaultProvidersUnregistered);
    yield* debugLog(context, "Default providers unregistered (overridden)");
  });
  const registerProvider = /* @__PURE__ */ __name((scheme) => Effect.gen(function* () {
    yield* debugLog(context, `Registering Mountain provider for scheme: ${scheme}...`);
    const fileSystemProviderService = yield* FileSystemProviderTag;
    const provider = yield* Effect.mapError(
      fileSystemProviderService.getProvider,
      (_) => new WorkbenchIntegrationError(
        "Failed to get file system provider",
        WorkbenchIntegrationErrorCode.FileSystemProviderUnavailable
      )
    );
    const vscodeProvider = {
      readFile: /* @__PURE__ */ __name((uriStr) => provider.readFile(URI.parse(uriStr)), "readFile"),
      writeFile: /* @__PURE__ */ __name((uriStr, content, options) => provider.writeFile(
        URI.parse(uriStr),
        content,
        options ? { create: options.create ?? true, overwrite: options.overwrite ?? false } : void 0
      ), "writeFile"),
      delete: /* @__PURE__ */ __name((uriStr) => provider.delete(URI.parse(uriStr)), "delete"),
      copy: /* @__PURE__ */ __name((sourceStr, destinationStr) => provider.copy(URI.parse(sourceStr), URI.parse(destinationStr)), "copy"),
      move: /* @__PURE__ */ __name((sourceStr, destinationStr) => provider.move(URI.parse(sourceStr), URI.parse(destinationStr)), "move"),
      readdir: /* @__PURE__ */ __name((uriStr) => provider.readdir(URI.parse(uriStr)), "readdir"),
      mkdir: /* @__PURE__ */ __name((uriStr, options) => provider.mkdir(URI.parse(uriStr), { recursive: options?.recursive ?? false }), "mkdir"),
      rmdir: /* @__PURE__ */ __name((uriStr) => provider.rmdir(URI.parse(uriStr)), "rmdir"),
      stat: /* @__PURE__ */ __name((uriStr) => provider.stat(URI.parse(uriStr)), "stat")
    };
    const vscode = getVSCodeAPI();
    if (!vscode) {
      return yield* Effect.fail(
        new WorkbenchIntegrationError(
          "VSCode API not available for provider registration",
          WorkbenchIntegrationErrorCode.ServiceUnavailable
        )
      );
    }
    const globalWindow = window;
    globalWindow["__MOUNTAIN_FS_PROVIDER__"] = vscodeProvider;
    globalWindow["__MOUNTAIN_FS_SCHEME__"] = scheme;
    const result = {
      success: true,
      providerName: "MountainFileSystemProvider",
      scheme,
      details: {
        method: "API override (Option A)",
        timestamp: Date.now()
      }
    };
    yield* Ref.set(context.registrationResultRef, result);
    yield* updateState(context, WorkbenchState.MountainProviderRegistered);
    yield* addMessage(context, "info", `Mountain provider registered for scheme: ${scheme}`);
    yield* debugLog(context, `Mountain provider registered successfully for scheme: ${scheme}`);
    return result;
  }), "registerProvider");
  const configureWorkspace = /* @__PURE__ */ __name((workspaceContext) => Effect.gen(function* () {
    yield* debugLog(context, `Configuring workspace: ${workspaceContext.name}...`);
    const vscode = getVSCodeAPI();
    if (!vscode) {
      return yield* Effect.fail(
        new WorkbenchIntegrationError(
          "VSCode API not available for workspace configuration",
          WorkbenchIntegrationErrorCode.ServiceUnavailable
        )
      );
    }
    const globalWindow = window;
    globalWindow["__WORKSPACE_CONTEXT__"] = workspaceContext;
    yield* Ref.set(context.workspaceContextRef, workspaceContext);
    yield* updateState(context, WorkbenchState.WorkspaceConfigured);
    yield* addMessage(context, "info", `Workspace configured: ${workspaceContext.name}`);
    yield* debugLog(context, `Workspace configured successfully`);
  }), "configureWorkspace");
  const initialize = /* @__PURE__ */ __name((config) => Effect.gen(function* () {
    yield* updateState(context, WorkbenchState.NotInitialized);
    yield* Ref.set(context.debugModeRef, config.debugMode ?? false);
    yield* debugLog(context, "Initializing workbench integration...");
    yield* debugLog(context, `  - Workspace root: ${config.workspaceRootUri}`);
    yield* debugLog(context, `  - File scheme: ${config.fileScheme ?? "file"}`);
    yield* debugLog(context, `  - Override default providers: ${config.overrideDefaultProviders ?? false}`);
    const timeout = config.initTimeout ?? DEFAULT_INIT_TIMEOUT;
    yield* Effect.tap(
      waitForWorkbench(timeout),
      () => debugLog(context, "Workbench is ready for integration")
    );
    if (config.overrideDefaultProviders ?? false) {
      yield* unregisterDefaultProviders;
    }
    const scheme = config.fileScheme ?? "file";
    const regResult = yield* registerProvider(scheme);
    if (!regResult.success) {
      return yield* Effect.fail(
        toWorkbenchError(regResult.error, WorkbenchIntegrationErrorCode.ProviderRegistrationFailed)
      );
    }
    const workspaceContext = {
      rootUri: config.workspaceRootUri,
      name: "CodeEditorLand Workspace",
      isDefault: true,
      folders: [
        {
          uri: config.workspaceRootUri,
          name: "workspace"
        }
      ]
    };
    yield* configureWorkspace(workspaceContext);
    yield* updateState(context, WorkbenchState.IntegrationComplete);
    yield* addMessage(context, "info", "Workbench integration complete");
    yield* debugLog(context, "Workbench integration initialized successfully");
  }), "initialize");
  const getState = Ref.get(context.stateRef);
  const stateChanges = Effect.sync(
    () => Stream.fromQueue(context.stateQueue)
  );
  const getDiagnostics = Effect.gen(function* () {
    const state = yield* getState;
    const messages = yield* Ref.get(context.messagesRef);
    const registrationResult = yield* Ref.get(context.registrationResultRef);
    const workspaceContext = yield* Ref.get(context.workspaceContextRef);
    const defaultProvidersUnregistered = yield* Ref.get(context.defaultProvidersUnregisteredRef);
    const diagnostics = {
      state,
      vscodeAvailable: isVSCodeAvailable(),
      monacoAvailable: isMonacoAvailable(),
      serviceCollectionAccessible: false,
      // Browser workbench doesn't expose this
      defaultProvidersFound: defaultProvidersUnregistered ? ["IndexedDB (overridden)"] : ["IndexedDB"],
      ...registrationResult !== void 0 && { registrationResult },
      ...workspaceContext !== void 0 && { workspaceContext },
      messages
    };
    return diagnostics;
  });
  const reset = Effect.gen(function* () {
    yield* debugLog(context, "Resetting workbench integration state...");
    yield* Ref.set(stateRef, {
      state: WorkbenchState.NotInitialized,
      lastUpdated: Date.now()
    });
    yield* Ref.set(context.registrationResultRef, void 0);
    yield* Ref.set(context.workspaceContextRef, void 0);
    yield* Ref.set(context.messagesRef, []);
    yield* Ref.set(defaultProvidersUnregisteredRef, false);
    const globalWindow = window;
    delete globalWindow["__MOUNTAIN_FS_PROVIDER__"];
    delete globalWindow["__MOUNTAIN_FS_SCHEME__"];
    delete globalWindow["__WORKSPACE_CONTEXT__"];
    yield* debugLog(context, "Workbench integration reset complete");
  });
  return {
    initialize,
    getState,
    stateChanges,
    registerProvider,
    unregisterDefaultProviders,
    configureWorkspace,
    getDiagnostics,
    isWorkbenchReady,
    waitForWorkbench,
    reset
  };
});
import { FileSystemProviderLive } from "../../FileSystem/index.js";
const WorkbenchIntegrationLiveLayer = Layer.effect(
  WorkbenchIntegrationTag,
  WorkbenchIntegrationServiceLive
).pipe(
  Layer.provide(FileSystemProviderLive)
);
var WorkbenchIntegrationImplementation_default = WorkbenchIntegrationTag;
export {
  WorkbenchIntegrationLiveLayer,
  WorkbenchIntegrationTag,
  WorkbenchIntegrationImplementation_default as default
};
//# sourceMappingURL=WorkbenchIntegrationImplementation.js.map
