import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
Registry.as(Extensions.Configuration).registerDefaultConfigurations([{
  overrides: {
    "chat.experimentalSessionsWindowOverride": true,
    "chat.hookFilesLocations": {
      ".claude/settings.local.json": false,
      ".claude/settings.json": false,
      "~/.claude/settings.json": false
    },
    "chat.agent.maxRequests": 1e3,
    "chat.customizationsMenu.userStoragePath": "~/.copilot",
    "chat.viewSessions.enabled": false,
    "chat.implicitContext.suggestedContext": false,
    "chat.implicitContext.enabled": { "panel": "never" },
    "chat.tools.terminal.enableAutoApprove": true,
    "github.copilot.chat.githubMcpServer.enabled": true,
    "breadcrumbs.enabled": false,
    "diffEditor.hideUnchangedRegions.enabled": true,
    "extensions.ignoreRecommendations": true,
    "files.autoSave": "afterDelay",
    "git.autofetch": true,
    "git.branchRandomName.enable": true,
    "git.detectWorktrees": false,
    "git.showProgress": false,
    "github.copilot.enable": {
      "markdown": true,
      "plaintext": true
    },
    "github.copilot.chat.claudeCode.enabled": true,
    "github.copilot.chat.cli.branchSupport.enabled": true,
    "github.copilot.chat.languageContext.typescript.enabled": true,
    "github.copilot.chat.cli.mcp.enabled": true,
    "inlineChat.affordance": "editor",
    "inlineChat.renderMode": "hover",
    "terminal.integrated.initialHint": false,
    "workbench.editor.doubleClickTabToToggleEditorGroupSizes": "maximize",
    "workbench.editor.restoreEditors": false,
    "workbench.startupEditor": "none",
    "workbench.tips.enabled": false,
    "workbench.layoutControl.type": "toggles",
    "workbench.editor.useModal": "all",
    "workbench.panel.showLabels": false,
    "workbench.colorTheme": "Experimental Dark",
    "search.quickOpen.includeHistory": false,
    "window.menuStyle": "custom",
    "window.dialogStyle": "custom"
  },
  donotCache: true,
  preventExperimentOverride: true,
  source: "sessionsDefaults"
}]);
//# sourceMappingURL=configuration.contribution.js.map
