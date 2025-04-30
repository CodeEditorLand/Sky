var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, strictEqual } from "assert";
import { equals } from "../../../../../../base/common/arrays.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ContextMenuService } from "../../../../../../platform/contextview/browser/contextMenuService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILogService, NullLogService } from "../../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../../platform/theme/test/common/testThemeService.js";
import { IViewDescriptorService } from "../../../../../common/views.js";
import { TerminalLinkManager } from "../../browser/terminalLinkManager.js";
import { TestViewDescriptorService } from "../../../../terminal/test/browser/xterm/xtermTerminal.test.js";
import { TestStorageService } from "../../../../../test/common/workbenchTestServices.js";
import { TerminalLinkResolver } from "../../browser/terminalLinkResolver.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
const defaultTerminalConfig = {
  fontFamily: "monospace",
  fontWeight: "normal",
  fontWeightBold: "normal",
  gpuAcceleration: "off",
  scrollback: 1e3,
  fastScrollSensitivity: 2,
  mouseWheelScrollSensitivity: 1,
  unicodeVersion: "11",
  wordSeparators: " ()[]{}',\"`\u2500\u2018\u2019\u201C\u201D"
};
class TestLinkManager extends TerminalLinkManager {
  static {
    __name(this, "TestLinkManager");
  }
  async _getLinksForType(y, type) {
    switch (type) {
      case "word":
        return this._links?.wordLinks?.[y] ? [this._links?.wordLinks?.[y]] : void 0;
      case "url":
        return this._links?.webLinks?.[y] ? [this._links?.webLinks?.[y]] : void 0;
      case "localFile":
        return this._links?.fileLinks?.[y] ? [this._links?.fileLinks?.[y]] : void 0;
    }
  }
  setLinks(links) {
    this._links = links;
  }
}
suite("TerminalLinkManager", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let configurationService;
  let themeService;
  let viewDescriptorService;
  let xterm;
  let linkManager;
  setup(async () => {
    configurationService = new TestConfigurationService({
      editor: {
        fastScrollSensitivity: 2,
        mouseWheelScrollSensitivity: 1
      },
      terminal: {
        integrated: defaultTerminalConfig
      }
    });
    themeService = new TestThemeService();
    viewDescriptorService = new TestViewDescriptorService();
    instantiationService = store.add(new TestInstantiationService());
    instantiationService.stub(IContextMenuService, store.add(instantiationService.createInstance(ContextMenuService)));
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(IStorageService, store.add(new TestStorageService()));
    instantiationService.stub(IThemeService, themeService);
    instantiationService.stub(IViewDescriptorService, viewDescriptorService);
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 }));
    linkManager = store.add(instantiationService.createInstance(TestLinkManager, xterm, upcastPartial({
      get initialCwd() {
        return "";
      }
    }), {
      get(capability) {
        return void 0;
      }
    }, instantiationService.createInstance(TerminalLinkResolver)));
  });
  suite("registerExternalLinkProvider", () => {
    test("should not leak disposables if the link manager is already disposed", () => {
      linkManager.externalProvideLinksCb = async () => void 0;
      linkManager.dispose();
      linkManager.externalProvideLinksCb = async () => void 0;
    });
  });
  suite("getLinks and open recent link", () => {
    test("should return no links", async () => {
      const links = await linkManager.getLinks();
      equals(links.viewport.webLinks, []);
      equals(links.viewport.wordLinks, []);
      equals(links.viewport.fileLinks, []);
      const webLink = await linkManager.openRecentLink("url");
      strictEqual(webLink, void 0);
      const fileLink = await linkManager.openRecentLink("localFile");
      strictEqual(fileLink, void 0);
    });
    test("should return word links in order", async () => {
      const link1 = {
        range: {
          start: { x: 1, y: 1 },
          end: { x: 14, y: 1 }
        },
        text: "1_\u6211\u662F\u5B66\u751F.txt",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      const link2 = {
        range: {
          start: { x: 1, y: 1 },
          end: { x: 14, y: 1 }
        },
        text: "2_\u6211\u662F\u5B66\u751F.txt",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      linkManager.setLinks({ wordLinks: [link1, link2] });
      const links = await linkManager.getLinks();
      deepStrictEqual(links.viewport.wordLinks?.[0].text, link2.text);
      deepStrictEqual(links.viewport.wordLinks?.[1].text, link1.text);
      const webLink = await linkManager.openRecentLink("url");
      strictEqual(webLink, void 0);
      const fileLink = await linkManager.openRecentLink("localFile");
      strictEqual(fileLink, void 0);
    });
    test("should return web links in order", async () => {
      const link1 = {
        range: { start: { x: 5, y: 1 }, end: { x: 40, y: 1 } },
        text: "https://foo.bar/[this is foo site 1]",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      const link2 = {
        range: { start: { x: 5, y: 2 }, end: { x: 40, y: 2 } },
        text: "https://foo.bar/[this is foo site 2]",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      linkManager.setLinks({ webLinks: [link1, link2] });
      const links = await linkManager.getLinks();
      deepStrictEqual(links.viewport.webLinks?.[0].text, link2.text);
      deepStrictEqual(links.viewport.webLinks?.[1].text, link1.text);
      const webLink = await linkManager.openRecentLink("url");
      strictEqual(webLink, link2);
      const fileLink = await linkManager.openRecentLink("localFile");
      strictEqual(fileLink, void 0);
    });
    test("should return file links in order", async () => {
      const link1 = {
        range: { start: { x: 1, y: 1 }, end: { x: 32, y: 1 } },
        text: "file:///C:/users/test/file_1.txt",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      const link2 = {
        range: { start: { x: 1, y: 2 }, end: { x: 32, y: 2 } },
        text: "file:///C:/users/test/file_2.txt",
        activate: /* @__PURE__ */ __name(() => Promise.resolve(""), "activate")
      };
      linkManager.setLinks({ fileLinks: [link1, link2] });
      const links = await linkManager.getLinks();
      deepStrictEqual(links.viewport.fileLinks?.[0].text, link2.text);
      deepStrictEqual(links.viewport.fileLinks?.[1].text, link1.text);
      const webLink = await linkManager.openRecentLink("url");
      strictEqual(webLink, void 0);
      linkManager.setLinks({ fileLinks: [link2] });
      const fileLink = await linkManager.openRecentLink("localFile");
      strictEqual(fileLink, link2);
    });
  });
});
function upcastPartial(v) {
  return v;
}
__name(upcastPartial, "upcastPartial");
//# sourceMappingURL=terminalLinkManager.test.js.map
