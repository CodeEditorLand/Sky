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
import * as nls from "../../../../nls.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as platform from "../../../../base/common/platform.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { registerEditorContribution, EditorAction, ServicesAccessor, registerEditorAction, EditorContributionInstantiation } from "../../../../editor/browser/editorExtensions.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../../editor/common/config/editorOptions.js";
import { ICursorSelectionChangedEvent } from "../../../../editor/common/cursorEvents.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IEditorContribution, Handler } from "../../../../editor/common/editorCommon.js";
import { EndOfLinePreference } from "../../../../editor/common/model.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { SelectionClipboardContributionID } from "../browser/selectionClipboard.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Event } from "../../../../base/common/event.js";
import { addDisposableListener, onDidRegisterWindow } from "../../../../base/browser/dom.js";
let SelectionClipboard = class extends Disposable {
  static {
    __name(this, "SelectionClipboard");
  }
  static SELECTION_LENGTH_LIMIT = 65536;
  constructor(editor, clipboardService) {
    super();
    if (platform.isLinux) {
      let isEnabled = editor.getOption(EditorOption.selectionClipboard);
      this._register(editor.onDidChangeConfiguration((e) => {
        if (e.hasChanged(EditorOption.selectionClipboard)) {
          isEnabled = editor.getOption(EditorOption.selectionClipboard);
        }
      }));
      const setSelectionToClipboard = this._register(new RunOnceScheduler(() => {
        if (!editor.hasModel()) {
          return;
        }
        const model = editor.getModel();
        let selections = editor.getSelections();
        selections = selections.slice(0);
        selections.sort(Range.compareRangesUsingStarts);
        let resultLength = 0;
        for (const sel of selections) {
          if (sel.isEmpty()) {
            return;
          }
          resultLength += model.getValueLengthInRange(sel);
        }
        if (resultLength > SelectionClipboard.SELECTION_LENGTH_LIMIT) {
          return;
        }
        const result = [];
        for (const sel of selections) {
          result.push(model.getValueInRange(sel, EndOfLinePreference.TextDefined));
        }
        const textToCopy = result.join(model.getEOL());
        clipboardService.writeText(textToCopy, "selection");
      }, 100));
      this._register(editor.onDidChangeCursorSelection((e) => {
        if (!isEnabled) {
          return;
        }
        if (e.source === "restoreState") {
          return;
        }
        setSelectionToClipboard.schedule();
      }));
    }
  }
  dispose() {
    super.dispose();
  }
};
SelectionClipboard = __decorateClass([
  __decorateParam(1, IClipboardService)
], SelectionClipboard);
let LinuxSelectionClipboardPastePreventer = class extends Disposable {
  static {
    __name(this, "LinuxSelectionClipboardPastePreventer");
  }
  static ID = "workbench.contrib.linuxSelectionClipboardPastePreventer";
  constructor(configurationService) {
    super();
    this._register(Event.runAndSubscribe(onDidRegisterWindow, ({ window, disposables }) => {
      disposables.add(addDisposableListener(window.document, "mouseup", (e) => {
        if (e.button === 1) {
          const config = configurationService.getValue("editor");
          if (!config.selectionClipboard) {
            e.preventDefault();
          }
        }
      }));
    }, { window: mainWindow, disposables: this._store }));
  }
};
LinuxSelectionClipboardPastePreventer = __decorateClass([
  __decorateParam(0, IConfigurationService)
], LinuxSelectionClipboardPastePreventer);
class PasteSelectionClipboardAction extends EditorAction {
  static {
    __name(this, "PasteSelectionClipboardAction");
  }
  constructor() {
    super({
      id: "editor.action.selectionClipboardPaste",
      label: nls.localize2("actions.pasteSelectionClipboard", "Paste Selection Clipboard"),
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor, args) {
    const clipboardService = accessor.get(IClipboardService);
    const text = await clipboardService.readText("selection");
    editor.trigger("keyboard", Handler.Paste, {
      text,
      pasteOnNewLine: false,
      multicursorText: null
    });
  }
}
registerEditorContribution(SelectionClipboardContributionID, SelectionClipboard, EditorContributionInstantiation.Eager);
if (platform.isLinux) {
  registerWorkbenchContribution2(LinuxSelectionClipboardPastePreventer.ID, LinuxSelectionClipboardPastePreventer, WorkbenchPhase.BlockRestore);
  registerEditorAction(PasteSelectionClipboardAction);
}
export {
  SelectionClipboard
};
//# sourceMappingURL=selectionClipboard.js.map
