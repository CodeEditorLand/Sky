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
import { $ } from "../../../../base/browser/dom.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "../../files/browser/fileConstants.js";
import { ITrustedDomainService } from "../../url/browser/trustedDomainService.js";
const allowedHtmlTags = [
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
  "a",
  "img",
  // TODO@roblourens when we sanitize attributes in markdown source, we can ban these elements at that step. microsoft/vscode-copilot#5091
  // Not in the official list, but used for codicons and other vscode markdown extensions
  "span",
  "div"
];
let ChatMarkdownRenderer = class ChatMarkdownRenderer2 extends MarkdownRenderer {
  static {
    __name(this, "ChatMarkdownRenderer");
  }
  constructor(options, languageService, openerService, trustedDomainService, hoverService, fileService, commandService) {
    super(options ?? {}, languageService, openerService);
    this.trustedDomainService = trustedDomainService;
    this.hoverService = hoverService;
    this.fileService = fileService;
    this.commandService = commandService;
  }
  render(markdown, options, markedOptions) {
    options = {
      ...options,
      remoteImageIsAllowed: /* @__PURE__ */ __name((uri) => this.trustedDomainService.isValid(uri), "remoteImageIsAllowed"),
      sanitizerOptions: {
        replaceWithPlaintext: true,
        allowedTags: allowedHtmlTags
      }
    };
    const mdWithBody = markdown && markdown.supportHtml ? {
      ...markdown,
      // dompurify uses DOMParser, which strips leading comments. Wrapping it all in 'body' prevents this.
      // The \n\n prevents marked.js from parsing the body contents as just text in an 'html' token, instead of actual markdown.
      value: `<body>

${markdown.value}</body>`
    } : markdown;
    const result = super.render(mdWithBody, options, markedOptions);
    const lastChild = result.element.lastChild;
    if (lastChild?.nodeType === Node.TEXT_NODE && lastChild.textContent?.trim()) {
      lastChild.replaceWith($("p", void 0, lastChild.textContent));
    }
    return this.attachCustomHover(result);
  }
  attachCustomHover(result) {
    const store = new DisposableStore();
    result.element.querySelectorAll("a").forEach((element) => {
      if (element.title) {
        const title = element.title;
        element.title = "";
        store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), element, title));
      }
    });
    return {
      element: result.element,
      dispose: /* @__PURE__ */ __name(() => {
        result.dispose();
        store.dispose();
      }, "dispose")
    };
  }
  async openMarkdownLink(link, markdown) {
    try {
      const uri = URI.parse(link);
      if ((await this.fileService.stat(uri)).isDirectory) {
        return this.commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, uri);
      }
    } catch {
    }
    return super.openMarkdownLink(link, markdown);
  }
};
ChatMarkdownRenderer = __decorate([
  __param(1, ILanguageService),
  __param(2, IOpenerService),
  __param(3, ITrustedDomainService),
  __param(4, IHoverService),
  __param(5, IFileService),
  __param(6, ICommandService)
], ChatMarkdownRenderer);
export {
  ChatMarkdownRenderer
};
//# sourceMappingURL=chatMarkdownRenderer.js.map
