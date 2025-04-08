var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { VSBuffer } from "../../../../base/common/buffer.js";
import { FileOperationError, FileOperationResult, IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "../common/userDataProfile.js";
import { platform, Platform } from "../../../../base/common/platform.js";
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from "../../../common/views.js";
import { IUserDataProfile, ProfileResourceType } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { localize } from "../../../../nls.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
let KeybindingsResourceInitializer = class {
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  static {
    __name(this, "KeybindingsResourceInitializer");
  }
  async initialize(content) {
    const keybindingsContent = JSON.parse(content);
    if (keybindingsContent.keybindings === null) {
      this.logService.info(`Initializing Profile: No keybindings to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
  }
};
KeybindingsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], KeybindingsResourceInitializer);
let KeybindingsResource = class {
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  static {
    __name(this, "KeybindingsResource");
  }
  async getContent(profile) {
    const keybindingsContent = await this.getKeybindingsResourceContent(profile);
    return JSON.stringify(keybindingsContent);
  }
  async getKeybindingsResourceContent(profile) {
    const keybindings = await this.getKeybindingsContent(profile);
    return { keybindings, platform };
  }
  async apply(content, profile) {
    const keybindingsContent = JSON.parse(content);
    if (keybindingsContent.keybindings === null) {
      this.logService.info(`Importing Profile (${profile.name}): No keybindings to apply...`);
      return;
    }
    await this.fileService.writeFile(profile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
  }
  async getKeybindingsContent(profile) {
    try {
      const content = await this.fileService.readFile(profile.keybindingsResource);
      return content.value.toString();
    } catch (error) {
      if (error instanceof FileOperationError && error.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
        return null;
      } else {
        throw error;
      }
    }
  }
};
KeybindingsResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService)
], KeybindingsResource);
let KeybindingsResourceTreeItem = class {
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "KeybindingsResourceTreeItem");
  }
  type = ProfileResourceType.Keybindings;
  handle = ProfileResourceType.Keybindings;
  label = { label: localize("keybindings", "Keyboard Shortcuts") };
  collapsibleState = TreeItemCollapsibleState.Expanded;
  checkbox;
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.keybindings;
  }
  async getChildren() {
    return [{
      handle: this.profile.keybindingsResource.toString(),
      resourceUri: this.profile.keybindingsResource,
      collapsibleState: TreeItemCollapsibleState.None,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.keybindingsResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const keybindingsContent = await this.instantiationService.createInstance(KeybindingsResource).getKeybindingsResourceContent(this.profile);
    return keybindingsContent.keybindings !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(KeybindingsResource).getContent(this.profile);
  }
};
KeybindingsResourceTreeItem = __decorateClass([
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IInstantiationService)
], KeybindingsResourceTreeItem);
export {
  KeybindingsResource,
  KeybindingsResourceInitializer,
  KeybindingsResourceTreeItem
};
//# sourceMappingURL=keybindingsResource.js.map
