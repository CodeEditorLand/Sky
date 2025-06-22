var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../base/common/buffer.js";
import { localize } from "../../../../nls.js";
import { FileOperationError, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { TreeItemCollapsibleState } from "../../../common/views.js";
import { IUserDataProfileService } from "../common/userDataProfile.js";
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
let TasksResourceInitializer = class TasksResourceInitializer2 {
  static {
    __name(this, "TasksResourceInitializer");
  }
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  async initialize(content) {
    const tasksContent = JSON.parse(content);
    if (!tasksContent.tasks) {
      this.logService.info(`Initializing Profile: No tasks to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.tasksResource, VSBuffer.fromString(tasksContent.tasks));
  }
};
TasksResourceInitializer = __decorate([
  __param(0, IUserDataProfileService),
  __param(1, IFileService),
  __param(2, ILogService)
], TasksResourceInitializer);
let TasksResource = class TasksResource2 {
  static {
    __name(this, "TasksResource");
  }
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  async getContent(profile) {
    const tasksContent = await this.getTasksResourceContent(profile);
    return JSON.stringify(tasksContent);
  }
  async getTasksResourceContent(profile) {
    const tasksContent = await this.getTasksContent(profile);
    return { tasks: tasksContent };
  }
  async apply(content, profile) {
    const tasksContent = JSON.parse(content);
    if (!tasksContent.tasks) {
      this.logService.info(`Importing Profile (${profile.name}): No tasks to apply...`);
      return;
    }
    await this.fileService.writeFile(profile.tasksResource, VSBuffer.fromString(tasksContent.tasks));
  }
  async getTasksContent(profile) {
    try {
      const content = await this.fileService.readFile(profile.tasksResource);
      return content.value.toString();
    } catch (error) {
      if (error instanceof FileOperationError && error.fileOperationResult === 1) {
        return null;
      } else {
        throw error;
      }
    }
  }
};
TasksResource = __decorate([
  __param(0, IFileService),
  __param(1, ILogService)
], TasksResource);
let TasksResourceTreeItem = class TasksResourceTreeItem2 {
  static {
    __name(this, "TasksResourceTreeItem");
  }
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.type = "tasks";
    this.handle = "tasks";
    this.label = { label: localize("tasks", "Tasks") };
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
  async getChildren() {
    return [{
      handle: this.profile.tasksResource.toString(),
      resourceUri: this.profile.tasksResource,
      collapsibleState: TreeItemCollapsibleState.None,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.tasksResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const tasksContent = await this.instantiationService.createInstance(TasksResource).getTasksResourceContent(this.profile);
    return tasksContent.tasks !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(TasksResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.tasks;
  }
};
TasksResourceTreeItem = __decorate([
  __param(1, IUriIdentityService),
  __param(2, IInstantiationService)
], TasksResourceTreeItem);
export {
  TasksResource,
  TasksResourceInitializer,
  TasksResourceTreeItem
};
//# sourceMappingURL=tasksResource.js.map
