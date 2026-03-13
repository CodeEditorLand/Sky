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
import { IBrowserViewWorkbenchService } from "../../common/browserView.js";
import { errorResult, playwrightInvokeRaw } from "./browserToolHelpers.js";
import { OpenPageToolId } from "./openBrowserTool.js";
import { ReadBrowserToolData } from "./readBrowserTool.js";
const ScreenshotBrowserToolData = {
  id: "screenshot_page",
  toolReferenceName: "screenshotPage",
  displayName: localize("screenshotBrowserTool.displayName", "Screenshot Page"),
  userDescription: localize("screenshotBrowserTool.userDescription", "Capture a screenshot of a browser page"),
  modelDescription: `Capture a screenshot of the current browser page. You can't perform actions based on the screenshot; use ${ReadBrowserToolData.id} for actions.`,
  icon: Codicon.deviceCamera,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to capture, acquired from context or the open tool.`
      },
      selector: {
        type: "string",
        description: "Playwright selector of an element to capture. If omitted, captures the whole viewport."
      },
      ref: {
        type: "string",
        description: "Element reference to capture. If omitted, captures the whole viewport."
      },
      scrollIntoViewIfNeeded: {
        type: "boolean",
        description: "Whether to scroll the element into view before capturing. Defaults to false."
      }
    },
    required: ["pageId"]
  }
};
let ScreenshotBrowserTool = class ScreenshotBrowserTool2 {
  static {
    __name(this, "ScreenshotBrowserTool");
  }
  constructor(browserViewWorkbenchService, playwrightService) {
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("browser.screenshot.invocation", "Capturing browser screenshot"),
      pastTenseMessage: localize("browser.screenshot.past", "Captured browser screenshot")
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
    const browserViewModel = await this.browserViewWorkbenchService.getBrowserViewModel(params.pageId);
    const bounds = selector && await playwrightInvokeRaw(this.playwrightService, params.pageId, async (page, selector2, scrollIntoViewIfNeeded) => {
      const locator = page.locator(selector2);
      if (scrollIntoViewIfNeeded) {
        await locator.scrollIntoViewIfNeeded();
      }
      return locator.boundingBox();
    }, selector, params.scrollIntoViewIfNeeded) || void 0;
    const zoomFactor = browserViewModel.zoomFactor;
    if (bounds) {
      bounds.x *= zoomFactor;
      bounds.y *= zoomFactor;
      bounds.width *= zoomFactor;
      bounds.height *= zoomFactor;
    }
    const screenshot = await browserViewModel.captureScreenshot({ rect: bounds });
    return {
      content: [
        {
          kind: "data",
          value: {
            mimeType: "image/jpeg",
            data: screenshot
          }
        }
      ]
    };
  }
};
ScreenshotBrowserTool = __decorate([
  __param(0, IBrowserViewWorkbenchService),
  __param(1, IPlaywrightService)
], ScreenshotBrowserTool);
export {
  ScreenshotBrowserTool,
  ScreenshotBrowserToolData
};
//# sourceMappingURL=screenshotBrowserTool.js.map
