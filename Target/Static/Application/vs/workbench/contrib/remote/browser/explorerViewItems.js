var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IRemoteExplorerService, REMOTE_EXPLORER_TYPE_KEY } from "../../../services/remote/common/remoteExplorerService.js";
import { isStringArray } from "../../../../base/common/types.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { VIEWLET_ID } from "./remoteExplorer.js";
import { getVirtualWorkspaceLocation } from "../../../../platform/workspace/common/virtualWorkspace.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
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
const SELECTED_REMOTE_IN_EXPLORER = new RawContextKey("selectedRemoteInExplorer", "");
let SwitchRemoteViewItem = class SwitchRemoteViewItem2 extends Disposable {
  static {
    __name(this, "SwitchRemoteViewItem");
  }
  constructor(contextKeyService, remoteExplorerService, environmentService, storageService, workspaceContextService) {
    super();
    this.contextKeyService = contextKeyService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.completedRemotes = this._register(new DisposableMap());
    this.selectedRemoteContext = SELECTED_REMOTE_IN_EXPLORER.bindTo(contextKeyService);
    this.switchRemoteMenu = MenuId.for("workbench.remote.menu.switchRemoteMenu");
    this._register(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
      submenu: this.switchRemoteMenu,
      title: nls.localize("switchRemote.label", "Switch Remote"),
      group: "navigation",
      when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
      order: 1,
      isSelection: true
    }));
    this._register(remoteExplorerService.onDidChangeTargetType((e) => {
      this.select(e);
    }));
  }
  setSelectionForConnection() {
    let isSetForConnection = false;
    if (this.completedRemotes.size > 0) {
      let authority;
      const remoteAuthority = this.environmentService.remoteAuthority;
      let virtualWorkspace;
      if (!remoteAuthority) {
        virtualWorkspace = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace())?.scheme;
      }
      isSetForConnection = true;
      const explorerType = remoteAuthority ? [remoteAuthority.split("+")[0]] : virtualWorkspace ? [virtualWorkspace] : this.storageService.get(
        REMOTE_EXPLORER_TYPE_KEY,
        1
        /* StorageScope.WORKSPACE */
      )?.split(",") ?? this.storageService.get(
        REMOTE_EXPLORER_TYPE_KEY,
        0
        /* StorageScope.PROFILE */
      )?.split(",");
      if (explorerType !== void 0) {
        authority = this.getAuthorityForExplorerType(explorerType);
      }
      if (authority) {
        this.select(authority);
      }
    }
    return isSetForConnection;
  }
  select(authority) {
    this.selectedRemoteContext.set(authority[0]);
    this.remoteExplorerService.targetType = authority;
  }
  getAuthorityForExplorerType(explorerType) {
    let authority;
    for (const option of this.completedRemotes) {
      for (const authorityOption of option[1].authority) {
        for (const explorerOption of explorerType) {
          if (authorityOption === explorerOption) {
            authority = option[1].authority;
            break;
          } else if (option[1].virtualWorkspace === explorerOption) {
            authority = option[1].authority;
            break;
          }
        }
      }
    }
    return authority;
  }
  removeOptionItems(views) {
    for (const view of views) {
      if (view.group && view.group.startsWith("targets") && view.remoteAuthority && (!view.when || this.contextKeyService.contextMatchesRules(view.when))) {
        const authority = isStringArray(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority];
        this.completedRemotes.deleteAndDispose(authority[0]);
      }
    }
  }
  createOptionItems(views) {
    const startingCount = this.completedRemotes.size;
    for (const view of views) {
      if (view.group && view.group.startsWith("targets") && view.remoteAuthority && (!view.when || this.contextKeyService.contextMatchesRules(view.when))) {
        const text = view.name;
        const authority = isStringArray(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority];
        if (this.completedRemotes.has(authority[0])) {
          continue;
        }
        const thisCapture = this;
        const action = registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.remoteExplorer.show.${authority[0]}`,
              title: text,
              toggled: SELECTED_REMOTE_IN_EXPLORER.isEqualTo(authority[0]),
              menu: {
                id: thisCapture.switchRemoteMenu
              }
            });
          }
          async run() {
            thisCapture.select(authority);
          }
        });
        this.completedRemotes.set(authority[0], { text: text.value, authority, virtualWorkspace: view.virtualWorkspace, dispose: /* @__PURE__ */ __name(() => action.dispose(), "dispose") });
      }
    }
    if (this.completedRemotes.size > startingCount) {
      this.setSelectionForConnection();
    }
  }
};
SwitchRemoteViewItem = __decorate([
  __param(0, IContextKeyService),
  __param(1, IRemoteExplorerService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, IStorageService),
  __param(4, IWorkspaceContextService)
], SwitchRemoteViewItem);
export {
  SELECTED_REMOTE_IN_EXPLORER,
  SwitchRemoteViewItem
};
//# sourceMappingURL=explorerViewItems.js.map
