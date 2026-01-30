import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { UriComponents } from '../../../../../base/common/uri.js';
import { Event } from '../../../../../base/common/event.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { type ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalLogService, TerminalShellType } from '../../../../../platform/terminal/common/terminal.js';
import { type ITerminalCompletion } from './terminalCompletionItem.js';
import type { IProcessEnvironment } from '../../../../../base/common/platform.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IRelativePattern } from '../../../../../base/common/glob.js';
export declare const ITerminalCompletionService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalCompletionService>;
/**
 * Represents a collection of {@link CompletionItem completion items} to be presented
 * in the terminal.
 */
export declare class TerminalCompletionList<ITerminalCompletion> {
    /**
     * Resources should be shown in the completions list
     */
    resourceOptions?: TerminalCompletionResourceOptions;
    /**
     * The completion items.
     */
    items?: ITerminalCompletion[];
    /**
     * Creates a new completion list.
     *
     * @param items The completion items.
     * @param isIncomplete The list is not complete.
     */
    constructor(items?: ITerminalCompletion[], resourceOptions?: TerminalCompletionResourceOptions);
}
export interface TerminalCompletionResourceOptions {
    showFiles?: boolean;
    showDirectories?: boolean;
    globPattern?: string | IRelativePattern;
    cwd: UriComponents;
    pathSeparator: string;
}
export interface ITerminalCompletionProvider {
    id: string;
    shellTypes?: TerminalShellType[];
    provideCompletions(value: string, cursorPosition: number, token: CancellationToken): Promise<ITerminalCompletion[] | TerminalCompletionList<ITerminalCompletion> | undefined>;
    triggerCharacters?: string[];
    isBuiltin?: boolean;
}
export interface ITerminalCompletionService {
    _serviceBrand: undefined;
    readonly providers: IterableIterator<ITerminalCompletionProvider>;
    readonly onDidChangeProviders: Event<void>;
    registerTerminalCompletionProvider(extensionIdentifier: string, id: string, provider: ITerminalCompletionProvider, ...triggerCharacters: string[]): IDisposable;
    provideCompletions(promptValue: string, cursorPosition: number, allowFallbackCompletions: boolean, shellType: TerminalShellType | undefined, capabilities: ITerminalCapabilityStore, token: CancellationToken, triggerCharacter?: boolean, skipExtensionCompletions?: boolean, explicitlyInvoked?: boolean): Promise<ITerminalCompletion[] | undefined>;
}
export declare class TerminalCompletionService extends Disposable implements ITerminalCompletionService {
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _labelService;
    private readonly _logService;
    _serviceBrand: undefined;
    private readonly _providers;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<void>;
    get providers(): IterableIterator<ITerminalCompletionProvider>;
    private _providersGenerator;
    /** Overrides the environment for testing purposes. */
    set processEnv(env: IProcessEnvironment);
    private _processEnv;
    constructor(_configurationService: IConfigurationService, _fileService: IFileService, _labelService: ILabelService, _logService: ITerminalLogService);
    registerTerminalCompletionProvider(extensionIdentifier: string, id: string, provider: ITerminalCompletionProvider, ...triggerCharacters: string[]): IDisposable;
    provideCompletions(promptValue: string, cursorPosition: number, allowFallbackCompletions: boolean, shellType: TerminalShellType | undefined, capabilities: ITerminalCapabilityStore, token: CancellationToken, triggerCharacter?: boolean, skipExtensionCompletions?: boolean, explicitlyInvoked?: boolean): Promise<ITerminalCompletion[] | undefined>;
    protected _getEnabledProviders(providers: ITerminalCompletionProvider[]): ITerminalCompletionProvider[];
    private _collectCompletions;
    resolveResources(resourceOptions: TerminalCompletionResourceOptions, promptValue: string, cursorPosition: number, provider: string, capabilities: ITerminalCapabilityStore, shellType?: TerminalShellType): Promise<ITerminalCompletion[] | undefined>;
    private _getEnvVar;
    private _getHomeDir;
}
/**
 * Escapes special characters in a file/folder label for shell completion.
 * This ensures that characters like [, ], etc. are properly escaped.
 */
export declare function escapeTerminalCompletionLabel(label: string, shellType: TerminalShellType | undefined, pathSeparator: string): string;
