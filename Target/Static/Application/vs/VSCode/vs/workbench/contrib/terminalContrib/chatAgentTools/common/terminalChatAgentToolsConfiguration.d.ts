import type { IStringDictionary } from '../../../../../base/common/collections.js';
import { type IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalChatAgentToolsSettingId {
    EnableAutoApprove = "chat.tools.terminal.enableAutoApprove",
    AutoApprove = "chat.tools.terminal.autoApprove",
    AutoApproveWorkspaceNpmScripts = "chat.tools.terminal.autoApproveWorkspaceNpmScripts",
    IgnoreDefaultAutoApproveRules = "chat.tools.terminal.ignoreDefaultAutoApproveRules",
    BlockDetectedFileWrites = "chat.tools.terminal.blockDetectedFileWrites",
    ShellIntegrationTimeout = "chat.tools.terminal.shellIntegrationTimeout",
    AutoReplyToPrompts = "chat.tools.terminal.autoReplyToPrompts",
    OutputLocation = "chat.tools.terminal.outputLocation",
    TerminalSandboxEnabled = "chat.tools.terminal.sandbox.enabled",
    TerminalSandboxNetwork = "chat.tools.terminal.sandbox.network",
    TerminalSandboxLinuxFileSystem = "chat.tools.terminal.sandbox.linuxFileSystem",
    TerminalSandboxMacFileSystem = "chat.tools.terminal.sandbox.macFileSystem",
    PreventShellHistory = "chat.tools.terminal.preventShellHistory",
    EnforceTimeoutFromModel = "chat.tools.terminal.enforceTimeoutFromModel",
    TerminalProfileLinux = "chat.tools.terminal.terminalProfile.linux",
    TerminalProfileMacOs = "chat.tools.terminal.terminalProfile.osx",
    TerminalProfileWindows = "chat.tools.terminal.terminalProfile.windows",
    DeprecatedAutoApproveCompatible = "chat.agent.terminal.autoApprove",
    DeprecatedAutoApprove1 = "chat.agent.terminal.allowList",
    DeprecatedAutoApprove2 = "chat.agent.terminal.denyList",
    DeprecatedAutoApprove3 = "github.copilot.chat.agent.terminal.allowList",
    DeprecatedAutoApprove4 = "github.copilot.chat.agent.terminal.denyList"
}
export interface ITerminalChatAgentToolsConfiguration {
    autoApprove: {
        [key: string]: boolean;
    };
    commandReportingAllowList: {
        [key: string]: boolean;
    };
    shellIntegrationTimeout: number;
}
export declare const terminalChatAgentToolsConfiguration: IStringDictionary<IConfigurationPropertySchema>;
