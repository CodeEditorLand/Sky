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
var EditorGroupWatermark_1;
import { $, append, clearNode, h } from "../../../../base/browser/dom.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { coalesce, shuffle } from "../../../../base/common/arrays.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { isMacintosh, isWeb, OS } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IStorageService, WillSaveStateReason } from "../../../../platform/storage/common/storage.js";
import { defaultKeybindingLabelStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
const showChatContextKey = ContextKeyExpr.and(ContextKeyExpr.equals("chatSetupHidden", false), ContextKeyExpr.equals("chatSetupDisabled", false));
const openChat = { text: localize("watermark.openChat", "Open Chat"), id: "workbench.action.chat.open", when: { native: showChatContextKey, web: showChatContextKey } };
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
const baseEntries = [
  openChat,
  showCommands
];
const emptyWindowEntries = coalesce([
  ...baseEntries,
  openRecent,
  ...isMacintosh && !isWeb ? [openFileOrFolder] : [openFile, openFolder],
  isMacintosh && !isWeb ? newUntitledFile : void 0
  // fill in one more on macOS to get to 5 entries
]);
const workspaceEntries = [
  ...baseEntries
];
const otherEntries = [
  gotoFile,
  findInFiles,
  startDebugging,
  toggleTerminal,
  openSettings
];
let EditorGroupWatermark = class EditorGroupWatermark2 extends Disposable {
  static {
    __name(this, "EditorGroupWatermark");
  }
  static {
    EditorGroupWatermark_1 = this;
  }
  static {
    this.CACHED_WHEN = "editorGroupWatermark.whenConditions";
  }
  static {
    this.SETTINGS_KEY = "workbench.tips.enabled";
  }
  static {
    this.MINIMUM_ENTRIES = 3;
  }
  constructor(container, keybindingService, contextService, contextKeyService, configurationService, storageService) {
    super();
    this.keybindingService = keybindingService;
    this.contextService = contextService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.transientDisposables = this._register(new DisposableStore());
    this.keybindingLabels = this._register(new DisposableStore());
    this.enabled = false;
    this.cachedWhen = this.storageService.getObject(EditorGroupWatermark_1.CACHED_WHEN, 0, /* @__PURE__ */ Object.create(null));
    this.workbenchState = this.contextService.getWorkbenchState();
    const elements = h(".editor-group-watermark", [
      h(".watermark-container", [
        h(".letterpress"),
        h(".shortcuts@shortcuts")
      ])
    ]);
    append(container, elements.root);
    this.shortcuts = elements.shortcuts;
    this.registerListeners();
    this.render();
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EditorGroupWatermark_1.SETTINGS_KEY) && this.enabled !== this.configurationService.getValue(EditorGroupWatermark_1.SETTINGS_KEY)) {
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
        const entries = [...emptyWindowEntries, ...workspaceEntries, ...otherEntries];
        for (const entry of entries) {
          const when = isWeb ? entry.when?.web : entry.when?.native;
          if (when) {
            this.cachedWhen[entry.id] = this.contextKeyService.contextMatchesRules(when);
          }
        }
        this.storageService.store(
          EditorGroupWatermark_1.CACHED_WHEN,
          JSON.stringify(this.cachedWhen),
          0,
          1
          /* StorageTarget.MACHINE */
        );
      }
    }));
  }
  render() {
    this.enabled = this.configurationService.getValue(EditorGroupWatermark_1.SETTINGS_KEY);
    clearNode(this.shortcuts);
    this.transientDisposables.clear();
    if (!this.enabled) {
      return;
    }
    const entries = this.filterEntries(this.workbenchState !== 1 ? workspaceEntries : emptyWindowEntries);
    if (entries.length < EditorGroupWatermark_1.MINIMUM_ENTRIES) {
      const additionalEntries = this.filterEntries(otherEntries);
      shuffle(additionalEntries);
      entries.push(...additionalEntries.slice(0, EditorGroupWatermark_1.MINIMUM_ENTRIES - entries.length));
    }
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
  filterEntries(entries) {
    const filteredEntries = entries.filter((entry) => {
      if (this.cachedWhen[entry.id]) {
        return true;
      }
      const contextKey = isWeb ? entry.when?.web : entry.when?.native;
      return !contextKey || this.contextKeyService.contextMatchesRules(contextKey);
    }).filter((entry) => !!CommandsRegistry.getCommand(entry.id)).filter((entry) => !!this.keybindingService.lookupKeybinding(entry.id));
    return filteredEntries;
  }
};
EditorGroupWatermark = EditorGroupWatermark_1 = __decorate([
  __param(1, IKeybindingService),
  __param(2, IWorkspaceContextService),
  __param(3, IContextKeyService),
  __param(4, IConfigurationService),
  __param(5, IStorageService)
], EditorGroupWatermark);
export {
  EditorGroupWatermark
};
//# sourceMappingURL=editorGroupWatermark.js.map
