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
import { Action } from "../../../../base/common/actions.js";
import { URI } from "../../../../base/common/uri.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import * as nls from "../../../../nls.js";
import { IQuickInputService, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { MenuId, MenuRegistry, isIMenuItem } from "../../../../platform/actions/common/actions.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { isLocalizedString } from "../../../../platform/action/common/action.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
let ConfigureLanguageBasedSettingsAction = class extends Action {
  constructor(id, label, modelService, languageService, quickInputService, preferencesService) {
    super(id, label);
    this.modelService = modelService;
    this.languageService = languageService;
    this.quickInputService = quickInputService;
    this.preferencesService = preferencesService;
  }
  static {
    __name(this, "ConfigureLanguageBasedSettingsAction");
  }
  static ID = "workbench.action.configureLanguageBasedSettings";
  static LABEL = nls.localize2("configureLanguageBasedSettings", "Configure Language Specific Settings...");
  async run() {
    const languages = this.languageService.getSortedRegisteredLanguageNames();
    const picks = languages.map(({ languageName, languageId }) => {
      const description = nls.localize("languageDescriptionConfigured", "({0})", languageId);
      let fakeResource;
      const extensions = this.languageService.getExtensions(languageId);
      if (extensions.length) {
        fakeResource = URI.file(extensions[0]);
      } else {
        const filenames = this.languageService.getFilenames(languageId);
        if (filenames.length) {
          fakeResource = URI.file(filenames[0]);
        }
      }
      return {
        label: languageName,
        iconClasses: getIconClasses(this.modelService, this.languageService, fakeResource),
        description
      };
    });
    await this.quickInputService.pick(picks, { placeHolder: nls.localize("pickLanguage", "Select Language") }).then((pick) => {
      if (pick) {
        const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
        if (typeof languageId === "string") {
          return this.preferencesService.openLanguageSpecificSettings(languageId);
        }
      }
      return void 0;
    });
  }
};
ConfigureLanguageBasedSettingsAction = __decorateClass([
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IPreferencesService)
], ConfigureLanguageBasedSettingsAction);
CommandsRegistry.registerCommand({
  id: "_getAllSettings",
  handler: /* @__PURE__ */ __name(() => {
    const configRegistry = Registry.as(Extensions.Configuration);
    const allSettings = configRegistry.getConfigurationProperties();
    return allSettings;
  }, "handler")
});
CommandsRegistry.registerCommand("_getAllCommands", function(accessor, filterByPrecondition) {
  const keybindingService = accessor.get(IKeybindingService);
  const contextKeyService = accessor.get(IContextKeyService);
  const actions = [];
  for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
    const keybinding = keybindingService.lookupKeybinding(editorAction.id);
    if (filterByPrecondition && !contextKeyService.contextMatchesRules(editorAction.precondition)) {
      continue;
    }
    actions.push({
      command: editorAction.id,
      label: editorAction.label,
      description: isLocalizedString(editorAction.metadata?.description) ? editorAction.metadata.description.value : editorAction.metadata?.description,
      precondition: editorAction.precondition?.serialize(),
      keybinding: keybinding?.getLabel() ?? "Not set"
    });
  }
  for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
    if (isIMenuItem(menuItem)) {
      if (filterByPrecondition && !contextKeyService.contextMatchesRules(menuItem.when)) {
        continue;
      }
      const title = typeof menuItem.command.title === "string" ? menuItem.command.title : menuItem.command.title.value;
      const category = menuItem.command.category ? typeof menuItem.command.category === "string" ? menuItem.command.category : menuItem.command.category.value : void 0;
      const label = category ? `${category}: ${title}` : title;
      const description = isLocalizedString(menuItem.command.metadata?.description) ? menuItem.command.metadata.description.value : menuItem.command.metadata?.description;
      const keybinding = keybindingService.lookupKeybinding(menuItem.command.id);
      actions.push({
        command: menuItem.command.id,
        label,
        description,
        precondition: menuItem.when?.serialize(),
        keybinding: keybinding?.getLabel() ?? "Not set"
      });
    }
  }
  return actions;
});
export {
  ConfigureLanguageBasedSettingsAction
};
//# sourceMappingURL=preferencesActions.js.map
