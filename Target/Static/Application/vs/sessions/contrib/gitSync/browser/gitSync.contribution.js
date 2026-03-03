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
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { localize } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { CHAT_CATEGORY } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { IGitService } from "../../../../workbench/contrib/git/common/gitService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
const hasGitSyncChangesContextKey = new RawContextKey("agentSessionHasGitSyncChanges", false, {
  type: "boolean",
  description: localize("agentSessionHasGitSyncChanges", "True when the active agent session worktree has ahead or behind commits relative to its upstream.")
});
let GitSyncContribution = class GitSyncContribution2 extends Disposable {
  static {
    __name(this, "GitSyncContribution");
  }
  static {
    this.ID = "sessions.contrib.gitSync";
  }
  constructor(contextKeyService, sessionManagementService, gitService) {
    super();
    this.contextKeyService = contextKeyService;
    this.sessionManagementService = sessionManagementService;
    this.gitService = gitService;
    this._syncActionDisposable = this._register(new MutableDisposable());
    this._gitRepoDisposables = this._register(new DisposableStore());
    const contextKey = hasGitSyncChangesContextKey.bindTo(this.contextKeyService);
    this._register(autorun((reader) => {
      const activeSession = this.sessionManagementService.activeSession.read(reader);
      this._gitRepoDisposables.clear();
      const worktreeUri = activeSession ? this.sessionManagementService.getActiveSession()?.worktree : void 0;
      if (!worktreeUri) {
        this._syncActionDisposable.clear();
        contextKey.set(false);
        return;
      }
      const repoDisposables = this._gitRepoDisposables.add(new DisposableStore());
      this.gitService.openRepository(worktreeUri).then((repository) => {
        if (repoDisposables.isDisposed) {
          return;
        }
        if (!repository) {
          this._syncActionDisposable.clear();
          contextKey.set(false);
          return;
        }
        repoDisposables.add(autorun((innerReader) => {
          const state = repository.state.read(innerReader);
          const head = state.HEAD;
          if (!head?.upstream) {
            this._syncActionDisposable.clear();
            contextKey.set(false);
            return;
          }
          const ahead = head.ahead ?? 0;
          const behind = head.behind ?? 0;
          const hasSyncChanges = ahead > 0 || behind > 0;
          contextKey.set(hasSyncChanges);
          this._syncActionDisposable.value = registerSyncAction(behind, ahead);
        }));
      });
    }));
  }
};
GitSyncContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, ISessionsManagementService),
  __param(2, IGitService)
], GitSyncContribution);
function registerSyncAction(behind, ahead) {
  if (behind === 0 && ahead === 0) {
    return Disposable.None;
  }
  let title = "";
  if (behind > 0) {
    title += `${behind}\u2193 `;
  }
  if (ahead > 0) {
    title += `${ahead}\u2191`;
  }
  class SynchronizeChangesAction extends Action2 {
    static {
      __name(this, "SynchronizeChangesAction");
    }
    static {
      this.ID = "chatEditing.synchronizeChanges";
    }
    constructor() {
      super({
        id: SynchronizeChangesAction.ID,
        title,
        tooltip: localize("synchronizeChanges", "Synchronize Changes with Git (Behind {0}, Ahead {1})", behind, ahead),
        icon: Codicon.sync,
        category: CHAT_CATEGORY,
        menu: [
          {
            id: MenuId.ChatEditingSessionChangesToolbar,
            group: "navigation",
            order: 5,
            when: hasGitSyncChangesContextKey
          }
        ]
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("git.sync");
    }
  }
  return registerAction2(SynchronizeChangesAction);
}
__name(registerSyncAction, "registerSyncAction");
registerWorkbenchContribution2(
  GitSyncContribution.ID,
  GitSyncContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=gitSync.contribution.js.map
