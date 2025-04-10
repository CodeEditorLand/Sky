/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { disposableTimeout } from '../../../base/common/async.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { observableValue } from '../../../base/common/observable.js';
import { LogLevel } from '../../../platform/log/common/log.js';
import { IMcpRegistry } from '../../contrib/mcp/common/mcpRegistryTypes.js';
import { McpConnectionState, McpServerDefinition } from '../../contrib/mcp/common/mcpTypes.js';
import { extensionHostKindToString } from '../../services/extensions/common/extensionHostKind.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
let MainThreadMcp = class MainThreadMcp extends Disposable {
    constructor(_extHostContext, _mcpRegistry) {
        super();
        this._extHostContext = _extHostContext;
        this._mcpRegistry = _mcpRegistry;
        this._serverIdCounter = 0;
        this._servers = new Map();
        this._collectionDefinitions = this._register(new DisposableMap());
        const proxy = _extHostContext.getProxy(ExtHostContext.ExtHostMcp);
        this._register(this._mcpRegistry.registerDelegate({
            // Prefer Node.js extension hosts when they're available. No CORS issues etc.
            priority: _extHostContext.extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */ ? 0 : 1,
            waitForInitialProviderPromises() {
                return proxy.$waitForInitialCollectionProviders();
            },
            canStart(collection, serverDefinition) {
                // todo: SSE MPC servers without a remote authority could be served from the renderer
                if (collection.remoteAuthority !== _extHostContext.remoteAuthority) {
                    return false;
                }
                if (serverDefinition.launch.type === 1 /* McpServerTransportType.Stdio */ && _extHostContext.extensionHostKind === 2 /* ExtensionHostKind.LocalWebWorker */) {
                    return false;
                }
                return true;
            },
            start: (collection, _serverDefiniton, resolveLaunch) => {
                const id = ++this._serverIdCounter;
                const launch = new ExtHostMcpServerLaunch(_extHostContext.extensionHostKind, () => proxy.$stopMcp(id), msg => proxy.$sendMessage(id, JSON.stringify(msg)));
                this._servers.set(id, launch);
                proxy.$startMcp(id, resolveLaunch);
                return launch;
            },
        }));
    }
    $upsertMcpCollection(collection, serversDto) {
        const servers = serversDto.map(McpServerDefinition.fromSerialized);
        const existing = this._collectionDefinitions.get(collection.id);
        if (existing) {
            existing.servers.set(servers, undefined);
        }
        else {
            const serverDefinitions = observableValue('mcpServers', servers);
            const handle = this._mcpRegistry.registerCollection({
                ...collection,
                remoteAuthority: this._extHostContext.remoteAuthority,
                serverDefinitions,
            });
            this._collectionDefinitions.set(collection.id, {
                fromExtHost: collection,
                servers: serverDefinitions,
                dispose: () => handle.dispose(),
            });
        }
    }
    $deleteMcpCollection(collectionId) {
        this._collectionDefinitions.deleteAndDispose(collectionId);
    }
    $onDidChangeState(id, update) {
        const server = this._servers.get(id);
        if (!server) {
            return;
        }
        server.state.set(update, undefined);
        if (!McpConnectionState.isRunning(update)) {
            server.dispose();
            this._servers.delete(id);
        }
    }
    $onDidPublishLog(id, level, log) {
        if (typeof level === 'string') {
            level = LogLevel.Info;
            log = level;
        }
        this._servers.get(id)?.pushLog(level, log);
    }
    $onDidReceiveMessage(id, message) {
        this._servers.get(id)?.pushMessage(message);
    }
    dispose() {
        for (const server of this._servers.values()) {
            server.extHostDispose();
        }
        this._servers.clear();
        super.dispose();
    }
};
MainThreadMcp = __decorate([
    extHostNamedCustomer(MainContext.MainThreadMcp),
    __param(1, IMcpRegistry)
], MainThreadMcp);
export { MainThreadMcp };
class ExtHostMcpServerLaunch extends Disposable {
    pushLog(level, message) {
        this._onDidLog.fire({ message, level });
    }
    pushMessage(message) {
        let parsed;
        try {
            parsed = JSON.parse(message);
        }
        catch (e) {
            this.pushLog(LogLevel.Warning, `Failed to parse message: ${JSON.stringify(message)}`);
        }
        if (parsed) {
            this._onDidReceiveMessage.fire(parsed);
        }
    }
    constructor(extHostKind, stop, send) {
        super();
        this.stop = stop;
        this.send = send;
        this.state = observableValue('mcpServerState', { state: 1 /* McpConnectionState.Kind.Starting */ });
        this._onDidLog = this._register(new Emitter());
        this.onDidLog = this._onDidLog.event;
        this._onDidReceiveMessage = this._register(new Emitter());
        this.onDidReceiveMessage = this._onDidReceiveMessage.event;
        this._register(disposableTimeout(() => {
            this.pushLog(LogLevel.Info, `Starting server from ${extensionHostKindToString(extHostKind)} extension host`);
        }));
    }
    extHostDispose() {
        if (McpConnectionState.isRunning(this.state.get())) {
            this.pushLog(LogLevel.Warning, 'Extension host shut down, server will stop.');
            this.state.set({ state: 0 /* McpConnectionState.Kind.Stopped */ }, undefined);
        }
        this.dispose();
    }
    dispose() {
        if (McpConnectionState.isRunning(this.state.get())) {
            this.stop();
        }
        super.dispose();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE1jcC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTWNwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzlFLE9BQU8sRUFBdUIsZUFBZSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDMUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQy9ELE9BQU8sRUFBd0IsWUFBWSxFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDbEcsT0FBTyxFQUEyQixrQkFBa0IsRUFBRSxtQkFBbUIsRUFBMEIsTUFBTSxzQ0FBc0MsQ0FBQztBQUVoSixPQUFPLEVBQXFCLHlCQUF5QixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDckgsT0FBTyxFQUFtQixvQkFBb0IsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzdHLE9BQU8sRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFzQixNQUFNLCtCQUErQixDQUFDO0FBR3pGLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxVQUFVO0lBVzVDLFlBQ2tCLGVBQWdDLEVBQ25DLFlBQTJDO1FBRXpELEtBQUssRUFBRSxDQUFDO1FBSFMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2xCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBWGxELHFCQUFnQixHQUFHLENBQUMs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