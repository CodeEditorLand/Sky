var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../base/common/buffer.js";
import { ResourceSet } from "../../../../base/common/map.js";
import { localize } from "../../../../nls.js";
import { FileOperationError, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
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
let SnippetsResourceInitializer = class SnippetsResourceInitializer2 {
  static {
    __name(this, "SnippetsResourceInitializer");
  }
  constructor(userDataProfileService, fileService, uriIdentityService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
  }
  async initialize(content) {
    const snippetsContent = JSON.parse(content);
    for (const key in snippetsContent.snippets) {
      const resource = this.uriIdentityService.extUri.joinPath(this.userDataProfileService.currentProfile.snippetsHome, key);
      await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key]));
    }
  }
};
SnippetsResourceInitializer = __decorate([
  __param(0, IUserDataProfileService),
  __param(1, IFileService),
  __param(2, IUriIdentityService)
], SnippetsResourceInitializer);
let SnippetsResource = class SnippetsResource2 {
  static {
    __name(this, "SnippetsResource");
  }
  constructor(fileService, uriIdentityService) {
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
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
      if (e instanceof FileOperationError && e.fileOperationResult === 1) {
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
SnippetsResource = __decorate([
  __param(0, IFileService),
  __param(1, IUriIdentityService)
], SnippetsResource);
let SnippetsResourceTreeItem = class SnippetsResourceTreeItem2 {
  static {
    __name(this, "SnippetsResourceTreeItem");
  }
  constructor(profile, instantiationService, uriIdentityService) {
    this.profile = profile;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.type = "snippets";
    this.label = { label: localize("snippets", "Snippets") };
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
    this.excludedSnippets = new ResourceSet();
    this.handle = this.profile.snippetsHome.toString();
  }
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
SnippetsResourceTreeItem = __decorate([
  __param(1, IInstantiationService),
  __param(2, IUriIdentityService)
], SnippetsResourceTreeItem);
export {
  SnippetsResource,
  SnippetsResourceInitializer,
  SnippetsResourceTreeItem
};
//# sourceMappingURL=snippetsResource.js.map
