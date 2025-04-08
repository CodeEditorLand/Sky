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
import { Event } from "../../../../../base/common/event.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IKeyMods, IQuickPickSeparator, IQuickInputService, IQuickPick, ItemActivation } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IRange } from "../../../../../editor/common/core/range.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IQuickAccessRegistry, Extensions as QuickaccessExtensions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IWorkbenchEditorConfiguration } from "../../../../common/editor.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { DisposableStore, IDisposable, toDisposable, Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { timeout } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { registerAction2, Action2, MenuId } from "../../../../../platform/actions/common/actions.js";
import { KeyMod, KeyCode } from "../../../../../base/common/keyCodes.js";
import { prepareQuery } from "../../../../../base/common/fuzzyScorer.js";
import { SymbolKind } from "../../../../../editor/common/languages.js";
import { fuzzyScore } from "../../../../../base/common/filters.js";
import { onUnexpectedError } from "../../../../../base/common/errors.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickAccessTextEditorContext } from "../../../../../editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js";
import { IOutlineService, OutlineTarget } from "../../../../services/outline/browser/outline.js";
import { isCompositeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ITextEditorOptions } from "../../../../../platform/editor/common/editor.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IOutlineModelService } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { accessibilityHelpIsShown, accessibleViewIsShown } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { matchesFuzzyIconAware, parseLabelWithIcons } from "../../../../../base/common/iconLabels.js";
let GotoSymbolQuickAccessProvider = class extends AbstractGotoSymbolQuickAccessProvider {
  constructor(editorService, editorGroupService, configurationService, languageFeaturesService, outlineService, outlineModelService) {
    super(languageFeaturesService, outlineModelService, {
      openSideBySideDirection: /* @__PURE__ */ __name(() => this.configuration.openSideBySideDirection, "openSideBySideDirection")
    });
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.configurationService = configurationService;
    this.outlineService = outlineService;
    this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
  }
  static {
    __name(this, "GotoSymbolQuickAccessProvider");
  }
  onDidActiveTextEditorControlChange;
  //#region DocumentSymbols (text editor required)
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      openSideBySideDirection: editorConfig?.openSideBySideDirection
    };
  }
  get activeTextEditorControl() {
    if (isCompositeEditor(this.editorService.activeEditorPane?.getControl())) {
      return void 0;
    }
    return this.editorService.activeTextEditorControl;
  }
  gotoLocation(context, options) {
    if ((options.keyMods.alt || this.configuration.openEditorPinned && options.keyMods.ctrlCmd || options.forceSideBySide) && this.editorService.activeEditor) {
      context.restoreViewState?.();
      const editorOptions = {
        selection: options.range,
        pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
        preserveFocus: options.preserveFocus
      };
      this.editorGroupService.sideGroup.openEditor(this.editorService.activeEditor, editorOptions);
    } else {
      super.gotoLocation(context, options);
    }
  }
  //#endregion
  //#region public methods to use this picker from other pickers
  static SYMBOL_PICKS_TIMEOUT = 8e3;
  async getSymbolPicks(model, filter, options, disposables, token) {
    const result = await Promise.race([
      this.waitForLanguageSymbolRegistry(model, disposables),
      timeout(GotoSymbolQuickAccessProvider.SYMBOL_PICKS_TIMEOUT)
    ]);
    if (!result || token.isCancellationRequested) {
      return [];
    }
    return this.doGetSymbolPicks(this.getDocumentSymbols(model, token), prepareQuery(filter), options, token, model);
  }
  //#endregion
  provideWithoutTextEditor(picker) {
    if (this.canPickWithOutlineService()) {
      return this.doGetOutlinePicks(picker);
    }
    return super.provideWithoutTextEditor(picker);
  }
  canPickWithOutlineService() {
    return this.editorService.activeEditorPane ? this.outlineService.canCreateOutline(this.editorService.activeEditorPane) : false;
  }
  doGetOutlinePicks(picker) {
    const pane = this.editorService.activeEditorPane;
    if (!pane) {
      return Disposable.None;
    }
    const cts = new CancellationTokenSource();
    const disposables = new DisposableStore();
    disposables.add(toDisposable(() => cts.dispose(true)));
    picker.busy = true;
    this.outlineService.createOutline(pane, OutlineTarget.QuickPick, cts.token).then((outline) => {
      if (!outline) {
        return;
      }
      if (cts.token.isCancellationRequested) {
        outline.dispose();
        return;
      }
      disposables.add(outline);
      const viewState = outline.captureViewState();
      disposables.add(toDisposable(() => {
        if (picker.selectedItems.length === 0) {
          viewState.dispose();
        }
      }));
      const entries = outline.config.quickPickDataSource.getQuickPickElements();
      const items = entries.map((entry, idx) => {
        return {
          kind: SymbolKind.File,
          index: idx,
          score: 0,
          label: entry.label,
          description: entry.description,
          ariaLabel: entry.ariaLabel,
          iconClasses: entry.iconClasses
        };
      });
      disposables.add(picker.onDidAccept(() => {
        picker.hide();
        const [entry] = picker.selectedItems;
        if (entry && entries[entry.index]) {
          outline.reveal(entries[entry.index].element, {}, false, false);
        }
      }));
      const updatePickerItems = /* @__PURE__ */ __name(() => {
        const filteredItems = items.filter((item) => {
          if (picker.value === "@") {
            item.score = 0;
            item.highlights = void 0;
            return true;
          }
          const trimmedQuery = picker.value.substring(AbstractGotoSymbolQuickAccessProvider.PREFIX.length).trim();
          const parsedLabel = parseLabelWithIcons(item.label);
          const score = fuzzyScore(
            trimmedQuery,
            trimmedQuery.toLowerCase(),
            0,
            parsedLabel.text,
            parsedLabel.text.toLowerCase(),
            0,
            { firstMatchCanBeWeak: true, boostFullMatch: true }
          );
          if (!score) {
            return false;
          }
          item.score = score[1];
          item.highlights = { label: matchesFuzzyIconAware(trimmedQuery, parsedLabel) ?? void 0 };
          return true;
        });
        if (filteredItems.length === 0) {
          const label = localize("empty", "No matching entries");
          picker.items = [{ label, index: -1, kind: SymbolKind.String }];
          picker.ariaLabel = label;
        } else {
          picker.items = filteredItems;
        }
      }, "updatePickerItems");
      updatePickerItems();
      disposables.add(picker.onDidChangeValue(updatePickerItems));
      const previewDisposable = new MutableDisposable();
      disposables.add(previewDisposable);
      disposables.add(picker.onDidChangeActive(() => {
        const [entry] = picker.activeItems;
        if (entry && entries[entry.index]) {
          previewDisposable.value = outline.preview(entries[entry.index].element);
        } else {
          previewDisposable.clear();
        }
      }));
    }).catch((err) => {
      onUnexpectedError(err);
      picker.hide();
    }).finally(() => {
      picker.busy = false;
    });
    return disposables;
  }
};
GotoSymbolQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IOutlineService),
  __decorateParam(5, IOutlineModelService)
], GotoSymbolQuickAccessProvider);
class GotoSymbolAction extends Action2 {
  static {
    __name(this, "GotoSymbolAction");
  }
  static ID = "workbench.action.gotoSymbol";
  constructor() {
    super({
      id: GotoSymbolAction.ID,
      title: {
        ...localize2("gotoSymbol", "Go to Symbol in Editor..."),
        mnemonicTitle: localize({ key: "miGotoSymbolInEditor", comment: ["&& denotes a mnemonic"] }, "Go to &&Symbol in Editor...")
      },
      f1: true,
      keybinding: {
        when: ContextKeyExpr.and(accessibleViewIsShown.negate(), accessibilityHelpIsShown.negate()),
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyO
      },
      menu: [{
        id: MenuId.MenubarGoMenu,
        group: "4_symbol_nav",
        order: 1
      }]
    });
  }
  run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoSymbolQuickAccessProvider.PREFIX, { itemActivation: ItemActivation.NONE });
  }
}
registerAction2(GotoSymbolAction);
Registry.as(QuickaccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: GotoSymbolQuickAccessProvider,
  prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
  contextKey: "inFileSymbolsPicker",
  placeholder: localize("gotoSymbolQuickAccessPlaceholder", "Type the name of a symbol to go to."),
  helpEntries: [
    {
      description: localize("gotoSymbolQuickAccess", "Go to Symbol in Editor"),
      prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
      commandId: GotoSymbolAction.ID,
      commandCenterOrder: 40
    },
    {
      description: localize("gotoSymbolByCategoryQuickAccess", "Go to Symbol in Editor by Category"),
      prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY
    }
  ]
});
export {
  GotoSymbolQuickAccessProvider
};
//# sourceMappingURL=gotoSymbolQuickAccess.js.map
