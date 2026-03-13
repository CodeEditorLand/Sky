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
import { streamToBuffer, VSBuffer } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IRequestService } from "../../../../../platform/request/common/request.js";
import { IURLService } from "../../../../../platform/url/common/url.js";
import { askForPromptFileName } from "./pickers/askForPromptName.js";
import { askForPromptSourceFolder } from "./pickers/askForPromptSourceFolder.js";
import { getCleanPromptName } from "../../common/promptSyntax/config/promptFileLocations.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { localize } from "../../../../../nls.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { Schemas } from "../../../../../base/common/network.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { mainWindow } from "../../../../../base/browser/window.js";
let PromptUrlHandler = class PromptUrlHandler2 extends Disposable {
  static {
    __name(this, "PromptUrlHandler");
  }
  static {
    this.ID = "workbench.contrib.promptUrlHandler";
  }
  constructor(urlService, notificationService, requestService, instantiationService, fileService, openerService, logService, dialogService, hostService) {
    super();
    this.notificationService = notificationService;
    this.requestService = requestService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this._register(urlService.registerHandler(this));
  }
  async handleURL(uri) {
    let promptType;
    switch (uri.path) {
      case "chat-prompt/install":
        promptType = PromptsType.prompt;
        break;
      case "chat-instructions/install":
        promptType = PromptsType.instructions;
        break;
      case "chat-mode/install":
      case "chat-agent/install":
        promptType = PromptsType.agent;
        break;
      default:
        return false;
    }
    try {
      const query = decodeURIComponent(uri.query);
      if (!query || !query.startsWith("url=")) {
        return true;
      }
      const urlString = query.substring(4);
      const url = URI.parse(urlString);
      if (url.scheme !== Schemas.https && url.scheme !== Schemas.http) {
        this.logService.error(`[PromptUrlHandler] Invalid URL: ${urlString}`);
        return true;
      }
      await this.hostService.focus(mainWindow);
      if (await this.shouldBlockInstall(promptType, url)) {
        return true;
      }
      const result = await this.requestService.request({ type: "GET", url: urlString, callSite: "promptUrlHandler.resolveUrl" }, CancellationToken.None);
      if (result.res.statusCode !== 200) {
        this.logService.error(`[PromptUrlHandler] Failed to fetch URL: ${urlString}`);
        this.notificationService.error(localize("failed", "Failed to fetch URL: {0}", urlString));
        return true;
      }
      const responseData = (await streamToBuffer(result.stream)).toString();
      const newFolder = await this.instantiationService.invokeFunction(askForPromptSourceFolder, promptType);
      if (!newFolder) {
        return true;
      }
      const newName = await this.instantiationService.invokeFunction(askForPromptFileName, promptType, newFolder.uri, getCleanPromptName(url));
      if (!newName) {
        return true;
      }
      const promptUri = URI.joinPath(newFolder.uri, newName);
      await this.fileService.createFolder(newFolder.uri);
      await this.fileService.createFile(promptUri, VSBuffer.fromString(responseData));
      await this.openerService.open(promptUri);
      return true;
    } catch (error) {
      this.logService.error(`Error handling prompt URL ${uri.toString()}`, error);
      return true;
    }
  }
  async shouldBlockInstall(promptType, url) {
    let uriLabel = url.toString();
    if (uriLabel.length > 50) {
      uriLabel = `${uriLabel.substring(0, 35)}...${uriLabel.substring(uriLabel.length - 15)}`;
    }
    const detail = new MarkdownString("", { supportHtml: true });
    detail.appendMarkdown(localize("confirmOpenDetail2", "This will access {0}.\n\n", `[${uriLabel}](${url.toString()})`));
    detail.appendMarkdown(localize("confirmOpenDetail3", "If you did not initiate this request, it may represent an attempted attack on your system. Unless you took an explicit action to initiate this request, you should press 'No'"));
    let message;
    switch (promptType) {
      case PromptsType.prompt:
        message = localize("confirmInstallPrompt", "An external application wants to create a prompt file with content from a URL. Do you want to continue by selecting a destination folder and name?");
        break;
      case PromptsType.instructions:
        message = localize("confirmInstallInstructions", "An external application wants to create an instructions file with content from a URL. Do you want to continue by selecting a destination folder and name?");
        break;
      default:
        message = localize("confirmInstallAgent", "An external application wants to create a custom agent with content from a URL. Do you want to continue by selecting a destination folder and name?");
        break;
    }
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      primaryButton: localize({ key: "yesButton", comment: ["&& denotes a mnemonic"] }, "&&Yes"),
      cancelButton: localize("noButton", "No"),
      message,
      custom: {
        markdownDetails: [{
          markdown: detail
        }]
      }
    });
    return !confirmed;
  }
};
PromptUrlHandler = __decorate([
  __param(0, IURLService),
  __param(1, INotificationService),
  __param(2, IRequestService),
  __param(3, IInstantiationService),
  __param(4, IFileService),
  __param(5, IOpenerService),
  __param(6, ILogService),
  __param(7, IDialogService),
  __param(8, IHostService)
], PromptUrlHandler);
export {
  PromptUrlHandler
};
//# sourceMappingURL=promptUrlHandler.js.map
