var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ShellIntegrationOscPs;
(function(ShellIntegrationOscPs2) {
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["FinalTerm"] = 133] = "FinalTerm";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["VSCode"] = 633] = "VSCode";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["ITerm"] = 1337] = "ITerm";
})(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
var VSCodeOscPt;
(function(VSCodeOscPt2) {
  VSCodeOscPt2["PromptStart"] = "A";
  VSCodeOscPt2["CommandStart"] = "B";
  VSCodeOscPt2["CommandExecuted"] = "C";
  VSCodeOscPt2["CommandFinished"] = "D";
  VSCodeOscPt2["CommandLine"] = "E";
  VSCodeOscPt2["ContinuationStart"] = "F";
  VSCodeOscPt2["ContinuationEnd"] = "G";
  VSCodeOscPt2["RightPromptStart"] = "H";
  VSCodeOscPt2["RightPromptEnd"] = "I";
  VSCodeOscPt2["Property"] = "P";
})(VSCodeOscPt || (VSCodeOscPt = {}));
var VSCodeOscProperty;
(function(VSCodeOscProperty2) {
  VSCodeOscProperty2["Task"] = "Task";
  VSCodeOscProperty2["Cwd"] = "Cwd";
})(VSCodeOscProperty || (VSCodeOscProperty = {}));
var ITermOscPt;
(function(ITermOscPt2) {
  ITermOscPt2["SetMark"] = "SetMark";
})(ITermOscPt || (ITermOscPt = {}));
function VSCodeSequence(osc, data) {
  return oscSequence(633, osc, data);
}
__name(VSCodeSequence, "VSCodeSequence");
function ITermSequence(osc, data) {
  return oscSequence(1337, osc, data);
}
__name(ITermSequence, "ITermSequence");
function oscSequence(ps, pt, data) {
  let result = `\x1B]${ps};${pt}`;
  if (data) {
    result += `;${data}`;
  }
  result += `\x07`;
  return result;
}
__name(oscSequence, "oscSequence");
export {
  ITermOscPt,
  ITermSequence,
  VSCodeOscProperty,
  VSCodeOscPt,
  VSCodeSequence
};
//# sourceMappingURL=terminalEscapeSequences.js.map
