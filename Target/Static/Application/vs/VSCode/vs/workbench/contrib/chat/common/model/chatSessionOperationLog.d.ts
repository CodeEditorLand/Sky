import { IChatDataSerializerLog, IChatModel, ISerializableChatData } from './chatModel.js';
import * as Adapt from './objectMutationLog.js';
export declare const storageSchema: Adapt.TransformObject<IChatModel, import("./chatModel.js").ISerializableChatData3>;
export declare class ChatSessionOperationLog extends Adapt.ObjectMutationLog<IChatModel, ISerializableChatData> implements IChatDataSerializerLog {
    constructor();
}
