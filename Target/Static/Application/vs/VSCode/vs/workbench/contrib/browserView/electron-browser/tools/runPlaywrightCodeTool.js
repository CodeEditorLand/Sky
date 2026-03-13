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
import { IPlaywrightService } from "../../../../../platform/browserView/common/playwrightService.js";
import { ToolDataSource } from "../../../chat/common/tools/languageModelToolsService.js";
import { errorResult } from "./browserToolHelpers.js";
import { OpenPageToolId } from "./openBrowserTool.js";
const RunPlaywrightCodeToolData = {
  id: "run_playwright_code",
  toolReferenceName: "runPlaywrightCode",
  displayName: localize("runPlaywrightCodeTool.displayName", "Run Playwright Code"),
  userDescription: localize("runPlaywrightCodeTool.userDescription", "Run a Playwright code snippet against a browser page"),
  modelDescription: `Run a Playwright code snippet to control a browser page. Only use this if other browser tools are insufficient.`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      pageId: {
        type: "string",
        description: `The browser page ID, acquired from context or the open tool.`
      },
      code: {
        type: "string",
        description: `The Playwright code to execute. The code must be concise, serve one clear purpose, and be self-contained. You **must not** directly access \`document\` or \`window\` using this tool. You must access it via the provided \`page\` object, e.g. "return page.evaluate(() => document.title)".`
      }
    },
    required: ["pageId", "code"]
  }
};
let RunPlaywrightCodeTool = class RunPlaywrightCodeTool2 {
  static {
    __name(this, "RunPlaywrightCodeTool");
  }
  constructor(playwrightService) {
    this.playwrightService = playwrightService;
  }
  async prepareToolInvocation(context, _token) {
    const params = context.parameters;
    const code = params.code ?? "";
    return {
      invocationMessage: new MarkdownString(localize("browser.runCode.invocation", "Running Playwright code...")),
      pastTenseMessage: new MarkdownString(localize("browser.runCode.past", "Ran Playwright code")),
      confirmationMessages: {
        title: localize("browser.runCode.confirmTitle", "Run Playwright Code?"),
        message: new MarkdownString(`\`\`\`javascript
${code.trim()}
\`\`\``),
        disclaimer: localize("browser.runCode.confirmDisclaimer", "Make sure you trust the code before continuing."),
        allowAutoConfirm: true
      }
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    if (!params.pageId) {
      return errorResult(`No page ID provided. Use '${OpenPageToolId}' first.`);
    }
    if (!params.code) {
      return errorResult('The "code" parameter is required.');
    }
    let result;
    try {
      result = await this.playwrightService.invokeFunction(params.pageId, `async (page) => { ${params.code} }`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return errorResult(`Code execution failed: ${message}`);
    }
    const json = JSON.stringify(result.result || null);
    let outputMessage;
    if (result.result) {
      outputMessage = new MarkdownString();
      outputMessage.appendMarkdown(localize("browser.runCode.outputLabel", "Output:"));
      outputMessage.appendText("\n");
      outputMessage.appendCodeblock("json", json);
    }
    return {
      content: [
        { kind: "text", value: result.result ? json : "Code executed successfully" },
        { kind: "text", value: result.summary }
      ],
      toolResultDetails: {
        input: params.code.trim(),
        inputLanguage: "javascript",
        output: result.result ? [{ type: "embed", isText: true, value: JSON.stringify(result.result, null, 2) }] : [],
        isError: false
      }
    };
  }
};
RunPlaywrightCodeTool = __decorate([
  __param(0, IPlaywrightService)
], RunPlaywrightCodeTool);
export {
  RunPlaywrightCodeTool,
  RunPlaywrightCodeToolData
};
//# sourceMappingURL=runPlaywrightCodeTool.js.map
