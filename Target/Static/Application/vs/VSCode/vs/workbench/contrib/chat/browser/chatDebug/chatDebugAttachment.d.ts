import { URI } from '../../../../../base/common/uri.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
import { IChatRequestVariableEntry } from '../../common/attachments/chatVariableEntries.js';
/**
 * Creates a debug events attachment for a chat session.
 * This can be used to attach debug logs to a chat request.
 */
export declare function createDebugEventsAttachment(sessionResource: URI, chatDebugService: IChatDebugService): Promise<IChatRequestVariableEntry>;
