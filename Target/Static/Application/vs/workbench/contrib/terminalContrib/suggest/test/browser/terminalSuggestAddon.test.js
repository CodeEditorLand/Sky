import { strictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { isInlineCompletionSupported } from "../../browser/terminalSuggestAddon.js";
suite("Terminal Suggest Addon - Inline Completion, Shell Type Support", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("should return true for supported shell types", () => {
    strictEqual(isInlineCompletionSupported(
      "bash"
      /* PosixShellType.Bash */
    ), true);
    strictEqual(isInlineCompletionSupported(
      "zsh"
      /* PosixShellType.Zsh */
    ), true);
    strictEqual(isInlineCompletionSupported(
      "fish"
      /* PosixShellType.Fish */
    ), true);
    strictEqual(isInlineCompletionSupported(
      "pwsh"
      /* GeneralShellType.PowerShell */
    ), true);
    strictEqual(isInlineCompletionSupported(
      "gitbash"
      /* WindowsShellType.GitBash */
    ), true);
  });
  test("should return false for unsupported shell types", () => {
    strictEqual(isInlineCompletionSupported(
      "nu"
      /* GeneralShellType.NuShell */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "julia"
      /* GeneralShellType.Julia */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "node"
      /* GeneralShellType.Node */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "python"
      /* GeneralShellType.Python */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "xonsh"
      /* GeneralShellType.Xonsh */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "sh"
      /* PosixShellType.Sh */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "csh"
      /* PosixShellType.Csh */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "ksh"
      /* PosixShellType.Ksh */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "cmd"
      /* WindowsShellType.CommandPrompt */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "wsl"
      /* WindowsShellType.Wsl */
    ), false);
    strictEqual(isInlineCompletionSupported(
      "python"
      /* GeneralShellType.Python */
    ), false);
    strictEqual(isInlineCompletionSupported(void 0), false);
  });
});
//# sourceMappingURL=terminalSuggestAddon.test.js.map
