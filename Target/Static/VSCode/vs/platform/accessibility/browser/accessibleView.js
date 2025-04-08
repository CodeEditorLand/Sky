var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IKeyboardEvent } from "../../keybinding/common/keybinding.js";
import { IPickerQuickAccessItem } from "../../quickinput/browser/pickerQuickAccess.js";
import { Event } from "../../../base/common/event.js";
import { IAction } from "../../../base/common/actions.js";
import { IQuickPickItem } from "../../quickinput/common/quickInput.js";
import { IDisposable, Disposable } from "../../../base/common/lifecycle.js";
const IAccessibleViewService = createDecorator("accessibleViewService");
var AccessibleViewProviderId = /* @__PURE__ */ ((AccessibleViewProviderId2) => {
  AccessibleViewProviderId2["Terminal"] = "terminal";
  AccessibleViewProviderId2["TerminalChat"] = "terminal-chat";
  AccessibleViewProviderId2["TerminalHelp"] = "terminal-help";
  AccessibleViewProviderId2["DiffEditor"] = "diffEditor";
  AccessibleViewProviderId2["MergeEditor"] = "mergeEditor";
  AccessibleViewProviderId2["PanelChat"] = "panelChat";
  AccessibleViewProviderId2["InlineChat"] = "inlineChat";
  AccessibleViewProviderId2["AgentChat"] = "agentChat";
  AccessibleViewProviderId2["QuickChat"] = "quickChat";
  AccessibleViewProviderId2["InlineCompletions"] = "inlineCompletions";
  AccessibleViewProviderId2["KeybindingsEditor"] = "keybindingsEditor";
  AccessibleViewProviderId2["Notebook"] = "notebook";
  AccessibleViewProviderId2["ReplEditor"] = "replEditor";
  AccessibleViewProviderId2["Editor"] = "editor";
  AccessibleViewProviderId2["Hover"] = "hover";
  AccessibleViewProviderId2["Notification"] = "notification";
  AccessibleViewProviderId2["EmptyEditorHint"] = "emptyEditorHint";
  AccessibleViewProviderId2["Comments"] = "comments";
  AccessibleViewProviderId2["CommentThread"] = "commentThread";
  AccessibleViewProviderId2["Repl"] = "repl";
  AccessibleViewProviderId2["ReplHelp"] = "replHelp";
  AccessibleViewProviderId2["RunAndDebug"] = "runAndDebug";
  AccessibleViewProviderId2["Walkthrough"] = "walkthrough";
  AccessibleViewProviderId2["SourceControl"] = "scm";
  return AccessibleViewProviderId2;
})(AccessibleViewProviderId || {});
var AccessibleViewType = /* @__PURE__ */ ((AccessibleViewType2) => {
  AccessibleViewType2["Help"] = "help";
  AccessibleViewType2["View"] = "view";
  return AccessibleViewType2;
})(AccessibleViewType || {});
var NavigationType = /* @__PURE__ */ ((NavigationType2) => {
  NavigationType2["Previous"] = "previous";
  NavigationType2["Next"] = "next";
  return NavigationType2;
})(NavigationType || {});
class AccessibleContentProvider extends Disposable {
  constructor(id, options, provideContent, onClose, verbositySettingKey, onOpen, actions, provideNextContent, providePreviousContent, onDidChangeContent, onKeyDown, getSymbols, onDidRequestClearLastProvider) {
    super();
    this.id = id;
    this.options = options;
    this.provideContent = provideContent;
    this.onClose = onClose;
    this.verbositySettingKey = verbositySettingKey;
    this.onOpen = onOpen;
    this.actions = actions;
    this.provideNextContent = provideNextContent;
    this.providePreviousContent = providePreviousContent;
    this.onDidChangeContent = onDidChangeContent;
    this.onKeyDown = onKeyDown;
    this.getSymbols = getSymbols;
    this.onDidRequestClearLastProvider = onDidRequestClearLastProvider;
  }
  static {
    __name(this, "AccessibleContentProvider");
  }
}
function isIAccessibleViewContentProvider(obj) {
  return obj && obj.id && obj.options && obj.provideContent && obj.onClose && obj.verbositySettingKey;
}
__name(isIAccessibleViewContentProvider, "isIAccessibleViewContentProvider");
class ExtensionContentProvider extends Disposable {
  constructor(id, options, provideContent, onClose, onOpen, provideNextContent, providePreviousContent, actions, onDidChangeContent) {
    super();
    this.id = id;
    this.options = options;
    this.provideContent = provideContent;
    this.onClose = onClose;
    this.onOpen = onOpen;
    this.provideNextContent = provideNextContent;
    this.providePreviousContent = providePreviousContent;
    this.actions = actions;
    this.onDidChangeContent = onDidChangeContent;
  }
  static {
    __name(this, "ExtensionContentProvider");
  }
}
export {
  AccessibleContentProvider,
  AccessibleViewProviderId,
  AccessibleViewType,
  ExtensionContentProvider,
  IAccessibleViewService,
  NavigationType,
  isIAccessibleViewContentProvider
};
//# sourceMappingURL=accessibleView.js.map
