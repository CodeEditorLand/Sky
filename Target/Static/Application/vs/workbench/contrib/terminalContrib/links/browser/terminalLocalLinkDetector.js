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
import { OS } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { convertLinkRangeToBuffer, getXtermLineContent, getXtermRangesByAttr, osPathModule, updateLinkWithRelativeCwd } from "./terminalLinkHelpers.js";
import { detectLinks } from "./terminalLinkParsing.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
var Constants;
(function(Constants2) {
  Constants2[Constants2["MaxLineLength"] = 2e3] = "MaxLineLength";
  Constants2[Constants2["MaxResolvedLinksInLine"] = 10] = "MaxResolvedLinksInLine";
  Constants2[Constants2["MaxResolvedLinkLength"] = 1024] = "MaxResolvedLinkLength";
})(Constants || (Constants = {}));
const fallbackMatchers = [
  // Python style error: File "<path>", line <line>
  /^ *File (?<link>"(?<path>.+)"(, line (?<line>\d+))?)/,
  // Unknown tool #200166: FILE  <path>:<line>:<col>
  /^ +FILE +(?<link>(?<path>.+)(?::(?<line>\d+)(?::(?<col>\d+))?)?)/,
  // Some C++ compile error formats:
  // C:\foo\bar baz(339) : error ...
  // C:\foo\bar baz(339,12) : error ...
  // C:\foo\bar baz(339, 12) : error ...
  // C:\foo\bar baz(339): error ...       [#178584, Visual Studio CL/NVIDIA CUDA compiler]
  // C:\foo\bar baz(339,12): ...
  // C:\foo\bar baz(339, 12): ...
  /^(?<link>(?<path>.+)\((?<line>\d+)(?:, ?(?<col>\d+))?\)) ?:/,
  // C:\foo/bar baz:339 : error ...
  // C:\foo/bar baz:339:12 : error ...
  // C:\foo/bar baz:339: error ...
  // C:\foo/bar baz:339:12: error ...     [#178584, Clang]
  /^(?<link>(?<path>.+):(?<line>\d+)(?::(?<col>\d+))?) ?:/,
  // PowerShell and cmd prompt
  /^(?:PS\s+)?(?<link>(?<path>[^>]+))>/,
  // The whole line is the path
  /^ *(?<link>(?<path>.+))/
];
let TerminalLocalLinkDetector = class TerminalLocalLinkDetector2 {
  static {
    __name(this, "TerminalLocalLinkDetector");
  }
  static {
    this.id = "local";
  }
  constructor(xterm, _capabilities, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._capabilities = _capabilities;
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
    let stringIndex = -1;
    let resolvedLinkCount = 0;
    const os = this._processManager.os || OS;
    const parsedLinks = detectLinks(text, os);
    this._logService.trace("terminalLocalLinkDetector#detect text", text);
    this._logService.trace("terminalLocalLinkDetector#detect parsedLinks", parsedLinks);
    for (const parsedLink of parsedLinks) {
      if (parsedLink.path.text.length > 1024) {
        continue;
      }
      const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
        startColumn: (parsedLink.prefix?.index ?? parsedLink.path.index) + 1,
        startLineNumber: 1,
        endColumn: parsedLink.path.index + parsedLink.path.text.length + (parsedLink.suffix?.suffix.text.length ?? 0) + 1,
        endLineNumber: 1
      }, startLine);
      const linkCandidates = [];
      const osPath = osPathModule(os);
      const isUri = parsedLink.path.text.startsWith("file://");
      if (osPath.isAbsolute(parsedLink.path.text) || parsedLink.path.text.startsWith("~") || isUri) {
        linkCandidates.push(parsedLink.path.text);
      } else {
        if (this._capabilities.has(
          2
          /* TerminalCapability.CommandDetection */
        )) {
          const absolutePath = updateLinkWithRelativeCwd(this._capabilities, bufferRange.start.y, parsedLink.path.text, osPath, this._logService);
          if (absolutePath) {
            linkCandidates.push(...absolutePath);
          }
        }
        if (linkCandidates.length === 0) {
          linkCandidates.push(parsedLink.path.text);
          if (parsedLink.path.text.match(/^(\.\.[\/\\])+/)) {
            linkCandidates.push(parsedLink.path.text.replace(/^(\.\.[\/\\])+/, ""));
          }
        }
      }
      const specialEndCharRegex = /[\[\]"'\.]$/;
      const trimRangeMap = /* @__PURE__ */ new Map();
      const specialEndLinkCandidates = [];
      for (const candidate of linkCandidates) {
        let previous = candidate;
        let removed = previous.replace(specialEndCharRegex, "");
        let trimRange = 0;
        while (removed !== previous) {
          if (!parsedLink.suffix) {
            trimRange++;
          }
          specialEndLinkCandidates.push(removed);
          trimRangeMap.set(removed, trimRange);
          previous = removed;
          removed = removed.replace(specialEndCharRegex, "");
        }
      }
      linkCandidates.push(...specialEndLinkCandidates);
      this._logService.trace("terminalLocalLinkDetector#detect linkCandidates", linkCandidates);
      const simpleLink = await this._validateAndGetLink(void 0, bufferRange, linkCandidates, trimRangeMap);
      if (simpleLink) {
        simpleLink.parsedLink = parsedLink;
        simpleLink.text = text.substring(parsedLink.prefix?.index ?? parsedLink.path.index, parsedLink.suffix ? parsedLink.suffix.suffix.index + parsedLink.suffix.suffix.text.length : parsedLink.path.index + parsedLink.path.text.length);
        this._logService.trace("terminalLocalLinkDetector#detect verified link", simpleLink);
        links.push(simpleLink);
      }
      if (++resolvedLinkCount >= 10) {
        break;
      }
    }
    if (links.length === 0) {
      for (const matcher of fallbackMatchers) {
        const match = text.match(matcher);
        const group = match?.groups;
        if (!group) {
          continue;
        }
        const link = group?.link;
        const path = group?.path;
        const line = group?.line;
        const col = group?.col;
        if (!link || !path) {
          continue;
        }
        if (link.length > 1024) {
          continue;
        }
        stringIndex = text.indexOf(link);
        const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
          startColumn: stringIndex + 1,
          startLineNumber: 1,
          endColumn: stringIndex + link.length + 1,
          endLineNumber: 1
        }, startLine);
        const suffix = line ? `:${line}${col ? `:${col}` : ""}` : "";
        const simpleLink = await this._validateAndGetLink(`${path}${suffix}`, bufferRange, [path]);
        if (simpleLink) {
          links.push(simpleLink);
        }
      }
    }
    if (links.length === 0) {
      const rangeCandidates = getXtermRangesByAttr(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
      for (const rangeCandidate of rangeCandidates) {
        let text2 = "";
        for (let y = rangeCandidate.start.y; y <= rangeCandidate.end.y; y++) {
          const line = this.xterm.buffer.active.getLine(y);
          if (!line) {
            break;
          }
          const lineStartX = y === rangeCandidate.start.y ? rangeCandidate.start.x : 0;
          const lineEndX = y === rangeCandidate.end.y ? rangeCandidate.end.x : this.xterm.cols - 1;
          text2 += line.translateToString(false, lineStartX, lineEndX);
        }
        rangeCandidate.start.x++;
        rangeCandidate.start.y++;
        rangeCandidate.end.y++;
        const simpleLink = await this._validateAndGetLink(text2, rangeCandidate, [text2]);
        if (simpleLink) {
          links.push(simpleLink);
        }
        if (++resolvedLinkCount >= 10) {
          break;
        }
      }
    }
    return links;
  }
  async _validateLinkCandidates(linkCandidates) {
    for (const link of linkCandidates) {
      let uri;
      if (link.startsWith("file://")) {
        uri = URI.parse(link);
      }
      const result = await this._linkResolver.resolveLink(this._processManager, link, uri);
      if (result) {
        return result;
      }
    }
    return void 0;
  }
  /**
   * Validates a set of link candidates and returns a link if validated.
   * @param linkText The link text, this should be undefined to use the link stat value
   * @param trimRangeMap A map of link candidates to the amount of buffer range they need trimmed.
   */
  async _validateAndGetLink(linkText, bufferRange, linkCandidates, trimRangeMap) {
    const linkStat = await this._validateLinkCandidates(linkCandidates);
    if (linkStat) {
      const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
      const trimRange = trimRangeMap?.get(linkStat.link);
      if (trimRange) {
        bufferRange.end.x -= trimRange;
        if (bufferRange.end.x < 0) {
          bufferRange.end.y--;
          bufferRange.end.x += this.xterm.cols;
        }
      }
      return {
        text: linkText ?? linkStat.link,
        uri: linkStat.uri,
        bufferRange,
        type
      };
    }
    return void 0;
  }
};
TerminalLocalLinkDetector = __decorate([
  __param(4, ITerminalLogService),
  __param(5, IUriIdentityService),
  __param(6, IWorkspaceContextService)
], TerminalLocalLinkDetector);
function getTerminalLinkType(uri, isDirectory, uriIdentityService, workspaceContextService) {
  if (isDirectory) {
    const folders = workspaceContextService.getWorkspace().folders;
    for (let i = 0; i < folders.length; i++) {
      if (uriIdentityService.extUri.isEqualOrParent(uri, folders[i].uri)) {
        return "LocalFolderInWorkspace";
      }
    }
    return "LocalFolderOutsideWorkspace";
  } else {
    return "LocalFile";
  }
}
__name(getTerminalLinkType, "getTerminalLinkType");
export {
  TerminalLocalLinkDetector,
  getTerminalLinkType
};
//# sourceMappingURL=terminalLocalLinkDetector.js.map
