var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual, deepStrictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { CommandLineSandboxRewriter } from "../../browser/tools/commandLineRewriter/commandLineSandboxRewriter.js";
import { ITerminalSandboxService } from "../../common/terminalSandboxService.js";
suite("CommandLineSandboxRewriter", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  const stubSandboxService = /* @__PURE__ */ __name((overrides = {}) => {
    instantiationService = workbenchInstantiationService({}, store);
    instantiationService.stub(ITerminalSandboxService, {
      _serviceBrand: void 0,
      isEnabled: /* @__PURE__ */ __name(async () => false, "isEnabled"),
      wrapCommand: /* @__PURE__ */ __name((command) => command, "wrapCommand"),
      getSandboxConfigPath: /* @__PURE__ */ __name(async () => "/tmp/sandbox.json", "getSandboxConfigPath"),
      getTempDir: /* @__PURE__ */ __name(() => void 0, "getTempDir"),
      setNeedsForceUpdateConfigFile: /* @__PURE__ */ __name(() => {
      }, "setNeedsForceUpdateConfigFile"),
      ...overrides
    });
  }, "stubSandboxService");
  function createRewriteOptions(command) {
    return {
      commandLine: command,
      cwd: void 0,
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    };
  }
  __name(createRewriteOptions, "createRewriteOptions");
  test("returns undefined when sandbox is disabled", async () => {
    stubSandboxService();
    const rewriter = store.add(instantiationService.createInstance(CommandLineSandboxRewriter));
    const result = await rewriter.rewrite(createRewriteOptions("echo hello"));
    strictEqual(result, void 0);
  });
  test("returns undefined when sandbox config is unavailable", async () => {
    stubSandboxService({
      isEnabled: /* @__PURE__ */ __name(async () => true, "isEnabled"),
      wrapCommand: /* @__PURE__ */ __name((command) => `wrapped:${command}`, "wrapCommand"),
      getSandboxConfigPath: /* @__PURE__ */ __name(async () => void 0, "getSandboxConfigPath")
    });
    const rewriter = store.add(instantiationService.createInstance(CommandLineSandboxRewriter));
    const result = await rewriter.rewrite(createRewriteOptions("echo hello"));
    strictEqual(result, void 0);
  });
  test("wraps command when sandbox is enabled and config exists", async () => {
    const calls = [];
    stubSandboxService({
      isEnabled: /* @__PURE__ */ __name(async () => true, "isEnabled"),
      wrapCommand: /* @__PURE__ */ __name((command) => {
        calls.push("wrapCommand");
        return `wrapped:${command}`;
      }, "wrapCommand"),
      getSandboxConfigPath: /* @__PURE__ */ __name(async () => {
        calls.push("getSandboxConfigPath");
        return "/tmp/sandbox.json";
      }, "getSandboxConfigPath")
    });
    const rewriter = store.add(instantiationService.createInstance(CommandLineSandboxRewriter));
    const result = await rewriter.rewrite(createRewriteOptions("echo hello"));
    strictEqual(result?.rewritten, "wrapped:echo hello");
    strictEqual(result?.reasoning, "Wrapped command for sandbox execution");
    deepStrictEqual(calls, ["getSandboxConfigPath", "wrapCommand"]);
  });
});
//# sourceMappingURL=commandLineSandboxRewriter.test.js.map
