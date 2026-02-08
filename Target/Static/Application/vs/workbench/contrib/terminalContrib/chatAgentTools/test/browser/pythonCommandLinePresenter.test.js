import { ok, strictEqual } from "assert";
import { extractPythonCommand, PythonCommandLinePresenter } from "../../browser/tools/commandLinePresenter/pythonCommandLinePresenter.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
suite("extractPythonCommand", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("basic extraction", () => {
    test("should extract simple python -c command with double quotes", () => {
      const result = extractPythonCommand(
        `python -c "print('hello')"`,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, `print('hello')`);
    });
    test("should extract python3 -c command", () => {
      const result = extractPythonCommand(
        `python3 -c "print('hello')"`,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, `print('hello')`);
    });
    test("should return undefined for non-python commands", () => {
      const result = extractPythonCommand(
        "echo hello",
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, void 0);
    });
    test("should return undefined for python without -c flag", () => {
      const result = extractPythonCommand(
        "python script.py",
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, void 0);
    });
    test("should extract python -c with single quotes", () => {
      const result = extractPythonCommand(
        `python -c 'print("hello")'`,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, 'print("hello")');
    });
    test("should extract python3 -c with single quotes", () => {
      const result = extractPythonCommand(
        `python3 -c 'x = 1; print(x)'`,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, "x = 1; print(x)");
    });
  });
  suite("quote unescaping - Bash", () => {
    test("should unescape backslash-escaped quotes in bash", () => {
      const result = extractPythonCommand(
        'python -c "print(\\"hello\\")"',
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, 'print("hello")');
    });
    test("should handle multiple escaped quotes", () => {
      const result = extractPythonCommand(
        'python -c "x = \\"hello\\"; print(x)"',
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, 'x = "hello"; print(x)');
    });
  });
  suite("single quotes - literal content", () => {
    test("should preserve content literally in single quotes (no unescaping)", () => {
      const result = extractPythonCommand(
        `python -c 'print(\\"hello\\")'`,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, 'print(\\"hello\\")');
    });
    test("should handle single quotes in PowerShell", () => {
      const result = extractPythonCommand(
        `python -c 'print("hello")'`,
        "pwsh",
        1
        /* OperatingSystem.Windows */
      );
      strictEqual(result, 'print("hello")');
    });
    test("should extract multiline code in single quotes", () => {
      const code = `python -c 'for i in range(3):
    print(i)'`;
      const result = extractPythonCommand(
        code,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, `for i in range(3):
    print(i)`);
    });
  });
  suite("quote unescaping - PowerShell", () => {
    test("should unescape backtick-escaped quotes in PowerShell", () => {
      const result = extractPythonCommand(
        'python -c "print(`"hello`")"',
        "pwsh",
        1
        /* OperatingSystem.Windows */
      );
      strictEqual(result, 'print("hello")');
    });
    test("should handle multiple backtick-escaped quotes", () => {
      const result = extractPythonCommand(
        'python -c "x = `"hello`"; print(x)"',
        "pwsh",
        1
        /* OperatingSystem.Windows */
      );
      strictEqual(result, 'x = "hello"; print(x)');
    });
    test("should not unescape backslash quotes in PowerShell", () => {
      const result = extractPythonCommand(
        'python -c "print(\\"hello\\")"',
        "pwsh",
        1
        /* OperatingSystem.Windows */
      );
      strictEqual(result, 'print(\\"hello\\")');
    });
  });
  suite("multiline code", () => {
    test("should extract multiline python code", () => {
      const code = `python -c "for i in range(3):
    print(i)"`;
      const result = extractPythonCommand(
        code,
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, `for i in range(3):
    print(i)`);
    });
  });
  suite("edge cases", () => {
    test("should handle code with trailing whitespace trimmed", () => {
      const result = extractPythonCommand(
        'python -c "  print(1)  "',
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, "print(1)");
    });
    test("should return undefined for empty code", () => {
      const result = extractPythonCommand(
        'python -c ""',
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, void 0);
    });
    test("should return undefined when quotes are unmatched", () => {
      const result = extractPythonCommand(
        'python -c "print(1)',
        "bash",
        3
        /* OperatingSystem.Linux */
      );
      strictEqual(result, void 0);
    });
  });
});
suite("PythonCommandLinePresenter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const presenter = new PythonCommandLinePresenter();
  test("should return Python presentation for python -c command", () => {
    const result = presenter.present({
      commandLine: { forDisplay: `python -c "print('hello')"` },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    ok(result);
    strictEqual(result.commandLine, `print('hello')`);
    strictEqual(result.language, "python");
    strictEqual(result.languageDisplayName, "Python");
  });
  test("should return Python presentation for python3 -c command", () => {
    const result = presenter.present({
      commandLine: { forDisplay: `python3 -c 'x = 1; print(x)'` },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    ok(result);
    strictEqual(result.commandLine, "x = 1; print(x)");
    strictEqual(result.language, "python");
    strictEqual(result.languageDisplayName, "Python");
  });
  test("should return undefined for non-python commands", () => {
    const result = presenter.present({
      commandLine: { forDisplay: "echo hello" },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    strictEqual(result, void 0);
  });
  test("should return undefined for regular python script execution", () => {
    const result = presenter.present({
      commandLine: { forDisplay: "python script.py" },
      shell: "bash",
      os: 3
      /* OperatingSystem.Linux */
    });
    strictEqual(result, void 0);
  });
  test("should handle PowerShell backtick escaping", () => {
    const result = presenter.present({
      commandLine: { forDisplay: 'python -c "print(`"hello`")"' },
      shell: "pwsh",
      os: 1
      /* OperatingSystem.Windows */
    });
    ok(result);
    strictEqual(result.commandLine, 'print("hello")');
  });
});
//# sourceMappingURL=pythonCommandLinePresenter.test.js.map
