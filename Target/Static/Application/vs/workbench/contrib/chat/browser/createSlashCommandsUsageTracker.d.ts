import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatService } from '../common/chatService/chatService.js';
export declare class CreateSlashCommandsUsageTracker extends Disposable {
    private readonly _chatService;
    private readonly _storageService;
    private readonly _getActiveContextKeyService;
    private static readonly _USED_CREATE_SLASH_COMMANDS_KEY;
    constructor(_chatService: IChatService, _storageService: IStorageService, _getActiveContextKeyService: () => IContextKeyService | undefined);
    syncContextKey(contextKeyService: IContextKeyService): void;
    private _markUsed;
    private static _isCreateSlashCommand;
}
