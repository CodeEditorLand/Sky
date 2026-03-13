var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual } from "assert";
import { isWindows } from "../../../../../../base/common/platform.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { CommandLineCdPrefixRewriter } from "../../browser/tools/commandLineRewriter/commandLineCdPrefixRewriter.js";
suite("CommandLineCdPrefixRewriter", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let rewriter;
  function createRewriteOptions(command, cwd, shell, os) {
    return {
      commandLine: command,
      cwd,
      shell,
      os
    };
  }
  __name(createRewriteOptions, "createRewriteOptions");
  setup(() => {
    instantiationService = workbenchInstantiationService({}, store);
    rewriter = store.add(instantiationService.createInstance(CommandLineCdPrefixRewriter));
  });
  suite("cd <cwd> && <suffix> -> <suffix>", () => {
    (!isWindows ? suite : suite.skip)("Posix", () => {
      const cwd = URI.file("/test/workspace");
      function t(commandLine, shell, expectedResult) {
        const options = createRewriteOptions(
          commandLine,
          cwd,
          shell,
          3
          /* OperatingSystem.Linux */
        );
        const result = rewriter.rewrite(options);
        strictEqual(result?.rewritten, expectedResult);
        if (expectedResult !== void 0) {
          strictEqual(result?.reasoning, "Removed redundant cd command");
        }
      }
      __name(t, "t");
      test("should return undefined when no cd prefix pattern matches", () => t("echo hello world", "bash", void 0));
      test("should return undefined when cd pattern does not have suffix", () => t("cd /some/path", "bash", void 0));
      test("should rewrite command with ; separator when directory matches cwd", () => t("cd /test/workspace; npm test", "pwsh", "npm test"));
      test("should rewrite command with && separator when directory matches cwd", () => t("cd /test/workspace && npm install", "bash", "npm install"));
      test("should rewrite command when the path is wrapped in double quotes", () => t('cd "/test/workspace" && npm install', "bash", "npm install"));
      test("should not rewrite command when directory does not match cwd", () => t("cd /different/path && npm install", "bash", void 0));
      test("should handle commands with complex suffixes", () => t('cd /test/workspace && npm install && npm test && echo "done"', "bash", 'npm install && npm test && echo "done"'));
      test("should ignore any trailing forward slash", () => t("cd /test/workspace/ && npm install", "bash", "npm install"));
    });
    (isWindows ? suite : suite.skip)("Windows", () => {
      const cwd = URI.file("C:\\test\\workspace");
      function t(commandLine, shell, expectedResult) {
        const options = createRewriteOptions(
          commandLine,
          cwd,
          shell,
          1
          /* OperatingSystem.Windows */
        );
        const result = rewriter.rewrite(options);
        strictEqual(result?.rewritten, expectedResult);
        if (expectedResult !== void 0) {
          strictEqual(result?.reasoning, "Removed redundant cd command");
        }
      }
      __name(t, "t");
      test("should ignore any trailing back slash", () => t("cd c:\\test\\workspace\\ && npm install", "cmd", "npm install"));
      test("should rewrite command with && separator when directory matches cwd", () => t("cd C:\\test\\workspace && npm test", "cmd", "npm test"));
      test("should rewrite command with ; separator when directory matches cwd - PowerShell style", () => t("cd C:\\test\\workspace; npm test", "pwsh", "npm test"));
      test("should not rewrite when cwd differs from cd path", () => t("cd C:\\different\\path && npm test", "cmd", void 0));
      test("should handle case-insensitive comparison on Windows", () => t("cd c:\\test\\workspace && npm test", "cmd", "npm test"));
      test("should handle quoted paths", () => t('cd "C:\\test\\workspace" && npm test', "cmd", "npm test"));
      test("should handle cd /d flag when directory matches cwd", () => t("cd /d C:\\test\\workspace && echo hello", "pwsh", "echo hello"));
      test("should handle cd /d flag with quoted paths when directory matches cwd", () => t('cd /d "C:\\test\\workspace" && echo hello', "pwsh", "echo hello"));
      test("should not rewrite cd /d when directory does not match cwd", () => t("cd /d C:\\different\\path ; echo hello", "pwsh", void 0));
      test("should handle cd /d flag with semicolon separator", () => t("cd /d C:\\test\\workspace; echo hello", "pwsh", "echo hello"));
    });
  });
});
//# sourceMappingURL=commandLineCdPrefixRewriter.test.js.map
