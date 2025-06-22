var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const ILifecycleService = createDecorator("lifecycleService");
var WillShutdownJoinerOrder;
(function(WillShutdownJoinerOrder2) {
  WillShutdownJoinerOrder2[WillShutdownJoinerOrder2["Default"] = 1] = "Default";
  WillShutdownJoinerOrder2[WillShutdownJoinerOrder2["Last"] = 2] = "Last";
})(WillShutdownJoinerOrder || (WillShutdownJoinerOrder = {}));
var ShutdownReason;
(function(ShutdownReason2) {
  ShutdownReason2[ShutdownReason2["CLOSE"] = 1] = "CLOSE";
  ShutdownReason2[ShutdownReason2["QUIT"] = 2] = "QUIT";
  ShutdownReason2[ShutdownReason2["RELOAD"] = 3] = "RELOAD";
  ShutdownReason2[ShutdownReason2["LOAD"] = 4] = "LOAD";
})(ShutdownReason || (ShutdownReason = {}));
var StartupKind;
(function(StartupKind2) {
  StartupKind2[StartupKind2["NewWindow"] = 1] = "NewWindow";
  StartupKind2[StartupKind2["ReloadedWindow"] = 3] = "ReloadedWindow";
  StartupKind2[StartupKind2["ReopenedWindow"] = 4] = "ReopenedWindow";
})(StartupKind || (StartupKind = {}));
function StartupKindToString(startupKind) {
  switch (startupKind) {
    case 1:
      return "NewWindow";
    case 3:
      return "ReloadedWindow";
    case 4:
      return "ReopenedWindow";
  }
}
__name(StartupKindToString, "StartupKindToString");
var LifecyclePhase;
(function(LifecyclePhase2) {
  LifecyclePhase2[LifecyclePhase2["Starting"] = 1] = "Starting";
  LifecyclePhase2[LifecyclePhase2["Ready"] = 2] = "Ready";
  LifecyclePhase2[LifecyclePhase2["Restored"] = 3] = "Restored";
  LifecyclePhase2[LifecyclePhase2["Eventually"] = 4] = "Eventually";
})(LifecyclePhase || (LifecyclePhase = {}));
function LifecyclePhaseToString(phase) {
  switch (phase) {
    case 1:
      return "Starting";
    case 2:
      return "Ready";
    case 3:
      return "Restored";
    case 4:
      return "Eventually";
  }
}
__name(LifecyclePhaseToString, "LifecyclePhaseToString");
export {
  ILifecycleService,
  LifecyclePhase,
  LifecyclePhaseToString,
  ShutdownReason,
  StartupKind,
  StartupKindToString,
  WillShutdownJoinerOrder
};
//# sourceMappingURL=lifecycle.js.map
