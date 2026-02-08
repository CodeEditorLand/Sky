var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../../base/common/async.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { getOutput } from "./outputHelpers.js";
import { OutputMonitor } from "./tools/monitoring/outputMonitor.js";
import { OutputMonitorState } from "./tools/monitoring/types.js";
import { Event } from "../../../../../base/common/event.js";
import { isString } from "../../../../../base/common/types.js";
function getTaskDefinition(id) {
  const idx = id.indexOf(": ");
  const taskType = id.substring(0, idx);
  let taskLabel = idx > 0 ? id.substring(idx + 2) : id;
  if (/^\d+$/.test(taskLabel)) {
    taskLabel = id;
  }
  return { taskLabel, taskType };
}
__name(getTaskDefinition, "getTaskDefinition");
function getTaskRepresentation(task) {
  if ("label" in task && task.label) {
    return task.label;
  } else if ("script" in task && task.script) {
    return task.script;
  } else if ("command" in task && task.command) {
    return isString(task.command) ? task.command : task.command.name?.toString() || "";
  }
  return "";
}
__name(getTaskRepresentation, "getTaskRepresentation");
function getTaskKey(task) {
  return task.getKey() ?? task.getMapKey();
}
__name(getTaskKey, "getTaskKey");
function tasksMatch(a, b) {
  if (!a || !b) {
    return false;
  }
  if (getTaskKey(a) === getTaskKey(b)) {
    return true;
  }
  if (a.getCommonTaskId?.() === b.getCommonTaskId?.()) {
    return true;
  }
  return a._id === b._id;
}
__name(tasksMatch, "tasksMatch");
async function getTaskForTool(id, taskDefinition, workspaceFolder, configurationService, taskService, allowParentTask) {
  let index = 0;
  let task;
  const workspaceFolderToTaskMap = await taskService.getWorkspaceTasks();
  let configTasks = [];
  for (const folder of workspaceFolderToTaskMap.keys()) {
    const tasksConfig = configurationService.getValue("tasks", { resource: URI.parse(folder) });
    if (tasksConfig?.tasks) {
      configTasks = configTasks.concat(tasksConfig.tasks);
    }
  }
  for (const configTask of configTasks) {
    if (!allowParentTask && !configTask.type || "hide" in configTask && configTask.hide) {
      continue;
    }
    if ((configTask.type && taskDefinition.taskType ? configTask.type === taskDefinition.taskType : true) && (getTaskRepresentation(configTask) === taskDefinition?.taskLabel || id === configTask.label)) {
      task = configTask;
      break;
    } else if (!configTask.label && id === `${configTask.type}: ${index}`) {
      task = configTask;
      break;
    }
    index++;
  }
  if (!task) {
    return;
  }
  let tasksForWorkspace;
  const workspaceFolderPath = URI.file(workspaceFolder).path;
  for (const [folder, tasks] of workspaceFolderToTaskMap) {
    if (URI.parse(folder).path === workspaceFolderPath) {
      tasksForWorkspace = tasks;
      break;
    }
  }
  if (!tasksForWorkspace) {
    return;
  }
  const configuringTasks = tasksForWorkspace.configurations?.byIdentifier;
  const configuredTask = Object.values(configuringTasks ?? {}).find((t) => {
    return t.type === task.type && (t._label === task.label || t._label === `${task.type}: ${getTaskRepresentation(task)}` || t._label === getTaskRepresentation(task));
  });
  let resolvedTask;
  if (configuredTask) {
    resolvedTask = await taskService.tryResolveTask(configuredTask);
  }
  if (!resolvedTask) {
    const customTasks = tasksForWorkspace.set?.tasks;
    resolvedTask = customTasks?.find((t) => task.label === t._label || task.label === t._label);
  }
  return resolvedTask;
}
__name(getTaskForTool, "getTaskForTool");
async function resolveDependencyTasks(parentTask, workspaceFolder, configurationService, taskService) {
  if (!parentTask.configurationProperties?.dependsOn) {
    return void 0;
  }
  const dependencyTasks = await Promise.all(parentTask.configurationProperties.dependsOn.map(async (dep) => {
    const depId = isString(dep.task) ? dep.task : dep.task?._key;
    if (!depId) {
      return void 0;
    }
    return await getTaskForTool(depId, { taskLabel: depId }, workspaceFolder, configurationService, taskService);
  }));
  return dependencyTasks.filter((t) => t !== void 0);
}
__name(resolveDependencyTasks, "resolveDependencyTasks");
async function collectTerminalResults(terminals, task, instantiationService, invocationContext, progress, token, disposableStore, isActive, dependencyTasks, taskService) {
  const results = [];
  if (token.isCancellationRequested) {
    return results;
  }
  const commonTaskIdToTaskMap = {};
  const taskIdToTaskMap = {};
  const taskLabelToTaskMap = {};
  for (const dependencyTask of dependencyTasks ?? []) {
    commonTaskIdToTaskMap[dependencyTask.getCommonTaskId()] = dependencyTask;
    taskIdToTaskMap[dependencyTask._id] = dependencyTask;
    taskLabelToTaskMap[dependencyTask._label] = dependencyTask;
  }
  const terminalNames = terminals.map((t) => t.shellLaunchConfig.name ?? t.title ?? "unknown");
  progress.report({ message: new MarkdownString(`Checking output for ${terminalNames.map((n) => `\`${n}\``).join(", ")}`) });
  const terminalPromises = terminals.map(async (instance) => {
    let terminalTask = task;
    if (dependencyTasks?.length) {
      const reconnectionData = instance.reconnectionProperties?.data;
      if (reconnectionData) {
        if (reconnectionData.lastTask in commonTaskIdToTaskMap) {
          terminalTask = commonTaskIdToTaskMap[reconnectionData.lastTask];
        } else if (reconnectionData.id in taskIdToTaskMap) {
          terminalTask = taskIdToTaskMap[reconnectionData.id];
        }
      } else {
        if (instance.shellLaunchConfig.name && instance.shellLaunchConfig.name in taskLabelToTaskMap) {
          terminalTask = taskLabelToTaskMap[instance.shellLaunchConfig.name];
        } else if (instance.title in taskLabelToTaskMap) {
          terminalTask = taskLabelToTaskMap[instance.title];
        }
      }
    }
    const execution = {
      getOutput: /* @__PURE__ */ __name(() => getOutput(instance) ?? "", "getOutput"),
      task: terminalTask,
      isActive: isActive ? () => isActive(terminalTask) : void 0,
      instance,
      dependencyTasks,
      sessionId: invocationContext.sessionId
    };
    if (terminalTask.configurationProperties.problemMatchers && terminalTask.configurationProperties.problemMatchers.length > 0 && taskService) {
      const maxWaitTime = 1e3;
      const startTime = Date.now();
      while (!token.isCancellationRequested && Date.now() - startTime < maxWaitTime) {
        const busyTasks = await taskService.getBusyTasks();
        if (busyTasks.some((t) => tasksMatch(t, terminalTask))) {
          break;
        }
        await timeout(100);
      }
    }
    const outputMonitor = disposableStore.add(instantiationService.createInstance(OutputMonitor, execution, taskProblemPollFn, invocationContext, token, task._label));
    await Promise.race([
      Event.toPromise(outputMonitor.onDidFinishCommand),
      Event.toPromise(token.onCancellationRequested)
    ]);
    const pollingResult = outputMonitor.pollingResult;
    return {
      name: instance.shellLaunchConfig.name ?? instance.title ?? "unknown",
      output: pollingResult?.output ?? "",
      pollDurationMs: pollingResult?.pollDurationMs ?? 0,
      resources: pollingResult?.resources,
      state: pollingResult?.state || OutputMonitorState.Idle,
      inputToolManualAcceptCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualAcceptCount ?? 0,
      inputToolManualRejectCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualRejectCount ?? 0,
      inputToolManualChars: outputMonitor.outputMonitorTelemetryCounters.inputToolManualChars ?? 0,
      inputToolAutoAcceptCount: outputMonitor.outputMonitorTelemetryCounters.inputToolAutoAcceptCount ?? 0,
      inputToolAutoChars: outputMonitor.outputMonitorTelemetryCounters.inputToolAutoChars ?? 0,
      inputToolManualShownCount: outputMonitor.outputMonitorTelemetryCounters.inputToolManualShownCount ?? 0,
      inputToolFreeFormInputShownCount: outputMonitor.outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount ?? 0,
      inputToolFreeFormInputCount: outputMonitor.outputMonitorTelemetryCounters.inputToolFreeFormInputCount ?? 0
    };
  });
  const parallelResults = await Promise.all(terminalPromises);
  results.push(...parallelResults);
  return results;
}
__name(collectTerminalResults, "collectTerminalResults");
async function taskProblemPollFn(execution, token, taskService) {
  if (token.isCancellationRequested) {
    return;
  }
  if (execution.task) {
    const data = taskService.getTaskProblems(execution.instance.instanceId);
    if (data) {
      const problemList = [];
      const resultResources = [];
      for (const [owner, { resources, markers }] of data.entries()) {
        for (let i = 0; i < markers.length; i++) {
          const uri = resources[i];
          const marker = markers[i];
          resultResources.push({
            uri,
            range: marker.startLineNumber !== void 0 && marker.startColumn !== void 0 && marker.endLineNumber !== void 0 && marker.endColumn !== void 0 ? new Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn) : void 0
          });
          const message = marker.message ?? "";
          problemList.push(`Problem: ${message} in ${uri.fsPath} coming from ${owner} starting on line ${marker.startLineNumber}${marker.startColumn ? `, column ${marker.startColumn} and ending on line ${marker.endLineNumber}${marker.endColumn ? `, column ${marker.endColumn}` : ""}` : ""}`);
        }
      }
      if (problemList.length === 0) {
        const lastTenLines = execution.getOutput().split("\n").filter((line) => line !== "").slice(-10).join("\n");
        return {
          state: OutputMonitorState.Idle,
          output: `Task completed with output:
${lastTenLines}`
        };
      }
      return {
        state: OutputMonitorState.Idle,
        output: problemList.join("\n"),
        resources: resultResources
      };
    }
  }
  throw new Error("Polling failed");
}
__name(taskProblemPollFn, "taskProblemPollFn");
export {
  collectTerminalResults,
  getTaskDefinition,
  getTaskForTool,
  getTaskKey,
  getTaskRepresentation,
  resolveDependencyTasks,
  taskProblemPollFn,
  tasksMatch
};
//# sourceMappingURL=taskHelpers.js.map
