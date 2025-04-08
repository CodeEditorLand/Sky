var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { $, append, clearNode, h } from "../../../../base/browser/dom.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { coalesce, shuffle } from "../../../../base/common/arrays.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { isMacintosh, isWeb, OS } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, ContextKeyExpression, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IStorageService, StorageScope, StorageTarget, WillSaveStateReason } from "../../../../platform/storage/common/storage.js";
import { defaultKeybindingLabelStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { editorForeground, registerColor, transparent } from "../../../../platform/theme/common/colorRegistry.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
const showCommands = { text: localize("watermark.showCommands", "Show All Commands"), id: "workbench.action.showCommands" };
const gotoFile = { text: localize("watermark.quickAccess", "Go to File"), id: "workbench.action.quickOpen" };
const openFile = { text: localize("watermark.openFile", "Open File"), id: "workbench.action.files.openFile" };
const openFolder = { text: localize("watermark.openFolder", "Open Folder"), id: "workbench.action.files.openFolder" };
const openFileOrFolder = { text: localize("watermark.openFileFolder", "Open File or Folder"), id: "workbench.action.files.openFileFolder" };
const openRecent = { text: localize("watermark.openRecent", "Open Recent"), id: "workbench.action.openRecent" };
const newUntitledFile = { text: localize("watermark.newUntitledFile", "New Untitled Text File"), id: "workbench.action.files.newUntitledFile" };
const findInFiles = { text: localize("watermark.findInFiles", "Find in Files"), id: "workbench.action.findInFiles" };
const toggleTerminal = { text: localize({ key: "watermark.toggleTerminal", comment: ["toggle is a verb here"] }, "Toggle Terminal"), id: "workbench.action.terminal.toggleTerminal", when: { web: ContextKeyExpr.equals("terminalProcessSupported", true) } };
const startDebugging = { text: localize("watermark.startDebugging", "Start Debugging"), id: "workbench.action.debug.start", when: { web: ContextKeyExpr.equals("terminalProcessSupported", true) } };
const openSettings = { text: localize("watermark.openSettings", "Open Settings"), id: "workbench.action.openSettings" };
const showCopilot = ContextKeyExpr.or(ContextKeyExpr.equals("chatSetupHidden", false), ContextKeyExpr.equals("chatSetupInstalled", true));
const openChat = { text: localize("watermark.openChat", "Open Chat"), id: "workbench.action.chat.open", when: { native: showCopilot, web: showCopilot } };
const emptyWindowEntries = coalesce([
  showCommands,
  ...isMacintosh && !isWeb ? [openFileOrFolder] : [openFile, openFolder],
  openRecent,
  isMacintosh && !isWeb ? newUntitledFile : void 0,
  // fill in one more on macOS to get to 5 entries
  openChat
]);
const randomEmptyWindowEntries = [
  /* Nothing yet */
];
const workspaceEntries = [
  showCommands,
  gotoFile,
  openChat
];
const randomWorkspaceEntries = [
  findInFiles,
  startDebugging,
  toggleTerminal,
  openSettings
];
let EditorGroupWatermark = class extends Disposable {
  constructor(container, keybindingService, contextService, contextKeyService, configurationService, storageService) {
    super();
    this.keybindingService = keybindingService;
    this.contextService = contextService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.cachedWhen = this.storageService.getObject(EditorGroupWatermark.CACHED_WHEN, StorageScope.PROFILE, /* @__PURE__ */ Object.create(null));
    this.workbenchState = this.contextService.getWorkbenchState();
    const elements = h(".editor-group-watermark", [
      h(".letterpress"),
      h(".shortcuts@shortcuts")
    ]);
    append(container, elements.root);
    this.shortcuts = elements.shortcuts;
    this.registerListeners();
    this.render();
  }
  static {
    __name(this, "EditorGroupWatermark");
  }
  static CACHED_WHEN = "editorGroupWatermark.whenConditions";
  cachedWhen;
  shortcuts;
  transientDisposables = this._register(new DisposableStore());
  keybindingLabels = this._register(new DisposableStore());
  enabled = false;
  workbenchState;
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.tips.enabled") && this.enabled !== this.configurationService.getValue("workbench.tips.enabled")) {
        this.render();
      }
    }));
    this._register(this.contextService.onDidChangeWorkbenchState((workbenchState) => {
      if (this.workbenchState !== workbenchState) {
        this.workbenchState = workbenchState;
        this.render();
      }
    }));
    this._register(this.storageService.onWillSaveState((e) => {
      if (e.reason === WillSaveStateReason.SHUTDOWN) {
        const entries = [...emptyWindowEntries, ...randomEmptyWindowEntries, ...workspaceEntries, ...randomWorkspaceEntries];
        for (const entry of entries) {
          const when = isWeb ? entry.when?.web : entry.when?.native;
          if (when) {
            this.cachedWhen[entry.id] = this.contextKeyService.contextMatchesRules(when);
          }
        }
        this.storageService.store(EditorGroupWatermark.CACHED_WHEN, JSON.stringify(this.cachedWhen), StorageScope.PROFILE, StorageTarget.MACHINE);
      }
    }));
  }
  render() {
    this.enabled = this.configurationService.getValue("workbench.tips.enabled");
    clearNode(this.shortcuts);
    this.transientDisposables.clear();
    if (!this.enabled) {
      return;
    }
    const fixedEntries = this.filterEntries(
      this.workbenchState !== WorkbenchState.EMPTY ? workspaceEntries : emptyWindowEntries,
      false
      /* not shuffled */
    );
    const randomEntries = this.filterEntries(
      this.workbenchState !== WorkbenchState.EMPTY ? randomWorkspaceEntries : randomEmptyWindowEntries,
      true
      /* shuffled */
    ).slice(0, Math.max(0, 5 - fixedEntries.length));
    const entries = [...fixedEntries, ...randomEntries];
    const box = append(this.shortcuts, $(".watermark-box"));
    const update = /* @__PURE__ */ __name(() => {
      clearNode(box);
      this.keybindingLabels.clear();
      for (const entry of entries) {
        const keys = this.keybindingService.lookupKeybinding(entry.id);
        if (!keys) {
          continue;
        }
        const dl = append(box, $("dl"));
        const dt = append(dl, $("dt"));
        dt.textContent = entry.text;
        const dd = append(dl, $("dd"));
        const label = this.keybindingLabels.add(new KeybindingLabel(dd, OS, { renderUnboundKeybindings: true, ...defaultKeybindingLabelStyles }));
        label.set(keys);
      }
    }, "update");
    update();
    this.transientDisposables.add(this.keybindingService.onDidUpdateKeybindings(update));
  }
  filterEntries(entries, shuffleEntries) {
    const filteredEntries = entries.filter((entry) => isWeb && !entry.when?.web || !isWeb && !entry.when?.native || this.cachedWhen[entry.id]).filter((entry) => !!CommandsRegistry.getCommand(entry.id)).filter((entry) => !!this.keybindingService.lookupKeybinding(entry.id));
    if (shuffleEntries) {
      shuffle(filteredEntries);
    }
    return filteredEntries;
  }
};
EditorGroupWatermark = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStorageService)
], EditorGroupWatermark);
registerColor("editorWatermark.foreground", { dark: transparent(editorForeground, 0.6), light: transparent(editorForeground, 0.68), hcDark: editorForeground, hcLight: editorForeground }, localize("editorLineHighlight", "Foreground color for the labels in the editor watermark."));
export {
  EditorGroupWatermark
};
//# sourceMappingURL=editorGroupWatermark.js.map
