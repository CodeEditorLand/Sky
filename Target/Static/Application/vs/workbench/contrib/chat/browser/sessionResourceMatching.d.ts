import { URI } from '../../../../base/common/uri.js';
import { IModifiedFileEntry } from '../common/editing/chatEditingService.js';
import { IAgentSession } from './agentSessions/agentSessionsModel.js';
export declare function editingEntriesContainResource(entries: readonly IModifiedFileEntry[], resourceUri: URI): boolean;
export declare function agentSessionContainsResource(session: IAgentSession, resourceUri: URI): boolean;
