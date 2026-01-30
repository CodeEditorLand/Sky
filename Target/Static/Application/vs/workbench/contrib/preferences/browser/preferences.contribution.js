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
import { KeyChord } from "../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isBoolean, isObject, isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { Context as SuggestContext } from "../../../../editor/contrib/suggest/browser/suggest.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { InputFocusedContext, IsMacNativeContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "../../../browser/actions/workspaceCommands.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { resolveCommandsContext } from "../../../browser/parts/editor/editorCommandsContext.js";
import { RemoteNameContext, ResourceContextKey, WorkbenchStateContext } from "../../../common/contextkeys.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { KeybindingsEditorInput } from "../../../services/preferences/browser/keybindingsEditorInput.js";
import { DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { PreferencesEditorInput, SettingsEditor2Input } from "../../../services/preferences/common/preferencesEditorInput.js";
import { SettingsEditorModel } from "../../../services/preferences/common/preferencesModels.js";
import { CURRENT_PROFILE_CONTEXT, IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { ExplorerFolderContext, ExplorerRootContext } from "../../files/common/files.js";
import { CONTEXT_AI_SETTING_RESULTS_AVAILABLE, CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE, CONTEXT_KEYBINDING_FOCUS, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_JSON_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, CONTEXT_WHEN_FOCUS, KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_SEARCH, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU, SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH } from "../common/preferences.js";
import { PreferencesContribution } from "../common/preferencesContribution.js";
import { KeybindingsEditor } from "./keybindingsEditor.js";
import { ConfigureLanguageBasedSettingsAction } from "./preferencesActions.js";
import { PreferencesEditor } from "./preferencesEditor.js";
import { preferencesOpenSettingsIcon } from "./preferencesIcons.js";
import { UserSettingsRenderer, WorkspaceSettingsRenderer } from "./preferencesRenderers.js";
import { SettingsEditor2 } from "./settingsEditor2.js";
const SETTINGS_EDITOR_COMMAND_SEARCH = "settings.action.search";
const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = "settings.action.focusSettingsFile";
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = "settings.action.focusSettingsFromSearch";
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = "settings.action.focusSettingsList";
const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = "settings.action.focusTOC";
const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = "settings.action.focusSettingControl";
const SETTINGS_EDITOR_COMMAND_FOCUS_UP = "settings.action.focusLevelUp";
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = "settings.switchToJSON";
const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = "settings.filterByOnline";
const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = "settings.filterUntrusted";
const SETTINGS_COMMAND_OPEN_SETTINGS = "workbench.action.openSettings";
const SETTINGS_COMMAND_FILTER_TELEMETRY = "settings.filterByTelemetry";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(SettingsEditor2, SettingsEditor2.ID, nls.localize("settingsEditor2", "Settings Editor 2")), [
  new SyncDescriptor(SettingsEditor2Input)
]);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(PreferencesEditor, PreferencesEditor.ID, nls.localize("preferencesEditor", "Preferences Editor")), [
  new SyncDescriptor(PreferencesEditorInput)
]);
class PreferencesEditorInputSerializer {
  static {
    __name(this, "PreferencesEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(PreferencesEditorInput);
  }
}
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(KeybindingsEditor, KeybindingsEditor.ID, nls.localize("keybindingsEditor", "Keybindings Editor")), [
  new SyncDescriptor(KeybindingsEditorInput)
]);
class KeybindingsEditorInputSerializer {
  static {
    __name(this, "KeybindingsEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(KeybindingsEditorInput);
  }
}
class SettingsEditor2InputSerializer {
  static {
    __name(this, "SettingsEditor2InputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(SettingsEditor2Input);
  }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(PreferencesEditorInput.ID, PreferencesEditorInputSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
const OPEN_USER_SETTINGS_UI_TITLE = nls.localize2("openSettings2", "Open Settings (UI)");
const OPEN_USER_SETTINGS_JSON_TITLE = nls.localize2("openUserSettingsJson", "Open User Settings (JSON)");
const OPEN_APPLICATION_SETTINGS_JSON_TITLE = nls.localize2("openApplicationSettingsJson", "Open Application Settings (JSON)");
const category = Categories.Preferences;
function sanitizeBoolean(arg) {
  return isBoolean(arg) ? arg : void 0;
}
__name(sanitizeBoolean, "sanitizeBoolean");
function sanitizeString(arg) {
  return isString(arg) ? arg : void 0;
}
__name(sanitizeString, "sanitizeString");
function sanitizeOpenSettingsArgs(args) {
  if (!isObject(args)) {
    args = {};
  }
  let sanitizedObject = {
    focusSearch: sanitizeBoolean(args?.focusSearch),
    openToSide: sanitizeBoolean(args?.openToSide),
    query: sanitizeString(args?.query)
  };
  if (isString(args?.revealSetting?.key)) {
    sanitizedObject = {
      ...sanitizedObject,
      revealSetting: {
        key: args.revealSetting.key,
        edit: sanitizeBoolean(args.revealSetting?.edit)
      }
    };
  }
  return sanitizedObject;
}
__name(sanitizeOpenSettingsArgs, "sanitizeOpenSettingsArgs");
let PreferencesActionsContribution = class PreferencesActionsContribution2 extends Disposable {
  static {
    __name(this, "PreferencesActionsContribution");
  }
  static {
    this.ID = "workbench.contrib.preferencesActions";
  }
  constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
    super();
    this.environmentService = environmentService;
    this.userDataProfileService = userDataProfileService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this.labelService = labelService;
    this.extensionService = extensionService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsActions();
    this.registerKeybindingsActions();
    this.updatePreferencesEditorMenuItem();
    this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
    this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
  }
  registerSettingsActions() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_COMMAND_OPEN_SETTINGS,
          title: {
            ...nls.localize2("settings", "Settings"),
            mnemonicTitle: nls.localize({ key: "miOpenSettings", comment: ["&& denotes a mnemonic"] }, "&&Settings")
          },
          keybinding: {
            weight: 200,
            when: null,
            primary: 2048 | 87
          },
          menu: [{
            id: MenuId.GlobalActivity,
            group: "2_configuration",
            order: 2
          }, {
            id: MenuId.MenubarPreferencesMenu,
            group: "2_configuration",
            order: 2
          }]
        });
      }
      run(accessor, args) {
        const opts = typeof args === "string" ? { query: args } : sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openSettings(opts);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openSettings2",
          title: nls.localize2("openSettings2", "Open Settings (UI)"),
          category,
          f1: true
        });
      }
      run(accessor, args) {
        args = sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openSettings({ jsonEditor: false, ...args });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openSettingsJson",
          title: OPEN_USER_SETTINGS_JSON_TITLE,
          metadata: {
            description: nls.localize2("workbench.action.openSettingsJson.description", "Opens the JSON file containing the current user profile settings")
          },
          category,
          f1: true
        });
      }
      run(accessor, args) {
        args = sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openSettings({ jsonEditor: true, ...args });
      }
    }));
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openApplicationSettingsJson",
          title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
          }
        });
      }
      run(accessor, args) {
        args = sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openGlobalSettings",
          title: nls.localize2("openGlobalSettings", "Open User Settings"),
          category,
          f1: true
        });
      }
      run(accessor, args) {
        args = sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openUserSettings(args);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openRawDefaultSettings",
          title: nls.localize2("openRawDefaultSettings", "Open Default Settings (JSON)"),
          category,
          f1: true
        });
      }
      run(accessor) {
        return accessor.get(IPreferencesService).openRawDefaultSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ConfigureLanguageBasedSettingsAction.ID,
          title: ConfigureLanguageBasedSettingsAction.LABEL,
          category,
          f1: true
        });
      }
      run(accessor) {
        return accessor.get(IInstantiationService).createInstance(ConfigureLanguageBasedSettingsAction, ConfigureLanguageBasedSettingsAction.ID, ConfigureLanguageBasedSettingsAction.LABEL.value).run();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openWorkspaceSettings",
          title: nls.localize2("openWorkspaceSettings", "Open Workspace Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      run(accessor, args) {
        args = typeof args === "string" ? { query: args } : sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openWorkspaceSettings(args);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openAccessibilitySettings",
          title: nls.localize2("openAccessibilitySettings", "Open Accessibility Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      async run(accessor) {
        await accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:accessibility" });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openWorkspaceSettingsFile",
          title: nls.localize2("openWorkspaceSettingsFile", "Open Workspace Settings (JSON)"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.notEqualsTo("empty")
          }
        });
      }
      run(accessor, args) {
        args = sanitizeOpenSettingsArgs(args);
        return accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openFolderSettings",
          title: nls.localize2("openFolderSettings", "Open Folder Settings"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.isEqualTo("workspace")
          }
        });
      }
      async run(accessor, args) {
        const commandService = accessor.get(ICommandService);
        const preferencesService = accessor.get(IPreferencesService);
        const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
        if (workspaceFolder) {
          args = sanitizeOpenSettingsArgs(args);
          await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openFolderSettingsFile",
          title: nls.localize2("openFolderSettingsFile", "Open Folder Settings (JSON)"),
          category,
          menu: {
            id: MenuId.CommandPalette,
            when: WorkbenchStateContext.isEqualTo("workspace")
          }
        });
      }
      async run(accessor, args) {
        const commandService = accessor.get(ICommandService);
        const preferencesService = accessor.get(IPreferencesService);
        const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
        if (workspaceFolder) {
          args = sanitizeOpenSettingsArgs(args);
          await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "_workbench.action.openFolderSettings",
          title: nls.localize("openFolderSettings", "Open Folder Settings"),
          category,
          menu: {
            id: MenuId.ExplorerContext,
            group: "2_workspace",
            order: 20,
            when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext)
          }
        });
      }
      async run(accessor, resource) {
        if (URI.isUri(resource)) {
          await accessor.get(IPreferencesService).openFolderSettings({ folderUri: resource });
        } else {
          const commandService = accessor.get(ICommandService);
          const preferencesService = accessor.get(IPreferencesService);
          const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
          if (workspaceFolder) {
            await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri });
          }
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
          title: nls.localize({ key: "miOpenOnlineSettings", comment: ["&& denotes a mnemonic"] }, "&&Online Services Settings"),
          menu: {
            id: MenuId.MenubarPreferencesMenu,
            group: "3_settings",
            order: 1
          }
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.focusSearch(`@tag:usesOnlineServices`);
        } else {
          accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:usesOnlineServices" });
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 2048 | 39,
            weight: 100,
            when: CONTEXT_AI_SETTING_RESULTS_AVAILABLE
          },
          category,
          f1: true,
          title: nls.localize2("settings.toggleAiSearch", "Toggle AI Settings Search")
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.toggleAiSearch();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
          title: nls.localize2("filterUntrusted", "Show untrusted workspace settings")
        });
      }
      run(accessor) {
        accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_COMMAND_FILTER_TELEMETRY,
          title: nls.localize({ key: "miOpenTelemetrySettings", comment: ["&& denotes a mnemonic"] }, "&&Telemetry Settings")
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          editorPane.focusSearch(`@tag:telemetry`);
        } else {
          accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@tag:telemetry" });
        }
      }
    }));
    this.registerSettingsEditorActions();
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      const remoteAuthority = this.environmentService.remoteAuthority;
      const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "workbench.action.openRemoteSettings",
            title: nls.localize2("openRemoteSettings", "Open Remote Settings ({0})", hostLabel),
            category,
            menu: {
              id: MenuId.CommandPalette,
              when: RemoteNameContext.notEqualsTo("")
            }
          });
        }
        run(accessor, args) {
          args = sanitizeOpenSettingsArgs(args);
          return accessor.get(IPreferencesService).openRemoteSettings(args);
        }
      }));
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "workbench.action.openRemoteSettingsFile",
            title: nls.localize2("openRemoteSettingsJSON", "Open Remote Settings (JSON) ({0})", hostLabel),
            category,
            menu: {
              id: MenuId.CommandPalette,
              when: RemoteNameContext.notEqualsTo("")
            }
          });
        }
        run(accessor, args) {
          args = sanitizeOpenSettingsArgs(args);
          return accessor.get(IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args });
        }
      }));
    });
  }
  registerSettingsEditorActions() {
    function getPreferencesEditor(accessor) {
      const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
      if (activeEditorPane instanceof SettingsEditor2) {
        return activeEditorPane;
      }
      return null;
    }
    __name(getPreferencesEditor, "getPreferencesEditor");
    function settingsEditorFocusSearch(accessor) {
      const preferencesEditor = getPreferencesEditor(accessor);
      preferencesEditor?.focusSearch();
    }
    __name(settingsEditorFocusSearch, "settingsEditorFocusSearch");
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SEARCH,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 2048 | 36,
            weight: 100,
            when: null
          },
          category,
          f1: true,
          title: nls.localize2("settings.focusSearch", "Focus Settings Search")
        });
      }
      run(accessor) {
        settingsEditorFocusSearch(accessor);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 9,
            weight: 100,
            when: CONTEXT_SETTINGS_SEARCH_FOCUS
          },
          category,
          f1: true,
          title: nls.localize2("settings.clearResults", "Clear Settings Search Results")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.clearSearchResults();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
          keybinding: {
            primary: 18,
            weight: 100,
            when: null
          },
          title: nls.localize("settings.focusFile", "Focus settings file")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.focusSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
          keybinding: {
            primary: 18,
            weight: 200,
            when: null
          },
          title: nls.localize("settings.focusFile", "Focus settings file")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        preferencesEditor?.focusSettings();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_TOC_ROW_FOCUS),
          keybinding: {
            primary: 3,
            weight: 200,
            when: null
          },
          title: nls.localize("settings.focusSettingsList", "Focus settings list")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (preferencesEditor instanceof SettingsEditor2) {
          preferencesEditor.focusSettings();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
          precondition: CONTEXT_SETTINGS_EDITOR,
          f1: true,
          keybinding: [
            {
              primary: 15,
              weight: 200,
              when: CONTEXT_SETTINGS_ROW_FOCUS
            }
          ],
          category,
          title: nls.localize2("settings.focusSettingsTOC", "Focus Settings Table of Contents")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        preferencesEditor.focusTOC();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS),
          keybinding: {
            primary: 3,
            weight: 200
          },
          title: nls.localize("settings.focusSettingControl", "Focus Setting Control")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        const activeElement = preferencesEditor.getContainer()?.ownerDocument.activeElement;
        if (activeElement?.classList.contains("monaco-list")) {
          preferencesEditor.focusSettings(true);
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
          precondition: CONTEXT_SETTINGS_EDITOR,
          keybinding: {
            primary: 1024 | 67,
            weight: 200,
            when: null
          },
          f1: true,
          category,
          title: nls.localize2("settings.showContextMenu", "Show Setting Context Menu")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (preferencesEditor instanceof SettingsEditor2) {
          preferencesEditor.showContextMenu();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
          precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
          keybinding: {
            primary: 9,
            weight: 200,
            when: null
          },
          f1: true,
          category,
          title: nls.localize2("settings.focusLevelUp", "Move Focus Up One Level")
        });
      }
      run(accessor) {
        const preferencesEditor = getPreferencesEditor(accessor);
        if (!(preferencesEditor instanceof SettingsEditor2)) {
          return;
        }
        if (preferencesEditor.currentFocusContext === 3) {
          preferencesEditor.focusSettings();
        } else if (preferencesEditor.currentFocusContext === 2) {
          preferencesEditor.focusTOC();
        } else if (preferencesEditor.currentFocusContext === 1) {
          preferencesEditor.focusSearch();
        }
      }
    }));
  }
  registerKeybindingsActions() {
    const that = this;
    const category2 = nls.localize2("preferences", "Preferences");
    const id = "workbench.action.openGlobalKeybindings";
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id,
          title: nls.localize2("openGlobalKeybindings", "Open Keyboard Shortcuts"),
          shortTitle: nls.localize("keyboardShortcuts", "Keyboard Shortcuts"),
          category: category2,
          icon: preferencesOpenSettingsIcon,
          keybinding: {
            when: null,
            weight: 200,
            primary: KeyChord(
              2048 | 41,
              2048 | 49
              /* KeyCode.KeyS */
            )
          },
          menu: [
            { id: MenuId.CommandPalette },
            {
              id: MenuId.EditorTitle,
              when: ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
              group: "navigation",
              order: 1
            },
            {
              id: MenuId.GlobalActivity,
              group: "2_configuration",
              order: 4
            }
          ]
        });
      }
      run(accessor, ...args) {
        const query = typeof args[0] === "string" ? args[0] : void 0;
        const groupId = getEditorGroupFromArguments(accessor, args)?.id;
        return accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query, groupId });
      }
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
      command: {
        id,
        title: nls.localize("keyboardShortcuts", "Keyboard Shortcuts")
      },
      group: "2_configuration",
      order: 4
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openDefaultKeybindingsFile",
          title: nls.localize2("openDefaultKeybindingsFile", "Open Default Keyboard Shortcuts (JSON)"),
          category: category2,
          menu: { id: MenuId.CommandPalette }
        });
      }
      run(accessor) {
        return accessor.get(IPreferencesService).openDefaultKeybindingsFile();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openGlobalKeybindingsFile",
          title: nls.localize2("openGlobalKeybindingsFile", "Open Keyboard Shortcuts (JSON)"),
          category: category2,
          icon: preferencesOpenSettingsIcon,
          menu: [
            { id: MenuId.CommandPalette },
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "navigation"
            }
          ]
        });
      }
      run(accessor, ...args) {
        const groupId = getEditorGroupFromArguments(accessor, args)?.id;
        return accessor.get(IPreferencesService).openGlobalKeybindingSettings(true, { groupId });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
          title: nls.localize2("showDefaultKeybindings", "Show System Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args) {
        const group = getEditorGroupFromArguments(accessor, args);
        const editorPane = group?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:system");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
          title: nls.localize2("showExtensionKeybindings", "Show Extension Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args) {
        const group = getEditorGroupFromArguments(accessor, args);
        const editorPane = group?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:extension");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
          title: nls.localize2("showUserKeybindings", "Show User Keybindings"),
          menu: [
            {
              id: MenuId.EditorTitle,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
              group: "1_keyboard_preferences_actions"
            }
          ]
        });
      }
      run(accessor, ...args) {
        const group = getEditorGroupFromArguments(accessor, args);
        const editorPane = group?.activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.search("@source:user");
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
          title: nls.localize("clear", "Clear Search Results"),
          keybinding: {
            weight: 200,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE),
            primary: 9
          }
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.clearSearchResults();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
          title: nls.localize("clearHistory", "Clear Keyboard Shortcuts Search History"),
          category: category2,
          menu: [
            {
              id: MenuId.CommandPalette,
              when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR)
            }
          ]
        });
      }
      run(accessor) {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.clearKeyboardShortcutSearchHistory();
        }
      }
    }));
    this.registerKeybindingEditorActions();
  }
  registerKeybindingEditorActions() {
    const that = this;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.toNegated()),
      primary: 3,
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ADD,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: KeyChord(
        2048 | 41,
        2048 | 31
        /* KeyCode.KeyA */
      ),
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: KeyChord(
        2048 | 41,
        2048 | 35
        /* KeyCode.KeyE */
      ),
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
          editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, InputFocusedContext.toNegated()),
      primary: 20,
      mac: {
        primary: 2048 | 1
        /* KeyCode.Backspace */
      },
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RESET,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SEARCH,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: 2048 | 36,
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusSearch();
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
      primary: 512 | 41,
      mac: {
        primary: 2048 | 512 | 41
        /* KeyCode.KeyK */
      },
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.recordSearchKeys();
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: 512 | 46,
      mac: {
        primary: 2048 | 512 | 46
        /* KeyCode.KeyP */
      },
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.toggleSortByPrecedence();
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.negate()),
      primary: 2048 | 33,
      handler: /* @__PURE__ */ __name(async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: /* @__PURE__ */ __name(async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
      primary: 0,
      handler: /* @__PURE__ */ __name(async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
      primary: 2048 | 18,
      handler: /* @__PURE__ */ __name((accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusKeybindings();
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, SuggestContext.Visible.toNegated()),
      primary: 9,
      handler: /* @__PURE__ */ __name(async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
      weight: 200,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, SuggestContext.Visible.toNegated()),
      primary: 3,
      handler: /* @__PURE__ */ __name(async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
        }
      }, "handler")
    });
    const profileScopedActionDisposables = this._register(new DisposableStore());
    const registerProfileScopedActions = /* @__PURE__ */ __name(() => {
      profileScopedActionDisposables.clear();
      profileScopedActionDisposables.add(registerAction2(class DefineKeybindingAction extends Action2 {
        static {
          __name(this, "DefineKeybindingAction");
        }
        constructor() {
          const when = ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString());
          super({
            id: "editor.action.defineKeybinding",
            title: nls.localize2("defineKeybinding.start", "Define Keybinding"),
            f1: true,
            precondition: when,
            keybinding: {
              weight: 200,
              when,
              primary: KeyChord(
                2048 | 41,
                2048 | 41
                /* KeyCode.KeyK */
              )
            },
            menu: {
              id: MenuId.EditorContent,
              when
            }
          });
        }
        async run(accessor) {
          const codeEditor = accessor.get(IEditorService).activeTextEditorControl;
          if (isCodeEditor(codeEditor)) {
            codeEditor.getContribution(DEFINE_KEYBINDING_EDITOR_CONTRIB_ID)?.showDefineKeybindingWidget();
          }
        }
      }));
    }, "registerProfileScopedActions");
    registerProfileScopedActions();
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
  }
  updatePreferencesEditorMenuItem() {
    const commandId = "_workbench.openWorkspaceSettingsEditor";
    if (this.workspaceContextService.getWorkbenchState() === 3 && !CommandsRegistry.getCommand(commandId)) {
      CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
      MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
        command: {
          id: commandId,
          title: OPEN_USER_SETTINGS_UI_TITLE,
          icon: preferencesOpenSettingsIcon
        },
        when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), WorkbenchStateContext.isEqualTo("workspace"), ContextKeyExpr.not("isInDiffEditor")),
        group: "navigation",
        order: 1
      });
    }
    this.updatePreferencesEditorMenuItemForWorkspaceFolders();
  }
  updatePreferencesEditorMenuItemForWorkspaceFolders() {
    for (const folder of this.workspaceContextService.getWorkspace().folders) {
      const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
      if (!CommandsRegistry.getCommand(commandId)) {
        CommandsRegistry.registerCommand(commandId, (accessor, ...args) => {
          const groupId = getEditorGroupFromArguments(accessor, args)?.id;
          if (this.workspaceContextService.getWorkbenchState() === 2) {
            return this.preferencesService.openWorkspaceSettings({ jsonEditor: false, groupId });
          } else {
            return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false, groupId });
          }
        });
        MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
          command: {
            id: commandId,
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon
          },
          when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), ContextKeyExpr.not("isInDiffEditor")),
          group: "navigation",
          order: 1
        });
      }
    }
  }
};
PreferencesActionsContribution = __decorate([
  __param(0, IWorkbenchEnvironmentService),
  __param(1, IUserDataProfileService),
  __param(2, IPreferencesService),
  __param(3, IWorkspaceContextService),
  __param(4, ILabelService),
  __param(5, IExtensionService),
  __param(6, IUserDataProfilesService)
], PreferencesActionsContribution);
let SettingsEditorTitleContribution = class SettingsEditorTitleContribution2 extends Disposable {
  static {
    __name(this, "SettingsEditorTitleContribution");
  }
  static {
    this.ID = "workbench.contrib.settingsEditorTitleBarActions";
  }
  constructor(userDataProfileService, userDataProfilesService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsEditorTitleActions();
  }
  registerSettingsEditorTitleActions() {
    const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new MutableDisposable());
    const registerOpenUserSettingsEditorFromJsonAction = /* @__PURE__ */ __name(() => {
      const openUserSettingsEditorWhen = ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR.toNegated(), ContextKeyExpr.or(ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()), ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString())), ContextKeyExpr.not("isInDiffEditor"));
      registerOpenUserSettingsEditorFromJsonActionDisposables.clear();
      registerOpenUserSettingsEditorFromJsonActionDisposables.value = registerAction2(class extends Action2 {
        constructor() {
          super({
            id: "_workbench.openUserSettingsEditor",
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon,
            menu: [{
              id: MenuId.EditorTitle,
              when: openUserSettingsEditorWhen,
              group: "navigation",
              order: 1
            }]
          });
        }
        run(accessor, ...args) {
          const sanitizedArgs = sanitizeOpenSettingsArgs(args[0]);
          const groupId = getEditorGroupFromArguments(accessor, args)?.id;
          return accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, ...sanitizedArgs, groupId });
        }
      });
    }, "registerOpenUserSettingsEditorFromJsonAction");
    registerOpenUserSettingsEditorFromJsonAction();
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
      registerOpenUserSettingsEditorFromJsonAction();
    }));
    const openSettingsJsonWhen = ContextKeyExpr.and(CONTEXT_SETTINGS_JSON_EDITOR.toNegated(), CONTEXT_SETTINGS_EDITOR);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
          title: nls.localize2("openSettingsJson", "Open Settings (JSON)"),
          icon: preferencesOpenSettingsIcon,
          menu: [{
            id: MenuId.EditorTitle,
            when: openSettingsJsonWhen,
            group: "navigation",
            order: 1
          }]
        });
      }
      run(accessor, ...args) {
        const group = getEditorGroupFromArguments(accessor, args);
        const editorPane = group?.activeEditorPane;
        if (editorPane instanceof SettingsEditor2) {
          return editorPane.switchToSettingsFile();
        }
        return null;
      }
    }));
  }
};
SettingsEditorTitleContribution = __decorate([
  __param(0, IUserDataProfileService),
  __param(1, IUserDataProfilesService)
], SettingsEditorTitleContribution);
let SettingsEditorContribution = class SettingsEditorContribution2 extends Disposable {
  static {
    __name(this, "SettingsEditorContribution");
  }
  static {
    this.ID = "editor.contrib.settings";
  }
  constructor(editor, instantiationService, preferencesService, workspaceContextService) {
    super();
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this.disposables = this._register(new DisposableStore());
    this._createPreferencesRenderer();
    this._register(this.editor.onDidChangeModel((e) => this._createPreferencesRenderer()));
    this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this._createPreferencesRenderer()));
  }
  async _createPreferencesRenderer() {
    this.disposables.clear();
    this.currentRenderer = void 0;
    const model = this.editor.getModel();
    if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
      const settingsModel = await this.preferencesService.createPreferencesEditorModel(model.uri);
      if (settingsModel instanceof SettingsEditorModel && this.editor.getModel()) {
        this.disposables.add(settingsModel);
        switch (settingsModel.configurationTarget) {
          case 5:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(WorkspaceSettingsRenderer, this.editor, settingsModel));
            break;
          default:
            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(UserSettingsRenderer, this.editor, settingsModel));
            break;
        }
      }
      this.currentRenderer?.render();
    }
  }
};
SettingsEditorContribution = __decorate([
  __param(1, IInstantiationService),
  __param(2, IPreferencesService),
  __param(3, IWorkspaceContextService)
], SettingsEditorContribution);
function getEditorGroupFromArguments(accessor, args) {
  const context = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
  return context.groupedEditors[0]?.group;
}
__name(getEditorGroupFromArguments, "getEditorGroupFromArguments");
registerWorkbenchContribution2(
  PreferencesActionsContribution.ID,
  PreferencesActionsContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  PreferencesContribution.ID,
  PreferencesContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  SettingsEditorTitleContribution.ID,
  SettingsEditorTitleContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerEditorContribution(
  SettingsEditorContribution.ID,
  SettingsEditorContribution,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  title: nls.localize({ key: "miPreferences", comment: ["&& denotes a mnemonic"] }, "&&Preferences"),
  submenu: MenuId.MenubarPreferencesMenu,
  group: "5_autosave",
  order: 2,
  when: IsMacNativeContext.toNegated()
  // on macOS native the preferences menu is separate under the application menu
});
//# sourceMappingURL=preferences.contribution.js.map
