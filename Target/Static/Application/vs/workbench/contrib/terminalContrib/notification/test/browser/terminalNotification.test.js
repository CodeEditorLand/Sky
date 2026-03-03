var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual } from "assert";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { NotificationPriority, Severity } from "../../../../../../platform/notification/common/notification.js";
import { TerminalNotificationHandler } from "../../browser/terminalNotificationHandler.js";
class TestNotificationProgress {
  static {
    __name(this, "TestNotificationProgress");
  }
  infinite() {
  }
  total(_value) {
  }
  worked(_value) {
  }
  done() {
  }
}
class TestNotificationHandle {
  static {
    __name(this, "TestNotificationHandle");
  }
  constructor(notification) {
    this._onDidClose = new Emitter();
    this.onDidClose = this._onDidClose.event;
    this.onDidChangeVisibility = Event.None;
    this.progress = new TestNotificationProgress();
    this.closed = false;
    this.message = notification.message;
    this.severity = notification.severity;
    this.actions = notification.actions;
    this.priority = notification.priority;
    this.source = notification.source;
  }
  updateSeverity(severity) {
    this.severity = severity;
  }
  updateMessage(message) {
    this.message = message;
  }
  updateActions(actions) {
    this._disposeActions(this.actions);
    this.actions = actions;
  }
  close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this._disposeActions(this.actions);
    this._onDidClose.fire();
  }
  _disposeActions(actions) {
    for (const action of actions?.primary ?? []) {
      const disposable = action;
      if (typeof disposable.dispose === "function") {
        disposable.dispose();
      }
    }
    for (const action of actions?.secondary ?? []) {
      const disposable = action;
      if (typeof disposable.dispose === "function") {
        disposable.dispose();
      }
    }
  }
}
class TestOsc99Host {
  static {
    __name(this, "TestOsc99Host");
  }
  constructor() {
    this.enabled = true;
    this.windowFocused = false;
    this.terminalVisible = false;
    this.writes = [];
    this.notifications = [];
    this.focusCalls = 0;
    this.updatedEnableNotifications = [];
    this.logMessages = [];
  }
  isEnabled() {
    return this.enabled;
  }
  isWindowFocused() {
    return this.windowFocused;
  }
  isTerminalVisible() {
    return this.terminalVisible;
  }
  focusTerminal() {
    this.focusCalls++;
  }
  notify(notification) {
    const handle = new TestNotificationHandle(notification);
    this.notifications.push(handle);
    return handle;
  }
  async updateEnableNotifications(value) {
    this.enabled = value;
    this.updatedEnableNotifications.push(value);
  }
  logWarn(message) {
    this.logMessages.push(message);
  }
  writeToProcess(data) {
    this.writes.push(data);
  }
}
suite("Terminal OSC 99 notifications", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let host;
  let handler;
  setup(() => {
    host = new TestOsc99Host();
    handler = store.add(new TerminalNotificationHandler(host));
  });
  teardown(() => {
    for (const notification of host.notifications) {
      notification.close();
    }
  });
  test("ignores notifications when disabled", () => {
    host.enabled = false;
    handler.handleSequence(";Hello");
    strictEqual(host.notifications.length, 0);
    strictEqual(host.writes.length, 0);
  });
  test("creates notification for title and body and updates", () => {
    handler.handleSequence("i=1:d=0:p=title;Hello");
    strictEqual(host.notifications.length, 0);
    handler.handleSequence("i=1:p=body;World");
    strictEqual(host.notifications.length, 1);
    strictEqual(host.notifications[0].message, "Hello: World");
  });
  test("decodes base64 payloads", () => {
    handler.handleSequence("e=1:p=title;SGVsbG8=");
    strictEqual(host.notifications.length, 1);
    strictEqual(host.notifications[0].message, "Hello");
  });
  test("sanitizes markdown links in payloads", () => {
    handler.handleSequence("i=link:d=0:p=title;Click [run](command:workbench.action.reloadWindow)");
    handler.handleSequence("i=link:p=body;See [docs](https://example.com)");
    strictEqual(host.notifications.length, 1);
    strictEqual(host.notifications[0].message, "Click run: See docs");
  });
  test("defers display until done", () => {
    handler.handleSequence("i=chunk:d=0:p=title;Hello ");
    strictEqual(host.notifications.length, 0);
    handler.handleSequence("i=chunk:d=1:p=title;World");
    strictEqual(host.notifications.length, 1);
    strictEqual(host.notifications[0].message, "Hello World");
  });
  test("reports activation on button click", async () => {
    handler.handleSequence("i=btn:d=0:a=report:p=title;Hi");
    handler.handleSequence("i=btn:p=buttons;Yes");
    const actions = host.notifications[0].actions;
    if (!actions?.primary || actions.primary.length === 0) {
      throw new Error("Expected primary actions");
    }
    await actions.primary[0].run();
    strictEqual(host.writes[0], "\x1B]99;i=btn;1\x1B\\");
  });
  test("supports buttons before title and reports body activation", async () => {
    handler.handleSequence("i=btn:p=buttons;One\u2028Two");
    handler.handleSequence("i=btn:a=report;Buttons test");
    strictEqual(host.notifications.length, 1);
    const actions = host.notifications[0].actions;
    if (!actions?.primary || actions.primary.length !== 2) {
      throw new Error("Expected two primary actions");
    }
    strictEqual(actions.primary[0].label, "One");
    strictEqual(actions.primary[1].label, "Two");
    await actions.primary[1].run();
    strictEqual(host.writes[0], "\x1B]99;i=btn;2\x1B\\");
  });
  test("reports activation when notification closes without button action", () => {
    handler.handleSequence("i=btn:p=buttons;One\u2028Two");
    handler.handleSequence("i=btn:a=report;Buttons test");
    host.notifications[0].close();
    strictEqual(host.writes[0], "\x1B]99;i=btn;\x1B\\");
  });
  test("sends close report when requested", () => {
    handler.handleSequence("i=close:c=1:p=title;Bye");
    strictEqual(host.notifications.length, 1);
    host.notifications[0].close();
    strictEqual(host.writes[0], "\x1B]99;i=close:p=close;\x1B\\");
  });
  test("responds to query and alive", () => {
    handler.handleSequence("i=a:p=title;A");
    handler.handleSequence("i=b:p=title;B");
    handler.handleSequence("i=q:p=?;");
    handler.handleSequence("i=q:p=alive;");
    strictEqual(host.writes[0], "\x1B]99;i=q:p=?:a=report,focus:c=1:o=always,unfocused,invisible:p=title,body,buttons,close,alive,?:u=0,1,2:w=1;\x1B\\");
    strictEqual(host.writes[1], "\x1B]99;i=q:p=alive;a,b\x1B\\");
  });
  test("honors occasion for visibility and focus", () => {
    host.windowFocused = true;
    host.terminalVisible = true;
    handler.handleSequence("o=unfocused:p=title;Hidden");
    strictEqual(host.notifications.length, 0);
    host.windowFocused = false;
    host.terminalVisible = true;
    handler.handleSequence("o=invisible:p=title;Hidden");
    strictEqual(host.notifications.length, 0);
    host.terminalVisible = false;
    handler.handleSequence("o=invisible:p=title;Shown");
    strictEqual(host.notifications.length, 1);
  });
  test("closes notifications via close payload", () => {
    handler.handleSequence("i=closeme:p=title;Close");
    strictEqual(host.notifications.length, 1);
    strictEqual(host.notifications[0].closed, false);
    handler.handleSequence("i=closeme:p=close;");
    strictEqual(host.notifications[0].closed, true);
  });
  test("maps urgency to severity and priority", () => {
    handler.handleSequence("u=2:p=title;Urgent");
    strictEqual(host.notifications[0].severity, Severity.Warning);
    strictEqual(host.notifications[0].priority, NotificationPriority.URGENT);
  });
});
//# sourceMappingURL=terminalNotification.test.js.map
