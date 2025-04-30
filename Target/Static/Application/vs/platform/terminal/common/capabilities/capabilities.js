var TerminalCapability;
(function(TerminalCapability2) {
  TerminalCapability2[TerminalCapability2["CwdDetection"] = 0] = "CwdDetection";
  TerminalCapability2[TerminalCapability2["NaiveCwdDetection"] = 1] = "NaiveCwdDetection";
  TerminalCapability2[TerminalCapability2["CommandDetection"] = 2] = "CommandDetection";
  TerminalCapability2[TerminalCapability2["PartialCommandDetection"] = 3] = "PartialCommandDetection";
  TerminalCapability2[TerminalCapability2["BufferMarkDetection"] = 4] = "BufferMarkDetection";
  TerminalCapability2[TerminalCapability2["ShellEnvDetection"] = 5] = "ShellEnvDetection";
})(TerminalCapability || (TerminalCapability = {}));
var CommandInvalidationReason;
(function(CommandInvalidationReason2) {
  CommandInvalidationReason2["Windows"] = "windows";
  CommandInvalidationReason2["NoProblemsReported"] = "noProblemsReported";
})(CommandInvalidationReason || (CommandInvalidationReason = {}));
export {
  CommandInvalidationReason,
  TerminalCapability
};
//# sourceMappingURL=capabilities.js.map
