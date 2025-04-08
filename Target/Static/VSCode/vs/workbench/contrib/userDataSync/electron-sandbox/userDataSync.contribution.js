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
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IUserDataSyncUtilService, SyncStatus } from "../../../../platform/userDataSync/common/userDataSync.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { registerAction2, Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { localize, localize2 } from "../../../../nls.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { CONTEXT_SYNC_STATE, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR, IUserDataSyncWorkbenchService, SYNC_TITLE } from "../../../services/userDataSync/common/userDataSync.js";
import { Schemas } from "../../../../base/common/network.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
let UserDataSyncServicesContribution = class extends Disposable {
  static {
    __name(this, "UserDataSyncServicesContribution");
  }
  static ID = "workbench.contrib.userDataSyncServices";
  constructor(userDataSyncUtilService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel("userDataSyncUtil", ProxyChannel.fromService(userDataSyncUtilService, this._store));
  }
};
UserDataSyncServicesContribution = __decorateClass([
  __decorateParam(0, IUserDataSyncUtilService),
  __decorateParam(1, ISharedProcessService)
], UserDataSyncServicesContribution);
registerWorkbenchContribution2(UserDataSyncServicesContribution.ID, UserDataSyncServicesContribution, WorkbenchPhase.BlockStartup);
registerAction2(class OpenSyncBackupsFolder extends Action2 {
  static {
    __name(this, "OpenSyncBackupsFolder");
  }
  constructor() {
    super({
      id: "workbench.userData.actions.openSyncBackupsFolder",
      title: localize2("Open Backup folder", "Open Local Backups Folder"),
      category: SYNC_TITLE,
      menu: {
        id: MenuId.CommandPalette,
        when: CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized)
      }
    });
  }
  async run(accessor) {
    const syncHome = accessor.get(IEnvironmentService).userDataSyncHome;
    const nativeHostService = accessor.get(INativeHostService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    if (await fileService.exists(syncHome)) {
      const folderStat = await fileService.resolve(syncHome);
      const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
      return nativeHostService.showItemInFolder(item.with({ scheme: Schemas.file }).fsPath);
    } else {
      notificationService.info(localize("no backups", "Local backups folder does not exist"));
    }
  }
});
registerAction2(class DownloadSyncActivityAction extends Action2 {
  static {
    __name(this, "DownloadSyncActivityAction");
  }
  constructor() {
    super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
  }
  async run(accessor) {
    const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
    const notificationService = accessor.get(INotificationService);
    const hostService = accessor.get(INativeHostService);
    const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
    if (folder) {
      notificationService.prompt(
        Severity.Info,
        localize("download sync activity complete", "Successfully downloaded Settings Sync activity."),
        [{
          label: localize("open", "Open Folder"),
          run: /* @__PURE__ */ __name(() => hostService.showItemInFolder(folder.fsPath), "run")
        }]
      );
    }
  }
});
//# sourceMappingURL=userDataSync.contribution.js.map
