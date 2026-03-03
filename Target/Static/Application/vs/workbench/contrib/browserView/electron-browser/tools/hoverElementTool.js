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
const HoverElementToolData = {
  id: "hover_element",
  toolReferenceName: "hoverElement",
  displayName: localize("hoverElementTool.displayName", "Hover Element"),
  userDescription: localize("hoverElementTool.userDescription", "Hover over an element in a browser page"),
  modelDescription: "Hover over an element in a browser page. Provide either a Playwright selector or an element reference.",
  icon: Codicon.cursor,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      selector: {
        type: "string",
        description: "Playwright selector of the element to hover over."
      },
      ref: {
        type: "string",
        description: 'Element reference to hover over. One of "selector" or "ref" must be provided.'
      }
    },
    required: ["pageId"]
  }
};
let HoverElementTool = class HoverElementTool2 {
  static {
    __name(this, "HoverElementTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("browser.hover.invocation", "Hovering over element in browser"),
      pastTenseMessage: localize("browser.hover.past", "Hovered over element in browser")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    let selector = params.selector;
    if (params.ref) {
      selector = `aria-ref=${params.ref}`;
    }
    if (!selector) {
      return errorResult('Either a "selector" or "ref" parameter is required.');
    }
    return playwrightInvoke(this.playwrightService, params.pageId, (page, sel) => page.locator(sel).hover(), selector);
  }
};
HoverElementTool = __decorate([
  __param(0, IPlaywrightService)
], HoverElementTool);
export {
  HoverElementTool,
  HoverElementToolData
};
//# sourceMappingURL=hoverElementTool.js.map
