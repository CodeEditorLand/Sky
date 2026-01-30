import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import type { ITerminalInstance } from '../../../terminal/browser/terminal.js';
import { ShellIntegrationQuality } from './toolTerminalCreator.js';
export declare class RunInTerminalToolTelemetry {
    private readonly _telemetryService;
    constructor(_telemetryService: ITelemetryService);
    logPrepare(state: {
        terminalToolSessionId: string | undefined;
        subCommands: string[];
        autoApproveAllowed: 'allowed' | 'needsOptIn' | 'off';
        autoApproveResult: 'approved' | 'denied' | 'manual';
        autoApproveReason: 'subCommand' | 'commandLine' | undefined;
        autoApproveDefault: boolean | undefined;
    }): void;
    logInvoke(instance: ITerminalInstance, state: {
        terminalToolSessionId: string | undefined;
        didUserEditCommand: boolean;
        didToolEditCommand: boolean;
        error: string | undefined;
        isBackground: boolean;
        isNewSession: boolean;
        shellIntegrationQuality: ShellIntegrationQuality;
        outputLineCount: number;
        timingConnectMs: number;
        timingExecuteMs: number;
        pollDurationMs: number | undefined;
        terminalExecutionIdleBeforeTimeout: boolean | undefined;
        exitCode: number | undefined;
        inputUserChars: number;
        inputUserSigint: boolean;
        inputToolManualAcceptCount: number | undefined;
        inputToolManualRejectCount: number | undefined;
        inputToolManualChars: number | undefined;
        inputToolAutoAcceptCount: number | undefined;
        inputToolAutoChars: number | undefined;
        inputToolManualShownCount: number | undefined;
        inputToolFreeFormInputShownCount: number | undefined;
        inputToolFreeFormInputCount: number | undefined;
    }): void;
}
