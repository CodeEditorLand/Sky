import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { Location } from '../../../../../editor/common/languages.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IChatEditingService } from '../../common/editing/chatEditingService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatRequestImplicitVariableEntry, IChatRequestVariableEntry, StringChatContextValue } from '../../common/attachments/chatVariableEntries.js';
import { ILanguageModelIgnoredFilesService } from '../../common/ignoredFiles.js';
import { IChatWidgetService } from '../chat.js';
import { IChatContextService } from '../contextContrib/chatContextService.js';
export declare class ChatImplicitContextContribution extends Disposable implements IWorkbenchContribution {
    private readonly codeEditorService;
    private readonly editorService;
    private readonly chatWidgetService;
    private readonly chatService;
    private readonly chatEditingService;
    private readonly configurationService;
    private readonly ignoredFilesService;
    private readonly chatContextService;
    static readonly ID = "chat.implicitContext";
    private readonly _currentCancelTokenSource;
    private _implicitContextEnablement;
    constructor(codeEditorService: ICodeEditorService, editorService: IEditorService, chatWidgetService: IChatWidgetService, chatService: IChatService, chatEditingService: IChatEditingService, configurationService: IConfigurationService, ignoredFilesService: ILanguageModelIgnoredFilesService, chatContextService: IChatContextService);
    private findActiveCodeEditor;
    private findActiveWebviewEditor;
    private findActiveNotebookEditor;
    private updateImplicitContext;
}
interface ImplicitContextWithSelection {
    value: Location | URI | StringChatContextValue | undefined;
    isSelection: boolean;
}
export declare class ChatImplicitContexts extends Disposable {
    private _onDidChangeValue;
    readonly onDidChangeValue: Event<void>;
    private _values;
    private readonly _valuesDisposables;
    setValues(values: ImplicitContextWithSelection[]): void;
    get values(): ChatImplicitContext[];
    get hasEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    get hasValue(): boolean;
    get hasNonUri(): boolean;
    getLocations(): Location[];
    getUris(): URI[];
    get hasNonStringContext(): boolean;
    enabledBaseEntries(includeAllLocations: boolean): IChatRequestVariableEntry[];
}
export declare class ChatImplicitContext extends Disposable implements IChatRequestImplicitVariableEntry {
    get id(): "vscode.implicit.selection" | "vscode.implicit.file" | "vscode.implicit.string" | "vscode.implicit.viewport" | "vscode.implicit";
    get name(): string;
    readonly kind = "implicit";
    get modelDescription(): string;
    readonly isFile = true;
    private _isSelection;
    get isSelection(): boolean;
    private _onDidChangeValue;
    readonly onDidChangeValue: Event<void>;
    private _value;
    get value(): URI | Location | StringChatContextValue | undefined;
    private _enabled;
    get enabled(): boolean;
    set enabled(value: boolean);
    private _uri;
    get uri(): URI | undefined;
    get icon(): ThemeIcon | undefined;
    setValue(value: Location | URI | StringChatContextValue | undefined, isSelection: boolean): void;
    toBaseEntries(): IChatRequestVariableEntry[];
}
export {};
