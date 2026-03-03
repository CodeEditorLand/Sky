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
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { localize } from "../../../../../nls.js";
import { BrowserViewUri } from "../../../../../platform/browserView/common/browserViewUri.js";
import { IPlaywrightService } from "../../../../../platform/browserView/common/playwrightService.js";
import { ToolDataSource } from "../../../chat/common/tools/languageModelToolsService.js";
import { errorResult } from "./browserToolHelpers.js";
import { OpenPageToolId } from "./openBrowserTool.js";
const ReadBrowserToolData = {
  id: "read_page",
  toolReferenceName: "readPage",
  displayName: localize("readBrowserTool.displayName", "Read Page"),
  userDescription: localize("readBrowserTool.userDescription", "Read the content of a browser page"),
  modelDescription: "Get a snapshot of the current browser page state. This is better than screenshot.",
  icon: Codicon.fileText,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID to read, acquired from context or the open tool.`
      }
    },
    required: ["pageId"]
  }
};
let ReadBrowserTool = class ReadBrowserTool2 {
  static {
    __name(this, "ReadBrowserTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    const link = `[browser page](${BrowserViewUri.forUrl("", _context.parameters.pageId).toString()})`;
    return {
      invocationMessage: new MarkdownString(localize("browser.read.invocation", "Reading {0}", link)),
      pastTenseMessage: new MarkdownString(localize("browser.read.past", "Read {0}", link))
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    const summary = await this.playwrightService.getSummary(params.pageId);
    if (!summary) {
      return errorResult("No page summary available.");
    }
    return {
      content: [{
        kind: "text",
        value: summary
      }]
    };
  }
};
ReadBrowserTool = __decorate([
  __param(0, IPlaywrightService)
], ReadBrowserTool);
export {
  ReadBrowserTool,
  ReadBrowserToolData
};
//# sourceMappingURL=readBrowserTool.js.map
