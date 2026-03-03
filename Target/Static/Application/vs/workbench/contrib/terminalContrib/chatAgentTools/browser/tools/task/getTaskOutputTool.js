var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../../../platform/telemetry/common/telemetry.js";
import { ToolDataSource } from "../../../../../chat/common/tools/languageModelToolsService.js";
import { ITaskService, TasksAvailableContext } from "../../../../../tasks/common/taskService.js";
import { ITerminalService } from "../../../../../terminal/browser/terminal.js";
import { collectTerminalResults, getTaskDefinition, getTaskForTool, resolveDependencyTasks, tasksMatch } from "../../taskHelpers.js";
import { toolResultDetailsFromResponse, toolResultMessageFromResponse } from "./taskHelpers.js";
const GetTaskOutputToolData = {
  id: "get_task_output",
  toolReferenceName: "getTaskOutput",
  legacyToolReferenceFullNames: ["runTasks/getTaskOutput"],
  displayName: localize("getTaskOutputTool.displayName", "Get Task Output"),
  modelDescription: "Get the output of a task",
  source: ToolDataSource.Internal,
  when: TasksAvailableContext,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The task ID for which to get the output."
      },
      workspaceFolder: {
        type: "string",
        description: "The workspace folder path containing the task"
      }
    },
    required: [
      "id",
      "workspaceFolder"
    ]
  }
};
let GetTaskOutputTool = class GetTaskOutputTool2 extends Disposable {
  static {
    __name(this, "GetTaskOutputTool");
  }
  constructor(_tasksService, _terminalService, _configurationService, _instantiationService, _telemetryService) {
    super();
    this._tasksService = _tasksService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
  }
  async prepareToolInvocation(context, token) {
    const args = context.parameters;
    const taskDefinition = getTaskDefinition(args.id);
    const task = await getTaskForTool(args.id, taskDefinition, args.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { invocationMessage: new MarkdownString(localize("copilotChat.taskNotFound", "Task not found: `{0}`", args.id)) };
    }
    const taskLabel = task._label;
    const activeTasks = await this._tasksService.getActiveTasks();
    if (activeTasks.includes(task)) {
      return { invocationMessage: new MarkdownString(localize("copilotChat.taskAlreadyRunning", "The task `{0}` is already running.", taskLabel)) };
    }
    return {
      invocationMessage: new MarkdownString(localize("copilotChat.checkingTerminalOutput", "Checking output for task `{0}`", taskLabel)),
      pastTenseMessage: new MarkdownString(localize("copilotChat.checkedTerminalOutput", "Checked output for task `{0}`", taskLabel))
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args = invocation.parameters;
    const taskDefinition = getTaskDefinition(args.id);
    const task = await getTaskForTool(args.id, taskDefinition, args.workspaceFolder, this._configurationService, this._tasksService, true);
    if (!task) {
      return { content: [{ kind: "text", value: `Task not found: ${args.id}` }], toolResultMessage: new MarkdownString(localize("copilotChat.taskNotFound", "Task not found: `{0}`", args.id)) };
    }
    const dependencyTasks = await resolveDependencyTasks(task, args.workspaceFolder, this._configurationService, this._tasksService);
    const resources = this._tasksService.getTerminalsForTasks(dependencyTasks ?? task);
    const taskLabel = task._label;
    const terminals = resources?.map((resource) => this._terminalService.instances.find((t) => t.resource.path === resource?.path && t.resource.scheme === resource.scheme)).filter((t) => !!t);
    if (!terminals || terminals.length === 0) {
      return { content: [{ kind: "text", value: `Terminal not found for task ${taskLabel}` }], toolResultMessage: new MarkdownString(localize("copilotChat.terminalNotFound", "Terminal not found for task `{0}`", taskLabel)) };
    }
    const store = new DisposableStore();
    const terminalResults = await collectTerminalResults(terminals, task, this._instantiationService, invocation.context, _progress, token, store, (terminalTask) => this._isTaskActive(terminalTask), dependencyTasks, this._tasksService);
    store.dispose();
    for (const r of terminalResults) {
      this._telemetryService.publicLog2?.("copilotChat.getTaskOutputTool.get", {
        taskId: args.id,
        bufferLength: r.output.length ?? 0,
        pollDurationMs: r.pollDurationMs ?? 0,
        inputToolManualAcceptCount: r.inputToolManualAcceptCount ?? 0,
        inputToolManualRejectCount: r.inputToolManualRejectCount ?? 0,
        inputToolManualChars: r.inputToolManualChars ?? 0,
        inputToolManualShownCount: r.inputToolManualShownCount ?? 0,
        inputToolFreeFormInputCount: r.inputToolFreeFormInputCount ?? 0,
        inputToolFreeFormInputShownCount: r.inputToolFreeFormInputShownCount ?? 0
      });
    }
    const details = terminalResults.map((r) => `Terminal: ${r.name}
Output:
${r.output}`);
    const uniqueDetails = Array.from(new Set(details)).join("\n\n");
    const toolResultDetails = toolResultDetailsFromResponse(terminalResults);
    const toolResultMessage = toolResultMessageFromResponse(void 0, taskLabel, toolResultDetails, terminalResults, true, task.configurationProperties.isBackground);
    return {
      content: [{ kind: "text", value: uniqueDetails }],
      toolResultMessage,
      toolResultDetails
    };
  }
  async _isTaskActive(task) {
    const busyTasks = await this._tasksService.getBusyTasks();
    return busyTasks?.some((t) => tasksMatch(t, task)) ?? false;
  }
};
GetTaskOutputTool = __decorate([
  __param(0, ITaskService),
  __param(1, ITerminalService),
  __param(2, IConfigurationService),
  __param(3, IInstantiationService),
  __param(4, ITelemetryService)
], GetTaskOutputTool);
export {
  GetTaskOutputTool,
  GetTaskOutputToolData
};
//# sourceMappingURL=getTaskOutputTool.js.map
