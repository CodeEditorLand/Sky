var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getZoomLevel } from "../../../../base/browser/browser.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { buttonBackground, buttonForeground, buttonHoverBackground, foreground, inputActiveOptionBorder, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, scrollbarSliderActiveBackground, scrollbarSliderHoverBackground, textLinkActiveForeground, textLinkForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { SIDE_BAR_BACKGROUND } from "../../../common/theme.js";
import { IIssueFormService, IWorkbenchIssueService } from "../common/issue.js";
import { IWorkbenchAssignmentService } from "../../../services/assignment/common/assignmentService.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IIntegrityService } from "../../../services/integrity/common/integrity.js";
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
let NativeIssueService = class NativeIssueService2 {
  static {
    __name(this, "NativeIssueService");
  }
  constructor(issueFormService, themeService, extensionManagementService, extensionEnablementService, workspaceTrustManagementService, experimentService, authenticationService, integrityService) {
    this.issueFormService = issueFormService;
    this.themeService = themeService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.experimentService = experimentService;
    this.authenticationService = authenticationService;
    this.integrityService = integrityService;
  }
  async openReporter(dataOverrides = {}) {
    const extensionData = [];
    try {
      const extensions = await this.extensionManagementService.getInstalled();
      const enabledExtensions = extensions.filter((extension) => this.extensionEnablementService.isEnabled(extension) || dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId);
      extensionData.push(...enabledExtensions.map((extension) => {
        const { manifest } = extension;
        const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
        const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === "themes";
        const isBuiltin = extension.type === 0;
        return {
          name: manifest.name,
          publisher: manifest.publisher,
          version: manifest.version,
          repositoryUrl: manifest.repository && manifest.repository.url,
          bugsUrl: manifest.bugs && manifest.bugs.url,
          displayName: manifest.displayName,
          id: extension.identifier.id,
          data: dataOverrides.data,
          uri: dataOverrides.uri,
          isTheme,
          isBuiltin,
          extensionData: "Extensions data loading"
        };
      }));
    } catch (e) {
      extensionData.push({
        name: "Workbench Issue Service",
        publisher: "Unknown",
        version: "0.0.0",
        repositoryUrl: void 0,
        bugsUrl: void 0,
        extensionData: "Extensions data loading",
        displayName: `Extensions not loaded: ${e}`,
        id: "workbench.issue",
        isTheme: false,
        isBuiltin: true
      });
    }
    const experiments = await this.experimentService.getCurrentExperiments();
    let githubAccessToken = "";
    try {
      const githubSessions = await this.authenticationService.getSessions("github");
      const potentialSessions = githubSessions.filter((session) => session.scopes.includes("repo"));
      githubAccessToken = potentialSessions[0]?.accessToken;
    } catch (e) {
    }
    let isUnsupported = false;
    try {
      isUnsupported = !(await this.integrityService.isPure()).isPure;
    } catch (e) {
    }
    const theme = this.themeService.getColorTheme();
    const issueReporterData = Object.assign({
      styles: getIssueReporterStyles(theme),
      zoomLevel: getZoomLevel(mainWindow),
      enabledExtensions: extensionData,
      experiments: experiments?.join("\n"),
      restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
      isUnsupported,
      githubAccessToken
    }, dataOverrides);
    return this.issueFormService.openReporter(issueReporterData);
  }
};
NativeIssueService = __decorate([
  __param(0, IIssueFormService),
  __param(1, IThemeService),
  __param(2, IExtensionManagementService),
  __param(3, IWorkbenchExtensionEnablementService),
  __param(4, IWorkspaceTrustManagementService),
  __param(5, IWorkbenchAssignmentService),
  __param(6, IAuthenticationService),
  __param(7, IIntegrityService)
], NativeIssueService);
function getIssueReporterStyles(theme) {
  return {
    backgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
    color: getColor(theme, foreground),
    textLinkColor: getColor(theme, textLinkForeground),
    textLinkActiveForeground: getColor(theme, textLinkActiveForeground),
    inputBackground: getColor(theme, inputBackground),
    inputForeground: getColor(theme, inputForeground),
    inputBorder: getColor(theme, inputBorder),
    inputActiveBorder: getColor(theme, inputActiveOptionBorder),
    inputErrorBorder: getColor(theme, inputValidationErrorBorder),
    inputErrorBackground: getColor(theme, inputValidationErrorBackground),
    inputErrorForeground: getColor(theme, inputValidationErrorForeground),
    buttonBackground: getColor(theme, buttonBackground),
    buttonForeground: getColor(theme, buttonForeground),
    buttonHoverBackground: getColor(theme, buttonHoverBackground),
    sliderActiveColor: getColor(theme, scrollbarSliderActiveBackground),
    sliderBackgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
    sliderHoverColor: getColor(theme, scrollbarSliderHoverBackground)
  };
}
__name(getIssueReporterStyles, "getIssueReporterStyles");
function getColor(theme, key) {
  const color = theme.getColor(key);
  return color ? color.toString() : void 0;
}
__name(getColor, "getColor");
registerSingleton(
  IWorkbenchIssueService,
  NativeIssueService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeIssueService,
  getIssueReporterStyles
};
//# sourceMappingURL=issueService.js.map
