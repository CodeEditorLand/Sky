import * as dom from '../../../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ITextResourceConfigurationService } from '../../../../../../editor/common/services/textResourceConfiguration.js';
import { IContextKeyService, IScopedContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { AbstractEditorWithViewState } from '../../../../../browser/parts/editor/editorWithViewState.js';
import { IEditorOpenContext } from '../../../../../common/editor.js';
import { EditorInput } from '../../../../../common/editor/editorInput.js';
import { IEditorGroup, IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IChatModelInputState, IExportableChatData, ISerializableChatData } from '../../../common/model/chatModel.js';
import { IChatService } from '../../../common/chatService/chatService.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { ChatEditorInput } from './chatEditorInput.js';
import { ChatWidget } from '../../widget/chatWidget.js';
export interface IChatEditorOptions extends IEditorOptions {
    /**
     * Input state of the model when the editor is opened. Currently needed since
     * new sessions are not persisted but may go away with
     * https://github.com/microsoft/vscode/pull/278476 as input state is stored on the model.
     */
    modelInputState?: IChatModelInputState;
    target?: {
        data: IExportableChatData | ISerializableChatData;
    };
    title?: {
        preferred?: string;
        fallback?: string;
    };
}
export interface IChatEditorViewState {
    scrollTop: number;
}
export declare class ChatEditor extends AbstractEditorWithViewState<IChatEditorViewState> {
    private readonly chatSessionsService;
    private readonly contextKeyService;
    private readonly chatService;
    private static readonly VIEW_STATE_KEY;
    private _widget;
    get widget(): ChatWidget;
    private _scopedContextKeyService;
    get scopedContextKeyService(): IScopedContextKeyService;
    private dimension;
    private _loadingContainer;
    private _editorContainer;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, instantiationService: IInstantiationService, storageService: IStorageService, chatSessionsService: IChatSessionsService, contextKeyService: IContextKeyService, chatService: IChatService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    private clear;
    protected createEditor(parent: HTMLElement): void;
    protected setEditorVisible(visible: boolean): void;
    focus(): void;
    clearInput(): void;
    private showLoadingInChatWidget;
    private hideLoadingInChatWidget;
    setInput(input: ChatEditorInput, options: IChatEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private updateModel;
    protected computeEditorViewState(_resource: URI): IChatEditorViewState | undefined;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    layout(dimension: dom.Dimension, position?: dom.IDomPosition | undefined): void;
}
