import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const ITerminalLinkProviderService = createDecorator("terminalLinkProviderService");
var TerminalBuiltinLinkType;
(function(TerminalBuiltinLinkType2) {
  TerminalBuiltinLinkType2["LocalFile"] = "LocalFile";
  TerminalBuiltinLinkType2["LocalFolderOutsideWorkspace"] = "LocalFolderOutsideWorkspace";
  TerminalBuiltinLinkType2["LocalFolderInWorkspace"] = "LocalFolderInWorkspace";
  TerminalBuiltinLinkType2["Search"] = "Search";
  TerminalBuiltinLinkType2["Url"] = "Url";
})(TerminalBuiltinLinkType || (TerminalBuiltinLinkType = {}));
export {
  ITerminalLinkProviderService,
  TerminalBuiltinLinkType
};
//# sourceMappingURL=links.js.map
