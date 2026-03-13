import { IExtensionTerminalProfile, ITerminalCompletionProviderContribution } from '../../../../platform/terminal/common/terminal.js';
import { Event } from '../../../../base/common/event.js';
export interface IExtensionTerminalCompletionProvider extends ITerminalCompletionProviderContribution {
    extensionIdentifier: string;
}
export interface ITerminalContributionService {
    readonly _serviceBrand: undefined;
    readonly terminalProfiles: ReadonlyArray<IExtensionTerminalProfile>;
    readonly terminalCompletionProviders: ReadonlyArray<IExtensionTerminalCompletionProvider>;
    readonly onDidChangeTerminalCompletionProviders: Event<void>;
}
export declare const ITerminalContributionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalContributionService>;
export declare class TerminalContributionService implements ITerminalContributionService {
    _serviceBrand: undefined;
    private _terminalProfiles;
    get terminalProfiles(): readonly IExtensionTerminalProfile[];
    private _terminalCompletionProviders;
    get terminalCompletionProviders(): readonly IExtensionTerminalCompletionProvider[];
    private readonly _onDidChangeTerminalCompletionProviders;
    readonly onDidChangeTerminalCompletionProviders: Event<void>;
    constructor();
}
