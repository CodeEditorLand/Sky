import type { ITerminalAddon, Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { IChatAgent, IChatAgentService } from '../../../chat/common/participants/chatAgents.js';
import { IDetachedTerminalInstance, ITerminalConfigurationService, ITerminalContribution, ITerminalInstance, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { type IDetachedCompatibleTerminalContributionContext, type ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
import './media/terminalInitialHint.css';
export declare class InitialHintAddon extends Disposable implements ITerminalAddon {
    private readonly _capabilities;
    private readonly _onDidChangeAgents;
    private readonly _onDidRequestCreateHint;
    get onDidRequestCreateHint(): Event<void>;
    private readonly _disposables;
    constructor(_capabilities: ITerminalCapabilityStore, _onDidChangeAgents: Event<IChatAgent | undefined>);
    activate(terminal: RawXtermTerminal): void;
}
export declare class TerminalInitialHintContribution extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _chatAgentService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _terminalConfigurationService;
    static readonly ID = "terminal.initialHint";
    private _addon;
    private _hintWidget;
    static get(instance: ITerminalInstance | IDetachedTerminalInstance): TerminalInitialHintContribution | null;
    private readonly _decoration;
    private _xterm;
    private readonly _cursorMoveListener;
    constructor(_ctx: ITerminalContributionContext | IDetachedCompatibleTerminalContributionContext, _chatAgentService: IChatAgentService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _terminalConfigurationService: ITerminalConfigurationService);
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _disposeHint;
    private _createHint;
}
