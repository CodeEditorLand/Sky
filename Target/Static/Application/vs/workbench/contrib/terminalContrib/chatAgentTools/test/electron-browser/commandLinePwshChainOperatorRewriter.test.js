var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual } from "assert";
import { Schemas } from "../../../../../../base/common/network.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ITreeSitterLibraryService } from "../../../../../../editor/common/services/treeSitter/treeSitterLibraryService.js";
import { FileService } from "../../../../../../platform/files/common/fileService.js";
import { NullLogService } from "../../../../../../platform/log/common/log.js";
import { TreeSitterLibraryService } from "../../../../../services/treeSitter/browser/treeSitterLibraryService.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { TestIPCFileSystemProvider } from "../../../../../test/electron-browser/workbenchTestServices.js";
import { CommandLinePwshChainOperatorRewriter } from "../../browser/tools/commandLineRewriter/commandLinePwshChainOperatorRewriter.js";
import { TreeSitterCommandParser } from "../../browser/treeSitterCommandParser.js";
suite("CommandLinePwshChainOperatorRewriter", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let parser;
  let rewriter;
  function createRewriteOptions(command, shell, os) {
    return {
      commandLine: command,
      cwd: void 0,
      shell,
      os
    };
  }
  __name(createRewriteOptions, "createRewriteOptions");
  setup(() => {
    const fileService = store.add(new FileService(new NullLogService()));
    const fileSystemProvider = new TestIPCFileSystemProvider();
    store.add(fileService.registerProvider(Schemas.file, fileSystemProvider));
    instantiationService = workbenchInstantiationService({
      fileService: /* @__PURE__ */ __name(() => fileService, "fileService")
    }, store);
    const treeSitterLibraryService = store.add(instantiationService.createInstance(TreeSitterLibraryService));
    treeSitterLibraryService.isTest = true;
    instantiationService.stub(ITreeSitterLibraryService, treeSitterLibraryService);
    parser = store.add(instantiationService.createInstance(TreeSitterCommandParser));
    rewriter = store.add(instantiationService.createInstance(CommandLinePwshChainOperatorRewriter, parser));
  });
  suite("PowerShell: && -> ;", () => {
    async function t(originalCommandLine, expectedResult) {
      const options = createRewriteOptions(
        originalCommandLine,
        "pwsh",
        1
        /* OperatingSystem.Windows */
      );
      const result = await rewriter.rewrite(options);
      strictEqual(result?.rewritten, expectedResult);
      if (expectedResult !== void 0) {
        strictEqual(result?.reasoning, "&& re-written to ;");
      }
    }
    __name(t, "t");
    test("should rewrite && to ; in PowerShell commands", () => t("echo hello && echo world", "echo hello ; echo world"));
    test("should rewrite multiple && to ; in PowerShell commands", () => t("echo first && echo second && echo third", "echo first ; echo second ; echo third"));
    test("should handle complex commands with && operators", () => t('npm install && npm test && echo "build complete"', 'npm install ; npm test ; echo "build complete"'));
    test("should work with Windows PowerShell shell identifier", () => t("Get-Process && Stop-Process", "Get-Process ; Stop-Process"));
    test("should preserve existing semicolons", () => t("echo hello; echo world && echo final", "echo hello; echo world ; echo final"));
    test("should not rewrite strings", () => t('echo "&&" && Write-Host "&& &&" && "&&"', 'echo "&&" ; Write-Host "&& &&" ; "&&"'));
  });
});
//# sourceMappingURL=commandLinePwshChainOperatorRewriter.test.js.map
