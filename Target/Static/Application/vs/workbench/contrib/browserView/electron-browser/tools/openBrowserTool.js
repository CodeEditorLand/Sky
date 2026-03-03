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
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { IPlaywrightService } from "../../../../../platform/browserView/common/playwrightService.js";
import { ToolDataSource } from "../../../chat/common/tools/languageModelToolsService.js";
import { errorResult } from "./browserToolHelpers.js";
const OpenPageToolId = "open_browser_page";
const OpenBrowserToolData = {
  id: OpenPageToolId,
  toolReferenceName: "openBrowserPage",
  displayName: localize("openBrowserTool.displayName", "Open Browser Page"),
  userDescription: localize("openBrowserTool.userDescription", "Open a URL in the integrated browser"),
  modelDescription: "Open a new browser page in the integrated browser at the given URL. Returns a page ID that must be used with other browser tools to interact with the page. Prefer to reuse existing pages whenever possible and only call this tool if a new page is necessary.",
  icon: Codicon.openInProduct,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to open in the browser."
      }
    },
    required: ["url"]
  }
};
let OpenBrowserTool = class OpenBrowserTool2 {
  static {
    __name(this, "OpenBrowserTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context, _token) {
    const params = context.parameters;
    return {
      invocationMessage: localize("browser.open.invocation", "Opening browser page at {0}", params.url ?? "about:blank"),
      pastTenseMessage: localize("browser.open.past", "Opened browser page at {0}", params.url ?? "about:blank"),
      confirmationMessages: {
        title: localize("browser.open.confirmTitle", "Open Browser Page?"),
        message: localize("browser.open.confirmMessage", "This will open {0} in the integrated browser. The agent will be able to read and interact with its contents.", params.url ?? "about:blank"),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.url) {
      return errorResult('The "url" parameter is required.');
    }
    const { pageId, summary } = await this.playwrightService.openPage(params.url);
    return {
      content: [{
        kind: "text",
        value: `Page ID: ${pageId}
${summary}`
      }]
    };
  }
};
OpenBrowserTool = __decorate([
  __param(0, IPlaywrightService)
], OpenBrowserTool);
export {
  OpenBrowserTool,
  OpenBrowserToolData,
  OpenPageToolId
};
//# sourceMappingURL=openBrowserTool.js.map
