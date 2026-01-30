var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var TaskErrors;
(function(TaskErrors2) {
  TaskErrors2[TaskErrors2["NotConfigured"] = 0] = "NotConfigured";
  TaskErrors2[TaskErrors2["RunningTask"] = 1] = "RunningTask";
  TaskErrors2[TaskErrors2["NoBuildTask"] = 2] = "NoBuildTask";
  TaskErrors2[TaskErrors2["NoTestTask"] = 3] = "NoTestTask";
  TaskErrors2[TaskErrors2["ConfigValidationError"] = 4] = "ConfigValidationError";
  TaskErrors2[TaskErrors2["TaskNotFound"] = 5] = "TaskNotFound";
  TaskErrors2[TaskErrors2["NoValidTaskRunner"] = 6] = "NoValidTaskRunner";
  TaskErrors2[TaskErrors2["UnknownError"] = 7] = "UnknownError";
})(TaskErrors || (TaskErrors = {}));
class VerifiedTask {
  static {
    __name(this, "VerifiedTask");
  }
  constructor(task, resolver, trigger) {
    this.task = task;
    this.resolver = resolver;
    this.trigger = trigger;
  }
  verify() {
    let verified = false;
    if (this.trigger && this.resolvedVariables && this.workspaceFolder && this.shellLaunchConfig !== void 0) {
      verified = true;
    }
    return verified;
  }
  getVerifiedTask() {
    if (this.verify()) {
      return { task: this.task, resolver: this.resolver, trigger: this.trigger, resolvedVariables: this.resolvedVariables, systemInfo: this.systemInfo, workspaceFolder: this.workspaceFolder, shellLaunchConfig: this.shellLaunchConfig };
    } else {
      throw new Error("VerifiedTask was not checked. verify must be checked before getVerifiedTask.");
    }
  }
}
class TaskError {
  static {
    __name(this, "TaskError");
  }
  constructor(severity, message, code) {
    this.severity = severity;
    this.message = message;
    this.code = code;
  }
}
var Triggers;
(function(Triggers2) {
  Triggers2.shortcut = "shortcut";
  Triggers2.command = "command";
  Triggers2.reconnect = "reconnect";
})(Triggers || (Triggers = {}));
var TaskExecuteKind;
(function(TaskExecuteKind2) {
  TaskExecuteKind2[TaskExecuteKind2["Started"] = 1] = "Started";
  TaskExecuteKind2[TaskExecuteKind2["Active"] = 2] = "Active";
})(TaskExecuteKind || (TaskExecuteKind = {}));
export {
  TaskError,
  TaskErrors,
  TaskExecuteKind,
  Triggers,
  VerifiedTask
};
//# sourceMappingURL=taskSystem.js.map
