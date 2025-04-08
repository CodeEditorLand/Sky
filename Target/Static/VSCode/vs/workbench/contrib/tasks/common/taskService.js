import * as nls from "../../../../nls.js";
import { Action } from "../../../../base/common/actions.js";
import { Event } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IWorkspaceFolder, IWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { Task, ContributedTask, CustomTask, ITaskSet, TaskSorter, ITaskEvent, ITaskIdentifier, ConfiguringTask, TaskRunSource } from "./tasks.js";
import { ITaskSummary, ITaskTerminateResponse, ITaskSystemInfo } from "./taskSystem.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { RawContextKey, ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
const CustomExecutionSupportedContext = new RawContextKey("customExecutionSupported", false, nls.localize("tasks.customExecutionSupported", "Whether CustomExecution tasks are supported. Consider using in the when clause of a 'taskDefinition' contribution."));
const ShellExecutionSupportedContext = new RawContextKey("shellExecutionSupported", false, nls.localize("tasks.shellExecutionSupported", "Whether ShellExecution tasks are supported. Consider using in the when clause of a 'taskDefinition' contribution."));
const TaskCommandsRegistered = new RawContextKey("taskCommandsRegistered", false, nls.localize("tasks.taskCommandsRegistered", "Whether the task commands have been registered yet"));
const ProcessExecutionSupportedContext = new RawContextKey("processExecutionSupported", false, nls.localize("tasks.processExecutionSupported", "Whether ProcessExecution tasks are supported. Consider using in the when clause of a 'taskDefinition' contribution."));
const ServerlessWebContext = new RawContextKey("serverlessWebContext", false, nls.localize("tasks.serverlessWebContext", "True when in the web with no remote authority."));
const TaskExecutionSupportedContext = ContextKeyExpr.or(ContextKeyExpr.and(ShellExecutionSupportedContext, ProcessExecutionSupportedContext), CustomExecutionSupportedContext);
const ITaskService = createDecorator("taskService");
export {
  CustomExecutionSupportedContext,
  ITaskService,
  ProcessExecutionSupportedContext,
  ServerlessWebContext,
  ShellExecutionSupportedContext,
  TaskCommandsRegistered,
  TaskExecutionSupportedContext
};
//# sourceMappingURL=taskService.js.map
