import { URI } from '../../../../../base/common/uri.js';
import { IChatVariablesService } from '../attachments/chatVariables.js';
import { ChatAgentLocation, ChatModeKind } from '../constants.js';
import { IChatAgentData, IChatAgentService } from '../participants/chatAgents.js';
import { IChatSlashCommandService } from '../participants/chatSlashCommands.js';
import { IPromptsService } from '../promptSyntax/service/promptsService.js';
import { IParsedChatRequest } from './chatParserTypes.js';
export interface IChatParserContext {
    /** Used only as a disambiguator, when the query references an agent that has a duplicate with the same name. */
    selectedAgent?: IChatAgentData;
    mode?: ChatModeKind;
    /** Parse as this agent, even when it does not appear in the query text */
    forcedAgent?: IChatAgentData;
}
export declare class ChatRequestParser {
    private readonly agentService;
    private readonly variableService;
    private readonly slashCommandService;
    private readonly promptsService;
    constructor(agentService: IChatAgentService, variableService: IChatVariablesService, slashCommandService: IChatSlashCommandService, promptsService: IPromptsService);
    parseChatRequest(sessionResource: URI, message: string, location?: ChatAgentLocation, context?: IChatParserContext): IParsedChatRequest;
    private tryToParseAgent;
    private tryToParseVariable;
    private tryToParseSlashCommand;
    private tryToParseDynamicVariable;
}
