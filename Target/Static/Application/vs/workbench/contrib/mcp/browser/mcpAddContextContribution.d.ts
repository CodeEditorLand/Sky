import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IChatContextPickService } from '../../chat/browser/attachments/chatContextPickService.js';
import { IMcpService } from '../common/mcpTypes.js';
export declare class McpAddContextContribution extends Disposable implements IWorkbenchContribution {
    private readonly _chatContextPickService;
    private readonly _instantiationService;
    private readonly _addContextMenu;
    constructor(_chatContextPickService: IChatContextPickService, _instantiationService: IInstantiationService, mcpService: IMcpService);
    private _registerAddContextMenu;
    private _getResourcePicks;
}
