import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ITerminalCommandSelector } from '../../../../../platform/terminal/common/terminal.js';
import { ITerminalQuickFixService, ITerminalQuickFixProvider, ITerminalQuickFixProviderSelector } from './quickFix.js';
export declare class TerminalQuickFixService implements ITerminalQuickFixService {
    _serviceBrand: undefined;
    private _selectors;
    private _providers;
    get providers(): Map<string, ITerminalQuickFixProvider>;
    private _pendingProviders;
    private readonly _onDidRegisterProvider;
    readonly onDidRegisterProvider: import("../../../../../base/common/event.js").Event<ITerminalQuickFixProviderSelector>;
    private readonly _onDidRegisterCommandSelector;
    readonly onDidRegisterCommandSelector: import("../../../../../base/common/event.js").Event<ITerminalCommandSelector>;
    private readonly _onDidUnregisterProvider;
    readonly onDidUnregisterProvider: import("../../../../../base/common/event.js").Event<string>;
    readonly extensionQuickFixes: Promise<Array<ITerminalCommandSelector>>;
    constructor();
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
}
