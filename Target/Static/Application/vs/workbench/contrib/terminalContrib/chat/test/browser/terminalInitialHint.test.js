var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ShellIntegrationAddon } from "../../../../../../platform/terminal/common/xterm/shellIntegrationAddon.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { NullLogService } from "../../../../../../platform/log/common/log.js";
import { InitialHintAddon } from "../../browser/terminal.initialHint.contribution.js";
import { getActiveDocument } from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { strictEqual } from "assert";
import { ExtensionIdentifier } from "../../../../../../platform/extensions/common/extensions.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ChatAgentLocation, ChatMode } from "../../../../chat/common/constants.js";
suite("Terminal Initial Hint Addon", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let eventCount = 0;
  let xterm;
  let initialHintAddon;
  const onDidChangeAgentsEmitter = new Emitter();
  const onDidChangeAgents = onDidChangeAgentsEmitter.event;
  const agent = {
    id: "termminal",
    name: "terminal",
    extensionId: new ExtensionIdentifier("test"),
    extensionPublisherId: "test",
    extensionDisplayName: "test",
    metadata: {},
    slashCommands: [{ name: "test", description: "test" }],
    disambiguation: [],
    locations: [ChatAgentLocation.fromRaw("terminal")],
    modes: [ChatMode.Ask],
    invoke: /* @__PURE__ */ __name(async () => {
      return {};
    }, "invoke")
  };
  const editorAgent = {
    id: "editor",
    name: "editor",
    extensionId: new ExtensionIdentifier("test-editor"),
    extensionPublisherId: "test-editor",
    extensionDisplayName: "test-editor",
    metadata: {},
    slashCommands: [{ name: "test", description: "test" }],
    locations: [ChatAgentLocation.fromRaw("editor")],
    modes: [ChatMode.Ask],
    disambiguation: [],
    invoke: /* @__PURE__ */ __name(async () => {
      return {};
    }, "invoke")
  };
  setup(async () => {
    const instantiationService = workbenchInstantiationService({}, store);
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor());
    const shellIntegrationAddon = store.add(new ShellIntegrationAddon("", true, void 0, void 0, new NullLogService()));
    initialHintAddon = store.add(instantiationService.createInstance(InitialHintAddon, shellIntegrationAddon.capabilities, onDidChangeAgents));
    store.add(initialHintAddon.onDidRequestCreateHint(() => eventCount++));
    const testContainer = document.createElement("div");
    getActiveDocument().body.append(testContainer);
    xterm.open(testContainer);
    xterm.loadAddon(shellIntegrationAddon);
    xterm.loadAddon(initialHintAddon);
  });
  suite("Chat providers", () => {
    test("hint is not shown when there are no chat providers", () => {
      eventCount = 0;
      xterm.focus();
      strictEqual(eventCount, 0);
    });
    test("hint is not shown when there is just an editor agent", () => {
      eventCount = 0;
      onDidChangeAgentsEmitter.fire(editorAgent);
      xterm.focus();
      strictEqual(eventCount, 0);
    });
    test("hint is shown when there is a terminal chat agent", () => {
      eventCount = 0;
      onDidChangeAgentsEmitter.fire(editorAgent);
      xterm.focus();
      strictEqual(eventCount, 0);
      onDidChangeAgentsEmitter.fire(agent);
      strictEqual(eventCount, 1);
    });
    test("hint is not shown again when another terminal chat agent is added if it has already shown", () => {
      eventCount = 0;
      onDidChangeAgentsEmitter.fire(agent);
      xterm.focus();
      strictEqual(eventCount, 1);
      onDidChangeAgentsEmitter.fire(agent);
      strictEqual(eventCount, 1);
    });
  });
  suite("Input", () => {
    test("hint is not shown when there has been input", () => {
      onDidChangeAgentsEmitter.fire(agent);
      xterm.writeln("data");
      setTimeout(() => {
        xterm.focus();
        strictEqual(eventCount, 0);
      }, 50);
    });
  });
});
//# sourceMappingURL=terminalInitialHint.test.js.map
