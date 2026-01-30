var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindowId } from "../../../../base/browser/dom.js";
import { List } from "../../../../base/browser/ui/list/listWidget.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { deepClone } from "../../../../base/common/objects.js";
import { isWeb, isWindows } from "../../../../base/common/platform.js";
import { isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ITextResourcePropertiesService } from "../../../../editor/common/services/textResourceConfiguration.js";
import * as nls from "../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { InputFocusedContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { IExtensionHostDebugService } from "../../../../platform/debug/common/extensionHostDebug.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ActiveEditorContext, PanelFocusContext, ResourceContextKey } from "../../../common/contextkeys.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { TEXT_FILE_EDITOR_ID } from "../../files/common/files.js";
import { CONTEXT_BREAKPOINT_INPUT_FOCUSED, CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_DEBUG_STATE, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DISASSEMBLY_VIEW_FOCUS, CONTEXT_EXPRESSION_SELECTED, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_IN_DEBUG_MODE, CONTEXT_IN_DEBUG_REPL, CONTEXT_JUMP_TO_CURSOR_SUPPORTED, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_VARIABLES_FOCUSED, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, EDITOR_CONTRIBUTION_ID, getStateLabel, IDebugService, isFrameDeemphasized, REPL_VIEW_ID, VIEWLET_ID } from "../common/debug.js";
import { Breakpoint, DataBreakpoint, Expression, FunctionBreakpoint, Variable } from "../common/debugModel.js";
import { saveAllBeforeDebugStart, resolveChildSession } from "../common/debugUtils.js";
import { showLoadedScriptMenu } from "../common/loadedScriptsPicker.js";
import { openBreakpointSource } from "./breakpointsView.js";
import { showDebugSessionMenu } from "./debugSessionPicker.js";
const ADD_CONFIGURATION_ID = "debug.addConfiguration";
const COPY_ADDRESS_ID = "editor.debug.action.copyAddress";
const TOGGLE_BREAKPOINT_ID = "editor.debug.action.toggleBreakpoint";
const TOGGLE_INLINE_BREAKPOINT_ID = "editor.debug.action.toggleInlineBreakpoint";
const COPY_STACK_TRACE_ID = "debug.copyStackTrace";
const REVERSE_CONTINUE_ID = "workbench.action.debug.reverseContinue";
const STEP_BACK_ID = "workbench.action.debug.stepBack";
const RESTART_SESSION_ID = "workbench.action.debug.restart";
const TERMINATE_THREAD_ID = "workbench.action.debug.terminateThread";
const STEP_OVER_ID = "workbench.action.debug.stepOver";
const STEP_INTO_ID = "workbench.action.debug.stepInto";
const STEP_INTO_TARGET_ID = "workbench.action.debug.stepIntoTarget";
const STEP_OUT_ID = "workbench.action.debug.stepOut";
const PAUSE_ID = "workbench.action.debug.pause";
const DISCONNECT_ID = "workbench.action.debug.disconnect";
const DISCONNECT_AND_SUSPEND_ID = "workbench.action.debug.disconnectAndSuspend";
const STOP_ID = "workbench.action.debug.stop";
const RESTART_FRAME_ID = "workbench.action.debug.restartFrame";
const CONTINUE_ID = "workbench.action.debug.continue";
const FOCUS_REPL_ID = "workbench.debug.action.focusRepl";
const JUMP_TO_CURSOR_ID = "debug.jumpToCursor";
const FOCUS_SESSION_ID = "workbench.action.debug.focusProcess";
const SELECT_AND_START_ID = "workbench.action.debug.selectandstart";
const SELECT_DEBUG_CONSOLE_ID = "workbench.action.debug.selectDebugConsole";
const SELECT_DEBUG_SESSION_ID = "workbench.action.debug.selectDebugSession";
const DEBUG_CONFIGURE_COMMAND_ID = "workbench.action.debug.configure";
const DEBUG_START_COMMAND_ID = "workbench.action.debug.start";
const DEBUG_RUN_COMMAND_ID = "workbench.action.debug.run";
const EDIT_EXPRESSION_COMMAND_ID = "debug.renameWatchExpression";
const COPY_WATCH_EXPRESSION_COMMAND_ID = "debug.copyWatchExpression";
const SET_EXPRESSION_COMMAND_ID = "debug.setWatchExpression";
const REMOVE_EXPRESSION_COMMAND_ID = "debug.removeWatchExpression";
const NEXT_DEBUG_CONSOLE_ID = "workbench.action.debug.nextConsole";
const PREV_DEBUG_CONSOLE_ID = "workbench.action.debug.prevConsole";
const SHOW_LOADED_SCRIPTS_ID = "workbench.action.debug.showLoadedScripts";
const CALLSTACK_TOP_ID = "workbench.action.debug.callStackTop";
const CALLSTACK_BOTTOM_ID = "workbench.action.debug.callStackBottom";
const CALLSTACK_UP_ID = "workbench.action.debug.callStackUp";
const CALLSTACK_DOWN_ID = "workbench.action.debug.callStackDown";
const ADD_TO_WATCH_ID = "debug.addToWatchExpressions";
const COPY_EVALUATE_PATH_ID = "debug.copyEvaluatePath";
const COPY_VALUE_ID = "workbench.debug.viewlet.action.copyValue";
const BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";
const BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";
const BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";
const TOGGLE_EXCEPTION_BREAKPOINTS_ID = "debug.toggleExceptionBreakpoints";
const ATTACH_TO_CURRENT_CODE_RENDERER = "debug.attachToCurrentCodeRenderer";
const DEBUG_COMMAND_CATEGORY = nls.localize2("debug", "Debug");
const RESTART_LABEL = nls.localize2("restartDebug", "Restart");
const STEP_OVER_LABEL = nls.localize2("stepOverDebug", "Step Over");
const STEP_INTO_LABEL = nls.localize2("stepIntoDebug", "Step Into");
const STEP_INTO_TARGET_LABEL = nls.localize2("stepIntoTargetDebug", "Step Into Target");
const STEP_OUT_LABEL = nls.localize2("stepOutDebug", "Step Out");
const PAUSE_LABEL = nls.localize2("pauseDebug", "Pause");
const DISCONNECT_LABEL = nls.localize2("disconnect", "Disconnect");
const DISCONNECT_AND_SUSPEND_LABEL = nls.localize2("disconnectSuspend", "Disconnect and Suspend");
const STOP_LABEL = nls.localize2("stop", "Stop");
const CONTINUE_LABEL = nls.localize2("continueDebug", "Continue");
const FOCUS_SESSION_LABEL = nls.localize2("focusSession", "Focus Session");
const SELECT_AND_START_LABEL = nls.localize2("selectAndStartDebugging", "Select and Start Debugging");
const DEBUG_CONFIGURE_LABEL = nls.localize("openLaunchJson", "Open '{0}'", "launch.json");
const DEBUG_START_LABEL = nls.localize2("startDebug", "Start Debugging");
const DEBUG_RUN_LABEL = nls.localize2("startWithoutDebugging", "Start Without Debugging");
const NEXT_DEBUG_CONSOLE_LABEL = nls.localize2("nextDebugConsole", "Focus Next Debug Console");
const PREV_DEBUG_CONSOLE_LABEL = nls.localize2("prevDebugConsole", "Focus Previous Debug Console");
const OPEN_LOADED_SCRIPTS_LABEL = nls.localize2("openLoadedScript", "Open Loaded Script...");
const CALLSTACK_TOP_LABEL = nls.localize2("callStackTop", "Navigate to Top of Call Stack");
const CALLSTACK_BOTTOM_LABEL = nls.localize2("callStackBottom", "Navigate to Bottom of Call Stack");
const CALLSTACK_UP_LABEL = nls.localize2("callStackUp", "Navigate Up Call Stack");
const CALLSTACK_DOWN_LABEL = nls.localize2("callStackDown", "Navigate Down Call Stack");
const COPY_EVALUATE_PATH_LABEL = nls.localize2("copyAsExpression", "Copy as Expression");
const COPY_VALUE_LABEL = nls.localize2("copyValue", "Copy Value");
const COPY_ADDRESS_LABEL = nls.localize2("copyAddress", "Copy Address");
const ADD_TO_WATCH_LABEL = nls.localize2("addToWatchExpressions", "Add to Watch");
const SELECT_DEBUG_CONSOLE_LABEL = nls.localize2("selectDebugConsole", "Select Debug Console");
const SELECT_DEBUG_SESSION_LABEL = nls.localize2("selectDebugSession", "Select Debug Session");
const DEBUG_QUICK_ACCESS_PREFIX = "debug ";
const DEBUG_CONSOLE_QUICK_ACCESS_PREFIX = "debug consoles ";
let dataBreakpointInfoResponse;
function setDataBreakpointInfoResponse(resp) {
  dataBreakpointInfoResponse = resp;
}
__name(setDataBreakpointInfoResponse, "setDataBreakpointInfoResponse");
function isThreadContext(obj) {
  return obj && typeof obj.sessionId === "string" && typeof obj.threadId === "string";
}
__name(isThreadContext, "isThreadContext");
async function getThreadAndRun(accessor, sessionAndThreadId, run) {
  const debugService = accessor.get(IDebugService);
  let thread;
  if (isThreadContext(sessionAndThreadId)) {
    const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
    if (session) {
      thread = session.getAllThreads().find((t) => t.getId() === sessionAndThreadId.threadId);
    }
  } else if (isSessionContext(sessionAndThreadId)) {
    const session = debugService.getModel().getSession(sessionAndThreadId.sessionId);
    if (session) {
      const threads = session.getAllThreads();
      thread = threads.length > 0 ? threads[0] : void 0;
    }
  }
  if (!thread) {
    thread = debugService.getViewModel().focusedThread;
    if (!thread) {
      const focusedSession = debugService.getViewModel().focusedSession;
      const threads = focusedSession ? focusedSession.getAllThreads() : void 0;
      thread = threads && threads.length ? threads[0] : void 0;
    }
  }
  if (thread) {
    await run(thread);
  }
}
__name(getThreadAndRun, "getThreadAndRun");
function isStackFrameContext(obj) {
  return obj && typeof obj.sessionId === "string" && typeof obj.threadId === "string" && typeof obj.frameId === "string";
}
__name(isStackFrameContext, "isStackFrameContext");
function getFrame(debugService, context) {
  if (isStackFrameContext(context)) {
    const session = debugService.getModel().getSession(context.sessionId);
    if (session) {
      const thread = session.getAllThreads().find((t) => t.getId() === context.threadId);
      if (thread) {
        return thread.getCallStack().find((sf) => sf.getId() === context.frameId);
      }
    }
  } else {
    return debugService.getViewModel().focusedStackFrame;
  }
  return void 0;
}
__name(getFrame, "getFrame");
function isSessionContext(obj) {
  return obj && typeof obj.sessionId === "string";
}
__name(isSessionContext, "isSessionContext");
async function changeDebugConsoleFocus(accessor, next) {
  const debugService = accessor.get(IDebugService);
  const viewsService = accessor.get(IViewsService);
  const sessions = debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl());
  let currSession = debugService.getViewModel().focusedSession;
  let nextIndex = 0;
  if (sessions.length > 0 && currSession) {
    while (currSession && !currSession.hasSeparateRepl()) {
      currSession = currSession.parentSession;
    }
    if (currSession) {
      const currIndex = sessions.indexOf(currSession);
      if (next) {
        nextIndex = currIndex === sessions.length - 1 ? 0 : currIndex + 1;
      } else {
        nextIndex = currIndex === 0 ? sessions.length - 1 : currIndex - 1;
      }
    }
  }
  await debugService.focusStackFrame(void 0, void 0, sessions[nextIndex], { explicit: true });
  if (!viewsService.isViewVisible(REPL_VIEW_ID)) {
    await viewsService.openView(REPL_VIEW_ID, true);
  }
}
__name(changeDebugConsoleFocus, "changeDebugConsoleFocus");
async function navigateCallStack(debugService, down) {
  const frame = debugService.getViewModel().focusedStackFrame;
  if (frame) {
    let callStack = frame.thread.getCallStack();
    let index = callStack.findIndex((elem) => elem.frameId === frame.frameId);
    let nextVisibleFrame;
    if (down) {
      if (index >= callStack.length - 1) {
        if (frame.thread.reachedEndOfCallStack) {
          goToTopOfCallStack(debugService);
          return;
        } else {
          await debugService.getModel().fetchCallstack(frame.thread, 20);
          callStack = frame.thread.getCallStack();
          index = callStack.findIndex((elem) => elem.frameId === frame.frameId);
        }
      }
      nextVisibleFrame = findNextVisibleFrame(true, callStack, index);
    } else {
      if (index <= 0) {
        goToBottomOfCallStack(debugService);
        return;
      }
      nextVisibleFrame = findNextVisibleFrame(false, callStack, index);
    }
    if (nextVisibleFrame) {
      debugService.focusStackFrame(nextVisibleFrame, void 0, void 0, { preserveFocus: false });
    }
  }
}
__name(navigateCallStack, "navigateCallStack");
async function goToBottomOfCallStack(debugService) {
  const thread = debugService.getViewModel().focusedThread;
  if (thread) {
    await debugService.getModel().fetchCallstack(thread);
    const callStack = thread.getCallStack();
    if (callStack.length > 0) {
      const nextVisibleFrame = findNextVisibleFrame(false, callStack, 0);
      if (nextVisibleFrame) {
        debugService.focusStackFrame(nextVisibleFrame, void 0, void 0, { preserveFocus: false });
      }
    }
  }
}
__name(goToBottomOfCallStack, "goToBottomOfCallStack");
function goToTopOfCallStack(debugService) {
  const thread = debugService.getViewModel().focusedThread;
  if (thread) {
    debugService.focusStackFrame(thread.getTopStackFrame(), void 0, void 0, { preserveFocus: false });
  }
}
__name(goToTopOfCallStack, "goToTopOfCallStack");
function findNextVisibleFrame(down, callStack, startIndex) {
  if (startIndex >= callStack.length) {
    startIndex = callStack.length - 1;
  } else if (startIndex < 0) {
    startIndex = 0;
  }
  let index = startIndex;
  let currFrame;
  do {
    if (down) {
      if (index === callStack.length - 1) {
        index = 0;
      } else {
        index++;
      }
    } else {
      if (index === 0) {
        index = callStack.length - 1;
      } else {
        index--;
      }
    }
    currFrame = callStack[index];
    if (!isFrameDeemphasized(currFrame)) {
      return currFrame;
    }
  } while (index !== startIndex);
  return void 0;
}
__name(findNextVisibleFrame, "findNextVisibleFrame");
CommandsRegistry.registerCommand({
  id: COPY_STACK_TRACE_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const textResourcePropertiesService = accessor.get(ITextResourcePropertiesService);
    const clipboardService = accessor.get(IClipboardService);
    const debugService = accessor.get(IDebugService);
    const frame = getFrame(debugService, context);
    if (frame) {
      const eol = textResourcePropertiesService.getEOL(frame.source.uri);
      await clipboardService.writeText(frame.thread.getCallStack().map((sf) => sf.toString()).join(eol));
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: REVERSE_CONTINUE_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    await getThreadAndRun(accessor, context, (thread) => thread.reverseContinue());
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: STEP_BACK_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context, (thread) => thread.stepBack("instruction"));
    } else {
      await getThreadAndRun(accessor, context, (thread) => thread.stepBack());
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: TERMINATE_THREAD_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    await getThreadAndRun(accessor, context, (thread) => thread.terminate());
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: JUMP_TO_CURSOR_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    const editorService = accessor.get(IEditorService);
    const activeEditorControl = editorService.activeTextEditorControl;
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    if (stackFrame && isCodeEditor(activeEditorControl) && activeEditorControl.hasModel()) {
      const position = activeEditorControl.getPosition();
      const resource = activeEditorControl.getModel().uri;
      const source = stackFrame.thread.session.getSourceForUri(resource);
      if (source) {
        const response = await stackFrame.thread.session.gotoTargets(source.raw, position.lineNumber, position.column);
        const targets = response?.body.targets;
        if (targets && targets.length) {
          let id = targets[0].id;
          if (targets.length > 1) {
            const picks = targets.map((t) => ({ label: t.label, _id: t.id }));
            const pick = await quickInputService.pick(picks, { placeHolder: nls.localize("chooseLocation", "Choose the specific location") });
            if (!pick) {
              return;
            }
            id = pick._id;
          }
          return await stackFrame.thread.session.goto(stackFrame.thread.threadId, id).catch((e) => notificationService.warn(e));
        }
      }
    }
    return notificationService.warn(nls.localize("noExecutableCode", "No executable code is associated at the current cursor position."));
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: CALLSTACK_TOP_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    goToTopOfCallStack(debugService);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: CALLSTACK_BOTTOM_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    await goToBottomOfCallStack(debugService);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: CALLSTACK_UP_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    navigateCallStack(debugService, false);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: CALLSTACK_DOWN_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    navigateCallStack(debugService, true);
  }, "handler")
});
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  command: {
    id: JUMP_TO_CURSOR_ID,
    title: nls.localize("jumpToCursor", "Jump to Cursor"),
    category: DEBUG_COMMAND_CATEGORY
  },
  when: ContextKeyExpr.and(CONTEXT_JUMP_TO_CURSOR_SUPPORTED, EditorContextKeys.editorTextFocus),
  group: "debug",
  order: 3
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: NEXT_DEBUG_CONSOLE_ID,
  weight: 200 + 1,
  when: CONTEXT_IN_DEBUG_REPL,
  primary: 2048 | 12,
  mac: {
    primary: 1024 | 2048 | 94
    /* KeyCode.BracketRight */
  },
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    changeDebugConsoleFocus(accessor, true);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: PREV_DEBUG_CONSOLE_ID,
  weight: 200 + 1,
  when: CONTEXT_IN_DEBUG_REPL,
  primary: 2048 | 11,
  mac: {
    primary: 1024 | 2048 | 92
    /* KeyCode.BracketLeft */
  },
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    changeDebugConsoleFocus(accessor, false);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: RESTART_SESSION_ID,
  weight: 200,
  primary: 1024 | 2048 | 63,
  when: CONTEXT_IN_DEBUG_MODE,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    const configurationService = accessor.get(IConfigurationService);
    let session;
    if (isSessionContext(context)) {
      session = debugService.getModel().getSession(context.sessionId);
    } else {
      session = debugService.getViewModel().focusedSession;
    }
    if (!session) {
      const { launch, name } = debugService.getConfigurationManager().selectedConfiguration;
      await debugService.startDebugging(launch, name, { noDebug: false, startedByUser: true });
    } else {
      const showSubSessions = configurationService.getValue("debug").showSubSessionsInToolBar;
      while (!showSubSessions && session.lifecycleManagedByParent && session.parentSession) {
        session = session.parentSession;
      }
      session.removeReplExpressions();
      await debugService.restartSession(session);
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_OVER_ID,
  weight: 200,
  primary: 68,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context, (thread) => thread.next("instruction"));
    } else {
      await getThreadAndRun(accessor, context, (thread) => thread.next());
    }
  }, "handler")
});
const STEP_INTO_KEYBINDING = isWeb && isWindows ? 512 | 69 : 69;
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_INTO_ID,
  weight: 200 + 10,
  // Have a stronger weight to have priority over full screen when debugging
  primary: STEP_INTO_KEYBINDING,
  // Use a more flexible when clause to not allow full screen command to take over when F11 pressed a lot of times
  when: CONTEXT_DEBUG_STATE.notEqualsTo("inactive"),
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context, (thread) => thread.stepIn("instruction"));
    } else {
      await getThreadAndRun(accessor, context, (thread) => thread.stepIn());
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_OUT_ID,
  weight: 200,
  primary: 1024 | 69,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const contextKeyService = accessor.get(IContextKeyService);
    if (CONTEXT_DISASSEMBLY_VIEW_FOCUS.getValue(contextKeyService)) {
      await getThreadAndRun(accessor, context, (thread) => thread.stepOut("instruction"));
    } else {
      await getThreadAndRun(accessor, context, (thread) => thread.stepOut());
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: PAUSE_ID,
  weight: 200 + 2,
  // take priority over focus next part while we are debugging
  primary: 64,
  when: CONTEXT_DEBUG_STATE.isEqualTo("running"),
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    await getThreadAndRun(accessor, context, (thread) => thread.pause());
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STEP_INTO_TARGET_ID,
  primary: STEP_INTO_KEYBINDING | 2048,
  when: ContextKeyExpr.and(CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped")),
  weight: 200,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const quickInputService = accessor.get(IQuickInputService);
    const debugService = accessor.get(IDebugService);
    const session = debugService.getViewModel().focusedSession;
    const frame = debugService.getViewModel().focusedStackFrame;
    if (!frame || !session) {
      return;
    }
    const editor = await accessor.get(IEditorService).openEditor({
      resource: frame.source.uri,
      options: { revealIfOpened: true }
    });
    let codeEditor;
    if (editor) {
      const ctrl = editor?.getControl();
      if (isCodeEditor(ctrl)) {
        codeEditor = ctrl;
      }
    }
    const disposables = new DisposableStore();
    const qp = disposables.add(quickInputService.createQuickPick());
    qp.busy = true;
    qp.show();
    disposables.add(qp.onDidChangeActive(([item]) => {
      if (codeEditor && item && item.target.line !== void 0) {
        codeEditor.revealLineInCenterIfOutsideViewport(item.target.line);
        codeEditor.setSelection({
          startLineNumber: item.target.line,
          startColumn: item.target.column || 1,
          endLineNumber: item.target.endLine || item.target.line,
          endColumn: item.target.endColumn || item.target.column || 1
        });
      }
    }));
    disposables.add(qp.onDidAccept(() => {
      if (qp.activeItems.length) {
        session.stepIn(frame.thread.threadId, qp.activeItems[0].target.id);
      }
    }));
    disposables.add(qp.onDidHide(() => disposables.dispose()));
    session.stepInTargets(frame.frameId).then((targets) => {
      qp.busy = false;
      if (targets?.length) {
        qp.items = targets?.map((target) => ({ target, label: target.label }));
      } else {
        qp.placeholder = nls.localize("editor.debug.action.stepIntoTargets.none", "No step targets available");
      }
    });
  }, "handler")
});
async function stopHandler(accessor, _, context, disconnect, suspend) {
  const debugService = accessor.get(IDebugService);
  let session;
  if (isSessionContext(context)) {
    session = debugService.getModel().getSession(context.sessionId);
  } else {
    session = debugService.getViewModel().focusedSession;
  }
  const configurationService = accessor.get(IConfigurationService);
  const showSubSessions = configurationService.getValue("debug").showSubSessionsInToolBar;
  while (!showSubSessions && session && session.lifecycleManagedByParent && session.parentSession) {
    session = session.parentSession;
  }
  await debugService.stopSession(session, disconnect, suspend);
}
__name(stopHandler, "stopHandler");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DISCONNECT_ID,
  weight: 200,
  primary: 1024 | 63,
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_IN_DEBUG_MODE),
  handler: /* @__PURE__ */ __name((accessor, _, context) => stopHandler(accessor, _, context, true), "handler")
});
CommandsRegistry.registerCommand({
  id: DISCONNECT_AND_SUSPEND_ID,
  handler: /* @__PURE__ */ __name((accessor, _, context) => stopHandler(accessor, _, context, true, true), "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: STOP_ID,
  weight: 200,
  primary: 1024 | 63,
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_IN_DEBUG_MODE),
  handler: /* @__PURE__ */ __name((accessor, _, context) => stopHandler(accessor, _, context, false), "handler")
});
CommandsRegistry.registerCommand({
  id: RESTART_FRAME_ID,
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    const debugService = accessor.get(IDebugService);
    const notificationService = accessor.get(INotificationService);
    const frame = getFrame(debugService, context);
    if (frame) {
      try {
        await frame.restart();
      } catch (e) {
        notificationService.error(e);
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CONTINUE_ID,
  weight: 200 + 10,
  // Use a stronger weight to get priority over start debugging F5 shortcut
  primary: 63,
  when: CONTEXT_DEBUG_STATE.isEqualTo("stopped"),
  handler: /* @__PURE__ */ __name(async (accessor, _, context) => {
    await getThreadAndRun(accessor, context, (thread) => thread.continue());
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SHOW_LOADED_SCRIPTS_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    await showLoadedScriptMenu(accessor);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: "debug.startFromConfig",
  handler: /* @__PURE__ */ __name(async (accessor, config) => {
    const debugService = accessor.get(IDebugService);
    await debugService.startDebugging(void 0, config);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: FOCUS_SESSION_ID,
  handler: /* @__PURE__ */ __name(async (accessor, session) => {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    session = resolveChildSession(session, debugService.getModel().getSessions());
    await debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    if (stackFrame) {
      await stackFrame.openInEditor(editorService, true);
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SELECT_AND_START_ID,
  handler: /* @__PURE__ */ __name(async (accessor, debugType, debugStartOptions) => {
    const quickInputService = accessor.get(IQuickInputService);
    const debugService = accessor.get(IDebugService);
    if (debugType) {
      const configManager = debugService.getConfigurationManager();
      const dynamicProviders = await configManager.getDynamicProviders();
      for (const provider of dynamicProviders) {
        if (provider.type === debugType) {
          const pick = await provider.pick();
          if (pick) {
            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
            debugService.startDebugging(pick.launch, pick.config, { noDebug: debugStartOptions?.noDebug, startedByUser: true });
            return;
          }
        }
      }
    }
    quickInputService.quickAccess.show(DEBUG_QUICK_ACCESS_PREFIX);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SELECT_DEBUG_CONSOLE_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(DEBUG_CONSOLE_QUICK_ACCESS_PREFIX);
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SELECT_DEBUG_SESSION_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    showDebugSessionMenu(accessor, SELECT_AND_START_ID);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DEBUG_START_COMMAND_ID,
  weight: 200,
  primary: 63,
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.isEqualTo("inactive")),
  handler: /* @__PURE__ */ __name(async (accessor, debugStartOptions) => {
    const debugService = accessor.get(IDebugService);
    await saveAllBeforeDebugStart(accessor.get(IConfigurationService), accessor.get(IEditorService));
    const { launch, name, getConfig } = debugService.getConfigurationManager().selectedConfiguration;
    const config = await getConfig();
    const configOrName = config ? Object.assign(deepClone(config), debugStartOptions?.config) : name;
    await debugService.startDebugging(launch, configOrName, { noDebug: debugStartOptions?.noDebug, startedByUser: true }, false);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: DEBUG_RUN_COMMAND_ID,
  weight: 200,
  primary: 2048 | 63,
  mac: {
    primary: 256 | 63
    /* KeyCode.F5 */
  },
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(
    1
    /* State.Initializing */
  ))),
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(DEBUG_START_COMMAND_ID, { noDebug: true });
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.toggleBreakpoint",
  weight: 200 + 5,
  when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_FOCUSED, InputFocusedContext.toNegated()),
  primary: 10,
  handler: /* @__PURE__ */ __name((accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const list = listService.lastFocusedList;
    if (list instanceof List) {
      const focused = list.getFocusedElements();
      if (focused && focused.length) {
        debugService.enableOrDisableBreakpoints(!focused[0].enabled, focused[0]);
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.enableOrDisableBreakpoint",
  weight: 200,
  primary: void 0,
  when: EditorContextKeys.editorTextFocus,
  handler: /* @__PURE__ */ __name((accessor) => {
    const debugService = accessor.get(IDebugService);
    const editorService = accessor.get(IEditorService);
    const control = editorService.activeTextEditorControl;
    if (isCodeEditor(control)) {
      const model = control.getModel();
      if (model) {
        const position = control.getPosition();
        if (position) {
          const bps = debugService.getModel().getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
          if (bps.length) {
            debugService.enableOrDisableBreakpoints(!bps[0].enabled, bps[0]);
          }
        }
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: EDIT_EXPRESSION_COMMAND_ID,
  weight: 200 + 5,
  when: CONTEXT_WATCH_EXPRESSIONS_FOCUSED,
  primary: 60,
  mac: {
    primary: 3
    /* KeyCode.Enter */
  },
  handler: /* @__PURE__ */ __name((accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (!(expression instanceof Expression)) {
      const listService = accessor.get(IListService);
      const focused = listService.lastFocusedList;
      if (focused) {
        const elements = focused.getFocus();
        if (Array.isArray(elements) && elements[0] instanceof Expression) {
          expression = elements[0];
        }
      }
    }
    if (expression instanceof Expression) {
      debugService.getViewModel().setSelectedExpression(expression, false);
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SET_EXPRESSION_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (expression instanceof Expression || expression instanceof Variable) {
      debugService.getViewModel().setSelectedExpression(expression, true);
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.setVariable",
  weight: 200 + 5,
  when: CONTEXT_VARIABLES_FOCUSED,
  primary: 60,
  mac: {
    primary: 3
    /* KeyCode.Enter */
  },
  handler: /* @__PURE__ */ __name((accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const focused = listService.lastFocusedList;
    if (focused) {
      const elements = focused.getFocus();
      if (Array.isArray(elements) && elements[0] instanceof Variable) {
        debugService.getViewModel().setSelectedExpression(elements[0], false);
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: REMOVE_EXPRESSION_COMMAND_ID,
  weight: 200,
  when: ContextKeyExpr.and(CONTEXT_WATCH_EXPRESSIONS_FOCUSED, CONTEXT_EXPRESSION_SELECTED.toNegated()),
  primary: 20,
  mac: {
    primary: 2048 | 1
    /* KeyCode.Backspace */
  },
  handler: /* @__PURE__ */ __name((accessor, expression) => {
    const debugService = accessor.get(IDebugService);
    if (expression instanceof Expression) {
      debugService.removeWatchExpressions(expression.getId());
      return;
    }
    const listService = accessor.get(IListService);
    const focused = listService.lastFocusedList;
    if (focused) {
      let elements = focused.getFocus();
      if (Array.isArray(elements) && elements[0] instanceof Expression) {
        const selection = focused.getSelection();
        if (selection && selection.indexOf(elements[0]) >= 0) {
          elements = selection;
        }
        elements.forEach((e) => debugService.removeWatchExpressions(e.getId()));
      }
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_CHANGES_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "write" });
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_ACCESSED_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "readWrite" });
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_READ_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: 0, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "read" });
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.removeBreakpoint",
  weight: 200,
  when: ContextKeyExpr.and(CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_BREAKPOINT_INPUT_FOCUSED.toNegated()),
  primary: 20,
  mac: {
    primary: 2048 | 1
    /* KeyCode.Backspace */
  },
  handler: /* @__PURE__ */ __name((accessor) => {
    const listService = accessor.get(IListService);
    const debugService = accessor.get(IDebugService);
    const list = listService.lastFocusedList;
    if (list instanceof List) {
      const focused = list.getFocusedElements();
      const element = focused.length ? focused[0] : void 0;
      if (element instanceof Breakpoint) {
        debugService.removeBreakpoints(element.getId());
      } else if (element instanceof FunctionBreakpoint) {
        debugService.removeFunctionBreakpoints(element.getId());
      } else if (element instanceof DataBreakpoint) {
        debugService.removeDataBreakpoints(element.getId());
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.installAdditionalDebuggers",
  weight: 200,
  when: void 0,
  primary: void 0,
  handler: /* @__PURE__ */ __name(async (accessor, query) => {
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    let searchFor = `@category:debuggers`;
    if (typeof query === "string") {
      searchFor += ` ${query}`;
    }
    return extensionsWorkbenchService.openSearch(searchFor);
  }, "handler")
});
registerAction2(class AddConfigurationAction extends Action2 {
  static {
    __name(this, "AddConfigurationAction");
  }
  constructor() {
    super({
      id: ADD_CONFIGURATION_ID,
      title: nls.localize2("addConfiguration", "Add Configuration..."),
      category: DEBUG_COMMAND_CATEGORY,
      f1: true,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]launch\.json$/), ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID))
      }
    });
  }
  async run(accessor, launchUri) {
    const manager = accessor.get(IDebugService).getConfigurationManager();
    const launch = manager.getLaunches().find((l) => l.uri.toString() === launchUri) || manager.selectedConfiguration.launch;
    if (launch) {
      const { editor, created } = await launch.openConfigFile({ preserveFocus: false });
      if (editor && !created) {
        const codeEditor = editor.getControl();
        if (codeEditor) {
          await codeEditor.getContribution(EDITOR_CONTRIBUTION_ID)?.addLaunchConfiguration();
        }
      }
    }
  }
});
const inlineBreakpointHandler = /* @__PURE__ */ __name((accessor) => {
  const debugService = accessor.get(IDebugService);
  const editorService = accessor.get(IEditorService);
  const control = editorService.activeTextEditorControl;
  if (isCodeEditor(control)) {
    const position = control.getPosition();
    if (position && control.hasModel() && debugService.canSetBreakpointsIn(control.getModel())) {
      const modelUri = control.getModel().uri;
      const breakpointAlreadySet = debugService.getModel().getBreakpoints({ lineNumber: position.lineNumber, uri: modelUri }).some((bp) => bp.sessionAgnosticData.column === position.column || !bp.column && position.column <= 1);
      if (!breakpointAlreadySet) {
        debugService.addBreakpoints(modelUri, [{ lineNumber: position.lineNumber, column: position.column > 1 ? position.column : void 0 }]);
      }
    }
  }
}, "inlineBreakpointHandler");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  weight: 200,
  primary: 1024 | 67,
  when: EditorContextKeys.editorTextFocus,
  id: TOGGLE_INLINE_BREAKPOINT_ID,
  handler: inlineBreakpointHandler
});
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  command: {
    id: TOGGLE_INLINE_BREAKPOINT_ID,
    title: nls.localize("addInlineBreakpoint", "Add Inline Breakpoint"),
    category: DEBUG_COMMAND_CATEGORY
  },
  when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, PanelFocusContext.toNegated(), EditorContextKeys.editorTextFocus, ChatContextKeys.inChatSession.toNegated()),
  group: "debug",
  order: 1
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.openBreakpointToSide",
  weight: 200,
  when: CONTEXT_BREAKPOINTS_FOCUSED,
  primary: 2048 | 3,
  secondary: [
    512 | 3
    /* KeyCode.Enter */
  ],
  handler: /* @__PURE__ */ __name((accessor) => {
    const listService = accessor.get(IListService);
    const list = listService.lastFocusedList;
    if (list instanceof List) {
      const focus = list.getFocusedElements();
      if (focus.length && focus[0] instanceof Breakpoint) {
        return openBreakpointSource(focus[0], true, false, true, accessor.get(IDebugService), accessor.get(IEditorService));
      }
    }
    return void 0;
  }, "handler")
});
registerAction2(class ToggleExceptionBreakpointsAction extends Action2 {
  static {
    __name(this, "ToggleExceptionBreakpointsAction");
  }
  constructor() {
    super({
      id: TOGGLE_EXCEPTION_BREAKPOINTS_ID,
      title: nls.localize2("toggleExceptionBreakpoints", "Toggle Exception Breakpoints"),
      category: DEBUG_COMMAND_CATEGORY,
      f1: true,
      precondition: CONTEXT_DEBUGGERS_AVAILABLE
    });
  }
  async run(accessor) {
    const debugService = accessor.get(IDebugService);
    const quickInputService = accessor.get(IQuickInputService);
    const debugModel = debugService.getModel();
    const session = debugService.getViewModel().focusedSession || debugModel.getSessions()[0];
    const exceptionBreakpoints = session ? debugModel.getExceptionBreakpointsForSession(session.getId()) : debugModel.getExceptionBreakpoints();
    if (exceptionBreakpoints.length === 0) {
      return;
    }
    if (exceptionBreakpoints.length === 1) {
      const breakpoint = exceptionBreakpoints[0];
      await debugService.enableOrDisableBreakpoints(!breakpoint.enabled, breakpoint);
      return;
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick());
    quickPick.placeholder = nls.localize("selectExceptionBreakpointsPlaceholder", "Pick enabled exception breakpoints");
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.items = exceptionBreakpoints.map((bp) => ({
      label: bp.label,
      description: bp.description,
      picked: bp.enabled,
      breakpoint: bp
    }));
    quickPick.selectedItems = quickPick.items.filter((item) => item.picked);
    disposables.add(quickPick.onDidAccept(() => {
      const selectedItems = quickPick.selectedItems;
      const toEnable = [];
      const toDisable = [];
      for (const bp of exceptionBreakpoints) {
        const isSelected = selectedItems.some((item) => item.breakpoint === bp);
        if (isSelected && !bp.enabled) {
          toEnable.push(bp);
        } else if (!isSelected && bp.enabled) {
          toDisable.push(bp);
        }
      }
      const promises = [];
      for (const bp of toEnable) {
        promises.push(debugService.enableOrDisableBreakpoints(true, bp));
      }
      for (const bp of toDisable) {
        promises.push(debugService.enableOrDisableBreakpoints(false, bp));
      }
      Promise.all(promises).then(() => disposables.dispose());
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "debug.openView",
  weight: 200,
  when: CONTEXT_DEBUGGERS_AVAILABLE.toNegated(),
  primary: 63,
  secondary: [
    2048 | 63
    /* KeyCode.F5 */
  ],
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    await paneCompositeService.openPaneComposite(VIEWLET_ID, 0, true);
  }, "handler")
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ATTACH_TO_CURRENT_CODE_RENDERER,
      title: nls.localize2("attachToCurrentCodeRenderer", "Attach to Current Code Renderer")
    });
  }
  async run(accessor) {
    const env = accessor.get(IEnvironmentService);
    if (!env.isExtensionDevelopment && !env.extensionTestsLocationURI) {
      throw new Error("Refusing to attach to renderer outside of development context");
    }
    const windowId = getWindowId(mainWindow);
    const extDebugService = accessor.get(IExtensionHostDebugService);
    const result = await extDebugService.attachToCurrentWindowRenderer(windowId);
    return result;
  }
});
export {
  ADD_CONFIGURATION_ID,
  ADD_TO_WATCH_ID,
  ADD_TO_WATCH_LABEL,
  ATTACH_TO_CURRENT_CODE_RENDERER,
  BREAK_WHEN_VALUE_CHANGES_ID,
  BREAK_WHEN_VALUE_IS_ACCESSED_ID,
  BREAK_WHEN_VALUE_IS_READ_ID,
  CALLSTACK_BOTTOM_ID,
  CALLSTACK_BOTTOM_LABEL,
  CALLSTACK_DOWN_ID,
  CALLSTACK_DOWN_LABEL,
  CALLSTACK_TOP_ID,
  CALLSTACK_TOP_LABEL,
  CALLSTACK_UP_ID,
  CALLSTACK_UP_LABEL,
  CONTINUE_ID,
  CONTINUE_LABEL,
  COPY_ADDRESS_ID,
  COPY_ADDRESS_LABEL,
  COPY_EVALUATE_PATH_ID,
  COPY_EVALUATE_PATH_LABEL,
  COPY_STACK_TRACE_ID,
  COPY_VALUE_ID,
  COPY_VALUE_LABEL,
  COPY_WATCH_EXPRESSION_COMMAND_ID,
  DEBUG_COMMAND_CATEGORY,
  DEBUG_CONFIGURE_COMMAND_ID,
  DEBUG_CONFIGURE_LABEL,
  DEBUG_CONSOLE_QUICK_ACCESS_PREFIX,
  DEBUG_QUICK_ACCESS_PREFIX,
  DEBUG_RUN_COMMAND_ID,
  DEBUG_RUN_LABEL,
  DEBUG_START_COMMAND_ID,
  DEBUG_START_LABEL,
  DISCONNECT_AND_SUSPEND_ID,
  DISCONNECT_AND_SUSPEND_LABEL,
  DISCONNECT_ID,
  DISCONNECT_LABEL,
  EDIT_EXPRESSION_COMMAND_ID,
  FOCUS_REPL_ID,
  FOCUS_SESSION_ID,
  FOCUS_SESSION_LABEL,
  JUMP_TO_CURSOR_ID,
  NEXT_DEBUG_CONSOLE_ID,
  NEXT_DEBUG_CONSOLE_LABEL,
  OPEN_LOADED_SCRIPTS_LABEL,
  PAUSE_ID,
  PAUSE_LABEL,
  PREV_DEBUG_CONSOLE_ID,
  PREV_DEBUG_CONSOLE_LABEL,
  REMOVE_EXPRESSION_COMMAND_ID,
  RESTART_FRAME_ID,
  RESTART_LABEL,
  RESTART_SESSION_ID,
  REVERSE_CONTINUE_ID,
  SELECT_AND_START_ID,
  SELECT_AND_START_LABEL,
  SELECT_DEBUG_CONSOLE_ID,
  SELECT_DEBUG_CONSOLE_LABEL,
  SELECT_DEBUG_SESSION_ID,
  SELECT_DEBUG_SESSION_LABEL,
  SET_EXPRESSION_COMMAND_ID,
  SHOW_LOADED_SCRIPTS_ID,
  STEP_BACK_ID,
  STEP_INTO_ID,
  STEP_INTO_LABEL,
  STEP_INTO_TARGET_ID,
  STEP_INTO_TARGET_LABEL,
  STEP_OUT_ID,
  STEP_OUT_LABEL,
  STEP_OVER_ID,
  STEP_OVER_LABEL,
  STOP_ID,
  STOP_LABEL,
  TERMINATE_THREAD_ID,
  TOGGLE_BREAKPOINT_ID,
  TOGGLE_EXCEPTION_BREAKPOINTS_ID,
  TOGGLE_INLINE_BREAKPOINT_ID,
  setDataBreakpointInfoResponse
};
//# sourceMappingURL=debugCommands.js.map
