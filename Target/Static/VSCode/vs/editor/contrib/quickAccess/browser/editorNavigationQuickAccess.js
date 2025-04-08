var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { DisposableStore, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { getCodeEditor, isDiffEditor } from "../../../browser/editorBrowser.js";
import { IRange } from "../../../common/core/range.js";
import { IDiffEditor, IEditor, ScrollType } from "../../../common/editorCommon.js";
import { IModelDeltaDecoration, ITextModel, OverviewRulerLane } from "../../../common/model.js";
import { overviewRulerRangeHighlight } from "../../../common/core/editorColorRegistry.js";
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from "../../../../platform/quickinput/common/quickAccess.js";
import { IKeyMods, IQuickPick, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { status } from "../../../../base/browser/ui/aria/aria.js";
import { TextEditorSelectionSource } from "../../../../platform/editor/common/editor.js";
class AbstractEditorNavigationQuickAccessProvider {
  constructor(options) {
    this.options = options;
  }
  static {
    __name(this, "AbstractEditorNavigationQuickAccessProvider");
  }
  //#region Provider methods
  provide(picker, token, runOptions) {
    const disposables = new DisposableStore();
    picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
    picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
    const pickerDisposable = disposables.add(new MutableDisposable());
    pickerDisposable.value = this.doProvide(picker, token, runOptions);
    disposables.add(this.onDidActiveTextEditorControlChange(() => {
      pickerDisposable.value = void 0;
      pickerDisposable.value = this.doProvide(picker, token);
    }));
    return disposables;
  }
  doProvide(picker, token, runOptions) {
    const disposables = new DisposableStore();
    const editor = this.activeTextEditorControl;
    if (editor && this.canProvideWithTextEditor(editor)) {
      const context = { editor };
      const codeEditor = getCodeEditor(editor);
      if (codeEditor) {
        let lastKnownEditorViewState = editor.saveViewState() ?? void 0;
        disposables.add(codeEditor.onDidChangeCursorPosition(() => {
          lastKnownEditorViewState = editor.saveViewState() ?? void 0;
        }));
        context.restoreViewState = () => {
          if (lastKnownEditorViewState && editor === this.activeTextEditorControl) {
            editor.restoreViewState(lastKnownEditorViewState);
          }
        };
        disposables.add(createSingleCallFunction(token.onCancellationRequested)(() => context.restoreViewState?.()));
      }
      disposables.add(toDisposable(() => this.clearDecorations(editor)));
      disposables.add(this.provideWithTextEditor(context, picker, token, runOptions));
    } else {
      disposables.add(this.provideWithoutTextEditor(picker, token));
    }
    return disposables;
  }
  /**
   * Subclasses to implement if they can operate on the text editor.
   */
  canProvideWithTextEditor(editor) {
    return true;
  }
  gotoLocation({ editor }, options) {
    editor.setSelection(options.range, TextEditorSelectionSource.JUMP);
    editor.revealRangeInCenter(options.range, ScrollType.Smooth);
    if (!options.preserveFocus) {
      editor.focus();
    }
    const model = editor.getModel();
    if (model && "getLineContent" in model) {
      status(`${model.getLineContent(options.range.startLineNumber)}`);
    }
  }
  getModel(editor) {
    return isDiffEditor(editor) ? editor.getModel()?.modified : editor.getModel();
  }
  //#endregion
  //#region Decorations Utils
  rangeHighlightDecorationId = void 0;
  addDecorations(editor, range) {
    editor.changeDecorations((changeAccessor) => {
      const deleteDecorations = [];
      if (this.rangeHighlightDecorationId) {
        deleteDecorations.push(this.rangeHighlightDecorationId.overviewRulerDecorationId);
        deleteDecorations.push(this.rangeHighlightDecorationId.rangeHighlightId);
        this.rangeHighlightDecorationId = void 0;
      }
      const newDecorations = [
        // highlight the entire line on the range
        {
          range,
          options: {
            description: "quick-access-range-highlight",
            className: "rangeHighlight",
            isWholeLine: true
          }
        },
        // also add overview ruler highlight
        {
          range,
          options: {
            description: "quick-access-range-highlight-overview",
            overviewRuler: {
              color: themeColorFromId(overviewRulerRangeHighlight),
              position: OverviewRulerLane.Full
            }
          }
        }
      ];
      const [rangeHighlightId, overviewRulerDecorationId] = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
      this.rangeHighlightDecorationId = { rangeHighlightId, overviewRulerDecorationId };
    });
  }
  clearDecorations(editor) {
    const rangeHighlightDecorationId = this.rangeHighlightDecorationId;
    if (rangeHighlightDecorationId) {
      editor.changeDecorations((changeAccessor) => {
        changeAccessor.deltaDecorations([
          rangeHighlightDecorationId.overviewRulerDecorationId,
          rangeHighlightDecorationId.rangeHighlightId
        ], []);
      });
      this.rangeHighlightDecorationId = void 0;
    }
  }
  //#endregion
}
export {
  AbstractEditorNavigationQuickAccessProvider
};
//# sourceMappingURL=editorNavigationQuickAccess.js.map
