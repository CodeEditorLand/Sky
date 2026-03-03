import './media/chatDebug.css';
import { Dimension } from '../../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { URI } from '../../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
import { EditorPane } from '../../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { IEditorGroup } from '../../../../services/editor/common/editorGroupsService.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IChatWidgetService } from '../chat.js';
import { IChatDebugEditorOptions } from './chatDebugTypes.js';
export declare class ChatDebugEditor extends EditorPane {
    private readonly instantiationService;
    private readonly chatDebugService;
    private readonly chatWidgetService;
    private readonly chatService;
    private readonly contextKeyService;
    static readonly ID: string;
    private container;
    private currentDimension;
    private viewState;
    private homeView;
    private overviewView;
    private logsView;
    private flowChartView;
    private filterState;
    private readonly sessionModelListener;
    private readonly modelChangeListeners;
    /** Saved session resource so we can restore it after the editor is re-shown. */
    private savedSessionResource;
    /**
     * Stops the streaming pipeline and clears cached events for the
     * active session. Called when navigating away from a session or
     * when the editor becomes hidden.
     */
    private endActiveSession;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, instantiationService: IInstantiationService, chatDebugService: IChatDebugService, chatWidgetService: IChatWidgetService, chatService: IChatService, contextKeyService: IContextKeyService);
    protected createEditor(parent: HTMLElement): void;
    private showView;
    navigateToSession(sessionResource: URI, view?: 'logs' | 'overview' | 'flowchart'): void;
    private trackSessionModelChanges;
    focus(): void;
    setInput(input: EditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    setOptions(options: IChatDebugEditorOptions | undefined): void;
    setEditorVisible(visible: boolean): void;
    private _applyNavigationOptions;
    layout(dimension: Dimension): void;
    private doLayout;
}
