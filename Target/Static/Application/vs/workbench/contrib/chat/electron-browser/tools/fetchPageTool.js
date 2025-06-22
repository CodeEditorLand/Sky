var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IWebContentExtractorService } from "../../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { ToolDataSource } from "../../common/languageModelToolsService.js";
import { InternalFetchWebPageToolId } from "../../common/tools/tools.js";
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
const FetchWebPageToolData = {
  id: InternalFetchWebPageToolId,
  displayName: "Fetch Web Page",
  canBeReferencedInPrompt: false,
  modelDescription: localize("fetchWebPage.modelDescription", "Fetches the main content from a web page. This tool is useful for summarizing or analyzing the content of a webpage."),
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: {
          type: "string"
        },
        description: localize("fetchWebPage.urlsDescription", "An array of URLs to fetch content from.")
      }
    },
    required: ["urls"]
  }
};
let FetchWebPageTool = class FetchWebPageTool2 {
  static {
    __name(this, "FetchWebPageTool");
  }
  constructor(_readerModeService) {
    this._readerModeService = _readerModeService;
    this._alreadyApprovedDomains = new ResourceSet();
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const parsedUriResults = this._parseUris(invocation.parameters.urls);
    const validUris = Array.from(parsedUriResults.values()).filter((uri) => !!uri);
    if (!validUris.length) {
      return {
        content: [{ kind: "text", value: localize("fetchWebPage.noValidUrls", "No valid URLs provided.") }]
      };
    }
    for (const uri of validUris) {
      this._alreadyApprovedDomains.add(uri);
    }
    const contents = await this._readerModeService.extract(validUris);
    const contentsWithUndefined = [];
    let indexInContents = 0;
    parsedUriResults.forEach((uri) => {
      if (uri) {
        contentsWithUndefined.push(contents[indexInContents]);
        indexInContents++;
      } else {
        contentsWithUndefined.push(void 0);
      }
    });
    return {
      content: this._getPromptPartsForResults(contentsWithUndefined),
      // Have multiple results show in the dropdown
      toolResultDetails: validUris.length > 1 ? validUris : void 0
    };
  }
  async prepareToolInvocation(parameters, token) {
    const map = this._parseUris(parameters.urls);
    const invalid = new Array();
    const valid = new Array();
    map.forEach((uri, url) => {
      if (!uri) {
        invalid.push(url);
      } else {
        valid.push(uri);
      }
    });
    const urlsNeedingConfirmation = valid.filter((url) => !this._alreadyApprovedDomains.has(url));
    const pastTenseMessage = invalid.length ? invalid.length > 1 ? new MarkdownString(localize("fetchWebPage.pastTenseMessage.plural", "Fetched {0} web pages, but the following were invalid URLs:\n\n{1}\n\n", valid.length, invalid.map((url) => `- ${url}`).join("\n"))) : new MarkdownString(localize("fetchWebPage.pastTenseMessage.singular", "Fetched web page, but the following was an invalid URL:\n\n{0}\n\n", invalid[0])) : new MarkdownString();
    const invocationMessage = new MarkdownString();
    if (valid.length > 1) {
      pastTenseMessage.appendMarkdown(localize("fetchWebPage.pastTenseMessageResult.plural", "Fetched {0} web pages", valid.length));
      invocationMessage.appendMarkdown(localize("fetchWebPage.invocationMessage.plural", "Fetching {0} web pages", valid.length));
    } else {
      const url = valid[0].toString();
      if (url.length > 400) {
        pastTenseMessage.appendMarkdown(localize({
          key: "fetchWebPage.pastTenseMessageResult.singularAsLink",
          comment: [
            // Make sure the link syntax is correct
            '{Locked="]({0})"}'
          ]
        }, "Fetched [web page]({0})", url));
        invocationMessage.appendMarkdown(localize({
          key: "fetchWebPage.invocationMessage.singularAsLink",
          comment: [
            // Make sure the link syntax is correct
            '{Locked="]({0})"}'
          ]
        }, "Fetching [web page]({0})", url));
      } else {
        pastTenseMessage.appendMarkdown(localize("fetchWebPage.pastTenseMessageResult.singular", "Fetched {0}", url));
        invocationMessage.appendMarkdown(localize("fetchWebPage.invocationMessage.singular", "Fetching {0}", url));
      }
    }
    const result = { invocationMessage, pastTenseMessage };
    if (urlsNeedingConfirmation.length) {
      let confirmationTitle;
      let confirmationMessage;
      if (urlsNeedingConfirmation.length === 1) {
        confirmationTitle = localize("fetchWebPage.confirmationTitle.singular", "Fetch web page?");
        confirmationMessage = new MarkdownString(urlsNeedingConfirmation[0].toString() + "\n\n$(info) " + localize("fetchWebPage.confirmationMessage.singular", "Web content may contain malicious code or attempt prompt injection attacks."), { supportThemeIcons: true });
      } else {
        confirmationTitle = localize("fetchWebPage.confirmationTitle.plural", "Fetch web pages?");
        confirmationMessage = new MarkdownString(urlsNeedingConfirmation.map((uri) => `- ${uri.toString()}`).join("\n") + "\n\n$(info) " + localize("fetchWebPage.confirmationMessage.plural", "Web content may contain malicious code or attempt prompt injection attacks."), { supportThemeIcons: true });
      }
      result.confirmationMessages = { title: confirmationTitle, message: confirmationMessage, allowAutoConfirm: true };
    }
    return result;
  }
  _parseUris(urls) {
    const results = /* @__PURE__ */ new Map();
    urls?.forEach((uri) => {
      try {
        const uriObj = URI.parse(uri);
        results.set(uri, uriObj);
      } catch (e) {
        results.set(uri, void 0);
      }
    });
    return results;
  }
  _getPromptPartsForResults(results) {
    return results.map((value) => ({
      kind: "text",
      value: value || localize("fetchWebPage.invalidUrl", "Invalid URL")
    }));
  }
};
FetchWebPageTool = __decorate([
  __param(0, IWebContentExtractorService)
], FetchWebPageTool);
export {
  FetchWebPageTool,
  FetchWebPageToolData
};
//# sourceMappingURL=fetchPageTool.js.map
