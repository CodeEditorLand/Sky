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
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { convertLinkRangeToBuffer, getXtermLineContent } from "./terminalLinkHelpers.js";
import { getTerminalLinkType } from "./terminalLocalLinkDetector.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
var Constants;
(function(Constants2) {
  Constants2[Constants2["MaxLineLength"] = 2e3] = "MaxLineLength";
  Constants2[Constants2["MaxResolvedLinkLength"] = 1024] = "MaxResolvedLinkLength";
})(Constants || (Constants = {}));
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
let TerminalMultiLineLinkDetector = class TerminalMultiLineLinkDetector2 {
  static {
    __name(this, "TerminalMultiLineLinkDetector");
  }
  static {
    this.id = "multiline";
  }
  constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._processManager = _processManager;
    this._linkResolver = _linkResolver;
    this._logService = _logService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    this.maxLinkLength = 500;
  }
  async detect(lines, startLine, endLine) {
    const links = [];
    const text = getXtermLineContent(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text === "" || text.length > 2e3) {
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
      if (link.length > 1024) {
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
        const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
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
        if (link.length > 1024) {
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
          const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
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
};
TerminalMultiLineLinkDetector = __decorate([
  __param(3, ITerminalLogService),
  __param(4, IUriIdentityService),
  __param(5, IWorkspaceContextService)
], TerminalMultiLineLinkDetector);
export {
  TerminalMultiLineLinkDetector
};
//# sourceMappingURL=terminalMultiLineLinkDetector.js.map
