import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
export declare enum AgentStatusMode {
    /** Default mode showing workspace name + session stats */
    Default = "default",
    /** Session ready mode showing session title + Enter button (before entering projection) */
    SessionReady = "sessionReady",
    /** Session mode showing session title + Esc button (inside projection) */
    Session = "session"
}
export interface IAgentStatusSessionInfo {
    readonly sessionResource: URI;
    readonly title: string;
}
export interface IAgentTitleBarStatusService {
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
    enterSessionMode(sessionResource: URI, title: string): void;
    /**
     * Enter session ready mode, showing the session title and enter button.
     * Used when viewing a projection-capable session that can be entered.
     */
    enterSessionReadyMode(sessionResource: URI, title: string): void;
    /**
     * Exit session ready mode, returning to the default mode.
     * Called when the session is no longer visible or valid for projection.
     */
    exitSessionReadyMode(): void;
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
export declare const IAgentTitleBarStatusService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentTitleBarStatusService>;
export declare class AgentTitleBarStatusService extends Disposable implements IAgentTitleBarStatusService {
    readonly _serviceBrand: undefined;
    private _mode;
    get mode(): AgentStatusMode;
    private _sessionInfo;
    get sessionInfo(): IAgentStatusSessionInfo | undefined;
    private readonly _onDidChangeMode;
    readonly onDidChangeMode: Event<AgentStatusMode>;
    private readonly _onDidChangeSessionInfo;
    readonly onDidChangeSessionInfo: Event<IAgentStatusSessionInfo | undefined>;
    enterSessionMode(sessionResource: URI, title: string): void;
    enterSessionReadyMode(sessionResource: URI, title: string): void;
    exitSessionReadyMode(): void;
    exitSessionMode(): void;
    updateSessionTitle(title: string): void;
}
