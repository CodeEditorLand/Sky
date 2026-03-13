import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { EnablementModel } from '../../chat/common/enablement.js';
import { IMcpRegistry } from './mcpRegistryTypes.js';
import { McpServerMetadataCache } from './mcpServer.js';
import { IAutostartResult, IMcpServer, IMcpService, McpCollectionDefinition } from './mcpTypes.js';
export declare class McpService extends Disposable implements IMcpService {
    private readonly _instantiationService;
    private readonly _mcpRegistry;
    private readonly _logService;
    private readonly configurationService;
    _serviceBrand: undefined;
    private readonly _currentAutoStarts;
    private readonly _servers;
    readonly servers: IObservable<readonly IMcpServer[]>;
    get lazyCollectionState(): IObservable<{
        state: import("./mcpTypes.js").LazyCollectionState;
        collections: McpCollectionDefinition[];
    }>;
    readonly enablementModel: EnablementModel;
    protected readonly userCache: McpServerMetadataCache;
    protected readonly workspaceCache: McpServerMetadataCache;
    constructor(_instantiationService: IInstantiationService, _mcpRegistry: IMcpRegistry, _logService: ILogService, configurationService: IConfigurationService, storageService: IStorageService);
    cancelAutostart(): void;
    autostart(_token?: CancellationToken): IObservable<IAutostartResult>;
    private _autostart;
    resetCaches(): void;
    resetTrust(): void;
    activateCollections(): Promise<void>;
    private _activateCollections;
    updateCollectedServers(): void;
    dispose(): void;
}
