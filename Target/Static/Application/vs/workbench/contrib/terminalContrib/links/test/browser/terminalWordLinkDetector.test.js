var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IProductService } from "../../../../../../platform/product/common/productService.js";
import { TerminalWordLinkDetector } from "../../browser/terminalWordLinkDetector.js";
import { assertLinkHelper } from "./linkTestUtils.js";
import { TestProductService } from "../../../../../test/common/workbenchTestServices.js";
import { TestXtermLogger } from "../../../../../../platform/terminal/test/common/terminalTestHelpers.js";
suite("Workbench - TerminalWordLinkDetector", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let configurationService;
  let detector;
  let xterm;
  let instantiationService;
  setup(async () => {
    instantiationService = store.add(new TestInstantiationService());
    configurationService = new TestConfigurationService();
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: "" } });
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.set(IProductService, TestProductService);
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30, logger: TestXtermLogger }));
    detector = store.add(instantiationService.createInstance(TerminalWordLinkDetector, xterm));
  });
  async function assertLink(text, expected) {
    await assertLinkHelper(
      text,
      expected,
      detector,
      "Search"
      /* TerminalBuiltinLinkType.Search */
    );
  }
  __name(assertLink, "assertLink");
  suite("should link words as defined by wordSeparators", () => {
    test('" ()[]"', async () => {
      await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " ()[]" } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await assertLink("foo", [{ range: [[1, 1], [3, 1]], text: "foo" }]);
      await assertLink(" foo ", [{ range: [[2, 1], [4, 1]], text: "foo" }]);
      await assertLink("(foo)", [{ range: [[2, 1], [4, 1]], text: "foo" }]);
      await assertLink("[foo]", [{ range: [[2, 1], [4, 1]], text: "foo" }]);
      await assertLink("{foo}", [{ range: [[1, 1], [5, 1]], text: "{foo}" }]);
    });
    test('" "', async () => {
      await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await assertLink("foo", [{ range: [[1, 1], [3, 1]], text: "foo" }]);
      await assertLink(" foo ", [{ range: [[2, 1], [4, 1]], text: "foo" }]);
      await assertLink("(foo)", [{ range: [[1, 1], [5, 1]], text: "(foo)" }]);
      await assertLink("[foo]", [{ range: [[1, 1], [5, 1]], text: "[foo]" }]);
      await assertLink("{foo}", [{ range: [[1, 1], [5, 1]], text: "{foo}" }]);
    });
    test('" []"', async () => {
      await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " []" } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await assertLink("aabbccdd.txt ", [{ range: [[1, 1], [12, 1]], text: "aabbccdd.txt" }]);
      await assertLink(" aabbccdd.txt ", [{ range: [[2, 1], [13, 1]], text: "aabbccdd.txt" }]);
      await assertLink(" [aabbccdd.txt] ", [{ range: [[3, 1], [14, 1]], text: "aabbccdd.txt" }]);
    });
  });
  suite("should ignore powerline symbols", () => {
    for (let i = 57520; i <= 57535; i++) {
      test(`\\u${i.toString(16)}`, async () => {
        await assertLink(`${String.fromCharCode(i)}foo${String.fromCharCode(i)}`, [{ range: [[2, 1], [4, 1]], text: "foo" }]);
      });
    }
  });
  test.skip("should support wide characters", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " []" } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("\u6211\u662F\u5B66\u751F.txt ", [{ range: [[1, 1], [12, 1]], text: "\u6211\u662F\u5B66\u751F.txt" }]);
    await assertLink(" \u6211\u662F\u5B66\u751F.txt ", [{ range: [[2, 1], [13, 1]], text: "\u6211\u662F\u5B66\u751F.txt" }]);
    await assertLink(" [\u6211\u662F\u5B66\u751F.txt] ", [{ range: [[3, 1], [14, 1]], text: "\u6211\u662F\u5B66\u751F.txt" }]);
  });
  test("should support multiple link results", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("foo bar", [
      { range: [[1, 1], [3, 1]], text: "foo" },
      { range: [[5, 1], [7, 1]], text: "bar" }
    ]);
  });
  test("should remove trailing colon in the link results", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("foo:5:6: bar:0:32:", [
      { range: [[1, 1], [7, 1]], text: "foo:5:6" },
      { range: [[10, 1], [17, 1]], text: "bar:0:32" }
    ]);
  });
  test("should support wrapping", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd", [
      { range: [[1, 1], [41, 3]], text: "fsdjfsdkfjslkdfjskdfjsldkfjsdlkfjslkdjfskldjflskdfjskldjflskdfjsdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd" }
    ]);
  });
  test("should support wrapping with multiple links", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("fsdjfsdkfjslkdfjskdfjsldkfj sdlkfjslkdjfskldjflskdfjskldjflskdfj sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd", [
      { range: [[1, 1], [27, 1]], text: "fsdjfsdkfjslkdfjskdfjsldkfj" },
      { range: [[29, 1], [64, 1]], text: "sdlkfjslkdjfskldjflskdfjskldjflskdfj" },
      { range: [[66, 1], [43, 3]], text: "sdklfjsdklfjsldkfjsdlkfjsdlkfjsdlkfjsldkfjslkdfjsdlkfjsldkfjsdlkfjskdfjsldkfjsdlkfjslkdfjsdlkfjsldkfjsldkfjsldkfjslkdfjsdlkfjslkdfjsdklfsd" }
    ]);
  });
  test("does not return any links for empty text", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("", []);
  });
  test("should support file scheme links", async () => {
    await configurationService.setUserConfiguration("terminal", { integrated: { wordSeparators: " " } });
    configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
    await assertLink("file:///C:/users/test/file.txt ", [{ range: [[1, 1], [30, 1]], text: "file:///C:/users/test/file.txt" }]);
    await assertLink("file:///C:/users/test/file.txt:1:10 ", [{ range: [[1, 1], [35, 1]], text: "file:///C:/users/test/file.txt:1:10" }]);
  });
});
//# sourceMappingURL=terminalWordLinkDetector.test.js.map
