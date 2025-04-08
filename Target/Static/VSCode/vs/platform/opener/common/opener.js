var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IEditorOptions, ITextEditorSelection } from "../../editor/common/editor.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IOpenerService = createDecorator("openerService");
function withSelection(uri, selection) {
  return uri.with({ fragment: `${selection.startLineNumber},${selection.startColumn}${selection.endLineNumber ? `-${selection.endLineNumber}${selection.endColumn ? `,${selection.endColumn}` : ""}` : ""}` });
}
__name(withSelection, "withSelection");
function extractSelection(uri) {
  let selection = void 0;
  const match = /^L?(\d+)(?:,(\d+))?(-L?(\d+)(?:,(\d+))?)?/.exec(uri.fragment);
  if (match) {
    selection = {
      startLineNumber: parseInt(match[1]),
      startColumn: match[2] ? parseInt(match[2]) : 1,
      endLineNumber: match[4] ? parseInt(match[4]) : void 0,
      endColumn: match[4] ? match[5] ? parseInt(match[5]) : 1 : void 0
    };
    uri = uri.with({ fragment: "" });
  }
  return { selection, uri };
}
__name(extractSelection, "extractSelection");
export {
  IOpenerService,
  extractSelection,
  withSelection
};
//# sourceMappingURL=opener.js.map
