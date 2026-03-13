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
import { localize } from "../../../../../nls.js";
import { logBrowserOpen } from "../../../../../platform/browserView/common/browserViewTelemetry.js";
import { BrowserViewUri } from "../../../../../platform/browserView/common/browserViewUri.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { OpenBrowserToolData } from "./openBrowserTool.js";
const OpenBrowserToolNonAgenticData = {
  ...OpenBrowserToolData,
  modelDescription: "Open a new browser page in the integrated browser at the given URL."
};
let OpenBrowserToolNonAgentic = class OpenBrowserToolNonAgentic2 {
  static {
    __name(this, "OpenBrowserToolNonAgentic");
  }
  constructor(telemetryService, editorService) {
    this.telemetryService = telemetryService;
    this.editorService = editorService;
  }
  async prepareToolInvocation(context, _token) {
    const params = context.parameters;
    if (!params.url) {
      throw new Error('The "url" parameter is required.');
    }
    const parsed = URL.parse(params.url);
    if (!parsed) {
      throw new Error("You must provide a complete, valid URL.");
    }
    return {
      invocationMessage: localize("browser.open.nonAgentic.invocation", "Opening browser page at {0}", parsed.href),
      pastTenseMessage: localize("browser.open.nonAgentic.past", "Opened browser page at {0}", parsed.href),
      confirmationMessages: {
        title: localize("browser.open.nonAgentic.confirmTitle", "Open Browser Page?"),
        message: localize("browser.open.nonAgentic.confirmMessage", "This will open {0} in the integrated browser. The agent will not be able to read its contents.", parsed.href),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    logBrowserOpen(this.telemetryService, "chatTool");
    const browserUri = BrowserViewUri.forUrl(params.url);
    await this.editorService.openEditor({ resource: browserUri, options: { pinned: true } });
    return {
      content: [{
        kind: "text",
        value: `Page opened successfully. Note that you do not have access to the page contents unless the user enables agentic tools via the \`workbench.browser.enableChatTools\` setting.`
      }]
    };
  }
};
OpenBrowserToolNonAgentic = __decorate([
  __param(0, ITelemetryService),
  __param(1, IEditorService)
], OpenBrowserToolNonAgentic);
export {
  OpenBrowserToolNonAgentic,
  OpenBrowserToolNonAgenticData
};
//# sourceMappingURL=openBrowserToolNonAgentic.js.map
