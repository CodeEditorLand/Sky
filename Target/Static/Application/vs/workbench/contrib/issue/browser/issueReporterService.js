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
import { localize } from "../../../../nls.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IIssueFormService } from "../common/issue.js";
import { BaseIssueReporterService } from "./baseIssueReporterService.js";
let IssueWebReporter = class IssueWebReporter2 extends BaseIssueReporterService {
  static {
    __name(this, "IssueWebReporter");
  }
  constructor(disableExtensions, data, os, product, window, issueFormService, themeService, fileService, fileDialogService) {
    super(disableExtensions, data, os, product, window, true, issueFormService, themeService, fileService, fileDialogService);
    const target = this.window.document.querySelector(".block-system .block-info");
    const webInfo = this.window.navigator.userAgent;
    if (webInfo) {
      target?.appendChild(this.window.document.createTextNode(webInfo));
      this.receivedSystemInfo = true;
      this.issueReporterModel.update({ systemInfoWeb: webInfo });
    }
    this.setEventHandlers();
  }
  setEventHandlers() {
    super.setEventHandlers();
    this.addEventListener("issue-type", "change", (event) => {
      const issueType = parseInt(event.target.value);
      this.issueReporterModel.update({ issueType });
      const descriptionTextArea = this.getElementById("issue-title");
      if (descriptionTextArea) {
        descriptionTextArea.placeholder = localize("undefinedPlaceholder", "Please enter a title");
      }
      this.updatePreviewButtonState();
      this.setSourceOptions();
      this.render();
    });
  }
};
IssueWebReporter = __decorate([
  __param(5, IIssueFormService),
  __param(6, IThemeService),
  __param(7, IFileService),
  __param(8, IFileDialogService)
], IssueWebReporter);
export {
  IssueWebReporter
};
//# sourceMappingURL=issueReporterService.js.map
