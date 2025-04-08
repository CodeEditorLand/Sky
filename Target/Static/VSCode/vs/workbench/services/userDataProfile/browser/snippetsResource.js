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
import { IStringDictionary } from "../../../../base/common/collections.js";
import { ResourceSet } from "../../../../base/common/map.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { FileOperationError, FileOperationResult, IFileService, IFileStat } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfile, ProfileResourceType } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from "../../../common/views.js";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "../common/userDataProfile.js";
let SnippetsResourceInitializer = class {
  constructor(userDataProfileService, fileService, uriIdentityService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "SnippetsResourceInitializer");
  }
  async initialize(content) {
    const snippetsContent = JSON.parse(content);
    for (const key in snippetsContent.snippets) {
      const resource = this.uriIdentityService.extUri.joinPath(this.userDataProfileService.currentProfile.snippetsHome, key);
      await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key]));
    }
  }
};
SnippetsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService)
], SnippetsResourceInitializer);
let SnippetsResource = class {
  constructor(fileService, uriIdentityService) {
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "SnippetsResource");
  }
  async getContent(profile, excluded) {
    const snippets = await this.getSnippets(profile, excluded);
    return JSON.stringify({ snippets });
  }
  async apply(content, profile) {
    const snippetsContent = JSON.parse(content);
    for (const key in snippetsContent.snippets) {
      const resource = this.uriIdentityService.extUri.joinPath(profile.snippetsHome, key);
      await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key]));
    }
  }
  async getSnippets(profile, excluded) {
    const snippets = {};
    const snippetsResources = await this.getSnippetsResources(profile, excluded);
    for (const resource of snippetsResources) {
      const key = this.uriIdentityService.extUri.relativePath(profile.snippetsHome, resource);
      const content = await this.fileService.readFile(resource);
      snippets[key] = content.value.toString();
    }
    return snippets;
  }
  async getSnippetsResources(profile, excluded) {
    const snippets = [];
    let stat;
    try {
      stat = await this.fileService.resolve(profile.snippetsHome);
    } catch (e) {
      if (e instanceof FileOperationError && e.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
        return snippets;
      } else {
        throw e;
      }
    }
    for (const { resource } of stat.children || []) {
      if (excluded?.has(resource)) {
        continue;
      }
      const extension = this.uriIdentityService.extUri.extname(resource);
      if (extension === ".json" || extension === ".code-snippets") {
        snippets.push(resource);
      }
    }
    return snippets;
  }
};
SnippetsResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUriIdentityService)
], SnippetsResource);
let SnippetsResourceTreeItem = class {
  constructor(profile, instantiationService, uriIdentityService) {
    this.profile = profile;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.handle = this.profile.snippetsHome.toString();
  }
  static {
    __name(this, "SnippetsResourceTreeItem");
  }
  type = ProfileResourceType.Snippets;
  handle;
  label = { label: localize("snippets", "Snippets") };
  collapsibleState = TreeItemCollapsibleState.Collapsed;
  checkbox;
  excludedSnippets = new ResourceSet();
  async getChildren() {
    const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
    const that = this;
    return snippetsResources.map((resource) => ({
      handle: resource.toString(),
      parent: that,
      resourceUri: resource,
      collapsibleState: TreeItemCollapsibleState.None,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(resource)
      },
      checkbox: that.checkbox ? {
        get isChecked() {
          return !that.excludedSnippets.has(resource);
        },
        set isChecked(value) {
          if (value) {
            that.excludedSnippets.delete(resource);
          } else {
            that.excludedSnippets.add(resource);
          }
        },
        accessibilityInformation: {
          label: localize("exclude", "Select Snippet {0}", this.uriIdentityService.extUri.basename(resource))
        }
      } : void 0,
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [resource, void 0, void 0]
      }
    }));
  }
  async hasContent() {
    const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
    return snippetsResources.length > 0;
  }
  async getContent() {
    return this.instantiationService.createInstance(SnippetsResource).getContent(this.profile, this.excludedSnippets);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.snippets;
  }
};
SnippetsResourceTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService)
], SnippetsResourceTreeItem);
export {
  SnippetsResource,
  SnippetsResourceInitializer,
  SnippetsResourceTreeItem
};
//# sourceMappingURL=snippetsResource.js.map
