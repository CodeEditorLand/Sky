import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IMcpRegistry } from '../mcpRegistryTypes.js';
import { IMcpWorkbenchService } from '../mcpTypes.js';
import { IMcpDiscovery } from './mcpDiscovery.js';
export declare class InstalledMcpServersDiscovery extends Disposable implements IMcpDiscovery {
    private readonly mcpWorkbenchService;
    private readonly mcpRegistry;
    private readonly textModelService;
    private readonly logService;
    readonly fromGallery = true;
    private readonly collections;
    constructor(mcpWorkbenchService: IMcpWorkbenchService, mcpRegistry: IMcpRegistry, textModelService: ITextModelService, logService: ILogService);
    start(): void;
    private getServerIdMapping;
    private sync;
}
