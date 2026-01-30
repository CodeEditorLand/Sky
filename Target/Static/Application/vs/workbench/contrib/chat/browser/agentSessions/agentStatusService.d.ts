import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export declare enum AgentStatusMode {
    /** Default mode showing workspace name + session stats */
    Default = "default",
    /** Session mode showing session title + Esc button */
    Session = "session"
}
export interface IAgentStatusSessionInfo {
    readonly sessionId: string;
    readonly title: string;
}
export interface IAgentStatusService {
    readonly _serviceBrand: undefined;
    /**
     * The current mode of the agent status widget.
     */
    readonly mode: AgentStatusMode;
    /**
     * The current session info when in session mode, undefined otherwise.
     */
    readonly sessionInfo: IAgentStatusSessionInfo | undefined;
    /**
     * Event fired when the control mode changes.
     */
    readonly onDidChangeMode: Event<AgentStatusMode>;
    /**
     * Event fired when the session info changes (including when entering/exiting session mode).
     */
    readonly onDidChangeSessionInfo: Event<IAgentStatusSessionInfo | undefined>;
    /**
     * Enter session mode, showing the session title and escape button.
     * Used by Agent Session Projection when entering a focused session view.
     */
    enterSessionMode(sessionId: string, title: string): void;
    /**
     * Exit session mode, returning to the default mode with workspace name and stats.
     * Used by Agent Session Projection when exiting a focused session view.
     */
    exitSessionMode(): void;
    /**
     * Update the session title while in session mode.
     */
    updateSessionTitle(title: string): void;
}
export declare const IAgentStatusService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentStatusService>;
export declare class AgentStatusService extends Disposable implements IAgentStatusService {
    readonly _serviceBrand: undefined;
    private _mode;
    get mode(): AgentStatusMode;
    private _sessionInfo;
    get sessionInfo(): IAgentStatusSessionInfo | undefined;
    private readonly _onDidChangeMode;
    readonly onDidChangeMode: Event<AgentStatusMode>;
    private readonly _onDidChangeSessionInfo;
    readonly onDidChangeSessionInfo: Event<IAgentStatusSessionInfo | undefined>;
    enterSessionMode(sessionId: string, title: string): void;
    exitSessionMode(): void;
    updateSessionTitle(title: string): void;
}
