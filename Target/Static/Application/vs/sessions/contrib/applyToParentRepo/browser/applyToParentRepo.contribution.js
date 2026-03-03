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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { CHAT_CATEGORY } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { ChatContextKeys } from "../../../../workbench/contrib/chat/common/actions/chatContextKeys.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { isIChatSessionFileChange2 } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IsSessionsWindowContext } from "../../../../workbench/common/contextkeys.js";
import { isEqualOrParent, joinPath, relativePath } from "../../../../base/common/resources.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { URI } from "../../../../base/common/uri.js";
function toFileUri(uri) {
  return uri.scheme === "file" ? uri : URI.file(uri.path);
}
__name(toFileUri, "toFileUri");
const hasWorktreeAndRepositoryContextKey = new RawContextKey("agentSessionHasWorktreeAndRepository", false, {
  type: "boolean",
  description: localize("agentSessionHasWorktreeAndRepository", "True when the active agent session has both a worktree and a parent repository.")
});
let ApplyToParentRepoContribution = class ApplyToParentRepoContribution2 extends Disposable {
  static {
    __name(this, "ApplyToParentRepoContribution");
  }
  static {
    this.ID = "sessions.contrib.applyToParentRepo";
  }
  constructor(contextKeyService, sessionManagementService) {
    super();
    const contextKey = hasWorktreeAndRepositoryContextKey.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      const activeSession = sessionManagementService.activeSession.read(reader);
      const hasWorktreeAndRepo = !!activeSession?.worktree && !!activeSession?.repository;
      contextKey.set(hasWorktreeAndRepo);
    }));
  }
};
ApplyToParentRepoContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, ISessionsManagementService)
], ApplyToParentRepoContribution);
class ApplyToParentRepoAction extends Action2 {
  static {
    __name(this, "ApplyToParentRepoAction");
  }
  static {
    this.ID = "chatEditing.applyToParentRepo";
  }
  constructor() {
    super({
      id: ApplyToParentRepoAction.ID,
      title: localize2("applyToParentRepo", "Apply to Parent Repo"),
      icon: Codicon.desktopDownload,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(IsSessionsWindowContext, hasWorktreeAndRepositoryContextKey, ChatContextKeys.hasAgentSessionChanges),
      menu: [
        {
          id: MenuId.ChatEditingSessionChangesToolbar,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(IsSessionsWindowContext, hasWorktreeAndRepositoryContextKey, ChatContextKeys.hasAgentSessionChanges)
        }
      ]
    });
  }
  async run(accessor) {
    const sessionManagementService = accessor.get(ISessionsManagementService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const fileService = accessor.get(IFileService);
    const notificationService = accessor.get(INotificationService);
    const logService = accessor.get(ILogService);
    const activeSession = sessionManagementService.getActiveSession();
    if (!activeSession?.worktree || !activeSession?.repository) {
      return;
    }
    const worktreeRoot = activeSession.worktree;
    const repoRoot = activeSession.repository;
    const agentSession = agentSessionsService.getSession(activeSession.resource);
    const changes = agentSession?.changes;
    if (!changes || !(changes instanceof Array)) {
      return;
    }
    let copiedCount = 0;
    let deletedCount = 0;
    let errorCount = 0;
    for (const change of changes) {
      try {
        const modifiedUri = isIChatSessionFileChange2(change) ? change.modifiedUri ?? change.uri : change.modifiedUri;
        const isDeletion = isIChatSessionFileChange2(change) ? change.modifiedUri === void 0 : false;
        if (isDeletion) {
          const originalUri = change.originalUri;
          if (originalUri && isEqualOrParent(toFileUri(originalUri), worktreeRoot)) {
            const relPath = relativePath(worktreeRoot, toFileUri(originalUri));
            if (relPath) {
              const targetUri = joinPath(repoRoot, relPath);
              if (await fileService.exists(targetUri)) {
                await fileService.del(targetUri);
                deletedCount++;
              }
            }
          }
        } else {
          if (isEqualOrParent(toFileUri(modifiedUri), worktreeRoot)) {
            const relPath = relativePath(worktreeRoot, toFileUri(modifiedUri));
            if (relPath) {
              const targetUri = joinPath(repoRoot, relPath);
              await fileService.copy(modifiedUri, targetUri, true);
              copiedCount++;
            }
          }
        }
      } catch (err) {
        logService.error("[ApplyToParentRepo] Failed to apply change", err);
        errorCount++;
      }
    }
    const totalApplied = copiedCount + deletedCount;
    if (errorCount > 0) {
      notificationService.warn(totalApplied === 1 ? localize("applyToParentRepoPartial1", "Applied 1 file to parent repo with {0} error(s).", errorCount) : localize("applyToParentRepoPartialN", "Applied {0} files to parent repo with {1} error(s).", totalApplied, errorCount));
    } else if (totalApplied > 0) {
      notificationService.info(totalApplied === 1 ? localize("applyToParentRepoSuccess1", "Applied 1 file to parent repo.") : localize("applyToParentRepoSuccessN", "Applied {0} files to parent repo.", totalApplied));
    }
  }
}
registerAction2(ApplyToParentRepoAction);
registerWorkbenchContribution2(
  ApplyToParentRepoContribution.ID,
  ApplyToParentRepoContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=applyToParentRepo.contribution.js.map
