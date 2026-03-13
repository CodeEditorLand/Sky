import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalInlineChatAccessibleView } from "./terminalChatAccessibleView.js";
import { TerminalChatController } from "./terminalChatController.js";
registerTerminalContribution(TerminalChatController.ID, TerminalChatController, false);
AccessibleViewRegistry.register(new TerminalInlineChatAccessibleView());
AccessibleViewRegistry.register(new TerminalChatAccessibilityHelp());
registerWorkbenchContribution2(
  TerminalChatEnabler.Id,
  TerminalChatEnabler,
  3
  /* WorkbenchPhase.AfterRestored */
);
import "./terminalChatActions.js";
import { AccessibleViewRegistry } from "../../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { TerminalChatAccessibilityHelp } from "./terminalChatAccessibilityHelp.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { TerminalChatEnabler } from "./terminalChatEnabler.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { ITerminalChatService } from "../../../terminal/browser/terminal.js";
import { TerminalChatService } from "./terminalChatService.js";
registerSingleton(
  ITerminalChatService,
  TerminalChatService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=terminal.chat.contribution.js.map
