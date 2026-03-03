var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { Emitter } from "../../../../../base/common/event.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService, ILogService } from "../../../../../platform/log/common/log.js";
import { ITerminalService } from "../../../../../workbench/contrib/terminal/browser/terminal.js";
import { IAgentSessionsService } from "../../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { AgentSessionProviders } from "../../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ISessionsManagementService } from "../../../sessions/browser/sessionsManagementService.js";
import { SessionsTerminalContribution } from "../../browser/sessionsTerminalContribution.js";
function makeAgentSession(opts) {
  return {
    resource: URI.parse("file:///session"),
    repository: opts.repository,
    worktree: opts.worktree,
    providerType: opts.providerType ?? AgentSessionProviders.Local,
    setArchived: /* @__PURE__ */ __name(() => {
    }, "setArchived"),
    setRead: /* @__PURE__ */ __name(() => {
    }, "setRead"),
    isArchived: /* @__PURE__ */ __name(() => opts.isArchived ?? false, "isArchived"),
    isRead: /* @__PURE__ */ __name(() => true, "isRead"),
    metadata: opts.worktreePath ? { worktreePath: opts.worktreePath } : void 0
  };
}
__name(makeAgentSession, "makeAgentSession");
function makeNonAgentSession(opts) {
  return {
    repository: opts.repository,
    worktree: opts.worktree
  };
}
__name(makeNonAgentSession, "makeNonAgentSession");
suite("SessionsTerminalContribution", () => {
  const store = new DisposableStore();
  let contribution;
  let activeSessionObs;
  let onDidChangeSessionArchivedState;
  let onDidDisposeInstance;
  let createdTerminals;
  let activeInstanceSet;
  let focusCalls;
  let disposedInstances;
  let nextInstanceId;
  let terminalInstances;
  setup(() => {
    createdTerminals = [];
    activeInstanceSet = [];
    focusCalls = 0;
    disposedInstances = [];
    nextInstanceId = 1;
    terminalInstances = /* @__PURE__ */ new Map();
    const instantiationService = store.add(new TestInstantiationService());
    activeSessionObs = observableValue("activeSession", void 0);
    onDidChangeSessionArchivedState = store.add(new Emitter());
    onDidDisposeInstance = store.add(new Emitter());
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(ISessionsManagementService, new class extends mock() {
      constructor() {
        super(...arguments);
        this.activeSession = activeSessionObs;
      }
    }());
    instantiationService.stub(ITerminalService, new class extends mock() {
      constructor() {
        super(...arguments);
        this.onDidDisposeInstance = onDidDisposeInstance.event;
      }
      async createTerminal(opts) {
        const id = nextInstanceId++;
        const instance = { instanceId: id };
        createdTerminals.push({ cwd: opts?.config?.cwd });
        terminalInstances.set(id, instance);
        return instance;
      }
      getInstanceFromId(id) {
        return terminalInstances.get(id);
      }
      setActiveInstance(instance) {
        activeInstanceSet.push(instance.instanceId);
      }
      async focusActiveInstance() {
        focusCalls++;
      }
      async safeDisposeTerminal(instance) {
        disposedInstances.push(instance);
        terminalInstances.delete(instance.instanceId);
      }
    }());
    instantiationService.stub(IAgentSessionsService, new class extends mock() {
      constructor() {
        super(...arguments);
        this.model = {
          onDidChangeSessionArchivedState: onDidChangeSessionArchivedState.event
        };
      }
    }());
    contribution = store.add(instantiationService.createInstance(SessionsTerminalContribution));
  });
  teardown(() => {
    store.clear();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("creates a terminal when active session has a worktree (non-cloud agent)", async () => {
    const worktreeUri = URI.file("/worktree");
    const session = makeAgentSession({ worktree: worktreeUri, repository: URI.file("/repo"), providerType: AgentSessionProviders.Local });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
    assert.strictEqual(createdTerminals[0].cwd.fsPath, worktreeUri.fsPath);
  });
  test("reate a terminal with repository for cloud agent sessions", async () => {
    const repoUri = URI.file("/repo");
    const workTree = URI.file("/worktree");
    const session = makeAgentSession({ worktree: workTree, repository: repoUri, providerType: AgentSessionProviders.Cloud });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
    assert.strictEqual(createdTerminals[0].cwd.fsPath, workTree.fsPath);
  });
  test("creates a terminal with repository for non-agent sessions", async () => {
    const repoUri = URI.file("/repo");
    const session = makeNonAgentSession({ repository: repoUri });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
    assert.strictEqual(createdTerminals[0].cwd.fsPath, repoUri.fsPath);
  });
  test("does not create a terminal when no path is available", async () => {
    const session = makeNonAgentSession({});
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 0);
  });
  test("does not recreate terminal for the same path", async () => {
    const worktreeUri = URI.file("/worktree");
    const session1 = makeAgentSession({ worktree: worktreeUri, providerType: AgentSessionProviders.Local });
    activeSessionObs.set(session1, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
    const session2 = makeAgentSession({ worktree: worktreeUri, providerType: AgentSessionProviders.Local });
    activeSessionObs.set(session2, void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
  });
  test("creates new terminal when switching to a different path", async () => {
    const worktree1 = URI.file("/worktree1");
    const worktree2 = URI.file("/worktree2");
    activeSessionObs.set(makeAgentSession({ worktree: worktree1, providerType: AgentSessionProviders.Local }), void 0);
    await tick();
    activeSessionObs.set(makeAgentSession({ worktree: worktree2, providerType: AgentSessionProviders.Local }), void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 2);
    assert.strictEqual(createdTerminals[1].cwd.fsPath, worktree2.fsPath);
  });
  test("ensureTerminal creates terminal and sets it active", async () => {
    const cwd = URI.file("/test-cwd");
    await contribution.ensureTerminal(cwd, false);
    assert.strictEqual(createdTerminals.length, 1);
    assert.strictEqual(createdTerminals[0].cwd.fsPath, cwd.fsPath);
    assert.strictEqual(activeInstanceSet.length, 1);
    assert.strictEqual(focusCalls, 0);
  });
  test("ensureTerminal focuses when requested", async () => {
    const cwd = URI.file("/test-cwd");
    await contribution.ensureTerminal(cwd, true);
    assert.strictEqual(focusCalls, 1);
  });
  test("ensureTerminal reuses existing terminal for same path", async () => {
    const cwd = URI.file("/test-cwd");
    await contribution.ensureTerminal(cwd, false);
    await contribution.ensureTerminal(cwd, false);
    assert.strictEqual(createdTerminals.length, 1, "should reuse the existing terminal");
    assert.strictEqual(activeInstanceSet.length, 2, "should set active instance both times");
  });
  test("ensureTerminal creates new terminal for different path", async () => {
    await contribution.ensureTerminal(URI.file("/cwd1"), false);
    await contribution.ensureTerminal(URI.file("/cwd2"), false);
    assert.strictEqual(createdTerminals.length, 2);
  });
  test("ensureTerminal path comparison is case-insensitive", async () => {
    await contribution.ensureTerminal(URI.file("/Test/CWD"), false);
    await contribution.ensureTerminal(URI.file("/test/cwd"), false);
    assert.strictEqual(createdTerminals.length, 1, "should match case-insensitively");
  });
  test("closes terminals when session is archived", async () => {
    const worktreeUri = URI.file("/worktree");
    await contribution.ensureTerminal(worktreeUri, false);
    assert.strictEqual(createdTerminals.length, 1);
    const session = makeAgentSession({
      isArchived: true,
      worktreePath: worktreeUri.fsPath
    });
    onDidChangeSessionArchivedState.fire(session);
    assert.strictEqual(disposedInstances.length, 1);
  });
  test("does not close terminals when session is not archived", async () => {
    const worktreeUri = URI.file("/worktree");
    await contribution.ensureTerminal(worktreeUri, false);
    const session = makeAgentSession({
      isArchived: false,
      worktreePath: worktreeUri.fsPath
    });
    onDidChangeSessionArchivedState.fire(session);
    assert.strictEqual(disposedInstances.length, 0);
  });
  test("does not close terminals when archived session has no worktreePath", async () => {
    const worktreeUri = URI.file("/worktree");
    await contribution.ensureTerminal(worktreeUri, false);
    const session = makeAgentSession({ isArchived: true });
    onDidChangeSessionArchivedState.fire(session);
    assert.strictEqual(disposedInstances.length, 0);
  });
  test("cleans up path mapping when terminal is disposed externally", async () => {
    const cwd = URI.file("/test-cwd");
    await contribution.ensureTerminal(cwd, false);
    assert.strictEqual(createdTerminals.length, 1);
    const instanceId = activeInstanceSet[0];
    const instance = terminalInstances.get(instanceId);
    onDidDisposeInstance.fire(instance);
    await contribution.ensureTerminal(cwd, false);
    assert.strictEqual(createdTerminals.length, 2, "should create a new terminal after the old one was disposed");
  });
  test("prefers worktree over repository for local agent session", async () => {
    const worktreeUri = URI.file("/worktree");
    const repoUri = URI.file("/repo");
    const session = makeAgentSession({
      worktree: worktreeUri,
      repository: repoUri,
      providerType: AgentSessionProviders.Local
    });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals[0].cwd.fsPath, worktreeUri.fsPath);
  });
  test("falls back to repository when worktree is undefined for agent session", async () => {
    const repoUri = URI.file("/repo");
    const session = makeAgentSession({
      repository: repoUri,
      providerType: AgentSessionProviders.Local
    });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals[0].cwd.fsPath, repoUri.fsPath);
  });
  test("does not use repository for cloud agent session when worktree exists", async () => {
    const worktreeUri = URI.file("/worktree");
    const repoUri = URI.file("/repo");
    const session = makeAgentSession({
      worktree: worktreeUri,
      repository: repoUri,
      providerType: AgentSessionProviders.Cloud
    });
    activeSessionObs.set(session, void 0);
    await tick();
    assert.strictEqual(createdTerminals[0].cwd.fsPath, worktreeUri.fsPath);
  });
  test("switching back to a previously used path reuses the existing terminal", async () => {
    const cwd1 = URI.file("/cwd1");
    const cwd2 = URI.file("/cwd2");
    activeSessionObs.set(makeAgentSession({ worktree: cwd1, providerType: AgentSessionProviders.Local }), void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 1);
    activeSessionObs.set(makeAgentSession({ worktree: cwd2, providerType: AgentSessionProviders.Local }), void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 2);
    activeSessionObs.set(makeAgentSession({ worktree: cwd1, providerType: AgentSessionProviders.Local }), void 0);
    await tick();
    assert.strictEqual(createdTerminals.length, 2, "should reuse the terminal for cwd1");
  });
});
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
__name(tick, "tick");
//# sourceMappingURL=sessionsTerminalContribution.test.js.map
