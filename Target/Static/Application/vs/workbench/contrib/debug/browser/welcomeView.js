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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { isMacintosh, isWeb } from "../../../../base/common/platform.js";
import { isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { localize, localize2 } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { OpenFileAction, OpenFileFolderAction, OpenFolderAction } from "../../../browser/actions/workspaceActions.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { WorkbenchStateContext } from "../../../common/contextkeys.js";
import { Extensions, IViewDescriptorService, ViewContentGroups } from "../../../common/views.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_EXTENSION_AVAILABLE, IDebugService } from "../common/debug.js";
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_START_COMMAND_ID } from "./debugCommands.js";
const debugStartLanguageKey = "debugStartLanguage";
const CONTEXT_DEBUG_START_LANGUAGE = new RawContextKey(debugStartLanguageKey, void 0);
const CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR = new RawContextKey("debuggerInterestedInActiveEditor", false);
let WelcomeView = class WelcomeView2 extends ViewPane {
  static {
    __name(this, "WelcomeView");
  }
  static {
    this.ID = "workbench.debug.welcome";
  }
  static {
    this.LABEL = localize2("run", "Run");
  }
  constructor(options, themeService, keybindingService, contextMenuService, configurationService, contextKeyService, debugService, editorService, instantiationService, viewDescriptorService, openerService, storageSevice, hoverService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.editorService = editorService;
    this.debugStartLanguageContext = CONTEXT_DEBUG_START_LANGUAGE.bindTo(contextKeyService);
    this.debuggerInterestedContext = CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.bindTo(contextKeyService);
    const lastSetLanguage = storageSevice.get(
      debugStartLanguageKey,
      1
      /* StorageScope.WORKSPACE */
    );
    this.debugStartLanguageContext.set(lastSetLanguage);
    const setContextKey = /* @__PURE__ */ __name(() => {
      let editorControl = this.editorService.activeTextEditorControl;
      if (isDiffEditor(editorControl)) {
        editorControl = editorControl.getModifiedEditor();
      }
      if (isCodeEditor(editorControl)) {
        const model = editorControl.getModel();
        const language = model ? model.getLanguageId() : void 0;
        if (language && this.debugService.getAdapterManager().someDebuggerInterestedInLanguage(language)) {
          this.debugStartLanguageContext.set(language);
          this.debuggerInterestedContext.set(true);
          storageSevice.store(
            debugStartLanguageKey,
            language,
            1,
            1
            /* StorageTarget.MACHINE */
          );
          return;
        }
      }
      this.debuggerInterestedContext.set(false);
    }, "setContextKey");
    const disposables = new DisposableStore();
    this._register(disposables);
    this._register(editorService.onDidActiveEditorChange(() => {
      disposables.clear();
      let editorControl = this.editorService.activeTextEditorControl;
      if (isDiffEditor(editorControl)) {
        editorControl = editorControl.getModifiedEditor();
      }
      if (isCodeEditor(editorControl)) {
        disposables.add(editorControl.onDidChangeModelLanguage(setContextKey));
      }
      setContextKey();
    }));
    this._register(this.debugService.getAdapterManager().onDidRegisterDebugger(setContextKey));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        setContextKey();
      }
    }));
    setContextKey();
    const debugKeybinding = this.keybindingService.lookupKeybinding(DEBUG_START_COMMAND_ID);
    debugKeybindingLabel = debugKeybinding ? ` (${debugKeybinding.getLabel()})` : "";
  }
  shouldShowWelcome() {
    return true;
  }
};
WelcomeView = __decorate([
  __param(1, IThemeService),
  __param(2, IKeybindingService),
  __param(3, IContextMenuService),
  __param(4, IConfigurationService),
  __param(5, IContextKeyService),
  __param(6, IDebugService),
  __param(7, IEditorService),
  __param(8, IInstantiationService),
  __param(9, IViewDescriptorService),
  __param(10, IOpenerService),
  __param(11, IStorageService),
  __param(12, IHoverService)
], WelcomeView);
const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
viewsRegistry.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize({
    key: "openAFileWhichCanBeDebugged",
    comment: [
      'Please do not translate the word "command", it is part of our internal syntax which must not change',
      '{Locked="](command:{0})"}'
    ]
  }, "[Open a file](command:{0}) which can be debugged or run.", isMacintosh && !isWeb ? OpenFileFolderAction.ID : OpenFileAction.ID),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.toNegated()),
  group: ViewContentGroups.Open
});
let debugKeybindingLabel = "";
viewsRegistry.registerViewWelcomeContent(WelcomeView.ID, {
  content: `[${localize("runAndDebugAction", "Run and Debug")}${debugKeybindingLabel}](command:${DEBUG_START_COMMAND_ID})`,
  when: CONTEXT_DEBUGGERS_AVAILABLE,
  group: ViewContentGroups.Debug,
  // Allow inserting more buttons directly after this one (by setting order to 1).
  order: 1
});
viewsRegistry.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize({
    key: "customizeRunAndDebug",
    comment: [
      'Please do not translate the word "command", it is part of our internal syntax which must not change',
      '{Locked="](command:{0})"}'
    ]
  }, "To customize Run and Debug [create a launch.json file](command:{0}).", `${DEBUG_CONFIGURE_COMMAND_ID}?${encodeURIComponent(JSON.stringify([{ addNew: true }]))}`),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, WorkbenchStateContext.notEqualsTo("empty")),
  group: ViewContentGroups.Debug
});
viewsRegistry.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize({
    key: "customizeRunAndDebugOpenFolder",
    comment: [
      'Please do not translate the word "command", it is part of our internal syntax which must not change',
      'Please do not translate "launch.json", it is the specific configuration file name',
      '{Locked="](command:{0})"}'
    ]
  }, "To customize Run and Debug, [open a folder](command:{0}) and create a launch.json file.", isMacintosh && !isWeb ? OpenFileFolderAction.ID : OpenFolderAction.ID),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, WorkbenchStateContext.isEqualTo("empty")),
  group: ViewContentGroups.Debug
});
viewsRegistry.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize("allDebuggersDisabled", "All debug extensions are disabled. Enable a debug extension or install a new one from the Marketplace."),
  when: CONTEXT_DEBUG_EXTENSION_AVAILABLE.toNegated(),
  group: ViewContentGroups.Debug
});
export {
  WelcomeView
};
//# sourceMappingURL=welcomeView.js.map
