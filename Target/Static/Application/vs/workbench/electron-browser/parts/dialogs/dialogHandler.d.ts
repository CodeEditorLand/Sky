import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { AbstractDialogHandler, IConfirmation, IConfirmationResult, IPrompt, IAsyncPromptResult } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
export declare class NativeDialogHandler extends AbstractDialogHandler {
    private readonly logService;
    private readonly nativeHostService;
    private readonly clipboardService;
    constructor(logService: ILogService, nativeHostService: INativeHostService, clipboardService: IClipboardService);
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    input(): never;
    about(title: string, details: string, detailsToCopy: string): Promise<void>;
}
