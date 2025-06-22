var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../common/errors.js";
import { Event } from "../common/event.js";
import { escapeDoubleQuotes, isMarkdownString, parseHrefAndDimensions, removeMarkdownEscapes } from "../common/htmlContent.js";
import { markdownEscapeEscapedIcons } from "../common/iconLabels.js";
import { defaultGenerator } from "../common/idGenerator.js";
import { Lazy } from "../common/lazy.js";
import { DisposableStore, toDisposable } from "../common/lifecycle.js";
import * as marked from "../common/marked/marked.js";
import { parse } from "../common/marshalling.js";
import { FileAccess, Schemas } from "../common/network.js";
import { cloneAndChange } from "../common/objects.js";
import { dirname, resolvePath } from "../common/resources.js";
import { escape } from "../common/strings.js";
import { URI } from "../common/uri.js";
import * as DOM from "./dom.js";
import dompurify from "./dompurify/dompurify.js";
import { DomEmitter } from "./event.js";
import { createElement } from "./formattedTextRenderer.js";
import { StandardKeyboardEvent } from "./keyboardEvent.js";
import { StandardMouseEvent } from "./mouseEvent.js";
import { renderLabelWithIcons } from "./ui/iconLabel/iconLabels.js";
const defaultMarkedRenderers = Object.freeze({
  image: /* @__PURE__ */ __name(({ href, title, text }) => {
    let dimensions = [];
    let attributes = [];
    if (href) {
      ({ href, dimensions } = parseHrefAndDimensions(href));
      attributes.push(`src="${escapeDoubleQuotes(href)}"`);
    }
    if (text) {
      attributes.push(`alt="${escapeDoubleQuotes(text)}"`);
    }
    if (title) {
      attributes.push(`title="${escapeDoubleQuotes(title)}"`);
    }
    if (dimensions.length) {
      attributes = attributes.concat(dimensions);
    }
    return "<img " + attributes.join(" ") + ">";
  }, "image"),
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>`;
  },
  link({ href, title, tokens }) {
    let text = this.parser.parseInline(tokens);
    if (typeof href !== "string") {
      return "";
    }
    if (href === text) {
      text = removeMarkdownEscapes(text);
    }
    title = typeof title === "string" ? escapeDoubleQuotes(removeMarkdownEscapes(title)) : "";
    href = removeMarkdownEscapes(href);
    href = href.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return `<a href="${href}" title="${title || href}" draggable="false">${text}</a>`;
  }
});
function renderMarkdown(markdown, options = {}, markedOptions = {}) {
  const disposables = new DisposableStore();
  let isDisposed = false;
  const element = createElement(options);
  const markedInstance = new marked.Marked(...markedOptions.markedExtensions ?? []);
  const { renderer, codeBlocks, syncCodeBlocks } = createMarkdownRenderer(markedInstance, options, markdown);
  const value = preprocessMarkdownString(markdown);
  let renderedMarkdown;
  if (options.fillInIncompleteTokens) {
    const opts = {
      ...marked.defaults,
      ...markedOptions,
      renderer
    };
    const tokens = markedInstance.lexer(value, opts);
    const newTokens = fillInIncompleteTokens(tokens);
    renderedMarkdown = markedInstance.parser(newTokens, opts);
  } else {
    renderedMarkdown = markedInstance.parse(value, { ...markedOptions, renderer, async: false });
  }
  if (markdown.supportThemeIcons) {
    const elements = renderLabelWithIcons(renderedMarkdown);
    renderedMarkdown = elements.map((e) => typeof e === "string" ? e : e.outerHTML).join("");
  }
  const htmlParser = new DOMParser();
  const markdownHtmlDoc = htmlParser.parseFromString(sanitizeRenderedMarkdown({ isTrusted: markdown.isTrusted, ...options.sanitizerOptions }, renderedMarkdown), "text/html");
  rewriteRenderedLinks(markdown, options, markdownHtmlDoc.body);
  element.innerHTML = sanitizeRenderedMarkdown({ isTrusted: markdown.isTrusted, ...options.sanitizerOptions }, markdownHtmlDoc.body.innerHTML);
  if (codeBlocks.length > 0) {
    Promise.all(codeBlocks).then((tuples) => {
      if (isDisposed) {
        return;
      }
      const renderedElements = new Map(tuples);
      const placeholderElements = element.querySelectorAll(`div[data-code]`);
      for (const placeholderElement of placeholderElements) {
        const renderedElement = renderedElements.get(placeholderElement.dataset["code"] ?? "");
        if (renderedElement) {
          DOM.reset(placeholderElement, renderedElement);
        }
      }
      options.asyncRenderCallback?.();
    });
  } else if (syncCodeBlocks.length > 0) {
    const renderedElements = new Map(syncCodeBlocks);
    const placeholderElements = element.querySelectorAll(`div[data-code]`);
    for (const placeholderElement of placeholderElements) {
      const renderedElement = renderedElements.get(placeholderElement.dataset["code"] ?? "");
      if (renderedElement) {
        DOM.reset(placeholderElement, renderedElement);
      }
    }
  }
  if (options.asyncRenderCallback) {
    for (const img of element.getElementsByTagName("img")) {
      const listener = disposables.add(DOM.addDisposableListener(img, "load", () => {
        listener.dispose();
        options.asyncRenderCallback();
      }));
    }
  }
  if (options.actionHandler) {
    const onClick = options.actionHandler.disposables.add(new DomEmitter(element, "click"));
    const onAuxClick = options.actionHandler.disposables.add(new DomEmitter(element, "auxclick"));
    options.actionHandler.disposables.add(Event.any(onClick.event, onAuxClick.event)((e) => {
      const mouseEvent = new StandardMouseEvent(DOM.getWindow(element), e);
      if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
        return;
      }
      activateLink(markdown, options, mouseEvent);
    }));
    options.actionHandler.disposables.add(DOM.addDisposableListener(element, "keydown", (e) => {
      const keyboardEvent = new StandardKeyboardEvent(e);
      if (!keyboardEvent.equals(
        10
        /* KeyCode.Space */
      ) && !keyboardEvent.equals(
        3
        /* KeyCode.Enter */
      )) {
        return;
      }
      activateLink(markdown, options, keyboardEvent);
    }));
  }
  return {
    element,
    dispose: /* @__PURE__ */ __name(() => {
      isDisposed = true;
      disposables.dispose();
    }, "dispose")
  };
}
__name(renderMarkdown, "renderMarkdown");
function rewriteRenderedLinks(markdown, options, root) {
  for (const el of root.querySelectorAll("img, audio, video, source")) {
    const src = el.getAttribute("src");
    if (src) {
      let href = src;
      try {
        if (markdown.baseUri) {
          href = resolveWithBaseUri(URI.from(markdown.baseUri), href);
        }
      } catch (err) {
      }
      el.setAttribute("src", massageHref(markdown, href, true));
      if (options.remoteImageIsAllowed) {
        const uri = URI.parse(href);
        if (uri.scheme !== Schemas.file && uri.scheme !== Schemas.data && !options.remoteImageIsAllowed(uri)) {
          el.replaceWith(DOM.$("", void 0, el.outerHTML));
        }
      }
    }
  }
  for (const el of root.querySelectorAll("a")) {
    const href = el.getAttribute("href");
    el.setAttribute("href", "");
    if (!href || /^data:|javascript:/i.test(href) || /^command:/i.test(href) && !markdown.isTrusted || /^command:(\/\/\/)?_workbench\.downloadResource/i.test(href)) {
      el.replaceWith(...el.childNodes);
    } else {
      let resolvedHref = massageHref(markdown, href, false);
      if (markdown.baseUri) {
        resolvedHref = resolveWithBaseUri(URI.from(markdown.baseUri), href);
      }
      el.dataset.href = resolvedHref;
    }
  }
}
__name(rewriteRenderedLinks, "rewriteRenderedLinks");
function createMarkdownRenderer(marked2, options, markdown) {
  const renderer = new marked2.Renderer();
  renderer.image = defaultMarkedRenderers.image;
  renderer.link = defaultMarkedRenderers.link;
  renderer.paragraph = defaultMarkedRenderers.paragraph;
  const codeBlocks = [];
  const syncCodeBlocks = [];
  if (options.codeBlockRendererSync) {
    renderer.code = ({ text, lang, raw }) => {
      const id = defaultGenerator.nextId();
      const value = options.codeBlockRendererSync(postProcessCodeBlockLanguageId(lang), text, raw);
      syncCodeBlocks.push([id, value]);
      return `<div class="code" data-code="${id}">${escape(text)}</div>`;
    };
  } else if (options.codeBlockRenderer) {
    renderer.code = ({ text, lang }) => {
      const id = defaultGenerator.nextId();
      const value = options.codeBlockRenderer(postProcessCodeBlockLanguageId(lang), text);
      codeBlocks.push(value.then((element) => [id, element]));
      return `<div class="code" data-code="${id}">${escape(text)}</div>`;
    };
  }
  if (!markdown.supportHtml) {
    renderer.html = ({ text }) => {
      if (options.sanitizerOptions?.replaceWithPlaintext) {
        return escape(text);
      }
      const match = markdown.isTrusted ? text.match(/^(<span[^>]+>)|(<\/\s*span>)$/) : void 0;
      return match ? text : "";
    };
  }
  return { renderer, codeBlocks, syncCodeBlocks };
}
__name(createMarkdownRenderer, "createMarkdownRenderer");
function preprocessMarkdownString(markdown) {
  let value = markdown.value;
  if (value.length > 1e5) {
    value = `${value.substr(0, 1e5)}\u2026`;
  }
  if (markdown.supportThemeIcons) {
    value = markdownEscapeEscapedIcons(value);
  }
  return value;
}
__name(preprocessMarkdownString, "preprocessMarkdownString");
function activateLink(markdown, options, event) {
  const target = event.target.closest("a[data-href]");
  if (!DOM.isHTMLElement(target)) {
    return;
  }
  try {
    let href = target.dataset["href"];
    if (href) {
      if (markdown.baseUri) {
        href = resolveWithBaseUri(URI.from(markdown.baseUri), href);
      }
      options.actionHandler.callback(href, event);
    }
  } catch (err) {
    onUnexpectedError(err);
  } finally {
    event.preventDefault();
  }
}
__name(activateLink, "activateLink");
function uriMassage(markdown, part) {
  let data;
  try {
    data = parse(decodeURIComponent(part));
  } catch (e) {
  }
  if (!data) {
    return part;
  }
  data = cloneAndChange(data, (value) => {
    if (markdown.uris && markdown.uris[value]) {
      return URI.revive(markdown.uris[value]);
    } else {
      return void 0;
    }
  });
  return encodeURIComponent(JSON.stringify(data));
}
__name(uriMassage, "uriMassage");
function massageHref(markdown, href, isDomUri) {
  const data = markdown.uris && markdown.uris[href];
  let uri = URI.revive(data);
  if (isDomUri) {
    if (href.startsWith(Schemas.data + ":")) {
      return href;
    }
    if (!uri) {
      uri = URI.parse(href);
    }
    return FileAccess.uriToBrowserUri(uri).toString(true);
  }
  if (!uri) {
    return href;
  }
  if (URI.parse(href).toString() === uri.toString()) {
    return href;
  }
  if (uri.query) {
    uri = uri.with({ query: uriMassage(markdown, uri.query) });
  }
  return uri.toString();
}
__name(massageHref, "massageHref");
function postProcessCodeBlockLanguageId(lang) {
  if (!lang) {
    return "";
  }
  const parts = lang.split(/[\s+|:|,|\{|\?]/, 1);
  if (parts.length) {
    return parts[0];
  }
  return lang;
}
__name(postProcessCodeBlockLanguageId, "postProcessCodeBlockLanguageId");
function resolveWithBaseUri(baseUri, href) {
  const hasScheme = /^\w[\w\d+.-]*:/.test(href);
  if (hasScheme) {
    return href;
  }
  if (baseUri.path.endsWith("/")) {
    return resolvePath(baseUri, href).toString();
  } else {
    return resolvePath(dirname(baseUri), href).toString();
  }
}
__name(resolveWithBaseUri, "resolveWithBaseUri");
const selfClosingTags = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
function sanitizeRenderedMarkdown(options, renderedMarkdown) {
  const { config, allowedSchemes } = getSanitizerOptions(options);
  const store = new DisposableStore();
  store.add(addDompurifyHook("uponSanitizeAttribute", (element, e) => {
    if (e.attrName === "style" || e.attrName === "class") {
      if (element.tagName === "SPAN") {
        if (e.attrName === "style") {
          e.keepAttr = /^(color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z0-9]+)+\));)?(background-color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z0-9]+)+\));)?(border-radius:[0-9]+px;)?$/.test(e.attrValue);
          return;
        } else if (e.attrName === "class") {
          e.keepAttr = /^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/.test(e.attrValue);
          return;
        }
      }
      e.keepAttr = false;
      return;
    } else if (element.tagName === "INPUT" && element.attributes.getNamedItem("type")?.value === "checkbox") {
      if (e.attrName === "type" && e.attrValue === "checkbox" || e.attrName === "disabled" || e.attrName === "checked") {
        e.keepAttr = true;
        return;
      }
      e.keepAttr = false;
    }
  }));
  store.add(addDompurifyHook("uponSanitizeElement", (element, e) => {
    if (e.tagName === "input") {
      if (element.attributes.getNamedItem("type")?.value === "checkbox") {
        element.setAttribute("disabled", "");
      } else if (!options.replaceWithPlaintext) {
        element.remove();
      }
    }
    if (options.replaceWithPlaintext && !e.allowedTags[e.tagName] && e.tagName !== "body") {
      if (element.parentElement) {
        let startTagText;
        let endTagText;
        if (e.tagName === "#comment") {
          startTagText = `<!--${element.textContent}-->`;
        } else {
          const isSelfClosing = selfClosingTags.includes(e.tagName);
          const attrString = element.attributes.length ? " " + Array.from(element.attributes).map((attr) => `${attr.name}="${attr.value}"`).join(" ") : "";
          startTagText = `<${e.tagName}${attrString}>`;
          if (!isSelfClosing) {
            endTagText = `</${e.tagName}>`;
          }
        }
        const fragment = document.createDocumentFragment();
        const textNode = element.parentElement.ownerDocument.createTextNode(startTagText);
        fragment.appendChild(textNode);
        const endTagTextNode = endTagText ? element.parentElement.ownerDocument.createTextNode(endTagText) : void 0;
        while (element.firstChild) {
          fragment.appendChild(element.firstChild);
        }
        if (endTagTextNode) {
          fragment.appendChild(endTagTextNode);
        }
        if (element.nodeType === Node.COMMENT_NODE) {
          element.parentElement.insertBefore(fragment, element);
        } else {
          element.parentElement.replaceChild(fragment, element);
        }
      }
    }
  }));
  store.add(DOM.hookDomPurifyHrefAndSrcSanitizer(allowedSchemes));
  try {
    return dompurify.sanitize(renderedMarkdown, { ...config, RETURN_TRUSTED_TYPE: true });
  } finally {
    store.dispose();
  }
}
__name(sanitizeRenderedMarkdown, "sanitizeRenderedMarkdown");
const allowedMarkdownAttr = [
  "align",
  "autoplay",
  "alt",
  "checked",
  "class",
  "colspan",
  "controls",
  "data-code",
  "data-href",
  "disabled",
  "draggable",
  "height",
  "href",
  "loop",
  "muted",
  "playsinline",
  "poster",
  "rowspan",
  "src",
  "style",
  "target",
  "title",
  "type",
  "width",
  "start"
];
function getSanitizerOptions(options) {
  const allowedSchemes = [
    Schemas.http,
    Schemas.https,
    Schemas.mailto,
    Schemas.data,
    Schemas.file,
    Schemas.vscodeFileResource,
    Schemas.vscodeRemote,
    Schemas.vscodeRemoteResource,
    Schemas.vscodeNotebookCell
  ];
  if (options.isTrusted) {
    allowedSchemes.push(Schemas.command);
  }
  return {
    config: {
      // allowedTags should included everything that markdown renders to.
      // Since we have our own sanitize function for marked, it's possible we missed some tag so let dompurify make sure.
      // HTML tags that can result from markdown are from reading https://spec.commonmark.org/0.29/
      // HTML table tags that can result from markdown are from https://github.github.com/gfm/#tables-extension-
      ALLOWED_TAGS: options.allowedTags ?? [...DOM.basicMarkupHtmlTags],
      ALLOWED_ATTR: allowedMarkdownAttr,
      ALLOW_UNKNOWN_PROTOCOLS: true
    },
    allowedSchemes
  };
}
__name(getSanitizerOptions, "getSanitizerOptions");
function renderStringAsPlaintext(string) {
  return isMarkdownString(string) ? renderMarkdownAsPlaintext(string) : string;
}
__name(renderStringAsPlaintext, "renderStringAsPlaintext");
function renderMarkdownAsPlaintext(markdown, withCodeBlocks) {
  let value = markdown.value ?? "";
  if (value.length > 1e5) {
    value = `${value.substr(0, 1e5)}\u2026`;
  }
  const html = marked.parse(value, { async: false, renderer: withCodeBlocks ? plainTextWithCodeBlocksRenderer.value : plainTextRenderer.value });
  return sanitizeRenderedMarkdown({ isTrusted: false }, html).toString().replace(/&(#\d+|[a-zA-Z]+);/g, (m) => unescapeInfo.get(m) ?? m).trim();
}
__name(renderMarkdownAsPlaintext, "renderMarkdownAsPlaintext");
const unescapeInfo = /* @__PURE__ */ new Map([
  ["&quot;", '"'],
  ["&nbsp;", " "],
  ["&amp;", "&"],
  ["&#39;", "'"],
  ["&lt;", "<"],
  ["&gt;", ">"]
]);
function createPlainTextRenderer() {
  const renderer = new marked.Renderer();
  renderer.code = ({ text }) => {
    return escape(text);
  };
  renderer.blockquote = ({ text }) => {
    return text + "\n";
  };
  renderer.html = (_) => {
    return "";
  };
  renderer.heading = function({ tokens }) {
    return this.parser.parseInline(tokens) + "\n";
  };
  renderer.hr = () => {
    return "";
  };
  renderer.list = function({ items }) {
    return items.map((x) => this.listitem(x)).join("\n") + "\n";
  };
  renderer.listitem = ({ text }) => {
    return text + "\n";
  };
  renderer.paragraph = function({ tokens }) {
    return this.parser.parseInline(tokens) + "\n";
  };
  renderer.table = function({ header, rows }) {
    return header.map((cell) => this.tablecell(cell)).join(" ") + "\n" + rows.map((cells) => cells.map((cell) => this.tablecell(cell)).join(" ")).join("\n") + "\n";
  };
  renderer.tablerow = ({ text }) => {
    return text;
  };
  renderer.tablecell = function({ tokens }) {
    return this.parser.parseInline(tokens);
  };
  renderer.strong = ({ text }) => {
    return text;
  };
  renderer.em = ({ text }) => {
    return text;
  };
  renderer.codespan = ({ text }) => {
    return escape(text);
  };
  renderer.br = (_) => {
    return "\n";
  };
  renderer.del = ({ text }) => {
    return text;
  };
  renderer.image = (_) => {
    return "";
  };
  renderer.text = ({ text }) => {
    return text;
  };
  renderer.link = ({ text }) => {
    return text;
  };
  return renderer;
}
__name(createPlainTextRenderer, "createPlainTextRenderer");
const plainTextRenderer = new Lazy(createPlainTextRenderer);
const plainTextWithCodeBlocksRenderer = new Lazy(() => {
  const renderer = createPlainTextRenderer();
  renderer.code = ({ text }) => {
    return `
\`\`\`
${escape(text)}
\`\`\`
`;
  };
  return renderer;
});
function mergeRawTokenText(tokens) {
  let mergedTokenText = "";
  tokens.forEach((token) => {
    mergedTokenText += token.raw;
  });
  return mergedTokenText;
}
__name(mergeRawTokenText, "mergeRawTokenText");
function completeSingleLinePattern(token) {
  if (!token.tokens) {
    return void 0;
  }
  for (let i = token.tokens.length - 1; i >= 0; i--) {
    const subtoken = token.tokens[i];
    if (subtoken.type === "text") {
      const lines = subtoken.raw.split("\n");
      const lastLine = lines[lines.length - 1];
      if (lastLine.includes("`")) {
        return completeCodespan(token);
      } else if (lastLine.includes("**")) {
        return completeDoublestar(token);
      } else if (lastLine.match(/\*\w/)) {
        return completeStar(token);
      } else if (lastLine.match(/(^|\s)__\w/)) {
        return completeDoubleUnderscore(token);
      } else if (lastLine.match(/(^|\s)_\w/)) {
        return completeUnderscore(token);
      } else if (
        // Text with start of link target
        hasLinkTextAndStartOfLinkTarget(lastLine) || // This token doesn't have the link text, eg if it contains other markdown constructs that are in other subtokens.
        // But some preceding token does have an unbalanced [ at least
        hasStartOfLinkTargetAndNoLinkText(lastLine) && token.tokens.slice(0, i).some((t) => t.type === "text" && t.raw.match(/\[[^\]]*$/))
      ) {
        const nextTwoSubTokens = token.tokens.slice(i + 1);
        if (
          // If the link was parsed as a link, then look for a link token and a text token with a quote
          nextTwoSubTokens[0]?.type === "link" && nextTwoSubTokens[1]?.type === "text" && nextTwoSubTokens[1].raw.match(/^ *"[^"]*$/) || // And if the link was not parsed as a link (eg command link), just look for a single quote in this token
          lastLine.match(/^[^"]* +"[^"]*$/)
        ) {
          return completeLinkTargetArg(token);
        }
        return completeLinkTarget(token);
      } else if (lastLine.match(/(^|\s)\[\w*/)) {
        return completeLinkText(token);
      }
    }
  }
  return void 0;
}
__name(completeSingleLinePattern, "completeSingleLinePattern");
function hasLinkTextAndStartOfLinkTarget(str) {
  return !!str.match(/(^|\s)\[.*\]\(\w*/);
}
__name(hasLinkTextAndStartOfLinkTarget, "hasLinkTextAndStartOfLinkTarget");
function hasStartOfLinkTargetAndNoLinkText(str) {
  return !!str.match(/^[^\[]*\]\([^\)]*$/);
}
__name(hasStartOfLinkTargetAndNoLinkText, "hasStartOfLinkTargetAndNoLinkText");
function completeListItemPattern(list) {
  const lastListItem = list.items[list.items.length - 1];
  const lastListSubToken = lastListItem.tokens ? lastListItem.tokens[lastListItem.tokens.length - 1] : void 0;
  const listEndsInHeading = /* @__PURE__ */ __name((list2) => {
    const lastItem = list2.items.at(-1);
    const lastToken = lastItem?.tokens.at(-1);
    return lastToken?.type === "heading" || lastToken?.type === "list" && listEndsInHeading(lastToken);
  }, "listEndsInHeading");
  let newToken;
  if (lastListSubToken?.type === "text" && !("inRawBlock" in lastListItem)) {
    newToken = completeSingleLinePattern(lastListSubToken);
  } else if (listEndsInHeading(list)) {
    const newList2 = marked.lexer(list.raw.trim() + " &nbsp;")[0];
    if (newList2.type !== "list") {
      return;
    }
    return newList2;
  }
  if (!newToken || newToken.type !== "paragraph") {
    return;
  }
  const previousListItemsText = mergeRawTokenText(list.items.slice(0, -1));
  const lastListItemLead = lastListItem.raw.match(/^(\s*(-|\d+\.|\*) +)/)?.[0];
  if (!lastListItemLead) {
    return;
  }
  const newListItemText = lastListItemLead + mergeRawTokenText(lastListItem.tokens.slice(0, -1)) + newToken.raw;
  const newList = marked.lexer(previousListItemsText + newListItemText)[0];
  if (newList.type !== "list") {
    return;
  }
  return newList;
}
__name(completeListItemPattern, "completeListItemPattern");
const maxIncompleteTokensFixRounds = 3;
function fillInIncompleteTokens(tokens) {
  for (let i = 0; i < maxIncompleteTokensFixRounds; i++) {
    const newTokens = fillInIncompleteTokensOnce(tokens);
    if (newTokens) {
      tokens = newTokens;
    } else {
      break;
    }
  }
  return tokens;
}
__name(fillInIncompleteTokens, "fillInIncompleteTokens");
function fillInIncompleteTokensOnce(tokens) {
  let i;
  let newTokens;
  for (i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "paragraph" && token.raw.match(/(\n|^)\|/)) {
      newTokens = completeTable(tokens.slice(i));
      break;
    }
    if (i === tokens.length - 1 && token.type === "list") {
      const newListToken = completeListItemPattern(token);
      if (newListToken) {
        newTokens = [newListToken];
        break;
      }
    }
    if (i === tokens.length - 1 && token.type === "paragraph") {
      const newToken = completeSingleLinePattern(token);
      if (newToken) {
        newTokens = [newToken];
        break;
      }
    }
  }
  if (newTokens) {
    const newTokensList = [
      ...tokens.slice(0, i),
      ...newTokens
    ];
    newTokensList.links = tokens.links;
    return newTokensList;
  }
  return null;
}
__name(fillInIncompleteTokensOnce, "fillInIncompleteTokensOnce");
function completeCodespan(token) {
  return completeWithString(token, "`");
}
__name(completeCodespan, "completeCodespan");
function completeStar(tokens) {
  return completeWithString(tokens, "*");
}
__name(completeStar, "completeStar");
function completeUnderscore(tokens) {
  return completeWithString(tokens, "_");
}
__name(completeUnderscore, "completeUnderscore");
function completeLinkTarget(tokens) {
  return completeWithString(tokens, ")");
}
__name(completeLinkTarget, "completeLinkTarget");
function completeLinkTargetArg(tokens) {
  return completeWithString(tokens, '")');
}
__name(completeLinkTargetArg, "completeLinkTargetArg");
function completeLinkText(tokens) {
  return completeWithString(tokens, "](https://microsoft.com)");
}
__name(completeLinkText, "completeLinkText");
function completeDoublestar(tokens) {
  return completeWithString(tokens, "**");
}
__name(completeDoublestar, "completeDoublestar");
function completeDoubleUnderscore(tokens) {
  return completeWithString(tokens, "__");
}
__name(completeDoubleUnderscore, "completeDoubleUnderscore");
function completeWithString(tokens, closingString) {
  const mergedRawText = mergeRawTokenText(Array.isArray(tokens) ? tokens : [tokens]);
  return marked.lexer(mergedRawText + closingString)[0];
}
__name(completeWithString, "completeWithString");
function completeTable(tokens) {
  const mergedRawText = mergeRawTokenText(tokens);
  const lines = mergedRawText.split("\n");
  let numCols;
  let hasSeparatorRow = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (typeof numCols === "undefined" && line.match(/^\s*\|/)) {
      const line1Matches = line.match(/(\|[^\|]+)(?=\||$)/g);
      if (line1Matches) {
        numCols = line1Matches.length;
      }
    } else if (typeof numCols === "number") {
      if (line.match(/^\s*\|/)) {
        if (i !== lines.length - 1) {
          return void 0;
        }
        hasSeparatorRow = true;
      } else {
        return void 0;
      }
    }
  }
  if (typeof numCols === "number" && numCols > 0) {
    const prefixText = hasSeparatorRow ? lines.slice(0, -1).join("\n") : mergedRawText;
    const line1EndsInPipe = !!prefixText.match(/\|\s*$/);
    const newRawText = prefixText + (line1EndsInPipe ? "" : "|") + `
|${" --- |".repeat(numCols)}`;
    return marked.lexer(newRawText);
  }
  return void 0;
}
__name(completeTable, "completeTable");
function addDompurifyHook(hook, cb) {
  dompurify.addHook(hook, cb);
  return toDisposable(() => dompurify.removeHook(hook));
}
__name(addDompurifyHook, "addDompurifyHook");
export {
  allowedMarkdownAttr,
  fillInIncompleteTokens,
  renderMarkdown,
  renderMarkdownAsPlaintext,
  renderStringAsPlaintext
};
//# sourceMappingURL=markdownRenderer.js.map
