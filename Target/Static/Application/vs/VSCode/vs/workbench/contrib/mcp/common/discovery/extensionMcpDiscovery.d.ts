import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IMcpRegistry } from '../mcpRegistryTypes.js';
import { IMcpDiscovery } from './mcpDiscovery.js';
export declare class ExtensionMcpDiscovery extends Disposable implements IMcpDiscovery {
    private readonly _mcpRegistry;
    private readonly _extensionService;
    private readonly _contextKeyService;
    readonly fromGallery = false;
    private readonly _extensionCollectionIdsToPersist;
    private readonly cachedServers;
    private readonly _conditionalCollections;
    constructor(_mcpRegistry: IMcpRegistry, storageService: IStorageService, _extensionService: IExtensionService, _contextKeyService: IContextKeyService);
    start(): void;
    private _registerCollection;
    private _registerConditionalCollection;
    private _activateExtensionServers;
    private static _validate;
}
