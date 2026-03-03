import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IAgentPluginService } from '../../../chat/common/plugins/agentPluginService.js';
import { IMcpRegistry } from '../mcpRegistryTypes.js';
import { IMcpDiscovery } from './mcpDiscovery.js';
export declare class PluginMcpDiscovery extends Disposable implements IMcpDiscovery {
    private readonly _agentPluginService;
    private readonly _mcpRegistry;
    readonly fromGallery = false;
    private readonly _collections;
    constructor(_agentPluginService: IAgentPluginService, _mcpRegistry: IMcpRegistry);
    start(): void;
    private createCollectionState;
    private _toServerDefinition;
    private _toLaunch;
}
