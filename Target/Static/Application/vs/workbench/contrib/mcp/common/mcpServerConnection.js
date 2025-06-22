var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { log, LogLevel } from "../../../../platform/log/common/log.js";
import { McpServerRequestHandler } from "./mcpServerRequestHandler.js";
import { McpConnectionState } from "./mcpTypes.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let McpServerConnection = class McpServerConnection2 extends Disposable {
  static {
    __name(this, "McpServerConnection");
  }
  constructor(_collection, definition, _delegate, launchDefinition, _logger, _instantiationService) {
    super();
    this._collection = _collection;
    this.definition = definition;
    this._delegate = _delegate;
    this.launchDefinition = launchDefinition;
    this._logger = _logger;
    this._instantiationService = _instantiationService;
    this._launch = this._register(new MutableDisposable());
    this._state = observableValue("mcpServerState", {
      state: 0
      /* McpConnectionState.Kind.Stopped */
    });
    this._requestHandler = observableValue("mcpServerRequestHandler", void 0);
    this.state = this._state;
    this.handler = this._requestHandler;
  }
  /** @inheritdoc */
  async start(methods) {
    const currentState = this._state.get();
    if (!McpConnectionState.canBeStarted(currentState.state)) {
      return this._waitForState(
        2,
        3
        /* McpConnectionState.Kind.Error */
      );
    }
    this._launch.value = void 0;
    this._state.set({
      state: 1
      /* McpConnectionState.Kind.Starting */
    }, void 0);
    this._logger.info(localize("mcpServer.starting", "Starting server {0}", this.definition.label));
    try {
      const launch = this._delegate.start(this._collection, this.definition, this.launchDefinition);
      this._launch.value = this.adoptLaunch(launch, methods);
      return this._waitForState(
        2,
        3
        /* McpConnectionState.Kind.Error */
      );
    } catch (e) {
      const errorState = {
        state: 3,
        message: e instanceof Error ? e.message : String(e)
      };
      this._state.set(errorState, void 0);
      return errorState;
    }
  }
  adoptLaunch(launch, methods) {
    const store = new DisposableStore();
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    store.add(launch);
    store.add(launch.onDidLog(({ level, message }) => {
      log(this._logger, level, message);
    }));
    let didStart = false;
    store.add(autorun((reader) => {
      const state = launch.state.read(reader);
      this._state.set(state, void 0);
      this._logger.info(localize("mcpServer.state", "Connection state: {0}", McpConnectionState.toString(state)));
      if (state.state === 2 && !didStart) {
        didStart = true;
        McpServerRequestHandler.create(this._instantiationService, {
          launch,
          logger: this._logger,
          requestLogLevel: this.definition.devMode ? LogLevel.Info : LogLevel.Debug,
          ...methods
        }, cts.token).then((handler) => {
          if (!store.isDisposed) {
            this._requestHandler.set(handler, void 0);
          } else {
            handler.dispose();
          }
        }, (err) => {
          if (!store.isDisposed) {
            let message = err.message;
            if (err instanceof CancellationError) {
              message = "Server exited before responding to `initialize` request.";
              this._logger.error(message);
            } else {
              this._logger.error(err);
            }
            this._state.set({ state: 3, message }, void 0);
          }
          store.dispose();
        });
      }
    }));
    return { dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose"), object: launch };
  }
  async stop() {
    this._logger.info(localize("mcpServer.stopping", "Stopping server {0}", this.definition.label));
    this._launch.value?.object.stop();
    await this._waitForState(
      0,
      3
      /* McpConnectionState.Kind.Error */
    );
  }
  dispose() {
    this._requestHandler.get()?.dispose();
    super.dispose();
    this._state.set({
      state: 0
      /* McpConnectionState.Kind.Stopped */
    }, void 0);
  }
  _waitForState(...kinds) {
    const current = this._state.get();
    if (kinds.includes(current.state)) {
      return Promise.resolve(current);
    }
    return new Promise((resolve) => {
      const disposable = autorun((reader) => {
        const state = this._state.read(reader);
        if (kinds.includes(state.state)) {
          disposable.dispose();
          resolve(state);
        }
      });
    });
  }
};
McpServerConnection = __decorate([
  __param(5, IInstantiationService)
], McpServerConnection);
export {
  McpServerConnection
};
//# sourceMappingURL=mcpServerConnection.js.map
