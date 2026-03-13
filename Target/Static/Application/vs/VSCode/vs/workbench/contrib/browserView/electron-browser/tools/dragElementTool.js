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
const DragElementToolData = {
  id: "drag_element",
  toolReferenceName: "dragElement",
  displayName: localize("dragElementTool.displayName", "Drag Element"),
  userDescription: localize("dragElementTool.userDescription", "Drag an element over another element"),
  modelDescription: "Drag an element over another element in a browser page.",
  icon: Codicon.move,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      fromSelector: {
        type: "string",
        description: "Playwright selector of the element to drag."
      },
      fromRef: {
        type: "string",
        description: 'Element reference of the element to drag. One of "fromSelector" or "fromRef" must be provided.'
      },
      toSelector: {
        type: "string",
        description: "Playwright selector of the element to drop onto."
      },
      toRef: {
        type: "string",
        description: 'Element reference of the element to drop onto. One of "toSelector" or "toRef" must be provided.'
      }
    },
    required: ["pageId"]
  }
};
let DragElementTool = class DragElementTool2 {
  static {
    __name(this, "DragElementTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("browser.drag.invocation", "Dragging element in browser"),
      pastTenseMessage: localize("browser.drag.past", "Dragged element in browser")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    let fromSelector = params.fromSelector;
    if (params.fromRef) {
      fromSelector = `aria-ref=${params.fromRef}`;
    }
    if (!fromSelector) {
      return errorResult('Either a "fromSelector" or "fromRef" parameter is required for the source element.');
    }
    let toSelector = params.toSelector;
    if (params.toRef) {
      toSelector = `aria-ref=${params.toRef}`;
    }
    if (!toSelector) {
      return errorResult('Either a "toSelector" or "toRef" parameter is required for the target element.');
    }
    return playwrightInvoke(this.playwrightService, params.pageId, (page, from, to) => page.dragAndDrop(from, to), fromSelector, toSelector);
  }
};
DragElementTool = __decorate([
  __param(0, IPlaywrightService)
], DragElementTool);
export {
  DragElementTool,
  DragElementToolData
};
//# sourceMappingURL=dragElementTool.js.map
