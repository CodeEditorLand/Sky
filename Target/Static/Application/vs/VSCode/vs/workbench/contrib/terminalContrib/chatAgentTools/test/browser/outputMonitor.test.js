var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as assert from "assert";
import { detectsGenericPressAnyKeyPattern, detectsInputRequiredPattern, detectsNonInteractiveHelpPattern, detectsVSCodeTaskFinishMessage, matchTerminalPromptOption, OutputMonitor } from "../../browser/tools/monitoring/outputMonitor.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { OutputMonitorState } from "../../browser/tools/monitoring/types.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILanguageModelsService } from "../../../../chat/common/languageModels.js";
import { IChatService } from "../../../../chat/common/chatService/chatService.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { ChatModel } from "../../../../chat/common/model/chatModel.js";
import { NullLogService } from "../../../../../../platform/log/common/log.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { runWithFakedTimers } from "../../../../../../base/test/common/timeTravelScheduler.js";
import { LocalChatSessionUri } from "../../../../chat/common/model/chatUri.js";
import { isNumber } from "../../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IChatWidgetService } from "../../../../chat/browser/chat.js";
suite("OutputMonitor", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let monitor;
  let execution;
  let cts;
  let instantiationService;
  let sendTextCalled;
  let sentText;
  let dataEmitter;
  setup(() => {
    sendTextCalled = false;
    sentText = void 0;
    dataEmitter = new Emitter();
    execution = {
      getOutput: /* @__PURE__ */ __name(() => "test output", "getOutput"),
      isActive: /* @__PURE__ */ __name(async () => false, "isActive"),
      instance: {
        instanceId: 1,
        sendText: /* @__PURE__ */ __name(async (text) => {
          sendTextCalled = true;
          sentText = text;
        }, "sendText"),
        onDidInputData: dataEmitter.event,
        onDisposed: Event.None,
        onData: dataEmitter.event,
        focus: /* @__PURE__ */ __name(() => {
        }, "focus"),
        // eslint-disable-next-line local/code-no-any-casts
        registerMarker: /* @__PURE__ */ __name(() => ({ id: 1 }), "registerMarker")
      },
      sessionResource: LocalChatSessionUri.forSession("1")
    };
    instantiationService = new TestInstantiationService();
    instantiationService.stub(ILanguageModelsService, {
      selectLanguageModels: /* @__PURE__ */ __name(async () => [], "selectLanguageModels")
    });
    instantiationService.stub(IChatService, {
      // eslint-disable-next-line local/code-no-any-casts
      getSession: /* @__PURE__ */ __name(() => ({
        sessionId: "1",
        onDidDispose: { event: /* @__PURE__ */ __name(() => {
        }, "event"), dispose: /* @__PURE__ */ __name(() => {
        }, "dispose") },
        onDidChange: { event: /* @__PURE__ */ __name(() => {
        }, "event"), dispose: /* @__PURE__ */ __name(() => {
        }, "dispose") },
        initialLocation: void 0,
        requests: [],
        responses: [],
        addRequest: /* @__PURE__ */ __name(() => {
        }, "addRequest"),
        addResponse: /* @__PURE__ */ __name(() => {
        }, "addResponse"),
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      }), "getSession")
    });
    instantiationService.stub(ITerminalLogService, new NullLogService());
    instantiationService.stub(IConfigurationService, new TestConfigurationService({
      [
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ]: false
    }));
    instantiationService.stub(IChatWidgetService, {
      getWidgetsByLocations: /* @__PURE__ */ __name(() => [], "getWidgetsByLocations")
    });
    cts = new CancellationTokenSource();
  });
  teardown(() => {
    cts.dispose();
  });
  test("startMonitoring returns immediately when polling succeeds", async () => {
    return runWithFakedTimers({}, async () => {
      let callCount = 0;
      execution.getOutput = () => {
        callCount++;
        return callCount > 1 ? "changed output" : "test output";
      };
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Idle);
      assert.strictEqual(pollingResult.output, "changed output");
      assert.strictEqual(sendTextCalled, false, "sendText should not be called");
    });
  });
  test("startMonitoring returns cancelled when token is cancelled", async () => {
    return runWithFakedTimers({}, async () => {
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      cts.cancel();
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Cancelled);
    });
  });
  test("startMonitoring returns idle when isActive is false", async () => {
    return runWithFakedTimers({}, async () => {
      execution.isActive = async () => false;
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Idle);
    });
  });
  test("startMonitoring works when isActive is undefined", async () => {
    return runWithFakedTimers({}, async () => {
      let callCount = 0;
      execution.getOutput = () => {
        callCount++;
        return callCount > 1 ? "changed output" : "test output";
      };
      delete execution.isActive;
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Idle);
    });
  });
  test("non-interactive help completes without prompting", async () => {
    return runWithFakedTimers({}, async () => {
      execution.getOutput = () => "press h + enter to show help";
      instantiationService.stub(ILanguageModelsService, {
        selectLanguageModels: /* @__PURE__ */ __name(async () => {
          throw new Error("language model should not be consulted");
        }, "selectLanguageModels")
      });
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Idle);
      assert.strictEqual(pollingResult?.output, "press h + enter to show help");
    });
  });
  test("monitor can be disposed twice without error", async () => {
    return runWithFakedTimers({}, async () => {
      let callCount = 0;
      execution.getOutput = () => {
        callCount++;
        return callCount > 1 ? "changed output" : "test output";
      };
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const pollingResult = monitor.pollingResult;
      assert.strictEqual(pollingResult?.state, OutputMonitorState.Idle);
      monitor.dispose();
      monitor.dispose();
    });
  });
  test("timeout prompt unanswered \u2192 continues polling and completes when idle", async () => {
    return runWithFakedTimers({}, async () => {
      const fakeChatModel = {
        getRequests: /* @__PURE__ */ __name(() => [{}], "getRequests"),
        acceptResponseProgress: /* @__PURE__ */ __name(() => {
        }, "acceptResponseProgress")
      };
      Object.setPrototypeOf(fakeChatModel, ChatModel.prototype);
      instantiationService.stub(IChatService, { getSession: /* @__PURE__ */ __name(() => fakeChatModel, "getSession") });
      let pass = 0;
      const timeoutThenIdle = /* @__PURE__ */ __name(async () => {
        pass++;
        return pass === 1 ? { state: OutputMonitorState.Timeout, output: execution.getOutput(), modelOutputEvalResponse: "Timed out" } : { state: OutputMonitorState.Idle, output: execution.getOutput(), modelOutputEvalResponse: "Done" };
      }, "timeoutThenIdle");
      monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, timeoutThenIdle, createTestContext("1"), cts.token, "test command"));
      await Event.toPromise(monitor.onDidFinishCommand);
      const res = monitor.pollingResult;
      assert.strictEqual(res.state, OutputMonitorState.Idle);
      assert.strictEqual(res.output, "test output");
      assert.ok(isNumber(res.pollDurationMs));
    });
  });
  test("auto reply sends first option when model lookup is unavailable", async () => {
    instantiationService.stub(IConfigurationService, new TestConfigurationService({
      [
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ]: true
    }));
    instantiationService.stub(ILanguageModelsService, {
      selectLanguageModels: /* @__PURE__ */ __name(async () => [], "selectLanguageModels")
    });
    const monitorCts = new CancellationTokenSource();
    monitorCts.cancel();
    monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), monitorCts.token, "test command"));
    const outputMonitorWithPrivateMethod = monitor;
    const optionResult = await outputMonitorWithPrivateMethod["_selectAndHandleOption"]({
      prompt: "Continue?",
      options: ["y", "n"],
      detectedRequestForFreeFormInput: false
    }, CancellationToken.None);
    await Event.toPromise(monitor.onDidFinishCommand);
    monitorCts.dispose();
    assert.strictEqual(sendTextCalled, true, "sendText should be called when auto reply is enabled");
    assert.strictEqual(optionResult?.sentToTerminal, true, "option should be auto-sent");
    assert.strictEqual(optionResult?.suggestedOption, "y", "first option should be used as fallback");
  });
  test("auto reply uses fallback model to derive suggested option", async () => {
    instantiationService.stub(IConfigurationService, new TestConfigurationService({
      [
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ]: true
    }));
    let fallbackModelRequested = false;
    instantiationService.stub(ILanguageModelsService, {
      selectLanguageModels: /* @__PURE__ */ __name(async (selector) => {
        if (selector.id === "copilot-fast") {
          fallbackModelRequested = true;
          return ["copilot-fast"];
        }
        return [];
      }, "selectLanguageModels"),
      sendChatRequest: /* @__PURE__ */ __name(async () => ({
        stream: (async function* () {
          yield { type: "text", value: "n" };
        })(),
        result: Promise.resolve(void 0)
      }), "sendChatRequest")
    });
    const monitorCts = new CancellationTokenSource();
    monitorCts.cancel();
    monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), monitorCts.token, "test command"));
    const outputMonitorWithPrivateMethod = monitor;
    const optionResult = await outputMonitorWithPrivateMethod["_selectAndHandleOption"]({
      prompt: "Continue?",
      options: ["y", "n"],
      detectedRequestForFreeFormInput: false
    }, CancellationToken.None);
    await Event.toPromise(monitor.onDidFinishCommand);
    monitorCts.dispose();
    assert.strictEqual(fallbackModelRequested, true, "fallback model should be requested via _getLanguageModel");
    assert.strictEqual(sendTextCalled, true, "sendText should be called when auto reply is enabled");
    assert.strictEqual(optionResult?.sentToTerminal, true, "option should be auto-sent");
    assert.strictEqual(optionResult?.suggestedOption, "n", "suggested option should be derived from fallback model response");
  });
  test("auto reply stops on generic press any key prompts", async () => {
    instantiationService.stub(IConfigurationService, new TestConfigurationService({
      [
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ]: true
    }));
    execution.getOutput = () => "Press any key to continue...";
    const monitorCts = new CancellationTokenSource();
    monitorCts.cancel();
    monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), monitorCts.token, "test command"));
    const outputMonitorWithPrivateMethod = monitor;
    const idleResult = await outputMonitorWithPrivateMethod["_handleIdleState"](CancellationToken.None);
    await Event.toPromise(monitor.onDidFinishCommand);
    monitorCts.dispose();
    assert.strictEqual(sendTextCalled, false, "sendText should not be called when auto reply is enabled for free-form prompts");
    assert.strictEqual(sentText, void 0, "no terminal input should be sent");
    assert.strictEqual(idleResult.shouldContinuePollling, false, "monitor should stop polling for free-form prompts in auto reply mode");
  });
  test("auto reply does not propagate free-form input requests without explicit input", async () => {
    instantiationService.stub(IConfigurationService, new TestConfigurationService({
      [
        "chat.tools.terminal.autoReplyToPrompts"
        /* TerminalChatAgentToolsSettingId.AutoReplyToPrompts */
      ]: true
    }));
    const monitorCts = new CancellationTokenSource();
    monitorCts.cancel();
    monitor = store.add(instantiationService.createInstance(OutputMonitor, execution, void 0, createTestContext("1"), monitorCts.token, "test command"));
    const outputMonitorWithPrivateMethod = monitor;
    let freeFormRequestShown = false;
    outputMonitorWithPrivateMethod["_determineUserInputOptions"] = async () => ({
      prompt: "Password:",
      options: [],
      detectedRequestForFreeFormInput: true
    });
    outputMonitorWithPrivateMethod["_requestFreeFormTerminalInput"] = async () => {
      freeFormRequestShown = true;
      return true;
    };
    const idleResult = await outputMonitorWithPrivateMethod["_handleIdleState"](CancellationToken.None);
    await Event.toPromise(monitor.onDidFinishCommand);
    monitorCts.dispose();
    assert.strictEqual(freeFormRequestShown, false, "free-form elicitation should not be shown when auto reply is enabled");
    assert.strictEqual(sendTextCalled, false, "sensitive free-form prompt should not be auto-replied");
    assert.strictEqual(idleResult.shouldContinuePollling, false, "monitor should stop instead of propagating free-form prompt");
  });
  suite("detectsInputRequiredPattern", () => {
    test("detects yes/no confirmation prompts (pairs and variants)", () => {
      assert.strictEqual(detectsInputRequiredPattern("Continue? (y/N) "), true);
      assert.strictEqual(detectsInputRequiredPattern("Continue? (y/n) "), true);
      assert.strictEqual(detectsInputRequiredPattern("Overwrite file? [Y/n] "), true);
      assert.strictEqual(detectsInputRequiredPattern("Are you sure? (Y/N) "), true);
      assert.strictEqual(detectsInputRequiredPattern("Delete files? [y/N] "), true);
      assert.strictEqual(detectsInputRequiredPattern("Proceed? (yes/no) "), true);
      assert.strictEqual(detectsInputRequiredPattern("Proceed? [no/yes] "), true);
      assert.strictEqual(detectsInputRequiredPattern("Continue? y/n "), true);
      assert.strictEqual(detectsInputRequiredPattern("Overwrite: yes/no "), true);
      assert.strictEqual(detectsInputRequiredPattern("Continue? (y/N) y"), false);
      assert.strictEqual(detectsInputRequiredPattern("Continue? (y/n) n"), false);
      assert.strictEqual(detectsInputRequiredPattern("Overwrite file? [Y/n] N"), false);
      assert.strictEqual(detectsInputRequiredPattern("Are you sure? (Y/N) Y"), false);
      assert.strictEqual(detectsInputRequiredPattern("Delete files? [y/N] y"), false);
      assert.strictEqual(detectsInputRequiredPattern("Continue? y/n y/n"), false);
      assert.strictEqual(detectsInputRequiredPattern("Overwrite: yes/no yes/n"), false);
    });
    test("detects PowerShell multi-option confirmation line", () => {
      assert.strictEqual(detectsInputRequiredPattern('[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): '), true);
      assert.strictEqual(detectsInputRequiredPattern("[Y] Yes  [N] No "), true);
      assert.strictEqual(detectsInputRequiredPattern('[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): Y'), false);
      assert.strictEqual(detectsInputRequiredPattern("[Y] Yes  [N] No N"), false);
    });
    test("Line ends with colon", () => {
      assert.strictEqual(detectsInputRequiredPattern("Enter your name: "), true);
      assert.strictEqual(detectsInputRequiredPattern("Password: "), true);
      assert.strictEqual(detectsInputRequiredPattern("File to overwrite: "), true);
    });
    test("detects trailing questions", () => {
      assert.strictEqual(detectsInputRequiredPattern("Continue?"), true);
      assert.strictEqual(detectsInputRequiredPattern("Proceed?   "), true);
      assert.strictEqual(detectsInputRequiredPattern("Are you sure?"), true);
    });
    test("detects press any key prompts", () => {
      assert.strictEqual(detectsInputRequiredPattern("Press any key to continue..."), true);
      assert.strictEqual(detectsInputRequiredPattern("Press a key"), true);
    });
    test("detects non-interactive help prompts without treating them as input", () => {
      assert.strictEqual(detectsInputRequiredPattern("press h + enter to show help"), false);
      assert.strictEqual(detectsInputRequiredPattern("press h to show help"), false);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press h + enter to show help"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press h to show help"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press h to show commands"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press ? to see commands"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press ? + enter for options"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("type h + enter to show help"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("hit ? for help"), true);
      assert.strictEqual(detectsNonInteractiveHelpPattern("type h to see options"), true);
      assert.strictEqual(detectsInputRequiredPattern("press o to open the app"), false);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press o to open the app"), true);
      assert.strictEqual(detectsInputRequiredPattern("press r to restart the server"), false);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press r to restart the server"), true);
      assert.strictEqual(detectsInputRequiredPattern("press q to quit"), false);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press q to quit"), true);
      assert.strictEqual(detectsInputRequiredPattern("press u to show server url"), false);
      assert.strictEqual(detectsNonInteractiveHelpPattern("press u to show server url"), true);
    });
  });
  suite("matchTerminalPromptOption", () => {
    test("matches suggested option case-insensitively", () => {
      assert.deepStrictEqual(matchTerminalPromptOption(["Y", "n"], "y"), { option: "Y", index: 0 });
      assert.deepStrictEqual(matchTerminalPromptOption(["y", "N"], "n"), { option: "N", index: 1 });
    });
    test("strips quotes and trailing punctuation", () => {
      assert.deepStrictEqual(matchTerminalPromptOption(["Y", "n"], '"y"'), { option: "Y", index: 0 });
      assert.deepStrictEqual(matchTerminalPromptOption(["yes", "no"], "no."), { option: "no", index: 1 });
    });
    test("handles bracketed options like [Y]", () => {
      assert.deepStrictEqual(matchTerminalPromptOption(["Y", "n"], "[y]"), { option: "Y", index: 0 });
      assert.deepStrictEqual(matchTerminalPromptOption(["y", "N"], "(n)"), { option: "N", index: 1 });
    });
    test("handles default suffixes by using first token", () => {
      assert.deepStrictEqual(matchTerminalPromptOption(["Y", "n"], "Y (default)"), { option: "Y", index: 0 });
      assert.deepStrictEqual(matchTerminalPromptOption(["Enter"], "Enter to continue"), { option: "Enter", index: 0 });
    });
  });
  suite("detectsVSCodeTaskFinishMessage", () => {
    test("detects VS Code task completion messages", () => {
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Press any key to close the terminal."), true);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Terminal will be reused by tasks, press any key to close it."), true);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("press any key to close the terminal."), true);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("PRESS ANY KEY TO CLOSE THE TERMINAL."), true);
      assert.strictEqual(detectsVSCodeTaskFinishMessage(" *  Terminal will be reused by tasks, press any key to close it."), true);
      assert.strictEqual(detectsVSCodeTaskFinishMessage(" *  Press any key to close the terminal."), true);
    });
    test("does not match generic press any key messages", () => {
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Press any key to continue..."), false);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Press any key to exit"), false);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Press any key"), false);
    });
    test("does not match other prompts", () => {
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Continue? (y/n)"), false);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("Password:"), false);
      assert.strictEqual(detectsVSCodeTaskFinishMessage("press h to show help"), false);
    });
  });
  suite("detectsGenericPressAnyKeyPattern", () => {
    test("detects generic press any key prompts from scripts", () => {
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Press any key to continue..."), true);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Press any key to exit"), true);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Press any key"), true);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("press a key to continue"), true);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("PRESS ANY KEY TO CONTINUE"), true);
    });
    test("does not match VS Code task finish messages", () => {
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Press any key to close the terminal."), false);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Terminal will be reused by tasks, press any key to close it."), false);
      assert.strictEqual(detectsGenericPressAnyKeyPattern(" *  Terminal will be reused by tasks, press any key to close it."), false);
      assert.strictEqual(detectsGenericPressAnyKeyPattern(" *  Press any key to close the terminal."), false);
    });
    test("does not match other prompts", () => {
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Continue? (y/n)"), false);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("Password:"), false);
      assert.strictEqual(detectsGenericPressAnyKeyPattern("press h to show help"), false);
    });
  });
});
function createTestContext(id) {
  return { sessionResource: LocalChatSessionUri.forSession(id) };
}
__name(createTestContext, "createTestContext");
//# sourceMappingURL=outputMonitor.test.js.map
