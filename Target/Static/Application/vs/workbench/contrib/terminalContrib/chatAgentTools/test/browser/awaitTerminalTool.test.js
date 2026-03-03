var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as assert from "assert";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { CancellationTokenSource } from "../../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { DeferredPromise } from "../../../../../../base/common/async.js";
import { runWithFakedTimers } from "../../../../../../base/test/common/timeTravelScheduler.js";
import { AwaitTerminalTool } from "../../browser/tools/awaitTerminalTool.js";
import { RunInTerminalTool } from "../../browser/tools/runInTerminalTool.js";
suite("AwaitTerminalTool", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let tool;
  let cts;
  let originalGetExecution;
  setup(() => {
    tool = store.add(new AwaitTerminalTool());
    cts = store.add(new CancellationTokenSource());
    originalGetExecution = RunInTerminalTool.getExecution;
  });
  teardown(() => {
    RunInTerminalTool.getExecution = originalGetExecution;
  });
  function createInvocation(id, timeout) {
    return {
      parameters: { id, timeout },
      callId: "test-call",
      context: { sessionId: "test-session" },
      toolId: "await_terminal",
      tokenBudget: 1e3,
      isComplete: /* @__PURE__ */ __name(() => false, "isComplete"),
      isCancellationRequested: false
    };
  }
  __name(createInvocation, "createInvocation");
  function createMockExecution(completionPromise, output) {
    return {
      completionPromise,
      instance: {},
      getOutput: /* @__PURE__ */ __name(() => output, "getOutput")
    };
  }
  __name(createMockExecution, "createMockExecution");
  test("returns error when terminal ID does not exist", async () => {
    RunInTerminalTool.getExecution = () => void 0;
    const result = await tool.invoke(createInvocation("invalid-id", 0), async () => 0, { report: /* @__PURE__ */ __name(() => {
    }, "report") }, cts.token);
    assert.strictEqual(result.content.length, 1);
    assert.strictEqual(result.content[0].kind, "text");
    assert.ok(result.content[0].value.includes("No active terminal execution found"));
    assert.ok(result.content[0].value.includes("invalid-id"));
  });
  test("returns output and exit code when terminal completes", async () => {
    const deferred = new DeferredPromise();
    RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "hello world");
    const resultPromise = tool.invoke(createInvocation("test-terminal", 0), async () => 0, { report: /* @__PURE__ */ __name(() => {
    }, "report") }, cts.token);
    deferred.complete({ output: "hello world", exitCode: 0 });
    const result = await resultPromise;
    assert.strictEqual(result.content.length, 1);
    assert.strictEqual(result.content[0].kind, "text");
    const value = result.content[0].value;
    assert.ok(value.includes("completed"));
    assert.ok(value.includes("exit code: 0"));
    assert.ok(value.includes("hello world"));
    assert.strictEqual(result.toolMetadata?.exitCode, 0);
  });
  test("returns timeout status when terminal times out", async () => {
    return runWithFakedTimers({}, async () => {
      const deferred = new DeferredPromise();
      RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "partial output");
      const result = await tool.invoke(createInvocation("test-terminal", 100), async () => 0, { report: /* @__PURE__ */ __name(() => {
      }, "report") }, cts.token);
      assert.strictEqual(result.content.length, 1);
      assert.strictEqual(result.content[0].kind, "text");
      const value = result.content[0].value;
      assert.ok(value.includes("timed out"));
      assert.ok(value.includes("100ms"));
      assert.ok(value.includes("partial output"));
      assert.strictEqual(result.toolMetadata?.timedOut, true);
      assert.strictEqual(result.toolMetadata?.exitCode, void 0);
      deferred.complete({ output: "partial output", exitCode: 0 });
    });
  });
  test("timeout=0 waits indefinitely for completion", async () => {
    const deferred = new DeferredPromise();
    RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "final output");
    const resultPromise = tool.invoke(createInvocation("test-terminal", 0), async () => 0, { report: /* @__PURE__ */ __name(() => {
    }, "report") }, cts.token);
    deferred.complete({ output: "final output", exitCode: 42 });
    const result = await resultPromise;
    assert.strictEqual(result.content.length, 1);
    const value = result.content[0].value;
    assert.ok(value.includes("completed"));
    assert.ok(value.includes("exit code: 42"));
    assert.strictEqual(result.toolMetadata?.exitCode, 42);
  });
  test("negative timeout is treated as no timeout", async () => {
    const deferred = new DeferredPromise();
    RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "output");
    const resultPromise = tool.invoke(createInvocation("test-terminal", -100), async () => 0, { report: /* @__PURE__ */ __name(() => {
    }, "report") }, cts.token);
    deferred.complete({ output: "output", exitCode: 0 });
    const result = await resultPromise;
    const value = result.content[0].value;
    assert.ok(value.includes("completed"));
    assert.ok(!value.includes("timed out"));
  });
  test("throws CancellationError when token is cancelled", async () => {
    const deferred = new DeferredPromise();
    RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "output");
    const resultPromise = tool.invoke(createInvocation("test-terminal", 0), async () => 0, { report: /* @__PURE__ */ __name(() => {
    }, "report") }, cts.token);
    cts.cancel();
    await assert.rejects(resultPromise, CancellationError);
  });
  test("throws CancellationError when token is cancelled with timeout", async () => {
    return runWithFakedTimers({}, async () => {
      const deferred = new DeferredPromise();
      RunInTerminalTool.getExecution = () => createMockExecution(deferred.p, "output");
      const resultPromise = tool.invoke(createInvocation("test-terminal", 5e3), async () => 0, { report: /* @__PURE__ */ __name(() => {
      }, "report") }, cts.token);
      cts.cancel();
      await assert.rejects(resultPromise, CancellationError);
    });
  });
});
//# sourceMappingURL=awaitTerminalTool.test.js.map
