var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { StatusBarAlignment as ExtHostStatusBarAlignment, Disposable, ThemeColor, asStatusBarItemIdentifier } from "./extHostTypes.js";
import { MainContext, MainThreadStatusBarShape, IMainContext, ICommandDto, ExtHostStatusBarShape, StatusBarItemDto } from "./extHost.protocol.js";
import { localize } from "../../../nls.js";
import { CommandsConverter } from "./extHostCommands.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { MarkdownString } from "./extHostTypeConverters.js";
import { isNumber } from "../../../base/common/types.js";
import * as htmlContent from "../../../base/common/htmlContent.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
class ExtHostStatusBarEntry {
  constructor(proxy, commands, staticItems, extension, id, alignment = ExtHostStatusBarAlignment.Left, priority, _onDispose) {
    this._onDispose = _onDispose;
    this.#proxy = proxy;
    this.#commands = commands;
    if (id && extension) {
      this._entryId = asStatusBarItemIdentifier(extension.identifier, id);
      const item = staticItems.get(this._entryId);
      if (item) {
        alignment = item.alignLeft ? ExtHostStatusBarAlignment.Left : ExtHostStatusBarAlignment.Right;
        priority = item.priority;
        this._visible = true;
        this.name = item.name;
        this.text = item.text;
        this.tooltip = item.tooltip;
        this.command = item.command;
        this.accessibilityInformation = item.accessibilityInformation;
      }
    } else {
      this._entryId = String(ExtHostStatusBarEntry.ID_GEN++);
    }
    this._extension = extension;
    this._id = id;
    this._alignment = alignment;
    this._priority = this.validatePriority(priority);
  }
  static {
    __name(this, "ExtHostStatusBarEntry");
  }
  static ID_GEN = 0;
  static ALLOWED_BACKGROUND_COLORS = /* @__PURE__ */ new Map(
    [
      ["statusBarItem.errorBackground", new ThemeColor("statusBarItem.errorForeground")],
      ["statusBarItem.warningBackground", new ThemeColor("statusBarItem.warningForeground")]
    ]
  );
  #proxy;
  #commands;
  _entryId;
  _extension;
  _id;
  _alignment;
  _priority;
  _disposed = false;
  _visible;
  _text = "";
  _tooltip;
  _tooltip2;
  _name;
  _color;
  _backgroundColor;
  // eslint-disable-next-line local/code-no-potentially-unsafe-disposables
  _latestCommandRegistration;
  _staleCommandRegistrations = new DisposableStore();
  _command;
  _timeoutHandle;
  _accessibilityInformation;
  validatePriority(priority) {
    if (!isNumber(priority)) {
      return void 0;
    }
    if (priority === Number.POSITIVE_INFINITY) {
      return Number.MAX_VALUE;
    }
    if (priority === Number.NEGATIVE_INFINITY) {
      return -Number.MAX_VALUE;
    }
    return priority;
  }
  get id() {
    return this._id ?? this._extension.identifier.value;
  }
  get entryId() {
    return this._entryId;
  }
  get alignment() {
    return this._alignment;
  }
  get priority() {
    return this._priority;
  }
  get text() {
    return this._text;
  }
  get name() {
    return this._name;
  }
  get tooltip() {
    return this._tooltip;
  }
  get tooltip2() {
    if (this._extension) {
      checkProposedApiEnabled(this._extension, "statusBarItemTooltip");
    }
    return this._tooltip2;
  }
  get color() {
    return this._color;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  get command() {
    return this._command?.fromApi;
  }
  get accessibilityInformation() {
    return this._accessibilityInformation;
  }
  set text(text) {
    this._text = text;
    this.update();
  }
  set name(name) {
    this._name = name;
    this.update();
  }
  set tooltip(tooltip) {
    this._tooltip = tooltip;
    this.update();
  }
  set tooltip2(tooltip) {
    if (this._extension) {
      checkProposedApiEnabled(this._extension, "statusBarItemTooltip");
    }
    this._tooltip2 = tooltip;
    this.update();
  }
  set color(color) {
    this._color = color;
    this.update();
  }
  set backgroundColor(color) {
    if (color && !ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color.id)) {
      color = void 0;
    }
    this._backgroundColor = color;
    this.update();
  }
  set command(command) {
    if (this._command?.fromApi === command) {
      return;
    }
    if (this._latestCommandRegistration) {
      this._staleCommandRegistrations.add(this._latestCommandRegistration);
    }
    this._latestCommandRegistration = new DisposableStore();
    if (typeof command === "string") {
      this._command = {
        fromApi: command,
        internal: this.#commands.toInternal({ title: "", command }, this._latestCommandRegistration)
      };
    } else if (command) {
      this._command = {
        fromApi: command,
        internal: this.#commands.toInternal(command, this._latestCommandRegistration)
      };
    } else {
      this._command = void 0;
    }
    this.update();
  }
  set accessibilityInformation(accessibilityInformation) {
    this._accessibilityInformation = accessibilityInformation;
    this.update();
  }
  show() {
    this._visible = true;
    this.update();
  }
  hide() {
    clearTimeout(this._timeoutHandle);
    this._visible = false;
    this.#proxy.$disposeEntry(this._entryId);
  }
  update() {
    if (this._disposed || !this._visible) {
      return;
    }
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = setTimeout(() => {
      this._timeoutHandle = void 0;
      let id;
      if (this._extension) {
        if (this._id) {
          id = `${this._extension.identifier.value}.${this._id}`;
        } else {
          id = this._extension.identifier.value;
        }
      } else {
        id = this._id;
      }
      let name;
      if (this._name) {
        name = this._name;
      } else {
        name = localize("extensionLabel", "{0} (Extension)", this._extension.displayName || this._extension.name);
      }
      let color = this._color;
      if (this._backgroundColor) {
        color = ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
      }
      let tooltip;
      let hasTooltipProvider;
      if (typeof this._tooltip2 === "function") {
        tooltip = MarkdownString.fromStrict(this._tooltip);
        hasTooltipProvider = true;
      } else {
        tooltip = MarkdownString.fromStrict(this._tooltip2 ?? this._tooltip);
        hasTooltipProvider = false;
      }
      this.#proxy.$setEntry(
        this._entryId,
        id,
        this._extension?.identifier.value,
        name,
        this._text,
        tooltip,
        hasTooltipProvider,
        this._command?.internal,
        color,
        this._backgroundColor,
        this._alignment === ExtHostStatusBarAlignment.Left,
        this._priority,
        this._accessibilityInformation
      );
      this._staleCommandRegistrations.clear();
    }, 0);
  }
  dispose() {
    this.hide();
    this._onDispose?.();
    this._disposed = true;
  }
}
class StatusBarMessage {
  static {
    __name(this, "StatusBarMessage");
  }
  _item;
  _messages = [];
  constructor(statusBar) {
    this._item = statusBar.createStatusBarEntry(void 0, "status.extensionMessage", ExtHostStatusBarAlignment.Left, Number.MIN_VALUE);
    this._item.name = localize("status.extensionMessage", "Extension Status");
  }
  dispose() {
    this._messages.length = 0;
    this._item.dispose();
  }
  setMessage(message) {
    const data = { message };
    this._messages.unshift(data);
    this._update();
    return new Disposable(() => {
      const idx = this._messages.indexOf(data);
      if (idx >= 0) {
        this._messages.splice(idx, 1);
        this._update();
      }
    });
  }
  _update() {
    if (this._messages.length > 0) {
      this._item.text = this._messages[0].message;
      this._item.show();
    } else {
      this._item.hide();
    }
  }
}
class ExtHostStatusBar {
  static {
    __name(this, "ExtHostStatusBar");
  }
  _proxy;
  _commands;
  _statusMessage;
  _entries = /* @__PURE__ */ new Map();
  _existingItems = /* @__PURE__ */ new Map();
  constructor(mainContext, commands) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadStatusBar);
    this._commands = commands;
    this._statusMessage = new StatusBarMessage(this);
  }
  $acceptStaticEntries(added) {
    for (const item of added) {
      this._existingItems.set(item.entryId, item);
    }
  }
  async $provideTooltip(entryId, cancellation) {
    const entry = this._entries.get(entryId);
    if (!entry) {
      return void 0;
    }
    const tooltip = typeof entry.tooltip2 === "function" ? await entry.tooltip2(cancellation) : entry.tooltip2;
    return !cancellation.isCancellationRequested ? MarkdownString.fromStrict(tooltip) : void 0;
  }
  createStatusBarEntry(extension, id, alignment, priority) {
    const entry = new ExtHostStatusBarEntry(this._proxy, this._commands, this._existingItems, extension, id, alignment, priority, () => this._entries.delete(entry.entryId));
    this._entries.set(entry.entryId, entry);
    return entry;
  }
  setStatusBarMessage(text, timeoutOrThenable) {
    const d = this._statusMessage.setMessage(text);
    let handle;
    if (typeof timeoutOrThenable === "number") {
      handle = setTimeout(() => d.dispose(), timeoutOrThenable);
    } else if (typeof timeoutOrThenable !== "undefined") {
      timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
    }
    return new Disposable(() => {
      d.dispose();
      clearTimeout(handle);
    });
  }
}
export {
  ExtHostStatusBar,
  ExtHostStatusBarEntry
};
//# sourceMappingURL=extHostStatusBar.js.map
