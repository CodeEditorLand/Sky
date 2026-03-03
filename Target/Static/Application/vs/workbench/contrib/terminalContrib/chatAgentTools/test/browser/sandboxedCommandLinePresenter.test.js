var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ok, strictEqual } from "assert";
import { SandboxedCommandLinePresenter } from "../../browser/tools/commandLinePresenter/sandboxedCommandLinePresenter.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { ITerminalSandboxService } from "../../common/terminalSandboxService.js";
suite("SandboxedCommandLinePresenter", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  const createPresenter = /* @__PURE__ */ __name((enabled = true) => {
    instantiationService = workbenchInstantiationService({}, store);
    instantiationService.stub(ITerminalSandboxService, {
      _serviceBrand: void 0,
      isEnabled: /* @__PURE__ */ __name(async () => enabled, "isEnabled"),
      wrapCommand: /* @__PURE__ */ __name((command) => command, "wrapCommand"),
      getSandboxConfigPath: /* @__PURE__ */ __name(async () => "/tmp/sandbox.json", "getSandboxConfigPath"),
      getTempDir: /* @__PURE__ */ __name(() => void 0, "getTempDir"),
      setNeedsForceUpdateConfigFile: /* @__PURE__ */ __name(() => {
      }, "setNeedsForceUpdateConfigFile")
    });
    return instantiationService.createInstance(SandboxedCommandLinePresenter);
  }, "createPresenter");
  test("should return command line when sandboxing is enabled", async () => {
    const presenter = createPresenter();
    const commandLine = 'ELECTRON_RUN_AS_NODE=1 "/path/to/electron" "/path/to/srt/cli.js" TMPDIR=/tmp --settings "/tmp/sandbox.json" -c "echo hello"';
    const result = await presenter.present({
      commandLine: { forDisplay: commandLine },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    ok(result);
    strictEqual(result.commandLine, commandLine);
    strictEqual(result.language, void 0);
    strictEqual(result.languageDisplayName, void 0);
  });
  test("should return command line for non-sandboxed command when enabled", async () => {
    const presenter = createPresenter();
    const commandLine = "echo hello";
    const result = await presenter.present({
      commandLine: { forDisplay: commandLine },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    ok(result);
    strictEqual(result.commandLine, commandLine);
    strictEqual(result.language, void 0);
    strictEqual(result.languageDisplayName, void 0);
  });
  test("should return undefined when sandboxing is disabled", async () => {
    const presenter = createPresenter(false);
    const result = await presenter.present({
      commandLine: { forDisplay: 'ELECTRON_RUN_AS_NODE=1 "/path/to/electron" "/path/to/srt/cli.js" TMPDIR=/tmp --settings "/tmp/sandbox.json" -c "echo hello"' },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    strictEqual(result, void 0);
  });
});
//# sourceMappingURL=sandboxedCommandLinePresenter.test.js.map
