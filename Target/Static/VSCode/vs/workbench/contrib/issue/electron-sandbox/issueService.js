var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { getZoomLevel } from "../../../../base/browser/browser.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionType } from "../../../../platform/extensions/common/extensions.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { buttonBackground, buttonForeground, buttonHoverBackground, foreground, inputActiveOptionBorder, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, scrollbarSliderActiveBackground, scrollbarSliderHoverBackground, textLinkActiveForeground, textLinkForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IColorTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { SIDE_BAR_BACKGROUND } from "../../../common/theme.js";
import { IIssueFormService, IssueReporterData, IssueReporterExtensionData, IssueReporterStyles, IWorkbenchIssueService } from "../common/issue.js";
import { IWorkbenchAssignmentService } from "../../../services/assignment/common/assignmentService.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IIntegrityService } from "../../../services/integrity/common/integrity.js";
let NativeIssueService = class {
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
  static {
    __name(this, "NativeIssueService");
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
        const isBuiltin = extension.type === ExtensionType.System;
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
NativeIssueService = __decorateClass([
  __decorateParam(0, IIssueFormService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IWorkbenchExtensionEnablementService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IWorkbenchAssignmentService),
  __decorateParam(6, IAuthenticationService),
  __decorateParam(7, IIntegrityService)
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
registerSingleton(IWorkbenchIssueService, NativeIssueService, InstantiationType.Delayed);
export {
  NativeIssueService,
  getIssueReporterStyles
};
//# sourceMappingURL=issueService.js.map
