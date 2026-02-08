import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorInputCapabilities, IEditorSerializer, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IBrowserViewWorkbenchService, IBrowserViewModel } from '../common/browserView.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
/**
 * JSON-serializable type used during browser state serialization/deserialization
 */
export interface IBrowserEditorInputData {
    readonly id: string;
    readonly url?: string;
    readonly title?: string;
    readonly favicon?: string;
}
export declare class BrowserEditorInput extends EditorInput {
    private readonly themeService;
    private readonly browserViewWorkbenchService;
    private readonly lifecycleService;
    private readonly instantiationService;
    private readonly telemetryService;
    static readonly ID = "workbench.editorinputs.browser";
    private static readonly DEFAULT_LABEL;
    private readonly _id;
    private readonly _initialData;
    private _model;
    private _modelPromise;
    constructor(options: IBrowserEditorInputData, themeService: IThemeService, browserViewWorkbenchService: IBrowserViewWorkbenchService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, telemetryService: ITelemetryService);
    get id(): string;
    resolve(): Promise<IBrowserViewModel>;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    get resource(): URI;
    getIcon(): ThemeIcon | URI | undefined;
    getName(): string;
    getTitle(): string;
    getDescription(): string | undefined;
    canReopen(): boolean;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    /**
     * Creates a copy of this browser editor input with a new unique ID, creating an independent browser view with no linked state.
     * This is used during Copy into New Window.
     */
    copy(): EditorInput;
    toUntyped(): IUntypedEditorInput;
    private _resourceBeforeDisposal;
    dispose(): void;
    serialize(): IBrowserEditorInputData;
}
export declare class BrowserEditorSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): editorInput is BrowserEditorInput;
    serialize(editorInput: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined;
}
