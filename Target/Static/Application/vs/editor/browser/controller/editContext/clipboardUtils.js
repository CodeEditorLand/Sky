var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isWindows } from "../../../../base/common/platform.js";
import { Mimes } from "../../../../base/common/mime.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { toExternalVSDataTransfer } from "../../dataTransfer.js";
function generateDataToCopyAndStoreInMemory(viewModel, id, isFirefox) {
  const { dataToCopy, metadata } = generateDataToCopy(viewModel);
  storeMetadataInMemory(dataToCopy.text, metadata, isFirefox);
  return { dataToCopy, metadata };
}
__name(generateDataToCopyAndStoreInMemory, "generateDataToCopyAndStoreInMemory");
function storeMetadataInMemory(textToCopy, metadata, isFirefox) {
  InMemoryClipboardMetadataManager.INSTANCE.set(
    // When writing "LINE\r\n" to the clipboard and then pasting,
    // Firefox pastes "LINE\n", so let's work around this quirk
    isFirefox ? textToCopy.replace(/\r\n/g, "\n") : textToCopy,
    metadata
  );
}
__name(storeMetadataInMemory, "storeMetadataInMemory");
function generateDataToCopy(viewModel) {
  const emptySelectionClipboard = viewModel.getEditorOption(
    45
    /* EditorOption.emptySelectionClipboard */
  );
  const copyWithSyntaxHighlighting = viewModel.getEditorOption(
    31
    /* EditorOption.copyWithSyntaxHighlighting */
  );
  const selections = viewModel.getCursorStates().map((cursorState) => cursorState.modelState.selection);
  const dataToCopy = getDataToCopy(viewModel, selections, emptySelectionClipboard, copyWithSyntaxHighlighting);
  const metadata = {
    version: 1,
    id: generateUuid(),
    isFromEmptySelection: dataToCopy.isFromEmptySelection,
    multicursorText: dataToCopy.multicursorText,
    mode: dataToCopy.mode
  };
  return { dataToCopy, metadata };
}
__name(generateDataToCopy, "generateDataToCopy");
function getDataToCopy(viewModel, modelSelections, emptySelectionClipboard, copyWithSyntaxHighlighting) {
  const { sourceRanges, sourceText } = viewModel.getPlainTextToCopy(modelSelections, emptySelectionClipboard, isWindows);
  const newLineCharacter = viewModel.model.getEOL();
  const isFromEmptySelection = emptySelectionClipboard && modelSelections.length === 1 && modelSelections[0].isEmpty();
  const multicursorText = Array.isArray(sourceText) ? sourceText : null;
  const text = Array.isArray(sourceText) ? sourceText.join(newLineCharacter) : sourceText;
  let html = void 0;
  let mode = null;
  if (CopyOptions.forceCopyWithSyntaxHighlighting || copyWithSyntaxHighlighting && sourceText.length < 65536) {
    const richText = viewModel.getRichTextToCopy(modelSelections, emptySelectionClipboard);
    if (richText) {
      html = richText.html;
      mode = richText.mode;
    }
  }
  const dataToCopy = {
    isFromEmptySelection,
    sourceRanges,
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
function createClipboardCopyEvent(e, isCut, context, logService, isFirefox) {
  const { dataToCopy, metadata } = generateDataToCopy(context.viewModel);
  let handled = false;
  return {
    isCut,
    clipboardData: {
      setData: /* @__PURE__ */ __name((type, value) => {
        e.clipboardData?.setData(type, value);
      }, "setData")
    },
    dataToCopy,
    ensureClipboardGetsEditorData: /* @__PURE__ */ __name(() => {
      e.preventDefault();
      if (e.clipboardData) {
        ClipboardEventUtils.setTextData(e.clipboardData, dataToCopy.text, dataToCopy.html, metadata);
      }
      storeMetadataInMemory(dataToCopy.text, metadata, isFirefox);
      logService.trace("ensureClipboardGetsEditorSelection with id : ", metadata.id, " with text.length: ", dataToCopy.text.length);
    }, "ensureClipboardGetsEditorData"),
    setHandled: /* @__PURE__ */ __name(() => {
      handled = true;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, "setHandled"),
    get isHandled() {
      return handled;
    }
  };
}
__name(createClipboardCopyEvent, "createClipboardCopyEvent");
function createClipboardPasteEvent(e) {
  let handled = false;
  let [text, metadata] = e.clipboardData ? ClipboardEventUtils.getTextData(e.clipboardData) : ["", null];
  metadata = metadata || InMemoryClipboardMetadataManager.INSTANCE.get(text);
  return {
    clipboardData: createReadableClipboardData(e.clipboardData),
    metadata,
    text,
    toExternalVSDataTransfer: /* @__PURE__ */ __name(() => e.clipboardData ? toExternalVSDataTransfer(e.clipboardData) : void 0, "toExternalVSDataTransfer"),
    browserEvent: e,
    setHandled: /* @__PURE__ */ __name(() => {
      handled = true;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, "setHandled"),
    get isHandled() {
      return handled;
    }
  };
}
__name(createClipboardPasteEvent, "createClipboardPasteEvent");
function createReadableClipboardData(dataTransfer) {
  return {
    types: Array.from(dataTransfer?.types ?? []),
    files: Array.prototype.slice.call(dataTransfer?.files ?? [], 0),
    getData: /* @__PURE__ */ __name((type) => dataTransfer?.getData(type) ?? "", "getData")
  };
}
__name(createReadableClipboardData, "createReadableClipboardData");
function createWritableClipboardData(dataTransfer) {
  return {
    setData: /* @__PURE__ */ __name((type, value) => dataTransfer?.setData(type, value), "setData")
  };
}
__name(createWritableClipboardData, "createWritableClipboardData");
export {
  CopyOptions,
  InMemoryClipboardMetadataManager,
  createClipboardCopyEvent,
  createClipboardPasteEvent,
  createReadableClipboardData,
  createWritableClipboardData,
  generateDataToCopyAndStoreInMemory
};
//# sourceMappingURL=clipboardUtils.js.map
