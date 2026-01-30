import { IDisposable, IReference, ReferenceCollection } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ChatAgentLocation } from '../constants.js';
import { IChatEditingSession } from '../editing/chatEditingService.js';
import { ChatModel, ISerializableChatModelInputState, ISerializedChatDataReference } from './chatModel.js';
export interface IStartSessionProps {
    readonly initialData?: ISerializedChatDataReference;
    readonly location: ChatAgentLocation;
    readonly sessionResource: URI;
    readonly sessionId?: string;
    readonly canUseTools: boolean;
    readonly transferEditingSession?: IChatEditingSession;
    readonly disableBackgroundKeepAlive?: boolean;
    readonly inputState?: ISerializableChatModelInputState;
}
export interface ChatModelStoreDelegate {
    createModel: (props: IStartSessionProps) => ChatModel;
    willDisposeModel: (model: ChatModel) => Promise<void>;
}
export declare class ChatModelStore extends ReferenceCollection<ChatModel> implements IDisposable {
    private readonly delegate;
    private readonly logService;
    private readonly _store;
    private readonly _models;
    private readonly _modelsToDispose;
    private readonly _pendingDisposals;
    private readonly _onDidDisposeModel;
    readonly onDidDisposeModel: import("../../../../../base/common/event.js").Event<ChatModel>;
    private readonly _onDidCreateModel;
    readonly onDidCreateModel: import("../../../../../base/common/event.js").Event<ChatModel>;
    constructor(delegate: ChatModelStoreDelegate, logService: ILogService);
    get observable(): import("../../../../../base/common/observable.js").IObservable<Map<string, ChatModel>>;
    values(): Iterable<ChatModel>;
    /**
     * Get a ChatModel directly without acquiring a reference.
     */
    get(uri: URI): ChatModel | undefined;
    has(uri: URI): boolean;
    acquireExisting(uri: URI): IReference<ChatModel> | undefined;
    acquireOrCreate(props: IStartSessionProps): IReference<ChatModel>;
    protected createReferencedObject(key: string, props?: IStartSessionProps): ChatModel;
    protected destroyReferencedObject(key: string, object: ChatModel): void;
    private doDestroyReferencedObject;
    /**
     * For test use only
     */
    waitForModelDisposals(): Promise<void>;
    private toKey;
    dispose(): void;
}
