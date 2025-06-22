var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { pieceToQuery, prepareQuery, scoreFuzzy2 } from "../../../../base/common/fuzzyScorer.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { format, trim } from "../../../../base/common/strings.js";
import { Range } from "../../../common/core/range.js";
import { SymbolKinds, getAriaLabelForSymbol } from "../../../common/languages.js";
import { IOutlineModelService } from "../../documentSymbols/browser/outlineModel.js";
import { AbstractEditorNavigationQuickAccessProvider } from "./editorNavigationQuickAccess.js";
import { localize } from "../../../../nls.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { findLast } from "../../../../base/common/arraysFind.js";
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
var AbstractGotoSymbolQuickAccessProvider_1;
let AbstractGotoSymbolQuickAccessProvider = class AbstractGotoSymbolQuickAccessProvider2 extends AbstractEditorNavigationQuickAccessProvider {
  static {
    __name(this, "AbstractGotoSymbolQuickAccessProvider");
  }
  static {
    AbstractGotoSymbolQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "@";
  }
  static {
    this.SCOPE_PREFIX = ":";
  }
  static {
    this.PREFIX_BY_CATEGORY = `${this.PREFIX}${this.SCOPE_PREFIX}`;
  }
  constructor(_languageFeaturesService, _outlineModelService, options = /* @__PURE__ */ Object.create(null)) {
    super(options);
    this._languageFeaturesService = _languageFeaturesService;
    this._outlineModelService = _outlineModelService;
    this.options = options;
    this.options.canAcceptInBackground = true;
  }
  provideWithoutTextEditor(picker) {
    this.provideLabelPick(picker, localize("cannotRunGotoSymbolWithoutEditor", "To go to a symbol, first open a text editor with symbol information."));
    return Disposable.None;
  }
  provideWithTextEditor(context, picker, token, runOptions) {
    const editor = context.editor;
    const model = this.getModel(editor);
    if (!model) {
      return Disposable.None;
    }
    if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
      return this.doProvideWithEditorSymbols(context, model, picker, token, runOptions);
    }
    return this.doProvideWithoutEditorSymbols(context, model, picker, token);
  }
  doProvideWithoutEditorSymbols(context, model, picker, token) {
    const disposables = new DisposableStore();
    this.provideLabelPick(picker, localize("cannotRunGotoSymbolWithoutSymbolProvider", "The active text editor does not provide symbol information."));
    (async () => {
      const result = await this.waitForLanguageSymbolRegistry(model, disposables);
      if (!result || token.isCancellationRequested) {
        return;
      }
      disposables.add(this.doProvideWithEditorSymbols(context, model, picker, token));
    })();
    return disposables;
  }
  provideLabelPick(picker, label) {
    picker.items = [{
      label,
      index: 0,
      kind: 14
      /* SymbolKind.String */
    }];
    picker.ariaLabel = label;
  }
  async waitForLanguageSymbolRegistry(model, disposables) {
    if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
      return true;
    }
    const symbolProviderRegistryPromise = new DeferredPromise();
    const symbolProviderListener = disposables.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => {
      if (this._languageFeaturesService.documentSymbolProvider.has(model)) {
        symbolProviderListener.dispose();
        symbolProviderRegistryPromise.complete(true);
      }
    }));
    disposables.add(toDisposable(() => symbolProviderRegistryPromise.complete(false)));
    return symbolProviderRegistryPromise.p;
  }
  doProvideWithEditorSymbols(context, model, picker, token, runOptions) {
    const editor = context.editor;
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept((event) => {
      const [item] = picker.selectedItems;
      if (item && item.range) {
        this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, preserveFocus: event.inBackground });
        runOptions?.handleAccept?.(item, event.inBackground);
        if (!event.inBackground) {
          picker.hide();
        }
      }
    }));
    disposables.add(picker.onDidTriggerItemButton(({ item }) => {
      if (item && item.range) {
        this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, forceSideBySide: true });
        picker.hide();
      }
    }));
    const symbolsPromise = this.getDocumentSymbols(model, token);
    const picksCts = disposables.add(new MutableDisposable());
    const updatePickerItems = /* @__PURE__ */ __name(async (positionToEnclose) => {
      picksCts?.value?.cancel();
      picker.busy = false;
      picksCts.value = new CancellationTokenSource();
      picker.busy = true;
      try {
        const query = prepareQuery(picker.value.substr(AbstractGotoSymbolQuickAccessProvider_1.PREFIX.length).trim());
        const items = await this.doGetSymbolPicks(symbolsPromise, query, void 0, picksCts.value.token, model);
        if (token.isCancellationRequested) {
          return;
        }
        if (items.length > 0) {
          picker.items = items;
          if (positionToEnclose && query.original.length === 0) {
            const candidate = findLast(items, (item) => Boolean(item.type !== "separator" && item.range && Range.containsPosition(item.range.decoration, positionToEnclose)));
            if (candidate) {
              picker.activeItems = [candidate];
            }
          }
        } else {
          if (query.original.length > 0) {
            this.provideLabelPick(picker, localize("noMatchingSymbolResults", "No matching editor symbols"));
          } else {
            this.provideLabelPick(picker, localize("noSymbolResults", "No editor symbols"));
          }
        }
      } finally {
        if (!token.isCancellationRequested) {
          picker.busy = false;
        }
      }
    }, "updatePickerItems");
    disposables.add(picker.onDidChangeValue(() => updatePickerItems(void 0)));
    updatePickerItems(editor.getSelection()?.getPosition());
    disposables.add(picker.onDidChangeActive(() => {
      const [item] = picker.activeItems;
      if (item && item.range) {
        editor.revealRangeInCenter(
          item.range.selection,
          0
          /* ScrollType.Smooth */
        );
        this.addDecorations(editor, item.range.decoration);
      }
    }));
    return disposables;
  }
  async doGetSymbolPicks(symbolsPromise, query, options, token, model) {
    const symbols = await symbolsPromise;
    if (token.isCancellationRequested) {
      return [];
    }
    const filterBySymbolKind = query.original.indexOf(AbstractGotoSymbolQuickAccessProvider_1.SCOPE_PREFIX) === 0;
    const filterPos = filterBySymbolKind ? 1 : 0;
    let symbolQuery;
    let containerQuery;
    if (query.values && query.values.length > 1) {
      symbolQuery = pieceToQuery(query.values[0]);
      containerQuery = pieceToQuery(query.values.slice(1));
    } else {
      symbolQuery = query;
    }
    let buttons;
    const openSideBySideDirection = this.options?.openSideBySideDirection?.();
    if (openSideBySideDirection) {
      buttons = [{
        iconClass: openSideBySideDirection === "right" ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
        tooltip: openSideBySideDirection === "right" ? localize("openToSide", "Open to the Side") : localize("openToBottom", "Open to the Bottom")
      }];
    }
    const filteredSymbolPicks = [];
    for (let index = 0; index < symbols.length; index++) {
      const symbol = symbols[index];
      const symbolLabel = trim(symbol.name);
      const symbolLabelWithIcon = `$(${SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
      const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
      let containerLabel = symbol.containerName;
      if (options?.extraContainerLabel) {
        if (containerLabel) {
          containerLabel = `${options.extraContainerLabel} \u2022 ${containerLabel}`;
        } else {
          containerLabel = options.extraContainerLabel;
        }
      }
      let symbolScore = void 0;
      let symbolMatches = void 0;
      let containerScore = void 0;
      let containerMatches = void 0;
      if (query.original.length > filterPos) {
        let skipContainerQuery = false;
        if (symbolQuery !== query) {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, {
            ...query,
            values: void 0
            /* disable multi-query support */
          }, filterPos, symbolLabelIconOffset);
          if (typeof symbolScore === "number") {
            skipContainerQuery = true;
          }
        }
        if (typeof symbolScore !== "number") {
          [symbolScore, symbolMatches] = scoreFuzzy2(symbolLabelWithIcon, symbolQuery, filterPos, symbolLabelIconOffset);
          if (typeof symbolScore !== "number") {
            continue;
          }
        }
        if (!skipContainerQuery && containerQuery) {
          if (containerLabel && containerQuery.original.length > 0) {
            [containerScore, containerMatches] = scoreFuzzy2(containerLabel, containerQuery);
          }
          if (typeof containerScore !== "number") {
            continue;
          }
          if (typeof symbolScore === "number") {
            symbolScore += containerScore;
          }
        }
      }
      const deprecated = symbol.tags && symbol.tags.indexOf(
        1
        /* SymbolTag.Deprecated */
      ) >= 0;
      filteredSymbolPicks.push({
        index,
        kind: symbol.kind,
        score: symbolScore,
        label: symbolLabelWithIcon,
        ariaLabel: getAriaLabelForSymbol(symbol.name, symbol.kind),
        description: containerLabel,
        highlights: deprecated ? void 0 : {
          label: symbolMatches,
          description: containerMatches
        },
        range: {
          selection: Range.collapseToStart(symbol.selectionRange),
          decoration: symbol.range
        },
        uri: model.uri,
        symbolName: symbolLabel,
        strikethrough: deprecated,
        buttons
      });
    }
    const sortedFilteredSymbolPicks = filteredSymbolPicks.sort((symbolA, symbolB) => filterBySymbolKind ? this.compareByKindAndScore(symbolA, symbolB) : this.compareByScore(symbolA, symbolB));
    let symbolPicks = [];
    if (filterBySymbolKind) {
      let updateLastSeparatorLabel2 = function() {
        if (lastSeparator && typeof lastSymbolKind === "number" && lastSymbolKindCounter > 0) {
          lastSeparator.label = format(NLS_SYMBOL_KIND_CACHE[lastSymbolKind] || FALLBACK_NLS_SYMBOL_KIND, lastSymbolKindCounter);
        }
      };
      var updateLastSeparatorLabel = updateLastSeparatorLabel2;
      __name(updateLastSeparatorLabel2, "updateLastSeparatorLabel");
      let lastSymbolKind = void 0;
      let lastSeparator = void 0;
      let lastSymbolKindCounter = 0;
      for (const symbolPick of sortedFilteredSymbolPicks) {
        if (lastSymbolKind !== symbolPick.kind) {
          updateLastSeparatorLabel2();
          lastSymbolKind = symbolPick.kind;
          lastSymbolKindCounter = 1;
          lastSeparator = { type: "separator" };
          symbolPicks.push(lastSeparator);
        } else {
          lastSymbolKindCounter++;
        }
        symbolPicks.push(symbolPick);
      }
      updateLastSeparatorLabel2();
    } else if (sortedFilteredSymbolPicks.length > 0) {
      symbolPicks = [
        { label: localize("symbols", "symbols ({0})", filteredSymbolPicks.length), type: "separator" },
        ...sortedFilteredSymbolPicks
      ];
    }
    return symbolPicks;
  }
  compareByScore(symbolA, symbolB) {
    if (typeof symbolA.score !== "number" && typeof symbolB.score === "number") {
      return 1;
    } else if (typeof symbolA.score === "number" && typeof symbolB.score !== "number") {
      return -1;
    }
    if (typeof symbolA.score === "number" && typeof symbolB.score === "number") {
      if (symbolA.score > symbolB.score) {
        return -1;
      } else if (symbolA.score < symbolB.score) {
        return 1;
      }
    }
    if (symbolA.index < symbolB.index) {
      return -1;
    } else if (symbolA.index > symbolB.index) {
      return 1;
    }
    return 0;
  }
  compareByKindAndScore(symbolA, symbolB) {
    const kindA = NLS_SYMBOL_KIND_CACHE[symbolA.kind] || FALLBACK_NLS_SYMBOL_KIND;
    const kindB = NLS_SYMBOL_KIND_CACHE[symbolB.kind] || FALLBACK_NLS_SYMBOL_KIND;
    const result = kindA.localeCompare(kindB);
    if (result === 0) {
      return this.compareByScore(symbolA, symbolB);
    }
    return result;
  }
  async getDocumentSymbols(document, token) {
    const model = await this._outlineModelService.getOrCreate(document, token);
    return token.isCancellationRequested ? [] : model.asListOfDocumentSymbols();
  }
};
AbstractGotoSymbolQuickAccessProvider = AbstractGotoSymbolQuickAccessProvider_1 = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IOutlineModelService)
], AbstractGotoSymbolQuickAccessProvider);
const FALLBACK_NLS_SYMBOL_KIND = localize("property", "properties ({0})");
const NLS_SYMBOL_KIND_CACHE = {
  [
    5
    /* SymbolKind.Method */
  ]: localize("method", "methods ({0})"),
  [
    11
    /* SymbolKind.Function */
  ]: localize("function", "functions ({0})"),
  [
    8
    /* SymbolKind.Constructor */
  ]: localize("_constructor", "constructors ({0})"),
  [
    12
    /* SymbolKind.Variable */
  ]: localize("variable", "variables ({0})"),
  [
    4
    /* SymbolKind.Class */
  ]: localize("class", "classes ({0})"),
  [
    22
    /* SymbolKind.Struct */
  ]: localize("struct", "structs ({0})"),
  [
    23
    /* SymbolKind.Event */
  ]: localize("event", "events ({0})"),
  [
    24
    /* SymbolKind.Operator */
  ]: localize("operator", "operators ({0})"),
  [
    10
    /* SymbolKind.Interface */
  ]: localize("interface", "interfaces ({0})"),
  [
    2
    /* SymbolKind.Namespace */
  ]: localize("namespace", "namespaces ({0})"),
  [
    3
    /* SymbolKind.Package */
  ]: localize("package", "packages ({0})"),
  [
    25
    /* SymbolKind.TypeParameter */
  ]: localize("typeParameter", "type parameters ({0})"),
  [
    1
    /* SymbolKind.Module */
  ]: localize("modules", "modules ({0})"),
  [
    6
    /* SymbolKind.Property */
  ]: localize("property", "properties ({0})"),
  [
    9
    /* SymbolKind.Enum */
  ]: localize("enum", "enumerations ({0})"),
  [
    21
    /* SymbolKind.EnumMember */
  ]: localize("enumMember", "enumeration members ({0})"),
  [
    14
    /* SymbolKind.String */
  ]: localize("string", "strings ({0})"),
  [
    0
    /* SymbolKind.File */
  ]: localize("file", "files ({0})"),
  [
    17
    /* SymbolKind.Array */
  ]: localize("array", "arrays ({0})"),
  [
    15
    /* SymbolKind.Number */
  ]: localize("number", "numbers ({0})"),
  [
    16
    /* SymbolKind.Boolean */
  ]: localize("boolean", "booleans ({0})"),
  [
    18
    /* SymbolKind.Object */
  ]: localize("object", "objects ({0})"),
  [
    19
    /* SymbolKind.Key */
  ]: localize("key", "keys ({0})"),
  [
    7
    /* SymbolKind.Field */
  ]: localize("field", "fields ({0})"),
  [
    13
    /* SymbolKind.Constant */
  ]: localize("constant", "constants ({0})")
};
export {
  AbstractGotoSymbolQuickAccessProvider
};
//# sourceMappingURL=gotoSymbolQuickAccess.js.map
