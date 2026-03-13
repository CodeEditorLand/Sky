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
var CodeReviewService_1;
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue, transaction } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { hash } from "../../../../base/common/hash.js";
import { hasKey } from "../../../../base/common/types.js";
import { isIChatSessionFileChange2 } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { IGitHubService } from "../../github/browser/githubService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
function getCodeReviewFilesFromSessionChanges(changes) {
  return changes.map((change) => {
    if (isIChatSessionFileChange2(change)) {
      return {
        currentUri: change.modifiedUri ?? change.uri,
        baseUri: change.originalUri
      };
    }
    return {
      currentUri: change.modifiedUri,
      baseUri: change.originalUri
    };
  });
}
__name(getCodeReviewFilesFromSessionChanges, "getCodeReviewFilesFromSessionChanges");
function getCodeReviewVersion(files) {
  const stableFileList = files.map((file) => `${file.currentUri.toString()}|${file.baseUri?.toString() ?? ""}`).sort();
  return `v1:${stableFileList.length}:${hash(stableFileList)}`;
}
__name(getCodeReviewVersion, "getCodeReviewVersion");
var CodeReviewStateKind;
(function(CodeReviewStateKind2) {
  CodeReviewStateKind2["Idle"] = "idle";
  CodeReviewStateKind2["Loading"] = "loading";
  CodeReviewStateKind2["Result"] = "result";
  CodeReviewStateKind2["Error"] = "error";
})(CodeReviewStateKind || (CodeReviewStateKind = {}));
var PRReviewStateKind;
(function(PRReviewStateKind2) {
  PRReviewStateKind2["None"] = "none";
  PRReviewStateKind2["Loading"] = "loading";
  PRReviewStateKind2["Loaded"] = "loaded";
  PRReviewStateKind2["Error"] = "error";
})(PRReviewStateKind || (PRReviewStateKind = {}));
const ICodeReviewService = createDecorator("codeReviewService");
function isRawCodeReviewRangeWithPositions(range) {
  return typeof range === "object" && range !== null && hasKey(range, { start: true, end: true });
}
__name(isRawCodeReviewRangeWithPositions, "isRawCodeReviewRangeWithPositions");
function isRawCodeReviewRangeTuple(range) {
  return Array.isArray(range) && range.length >= 2;
}
__name(isRawCodeReviewRangeTuple, "isRawCodeReviewRangeTuple");
function normalizeCodeReviewUri(uri) {
  return typeof uri === "string" ? URI.parse(uri) : URI.revive(uri);
}
__name(normalizeCodeReviewUri, "normalizeCodeReviewUri");
function normalizeCodeReviewRange(range) {
  if (Range.isIRange(range)) {
    return Range.lift(range);
  }
  if (isRawCodeReviewRangeTuple(range)) {
    const [start, end] = range;
    return new Range((start.line ?? 0) + 1, (start.character ?? 0) + 1, (end.line ?? start.line ?? 0) + 1, (end.character ?? start.character ?? 0) + 1);
  }
  if (isRawCodeReviewRangeWithPositions(range) && range.start && range.end) {
    return new Range((range.start.line ?? 0) + 1, (range.start.character ?? 0) + 1, (range.end.line ?? range.start.line ?? 0) + 1, (range.end.character ?? range.start.character ?? 0) + 1);
  }
  const lineRange = range;
  return new Range((lineRange.startLine ?? 0) + 1, (lineRange.startColumn ?? 0) + 1, (lineRange.endLine ?? lineRange.startLine ?? 0) + 1, (lineRange.endColumn ?? lineRange.startColumn ?? 0) + 1);
}
__name(normalizeCodeReviewRange, "normalizeCodeReviewRange");
function normalizeCodeReviewSuggestion(suggestion) {
  if (!suggestion) {
    return void 0;
  }
  return {
    edits: suggestion.edits.map((edit) => ({
      range: normalizeCodeReviewRange(edit.range),
      newText: edit.newText,
      oldText: edit.oldText
    }))
  };
}
__name(normalizeCodeReviewSuggestion, "normalizeCodeReviewSuggestion");
let CodeReviewService = class CodeReviewService2 extends Disposable {
  static {
    __name(this, "CodeReviewService");
  }
  static {
    CodeReviewService_1 = this;
  }
  static {
    this._STORAGE_KEY = "codeReview.reviews";
  }
  constructor(_commandService, _logService, _storageService, _gitHubService, _sessionsManagementService, _agentSessionsService) {
    super();
    this._commandService = _commandService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._gitHubService = _gitHubService;
    this._sessionsManagementService = _sessionsManagementService;
    this._agentSessionsService = _agentSessionsService;
    this._reviewsBySession = /* @__PURE__ */ new Map();
    this._prReviewBySession = /* @__PURE__ */ new Map();
    this._loadFromStorage();
    this._registerSessionListeners();
    this._register(autorun((reader) => {
      const activeSession = this._sessionsManagementService.activeSession.read(reader);
      if (activeSession) {
        this._ensurePRReviewInitialized(activeSession.resource);
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessions(() => {
      for (const session of this._agentSessionsService.model.sessions) {
        if (!session.isArchived()) {
          this._ensurePRReviewInitialized(session.resource);
        }
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessionArchivedState((e) => {
      if (e.isArchived()) {
        this._disposePRReview(e.resource);
      }
    }));
  }
  getReviewState(sessionResource) {
    return this._getOrCreateData(sessionResource).state;
  }
  hasReview(sessionResource, version) {
    const data = this._reviewsBySession.get(sessionResource.toString());
    if (!data) {
      return false;
    }
    const state = data.state.get();
    return state.kind === "result" && state.version === version;
  }
  requestReview(sessionResource, version, files) {
    const data = this._getOrCreateData(sessionResource);
    const currentState = data.state.get();
    if (currentState.kind === "loading" && currentState.version === version) {
      return;
    }
    if (currentState.kind === "result" && currentState.version === version) {
      return;
    }
    data.state.set({ kind: "loading", version }, void 0);
    this._executeReview(sessionResource, version, files, data);
  }
  removeComment(sessionResource, commentId) {
    const data = this._reviewsBySession.get(sessionResource.toString());
    if (!data) {
      return;
    }
    const state = data.state.get();
    if (state.kind !== "result") {
      return;
    }
    const filtered = state.comments.filter((c) => c.id !== commentId);
    data.state.set({ kind: "result", version: state.version, comments: filtered }, void 0);
    this._saveToStorage();
  }
  dismissReview(sessionResource) {
    const data = this._reviewsBySession.get(sessionResource.toString());
    if (data) {
      data.state.set({
        kind: "idle"
        /* CodeReviewStateKind.Idle */
      }, void 0);
      this._saveToStorage();
    }
  }
  _getOrCreateData(sessionResource) {
    const key = sessionResource.toString();
    let data = this._reviewsBySession.get(key);
    if (!data) {
      data = {
        state: observableValue(`codeReview.state.${key}`, {
          kind: "idle"
          /* CodeReviewStateKind.Idle */
        })
      };
      this._reviewsBySession.set(key, data);
    }
    return data;
  }
  async _executeReview(sessionResource, version, files, data) {
    try {
      const result = await this._commandService.executeCommand("chat.internal.codeReview.run", {
        files: files.map((f) => ({
          currentUri: f.currentUri,
          baseUri: f.baseUri
        }))
      });
      const currentState = data.state.get();
      if (currentState.kind !== "loading" || currentState.version !== version) {
        return;
      }
      if (!result || result.type === "cancelled") {
        data.state.set({
          kind: "idle"
          /* CodeReviewStateKind.Idle */
        }, void 0);
        return;
      }
      if (result.type === "error") {
        data.state.set({ kind: "error", version, reason: result.reason ?? "Unknown error" }, void 0);
        return;
      }
      if (result.type === "success") {
        const comments = (result.comments ?? []).map((raw) => ({
          id: generateUuid(),
          uri: normalizeCodeReviewUri(raw.uri),
          range: normalizeCodeReviewRange(raw.range),
          body: raw.body ?? "",
          kind: raw.kind ?? "",
          severity: raw.severity ?? "",
          suggestion: normalizeCodeReviewSuggestion(raw.suggestion)
        }));
        transaction((tx) => {
          data.state.set({ kind: "result", version, comments }, tx);
        });
        this._saveToStorage();
      }
    } catch (err) {
      const currentState = data.state.get();
      if (currentState.kind === "loading" && currentState.version === version) {
        data.state.set({ kind: "error", version, reason: String(err) }, void 0);
      }
    }
  }
  _loadFromStorage() {
    const raw = this._storageService.get(
      CodeReviewService_1._STORAGE_KEY,
      1
      /* StorageScope.WORKSPACE */
    );
    if (!raw) {
      return;
    }
    try {
      const stored = JSON.parse(raw);
      for (const [key, review] of Object.entries(stored)) {
        const comments = review.comments.map((c) => ({
          id: c.id,
          uri: URI.revive(c.uri),
          range: c.range,
          body: c.body,
          kind: c.kind,
          severity: c.severity,
          suggestion: c.suggestion
        }));
        const data = this._getOrCreateData(URI.parse(key));
        data.state.set({ kind: "result", version: review.version, comments }, void 0);
      }
    } catch {
    }
  }
  _saveToStorage() {
    const stored = {};
    for (const [key, data] of this._reviewsBySession) {
      const state = data.state.get();
      if (state.kind === "result") {
        stored[key] = {
          version: state.version,
          comments: state.comments.map((c) => ({
            id: c.id,
            uri: c.uri.toJSON(),
            range: c.range,
            body: c.body,
            kind: c.kind,
            severity: c.severity,
            suggestion: c.suggestion
          }))
        };
      }
    }
    if (Object.keys(stored).length === 0) {
      this._storageService.remove(
        CodeReviewService_1._STORAGE_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    } else {
      this._storageService.store(
        CodeReviewService_1._STORAGE_KEY,
        JSON.stringify(stored),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
  _registerSessionListeners() {
    this._register(this._agentSessionsService.onDidChangeSessionArchivedState((session) => {
      if (session.isArchived()) {
        const key = session.resource.toString();
        const data = this._reviewsBySession.get(key);
        if (data) {
          data.state.set({
            kind: "idle"
            /* CodeReviewStateKind.Idle */
          }, void 0);
          this._saveToStorage();
        }
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessions(() => {
      let changed = false;
      for (const [key, data] of this._reviewsBySession) {
        const state = data.state.get();
        if (state.kind !== "result") {
          continue;
        }
        const session = this._agentSessionsService.getSession(URI.parse(key));
        if (!session) {
          data.state.set({
            kind: "idle"
            /* CodeReviewStateKind.Idle */
          }, void 0);
          changed = true;
          continue;
        }
        if (!(session.changes instanceof Array) || session.changes.length === 0) {
          data.state.set({
            kind: "idle"
            /* CodeReviewStateKind.Idle */
          }, void 0);
          changed = true;
          continue;
        }
        const files = getCodeReviewFilesFromSessionChanges(session.changes);
        const currentVersion = getCodeReviewVersion(files);
        if (state.version !== currentVersion) {
          data.state.set({
            kind: "idle"
            /* CodeReviewStateKind.Idle */
          }, void 0);
          changed = true;
        }
      }
      if (changed) {
        this._saveToStorage();
      }
    }));
  }
  getPRReviewState(sessionResource) {
    return this._getOrCreatePRReviewData(sessionResource).state;
  }
  async resolvePRReviewThread(sessionResource, threadId) {
    const context = this._sessionsManagementService.getGitHubContextForSession(sessionResource);
    if (context?.prNumber !== void 0) {
      const prModel = this._gitHubService.getPullRequest(context.owner, context.repo, context.prNumber);
      try {
        await prModel.resolveThread(threadId);
      } catch (err) {
        this._logService.warn("[CodeReviewService] Failed to resolve PR thread on GitHub:", err);
      }
    }
    const data = this._prReviewBySession.get(sessionResource.toString());
    if (data) {
      const currentState = data.state.get();
      if (currentState.kind === "loaded") {
        const filtered = currentState.comments.filter((c) => c.id !== threadId);
        data.state.set({ kind: "loaded", comments: filtered }, void 0);
      }
    }
  }
  _getOrCreatePRReviewData(sessionResource) {
    const key = sessionResource.toString();
    let data = this._prReviewBySession.get(key);
    if (!data) {
      data = {
        state: observableValue(`prReview.state.${key}`, {
          kind: "none"
          /* PRReviewStateKind.None */
        }),
        disposables: new DisposableStore(),
        initialized: false
      };
      this._prReviewBySession.set(key, data);
    }
    return data;
  }
  _ensurePRReviewInitialized(sessionResource) {
    const data = this._getOrCreatePRReviewData(sessionResource);
    if (data.initialized) {
      return;
    }
    const context = this._sessionsManagementService.getGitHubContextForSession(sessionResource);
    if (!context || context.prNumber === void 0) {
      return;
    }
    data.initialized = true;
    data.state.set({
      kind: "loading"
      /* PRReviewStateKind.Loading */
    }, void 0);
    const prModel = this._gitHubService.getPullRequest(context.owner, context.repo, context.prNumber);
    data.disposables.add(autorun((reader) => {
      const threads = prModel.reviewThreads.read(reader);
      const comments = [];
      for (const thread of threads) {
        if (thread.isResolved) {
          continue;
        }
        const fileUri = this._sessionsManagementService.resolveSessionFileUri(sessionResource, thread.path);
        if (!fileUri) {
          continue;
        }
        const line = thread.line ?? 1;
        const firstComment = thread.comments[0];
        comments.push({
          id: String(thread.id),
          uri: fileUri,
          range: new Range(line, 1, line, 1),
          body: firstComment?.body ?? "",
          author: firstComment?.author.login ?? ""
        });
      }
      data.state.set({ kind: "loaded", comments }, void 0);
    }));
    prModel.refreshThreads().catch((err) => {
      this._logService.error("[CodeReviewService] Failed to fetch PR review threads:", err);
      data.state.set({ kind: "error", reason: String(err) }, void 0);
    });
    prModel.startPolling();
  }
  _disposePRReview(sessionResource) {
    const key = sessionResource.toString();
    const data = this._prReviewBySession.get(key);
    if (data) {
      data.disposables.dispose();
      this._prReviewBySession.delete(key);
    }
  }
  dispose() {
    for (const data of this._prReviewBySession.values()) {
      data.disposables.dispose();
    }
    this._prReviewBySession.clear();
    super.dispose();
  }
};
CodeReviewService = CodeReviewService_1 = __decorate([
  __param(0, ICommandService),
  __param(1, ILogService),
  __param(2, IStorageService),
  __param(3, IGitHubService),
  __param(4, ISessionsManagementService),
  __param(5, IAgentSessionsService)
], CodeReviewService);
export {
  CodeReviewService,
  CodeReviewStateKind,
  ICodeReviewService,
  PRReviewStateKind,
  getCodeReviewFilesFromSessionChanges,
  getCodeReviewVersion
};
//# sourceMappingURL=codeReviewService.js.map
