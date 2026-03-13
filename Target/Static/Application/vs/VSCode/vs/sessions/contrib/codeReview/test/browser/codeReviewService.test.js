var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ILogService, NullLogService } from "../../../../../platform/log/common/log.js";
import { InMemoryStorageService, IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IAgentSessionsService } from "../../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { CodeReviewService, getCodeReviewFilesFromSessionChanges, getCodeReviewVersion } from "../../browser/codeReviewService.js";
import { IGitHubService } from "../../../github/browser/githubService.js";
import { ISessionsManagementService } from "../../../sessions/browser/sessionsManagementService.js";
suite("CodeReviewService", () => {
  const store = new DisposableStore();
  let instantiationService;
  let service;
  let commandService;
  let storageService;
  let agentSessionsService;
  let session;
  let fileA;
  let fileB;
  class MockCommandService {
    static {
      __name(this, "MockCommandService");
    }
    constructor() {
      this.onWillExecuteCommand = Event.None;
      this.onDidExecuteCommand = Event.None;
      this.result = void 0;
    }
    async executeCommand(commandId, ...args) {
      this.lastCommandId = commandId;
      this.lastArgs = args;
      if (this.executeDeferred) {
        return await new Promise((resolve, reject) => {
          this.executeDeferred = { resolve, reject };
        });
      }
      return this.result;
    }
    /**
     * Configure the mock to defer execution until manually resolved/rejected.
     */
    deferNextExecution() {
      this.executeDeferred = void 0;
      const self = this;
      const originalResult = this.result;
      const origExecute = this.executeCommand.bind(this);
      this.executeCommand = async function(commandId, ...args) {
        self.lastCommandId = commandId;
        self.lastArgs = args;
        return new Promise((resolve, reject) => {
          self.executeDeferred = { resolve, reject };
        });
      };
      this._restoreExecute = () => {
        this.executeCommand = origExecute;
        this.result = originalResult;
      };
    }
    resolveExecution(value) {
      this.executeDeferred?.resolve(value);
      this.executeDeferred = void 0;
      this._restoreExecute?.();
    }
    rejectExecution(error) {
      this.executeDeferred?.reject(error);
      this.executeDeferred = void 0;
      this._restoreExecute?.();
    }
  }
  class MockAgentSessionsService {
    static {
      __name(this, "MockAgentSessionsService");
    }
    constructor(disposables) {
      this._sessions = /* @__PURE__ */ new Map();
      this._onDidChangeSessionArchivedState = disposables.add(new Emitter());
      this.onDidChangeSessionArchivedState = this._onDidChangeSessionArchivedState.event;
      this._onDidChangeSessions = disposables.add(new Emitter());
      this.model = {
        onWillResolve: Event.None,
        onDidResolve: Event.None,
        onDidChangeSessions: this._onDidChangeSessions.event,
        onDidChangeSessionArchivedState: this._onDidChangeSessionArchivedState.event,
        resolved: true,
        sessions: [],
        getSession: /* @__PURE__ */ __name((resource) => this._sessions.get(resource.toString()), "getSession"),
        resolve: /* @__PURE__ */ __name(async () => {
        }, "resolve")
      };
    }
    getSession(resource) {
      return this._sessions.get(resource.toString());
    }
    setSession(resource, changes, archived = false) {
      let _archived = archived;
      const session2 = {
        resource,
        changes,
        isArchived: /* @__PURE__ */ __name(() => _archived, "isArchived"),
        setArchived: /* @__PURE__ */ __name((v) => {
          _archived = v;
        }, "setArchived"),
        isRead: /* @__PURE__ */ __name(() => true, "isRead"),
        setRead: /* @__PURE__ */ __name(() => {
        }, "setRead")
      };
      this._sessions.set(resource.toString(), session2);
      return session2;
    }
    updateSessionChanges(resource, changes) {
      const session2 = this._sessions.get(resource.toString());
      if (session2) {
        session2.changes = changes;
      }
    }
    removeSession(resource) {
      this._sessions.delete(resource.toString());
    }
    fireSessionArchivedState(session2) {
      this._onDidChangeSessionArchivedState.fire(session2);
    }
    fireSessionsChanged() {
      this._onDidChangeSessions.fire();
    }
  }
  setup(() => {
    instantiationService = store.add(new TestInstantiationService());
    commandService = new MockCommandService();
    instantiationService.stub(ICommandService, commandService);
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(IGitHubService, new class extends mock() {
    }());
    instantiationService.stub(ISessionsManagementService, new class extends mock() {
      constructor() {
        super(...arguments);
        this.activeSession = observableValue("test.activeSession", void 0);
      }
    }());
    storageService = store.add(new InMemoryStorageService());
    instantiationService.stub(IStorageService, storageService);
    agentSessionsService = new MockAgentSessionsService(store);
    instantiationService.stub(IAgentSessionsService, agentSessionsService);
    service = store.add(instantiationService.createInstance(CodeReviewService));
    session = URI.parse("test://session/1");
    fileA = URI.parse("file:///a.ts");
    fileB = URI.parse("file:///b.ts");
  });
  teardown(() => {
    store.clear();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("initial state is idle", () => {
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("getReviewState returns the same observable for the same session", () => {
    const obs1 = service.getReviewState(session);
    const obs2 = service.getReviewState(session);
    assert.strictEqual(obs1, obs2);
  });
  test("getReviewState returns different observables for different sessions", () => {
    const session2 = URI.parse("test://session/2");
    const obs1 = service.getReviewState(session);
    const obs2 = service.getReviewState(session2);
    assert.notStrictEqual(obs1, obs2);
  });
  test("hasReview returns false when no review exists", () => {
    assert.strictEqual(service.hasReview(session, "v1"), false);
  });
  test("hasReview returns false when review is for a different version", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(service.hasReview(session, "v1"), true);
    assert.strictEqual(service.hasReview(session, "v2"), false);
  });
  test("hasReview returns true after successful review", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(service.hasReview(session, "v1"), true);
  });
  test("requestReview transitions to loading state", () => {
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "loading"
      /* CodeReviewStateKind.Loading */
    );
    if (state.kind === "loading") {
      assert.strictEqual(state.version, "v1");
    }
    commandService.resolveExecution({ type: "success", comments: [] });
  });
  test("requestReview calls command with correct arguments", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [
      { currentUri: fileA, baseUri: fileB },
      { currentUri: fileB }
    ]);
    await tick();
    assert.strictEqual(commandService.lastCommandId, "chat.internal.codeReview.run");
    const args = commandService.lastArgs?.[0];
    assert.strictEqual(args.files.length, 2);
    assert.strictEqual(args.files[0].currentUri.toString(), fileA.toString());
    assert.strictEqual(args.files[0].baseUri?.toString(), fileB.toString());
    assert.strictEqual(args.files[1].currentUri.toString(), fileB.toString());
    assert.strictEqual(args.files[1].baseUri, void 0);
  });
  test("requestReview with success populates comments", async () => {
    commandService.result = {
      type: "success",
      comments: [
        {
          uri: fileA,
          range: new Range(1, 1, 5, 1),
          body: "Bug found",
          kind: "bug",
          severity: "high"
        },
        {
          uri: fileB,
          range: new Range(10, 1, 15, 1),
          body: "Style issue",
          kind: "style",
          severity: "low"
        }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }, { currentUri: fileB }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.version, "v1");
      assert.strictEqual(state.comments.length, 2);
      assert.strictEqual(state.comments[0].body, "Bug found");
      assert.strictEqual(state.comments[0].kind, "bug");
      assert.strictEqual(state.comments[0].severity, "high");
      assert.strictEqual(state.comments[0].uri.toString(), fileA.toString());
      assert.strictEqual(state.comments[1].body, "Style issue");
    }
  });
  test("requestReview with error transitions to error state", async () => {
    commandService.result = { type: "error", reason: "Auth failed" };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "error"
      /* CodeReviewStateKind.Error */
    );
    if (state.kind === "error") {
      assert.strictEqual(state.version, "v1");
      assert.strictEqual(state.reason, "Auth failed");
    }
  });
  test("requestReview with cancelled result transitions to idle", async () => {
    commandService.result = { type: "cancelled" };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("requestReview with undefined result transitions to idle", async () => {
    commandService.result = void 0;
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("requestReview with thrown error transitions to error state", async () => {
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    commandService.rejectExecution(new Error("Network error"));
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "error"
      /* CodeReviewStateKind.Error */
    );
    if (state.kind === "error") {
      assert.ok(state.reason.includes("Network error"));
    }
  });
  test("requestReview is a no-op when loading for the same version", () => {
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "loading"
      /* CodeReviewStateKind.Loading */
    );
    commandService.resolveExecution({ type: "success", comments: [] });
  });
  test("requestReview is a no-op when result exists for the same version", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
  });
  test("requestReview for a new version replaces loading state", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(service.hasReview(session, "v1"), true);
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "v2 comment" }] };
    service.requestReview(session, "v2", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.version, "v2");
      assert.strictEqual(state.comments.length, 1);
      assert.strictEqual(state.comments[0].body, "v2 comment");
    }
    assert.strictEqual(service.hasReview(session, "v1"), false);
  });
  test("removeComment removes a specific comment", async () => {
    commandService.result = {
      type: "success",
      comments: [
        { uri: fileA, range: new Range(1, 1, 1, 1), body: "comment1" },
        { uri: fileA, range: new Range(5, 1, 5, 1), body: "comment2" },
        { uri: fileB, range: new Range(10, 1, 10, 1), body: "comment3" }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }, { currentUri: fileB }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind !== "result") {
      return;
    }
    const commentToRemove = state.comments[1];
    service.removeComment(session, commentToRemove.id);
    const newState = service.getReviewState(session).get();
    assert.strictEqual(
      newState.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (newState.kind === "result") {
      assert.strictEqual(newState.comments.length, 2);
      assert.strictEqual(newState.comments[0].body, "comment1");
      assert.strictEqual(newState.comments[1].body, "comment3");
    }
  });
  test("removeComment is a no-op for unknown comment id", async () => {
    commandService.result = {
      type: "success",
      comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "comment1" }]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    service.removeComment(session, "nonexistent-id");
    const state = service.getReviewState(session).get();
    if (state.kind === "result") {
      assert.strictEqual(state.comments.length, 1);
    }
  });
  test("removeComment is a no-op when no review exists", () => {
    service.removeComment(session, "some-id");
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("removeComment is a no-op when state is not result", () => {
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    service.removeComment(session, "some-id");
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "loading"
      /* CodeReviewStateKind.Loading */
    );
    commandService.resolveExecution({ type: "success", comments: [] });
  });
  test("removeComment preserves version in result", async () => {
    commandService.result = {
      type: "success",
      comments: [
        { uri: fileA, range: new Range(1, 1, 1, 1), body: "comment1" },
        { uri: fileA, range: new Range(5, 1, 5, 1), body: "comment2" }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    if (state.kind !== "result") {
      return;
    }
    service.removeComment(session, state.comments[0].id);
    const newState = service.getReviewState(session).get();
    if (newState.kind === "result") {
      assert.strictEqual(newState.version, "v1");
    }
  });
  test("dismissReview resets to idle", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    service.dismissReview(session);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("dismissReview while loading resets to idle", () => {
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "loading"
      /* CodeReviewStateKind.Loading */
    );
    service.dismissReview(session);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
    commandService.resolveExecution({ type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "late" }] });
  });
  test("dismissReview is a no-op when no data exists", () => {
    service.dismissReview(session);
  });
  test("hasReview returns false after dismissReview", async () => {
    commandService.result = { type: "success", comments: [] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(service.hasReview(session, "v1"), true);
    service.dismissReview(session);
    assert.strictEqual(service.hasReview(session, "v1"), false);
  });
  test("different sessions are independent", async () => {
    const session2 = URI.parse("test://session/2");
    commandService.result = {
      type: "success",
      comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "session1 comment" }]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    commandService.result = {
      type: "success",
      comments: [{ uri: fileB, range: new Range(2, 1, 2, 1), body: "session2 comment" }]
    };
    service.requestReview(session2, "v2", [{ currentUri: fileB }]);
    await tick();
    const state1 = service.getReviewState(session).get();
    const state2 = service.getReviewState(session2).get();
    assert.strictEqual(
      state1.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    assert.strictEqual(
      state2.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state1.kind === "result" && state2.kind === "result") {
      assert.strictEqual(state1.comments[0].body, "session1 comment");
      assert.strictEqual(state2.comments[0].body, "session2 comment");
    }
    service.dismissReview(session);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
    assert.strictEqual(
      service.getReviewState(session2).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
  });
  test("comments with string URIs are parsed correctly", async () => {
    commandService.result = {
      type: "success",
      comments: [
        {
          uri: "file:///parsed.ts",
          range: new Range(1, 1, 1, 1),
          body: "parsed comment"
        }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    if (state.kind === "result") {
      assert.strictEqual(state.comments[0].uri.toString(), "file:///parsed.ts");
    }
  });
  test("comments with missing optional fields get defaults", async () => {
    commandService.result = {
      type: "success",
      comments: [
        {
          uri: fileA,
          range: new Range(1, 1, 1, 1)
          // body, kind, severity omitted
        }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    if (state.kind === "result") {
      assert.strictEqual(state.comments[0].body, "");
      assert.strictEqual(state.comments[0].kind, "");
      assert.strictEqual(state.comments[0].severity, "");
      assert.strictEqual(state.comments[0].suggestion, void 0);
    }
  });
  test("comments normalize VS Code API style ranges", async () => {
    commandService.result = {
      type: "success",
      comments: [
        {
          uri: fileA,
          range: {
            start: { line: 4, character: 2 },
            end: { line: 6, character: 5 }
          },
          body: "normalized comment",
          suggestion: {
            edits: [
              {
                range: {
                  start: { line: 8, character: 1 },
                  end: { line: 8, character: 9 }
                },
                oldText: "let value",
                newText: "const value"
              }
            ]
          }
        }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.deepStrictEqual(state.comments[0].range, new Range(5, 3, 7, 6));
      assert.deepStrictEqual(state.comments[0].suggestion?.edits[0].range, new Range(9, 2, 9, 10));
    }
  });
  test("comments normalize serialized URIs and tuple ranges from API payloads", async () => {
    const serializedUri = JSON.parse(JSON.stringify(URI.parse("git:/c%3A/Code/vscode.worktrees/copilot-worktree-2026-03-04T14-44-38/src/vs/sessions/contrib/changesView/test/browser/codeReviewService.test.ts?%7B%22path%22%3A%22c%3A%5C%5CCode%5C%5Cvscode.worktrees%5C%5Ccopilot-worktree-2026-03-04T14-44-38%5C%5Csrc%5C%5Cvs%5C%5Csessions%5C%5Ccontrib%5C%5CchangesView%5C%5Ctest%5C%5Cbrowser%5C%5CcodeReviewService.test.ts%22%2C%22ref%22%3A%22copilot-worktree-2026-03-04T14-44-38%22%7D")));
    commandService.result = {
      type: "success",
      comments: [
        {
          uri: serializedUri,
          range: [
            { line: 72, character: 2 },
            { line: 72, character: 3 }
          ],
          body: "tuple range comment",
          kind: "bug",
          severity: "medium"
        }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.comments[0].uri.toString(), URI.revive(serializedUri).toString());
      assert.deepStrictEqual(state.comments[0].range, new Range(73, 3, 73, 4));
    }
  });
  test("each comment gets a unique id", async () => {
    commandService.result = {
      type: "success",
      comments: [
        { uri: fileA, range: new Range(1, 1, 1, 1), body: "a" },
        { uri: fileA, range: new Range(1, 1, 1, 1), body: "b" }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    if (state.kind === "result") {
      assert.notStrictEqual(state.comments[0].id, state.comments[1].id);
    }
  });
  test("observable fires on state transitions", async () => {
    const states = [];
    const obs = service.getReviewState(session);
    states.push(obs.get().kind);
    commandService.deferNextExecution();
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    states.push(obs.get().kind);
    commandService.resolveExecution({ type: "success", comments: [] });
    await tick();
    states.push(obs.get().kind);
    service.dismissReview(session);
    states.push(obs.get().kind);
    assert.deepStrictEqual(states, [
      "idle",
      "loading",
      "result",
      "idle"
    ]);
  });
  test("review results are persisted to storage", async () => {
    commandService.result = {
      type: "success",
      comments: [{ uri: fileA, range: new Range(1, 1, 5, 1), body: "Persisted comment", kind: "bug", severity: "high" }]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const raw = storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    );
    assert.ok(raw, "Storage should contain review data");
    const stored = JSON.parse(raw);
    const reviewData = stored[session.toString()];
    assert.ok(reviewData);
    assert.strictEqual(reviewData.version, "v1");
    assert.strictEqual(reviewData.comments.length, 1);
    assert.strictEqual(reviewData.comments[0].body, "Persisted comment");
  });
  test("reviews are restored from storage on service creation", async () => {
    commandService.result = {
      type: "success",
      comments: [{ uri: fileA, range: new Range(1, 1, 5, 1), body: "Restored comment", kind: "bug", severity: "high" }]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const service2 = store.add(instantiationService.createInstance(CodeReviewService));
    const state = service2.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.version, "v1");
      assert.strictEqual(state.comments.length, 1);
      assert.strictEqual(state.comments[0].body, "Restored comment");
      assert.strictEqual(state.comments[0].uri.toString(), fileA.toString());
      assert.deepStrictEqual(state.comments[0].range, { startLineNumber: 1, startColumn: 1, endLineNumber: 5, endColumn: 1 });
    }
  });
  test("suggestions are persisted and restored correctly", async () => {
    commandService.result = {
      type: "success",
      comments: [{
        uri: fileA,
        range: new Range(1, 1, 5, 1),
        body: "suggestion comment",
        suggestion: {
          edits: [{
            range: new Range(2, 1, 3, 10),
            oldText: "let x = 1;",
            newText: "const x = 1;"
          }]
        }
      }]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const service2 = store.add(instantiationService.createInstance(CodeReviewService));
    const state = service2.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.comments[0].suggestion?.edits.length, 1);
      assert.strictEqual(state.comments[0].suggestion?.edits[0].oldText, "let x = 1;");
      assert.strictEqual(state.comments[0].suggestion?.edits[0].newText, "const x = 1;");
    }
  });
  test("removeComment updates storage", async () => {
    commandService.result = {
      type: "success",
      comments: [
        { uri: fileA, range: new Range(1, 1, 1, 1), body: "comment1" },
        { uri: fileA, range: new Range(5, 1, 5, 1), body: "comment2" }
      ]
    };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const state = service.getReviewState(session).get();
    if (state.kind !== "result") {
      return;
    }
    service.removeComment(session, state.comments[0].id);
    const raw = storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    );
    const stored = JSON.parse(raw);
    assert.strictEqual(stored[session.toString()].comments.length, 1);
    assert.strictEqual(stored[session.toString()].comments[0].body, "comment2");
  });
  test("dismissReview removes session from storage", async () => {
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "c" }] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.ok(storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    ));
    service.dismissReview(session);
    assert.strictEqual(storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    ), void 0);
  });
  test("corrupted storage is handled gracefully", () => {
    storageService.store(
      "codeReview.reviews",
      "not-valid-json{{{",
      1,
      1
      /* StorageTarget.MACHINE */
    );
    const service2 = store.add(instantiationService.createInstance(CodeReviewService));
    const state = service2.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("archived session reviews are cleaned up", async () => {
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "comment" }] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    const mockSession = agentSessionsService.setSession(session, void 0, true);
    agentSessionsService.fireSessionArchivedState(mockSession);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
    assert.strictEqual(storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    ), void 0);
  });
  test("non-archived session change does not clean up review", async () => {
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "comment" }] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    const mockSession = agentSessionsService.setSession(session, void 0, false);
    agentSessionsService.fireSessionArchivedState(mockSession);
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
  });
  test("session with changed version has review cleaned up", async () => {
    const changes = [
      { uri: fileA, modifiedUri: fileA, insertions: 1, deletions: 0 }
    ];
    agentSessionsService.setSession(session, changes);
    const files = getCodeReviewFilesFromSessionChanges(changes);
    const version = getCodeReviewVersion(files);
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "stale comment" }] };
    service.requestReview(session, version, files);
    await tick();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    const newChanges = [
      { uri: fileA, modifiedUri: fileA, insertions: 1, deletions: 0 },
      { uri: fileB, modifiedUri: fileB, insertions: 2, deletions: 0 }
    ];
    agentSessionsService.updateSessionChanges(session, newChanges);
    agentSessionsService.fireSessionsChanged();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
    assert.strictEqual(storageService.get(
      "codeReview.reviews",
      1
      /* StorageScope.WORKSPACE */
    ), void 0);
  });
  test("session that no longer exists has review cleaned up", async () => {
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "orphaned comment" }] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    agentSessionsService.fireSessionsChanged();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("session with no changes has review cleaned up", async () => {
    agentSessionsService.setSession(session, [
      { uri: fileA, modifiedUri: fileA, insertions: 1, deletions: 0 }
    ]);
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "comment" }] };
    service.requestReview(session, "v1", [{ currentUri: fileA }]);
    await tick();
    agentSessionsService.updateSessionChanges(session, void 0);
    agentSessionsService.fireSessionsChanged();
    assert.strictEqual(
      service.getReviewState(session).get().kind,
      "idle"
      /* CodeReviewStateKind.Idle */
    );
  });
  test("session with matching version keeps review intact", async () => {
    const changes = [
      { uri: fileA, modifiedUri: fileA, insertions: 1, deletions: 0 }
    ];
    agentSessionsService.setSession(session, changes);
    const files = getCodeReviewFilesFromSessionChanges(changes);
    const version = getCodeReviewVersion(files);
    commandService.result = { type: "success", comments: [{ uri: fileA, range: new Range(1, 1, 1, 1), body: "valid comment" }] };
    service.requestReview(session, version, files);
    await tick();
    agentSessionsService.fireSessionsChanged();
    const state = service.getReviewState(session).get();
    assert.strictEqual(
      state.kind,
      "result"
      /* CodeReviewStateKind.Result */
    );
    if (state.kind === "result") {
      assert.strictEqual(state.comments[0].body, "valid comment");
    }
  });
});
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
__name(tick, "tick");
//# sourceMappingURL=codeReviewService.test.js.map
