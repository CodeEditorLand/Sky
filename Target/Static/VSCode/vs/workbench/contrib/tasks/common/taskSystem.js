var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import Severity from "../../../../base/common/severity.js";
import { TerminateResponse } from "../../../../base/common/processes.js";
import { Event } from "../../../../base/common/event.js";
import { Platform } from "../../../../base/common/platform.js";
import { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { Task, ITaskEvent, KeyedTaskIdentifier } from "./tasks.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
var TaskErrors = /* @__PURE__ */ ((TaskErrors2) => {
  TaskErrors2[TaskErrors2["NotConfigured"] = 0] = "NotConfigured";
  TaskErrors2[TaskErrors2["RunningTask"] = 1] = "RunningTask";
  TaskErrors2[TaskErrors2["NoBuildTask"] = 2] = "NoBuildTask";
  TaskErrors2[TaskErrors2["NoTestTask"] = 3] = "NoTestTask";
  TaskErrors2[TaskErrors2["ConfigValidationError"] = 4] = "ConfigValidationError";
  TaskErrors2[TaskErrors2["TaskNotFound"] = 5] = "TaskNotFound";
  TaskErrors2[TaskErrors2["NoValidTaskRunner"] = 6] = "NoValidTaskRunner";
  TaskErrors2[TaskErrors2["UnknownError"] = 7] = "UnknownError";
  return TaskErrors2;
})(TaskErrors || {});
class TaskError {
  static {
    __name(this, "TaskError");
  }
  severity;
  message;
  code;
  constructor(severity, message, code) {
    this.severity = severity;
    this.message = message;
    this.code = code;
  }
}
var Triggers;
((Triggers2) => {
  Triggers2.shortcut = "shortcut";
  Triggers2.command = "command";
  Triggers2.reconnect = "reconnect";
})(Triggers || (Triggers = {}));
var TaskExecuteKind = /* @__PURE__ */ ((TaskExecuteKind2) => {
  TaskExecuteKind2[TaskExecuteKind2["Started"] = 1] = "Started";
  TaskExecuteKind2[TaskExecuteKind2["Active"] = 2] = "Active";
  return TaskExecuteKind2;
})(TaskExecuteKind || {});
export {
  TaskError,
  TaskErrors,
  TaskExecuteKind,
  Triggers
};
//# sourceMappingURL=taskSystem.js.map
