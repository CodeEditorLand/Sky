var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { LinkComputer } from "../../../../../editor/common/languages/linkComputer.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { convertLinkRangeToBuffer, getXtermLineContent } from "./terminalLinkHelpers.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
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
var Constants;
(function(Constants2) {
  Constants2[Constants2["MaxResolvedLinksInLine"] = 10] = "MaxResolvedLinksInLine";
})(Constants || (Constants = {}));
let TerminalUriLinkDetector = class TerminalUriLinkDetector2 {
  static {
    __name(this, "TerminalUriLinkDetector");
  }
  static {
    this.id = "uri";
  }
  constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._processManager = _processManager;
    this._linkResolver = _linkResolver;
    this._logService = _logService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    this.maxLinkLength = 2048;
  }
  async detect(lines, startLine, endLine) {
    const links = [];
    const linkComputerTarget = new TerminalLinkAdapter(this.xterm, startLine, endLine);
    const computedLinks = LinkComputer.computeLinks(linkComputerTarget);
    let resolvedLinkCount = 0;
    this._logService.trace("terminalUriLinkDetector#detect computedLinks", computedLinks);
    for (const computedLink of computedLinks) {
      const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, computedLink.range, startLine);
      const uri = computedLink.url ? typeof computedLink.url === "string" ? URI.parse(this._excludeLineAndColSuffix(computedLink.url)) : computedLink.url : void 0;
      if (!uri) {
        continue;
      }
      const text = computedLink.url?.toString() || "";
      if (text.length > this.maxLinkLength) {
        continue;
      }
      if (uri.scheme !== Schemas.file) {
        links.push({
          text,
          uri,
          bufferRange,
          type: "Url"
          /* TerminalBuiltinLinkType.Url */
        });
        continue;
      }
      if (uri.authority.length !== 2 && uri.authority.endsWith(":")) {
        continue;
      }
      const uriCandidates = [uri];
      if (uri.authority.length > 0) {
        uriCandidates.push(URI.from({ ...uri, authority: void 0 }));
      }
      this._logService.trace("terminalUriLinkDetector#detect uriCandidates", uriCandidates);
      for (const uriCandidate of uriCandidates) {
        const linkStat = await this._linkResolver.resolveLink(this._processManager, text, uriCandidate);
        if (linkStat) {
          let type;
          if (linkStat.isDirectory) {
            if (this._isDirectoryInsideWorkspace(uriCandidate)) {
              type = "LocalFolderInWorkspace";
            } else {
              type = "LocalFolderOutsideWorkspace";
            }
          } else {
            type = "LocalFile";
          }
          const simpleLink = {
            // Use computedLink.url if it's a string to retain the line/col suffix
            text: typeof computedLink.url === "string" ? computedLink.url : linkStat.link,
            uri: uriCandidate,
            bufferRange,
            type
          };
          this._logService.trace("terminalUriLinkDetector#detect verified link", simpleLink);
          links.push(simpleLink);
          resolvedLinkCount++;
          break;
        }
      }
      if (++resolvedLinkCount >= 10) {
        break;
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
  _excludeLineAndColSuffix(path) {
    return path.replace(/:\d+(:\d+)?$/, "");
  }
};
TerminalUriLinkDetector = __decorate([
  __param(3, ITerminalLogService),
  __param(4, IUriIdentityService),
  __param(5, IWorkspaceContextService)
], TerminalUriLinkDetector);
class TerminalLinkAdapter {
  static {
    __name(this, "TerminalLinkAdapter");
  }
  constructor(_xterm, _lineStart, _lineEnd) {
    this._xterm = _xterm;
    this._lineStart = _lineStart;
    this._lineEnd = _lineEnd;
  }
  getLineCount() {
    return 1;
  }
  getLineContent() {
    return getXtermLineContent(this._xterm.buffer.active, this._lineStart, this._lineEnd, this._xterm.cols);
  }
}
export {
  TerminalUriLinkDetector
};
//# sourceMappingURL=terminalUriLinkDetector.js.map
