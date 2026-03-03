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
import { errorResult, playwrightInvoke } from "./browserToolHelpers.js";
import { OpenPageToolId } from "./openBrowserTool.js";
const NavigateBrowserToolData = {
  id: "navigate_page",
  toolReferenceName: "navigatePage",
  displayName: localize("navigateBrowserTool.displayName", "Navigate Page"),
  userDescription: localize("navigateBrowserTool.userDescription", "Navigate or reload a browser page"),
  modelDescription: "Navigate a browser page by URL, history, or reload.",
  icon: Codicon.arrowRight,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to navigate, acquired from context or the open tool.`
      },
      type: {
        type: "string",
        enum: ["url", "back", "forward", "reload"],
        description: 'Navigation type: "url" to navigate to a URL (default, requires "url" param), "back" or "forward" for history, "reload" to refresh.'
      },
      url: {
        type: "string",
        description: 'The URL to navigate to. Required when type is "url".'
      }
    },
    required: ["pageId"]
  }
};
let NavigateBrowserTool = class NavigateBrowserTool2 {
  static {
    __name(this, "NavigateBrowserTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context, _token) {
    const params = context.parameters;
    switch (params.type) {
      case "reload":
        return {
          invocationMessage: localize("browser.reload.invocation", "Reloading browser page"),
          pastTenseMessage: localize("browser.reload.past", "Reloaded browser page")
        };
      case "back":
        return {
          invocationMessage: localize("browser.goBack.invocation", "Going back in browser history"),
          pastTenseMessage: localize("browser.goBack.past", "Went back in browser history")
        };
      case "forward":
        return {
          invocationMessage: localize("browser.goForward.invocation", "Going forward in browser history"),
          pastTenseMessage: localize("browser.goForward.past", "Went forward in browser history")
        };
      default:
        return {
          invocationMessage: localize("browser.navigate.invocation", "Navigating browser to {0}", params.url),
          pastTenseMessage: localize("browser.navigate.past", "Navigated browser to {0}", params.url),
          confirmationMessages: {
            title: localize("browser.navigate.confirmTitle", "Navigate Browser?"),
            message: localize("browser.navigate.confirmMessage", "This will navigate the browser to {0} and allow the agent to access its contents.", params.url),
            allowAutoConfirm: true
          }
        };
    }
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    switch (params.type) {
      case "reload":
        return playwrightInvoke(this.playwrightService, params.pageId, (page) => page.reload({ waitUntil: "domcontentloaded" }));
      case "back":
        return playwrightInvoke(this.playwrightService, params.pageId, (page) => page.goBack({ waitUntil: "domcontentloaded" }));
      case "forward":
        return playwrightInvoke(this.playwrightService, params.pageId, (page) => page.goForward({ waitUntil: "domcontentloaded" }));
      default: {
        if (!params.url) {
          return errorResult('The "url" parameter is required when type is "url".');
        }
        return playwrightInvoke(this.playwrightService, params.pageId, (page, url) => {
          return page.goto(url, { waitUntil: "domcontentloaded" });
        }, params.url);
      }
    }
  }
};
NavigateBrowserTool = __decorate([
  __param(0, IPlaywrightService)
], NavigateBrowserTool);
export {
  NavigateBrowserTool,
  NavigateBrowserToolData
};
//# sourceMappingURL=navigateBrowserTool.js.map
