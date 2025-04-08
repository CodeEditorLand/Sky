var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Disposable, DisposableStore, IReference, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, IObservable, observableValue } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogger, log } from "../../../../platform/log/common/log.js";
import { IMcpHostDelegate, IMcpMessageTransport } from "./mcpRegistryTypes.js";
import { McpServerRequestHandler } from "./mcpServerRequestHandler.js";
import { IMcpServerConnection, McpCollectionDefinition, McpConnectionState, McpServerDefinition, McpServerLaunch } from "./mcpTypes.js";
let McpServerConnection = class extends Disposable {
  constructor(_collection, definition, _delegate, launchDefinition, _logger, _instantiationService) {
    super();
    this._collection = _collection;
    this.definition = definition;
    this._delegate = _delegate;
    this.launchDefinition = launchDefinition;
    this._logger = _logger;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "McpServerConnection");
  }
  _launch = this._register(new MutableDisposable());
  _state = observableValue("mcpServerState", { state: McpConnectionState.Kind.Stopped });
  _requestHandler = observableValue("mcpServerRequestHandler", void 0);
  state = this._state;
  handler = this._requestHandler;
  /** @inheritdoc */
  async start() {
    const currentState = this._state.get();
    if (!McpConnectionState.canBeStarted(currentState.state)) {
      return this._waitForState(McpConnectionState.Kind.Running, McpConnectionState.Kind.Error);
    }
    this._launch.value = void 0;
    this._state.set({ state: McpConnectionState.Kind.Starting }, void 0);
    this._logger.info(localize("mcpServer.starting", "Starting server {0}", this.definition.label));
    try {
      const launch = this._delegate.start(this._collection, this.definition, this.launchDefinition);
      this._launch.value = this.adoptLaunch(launch);
      return this._waitForState(McpConnectionState.Kind.Running, McpConnectionState.Kind.Error);
    } catch (e) {
      const errorState = {
        state: McpConnectionState.Kind.Error,
        message: e instanceof Error ? e.message : String(e)
      };
      this._state.set(errorState, void 0);
      return errorState;
    }
  }
  adoptLaunch(launch) {
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
      if (state.state === McpConnectionState.Kind.Running && !didStart) {
        didStart = true;
        McpServerRequestHandler.create(this._instantiationService, launch, this._logger, cts.token).then(
          (handler) => {
            if (!store.isDisposed) {
              this._requestHandler.set(handler, void 0);
            } else {
              handler.dispose();
            }
          },
          (err) => {
            if (!store.isDisposed) {
              let message = err.message;
              if (err instanceof CancellationError) {
                message = "Server exited before responding to `initialize` request.";
                this._logger.error(message);
              } else {
                this._logger.error(err);
              }
              this._state.set({ state: McpConnectionState.Kind.Error, message }, void 0);
            }
            store.dispose();
          }
        );
      }
    }));
    return { dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose"), object: launch };
  }
  async stop() {
    this._logger.info(localize("mcpServer.stopping", "Stopping server {0}", this.definition.label));
    this._launch.value?.object.stop();
    await this._waitForState(McpConnectionState.Kind.Stopped, McpConnectionState.Kind.Error);
  }
  dispose() {
    this._requestHandler.get()?.dispose();
    super.dispose();
    this._state.set({ state: McpConnectionState.Kind.Stopped }, void 0);
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
McpServerConnection = __decorateClass([
  __decorateParam(5, IInstantiationService)
], McpServerConnection);
export {
  McpServerConnection
};
//# sourceMappingURL=mcpServerConnection.js.map
