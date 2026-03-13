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
import { OpenPageToolId } from "./openBrowserTool.js";
const HandleDialogBrowserToolData = {
  id: "handle_dialog",
  toolReferenceName: "handleDialog",
  displayName: localize("handleDialogBrowserTool.displayName", "Handle Dialog"),
  userDescription: localize("handleDialogBrowserTool.userDescription", "Respond to a dialog in a browser page"),
  modelDescription: "Respond to a pending modal (alert, confirm, prompt) or file chooser dialog on a browser page.",
  icon: Codicon.comment,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      acceptModal: {
        type: "boolean",
        description: "Whether to accept (true) or dismiss (false) a modal dialog."
      },
      promptText: {
        type: "string",
        description: "Text to enter into a prompt dialog."
      },
      selectFiles: {
        type: "array",
        items: { type: "string" },
        description: "Absolute paths of files to select, or empty to dismiss. Required for file chooser dialogs."
      }
    },
    required: ["pageId"]
  }
};
let HandleDialogBrowserTool = class HandleDialogBrowserTool2 {
  static {
    __name(this, "HandleDialogBrowserTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("browser.handleDialog.invocation", "Handling browser dialog"),
      pastTenseMessage: localize("browser.handleDialog.past", "Handled browser dialog")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    if (params.selectFiles !== void 0 && (params.acceptModal !== void 0 || params.promptText !== void 0)) {
      return errorResult(`Invalid parameters. 'selectFiles' cannot be used with 'acceptModal' or 'promptText'.`);
    }
    if (!Array.isArray(params.selectFiles) && (params.acceptModal === void 0 || params.acceptModal === null)) {
      return errorResult(`Invalid parameters. Either 'selectFiles' or 'acceptModal' must be provided.`);
    }
    try {
      let result;
      if (params.selectFiles !== void 0) {
        result = await this.playwrightService.replyToFileChooser(params.pageId, params.selectFiles);
      } else {
        result = await this.playwrightService.replyToDialog(params.pageId, params.acceptModal, params.promptText);
      }
      return { content: [{ kind: "text", value: result.summary }] };
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : String(e));
    }
  }
};
HandleDialogBrowserTool = __decorate([
  __param(0, IPlaywrightService)
], HandleDialogBrowserTool);
export {
  HandleDialogBrowserTool,
  HandleDialogBrowserToolData
};
//# sourceMappingURL=handleDialogBrowserTool.js.map
