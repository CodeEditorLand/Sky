var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fromNow, getDurationString } from "../../../../../base/common/date.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ITerminalCommand } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
var DecorationStyles = /* @__PURE__ */ ((DecorationStyles2) => {
  DecorationStyles2[DecorationStyles2["DefaultDimension"] = 16] = "DefaultDimension";
  DecorationStyles2[DecorationStyles2["MarginLeft"] = -17] = "MarginLeft";
  return DecorationStyles2;
})(DecorationStyles || {});
var DecorationSelector = /* @__PURE__ */ ((DecorationSelector2) => {
  DecorationSelector2["CommandDecoration"] = "terminal-command-decoration";
  DecorationSelector2["Hide"] = "hide";
  DecorationSelector2["ErrorColor"] = "error";
  DecorationSelector2["DefaultColor"] = "default-color";
  DecorationSelector2["Default"] = "default";
  DecorationSelector2["Codicon"] = "codicon";
  DecorationSelector2["XtermDecoration"] = "xterm-decoration";
  DecorationSelector2["OverviewRuler"] = ".xterm-decoration-overview-ruler";
  return DecorationSelector2;
})(DecorationSelector || {});
function getTerminalDecorationHoverContent(command, hoverMessage) {
  let hoverContent = `${localize("terminalPromptContextMenu", "Show Command Actions")}`;
  hoverContent += "\n\n---\n\n";
  if (!command) {
    if (hoverMessage) {
      hoverContent = hoverMessage;
    } else {
      return "";
    }
  } else if (command.markProperties || hoverMessage) {
    if (command.markProperties?.hoverMessage || hoverMessage) {
      hoverContent = command.markProperties?.hoverMessage || hoverMessage || "";
    } else {
      return "";
    }
  } else {
    if (command.duration) {
      const durationText = getDurationString(command.duration);
      if (command.exitCode) {
        if (command.exitCode === -1) {
          hoverContent += localize("terminalPromptCommandFailed.duration", "Command executed {0}, took {1} and failed", fromNow(command.timestamp, true), durationText);
        } else {
          hoverContent += localize("terminalPromptCommandFailedWithExitCode.duration", "Command executed {0}, took {1} and failed (Exit Code {2})", fromNow(command.timestamp, true), durationText, command.exitCode);
        }
      } else {
        hoverContent += localize("terminalPromptCommandSuccess.duration", "Command executed {0} and took {1}", fromNow(command.timestamp, true), durationText);
      }
    } else {
      if (command.exitCode) {
        if (command.exitCode === -1) {
          hoverContent += localize("terminalPromptCommandFailed", "Command executed {0} and failed", fromNow(command.timestamp, true));
        } else {
          hoverContent += localize("terminalPromptCommandFailedWithExitCode", "Command executed {0} and failed (Exit Code {1})", fromNow(command.timestamp, true), command.exitCode);
        }
      } else {
        hoverContent += localize("terminalPromptCommandSuccess", "Command executed {0}", fromNow(command.timestamp, true));
      }
    }
  }
  return hoverContent;
}
__name(getTerminalDecorationHoverContent, "getTerminalDecorationHoverContent");
function updateLayout(configurationService, element) {
  if (!element) {
    return;
  }
  const fontSize = configurationService.inspect(TerminalSettingId.FontSize).value;
  const defaultFontSize = configurationService.inspect(TerminalSettingId.FontSize).defaultValue;
  const lineHeight = configurationService.inspect(TerminalSettingId.LineHeight).value;
  if (typeof fontSize === "number" && typeof defaultFontSize === "number" && typeof lineHeight === "number") {
    const scalar = fontSize / defaultFontSize <= 1 ? fontSize / defaultFontSize : 1;
    element.style.width = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.height = `${scalar * 16 /* DefaultDimension */ * lineHeight}px`;
    element.style.fontSize = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.marginLeft = `${scalar * -17 /* MarginLeft */}px`;
  }
}
__name(updateLayout, "updateLayout");
export {
  DecorationSelector,
  getTerminalDecorationHoverContent,
  updateLayout
};
//# sourceMappingURL=decorationStyles.js.map
