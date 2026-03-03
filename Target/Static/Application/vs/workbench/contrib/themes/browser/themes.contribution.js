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
import { localize, localize2 } from "../../../../nls.js";
import { KeyChord } from "../../../../base/common/keyCodes.js";
import { MenuRegistry, MenuId, Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IWorkbenchThemeService, ThemeSettings } from "../../../services/themes/common/workbenchThemeService.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { IExtensionGalleryService, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { Extensions as ColorRegistryExtensions } from "../../../../platform/theme/common/colorRegistry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Color } from "../../../../base/common/color.js";
import { ColorScheme, isHighContrast } from "../../../../platform/theme/common/theme.js";
import { colorThemeSchemaId } from "../../../services/themes/common/colorThemeSchema.js";
import { isCancellationError, onUnexpectedError } from "../../../../base/common/errors.js";
import { IQuickInputService, QuickInputButtonLocation } from "../../../../platform/quickinput/common/quickInput.js";
import { DEFAULT_PRODUCT_ICON_THEME_ID, ProductIconThemeData } from "../../../services/themes/browser/productIconThemeData.js";
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Emitter } from "../../../../base/common/event.js";
import { IExtensionResourceLoaderService } from "../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { FileIconThemeData } from "../../../services/themes/browser/fileIconThemeData.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
const manageExtensionIcon = registerIcon("theme-selection-manage-extension", Codicon.gear, localize("manageExtensionIcon", "Icon for the 'Manage' action in the theme selection quick pick."));
var ConfigureItem;
(function(ConfigureItem2) {
  ConfigureItem2["BROWSE_GALLERY"] = "marketplace";
  ConfigureItem2["EXTENSIONS_VIEW"] = "extensions";
  ConfigureItem2["CUSTOM_TOP_ENTRY"] = "customTopEntry";
})(ConfigureItem || (ConfigureItem = {}));
let MarketplaceThemesPicker = class MarketplaceThemesPicker2 {
  static {
    __name(this, "MarketplaceThemesPicker");
  }
  constructor(getMarketplaceColorThemes, marketplaceQuery, extensionGalleryService, extensionManagementService, quickInputService, logService, progressService, extensionsWorkbenchService, dialogService) {
    this.getMarketplaceColorThemes = getMarketplaceColorThemes;
    this.marketplaceQuery = marketplaceQuery;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManagementService = extensionManagementService;
    this.quickInputService = quickInputService;
    this.logService = logService;
    this.progressService = progressService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.dialogService = dialogService;
    this._marketplaceExtensions = /* @__PURE__ */ new Set();
    this._marketplaceThemes = [];
    this._searchOngoing = false;
    this._searchError = void 0;
    this._onDidChange = new Emitter();
    this._queryDelayer = new ThrottledDelayer(200);
    this._installedExtensions = extensionManagementService.getInstalled().then((installed) => {
      const result = /* @__PURE__ */ new Set();
      for (const ext of installed) {
        result.add(ext.identifier.id);
      }
      return result;
    });
  }
  get themes() {
    return this._marketplaceThemes;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  trigger(value) {
    if (this._tokenSource) {
      this._tokenSource.cancel();
      this._tokenSource = void 0;
    }
    this._queryDelayer.trigger(() => {
      this._tokenSource = new CancellationTokenSource();
      return this.doSearch(value, this._tokenSource.token);
    });
  }
  async doSearch(value, token) {
    this._searchOngoing = true;
    this._onDidChange.fire();
    try {
      const installedExtensions = await this._installedExtensions;
      const options = { text: `${this.marketplaceQuery} ${value}`, pageSize: 20 };
      const pager = await this.extensionGalleryService.query(options, token);
      for (let i = 0; i < pager.total && i < 1; i++) {
        if (token.isCancellationRequested) {
          break;
        }
        const nThemes = this._marketplaceThemes.length;
        const gallery = i === 0 ? pager.firstPage : await pager.getPage(i, token);
        const promises = [];
        const promisesGalleries = [];
        for (let i2 = 0; i2 < gallery.length; i2++) {
          if (token.isCancellationRequested) {
            break;
          }
          const ext = gallery[i2];
          if (!installedExtensions.has(ext.identifier.id) && !this._marketplaceExtensions.has(ext.identifier.id)) {
            this._marketplaceExtensions.add(ext.identifier.id);
            promises.push(this.getMarketplaceColorThemes(ext.publisher, ext.name, ext.version));
            promisesGalleries.push(ext);
          }
        }
        const allThemes = await Promise.all(promises);
        for (let i2 = 0; i2 < allThemes.length; i2++) {
          const ext = promisesGalleries[i2];
          for (const theme of allThemes[i2]) {
            this._marketplaceThemes.push({ id: theme.id, theme, label: theme.label, description: `${ext.displayName} \xB7 ${ext.publisherDisplayName}`, galleryExtension: ext, buttons: [configureButton] });
          }
        }
        if (nThemes !== this._marketplaceThemes.length) {
          this._marketplaceThemes.sort((t1, t2) => t1.label.localeCompare(t2.label));
          this._onDidChange.fire();
        }
      }
    } catch (e) {
      if (!isCancellationError(e)) {
        this.logService.error(`Error while searching for themes:`, e);
        this._searchError = "message" in e ? e.message : String(e);
      }
    } finally {
      this._searchOngoing = false;
      this._onDidChange.fire();
    }
  }
  openQuickPick(value, currentTheme, selectTheme) {
    let result = void 0;
    const disposables = new DisposableStore();
    return new Promise((s, _) => {
      const quickpick = disposables.add(this.quickInputService.createQuickPick());
      quickpick.items = [];
      quickpick.sortByLabel = false;
      quickpick.matchOnDescription = true;
      quickpick.buttons = [this.quickInputService.backButton];
      quickpick.title = "Marketplace Themes";
      quickpick.placeholder = localize("themes.selectMarketplaceTheme", "Type to Search More. Select to Install. Up/Down Keys to Preview");
      quickpick.canSelectMany = false;
      disposables.add(quickpick.onDidChangeValue(() => this.trigger(quickpick.value)));
      disposables.add(quickpick.onDidAccept(async (_2) => {
        const themeItem = quickpick.selectedItems[0];
        if (themeItem?.galleryExtension) {
          result = "selected";
          quickpick.hide();
          const success = await this.installExtension(themeItem.galleryExtension);
          if (success) {
            selectTheme(themeItem.theme, true);
          } else {
            selectTheme(currentTheme, true);
          }
        }
      }));
      disposables.add(quickpick.onDidTriggerItemButton((e) => {
        if (isItem(e.item)) {
          const extensionId = e.item.theme?.extensionData?.extensionId;
          if (extensionId) {
            this.extensionsWorkbenchService.openSearch(`@id:${extensionId}`);
          } else {
            this.extensionsWorkbenchService.openSearch(`${this.marketplaceQuery} ${quickpick.value}`);
          }
        }
      }));
      disposables.add(quickpick.onDidChangeActive((themes) => {
        if (result === void 0) {
          selectTheme(themes[0]?.theme, false);
        }
      }));
      disposables.add(quickpick.onDidHide(() => {
        if (result === void 0) {
          selectTheme(currentTheme, true);
          result = "cancelled";
        }
        s(result);
      }));
      disposables.add(quickpick.onDidTriggerButton((e) => {
        if (e === this.quickInputService.backButton) {
          result = "back";
          quickpick.hide();
        }
      }));
      disposables.add(this.onDidChange(() => {
        let items = this.themes;
        if (this._searchOngoing) {
          items = items.concat({ label: "$(loading~spin) Searching for themes...", id: void 0, alwaysShow: true });
        } else if (items.length === 0 && this._searchError) {
          items = [{ label: `$(error) ${localize("search.error", "Error while searching for themes: {0}", this._searchError)}`, id: void 0, alwaysShow: true }];
        }
        const activeItemId = quickpick.activeItems[0]?.id;
        const newActiveItem = activeItemId ? items.find((i) => isItem(i) && i.id === activeItemId) : void 0;
        quickpick.items = items;
        if (newActiveItem) {
          quickpick.activeItems = [newActiveItem];
        }
      }));
      this.trigger(value);
      quickpick.show();
    }).finally(() => {
      disposables.dispose();
    });
  }
  async installExtension(galleryExtension) {
    this.extensionsWorkbenchService.openSearch(`@id:${galleryExtension.identifier.id}`);
    const result = await this.dialogService.confirm({
      message: localize("installExtension.confirm", "This will install extension '{0}' published by '{1}'. Do you want to continue?", galleryExtension.displayName, galleryExtension.publisherDisplayName),
      primaryButton: localize("installExtension.button.ok", "OK")
    });
    if (!result.confirmed) {
      return false;
    }
    try {
      await this.progressService.withProgress({
        location: 15,
        title: localize("installing extensions", "Installing Extension {0}...", galleryExtension.displayName)
      }, async () => {
        await this.extensionManagementService.installFromGallery(galleryExtension, {
          // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
          isMachineScoped: false
        });
      });
      return true;
    } catch (e) {
      this.logService.error(`Problem installing extension ${galleryExtension.identifier.id}`, e);
      return false;
    }
  }
  dispose() {
    if (this._tokenSource) {
      this._tokenSource.cancel();
      this._tokenSource = void 0;
    }
    this._queryDelayer.dispose();
    this._marketplaceExtensions.clear();
    this._marketplaceThemes.length = 0;
    this._onDidChange.dispose();
  }
};
MarketplaceThemesPicker = __decorate([
  __param(2, IExtensionGalleryService),
  __param(3, IExtensionManagementService),
  __param(4, IQuickInputService),
  __param(5, ILogService),
  __param(6, IProgressService),
  __param(7, IExtensionsWorkbenchService),
  __param(8, IDialogService)
], MarketplaceThemesPicker);
let InstalledThemesPicker = class InstalledThemesPicker2 {
  static {
    __name(this, "InstalledThemesPicker");
  }
  constructor(options, setTheme, getMarketplaceColorThemes, quickInputService, extensionGalleryService, extensionsWorkbenchService, extensionResourceLoaderService, instantiationService) {
    this.options = options;
    this.setTheme = setTheme;
    this.getMarketplaceColorThemes = getMarketplaceColorThemes;
    this.quickInputService = quickInputService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionResourceLoaderService = extensionResourceLoaderService;
    this.instantiationService = instantiationService;
  }
  async openQuickPick(picks, currentTheme) {
    let marketplaceThemePicker;
    if (this.extensionGalleryService.isEnabled()) {
      if (await this.extensionResourceLoaderService.supportsExtensionGalleryResources() && this.options.browseMessage) {
        marketplaceThemePicker = this.instantiationService.createInstance(MarketplaceThemesPicker, this.getMarketplaceColorThemes.bind(this), this.options.marketplaceTag);
        picks = [configurationEntry(this.options.browseMessage, ConfigureItem.BROWSE_GALLERY), ...picks];
      } else {
        picks = [...picks, { type: "separator" }, configurationEntry(this.options.installMessage, ConfigureItem.EXTENSIONS_VIEW)];
      }
    }
    let selectThemeTimeout;
    const selectTheme = /* @__PURE__ */ __name((theme, applyTheme) => {
      if (selectThemeTimeout) {
        clearTimeout(selectThemeTimeout);
      }
      selectThemeTimeout = mainWindow.setTimeout(() => {
        selectThemeTimeout = void 0;
        const newTheme = theme ?? currentTheme;
        this.setTheme(newTheme, applyTheme ? "auto" : "preview").then(void 0, (err) => {
          onUnexpectedError(err);
          this.setTheme(currentTheme, void 0);
        });
      }, applyTheme ? 0 : 200);
    }, "selectTheme");
    const pickInstalledThemes = /* @__PURE__ */ __name((activeItemId) => {
      const disposables = new DisposableStore();
      return new Promise((s, _) => {
        let isCompleted = false;
        const autoFocusIndex = picks.findIndex((p) => isItem(p) && p.id === activeItemId);
        const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
        quickpick.items = picks;
        quickpick.title = this.options.title;
        quickpick.description = this.options.description;
        quickpick.placeholder = this.options.placeholderMessage;
        quickpick.activeItems = [picks[autoFocusIndex]];
        quickpick.canSelectMany = false;
        quickpick.buttons = this.options.buttons ?? [];
        disposables.add(quickpick.onDidTriggerButton((button) => this.options.onButton?.(button, quickpick)));
        quickpick.matchOnDescription = true;
        disposables.add(quickpick.onDidAccept(async (_2) => {
          isCompleted = true;
          const theme = quickpick.selectedItems[0];
          if (!theme || theme.configureItem) {
            if (!theme || theme.configureItem === ConfigureItem.EXTENSIONS_VIEW) {
              this.extensionsWorkbenchService.openSearch(`${this.options.marketplaceTag} ${quickpick.value}`);
            } else if (theme.configureItem === ConfigureItem.BROWSE_GALLERY) {
              if (marketplaceThemePicker) {
                const res = await marketplaceThemePicker.openQuickPick(quickpick.value, currentTheme, selectTheme);
                if (res === "back") {
                  await pickInstalledThemes(void 0);
                }
              }
            }
          } else {
            selectTheme(theme.theme, true);
          }
          quickpick.hide();
          s();
        }));
        disposables.add(quickpick.onDidChangeActive((themes) => selectTheme(themes[0]?.theme, false)));
        disposables.add(quickpick.onDidHide(() => {
          if (!isCompleted) {
            selectTheme(currentTheme, true);
            s();
          }
          quickpick.dispose();
        }));
        disposables.add(quickpick.onDidTriggerItemButton((e) => {
          if (isItem(e.item)) {
            const extensionId = e.item.theme?.extensionData?.extensionId;
            if (extensionId) {
              this.extensionsWorkbenchService.openSearch(`@id:${extensionId}`);
            } else {
              this.extensionsWorkbenchService.openSearch(`${this.options.marketplaceTag} ${quickpick.value}`);
            }
          }
        }));
        quickpick.show();
      }).finally(() => {
        disposables.dispose();
      });
    }, "pickInstalledThemes");
    await pickInstalledThemes(currentTheme.id);
    marketplaceThemePicker?.dispose();
  }
};
InstalledThemesPicker = __decorate([
  __param(3, IQuickInputService),
  __param(4, IExtensionGalleryService),
  __param(5, IExtensionsWorkbenchService),
  __param(6, IExtensionResourceLoaderService),
  __param(7, IInstantiationService)
], InstalledThemesPicker);
const SelectColorThemeCommandId = "workbench.action.selectTheme";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectColorThemeCommandId,
      title: localize2("selectTheme.label", "Color Theme"),
      category: Categories.Preferences,
      f1: true,
      keybinding: {
        weight: 200,
        primary: KeyChord(
          2048 | 41,
          2048 | 50
          /* KeyCode.KeyT */
        )
      }
    });
  }
  getTitle(colorScheme) {
    switch (colorScheme) {
      case ColorScheme.DARK:
        return localize("themes.selectTheme.darkScheme", "Select Color Theme for System Dark Mode");
      case ColorScheme.LIGHT:
        return localize("themes.selectTheme.lightScheme", "Select Color Theme for System Light Mode");
      case ColorScheme.HIGH_CONTRAST_DARK:
        return localize("themes.selectTheme.darkHC", "Select Color Theme for High Contrast Dark Mode");
      case ColorScheme.HIGH_CONTRAST_LIGHT:
        return localize("themes.selectTheme.lightHC", "Select Color Theme for High Contrast Light Mode");
      default:
        return localize("themes.selectTheme.default", "Select Color Theme (detect system color mode disabled)");
    }
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const preferencesService = accessor.get(IPreferencesService);
    const preferredColorScheme = themeService.getPreferredColorScheme();
    const modeConfigureButton = {
      tooltip: preferredColorScheme ? localize("themes.configure.switchingEnabled", "Detect system color mode enabled. Click to configure.") : localize("themes.configure.switchingDisabled", "Detect system color mode disabled. Click to configure."),
      iconClass: ThemeIcon.asClassName(Codicon.colorMode),
      location: QuickInputButtonLocation.Inline
    };
    const options = {
      installMessage: localize("installColorThemes", "Install Additional Color Themes..."),
      browseMessage: "$(plus) " + localize("browseColorThemes", "Browse Additional Color Themes..."),
      placeholderMessage: this.getTitle(preferredColorScheme),
      marketplaceTag: "category:themes",
      buttons: [modeConfigureButton],
      onButton: /* @__PURE__ */ __name(async (_button, picker2) => {
        picker2.hide();
        await preferencesService.openSettings({ query: ThemeSettings.DETECT_COLOR_SCHEME });
      }, "onButton")
    };
    const setTheme = /* @__PURE__ */ __name((theme, settingsTarget) => themeService.setColorTheme(theme, settingsTarget), "setTheme");
    const getMarketplaceColorThemes = /* @__PURE__ */ __name((publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version), "getMarketplaceColorThemes");
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options, setTheme, getMarketplaceColorThemes);
    const themes = await themeService.getColorThemes();
    const currentTheme = themeService.getColorTheme();
    const lightEntries = toEntries(themes.filter((t) => t.type === ColorScheme.LIGHT), localize("themes.category.light", "light themes"));
    const darkEntries = toEntries(themes.filter((t) => t.type === ColorScheme.DARK), localize("themes.category.dark", "dark themes"));
    const hcEntries = toEntries(themes.filter((t) => isHighContrast(t.type)), localize("themes.category.hc", "high contrast themes"));
    let picks;
    switch (preferredColorScheme) {
      case ColorScheme.DARK:
        picks = [...darkEntries, ...lightEntries, ...hcEntries];
        break;
      case ColorScheme.HIGH_CONTRAST_DARK:
      case ColorScheme.HIGH_CONTRAST_LIGHT:
        picks = [...hcEntries, ...lightEntries, ...darkEntries];
        break;
      case ColorScheme.LIGHT:
      default:
        picks = [...lightEntries, ...darkEntries, ...hcEntries];
        break;
    }
    await picker.openQuickPick(picks, currentTheme);
  }
});
const SelectFileIconThemeCommandId = "workbench.action.selectIconTheme";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectFileIconThemeCommandId,
      title: localize2("selectIconTheme.label", "File Icon Theme"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const options = {
      installMessage: localize("installIconThemes", "Install Additional File Icon Themes..."),
      placeholderMessage: localize("themes.selectIconTheme", "Select File Icon Theme (Up/Down Keys to Preview)"),
      marketplaceTag: "tag:icon-theme"
    };
    const setTheme = /* @__PURE__ */ __name((theme, settingsTarget) => themeService.setFileIconTheme(theme, settingsTarget), "setTheme");
    const getMarketplaceColorThemes = /* @__PURE__ */ __name((publisher, name, version) => themeService.getMarketplaceFileIconThemes(publisher, name, version), "getMarketplaceColorThemes");
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options, setTheme, getMarketplaceColorThemes);
    const picks = [
      { type: "separator", label: localize("fileIconThemeCategory", "file icon themes") },
      { id: "", theme: FileIconThemeData.noIconTheme, label: localize("noIconThemeLabel", "None"), description: localize("noIconThemeDesc", "Disable File Icons") },
      ...toEntries(await themeService.getFileIconThemes())
    ];
    await picker.openQuickPick(picks, themeService.getFileIconTheme());
  }
});
const SelectProductIconThemeCommandId = "workbench.action.selectProductIconTheme";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectProductIconThemeCommandId,
      title: localize2("selectProductIconTheme.label", "Product Icon Theme"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const options = {
      installMessage: localize("installProductIconThemes", "Install Additional Product Icon Themes..."),
      browseMessage: "$(plus) " + localize("browseProductIconThemes", "Browse Additional Product Icon Themes..."),
      placeholderMessage: localize("themes.selectProductIconTheme", "Select Product Icon Theme (Up/Down Keys to Preview)"),
      marketplaceTag: "tag:product-icon-theme"
    };
    const setTheme = /* @__PURE__ */ __name((theme, settingsTarget) => themeService.setProductIconTheme(theme, settingsTarget), "setTheme");
    const getMarketplaceColorThemes = /* @__PURE__ */ __name((publisher, name, version) => themeService.getMarketplaceProductIconThemes(publisher, name, version), "getMarketplaceColorThemes");
    const instantiationService = accessor.get(IInstantiationService);
    const picker = instantiationService.createInstance(InstalledThemesPicker, options, setTheme, getMarketplaceColorThemes);
    const picks = [
      { type: "separator", label: localize("productIconThemeCategory", "product icon themes") },
      { id: DEFAULT_PRODUCT_ICON_THEME_ID, theme: ProductIconThemeData.defaultTheme, label: localize("defaultProductIconThemeLabel", "Default") },
      ...toEntries(await themeService.getProductIconThemes())
    ];
    await picker.openQuickPick(picks, themeService.getProductIconTheme());
  }
});
CommandsRegistry.registerCommand("workbench.action.previewColorTheme", async function(accessor, extension, themeSettingsId) {
  const themeService = accessor.get(IWorkbenchThemeService);
  let themes = findBuiltInThemes(await themeService.getColorThemes(), extension);
  if (themes.length === 0) {
    themes = await themeService.getMarketplaceColorThemes(extension.publisher, extension.name, extension.version);
  }
  for (const theme of themes) {
    if (!themeSettingsId || theme.settingsId === themeSettingsId) {
      await themeService.setColorTheme(theme, "preview");
      return theme.settingsId;
    }
  }
  return void 0;
});
function findBuiltInThemes(themes, extension) {
  return themes.filter(({ extensionData }) => extensionData && extensionData.extensionIsBuiltin && equalsIgnoreCase(extensionData.extensionPublisher, extension.publisher) && equalsIgnoreCase(extensionData.extensionName, extension.name));
}
__name(findBuiltInThemes, "findBuiltInThemes");
function configurationEntry(label, configureItem) {
  return {
    id: void 0,
    label,
    alwaysShow: true,
    buttons: [configureButton],
    configureItem
  };
}
__name(configurationEntry, "configurationEntry");
function isItem(i) {
  return i["type"] !== "separator";
}
__name(isItem, "isItem");
function toEntry(theme) {
  const settingId = theme.settingsId ?? void 0;
  const item = {
    id: theme.id,
    theme,
    label: theme.label,
    description: theme.description || (theme.label === settingId ? void 0 : settingId)
  };
  if (theme.extensionData) {
    item.buttons = [configureButton];
  }
  return item;
}
__name(toEntry, "toEntry");
function toEntries(themes, label) {
  const sorter = /* @__PURE__ */ __name((t1, t2) => t1.label.localeCompare(t2.label), "sorter");
  const entries = themes.map(toEntry).sort(sorter);
  if (entries.length > 0 && label) {
    entries.unshift({ type: "separator", label });
  }
  return entries;
}
__name(toEntries, "toEntries");
const configureButton = {
  iconClass: ThemeIcon.asClassName(manageExtensionIcon),
  tooltip: localize("manage extension", "Manage Extension")
};
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.generateColorTheme",
      title: localize2("generateColorTheme.label", "Generate Color Theme From Current Settings"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const theme = themeService.getColorTheme();
    const colors = Registry.as(ColorRegistryExtensions.ColorContribution).getColors();
    const colorIds = colors.filter((c) => !c.deprecationMessage).map((c) => c.id).sort();
    const resultingColors = {};
    const inherited = [];
    for (const colorId of colorIds) {
      const color = theme.getColor(colorId, false);
      if (color) {
        resultingColors[colorId] = Color.Format.CSS.formatHexA(color, true);
      } else {
        inherited.push(colorId);
      }
    }
    const nullDefaults = [];
    for (const id of inherited) {
      const color = theme.getColor(id);
      if (color) {
        resultingColors["__" + id] = Color.Format.CSS.formatHexA(color, true);
      } else {
        nullDefaults.push(id);
      }
    }
    for (const id of nullDefaults) {
      resultingColors["__" + id] = null;
    }
    let contents = JSON.stringify({
      "$schema": colorThemeSchemaId,
      type: theme.type,
      colors: resultingColors,
      tokenColors: theme.tokenColors.filter((t) => !!t.scope)
    }, null, "	");
    contents = contents.replace(/\"__/g, '//"');
    const editorService = accessor.get(IEditorService);
    return editorService.openEditor({ resource: void 0, contents, languageId: "jsonc", options: { pinned: true } });
  }
});
const toggleLightDarkThemesCommandId = "workbench.action.toggleLightDarkThemes";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: toggleLightDarkThemesCommandId,
      title: localize2("toggleLightDarkThemes.label", "Toggle between Light/Dark Themes"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const themeService = accessor.get(IWorkbenchThemeService);
    const configurationService = accessor.get(IConfigurationService);
    const notificationService = accessor.get(INotificationService);
    const preferencesService = accessor.get(IPreferencesService);
    if (configurationService.getValue(ThemeSettings.DETECT_COLOR_SCHEME)) {
      const message = localize({ key: "cannotToggle", comment: ["{0} is a setting name"] }, "Cannot toggle between light and dark themes when `{0}` is enabled in settings.", ThemeSettings.DETECT_COLOR_SCHEME);
      notificationService.prompt(Severity.Info, message, [
        {
          label: localize("goToSetting", "Open Settings"),
          run: /* @__PURE__ */ __name(() => {
            return preferencesService.openUserSettings({ query: ThemeSettings.DETECT_COLOR_SCHEME });
          }, "run")
        }
      ]);
      return;
    }
    const currentTheme = themeService.getColorTheme();
    let newSettingsId = ThemeSettings.PREFERRED_DARK_THEME;
    switch (currentTheme.type) {
      case ColorScheme.LIGHT:
        newSettingsId = ThemeSettings.PREFERRED_DARK_THEME;
        break;
      case ColorScheme.DARK:
        newSettingsId = ThemeSettings.PREFERRED_LIGHT_THEME;
        break;
      case ColorScheme.HIGH_CONTRAST_LIGHT:
        newSettingsId = ThemeSettings.PREFERRED_HC_DARK_THEME;
        break;
      case ColorScheme.HIGH_CONTRAST_DARK:
        newSettingsId = ThemeSettings.PREFERRED_HC_LIGHT_THEME;
        break;
    }
    const themeSettingId = configurationService.getValue(newSettingsId);
    if (themeSettingId && typeof themeSettingId === "string") {
      const theme = (await themeService.getColorThemes()).find((t) => t.settingsId === themeSettingId);
      if (theme) {
        themeService.setColorTheme(theme.id, "auto");
      }
    }
  }
});
const browseColorThemesInMarketplaceCommandId = "workbench.action.browseColorThemesInMarketplace";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: browseColorThemesInMarketplaceCommandId,
      title: localize2("browseColorThemeInMarketPlace.label", "Browse Color Themes in Marketplace"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const marketplaceTag = "category:themes";
    const themeService = accessor.get(IWorkbenchThemeService);
    const extensionGalleryService = accessor.get(IExtensionGalleryService);
    const extensionResourceLoaderService = accessor.get(IExtensionResourceLoaderService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const instantiationService = accessor.get(IInstantiationService);
    if (!extensionGalleryService.isEnabled()) {
      return;
    }
    if (!await extensionResourceLoaderService.supportsExtensionGalleryResources()) {
      await extensionsWorkbenchService.openSearch(marketplaceTag);
      return;
    }
    const currentTheme = themeService.getColorTheme();
    const getMarketplaceColorThemes = /* @__PURE__ */ __name((publisher, name, version) => themeService.getMarketplaceColorThemes(publisher, name, version), "getMarketplaceColorThemes");
    let selectThemeTimeout;
    const selectTheme = /* @__PURE__ */ __name((theme, applyTheme) => {
      if (selectThemeTimeout) {
        clearTimeout(selectThemeTimeout);
      }
      selectThemeTimeout = mainWindow.setTimeout(() => {
        selectThemeTimeout = void 0;
        const newTheme = theme ?? currentTheme;
        themeService.setColorTheme(newTheme, applyTheme ? "auto" : "preview").then(void 0, (err) => {
          onUnexpectedError(err);
          themeService.setColorTheme(currentTheme, void 0);
        });
      }, applyTheme ? 0 : 200);
    }, "selectTheme");
    const marketplaceThemePicker = instantiationService.createInstance(MarketplaceThemesPicker, getMarketplaceColorThemes, marketplaceTag);
    await marketplaceThemePicker.openQuickPick("", themeService.getColorTheme(), selectTheme).then(void 0, onUnexpectedError);
  }
});
const ThemesSubMenu = new MenuId("ThemesSubMenu");
MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
  title: localize("themes", "Themes"),
  submenu: ThemesSubMenu,
  group: "2_configuration",
  order: 7
});
MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
  title: localize({ key: "miSelectTheme", comment: ["&& denotes a mnemonic"] }, "&&Themes"),
  submenu: ThemesSubMenu,
  group: "2_configuration",
  order: 7
});
MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectColorThemeCommandId,
    title: localize("selectTheme.label", "Color Theme")
  },
  order: 1
});
MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectFileIconThemeCommandId,
    title: localize("themes.selectIconTheme.label", "File Icon Theme")
  },
  order: 2
});
MenuRegistry.appendMenuItem(ThemesSubMenu, {
  command: {
    id: SelectProductIconThemeCommandId,
    title: localize("themes.selectProductIconTheme.label", "Product Icon Theme")
  },
  order: 3
});
export {
  manageExtensionIcon
};
//# sourceMappingURL=themes.contribution.js.map
