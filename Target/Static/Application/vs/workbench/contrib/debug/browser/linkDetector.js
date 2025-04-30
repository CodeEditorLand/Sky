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
import { getWindow, isHTMLElement, reset } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Schemas } from "../../../../base/common/network.js";
import * as osPath from "../../../../base/common/path.js";
import * as platform from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { Iterable } from "../../../../base/common/iterator.js";
const CONTROL_CODES = "\\u0000-\\u0020\\u007f-\\u009f";
const WEB_LINK_REGEX = new RegExp("(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s" + CONTROL_CODES + '"]{2,}[^\\s' + CONTROL_CODES + `"')}\\],:;.!?]`, "ug");
const WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_RELATIVE_PATH = /(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_PATH = new RegExp(`(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`);
const POSIX_PATH = /((?:\~|\.)?(?:\/[\w\.-]*)+)/;
const LINE_COLUMN = /(?:\:([\d]+))?(?:\:([\d]+))?/;
const PATH_LINK_REGEX = new RegExp(`${platform.isWindows ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`, "g");
const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
const MAX_LENGTH = 2e3;
var DebugLinkHoverBehavior;
(function(DebugLinkHoverBehavior2) {
  DebugLinkHoverBehavior2[DebugLinkHoverBehavior2["Rich"] = 0] = "Rich";
  DebugLinkHoverBehavior2[DebugLinkHoverBehavior2["Basic"] = 1] = "Basic";
  DebugLinkHoverBehavior2[DebugLinkHoverBehavior2["None"] = 2] = "None";
})(DebugLinkHoverBehavior || (DebugLinkHoverBehavior = {}));
let LinkDetector = class LinkDetector2 {
  static {
    __name(this, "LinkDetector");
  }
  constructor(editorService, fileService, openerService, pathService, tunnelService, environmentService, configurationService, hoverService) {
    this.editorService = editorService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.pathService = pathService;
    this.tunnelService = tunnelService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
  }
  /**
   * Matches and handles web urls, absolute and relative file links in the string provided.
   * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
   * 'onclick' event is attached to all anchored links that opens them in the editor.
   * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
   * and added as a child of the returned <span>.
   * If a `hoverBehavior` is passed, hovers may be added using the workbench hover service.
   * This should be preferred for new code where hovers are desirable.
   */
  linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, highlights) {
    return this._linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, highlights);
  }
  _linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, highlights, defaultRef) {
    if (splitLines) {
      const lines = text.split("\n");
      for (let i = 0; i < lines.length - 1; i++) {
        lines[i] = lines[i] + "\n";
      }
      if (!lines[lines.length - 1]) {
        lines.pop();
      }
      const elements = lines.map((line) => this._linkify(line, false, workspaceFolder, includeFulltext, hoverBehavior, highlights, defaultRef));
      if (elements.length === 1) {
        return elements[0];
      }
      const container2 = document.createElement("span");
      elements.forEach((e) => container2.appendChild(e));
      return container2;
    }
    const container = document.createElement("span");
    for (const part of this.detectLinks(text)) {
      try {
        let node;
        switch (part.kind) {
          case "text":
            node = defaultRef ? this.linkifyLocation(part.value, defaultRef.locationReference, defaultRef.session, hoverBehavior) : document.createTextNode(part.value);
            break;
          case "web":
            node = this.createWebLink(includeFulltext ? text : void 0, part.value, hoverBehavior);
            break;
          case "path": {
            const path = part.captures[0];
            const lineNumber = part.captures[1] ? Number(part.captures[1]) : 0;
            const columnNumber = part.captures[2] ? Number(part.captures[2]) : 0;
            node = this.createPathLink(includeFulltext ? text : void 0, part.value, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior);
            break;
          }
          default:
            node = document.createTextNode(part.value);
        }
        container.append(...this.applyHighlights(node, part.index, part.value.length, highlights));
      } catch (e) {
        container.appendChild(document.createTextNode(part.value));
      }
    }
    return container;
  }
  applyHighlights(node, startIndex, length, highlights) {
    const children = [];
    let currentIndex = startIndex;
    const endIndex = startIndex + length;
    for (const highlight of highlights || []) {
      if (highlight.end <= currentIndex || highlight.start >= endIndex) {
        continue;
      }
      if (highlight.start > currentIndex) {
        children.push(node.textContent.substring(currentIndex - startIndex, highlight.start - startIndex));
        currentIndex = highlight.start;
      }
      const highlightEnd = Math.min(highlight.end, endIndex);
      const highlightedText = node.textContent.substring(currentIndex - startIndex, highlightEnd - startIndex);
      const highlightSpan = document.createElement("span");
      highlightSpan.classList.add("highlight");
      if (highlight.extraClasses) {
        highlightSpan.classList.add(...highlight.extraClasses);
      }
      highlightSpan.textContent = highlightedText;
      children.push(highlightSpan);
      currentIndex = highlightEnd;
    }
    if (currentIndex === startIndex) {
      return Iterable.single(node);
    }
    if (currentIndex < endIndex) {
      children.push(node.textContent.substring(currentIndex - startIndex));
    }
    if (isHTMLElement(node)) {
      reset(node, ...children);
      return Iterable.single(node);
    }
    return children;
  }
  /**
   * Linkifies a location reference.
   */
  linkifyLocation(text, locationReference, session, hoverBehavior) {
    const link = this.createLink(text);
    this.decorateLink(link, void 0, text, hoverBehavior, async (preserveFocus) => {
      const location = await session.resolveLocationReference(locationReference);
      await location.source.openInEditor(this.editorService, {
        startLineNumber: location.line,
        startColumn: location.column,
        endLineNumber: location.endLine ?? location.line,
        endColumn: location.endColumn ?? location.column
      }, preserveFocus);
    });
    return link;
  }
  /**
   * Makes an {@link ILinkDetector} that links everything in the output to the
   * reference if they don't have other explicit links.
   */
  makeReferencedLinkDetector(locationReference, session) {
    return {
      linkify: /* @__PURE__ */ __name((text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, highlights) => this._linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, highlights, { locationReference, session }), "linkify"),
      linkifyLocation: this.linkifyLocation.bind(this)
    };
  }
  createWebLink(fulltext, url, hoverBehavior) {
    const link = this.createLink(url);
    let uri = URI.parse(url);
    const lineCol = LINE_COLUMN_REGEX.exec(uri.path);
    if (lineCol) {
      uri = uri.with({
        path: uri.path.slice(0, lineCol.index),
        fragment: `L${lineCol[0].slice(1)}`
      });
    }
    this.decorateLink(link, uri, fulltext, hoverBehavior, async () => {
      if (uri.scheme === Schemas.file) {
        const fsPath = uri.fsPath;
        const path = await this.pathService.path;
        const fileUrl = osPath.normalize(path.sep === osPath.posix.sep && platform.isWindows ? fsPath.replace(/\\/g, osPath.posix.sep) : fsPath);
        const fileUri = URI.parse(fileUrl);
        const exists = await this.fileService.exists(fileUri);
        if (!exists) {
          return;
        }
        await this.editorService.openEditor({
          resource: fileUri,
          options: {
            pinned: true,
            selection: lineCol ? { startLineNumber: +lineCol[1], startColumn: +lineCol[2] } : void 0
          }
        });
        return;
      }
      this.openerService.open(url, { allowTunneling: !!this.environmentService.remoteAuthority && this.configurationService.getValue("remote.forwardOnOpen") });
    });
    return link;
  }
  createPathLink(fulltext, text, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior) {
    if (path[0] === "/" && path[1] === "/") {
      return document.createTextNode(text);
    }
    const options = { selection: { startLineNumber: lineNumber, startColumn: columnNumber } };
    if (path[0] === ".") {
      if (!workspaceFolder) {
        return document.createTextNode(text);
      }
      const uri2 = workspaceFolder.toResource(path);
      const link2 = this.createLink(text);
      this.decorateLink(link2, uri2, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri2, options: { ...options, preserveFocus } }));
      return link2;
    }
    if (path[0] === "~") {
      const userHome = this.pathService.resolvedUserHome;
      if (userHome) {
        path = osPath.join(userHome.fsPath, path.substring(1));
      }
    }
    const link = this.createLink(text);
    link.tabIndex = 0;
    const uri = URI.file(osPath.normalize(path));
    this.fileService.stat(uri).then((stat) => {
      if (stat.isDirectory) {
        return;
      }
      this.decorateLink(link, uri, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
    }).catch(() => {
    });
    return link;
  }
  createLink(text) {
    const link = document.createElement("a");
    link.textContent = text;
    return link;
  }
  decorateLink(link, uri, fulltext, hoverBehavior, onClick) {
    link.classList.add("link");
    const followLink = uri && this.tunnelService.canTunnel(uri) ? localize("followForwardedLink", "follow link using forwarded port") : localize("followLink", "follow link");
    const title = link.ariaLabel = fulltext ? platform.isMacintosh ? localize("fileLinkWithPathMac", "Cmd + click to {0}\n{1}", followLink, fulltext) : localize("fileLinkWithPath", "Ctrl + click to {0}\n{1}", followLink, fulltext) : platform.isMacintosh ? localize("fileLinkMac", "Cmd + click to {0}", followLink) : localize("fileLink", "Ctrl + click to {0}", followLink);
    if (hoverBehavior?.type === 0) {
      hoverBehavior.store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link, title));
    } else if (hoverBehavior?.type !== 2) {
      link.title = title;
    }
    link.onmousemove = (event) => {
      link.classList.toggle("pointer", platform.isMacintosh ? event.metaKey : event.ctrlKey);
    };
    link.onmouseleave = () => link.classList.remove("pointer");
    link.onclick = (event) => {
      const selection = getWindow(link).getSelection();
      if (!selection || selection.type === "Range") {
        return;
      }
      if (!(platform.isMacintosh ? event.metaKey : event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      onClick(false);
    };
    link.onkeydown = (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 3 || event.keyCode === 10) {
        event.preventDefault();
        event.stopPropagation();
        onClick(
          event.keyCode === 10
          /* KeyCode.Space */
        );
      }
    };
  }
  detectLinks(text) {
    if (text.length > MAX_LENGTH) {
      return [{ kind: "text", value: text, captures: [], index: 0 }];
    }
    const regexes = [WEB_LINK_REGEX, PATH_LINK_REGEX];
    const kinds = ["web", "path"];
    const result = [];
    const splitOne = /* @__PURE__ */ __name((text2, regexIndex, baseIndex) => {
      if (regexIndex >= regexes.length) {
        result.push({ value: text2, kind: "text", captures: [], index: baseIndex });
        return;
      }
      const regex = regexes[regexIndex];
      let currentIndex = 0;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(text2)) !== null) {
        const stringBeforeMatch = text2.substring(currentIndex, match.index);
        if (stringBeforeMatch) {
          splitOne(stringBeforeMatch, regexIndex + 1, baseIndex + currentIndex);
        }
        const value = match[0];
        result.push({
          value,
          kind: kinds[regexIndex],
          captures: match.slice(1),
          index: baseIndex + match.index
        });
        currentIndex = match.index + value.length;
      }
      const stringAfterMatches = text2.substring(currentIndex);
      if (stringAfterMatches) {
        splitOne(stringAfterMatches, regexIndex + 1, baseIndex + currentIndex);
      }
    }, "splitOne");
    splitOne(text, 0, 0);
    return result;
  }
};
LinkDetector = __decorate([
  __param(0, IEditorService),
  __param(1, IFileService),
  __param(2, IOpenerService),
  __param(3, IPathService),
  __param(4, ITunnelService),
  __param(5, IWorkbenchEnvironmentService),
  __param(6, IConfigurationService),
  __param(7, IHoverService)
], LinkDetector);
export {
  DebugLinkHoverBehavior,
  LinkDetector
};
//# sourceMappingURL=linkDetector.js.map
