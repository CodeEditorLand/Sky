import { URI } from '../../../../../base/common/uri.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IChatAgentData } from '../participants/chatAgents.js';
import { ChatRequestModel } from '../model/chatModel.js';
import { ChatRequestAgentSubcommandPart, ChatRequestSlashCommandPart } from '../requestParser/chatParserTypes.js';
import { IChatSendRequestOptions, IChatUserActionEvent } from './chatService.js';
import { ChatAgentLocation } from '../constants.js';
import { ILanguageModelsService } from '../languageModels.js';
export type ChatProviderInvokedEvent = {
    timeToFirstProgress: number | undefined;
    totalTime: number | undefined;
    result: 'success' | 'error' | 'errorWithOutput' | 'cancelled' | 'filtered';
    requestType: 'string' | 'followup' | 'slashCommand';
    chatSessionId: string;
    agent: string;
    agentExtensionId: string | undefined;
    slashCommand: string | undefined;
    location: ChatAgentLocation;
    citations: number;
    numCodeBlocks: number;
    isParticipantDetected: boolean;
    enableCommandDetection: boolean;
    attachmentKinds: string[];
    model: string | undefined;
};
export type ChatProviderInvokedClassification = {
    timeToFirstProgress: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'The time in milliseconds from invoking the provider to getting the first data.';
    };
    totalTime: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'The total time it took to run the provider\'s `provideResponseWithProgress`.';
    };
    result: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Whether invoking the ChatProvider resulted in an error.';
    };
    requestType: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The type of request that the user made.';
    };
    chatSessionId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'A random ID for the session.';
    };
    agent: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The type of agent used.';
    };
    agentExtensionId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The extension that contributed the agent.';
    };
    slashCommand?: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The type of slashCommand used.';
    };
    location: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The location at which chat request was made.';
    };
    citations: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The number of public code citations that were returned with the response.';
    };
    numCodeBlocks: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The number of code blocks in the response.';
    };
    isParticipantDetected: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Whether the participant was automatically detected.';
    };
    enableCommandDetection: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'Whether participation detection was disabled for this invocation.';
    };
    attachmentKinds: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The types of variables/attachments that the user included with their query.';
    };
    model: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The model used to generate the response.';
    };
    owner: 'roblourens';
    comment: 'Provides insight into the performance of Chat agents.';
};
export declare class ChatServiceTelemetry {
    private readonly telemetryService;
    constructor(telemetryService: ITelemetryService);
    notifyUserAction(action: IChatUserActionEvent): void;
    retrievedFollowups(agentId: string, command: string | undefined, numFollowups: number): void;
}
export declare class ChatRequestTelemetry {
    private readonly opts;
    private readonly telemetryService;
    private readonly languageModelsService;
    private isComplete;
    constructor(opts: {
        agent: IChatAgentData;
        agentSlashCommandPart: ChatRequestAgentSubcommandPart | undefined;
        commandPart: ChatRequestSlashCommandPart | undefined;
        sessionResource: URI;
        location: ChatAgentLocation;
        options: IChatSendRequestOptions | undefined;
        enableCommandDetection: boolean;
    }, telemetryService: ITelemetryService, languageModelsService: ILanguageModelsService);
    complete({ timeToFirstProgress, totalTime, result, requestType, request, detectedAgent }: {
        timeToFirstProgress: number | undefined;
        totalTime: number | undefined;
        result: ChatProviderInvokedEvent['result'];
        requestType: ChatProviderInvokedEvent['requestType'];
        request: ChatRequestModel;
        detectedAgent: IChatAgentData | undefined;
    }): void;
    private attachmentKindsForTelemetry;
    private resolveModelId;
}
