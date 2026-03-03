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
const TypeBrowserToolData = {
  id: "type_in_page",
  toolReferenceName: "typeInPage",
  displayName: localize("typeBrowserTool.displayName", "Type in Page"),
  userDescription: localize("typeBrowserTool.userDescription", "Type text or press keys in a browser page"),
  modelDescription: "Type text or press keys in a browser page.",
  icon: Codicon.symbolText,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      text: {
        type: "string",
        description: 'The text to type. One of "text" or "key" must be provided.'
      },
      key: {
        type: "string",
        description: 'A key or key combination to press (e.g., "Enter", "Tab", "Control+c"). One of "text" or "key" must be provided.'
      },
      selector: {
        type: "string",
        description: "Playwright selector of element to target. If omitted, types into the focused element."
      },
      ref: {
        type: "string",
        description: "Element reference to target. If omitted, types into the focused element."
      }
    },
    required: ["pageId"]
  }
};
let TypeBrowserTool = class TypeBrowserTool2 {
  static {
    __name(this, "TypeBrowserTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context, _token) {
    const params = context.parameters;
    if (params.key) {
      return {
        invocationMessage: localize("browser.pressKey.invocation", "Pressing key {0} in browser", params.key),
        pastTenseMessage: localize("browser.pressKey.past", "Pressed key {0} in browser", params.key)
      };
    }
    return {
      invocationMessage: localize("browser.type.invocation", "Typing text in browser"),
      pastTenseMessage: localize("browser.type.past", "Typed text in browser")
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
    if (!params.text && !params.key) {
      return errorResult('Either a "text" or "key" parameter is required.');
    }
    if (params.key) {
      if (selector) {
        return playwrightInvoke(this.playwrightService, params.pageId, (page, sel, key) => page.locator(sel).press(key), selector, params.key);
      }
      return playwrightInvoke(this.playwrightService, params.pageId, (page, key) => page.keyboard.press(key), params.key);
    }
    if (selector) {
      return playwrightInvoke(this.playwrightService, params.pageId, (page, sel, text) => page.locator(sel).fill(text), selector, params.text);
    }
    return playwrightInvoke(this.playwrightService, params.pageId, (page, text) => page.keyboard.type(text), params.text);
  }
};
TypeBrowserTool = __decorate([
  __param(0, IPlaywrightService)
], TypeBrowserTool);
export {
  TypeBrowserTool,
  TypeBrowserToolData
};
//# sourceMappingURL=typeBrowserTool.js.map
