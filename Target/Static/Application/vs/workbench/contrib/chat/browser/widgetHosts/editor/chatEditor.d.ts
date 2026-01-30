import * as dom from '../../../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { IContextKeyService, IScopedContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../../../common/editor.js';
import { IEditorGroup } from '../../../../../services/editor/common/editorGroupsService.js';
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
    expanded?: boolean;
}
export declare class ChatEditor extends EditorPane {
    private readonly instantiationService;
    private readonly chatSessionsService;
    private readonly contextKeyService;
    private readonly chatService;
    private _widget;
    get widget(): ChatWidget;
    private _scopedContextKeyService;
    get scopedContextKeyService(): IScopedContextKeyService;
    private dimension;
    private _loadingContainer;
    private _editorContainer;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, instantiationService: IInstantiationService, storageService: IStorageService, chatSessionsService: IChatSessionsService, contextKeyService: IContextKeyService, chatService: IChatService);
    private clear;
    protected createEditor(parent: HTMLElement): void;
    protected setEditorVisible(visible: boolean): void;
    focus(): void;
    clearInput(): void;
    private showLoadingInChatWidget;
    private hideLoadingInChatWidget;
    setInput(input: ChatEditorInput, options: IChatEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private updateModel;
    layout(dimension: dom.Dimension, position?: dom.IDomPosition | undefined): void;
}
