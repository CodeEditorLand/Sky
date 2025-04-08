import { URI } from "../../../../../base/common/uri.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import { IParsedLink } from "./terminalLinkParsing.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ITerminalExternalLinkProvider } from "../../../terminal/browser/terminal.js";
import { Event } from "../../../../../base/common/event.js";
import { ITerminalBackend } from "../../../../../platform/terminal/common/terminal.js";
import { ITextEditorSelection } from "../../../../../platform/editor/common/editor.js";
const ITerminalLinkProviderService = createDecorator("terminalLinkProviderService");
var TerminalBuiltinLinkType = /* @__PURE__ */ ((TerminalBuiltinLinkType2) => {
  TerminalBuiltinLinkType2["LocalFile"] = "LocalFile";
  TerminalBuiltinLinkType2["LocalFolderOutsideWorkspace"] = "LocalFolderOutsideWorkspace";
  TerminalBuiltinLinkType2["LocalFolderInWorkspace"] = "LocalFolderInWorkspace";
  TerminalBuiltinLinkType2["Search"] = "Search";
  TerminalBuiltinLinkType2["Url"] = "Url";
  return TerminalBuiltinLinkType2;
})(TerminalBuiltinLinkType || {});
export {
  ITerminalLinkProviderService,
  TerminalBuiltinLinkType
};
//# sourceMappingURL=links.js.map
