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
import { Gesture } from "../../../../base/browser/touch.js";
import { decodeBase64 } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { derived, observableFromEvent } from "../../../../base/common/observable.js";
import { isMobile, isWeb, locale } from "../../../../base/common/platform.js";
import { hasKey } from "../../../../base/common/types.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { McpServer } from "../common/mcpServer.js";
import { IMcpService } from "../common/mcpTypes.js";
import { findMcpServer, startServerAndWaitForLiveTools, translateMcpLogMessage } from "../common/mcpTypesUtils.js";
let McpToolCallUI = class McpToolCallUI2 extends Disposable {
  static {
    __name(this, "McpToolCallUI");
  }
  constructor(_uiData, _mcpService, themeService) {
    super();
    this._uiData = _uiData;
    this._mcpService = _mcpService;
    const colorTheme = observableFromEvent(themeService.onDidColorThemeChange, () => {
      const type = themeService.getColorTheme().type;
      return type === ColorScheme.DARK || type === ColorScheme.HIGH_CONTRAST_DARK ? "dark" : "light";
    });
    this.hostContext = derived((reader) => {
      return {
        theme: colorTheme.read(reader),
        styles: {
          variables: {
            "--color-background-primary": "var(--vscode-editor-background)",
            "--color-background-secondary": "var(--vscode-sideBar-background)",
            "--color-background-tertiary": "var(--vscode-activityBar-background)",
            "--color-background-inverse": "var(--vscode-editor-foreground)",
            "--color-background-ghost": "transparent",
            "--color-background-info": "var(--vscode-inputValidation-infoBackground)",
            "--color-background-danger": "var(--vscode-inputValidation-errorBackground)",
            "--color-background-success": "var(--vscode-diffEditor-insertedTextBackground)",
            "--color-background-warning": "var(--vscode-inputValidation-warningBackground)",
            "--color-background-disabled": "var(--vscode-editor-inactiveSelectionBackground)",
            "--color-text-primary": "var(--vscode-foreground)",
            "--color-text-secondary": "var(--vscode-descriptionForeground)",
            "--color-text-tertiary": "var(--vscode-disabledForeground)",
            "--color-text-inverse": "var(--vscode-editor-background)",
            "--color-text-info": "var(--vscode-textLink-foreground)",
            "--color-text-danger": "var(--vscode-errorForeground)",
            "--color-text-success": "var(--vscode-testing-iconPassed)",
            "--color-text-warning": "var(--vscode-editorWarning-foreground)",
            "--color-text-disabled": "var(--vscode-disabledForeground)",
            "--color-text-ghost": "var(--vscode-descriptionForeground)",
            "--color-border-primary": "var(--vscode-widget-border)",
            "--color-border-secondary": "var(--vscode-editorWidget-border)",
            "--color-border-tertiary": "var(--vscode-panel-border)",
            "--color-border-inverse": "var(--vscode-foreground)",
            "--color-border-ghost": "transparent",
            "--color-border-info": "var(--vscode-inputValidation-infoBorder)",
            "--color-border-danger": "var(--vscode-inputValidation-errorBorder)",
            "--color-border-success": "var(--vscode-testing-iconPassed)",
            "--color-border-warning": "var(--vscode-inputValidation-warningBorder)",
            "--color-border-disabled": "var(--vscode-disabledForeground)",
            "--color-ring-primary": "var(--vscode-focusBorder)",
            "--color-ring-secondary": "var(--vscode-focusBorder)",
            "--color-ring-inverse": "var(--vscode-focusBorder)",
            "--color-ring-info": "var(--vscode-inputValidation-infoBorder)",
            "--color-ring-danger": "var(--vscode-inputValidation-errorBorder)",
            "--color-ring-success": "var(--vscode-testing-iconPassed)",
            "--color-ring-warning": "var(--vscode-inputValidation-warningBorder)",
            "--font-sans": "var(--vscode-font-family)",
            "--font-mono": "var(--vscode-editor-font-family)",
            "--font-weight-normal": "normal",
            "--font-weight-medium": "500",
            "--font-weight-semibold": "600",
            "--font-weight-bold": "bold",
            "--font-text-xs-size": "10px",
            "--font-text-sm-size": "11px",
            "--font-text-md-size": "13px",
            "--font-text-lg-size": "14px",
            "--font-heading-xs-size": "16px",
            "--font-heading-sm-size": "18px",
            "--font-heading-md-size": "20px",
            "--font-heading-lg-size": "24px",
            "--font-heading-xl-size": "32px",
            "--font-heading-2xl-size": "40px",
            "--font-heading-3xl-size": "48px",
            "--border-radius-xs": "2px",
            "--border-radius-sm": "3px",
            "--border-radius-md": "4px",
            "--border-radius-lg": "6px",
            "--border-radius-xl": "8px",
            "--border-radius-full": "9999px",
            "--border-width-regular": "1px",
            "--font-text-xs-line-height": "1.5",
            "--font-text-sm-line-height": "1.5",
            "--font-text-md-line-height": "1.5",
            "--font-text-lg-line-height": "1.5",
            "--font-heading-xs-line-height": "1.25",
            "--font-heading-sm-line-height": "1.25",
            "--font-heading-md-line-height": "1.25",
            "--font-heading-lg-line-height": "1.25",
            "--font-heading-xl-line-height": "1.25",
            "--font-heading-2xl-line-height": "1.25",
            "--font-heading-3xl-line-height": "1.25",
            "--shadow-hairline": "0 0 0 1px var(--vscode-widget-shadow)",
            "--shadow-sm": "0 1px 2px 0 var(--vscode-widget-shadow)",
            "--shadow-md": "0 4px 6px -1px var(--vscode-widget-shadow)",
            "--shadow-lg": "0 10px 15px -3px var(--vscode-widget-shadow)"
          }
        },
        displayMode: "inline",
        availableDisplayModes: ["inline"],
        locale,
        platform: isWeb ? "web" : isMobile ? "mobile" : "desktop",
        deviceCapabilities: {
          touch: Gesture.isTouchDevice(),
          hover: Gesture.isHoverDevice()
        }
      };
    });
  }
  /**
   * Gets the underlying UI data.
   */
  get uiData() {
    return this._uiData;
  }
  /**
   * Logs a message to the MCP server's logger.
   */
  async log(log) {
    const server = await this._getServer(CancellationToken.None);
    if (server) {
      translateMcpLogMessage(server.logger, log, `[App UI]`);
    }
  }
  /**
   * Gets or finds the MCP server for this UI.
   */
  async _getServer(token) {
    return findMcpServer(this._mcpService, (s) => s.definition.id === this._uiData.serverDefinitionId && s.collection.id === this._uiData.collectionId, token);
  }
  /**
   * Loads the UI resource from the MCP server.
   * @param token Cancellation token
   * @returns The HTML content and CSP configuration
   */
  async loadResource(token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found for UI resource");
    }
    const resourceResult = await McpServer.callOn(server, (h) => h.readResource({ uri: this._uiData.resourceUri }, token), token);
    if (!resourceResult.contents || resourceResult.contents.length === 0) {
      throw new Error("UI resource not found on server");
    }
    const content = resourceResult.contents[0];
    let html;
    const mimeType = content.mimeType || "text/html";
    if (hasKey(content, { text: true })) {
      html = content.text;
    } else if (hasKey(content, { blob: true })) {
      html = decodeBase64(content.blob).toString();
    } else {
      throw new Error("UI resource has no content");
    }
    const meta = content._meta?.ui;
    return {
      ...meta,
      html,
      mimeType
    };
  }
  /**
   * Calls a tool on the MCP server.
   * @param name Tool name
   * @param params Tool parameters
   * @param token Cancellation token
   * @returns The tool call result
   */
  async callTool(name, params, token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found for tool call");
    }
    await startServerAndWaitForLiveTools(server, void 0, token);
    const tool = server.tools.get().find((t) => t.definition.name === name);
    if (!tool || !(tool.visibility & 2)) {
      throw new Error(`Tool not found on server: ${name}`);
    }
    const res = await tool.call(params, void 0, token);
    return {
      content: res.content,
      isError: res.isError,
      _meta: res._meta,
      structuredContent: res.structuredContent
    };
  }
  /**
   * Reads a resource from the MCP server.
   * @param uri Resource URI
   * @param token Cancellation token
   * @returns The resource content
   */
  async readResource(uri, token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found");
    }
    return await McpServer.callOn(server, (h) => h.readResource({ uri }, token), token);
  }
};
McpToolCallUI = __decorate([
  __param(1, IMcpService),
  __param(2, IThemeService)
], McpToolCallUI);
export {
  McpToolCallUI
};
//# sourceMappingURL=mcpToolCallUI.js.map
