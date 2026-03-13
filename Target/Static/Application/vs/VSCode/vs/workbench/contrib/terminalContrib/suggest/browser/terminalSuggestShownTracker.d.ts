import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { TerminalShellType } from '../../../../../platform/terminal/common/terminal.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
export declare const TERMINAL_SUGGEST_DISCOVERABILITY_KEY = "terminal.suggest.increasedDiscoverability";
export declare const TERMINAL_SUGGEST_DISCOVERABILITY_COUNT_KEY = "terminal.suggest.increasedDiscoverabilityCount";
interface ITerminalSuggestShownTracker extends IDisposable {
    getFirstShown(shellType: TerminalShellType): {
        window: boolean;
        shell: boolean;
    };
    updateShown(): void;
    resetState(): void;
}
export declare class TerminalSuggestShownTracker extends Disposable implements ITerminalSuggestShownTracker {
    private readonly _shellType;
    private readonly _storageService;
    private readonly _extensionService;
    private _done;
    private _count;
    private _timeout;
    private _start;
    private _firstShownTracker;
    constructor(_shellType: TerminalShellType | undefined, _storageService: IStorageService, _extensionService: IExtensionService);
    get done(): boolean;
    resetState(): void;
    resetTimer(): void;
    update(widgetElt: HTMLElement | undefined): void;
    private _setDone;
    getFirstShown(shellType: TerminalShellType | undefined): {
        window: boolean;
        shell: boolean;
    };
    updateShown(): void;
}
export {};
