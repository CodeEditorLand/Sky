var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isWindows } from "../../../../base/common/platform.js";
import { Mimes } from "../../../../base/common/mime.js";
import { LogLevel } from "../../../../platform/log/common/log.js";
import { generateUuid } from "../../../../base/common/uuid.js";
function ensureClipboardGetsEditorSelection(e, context, logService, isFirefox) {
  const viewModel = context.viewModel;
  const options = context.configuration.options;
  let id = void 0;
  if (logService.getLevel() === LogLevel.Trace) {
    id = generateUuid();
  }
  const { dataToCopy, storedMetadata } = generateDataToCopyAndStoreInMemory(viewModel, options, id, isFirefox);
  CopyOptions.electronBugWorkaroundCopyEventHasFired = true;
  e.preventDefault();
  if (e.clipboardData) {
    ClipboardEventUtils.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, storedMetadata);
  }
  logService.trace("ensureClipboardGetsEditorSelection with id : ", id, " with text.length: ", dataToCopy.text.length);
}
__name(ensureClipboardGetsEditorSelection, "ensureClipboardGetsEditorSelection");
function generateDataToCopyAndStoreInMemory(viewModel, options, id, isFirefox) {
  const emptySelectionClipboard = options.get(
    45
    /* EditorOption.emptySelectionClipboard */
  );
  const copyWithSyntaxHighlighting = options.get(
    31
    /* EditorOption.copyWithSyntaxHighlighting */
  );
  const selections = viewModel.getCursorStates().map((cursorState) => cursorState.modelState.selection);
  const dataToCopy = getDataToCopy(viewModel, selections, emptySelectionClipboard, copyWithSyntaxHighlighting);
  const storedMetadata = {
    version: 1,
    id,
    isFromEmptySelection: dataToCopy.isFromEmptySelection,
    multicursorText: dataToCopy.multicursorText,
    mode: dataToCopy.mode
  };
  InMemoryClipboardMetadataManager.INSTANCE.set(
    // When writing "LINE\r\n" to the clipboard and then pasting,
    // Firefox pastes "LINE\n", so let's work around this quirk
    isFirefox ? dataToCopy.text.replace(/\r\n/g, "\n") : dataToCopy.text,
    storedMetadata
  );
  return { dataToCopy, storedMetadata };
}
__name(generateDataToCopyAndStoreInMemory, "generateDataToCopyAndStoreInMemory");
function getDataToCopy(viewModel, modelSelections, emptySelectionClipboard, copyWithSyntaxHighlighting) {
  const rawTextToCopy = viewModel.getPlainTextToCopy(modelSelections, emptySelectionClipboard, isWindows);
  const newLineCharacter = viewModel.model.getEOL();
  const isFromEmptySelection = emptySelectionClipboard && modelSelections.length === 1 && modelSelections[0].isEmpty();
  const multicursorText = Array.isArray(rawTextToCopy) ? rawTextToCopy : null;
  const text = Array.isArray(rawTextToCopy) ? rawTextToCopy.join(newLineCharacter) : rawTextToCopy;
  let html = void 0;
  let mode = null;
  if (CopyOptions.forceCopyWithSyntaxHighlighting || copyWithSyntaxHighlighting && text.length < 65536) {
    const richText = viewModel.getRichTextToCopy(modelSelections, emptySelectionClipboard);
    if (richText) {
      html = richText.html;
      mode = richText.mode;
    }
  }
  const dataToCopy = {
    isFromEmptySelection,
    multicursorText,
    text,
    html,
    mode
  };
  return dataToCopy;
}
__name(getDataToCopy, "getDataToCopy");
class InMemoryClipboardMetadataManager {
  static {
    __name(this, "InMemoryClipboardMetadataManager");
  }
  static {
    this.INSTANCE = new InMemoryClipboardMetadataManager();
  }
  constructor() {
    this._lastState = null;
  }
  set(lastCopiedValue, data) {
    this._lastState = { lastCopiedValue, data };
  }
  get(pastedText) {
    if (this._lastState && this._lastState.lastCopiedValue === pastedText) {
      return this._lastState.data;
    }
    this._lastState = null;
    return null;
  }
}
const CopyOptions = {
  forceCopyWithSyntaxHighlighting: false,
  electronBugWorkaroundCopyEventHasFired: false
};
const ClipboardEventUtils = {
  getTextData(clipboardData) {
    const text = clipboardData.getData(Mimes.text);
    let metadata = null;
    const rawmetadata = clipboardData.getData("vscode-editor-data");
    if (typeof rawmetadata === "string") {
      try {
        metadata = JSON.parse(rawmetadata);
        if (metadata.version !== 1) {
          metadata = null;
        }
      } catch (err) {
      }
    }
    if (text.length === 0 && metadata === null && clipboardData.files.length > 0) {
      const files = Array.prototype.slice.call(clipboardData.files, 0);
      return [files.map((file) => file.name).join("\n"), null];
    }
    return [text, metadata];
  },
  setTextData(clipboardData, text, html, metadata) {
    clipboardData.setData(Mimes.text, text);
    if (typeof html === "string") {
      clipboardData.setData("text/html", html);
    }
    clipboardData.setData("vscode-editor-data", JSON.stringify(metadata));
  }
};
export {
  ClipboardEventUtils,
  CopyOptions,
  InMemoryClipboardMetadataManager,
  ensureClipboardGetsEditorSelection,
  generateDataToCopyAndStoreInMemory
};
//# sourceMappingURL=clipboardUtils.js.map
