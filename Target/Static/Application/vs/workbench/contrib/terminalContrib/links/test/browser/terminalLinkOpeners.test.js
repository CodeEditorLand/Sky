var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual } from "assert";
import { Schemas } from "../../../../../../base/common/network.js";
import { URI } from "../../../../../../base/common/uri.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { FileService } from "../../../../../../platform/files/common/fileService.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILogService, NullLogService } from "../../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { CommandDetectionCapability } from "../../../../../../platform/terminal/common/capabilities/commandDetectionCapability.js";
import { TerminalLocalFileLinkOpener, TerminalLocalFolderInWorkspaceLinkOpener, TerminalSearchLinkOpener } from "../../browser/terminalLinkOpeners.js";
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../../../services/environment/common/environmentService.js";
import { TestContextService } from "../../../../../test/common/workbenchTestServices.js";
import { ISearchService } from "../../../../../services/search/common/search.js";
import { SearchService } from "../../../../../services/search/common/searchService.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { TerminalCommand } from "../../../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js";
class TestCommandDetectionCapability extends CommandDetectionCapability {
  static {
    __name(this, "TestCommandDetectionCapability");
  }
  setCommands(commands) {
    this._commands = commands;
  }
}
class TestFileService extends FileService {
  static {
    __name(this, "TestFileService");
  }
  constructor() {
    super(...arguments);
    this._files = "*";
  }
  async stat(resource) {
    if (this._files === "*" || this._files.some((e) => e.toString() === resource.toString())) {
      return { isFile: true, isDirectory: false, isSymbolicLink: false };
    }
    throw new Error("ENOENT");
  }
  setFiles(files) {
    this._files = files;
  }
}
class TestSearchService extends SearchService {
  static {
    __name(this, "TestSearchService");
  }
  async fileSearch(query) {
    return this._searchResult;
  }
  setSearchResult(result) {
    this._searchResult = result;
  }
}
class TestTerminalSearchLinkOpener extends TerminalSearchLinkOpener {
  static {
    __name(this, "TestTerminalSearchLinkOpener");
  }
  setFileQueryBuilder(value) {
    this._fileQueryBuilder = value;
  }
}
suite("Workbench - TerminalLinkOpeners", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let fileService;
  let searchService;
  let activationResult;
  let xterm;
  setup(async () => {
    instantiationService = store.add(new TestInstantiationService());
    fileService = store.add(new TestFileService(new NullLogService()));
    searchService = store.add(new TestSearchService(null, null, null, null, null, null, null));
    instantiationService.set(IFileService, fileService);
    instantiationService.set(ILogService, new NullLogService());
    instantiationService.set(ISearchService, searchService);
    instantiationService.set(IWorkspaceContextService, new TestContextService());
    instantiationService.stub(ITerminalLogService, new NullLogService());
    instantiationService.stub(IWorkbenchEnvironmentService, {
      remoteAuthority: void 0
    });
    activationResult = void 0;
    instantiationService.stub(IQuickInputService, {
      quickAccess: {
        show(link) {
          activationResult = { link, source: "search" };
        }
      }
    });
    instantiationService.stub(IEditorService, {
      async openEditor(editor) {
        activationResult = {
          source: "editor",
          link: editor.resource?.toString()
        };
        if (editor.options?.selection && (editor.options.selection.startColumn !== 1 || editor.options.selection.startLineNumber !== 1)) {
          activationResult.selection = editor.options.selection;
        }
      }
    });
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true }));
  });
  suite("TerminalSearchLinkOpener", () => {
    let opener;
    let capabilities;
    let commandDetection;
    let localFileOpener;
    setup(() => {
      capabilities = store.add(new TerminalCapabilityStore());
      commandDetection = store.add(instantiationService.createInstance(TestCommandDetectionCapability, xterm));
      capabilities.add(2, commandDetection);
    });
    test("should open single exact match against cwd when searching if it exists when command detection cwd is available", async () => {
      localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
      const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
      opener = instantiationService.createInstance(
        TestTerminalSearchLinkOpener,
        capabilities,
        "/initial/cwd",
        localFileOpener,
        localFolderOpener,
        () => 3
        /* OperatingSystem.Linux */
      );
      commandDetection.setCommands([new TerminalCommand(xterm, {
        command: "",
        commandLineConfidence: "low",
        exitCode: 0,
        commandStartLineContent: "",
        markProperties: {},
        isTrusted: true,
        cwd: "/initial/cwd",
        timestamp: 0,
        duration: 0,
        executedX: void 0,
        startX: void 0,
        marker: {
          line: 0
        }
      })]);
      fileService.setFiles([
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/bar.txt" })
      ]);
      await opener.open({
        text: "foo/bar.txt",
        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
        type: "Search"
        /* TerminalBuiltinLinkType.Search */
      });
      deepStrictEqual(activationResult, {
        link: "file:///initial/cwd/foo/bar.txt",
        source: "editor"
      });
    });
    test("should open single exact match against cwd for paths containing a separator when searching if it exists, even when command detection isn't available", async () => {
      localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
      const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
      opener = instantiationService.createInstance(
        TestTerminalSearchLinkOpener,
        capabilities,
        "/initial/cwd",
        localFileOpener,
        localFolderOpener,
        () => 3
        /* OperatingSystem.Linux */
      );
      fileService.setFiles([
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/bar.txt" })
      ]);
      await opener.open({
        text: "foo/bar.txt",
        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
        type: "Search"
        /* TerminalBuiltinLinkType.Search */
      });
      deepStrictEqual(activationResult, {
        link: "file:///initial/cwd/foo/bar.txt",
        source: "editor"
      });
    });
    test("should open single exact match against any folder for paths not containing a separator when there is a single search result, even when command detection isn't available", async () => {
      localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
      const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
      opener = instantiationService.createInstance(
        TestTerminalSearchLinkOpener,
        capabilities,
        "/initial/cwd",
        localFileOpener,
        localFolderOpener,
        () => 3
        /* OperatingSystem.Linux */
      );
      capabilities.remove(
        2
        /* TerminalCapability.CommandDetection */
      );
      opener.setFileQueryBuilder({ file: /* @__PURE__ */ __name(() => null, "file") });
      fileService.setFiles([
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/baz.txt" })
      ]);
      searchService.setSearchResult({
        messages: [],
        results: [
          { resource: URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }) }
        ]
      });
      await opener.open({
        text: "bar.txt",
        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
        type: "Search"
        /* TerminalBuiltinLinkType.Search */
      });
      deepStrictEqual(activationResult, {
        link: "file:///initial/cwd/foo/bar.txt",
        source: "editor"
      });
    });
    test("should open single exact match against any folder for paths not containing a separator when there are multiple search results, even when command detection isn't available", async () => {
      localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
      const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
      opener = instantiationService.createInstance(
        TestTerminalSearchLinkOpener,
        capabilities,
        "/initial/cwd",
        localFileOpener,
        localFolderOpener,
        () => 3
        /* OperatingSystem.Linux */
      );
      capabilities.remove(
        2
        /* TerminalCapability.CommandDetection */
      );
      opener.setFileQueryBuilder({ file: /* @__PURE__ */ __name(() => null, "file") });
      fileService.setFiles([
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.test.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/bar.test.txt" })
      ]);
      searchService.setSearchResult({
        messages: [],
        results: [
          { resource: URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }) },
          { resource: URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.test.txt" }) },
          { resource: URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/bar.test.txt" }) }
        ]
      });
      await opener.open({
        text: "bar.txt",
        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
        type: "Search"
        /* TerminalBuiltinLinkType.Search */
      });
      deepStrictEqual(activationResult, {
        link: "file:///initial/cwd/foo/bar.txt",
        source: "editor"
      });
    });
    test("should not open single exact match for paths not containing a when command detection isn't available", async () => {
      localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
      const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
      opener = instantiationService.createInstance(
        TestTerminalSearchLinkOpener,
        capabilities,
        "/initial/cwd",
        localFileOpener,
        localFolderOpener,
        () => 3
        /* OperatingSystem.Linux */
      );
      fileService.setFiles([
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo/bar.txt" }),
        URI.from({ scheme: Schemas.file, path: "/initial/cwd/foo2/bar.txt" })
      ]);
      await opener.open({
        text: "bar.txt",
        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
        type: "Search"
        /* TerminalBuiltinLinkType.Search */
      });
      deepStrictEqual(activationResult, {
        link: "bar.txt",
        source: "search"
      });
    });
    suite("macOS/Linux", () => {
      setup(() => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
      });
      test("should apply the cwd to the link only when the file exists and cwdDetection is enabled", async () => {
        const cwd = "/Users/home/folder";
        const absoluteFile = "/Users/home/folder/file.txt";
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: absoluteFile }),
          URI.from({ scheme: Schemas.file, path: "/Users/home/folder/other/file.txt" })
        ]);
        commandDetection.setCommands([new TerminalCommand(xterm, {
          command: "",
          commandLineConfidence: "low",
          isTrusted: true,
          cwd,
          timestamp: 0,
          duration: 0,
          executedX: void 0,
          startX: void 0,
          marker: {
            line: 0
          },
          exitCode: 0,
          commandStartLineContent: "",
          markProperties: {}
        })]);
        await opener.open({
          text: "file.txt",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///Users/home/folder/file.txt",
          source: "editor"
        });
        commandDetection.setCommands([]);
        opener.setFileQueryBuilder({ file: /* @__PURE__ */ __name(() => null, "file") });
        searchService.setSearchResult({
          messages: [],
          results: [
            { resource: URI.from({ scheme: Schemas.file, path: "file:///Users/home/folder/file.txt" }) },
            { resource: URI.from({ scheme: Schemas.file, path: "file:///Users/home/folder/other/file.txt" }) }
          ]
        });
        await opener.open({
          text: "file.txt",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file.txt",
          source: "search"
        });
      });
      test("should extract column and/or line numbers from links in a workspace containing spaces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "/space folder",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "/space folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove trailing periods", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "/folder",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor"
        });
        await opener.open({
          text: "./foo/bar.txt:10:5.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove grepped lines", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "/folder",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove grepped lines incl singular spaces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "/folder",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract line numbers from links and remove ruby stack traces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "/folder",
          localFileOpener,
          localFolderOpener,
          () => 3
          /* OperatingSystem.Linux */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "/folder/foo/bar.rb" })
        ]);
        await opener.open({
          text: "./foo/bar.rb:30:in `<main>`",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///folder/foo/bar.rb",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 30,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
    });
    suite("Windows", () => {
      setup(() => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
      });
      test("should apply the cwd to the link only when the file exists and cwdDetection is enabled", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:\\Users",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        const cwd = "c:\\Users\\home\\folder";
        const absoluteFile = "c:\\Users\\home\\folder\\file.txt";
        fileService.setFiles([
          URI.file("/c:/Users/home/folder/file.txt")
        ]);
        commandDetection.setCommands([new TerminalCommand(xterm, {
          exitCode: 0,
          commandStartLineContent: "",
          markProperties: {},
          command: "",
          commandLineConfidence: "low",
          isTrusted: true,
          cwd,
          executedX: void 0,
          startX: void 0,
          timestamp: 0,
          duration: 0,
          marker: {
            line: 0
          }
        })]);
        await opener.open({
          text: "file.txt",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/Users/home/folder/file.txt",
          source: "editor"
        });
        commandDetection.setCommands([]);
        opener.setFileQueryBuilder({ file: /* @__PURE__ */ __name(() => null, "file") });
        searchService.setSearchResult({
          messages: [],
          results: [
            { resource: URI.file(absoluteFile) },
            { resource: URI.file("/c:/Users/home/folder/other/file.txt") }
          ]
        });
        await opener.open({
          text: "file.txt",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file.txt",
          source: "search"
        });
      });
      test("should extract column and/or line numbers from links in a workspace containing spaces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:/space folder",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "c:/space folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10:5",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/space%20folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove trailing periods", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:/folder",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "c:/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor"
        });
        await opener.open({
          text: "./foo/bar.txt:10:5.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor"
        });
        await opener.open({
          text: ".\\foo\\bar.txt:2:5.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 2,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:2.",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 2,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove grepped lines", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:/folder",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "c:/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10:5:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10:import { ILoveVSCode } from './foo/bar.ts';",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract column and/or line numbers from links and remove grepped lines incl singular spaces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:/folder",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "c:/folder/foo/bar.txt" })
        ]);
        await opener.open({
          text: "./foo/bar.txt:10:5: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: "./foo/bar.txt:10: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10:5: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 5,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.txt:10: ",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.txt",
          source: "editor",
          selection: {
            startColumn: 1,
            startLineNumber: 10,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
      test("should extract line numbers from links and remove ruby stack traces", async () => {
        localFileOpener = instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderOpener = instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        opener = instantiationService.createInstance(
          TestTerminalSearchLinkOpener,
          capabilities,
          "c:/folder",
          localFileOpener,
          localFolderOpener,
          () => 1
          /* OperatingSystem.Windows */
        );
        fileService.setFiles([
          URI.from({ scheme: Schemas.file, path: "c:/folder/foo/bar.rb" })
        ]);
        await opener.open({
          text: "./foo/bar.rb:30:in `<main>`",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.rb",
          source: "editor",
          selection: {
            startColumn: 1,
            // Since Ruby doesn't appear to put columns in stack traces, this should be 1
            startLineNumber: 30,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
        await opener.open({
          text: ".\\foo\\bar.rb:30:in `<main>`",
          bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
          type: "Search"
          /* TerminalBuiltinLinkType.Search */
        });
        deepStrictEqual(activationResult, {
          link: "file:///c%3A/folder/foo/bar.rb",
          source: "editor",
          selection: {
            startColumn: 1,
            // Since Ruby doesn't appear to put columns in stack traces, this should be 1
            startLineNumber: 30,
            endColumn: void 0,
            endLineNumber: void 0
          }
        });
      });
    });
  });
});
//# sourceMappingURL=terminalLinkOpeners.test.js.map
