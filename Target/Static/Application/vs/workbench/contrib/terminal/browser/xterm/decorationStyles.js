var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fromNow, getDurationString } from "../../../../../base/common/date.js";
import { isNumber } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { terminalDecorationError, terminalDecorationIncomplete, terminalDecorationSuccess } from "../terminalIcons.js";
var DecorationStyles;
(function(DecorationStyles2) {
  DecorationStyles2[DecorationStyles2["DefaultDimension"] = 16] = "DefaultDimension";
  DecorationStyles2[DecorationStyles2["MarginLeft"] = -17] = "MarginLeft";
})(DecorationStyles || (DecorationStyles = {}));
var DecorationSelector;
(function(DecorationSelector2) {
  DecorationSelector2["CommandDecoration"] = "terminal-command-decoration";
  DecorationSelector2["Hide"] = "hide";
  DecorationSelector2["ErrorColor"] = "error";
  DecorationSelector2["DefaultColor"] = "default-color";
  DecorationSelector2["Default"] = "default";
  DecorationSelector2["Codicon"] = "codicon";
  DecorationSelector2["XtermDecoration"] = "xterm-decoration";
  DecorationSelector2["OverviewRuler"] = ".xterm-decoration-overview-ruler";
})(DecorationSelector || (DecorationSelector = {}));
function getTerminalDecorationHoverContent(command, hoverMessage, showCommandActions) {
  let hoverContent = showCommandActions ? `${localize("terminalPromptContextMenu", "Show Command Actions")}

---

` : "";
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
    if (isNumber(command.duration)) {
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
        hoverContent += localize("terminalPromptCommandSuccess", "Command executed {0} now");
      }
    }
  }
  return hoverContent;
}
__name(getTerminalDecorationHoverContent, "getTerminalDecorationHoverContent");
var TerminalCommandDecorationStatus;
(function(TerminalCommandDecorationStatus2) {
  TerminalCommandDecorationStatus2["Unknown"] = "unknown";
  TerminalCommandDecorationStatus2["Running"] = "running";
  TerminalCommandDecorationStatus2["Success"] = "success";
  TerminalCommandDecorationStatus2["Error"] = "error";
})(TerminalCommandDecorationStatus || (TerminalCommandDecorationStatus = {}));
const unknownText = localize("terminalCommandDecoration.unknown", "Unknown");
const runningText = localize("terminalCommandDecoration.running", "Running");
function getTerminalCommandDecorationTooltip(command, storedState) {
  if (command) {
    return getTerminalDecorationHoverContent(command);
  }
  if (!storedState) {
    return "";
  }
  const timestamp = storedState.timestamp;
  const exitCode = storedState.exitCode;
  const duration = storedState.duration;
  if (typeof timestamp !== "number" || timestamp === void 0) {
    return "";
  }
  let hoverContent = "";
  const fromNowText = fromNow(timestamp, true);
  if (typeof duration === "number") {
    const durationText = getDurationString(Math.max(duration, 0));
    if (exitCode) {
      if (exitCode === -1) {
        hoverContent += localize("terminalPromptCommandFailed.duration", "Command executed {0}, took {1} and failed", fromNowText, durationText);
      } else {
        hoverContent += localize("terminalPromptCommandFailedWithExitCode.duration", "Command executed {0}, took {1} and failed (Exit Code {2})", fromNowText, durationText, exitCode);
      }
    } else {
      hoverContent += localize("terminalPromptCommandSuccess.duration", "Command executed {0} and took {1}", fromNowText, durationText);
    }
  } else {
    if (exitCode) {
      if (exitCode === -1) {
        hoverContent += localize("terminalPromptCommandFailed", "Command executed {0} and failed", fromNowText);
      } else {
        hoverContent += localize("terminalPromptCommandFailedWithExitCode", "Command executed {0} and failed (Exit Code {1})", fromNowText, exitCode);
      }
    } else {
      hoverContent += localize("terminalPromptCommandSuccess.", "Command executed {0} ", fromNowText);
    }
  }
  return hoverContent;
}
__name(getTerminalCommandDecorationTooltip, "getTerminalCommandDecorationTooltip");
function getTerminalCommandDecorationState(command, storedState, now = Date.now()) {
  let status = "unknown";
  const exitCode = command?.exitCode ?? storedState?.exitCode;
  let exitCodeText = unknownText;
  const startTimestamp = command?.timestamp ?? storedState?.timestamp;
  let startText = unknownText;
  let durationMs;
  let durationText = unknownText;
  if (typeof startTimestamp === "number") {
    startText = new Date(startTimestamp).toLocaleString();
  }
  if (command) {
    if (command.exitCode === void 0) {
      status = "running";
      exitCodeText = runningText;
      durationMs = startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0;
    } else if (command.exitCode !== 0) {
      status = "error";
      exitCodeText = String(command.exitCode);
      durationMs = command.duration ?? (startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0);
    } else {
      status = "success";
      exitCodeText = String(command.exitCode);
      durationMs = command.duration ?? (startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0);
    }
  } else if (storedState) {
    if (storedState.exitCode === void 0) {
      status = "running";
      exitCodeText = runningText;
      durationMs = startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0;
    } else if (storedState.exitCode !== 0) {
      status = "error";
      exitCodeText = String(storedState.exitCode);
      durationMs = storedState.duration;
    } else {
      status = "success";
      exitCodeText = String(storedState.exitCode);
      durationMs = storedState.duration;
    }
  }
  if (typeof durationMs === "number") {
    durationText = getDurationString(Math.max(durationMs, 0));
  }
  const classNames = [];
  let icon = terminalDecorationIncomplete;
  switch (status) {
    case "running":
    case "unknown":
      classNames.push(
        "default-color",
        "default"
        /* DecorationSelector.Default */
      );
      icon = terminalDecorationIncomplete;
      break;
    case "error":
      classNames.push(
        "error"
        /* DecorationSelector.ErrorColor */
      );
      icon = terminalDecorationError;
      break;
    case "success":
      classNames.push("success");
      icon = terminalDecorationSuccess;
      break;
  }
  const hoverMessage = getTerminalCommandDecorationTooltip(command, storedState);
  return {
    status,
    icon,
    classNames,
    exitCode,
    exitCodeText,
    startTimestamp,
    startText,
    duration: durationMs,
    durationText,
    hoverMessage
  };
}
__name(getTerminalCommandDecorationState, "getTerminalCommandDecorationState");
function updateLayout(configurationService, element) {
  if (!element) {
    return;
  }
  const fontSize = configurationService.inspect(
    "terminal.integrated.fontSize"
    /* TerminalSettingId.FontSize */
  ).value;
  const defaultFontSize = configurationService.inspect(
    "terminal.integrated.fontSize"
    /* TerminalSettingId.FontSize */
  ).defaultValue;
  const lineHeight = configurationService.inspect(
    "terminal.integrated.lineHeight"
    /* TerminalSettingId.LineHeight */
  ).value;
  if (isNumber(fontSize) && isNumber(defaultFontSize) && isNumber(lineHeight)) {
    const scalar = fontSize / defaultFontSize <= 1 ? fontSize / defaultFontSize : 1;
    element.style.width = `${scalar * 16}px`;
    element.style.height = `${scalar * 16 * lineHeight}px`;
    element.style.fontSize = `${scalar * 16}px`;
    element.style.marginLeft = `${scalar * -17}px`;
  }
}
__name(updateLayout, "updateLayout");
export {
  DecorationSelector,
  TerminalCommandDecorationStatus,
  getTerminalCommandDecorationState,
  getTerminalCommandDecorationTooltip,
  getTerminalDecorationHoverContent,
  updateLayout
};
//# sourceMappingURL=decorationStyles.js.map
