var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { isWindows } from "../../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { ContextMenuService } from "../../../../../../platform/contextview/browser/contextMenuService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { MockContextKeyService } from "../../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ILayoutService } from "../../../../../../platform/layout/browser/layoutService.js";
import { ILoggerService, NullLogService } from "../../../../../../platform/log/common/log.js";
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../../platform/theme/test/common/testThemeService.js";
import { writeP } from "../../../../terminal/browser/terminalTestHelpers.js";
import { XtermTerminal } from "../../../../terminal/browser/xterm/xtermTerminal.js";
import { BufferContentTracker } from "../../browser/bufferContentTracker.js";
import { ILifecycleService } from "../../../../../services/lifecycle/common/lifecycle.js";
import { TestLayoutService, TestLifecycleService } from "../../../../../test/browser/workbenchTestServices.js";
import { TestLoggerService } from "../../../../../test/common/workbenchTestServices.js";
import { IAccessibilitySignalService } from "../../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ITerminalConfigurationService } from "../../../../terminal/browser/terminal.js";
import { TerminalConfigurationService } from "../../../../terminal/browser/terminalConfigurationService.js";
const defaultTerminalConfig = {
  fontFamily: "monospace",
  fontWeight: "normal",
  fontWeightBold: "normal",
  gpuAcceleration: "off",
  scrollback: 1e3,
  fastScrollSensitivity: 2,
  mouseWheelScrollSensitivity: 1,
  unicodeVersion: "6"
};
suite("Buffer Content Tracker", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let configurationService;
  let themeService;
  let xterm;
  let capabilities;
  let bufferTracker;
  const prompt = "vscode-git:(prompt/more-tests)";
  const promptPlusData = "vscode-git:(prompt/more-tests) some data";
  setup(async () => {
    configurationService = new TestConfigurationService({ terminal: { integrated: defaultTerminalConfig } });
    instantiationService = store.add(new TestInstantiationService());
    themeService = new TestThemeService();
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(ITerminalConfigurationService, store.add(instantiationService.createInstance(TerminalConfigurationService)));
    instantiationService.stub(IThemeService, themeService);
    instantiationService.stub(ITerminalLogService, new NullLogService());
    instantiationService.stub(ILoggerService, store.add(new TestLoggerService()));
    instantiationService.stub(IContextMenuService, store.add(instantiationService.createInstance(ContextMenuService)));
    instantiationService.stub(ILifecycleService, store.add(new TestLifecycleService()));
    instantiationService.stub(IContextKeyService, store.add(new MockContextKeyService()));
    instantiationService.stub(IAccessibilitySignalService, {
      playSignal: /* @__PURE__ */ __name(async () => {
      }, "playSignal"),
      isSoundEnabled(signal) {
        return false;
      }
    });
    instantiationService.stub(ILayoutService, new TestLayoutService());
    capabilities = store.add(new TerminalCapabilityStore());
    if (!isWindows) {
      capabilities.add(1, null);
    }
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(instantiationService.createInstance(XtermTerminal, void 0, TerminalCtor, {
      cols: 80,
      rows: 30,
      xtermColorProvider: { getBackgroundColor: /* @__PURE__ */ __name(() => void 0, "getBackgroundColor") },
      capabilities,
      disableShellIntegrationReporting: true
    }, void 0));
    const container = document.createElement("div");
    xterm.raw.open(container);
    configurationService = new TestConfigurationService({ terminal: { integrated: { tabs: { separator: " - ", title: "${cwd}", description: "${cwd}" } } } });
    bufferTracker = store.add(instantiationService.createInstance(BufferContentTracker, xterm));
  });
  test("should not clear the prompt line", async () => {
    assert.strictEqual(bufferTracker.lines.length, 0);
    await writeP(xterm.raw, prompt);
    xterm.clearBuffer();
    bufferTracker.update();
    assert.deepStrictEqual(bufferTracker.lines, [prompt]);
  });
  test("repeated updates should not change the content", async () => {
    assert.strictEqual(bufferTracker.lines.length, 0);
    await writeP(xterm.raw, prompt);
    bufferTracker.update();
    assert.deepStrictEqual(bufferTracker.lines, [prompt]);
    bufferTracker.update();
    assert.deepStrictEqual(bufferTracker.lines, [prompt]);
    bufferTracker.update();
    assert.deepStrictEqual(bufferTracker.lines, [prompt]);
  });
  test("should add lines in the viewport and scrollback", async () => {
    await writeAndAssertBufferState(promptPlusData, 38, xterm.raw, bufferTracker);
  });
  test("should add lines in the viewport and full scrollback", async () => {
    await writeAndAssertBufferState(promptPlusData, 1030, xterm.raw, bufferTracker);
  });
  test("should refresh viewport", async () => {
    await writeAndAssertBufferState(promptPlusData, 6, xterm.raw, bufferTracker);
    await writeP(xterm.raw, "\x1B[3Ainserteddata");
    bufferTracker.update();
    assert.deepStrictEqual(bufferTracker.lines, [promptPlusData, promptPlusData, `${promptPlusData}inserteddata`, promptPlusData, promptPlusData, promptPlusData]);
  });
  test("should refresh viewport with full scrollback", async () => {
    const content = `${prompt}\r
`.repeat(1030).trimEnd();
    await writeP(xterm.raw, content);
    bufferTracker.update();
    await writeP(xterm.raw, "\x1B[4Ainsertion");
    bufferTracker.update();
    const expected = content.split("\r\n");
    expected[1025] = `${prompt}insertion`;
    assert.deepStrictEqual(bufferTracker.lines[1025], `${prompt}insertion`);
  });
  test("should cap the size of the cached lines, removing old lines in favor of new lines", async () => {
    const content = `${prompt}\r
`.repeat(1036).trimEnd();
    await writeP(xterm.raw, content);
    bufferTracker.update();
    const expected = content.split("\r\n");
    for (let i = 0; i < 6; i++) {
      expected.pop();
    }
    await writeP(xterm.raw, "\x1B[2Ainsertion");
    bufferTracker.update();
    expected[1027] = `${prompt}insertion`;
    assert.strictEqual(bufferTracker.lines.length, expected.length);
    assert.deepStrictEqual(bufferTracker.lines, expected);
  });
});
async function writeAndAssertBufferState(data, rows, terminal, bufferTracker) {
  const content = `${data}\r
`.repeat(rows).trimEnd();
  await writeP(terminal, content);
  bufferTracker.update();
  assert.strictEqual(bufferTracker.lines.length, rows);
  assert.deepStrictEqual(bufferTracker.lines, content.split("\r\n"));
}
__name(writeAndAssertBufferState, "writeAndAssertBufferState");
//# sourceMappingURL=bufferContentTracker.test.js.map
