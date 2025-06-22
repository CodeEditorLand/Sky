var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { accessibleViewIsShown, accessibleViewCurrentProviderId } from "../../../accessibility/browser/accessibilityConfiguration.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var ClassName;
(function(ClassName2) {
  ClassName2["Active"] = "active";
  ClassName2["EditorTextArea"] = "textarea";
})(ClassName || (ClassName = {}));
let TerminalAccessibilityHelpProvider = class TerminalAccessibilityHelpProvider2 extends Disposable {
  static {
    __name(this, "TerminalAccessibilityHelpProvider");
  }
  onClose() {
    const expr = ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(
      accessibleViewCurrentProviderId.key,
      "terminal-help"
      /* AccessibleViewProviderId.TerminalHelp */
    ));
    if (expr?.evaluate(this._contextKeyService.getContext(null))) {
      this._commandService.executeCommand(
        "workbench.action.terminal.focusAccessibleBuffer"
        /* TerminalAccessibilityCommandId.FocusAccessibleBuffer */
      );
    } else {
      this._instance.focus();
    }
    this.dispose();
  }
  constructor(_instance, _xterm, _commandService, _configurationService, _contextKeyService) {
    super();
    this._instance = _instance;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this.id = "terminal-help";
    this._hasShellIntegration = false;
    this.options = {
      type: "help",
      readMoreUrl: "https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility"
    };
    this.verbositySettingKey = "accessibility.verbosity.terminal";
    this._hasShellIntegration = _xterm.shellIntegration.status === 2;
  }
  provideContent() {
    const content = [
      localize(
        "focusAccessibleTerminalView",
        "The Focus Accessible Terminal View command<keybinding:{0}> enables screen readers to read terminal contents.",
        "workbench.action.terminal.focusAccessibleBuffer"
        /* TerminalAccessibilityCommandId.FocusAccessibleBuffer */
      ),
      localize("preserveCursor", "Customize the behavior of the cursor when toggling between the terminal and accessible view with `terminal.integrated.accessibleViewPreserveCursorPosition.`"),
      localize(
        "openDetectedLink",
        "The Open Detected Link command<keybinding:{0}> enables screen readers to easily open links found in the terminal.",
        "workbench.action.terminal.openDetectedLink"
        /* TerminalLinksCommandId.OpenDetectedLink */
      ),
      localize(
        "newWithProfile",
        "The Create New Terminal (With Profile) command<keybinding:{0}> allows for easy terminal creation using a specific profile.",
        "workbench.action.terminal.newWithProfile"
        /* TerminalCommandId.NewWithProfile */
      ),
      localize(
        "focusAfterRun",
        "Configure what gets focused after running selected text in the terminal with `{0}`.",
        "terminal.integrated.focusAfterRun"
        /* TerminalSettingId.FocusAfterRun */
      )
    ];
    if (!this._configurationService.getValue(
      "terminal.integrated.accessibleViewFocusOnCommandExecution"
      /* TerminalAccessibilitySettingId.AccessibleViewFocusOnCommandExecution */
    )) {
      content.push(localize("focusViewOnExecution", "Enable `terminal.integrated.accessibleViewFocusOnCommandExecution` to automatically focus the terminal accessible view when a command is executed in the terminal."));
    }
    if (this._configurationService.getValue(
      "terminal.integrated.suggest.enabled"
      /* TerminalSuggestSettingId.Enabled */
    )) {
      content.push(localize(
        "suggestTrigger",
        "The terminal request completions command can be invoked manually<keybinding:{0}>, but also appears while typing.",
        "workbench.action.terminal.requestCompletions"
        /* TerminalSuggestCommandId.RequestCompletions */
      ));
      content.push(localize(
        "suggestCommands",
        "When the terminal suggest widget is focused, accept the suggestion<keybinding:{0}> and configure suggest settings<keybinding:{1}>.",
        "workbench.action.terminal.acceptSelectedSuggestion",
        "workbench.action.terminal.configureSuggestSettings"
        /* TerminalSuggestCommandId.ConfigureSettings */
      ));
      content.push(localize(
        "suggestCommandsMore",
        "Also, when the suggest widget is focused, toggle between the widget and terminal<keybinding:{0}> and toggle details focus<keybinding:{1}> to learn more about the suggestion.",
        "workbench.action.terminal.suggestToggleDetails",
        "workbench.action.terminal.suggestToggleDetailsFocus"
        /* TerminalSuggestCommandId.ToggleDetailsFocus */
      ));
    }
    if (this._instance.shellType === "cmd") {
      content.push(localize("commandPromptMigration", "Consider using powershell instead of command prompt for an improved experience"));
    }
    if (this._hasShellIntegration) {
      content.push(localize("shellIntegration", "The terminal has a feature called shell integration that offers an enhanced experience and provides useful commands for screen readers such as:"));
      content.push("- " + localize(
        "goToNextCommand",
        "Go to Next Command<keybinding:{0}> in the accessible view",
        "workbench.action.terminal.accessibleBufferGoToNextCommand"
        /* TerminalAccessibilityCommandId.AccessibleBufferGoToNextCommand */
      ));
      content.push("- " + localize(
        "goToPreviousCommand",
        "Go to Previous Command<keybinding:{0}> in the accessible view",
        "workbench.action.terminal.accessibleBufferGoToPreviousCommand"
        /* TerminalAccessibilityCommandId.AccessibleBufferGoToPreviousCommand */
      ));
      content.push("- " + localize(
        "goToSymbol",
        "Go to Symbol<keybinding:{0}>",
        "editor.action.accessibleViewGoToSymbol"
        /* AccessibilityCommandId.GoToSymbol */
      ));
      content.push("- " + localize(
        "runRecentCommand",
        "Run Recent Command<keybinding:{0}>",
        "workbench.action.terminal.runRecentCommand"
        /* TerminalHistoryCommandId.RunRecentCommand */
      ));
      content.push("- " + localize(
        "goToRecentDirectory",
        "Go to Recent Directory<keybinding:{0}>",
        "workbench.action.terminal.goToRecentDirectory"
        /* TerminalHistoryCommandId.GoToRecentDirectory */
      ));
    } else {
      content.push(localize("noShellIntegration", "Shell integration is not enabled. Some accessibility features may not be available."));
    }
    return content.join("\n");
  }
};
TerminalAccessibilityHelpProvider = __decorate([
  __param(2, ICommandService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService)
], TerminalAccessibilityHelpProvider);
export {
  ClassName,
  TerminalAccessibilityHelpProvider
};
//# sourceMappingURL=terminalAccessibilityHelp.js.map
