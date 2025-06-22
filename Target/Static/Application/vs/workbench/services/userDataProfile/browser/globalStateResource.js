var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfileStorageService } from "../../../../platform/userDataProfile/common/userDataProfileStorageService.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { TreeItemCollapsibleState } from "../../../common/views.js";
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
let GlobalStateResourceInitializer = class GlobalStateResourceInitializer2 {
  static {
    __name(this, "GlobalStateResourceInitializer");
  }
  constructor(storageService) {
    this.storageService = storageService;
  }
  async initialize(content) {
    const globalState = JSON.parse(content);
    const storageKeys = Object.keys(globalState.storage);
    if (storageKeys.length) {
      const storageEntries = [];
      for (const key of storageKeys) {
        storageEntries.push({
          key,
          value: globalState.storage[key],
          scope: 0,
          target: 0
          /* StorageTarget.USER */
        });
      }
      this.storageService.storeAll(storageEntries, true);
    }
  }
};
GlobalStateResourceInitializer = __decorate([
  __param(0, IStorageService)
], GlobalStateResourceInitializer);
let GlobalStateResource = class GlobalStateResource2 {
  static {
    __name(this, "GlobalStateResource");
  }
  constructor(storageService, userDataProfileStorageService, logService) {
    this.storageService = storageService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.logService = logService;
  }
  async getContent(profile) {
    const globalState = await this.getGlobalState(profile);
    return JSON.stringify(globalState);
  }
  async apply(content, profile) {
    const globalState = JSON.parse(content);
    await this.writeGlobalState(globalState, profile);
  }
  async getGlobalState(profile) {
    const storage = {};
    const storageData = await this.userDataProfileStorageService.readStorageData(profile);
    for (const [key, value] of storageData) {
      if (value.value !== void 0 && value.target === 0) {
        storage[key] = value.value;
      }
    }
    return { storage };
  }
  async writeGlobalState(globalState, profile) {
    const storageKeys = Object.keys(globalState.storage);
    if (storageKeys.length) {
      const updatedStorage = /* @__PURE__ */ new Map();
      const nonProfileKeys = [
        // Do not include application scope user target keys because they also include default profile user target keys
        ...this.storageService.keys(
          -1,
          1
          /* StorageTarget.MACHINE */
        ),
        ...this.storageService.keys(
          1,
          0
          /* StorageTarget.USER */
        ),
        ...this.storageService.keys(
          1,
          1
          /* StorageTarget.MACHINE */
        )
      ];
      for (const key of storageKeys) {
        if (nonProfileKeys.includes(key)) {
          this.logService.info(`Importing Profile (${profile.name}): Ignoring global state key '${key}' because it is not a profile key.`);
        } else {
          updatedStorage.set(key, globalState.storage[key]);
        }
      }
      await this.userDataProfileStorageService.updateStorageData(
        profile,
        updatedStorage,
        0
        /* StorageTarget.USER */
      );
    }
  }
};
GlobalStateResource = __decorate([
  __param(0, IStorageService),
  __param(1, IUserDataProfileStorageService),
  __param(2, ILogService)
], GlobalStateResource);
class GlobalStateResourceTreeItem {
  static {
    __name(this, "GlobalStateResourceTreeItem");
  }
  constructor(resource, uriIdentityService) {
    this.resource = resource;
    this.uriIdentityService = uriIdentityService;
    this.type = "globalState";
    this.handle = "globalState";
    this.label = { label: localize("globalState", "UI State") };
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }
  async getChildren() {
    return [{
      handle: this.resource.toString(),
      resourceUri: this.resource,
      collapsibleState: TreeItemCollapsibleState.None,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.resource)
      },
      parent: this,
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.resource, void 0, void 0]
      }
    }];
  }
}
let GlobalStateResourceExportTreeItem = class GlobalStateResourceExportTreeItem2 extends GlobalStateResourceTreeItem {
  static {
    __name(this, "GlobalStateResourceExportTreeItem");
  }
  constructor(profile, resource, uriIdentityService, instantiationService) {
    super(resource, uriIdentityService);
    this.profile = profile;
    this.instantiationService = instantiationService;
  }
  async hasContent() {
    const globalState = await this.instantiationService.createInstance(GlobalStateResource).getGlobalState(this.profile);
    return Object.keys(globalState.storage).length > 0;
  }
  async getContent() {
    return this.instantiationService.createInstance(GlobalStateResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.globalState;
  }
};
GlobalStateResourceExportTreeItem = __decorate([
  __param(2, IUriIdentityService),
  __param(3, IInstantiationService)
], GlobalStateResourceExportTreeItem);
let GlobalStateResourceImportTreeItem = class GlobalStateResourceImportTreeItem2 extends GlobalStateResourceTreeItem {
  static {
    __name(this, "GlobalStateResourceImportTreeItem");
  }
  constructor(content, resource, uriIdentityService) {
    super(resource, uriIdentityService);
    this.content = content;
  }
  async getContent() {
    return this.content;
  }
  isFromDefaultProfile() {
    return false;
  }
};
GlobalStateResourceImportTreeItem = __decorate([
  __param(2, IUriIdentityService)
], GlobalStateResourceImportTreeItem);
export {
  GlobalStateResource,
  GlobalStateResourceExportTreeItem,
  GlobalStateResourceImportTreeItem,
  GlobalStateResourceInitializer,
  GlobalStateResourceTreeItem
};
//# sourceMappingURL=globalStateResource.js.map
