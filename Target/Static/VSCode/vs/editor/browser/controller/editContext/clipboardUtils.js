var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IViewModel } from "../../../common/viewModel.js";
import { Range } from "../../../common/core/range.js";
import { isWindows } from "../../../../base/common/platform.js";
import { Mimes } from "../../../../base/common/mime.js";
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
  static INSTANCE = new InMemoryClipboardMetadataManager();
  _lastState;
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
  forceCopyWithSyntaxHighlighting: false
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
  getDataToCopy
};
//# sourceMappingURL=clipboardUtils.js.map
