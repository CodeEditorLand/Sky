import { URI } from '../../../../base/common/uri.js';
import { EditorResourceAccessor } from '../../../../workbench/common/editor.js';
import { IChatEditingService } from '../../../../workbench/contrib/chat/common/editing/chatEditingService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
/**
 * Find the session that contains the given resource by checking editing sessions and agent sessions.
 */
export declare function getSessionForResource(resourceUri: URI, chatEditingService: IChatEditingService, agentSessionsService: IAgentSessionsService): URI | undefined;
export declare function getActiveResourceCandidates(input: Parameters<typeof EditorResourceAccessor.getOriginalUri>[0]): URI[];
