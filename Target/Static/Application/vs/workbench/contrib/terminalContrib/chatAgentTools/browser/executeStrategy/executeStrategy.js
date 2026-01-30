var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise, RunOnceScheduler } from "../../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
async function waitForIdle(onData, idleDurationMs) {
  const store = new DisposableStore();
  const deferred = new DeferredPromise();
  const scheduler = store.add(new RunOnceScheduler(() => deferred.complete(), idleDurationMs));
  store.add(onData(() => scheduler.schedule()));
  scheduler.schedule();
  return deferred.p.finally(() => store.dispose());
}
__name(waitForIdle, "waitForIdle");
function detectsCommonPromptPattern(cursorLine) {
  if (cursorLine.trim().length === 0) {
    return { detected: false, reason: "Content is empty or contains only whitespace" };
  }
  if (/PS\s+[A-Z]:\\.*>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `PowerShell prompt pattern detected: "${cursorLine}"` };
  }
  if (/^[A-Z]:\\.*>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Command Prompt pattern detected: "${cursorLine}"` };
  }
  if (/\$\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Bash-style prompt pattern detected: "${cursorLine}"` };
  }
  if (/#\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Root prompt pattern detected: "${cursorLine}"` };
  }
  if (/^>>>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Python REPL prompt pattern detected: "${cursorLine}"` };
  }
  if (/\u276f\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Starship prompt pattern detected: "${cursorLine}"` };
  }
  if (/[>%]\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Generic prompt pattern detected: "${cursorLine}"` };
  }
  return { detected: false, reason: `No common prompt pattern found in last line: "${cursorLine}"` };
}
__name(detectsCommonPromptPattern, "detectsCommonPromptPattern");
async function waitForIdleWithPromptHeuristics(onData, instance, idlePollIntervalMs, extendedTimeoutMs) {
  await waitForIdle(onData, idlePollIntervalMs);
  const xterm = await instance.xtermReadyPromise;
  if (!xterm) {
    return { detected: false, reason: `Xterm not available, using ${idlePollIntervalMs}ms timeout` };
  }
  const startTime = Date.now();
  while (Date.now() - startTime < extendedTimeoutMs) {
    try {
      let content = "";
      const buffer = xterm.raw.buffer.active;
      const line = buffer.getLine(buffer.baseY + buffer.cursorY);
      if (line) {
        content = line.translateToString(true);
      }
      const promptResult = detectsCommonPromptPattern(content);
      if (promptResult.detected) {
        return promptResult;
      }
    } catch (error) {
    }
    await waitForIdle(onData, Math.min(idlePollIntervalMs, extendedTimeoutMs - (Date.now() - startTime)));
  }
  try {
    let content = "";
    const buffer = xterm.raw.buffer.active;
    const line = buffer.getLine(buffer.baseY + buffer.cursorY);
    if (line) {
      content = line.translateToString(true) + "\n";
    }
    return { detected: false, reason: `Extended timeout reached without prompt detection. Last line: "${content.trim()}"` };
  } catch (error) {
    return { detected: false, reason: `Extended timeout reached. Error reading terminal content: ${error}` };
  }
}
__name(waitForIdleWithPromptHeuristics, "waitForIdleWithPromptHeuristics");
async function trackIdleOnPrompt(instance, idleDurationMs, store) {
  const idleOnPrompt = new DeferredPromise();
  const onData = instance.onData;
  const scheduler = store.add(new RunOnceScheduler(() => {
    idleOnPrompt.complete();
  }, idleDurationMs));
  let state = 0;
  const promptFallbackScheduler = store.add(new RunOnceScheduler(() => {
    if (state === 2 || state === 3) {
      promptFallbackScheduler.cancel();
      return;
    }
    state = 3;
    scheduler.schedule();
  }, 1e3));
  let TerminalState;
  (function(TerminalState2) {
    TerminalState2[TerminalState2["Initial"] = 0] = "Initial";
    TerminalState2[TerminalState2["Prompt"] = 1] = "Prompt";
    TerminalState2[TerminalState2["Executing"] = 2] = "Executing";
    TerminalState2[TerminalState2["PromptAfterExecuting"] = 3] = "PromptAfterExecuting";
  })(TerminalState || (TerminalState = {}));
  store.add(onData((e) => {
    const matches = e.matchAll(/(?:\x1b\]|\x9d)[16]33;(?<type>[ACD])(?:;.*)?(?:\x1b\\|\x07|\x9c)/g);
    for (const match of matches) {
      if (match.groups?.type === "A") {
        if (state === 0) {
          state = 1;
        } else if (state === 2) {
          state = 3;
        }
      } else if (match.groups?.type === "C" || match.groups?.type === "D") {
        state = 2;
      }
    }
    if (state === 3) {
      promptFallbackScheduler.cancel();
      scheduler.schedule();
    } else {
      scheduler.cancel();
      if (state === 0 || state === 1) {
        promptFallbackScheduler.schedule();
      } else {
        promptFallbackScheduler.cancel();
      }
    }
  }));
  return idleOnPrompt.p;
}
__name(trackIdleOnPrompt, "trackIdleOnPrompt");
export {
  detectsCommonPromptPattern,
  trackIdleOnPrompt,
  waitForIdle,
  waitForIdleWithPromptHeuristics
};
//# sourceMappingURL=executeStrategy.js.map
