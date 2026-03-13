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
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IWorkspaceTrustManagementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { areWorkspaceFoldersEmpty } from "../../../../services/workspaces/common/workspaceUtils.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const IChatTransferService = createDecorator("chatTransferService");
const transferredWorkspacesKey = "chat.transferedWorkspaces";
let ChatTransferService = class ChatTransferService2 {
  static {
    __name(this, "ChatTransferService");
  }
  constructor(workspaceService, storageService, fileService, workspaceTrustManagementService) {
    this.workspaceService = workspaceService;
    this.storageService = storageService;
    this.fileService = fileService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
  }
  deleteWorkspaceFromTransferredList(workspace) {
    const transferredWorkspaces = this.storageService.getObject(transferredWorkspacesKey, 0, []);
    const updatedWorkspaces = transferredWorkspaces.filter((uri) => uri !== workspace.toString());
    this.storageService.store(
      transferredWorkspacesKey,
      updatedWorkspaces,
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  addWorkspaceToTransferred(workspace) {
    const transferredWorkspaces = this.storageService.getObject(transferredWorkspacesKey, 0, []);
    transferredWorkspaces.push(workspace.toString());
    this.storageService.store(
      transferredWorkspacesKey,
      transferredWorkspaces,
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  async checkAndSetTransferredWorkspaceTrust() {
    const workspace = this.workspaceService.getWorkspace();
    const currentWorkspaceUri = workspace.folders[0]?.uri;
    if (!currentWorkspaceUri) {
      return;
    }
    if (this.isChatTransferredWorkspace(currentWorkspaceUri, this.storageService) && await areWorkspaceFoldersEmpty(workspace, this.fileService)) {
      await this.workspaceTrustManagementService.setWorkspaceTrust(true);
      this.deleteWorkspaceFromTransferredList(currentWorkspaceUri);
    }
  }
  isChatTransferredWorkspace(workspace, storageService) {
    if (!workspace) {
      return false;
    }
    const chatWorkspaceTransfer = storageService.getObject(transferredWorkspacesKey, 0, []);
    return chatWorkspaceTransfer.some((item) => item.toString() === workspace.toString());
  }
};
ChatTransferService = __decorate([
  __param(0, IWorkspaceContextService),
  __param(1, IStorageService),
  __param(2, IFileService),
  __param(3, IWorkspaceTrustManagementService)
], ChatTransferService);
export {
  ChatTransferService,
  IChatTransferService
};
//# sourceMappingURL=chatTransferService.js.map
