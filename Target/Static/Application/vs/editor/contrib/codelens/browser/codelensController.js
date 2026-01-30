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
import { createCancelablePromise, disposableTimeout, RunOnceScheduler } from "../../../../base/common/async.js";
import { onUnexpectedError, onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { StableEditorScrollState } from "../../../browser/stableEditorScroll.js";
import { EditorAction, registerEditorAction, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { EDITOR_FONT_DEFAULTS } from "../../../common/config/fontInfo.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { getCodeLensModel } from "./codelens.js";
import { ICodeLensCache } from "./codeLensCache.js";
import { CodeLensHelper, CodeLensWidget } from "./codelensWidget.js";
import { localize, localize2 } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
let CodeLensContribution = class CodeLensContribution2 {
  static {
    __name(this, "CodeLensContribution");
  }
  static {
    this.ID = "css.editor.codeLens";
  }
  constructor(_editor, _languageFeaturesService, debounceService, _commandService, _notificationService, _codeLensCache) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._commandService = _commandService;
    this._notificationService = _notificationService;
    this._codeLensCache = _codeLensCache;
    this._disposables = new DisposableStore();
    this._localToDispose = new DisposableStore();
    this._lenses = [];
    this._oldCodeLensModels = new DisposableStore();
    this._provideCodeLensDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, "CodeLensProvide", { min: 250 });
    this._resolveCodeLensesDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, "CodeLensResolve", { min: 250, salt: "resolve" });
    this._resolveCodeLensesScheduler = new RunOnceScheduler(() => this._resolveCodeLensesInViewport(), this._resolveCodeLensesDebounce.default());
    this._disposables.add(this._editor.onDidChangeModel(() => this._onModelChange()));
    this._disposables.add(this._editor.onDidChangeModelLanguage(() => this._onModelChange()));
    this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(
        59
        /* EditorOption.fontInfo */
      ) || e.hasChanged(
        25
        /* EditorOption.codeLensFontSize */
      ) || e.hasChanged(
        24
        /* EditorOption.codeLensFontFamily */
      )) {
        this._updateLensStyle();
      }
      if (e.hasChanged(
        23
        /* EditorOption.codeLens */
      )) {
        this._onModelChange();
      }
    }));
    this._disposables.add(_languageFeaturesService.codeLensProvider.onDidChange(this._onModelChange, this));
    this._onModelChange();
    this._updateLensStyle();
  }
  dispose() {
    this._localDispose();
    this._localToDispose.dispose();
    this._disposables.dispose();
    this._oldCodeLensModels.dispose();
    this._currentCodeLensModel?.dispose();
  }
  _getLayoutInfo() {
    const lineHeightFactor = Math.max(1.3, this._editor.getOption(
      75
      /* EditorOption.lineHeight */
    ) / this._editor.getOption(
      61
      /* EditorOption.fontSize */
    ));
    let fontSize = this._editor.getOption(
      25
      /* EditorOption.codeLensFontSize */
    );
    if (!fontSize || fontSize < 5) {
      fontSize = this._editor.getOption(
        61
        /* EditorOption.fontSize */
      ) * 0.9 | 0;
    }
    return {
      fontSize,
      codeLensHeight: fontSize * lineHeightFactor | 0
    };
  }
  _updateLensStyle() {
    const { codeLensHeight, fontSize } = this._getLayoutInfo();
    const fontFamily = this._editor.getOption(
      24
      /* EditorOption.codeLensFontFamily */
    );
    const editorFontInfo = this._editor.getOption(
      59
      /* EditorOption.fontInfo */
    );
    const { style } = this._editor.getContainerDomNode();
    style.setProperty("--vscode-editorCodeLens-lineHeight", `${codeLensHeight}px`);
    style.setProperty("--vscode-editorCodeLens-fontSize", `${fontSize}px`);
    style.setProperty("--vscode-editorCodeLens-fontFeatureSettings", editorFontInfo.fontFeatureSettings);
    if (fontFamily) {
      style.setProperty("--vscode-editorCodeLens-fontFamily", fontFamily);
      style.setProperty("--vscode-editorCodeLens-fontFamilyDefault", EDITOR_FONT_DEFAULTS.fontFamily);
    }
    this._editor.changeViewZones((accessor) => {
      for (const lens of this._lenses) {
        lens.updateHeight(codeLensHeight, accessor);
      }
    });
  }
  _localDispose() {
    this._getCodeLensModelPromise?.cancel();
    this._getCodeLensModelPromise = void 0;
    this._resolveCodeLensesPromise?.cancel();
    this._resolveCodeLensesPromise = void 0;
    this._localToDispose.clear();
    this._oldCodeLensModels.clear();
    this._currentCodeLensModel?.dispose();
  }
  _onModelChange() {
    this._localDispose();
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    if (!this._editor.getOption(
      23
      /* EditorOption.codeLens */
    ) || model.isTooLargeForTokenization()) {
      return;
    }
    const cachedLenses = this._codeLensCache.get(model);
    if (cachedLenses) {
      this._renderCodeLensSymbols(cachedLenses);
    }
    if (!this._languageFeaturesService.codeLensProvider.has(model)) {
      if (cachedLenses) {
        disposableTimeout(() => {
          const cachedLensesNow = this._codeLensCache.get(model);
          if (cachedLenses === cachedLensesNow) {
            this._codeLensCache.delete(model);
            this._onModelChange();
          }
        }, 30 * 1e3, this._localToDispose);
      }
      return;
    }
    for (const provider of this._languageFeaturesService.codeLensProvider.all(model)) {
      if (typeof provider.onDidChange === "function") {
        const registration = provider.onDidChange(() => scheduler.schedule());
        this._localToDispose.add(registration);
      }
    }
    const scheduler = new RunOnceScheduler(() => {
      const t1 = Date.now();
      this._getCodeLensModelPromise?.cancel();
      this._getCodeLensModelPromise = createCancelablePromise((token) => getCodeLensModel(this._languageFeaturesService.codeLensProvider, model, token));
      this._getCodeLensModelPromise.then((result) => {
        if (this._currentCodeLensModel) {
          this._oldCodeLensModels.add(this._currentCodeLensModel);
        }
        this._currentCodeLensModel = result;
        this._codeLensCache.put(model, result);
        const newDelay = this._provideCodeLensDebounce.update(model, Date.now() - t1);
        scheduler.delay = newDelay;
        this._renderCodeLensSymbols(result);
        this._resolveCodeLensesInViewportSoon();
      }, onUnexpectedError);
    }, this._provideCodeLensDebounce.get(model));
    this._localToDispose.add(scheduler);
    this._localToDispose.add(toDisposable(() => this._resolveCodeLensesScheduler.cancel()));
    this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
      this._editor.changeDecorations((decorationsAccessor) => {
        this._editor.changeViewZones((viewZonesAccessor) => {
          const toDispose = [];
          let lastLensLineNumber = -1;
          this._lenses.forEach((lens) => {
            if (!lens.isValid() || lastLensLineNumber === lens.getLineNumber()) {
              toDispose.push(lens);
            } else {
              lens.update(viewZonesAccessor);
              lastLensLineNumber = lens.getLineNumber();
            }
          });
          const helper = new CodeLensHelper();
          toDispose.forEach((l) => {
            l.dispose(helper, viewZonesAccessor);
            this._lenses.splice(this._lenses.indexOf(l), 1);
          });
          helper.commit(decorationsAccessor);
        });
      });
      scheduler.schedule();
      this._resolveCodeLensesScheduler.cancel();
      this._resolveCodeLensesPromise?.cancel();
      this._resolveCodeLensesPromise = void 0;
    }));
    this._localToDispose.add(this._editor.onDidFocusEditorText(() => {
      scheduler.schedule();
    }));
    this._localToDispose.add(this._editor.onDidBlurEditorText(() => {
      scheduler.cancel();
    }));
    this._localToDispose.add(this._editor.onDidScrollChange((e) => {
      if (e.scrollTopChanged && this._lenses.length > 0) {
        this._resolveCodeLensesInViewportSoon();
      }
    }));
    this._localToDispose.add(this._editor.onDidLayoutChange(() => {
      this._resolveCodeLensesInViewportSoon();
    }));
    this._localToDispose.add(toDisposable(() => {
      if (this._editor.getModel()) {
        const scrollState = StableEditorScrollState.capture(this._editor);
        this._editor.changeDecorations((decorationsAccessor) => {
          this._editor.changeViewZones((viewZonesAccessor) => {
            this._disposeAllLenses(decorationsAccessor, viewZonesAccessor);
          });
        });
        scrollState.restore(this._editor);
      } else {
        this._disposeAllLenses(void 0, void 0);
      }
    }));
    this._localToDispose.add(this._editor.onMouseDown((e) => {
      if (e.target.type !== 9) {
        return;
      }
      let target = e.target.element;
      if (target?.tagName === "SPAN") {
        target = target.parentElement;
      }
      if (target?.tagName === "A") {
        for (const lens of this._lenses) {
          const command = lens.getCommand(target);
          if (command) {
            this._commandService.executeCommand(command.id, ...command.arguments || []).catch((err) => this._notificationService.error(err));
            break;
          }
        }
      }
    }));
    scheduler.schedule();
  }
  _disposeAllLenses(decChangeAccessor, viewZoneChangeAccessor) {
    const helper = new CodeLensHelper();
    for (const lens of this._lenses) {
      lens.dispose(helper, viewZoneChangeAccessor);
    }
    if (decChangeAccessor) {
      helper.commit(decChangeAccessor);
    }
    this._lenses.length = 0;
  }
  _renderCodeLensSymbols(symbols) {
    if (!this._editor.hasModel()) {
      return;
    }
    const maxLineNumber = this._editor.getModel().getLineCount();
    const groups = [];
    let lastGroup;
    for (const symbol of symbols.lenses) {
      const line = symbol.symbol.range.startLineNumber;
      if (line < 1 || line > maxLineNumber) {
        continue;
      } else if (lastGroup && lastGroup[lastGroup.length - 1].symbol.range.startLineNumber === line) {
        lastGroup.push(symbol);
      } else {
        lastGroup = [symbol];
        groups.push(lastGroup);
      }
    }
    if (!groups.length && !this._lenses.length) {
      return;
    }
    const scrollState = StableEditorScrollState.capture(this._editor);
    const layoutInfo = this._getLayoutInfo();
    this._editor.changeDecorations((decorationsAccessor) => {
      this._editor.changeViewZones((viewZoneAccessor) => {
        const helper = new CodeLensHelper();
        let codeLensIndex = 0;
        let groupsIndex = 0;
        while (groupsIndex < groups.length && codeLensIndex < this._lenses.length) {
          const symbolsLineNumber = groups[groupsIndex][0].symbol.range.startLineNumber;
          const codeLensLineNumber = this._lenses[codeLensIndex].getLineNumber();
          if (codeLensLineNumber < symbolsLineNumber) {
            this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
            this._lenses.splice(codeLensIndex, 1);
          } else if (codeLensLineNumber === symbolsLineNumber) {
            this._lenses[codeLensIndex].updateCodeLensSymbols(groups[groupsIndex], helper);
            groupsIndex++;
            codeLensIndex++;
          } else {
            this._lenses.splice(codeLensIndex, 0, new CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
            codeLensIndex++;
            groupsIndex++;
          }
        }
        while (codeLensIndex < this._lenses.length) {
          this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
          this._lenses.splice(codeLensIndex, 1);
        }
        while (groupsIndex < groups.length) {
          this._lenses.push(new CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
          groupsIndex++;
        }
        helper.commit(decorationsAccessor);
      });
    });
    scrollState.restore(this._editor);
  }
  _resolveCodeLensesInViewportSoon() {
    const model = this._editor.getModel();
    if (model) {
      this._resolveCodeLensesScheduler.schedule();
    }
  }
  _resolveCodeLensesInViewport() {
    this._resolveCodeLensesPromise?.cancel();
    this._resolveCodeLensesPromise = void 0;
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const toResolve = [];
    const lenses = [];
    this._lenses.forEach((lens) => {
      const request = lens.computeIfNecessary(model);
      if (request) {
        toResolve.push(request);
        lenses.push(lens);
      }
    });
    if (toResolve.length === 0) {
      this._oldCodeLensModels.clear();
      return;
    }
    const t1 = Date.now();
    const resolvePromise = createCancelablePromise((token) => {
      const promises = toResolve.map((request, i) => {
        const resolvedSymbols = new Array(request.length);
        const promises2 = request.map((request2, i2) => {
          if (!request2.symbol.command && typeof request2.provider.resolveCodeLens === "function") {
            return Promise.resolve(request2.provider.resolveCodeLens(model, request2.symbol, token)).then((symbol) => {
              resolvedSymbols[i2] = symbol;
            }, onUnexpectedExternalError);
          } else {
            resolvedSymbols[i2] = request2.symbol;
            return Promise.resolve(void 0);
          }
        });
        return Promise.all(promises2).then(() => {
          if (!token.isCancellationRequested && !lenses[i].isDisposed()) {
            lenses[i].updateCommands(resolvedSymbols);
          }
        });
      });
      return Promise.all(promises);
    });
    this._resolveCodeLensesPromise = resolvePromise;
    this._resolveCodeLensesPromise.then(() => {
      const newDelay = this._resolveCodeLensesDebounce.update(model, Date.now() - t1);
      this._resolveCodeLensesScheduler.delay = newDelay;
      if (this._currentCodeLensModel) {
        this._codeLensCache.put(model, this._currentCodeLensModel);
      }
      this._oldCodeLensModels.clear();
      if (resolvePromise === this._resolveCodeLensesPromise) {
        this._resolveCodeLensesPromise = void 0;
      }
    }, (err) => {
      onUnexpectedError(err);
      if (resolvePromise === this._resolveCodeLensesPromise) {
        this._resolveCodeLensesPromise = void 0;
      }
    });
  }
  async getModel() {
    await this._getCodeLensModelPromise;
    await this._resolveCodeLensesPromise;
    return !this._currentCodeLensModel?.isDisposed ? this._currentCodeLensModel : void 0;
  }
};
CodeLensContribution = __decorate([
  __param(1, ILanguageFeaturesService),
  __param(2, ILanguageFeatureDebounceService),
  __param(3, ICommandService),
  __param(4, INotificationService),
  __param(5, ICodeLensCache)
], CodeLensContribution);
registerEditorContribution(
  CodeLensContribution.ID,
  CodeLensContribution,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
registerEditorAction(class ShowLensesInCurrentLine extends EditorAction {
  static {
    __name(this, "ShowLensesInCurrentLine");
  }
  constructor() {
    super({
      id: "codelens.showLensesInCurrentLine",
      precondition: EditorContextKeys.hasCodeLensProvider,
      label: localize2("showLensOnLine", "Show CodeLens Commands for Current Line")
    });
  }
  async run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const lineNumber = editor.getSelection().positionLineNumber;
    const codelensController = editor.getContribution(CodeLensContribution.ID);
    if (!codelensController) {
      return;
    }
    const model = await codelensController.getModel();
    if (!model) {
      return;
    }
    const items = [];
    for (const lens of model.lenses) {
      if (lens.symbol.command && lens.symbol.range.startLineNumber === lineNumber) {
        items.push({
          label: lens.symbol.command.title,
          command: lens.symbol.command
        });
      }
    }
    if (items.length === 0) {
      return;
    }
    const item = await quickInputService.pick(items, {
      canPickMany: false,
      placeHolder: localize("placeHolder", "Select a command")
    });
    if (!item) {
      return;
    }
    let command = item.command;
    if (model.isDisposed) {
      const newModel = await codelensController.getModel();
      const newLens = newModel?.lenses.find((lens) => lens.symbol.range.startLineNumber === lineNumber && lens.symbol.command?.title === command.title);
      if (!newLens || !newLens.symbol.command) {
        return;
      }
      command = newLens.symbol.command;
    }
    try {
      await commandService.executeCommand(command.id, ...command.arguments || []);
    } catch (err) {
      notificationService.error(err);
    }
  }
});
export {
  CodeLensContribution
};
//# sourceMappingURL=codelensController.js.map
