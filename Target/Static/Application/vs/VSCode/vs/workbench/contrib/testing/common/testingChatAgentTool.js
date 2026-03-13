var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { disposableTimeout, RunOnceScheduler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { basename, isAbsolute } from "../../../../base/common/path.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ILanguageModelToolsService, ToolDataSource } from "../../chat/common/tools/languageModelToolsService.js";
import { TestId } from "./testId.js";
import { getTotalCoveragePercent } from "./testCoverage.js";
import { TestingContextKeys } from "./testingContextKeys.js";
import { collectTestStateCounts, getTestProgressText } from "./testingProgressMessages.js";
import { isFailedState } from "./testingStates.js";
import { ITestResultService } from "./testResultService.js";
import { ITestService, testsInFile, waitForTestToBeIdle } from "./testService.js";
import { Position } from "../../../../editor/common/core/position.js";
import { ITestProfileService } from "./testProfileService.js";
let TestingChatAgentToolContribution = class TestingChatAgentToolContribution2 extends Disposable {
  static {
    __name(this, "TestingChatAgentToolContribution");
  }
  static {
    this.ID = "workbench.contrib.testing.chatAgentTool";
  }
  constructor(instantiationService, toolsService, contextKeyService) {
    super();
    const runTestsTool = instantiationService.createInstance(RunTestTool);
    this._register(toolsService.registerTool(RunTestTool.DEFINITION, runTestsTool));
    this._register(toolsService.executeToolSet.addTool(RunTestTool.DEFINITION));
    contextKeyService.createKey("chat.coreTestFailureToolEnabled", true).set(true);
  }
};
TestingChatAgentToolContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, ILanguageModelToolsService),
  __param(2, IContextKeyService)
], TestingChatAgentToolContribution);
let RunTestTool = class RunTestTool2 {
  static {
    __name(this, "RunTestTool");
  }
  static {
    this.ID = "runTests";
  }
  static {
    this.DEFINITION = {
      id: this.ID,
      toolReferenceName: "runTests",
      legacyToolReferenceFullNames: ["runTests"],
      when: TestingContextKeys.hasRunnableTests,
      displayName: "Run tests",
      modelDescription: 'Runs unit tests in files. Use this tool if the user asks to run tests or when you want to validate changes using unit tests, and prefer using this tool instead of the terminal tool. When possible, always try to provide `files` paths containing the relevant unit tests in order to avoid unnecessarily long test runs. This tool outputs detailed information about the results of the test run. Set mode="coverage" to also collect coverage and optionally provide coverageFiles for focused reporting.',
      icon: Codicon.beaker,
      inputSchema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: "Absolute paths to the test files to run. If not provided, all test files will be run."
          },
          testNames: {
            type: "array",
            items: { type: "string" },
            description: "An array of test names to run. Depending on the context, test names defined in code may be strings or the names of functions or classes containing the test cases. If not provided, all tests in the files will be run."
          },
          mode: {
            type: "string",
            enum: ["run", "coverage"],
            description: 'Execution mode: "run" (default) runs tests normally, "coverage" collects coverage.'
          },
          coverageFiles: {
            type: "array",
            items: { type: "string" },
            description: 'When mode="coverage": absolute file paths to include detailed coverage info for. Only the first matching file will be summarized.'
          }
        }
      },
      userDescription: localize("runTestTool.userDescription", "Run unit tests (optionally with coverage)"),
      source: ToolDataSource.Internal,
      tags: [
        "vscode_editing_with_tests",
        "enable_other_tool_copilot_readFile",
        "enable_other_tool_copilot_listDirectory",
        "enable_other_tool_copilot_findFiles",
        "enable_other_tool_copilot_runTests",
        "enable_other_tool_copilot_runTestsWithCoverage",
        "enable_other_tool_copilot_testFailure"
      ]
    };
  }
  constructor(_testService, _uriIdentityService, _workspaceContextService, _testResultService, _testProfileService) {
    this._testService = _testService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    this._testResultService = _testResultService;
    this._testProfileService = _testProfileService;
  }
  async invoke(invocation, countTokens, progress, token) {
    const params = invocation.parameters;
    const mode = params.mode === "coverage" ? "coverage" : "run";
    let group = mode === "coverage" ? 8 : 2;
    const coverageFiles = mode === "coverage" ? params.coverageFiles && params.coverageFiles.length ? params.coverageFiles : void 0 : void 0;
    const testFiles = await this._getFileTestsToRun(params, progress);
    const testCases = await this._getTestCasesToRun(params, testFiles, progress);
    if (!testCases.length) {
      return {
        content: [{ kind: "text", value: "No tests found in the files. Ensure the correct absolute paths are passed to the tool." }],
        toolResultError: localize("runTestTool.noTests", "No tests found in the files")
      };
    }
    progress.report({ message: localize("runTestTool.invoke.progress", "Starting test run...") });
    if (group === 8) {
      if (!testCases.some(
        (tc) => this._testProfileService.capabilitiesForTest(tc.item) & 8
        /* TestRunProfileBitset.Coverage */
      )) {
        group = 2;
      }
    }
    const result = await this._captureTestResult(testCases, group, token);
    if (!result) {
      return {
        content: [{ kind: "text", value: "No test run was started. Instruct the user to ensure their test runner is correctly configured" }],
        toolResultError: localize("runTestTool.noRunStarted", "No test run was started. This may be an issue with your test runner or extension.")
      };
    }
    await this._monitorRunProgress(result, progress, token);
    if (token.isCancellationRequested) {
      this._testService.cancelTestRun(result.id);
      return {
        content: [{ kind: "text", value: localize("runTestTool.invoke.cancelled", "Test run was cancelled.") }],
        toolResultMessage: localize("runTestTool.invoke.cancelled", "Test run was cancelled.")
      };
    }
    const summary = await this._buildSummary(result, mode, coverageFiles);
    const content = [{ kind: "text", value: summary }];
    return {
      content,
      toolResultMessage: getTestProgressText(collectTestStateCounts(false, [result]))
    };
  }
  async _buildSummary(result, mode, coverageFiles) {
    const failures = result.counts[
      6
      /* TestResultState.Errored */
    ] + result.counts[
      4
      /* TestResultState.Failed */
    ];
    let str = `<summary passed=${result.counts[
      3
      /* TestResultState.Passed */
    ]} failed=${failures} />
`;
    if (failures !== 0) {
      str += await this._getFailureDetails(result);
    }
    if (mode === "coverage") {
      str += await this._getCoverageSummary(result, coverageFiles);
    }
    return str;
  }
  async _getCoverageSummary(result, coverageFiles) {
    if (!coverageFiles || !coverageFiles.length) {
      return "";
    }
    for (const task of result.tasks) {
      const coverage = task.coverage.get();
      if (!coverage) {
        continue;
      }
      const normalized = coverageFiles.map((file) => URI.file(file).fsPath);
      const coveredFilesMap = /* @__PURE__ */ new Map();
      for (const file of coverage.getAllFiles().values()) {
        coveredFilesMap.set(file.uri.fsPath, file);
      }
      for (const path of normalized) {
        const file = coveredFilesMap.get(path);
        if (!file) {
          continue;
        }
        let summary = `<coverage task=${JSON.stringify(task.name || "")}>
`;
        const pct = getTotalCoveragePercent(file.statement, file.branch, file.declaration) * 100;
        summary += `<firstUncoveredFile path=${JSON.stringify(path)} statementsCovered=${file.statement.covered} statementsTotal=${file.statement.total}`;
        if (file.branch) {
          summary += ` branchesCovered=${file.branch.covered} branchesTotal=${file.branch.total}`;
        }
        if (file.declaration) {
          summary += ` declarationsCovered=${file.declaration.covered} declarationsTotal=${file.declaration.total}`;
        }
        summary += ` percent=${pct.toFixed(2)}`;
        try {
          const details = await file.details();
          for (const detail of details) {
            if (detail.count || !detail.location) {
              continue;
            }
            let startLine;
            let endLine;
            if (Position.isIPosition(detail.location)) {
              startLine = endLine = detail.location.lineNumber;
            } else {
              startLine = detail.location.startLineNumber;
              endLine = detail.location.endLineNumber;
            }
            summary += ` firstUncoveredStart=${startLine} firstUncoveredEnd=${endLine}`;
            break;
          }
        } catch {
        }
        summary += ` />
`;
        summary += `</coverage>
`;
        return summary;
      }
    }
    return "";
  }
  async _getFailureDetails(result) {
    let str = "";
    let hadMessages = false;
    for (const failure of result.tests) {
      if (!isFailedState(failure.ownComputedState)) {
        continue;
      }
      const [, ...testPath] = TestId.split(failure.item.extId);
      const testName = testPath.pop();
      str += `<testFailure name=${JSON.stringify(testName)} path=${JSON.stringify(testPath.join(" > "))}>
`;
      for (const task of failure.tasks) {
        for (const message of task.messages.filter(
          (m) => m.type === 0
          /* TestMessageType.Error */
        )) {
          hadMessages = true;
          if (message.expected !== void 0 && message.actual !== void 0) {
            str += `<expectedOutput>
${message.expected}
</expectedOutput>
`;
            str += `<actualOutput>
${message.actual}
</actualOutput>
`;
          } else {
            const messageText = typeof message.message === "string" ? message.message : message.message.value;
            str += `<message>
${messageText}
</message>
`;
          }
          if (message.stackTrace && message.stackTrace.length > 0) {
            for (const frame of message.stackTrace.slice(0, 10)) {
              if (frame.uri && frame.position) {
                str += `<stackFrame path="${frame.uri.fsPath}" line="${frame.position.lineNumber}" col="${frame.position.column}" />
`;
              } else if (frame.uri) {
                str += `<stackFrame path="${frame.uri.fsPath}">${frame.label}</stackFrame>
`;
              } else {
                str += `<stackFrame>${frame.label}</stackFrame>
`;
              }
            }
          }
          if (message.location) {
            str += `<location path="${message.location.uri.fsPath}" line="${message.location.range.startLineNumber}" col="${message.location.range.startColumn}" />
`;
          }
        }
      }
      str += `</testFailure>
`;
    }
    if (!hadMessages) {
      const output = result.tasks.map((t) => t.output.getRange(0, t.output.length).toString().trim()).join("\n");
      if (output) {
        str += `<output>
${output}
</output>
`;
      }
    }
    return str;
  }
  /** Updates the UI progress as the test runs, resolving when the run is finished. */
  async _monitorRunProgress(result, progress, token) {
    const store = new DisposableStore();
    const update = /* @__PURE__ */ __name(() => {
      const counts = collectTestStateCounts(!result.completedAt, [result]);
      const text = getTestProgressText(counts);
      progress.report({ message: text, progress: counts.runSoFar / counts.totalWillBeRun });
    }, "update");
    const throttler = store.add(new RunOnceScheduler(update, 500));
    return new Promise((resolve) => {
      store.add(result.onChange(() => {
        if (!throttler.isScheduled) {
          throttler.schedule();
        }
      }));
      store.add(token.onCancellationRequested(() => {
        this._testService.cancelTestRun(result.id);
        resolve();
      }));
      store.add(result.onComplete(() => {
        update();
        resolve();
      }));
    }).finally(() => store.dispose());
  }
  /**
   * Captures the test result. This is a little tricky because some extensions
   * trigger an 'out of bound' test run, so we actually wait for the first
   * test run to come in that contains one or more tasks and treat that as the
   * one we're looking for.
   */
  async _captureTestResult(testCases, group, token) {
    const store = new DisposableStore();
    const onDidTimeout = store.add(new Emitter());
    return new Promise((resolve) => {
      store.add(onDidTimeout.event(() => {
        resolve(void 0);
      }));
      store.add(this._testResultService.onResultsChanged((ev) => {
        if ("started" in ev) {
          store.add(ev.started.onNewTask(() => {
            store.dispose();
            resolve(ev.started);
          }));
        }
      }));
      this._testService.runTests({
        group,
        tests: testCases,
        preserveFocus: true
      }, token).then(() => {
        if (!store.isDisposed) {
          store.add(disposableTimeout(() => onDidTimeout.fire(), 5e3));
        }
      });
    }).finally(() => store.dispose());
  }
  /** Filters the test files to individual test cases based on the provided parameters. */
  async _getTestCasesToRun(params, tests, progress) {
    if (!params.testNames?.length) {
      return tests;
    }
    progress.report({ message: localize("runTestTool.invoke.filterProgress", "Filtering tests...") });
    const testNames = params.testNames.map((t) => t.toLowerCase().trim());
    const filtered = [];
    const doFilter = /* @__PURE__ */ __name(async (test) => {
      const name = test.item.label.toLowerCase().trim();
      if (testNames.some((tn) => name.includes(tn))) {
        filtered.push(test);
        return;
      }
      if (test.expand === 1) {
        await this._testService.collection.expand(test.item.extId, 1);
      }
      await waitForTestToBeIdle(this._testService, test);
      await Promise.all([...test.children].map(async (id) => {
        const item = this._testService.collection.getNodeById(id);
        if (item) {
          await doFilter(item);
        }
      }));
    }, "doFilter");
    await Promise.all(tests.map(doFilter));
    return filtered;
  }
  /** Gets the file tests to run based on the provided parameters. */
  async _getFileTestsToRun(params, progress) {
    if (!params.files?.length) {
      return [...this._testService.collection.rootItems];
    }
    progress.report({ message: localize("runTestTool.invoke.filesProgress", "Discovering tests...") });
    const firstWorkspaceFolder = this._workspaceContextService.getWorkspace().folders.at(0)?.uri;
    const uris = params.files.map((f) => {
      if (isAbsolute(f)) {
        return URI.file(f);
      } else if (firstWorkspaceFolder) {
        return URI.joinPath(firstWorkspaceFolder, f);
      } else {
        return void 0;
      }
    }).filter(isDefined);
    const tests = [];
    for (const uri of uris) {
      for await (const files of testsInFile(this._testService, this._uriIdentityService, uri, void 0, false)) {
        for (const file of files) {
          tests.push(file);
        }
      }
    }
    return tests;
  }
  prepareToolInvocation(context, token) {
    const params = context.parameters;
    const title = localize("runTestTool.confirm.title", "Allow test run?");
    const inFiles = params.files?.map((f) => "`" + basename(f) + "`");
    return Promise.resolve({
      invocationMessage: localize("runTestTool.confirm.invocation", "Running tests..."),
      confirmationMessages: {
        title,
        message: inFiles?.length ? new MarkdownString().appendMarkdown(localize("runTestTool.confirm.message", "The model wants to run tests in {0}.", inFiles.join(", "))) : localize("runTestTool.confirm.all", "The model wants to run all tests."),
        allowAutoConfirm: true
      }
    });
  }
};
RunTestTool = __decorate([
  __param(0, ITestService),
  __param(1, IUriIdentityService),
  __param(2, IWorkspaceContextService),
  __param(3, ITestResultService),
  __param(4, ITestProfileService)
], RunTestTool);
export {
  TestingChatAgentToolContribution
};
//# sourceMappingURL=testingChatAgentTool.js.map
