import { Disposable } from '../../../base/common/lifecycle.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IAllowedMcpServersService, IGalleryMcpServer, IInstallableMcpServer, ILocalMcpServer } from './mcpManagement.js';
export declare class AllowedMcpServersService extends Disposable implements IAllowedMcpServersService {
    private readonly configurationService;
    _serviceBrand: undefined;
    private _onDidChangeAllowedMcpServers;
    readonly onDidChangeAllowedMcpServers: import("../../../base/common/event.js").Event<void>;
    constructor(configurationService: IConfigurationService);
    isAllowed(mcpServer: IGalleryMcpServer | ILocalMcpServer | IInstallableMcpServer): true | IMarkdownString;
}
