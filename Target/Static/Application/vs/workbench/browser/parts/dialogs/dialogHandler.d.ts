import { IConfirmation, IConfirmationResult, IInputResult, IInput, AbstractDialogHandler, IPrompt, IAsyncPromptResult } from '../../../../platform/dialogs/common/dialogs.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IHostService } from '../../../services/host/browser/host.js';
export declare class BrowserDialogHandler extends AbstractDialogHandler {
    private readonly logService;
    private readonly layoutService;
    private readonly keybindingService;
    private readonly clipboardService;
    private readonly openerService;
    private readonly markdownRendererService;
    private readonly hostService;
    private static readonly ALLOWABLE_COMMANDS;
    constructor(logService: ILogService, layoutService: ILayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, clipboardService: IClipboardService, openerService: IOpenerService, markdownRendererService: IMarkdownRendererService, hostService: IHostService);
    prompt<T>(prompt: IPrompt<T>): Promise<IAsyncPromptResult<T>>;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    input(input: IInput): Promise<IInputResult>;
    about(title: string, details: string, detailsToCopy: string): Promise<void>;
    private doShow;
}
