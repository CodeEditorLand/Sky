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
import { URI } from "../../../../../base/common/uri.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ITerminalLinkDetector, ITerminalLinkResolver, ITerminalSimpleLink, TerminalBuiltinLinkType } from "./links.js";
import { convertLinkRangeToBuffer, getXtermLineContent } from "./terminalLinkHelpers.js";
import { ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import { ITerminalBackend, ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MaxLineLength"] = 2e3] = "MaxLineLength";
  Constants2[Constants2["MaxResolvedLinkLength"] = 1024] = "MaxResolvedLinkLength";
  return Constants2;
})(Constants || {});
const lineNumberPrefixMatchers = [
  // Ripgrep:
  //   /some/file
  //   16:searchresult
  //   16:    searchresult
  // Eslint:
  //   /some/file
  //     16:5  error ...
  /^ *(?<link>(?<line>\d+):(?<col>\d+)?)/
];
const gitDiffMatchers = [
  // --- a/some/file
  // +++ b/some/file
  // @@ -8,11 +8,11 @@ file content...
  /^(?<link>@@ .+ \+(?<toFileLine>\d+),(?<toFileCount>\d+) @@)/
];
let TerminalMultiLineLinkDetector = class {
  constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._processManager = _processManager;
    this._linkResolver = _linkResolver;
    this._logService = _logService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
  }
  static {
    __name(this, "TerminalMultiLineLinkDetector");
  }
  static id = "multiline";
  // This was chosen as a reasonable maximum line length given the tradeoff between performance
  // and how likely it is to encounter such a large line length. Some useful reference points:
  // - Window old max length: 260 ($MAX_PATH)
  // - Linux max length: 4096 ($PATH_MAX)
  maxLinkLength = 500;
  async detect(lines, startLine, endLine) {
    const links = [];
    const text = getXtermLineContent(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text === "" || text.length > 2e3 /* MaxLineLength */) {
      return [];
    }
    this._logService.trace("terminalMultiLineLinkDetector#detect text", text);
    for (const matcher of lineNumberPrefixMatchers) {
      const match = text.match(matcher);
      const group = match?.groups;
      if (!group) {
        continue;
      }
      const link = group?.link;
      const line = group?.line;
      const col = group?.col;
      if (!link || line === void 0) {
        continue;
      }
      if (link.length > 1024 /* MaxResolvedLinkLength */) {
        continue;
      }
      this._logService.trace("terminalMultiLineLinkDetector#detect candidate", link);
      let possiblePath;
      for (let index = startLine - 1; index >= 0; index--) {
        if (this.xterm.buffer.active.getLine(index).isWrapped) {
          continue;
        }
        const text2 = getXtermLineContent(this.xterm.buffer.active, index, index, this.xterm.cols);
        if (!text2.match(/^\s*\d/)) {
          possiblePath = text2;
          break;
        }
      }
      if (!possiblePath) {
        continue;
      }
      const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
      if (linkStat) {
        let type;
        if (linkStat.isDirectory) {
          if (this._isDirectoryInsideWorkspace(linkStat.uri)) {
            type = TerminalBuiltinLinkType.LocalFolderInWorkspace;
          } else {
            type = TerminalBuiltinLinkType.LocalFolderOutsideWorkspace;
          }
        } else {
          type = TerminalBuiltinLinkType.LocalFile;
        }
        const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
          startColumn: 1,
          startLineNumber: 1,
          endColumn: 1 + text.length,
          endLineNumber: 1
        }, startLine);
        const simpleLink = {
          text: link,
          uri: linkStat.uri,
          selection: {
            startLineNumber: parseInt(line),
            startColumn: col ? parseInt(col) : 1
          },
          disableTrimColon: true,
          bufferRange,
          type
        };
        this._logService.trace("terminalMultiLineLinkDetector#detect verified link", simpleLink);
        links.push(simpleLink);
        break;
      }
    }
    if (links.length === 0) {
      for (const matcher of gitDiffMatchers) {
        const match = text.match(matcher);
        const group = match?.groups;
        if (!group) {
          continue;
        }
        const link = group?.link;
        const toFileLine = group?.toFileLine;
        const toFileCount = group?.toFileCount;
        if (!link || toFileLine === void 0) {
          continue;
        }
        if (link.length > 1024 /* MaxResolvedLinkLength */) {
          continue;
        }
        this._logService.trace("terminalMultiLineLinkDetector#detect candidate", link);
        let possiblePath;
        for (let index = startLine - 1; index >= 0; index--) {
          if (this.xterm.buffer.active.getLine(index).isWrapped) {
            continue;
          }
          const text2 = getXtermLineContent(this.xterm.buffer.active, index, index, this.xterm.cols);
          const match2 = text2.match(/\+\+\+ b\/(?<path>.+)/);
          if (match2) {
            possiblePath = match2.groups?.path;
            break;
          }
        }
        if (!possiblePath) {
          continue;
        }
        const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
        if (linkStat) {
          let type;
          if (linkStat.isDirectory) {
            if (this._isDirectoryInsideWorkspace(linkStat.uri)) {
              type = TerminalBuiltinLinkType.LocalFolderInWorkspace;
            } else {
              type = TerminalBuiltinLinkType.LocalFolderOutsideWorkspace;
            }
          } else {
            type = TerminalBuiltinLinkType.LocalFile;
          }
          const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
            startColumn: 1,
            startLineNumber: 1,
            endColumn: 1 + link.length,
            endLineNumber: 1
          }, startLine);
          const simpleLink = {
            text: link,
            uri: linkStat.uri,
            selection: {
              startLineNumber: parseInt(toFileLine),
              startColumn: 1,
              endLineNumber: parseInt(toFileLine) + parseInt(toFileCount)
            },
            bufferRange,
            type
          };
          this._logService.trace("terminalMultiLineLinkDetector#detect verified link", simpleLink);
          links.push(simpleLink);
          break;
        }
      }
    }
    return links;
  }
  _isDirectoryInsideWorkspace(uri) {
    const folders = this._workspaceContextService.getWorkspace().folders;
    for (let i = 0; i < folders.length; i++) {
      if (this._uriIdentityService.extUri.isEqualOrParent(uri, folders[i].uri)) {
        return true;
      }
    }
    return false;
  }
};
TerminalMultiLineLinkDetector = __decorateClass([
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IWorkspaceContextService)
], TerminalMultiLineLinkDetector);
export {
  TerminalMultiLineLinkDetector
};
//# sourceMappingURL=terminalMultiLineLinkDetector.js.map
