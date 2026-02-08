import { URI } from '../../../../../base/common/uri.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IChatSessionTiming } from '../../common/chatService/chatService.js';
export declare enum AgentSessionProviders {
    Local = "local",
    Background = "copilotcli",
    Cloud = "copilot-cloud-agent",
    Claude = "claude-code",
    Codex = "openai-codex"
}
export declare function isBuiltInAgentSessionProvider(provider: string): boolean;
export declare function getAgentSessionProvider(sessionResource: URI | string): AgentSessionProviders | undefined;
export declare function getAgentSessionProviderName(provider: AgentSessionProviders): string;
export declare function getAgentSessionProviderIcon(provider: AgentSessionProviders): ThemeIcon;
export declare function isFirstPartyAgentSessionProvider(provider: AgentSessionProviders): boolean;
export declare function getAgentCanContinueIn(provider: AgentSessionProviders): boolean;
export declare function getAgentSessionProviderDescription(provider: AgentSessionProviders): string;
export declare enum AgentSessionsViewerOrientation {
    Stacked = 1,
    SideBySide = 2
}
export declare enum AgentSessionsViewerPosition {
    Left = 1,
    Right = 2
}
export interface IAgentSessionsControl {
    readonly element: HTMLElement | undefined;
    refresh(): void;
    openFind(): void;
    reveal(sessionResource: URI): boolean;
    clearFocus(): void;
    hasFocusOrSelection(): boolean;
}
export declare const agentSessionReadIndicatorForeground: string;
export declare const agentSessionSelectedBadgeBorder: string;
export declare const agentSessionSelectedUnfocusedBadgeBorder: string;
export declare const AGENT_SESSION_RENAME_ACTION_ID = "agentSession.rename";
export declare const AGENT_SESSION_DELETE_ACTION_ID = "agentSession.delete";
export declare function getAgentSessionTime(timing: IChatSessionTiming): number;
