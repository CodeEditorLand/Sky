var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EventType } from "../../../../../base/browser/dom.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore, dispose, toDisposable } from "../../../../../base/common/lifecycle.js";
import { isMacintosh, OS } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import * as nls from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITunnelService } from "../../../../../platform/tunnel/common/tunnel.js";
import { TerminalExternalLinkDetector } from "./terminalExternalLinkDetector.js";
import { TerminalLinkDetectorAdapter } from "./terminalLinkDetectorAdapter.js";
import { TerminalLocalFileLinkOpener, TerminalLocalFolderInWorkspaceLinkOpener, TerminalLocalFolderOutsideWorkspaceLinkOpener, TerminalSearchLinkOpener, TerminalUrlLinkOpener } from "./terminalLinkOpeners.js";
import { TerminalLocalLinkDetector } from "./terminalLocalLinkDetector.js";
import { TerminalUriLinkDetector } from "./terminalUriLinkDetector.js";
import { TerminalWordLinkDetector } from "./terminalWordLinkDetector.js";
import { ITerminalConfigurationService, TerminalLinkQuickPickEvent } from "../../../terminal/browser/terminal.js";
import { TerminalHover } from "../../../terminal/browser/widgets/terminalHoverWidget.js";
import { TERMINAL_CONFIG_SECTION } from "../../../terminal/common/terminal.js";
import { convertBufferRangeToViewport } from "./terminalLinkHelpers.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { TerminalMultiLineLinkDetector } from "./terminalMultiLineLinkDetector.js";
import { INotificationService, Severity } from "../../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
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
let TerminalLinkManager = class TerminalLinkManager2 extends DisposableStore {
  static {
    __name(this, "TerminalLinkManager");
  }
  constructor(_xterm, _processInfo, capabilities, _linkResolver, _configurationService, _instantiationService, notificationService, _telemetryService, terminalConfigurationService, _logService, _tunnelService) {
    super();
    this._xterm = _xterm;
    this._processInfo = _processInfo;
    this._linkResolver = _linkResolver;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._tunnelService = _tunnelService;
    this._standardLinkProviders = /* @__PURE__ */ new Map();
    this._linkProvidersDisposables = [];
    this._externalLinkProviders = [];
    this._openers = /* @__PURE__ */ new Map();
    let enableFileLinks = true;
    const enableFileLinksConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).enableFileLinks;
    switch (enableFileLinksConfig) {
      case "off":
      case false:
        enableFileLinks = false;
        break;
      case "notRemote":
        enableFileLinks = !this._processInfo.remoteAuthority;
        break;
    }
    if (enableFileLinks) {
      this._setupLinkDetector(TerminalMultiLineLinkDetector.id, this._instantiationService.createInstance(TerminalMultiLineLinkDetector, this._xterm, this._processInfo, this._linkResolver));
      this._setupLinkDetector(TerminalLocalLinkDetector.id, this._instantiationService.createInstance(TerminalLocalLinkDetector, this._xterm, capabilities, this._processInfo, this._linkResolver));
    }
    this._setupLinkDetector(TerminalUriLinkDetector.id, this._instantiationService.createInstance(TerminalUriLinkDetector, this._xterm, this._processInfo, this._linkResolver));
    this._setupLinkDetector(TerminalWordLinkDetector.id, this.add(this._instantiationService.createInstance(TerminalWordLinkDetector, this._xterm)));
    const localFileOpener = this._instantiationService.createInstance(TerminalLocalFileLinkOpener);
    const localFolderInWorkspaceOpener = this._instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
    this._openers.set("LocalFile", localFileOpener);
    this._openers.set("LocalFolderInWorkspace", localFolderInWorkspaceOpener);
    this._openers.set("LocalFolderOutsideWorkspace", this._instantiationService.createInstance(TerminalLocalFolderOutsideWorkspaceLinkOpener));
    this._openers.set("Search", this._instantiationService.createInstance(TerminalSearchLinkOpener, capabilities, this._processInfo.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this._processInfo.os || OS));
    this._openers.set("Url", this._instantiationService.createInstance(TerminalUrlLinkOpener, !!this._processInfo.remoteAuthority));
    this._registerStandardLinkProviders();
    let activeHoverDisposable;
    let activeTooltipScheduler;
    this.add(toDisposable(() => {
      this._clearLinkProviders();
      dispose(this._externalLinkProviders);
      activeHoverDisposable?.dispose();
      activeTooltipScheduler?.dispose();
    }));
    this._xterm.options.linkHandler = {
      allowNonHttpProtocols: true,
      activate: /* @__PURE__ */ __name((event, text) => {
        if (!this._isLinkActivationModifierDown(event)) {
          return;
        }
        const colonIndex = text.indexOf(":");
        if (colonIndex === -1) {
          throw new Error(`Could not find scheme in link "${text}"`);
        }
        const scheme = text.substring(0, colonIndex);
        if (terminalConfigurationService.config.allowedLinkSchemes.indexOf(scheme) === -1) {
          notificationService.prompt(Severity.Warning, nls.localize("scheme", "Opening URIs can be insecure, do you want to allow opening links with the scheme {0}?", scheme), [
            {
              label: nls.localize("allow", "Allow {0}", scheme),
              run: /* @__PURE__ */ __name(() => {
                const allowedLinkSchemes = [
                  ...terminalConfigurationService.config.allowedLinkSchemes,
                  scheme
                ];
                this._configurationService.updateValue(`terminal.integrated.allowedLinkSchemes`, allowedLinkSchemes);
              }, "run")
            }
          ]);
        }
        this._openers.get(
          "Url"
          /* TerminalBuiltinLinkType.Url */
        )?.open({
          type: "Url",
          text,
          bufferRange: null,
          uri: URI.parse(text)
        });
      }, "activate"),
      hover: /* @__PURE__ */ __name((e, text, range) => {
        activeHoverDisposable?.dispose();
        activeHoverDisposable = void 0;
        activeTooltipScheduler?.dispose();
        activeTooltipScheduler = new RunOnceScheduler(() => {
          const core = this._xterm._core;
          const cellDimensions = {
            width: core._renderService.dimensions.css.cell.width,
            height: core._renderService.dimensions.css.cell.height
          };
          const terminalDimensions = {
            width: this._xterm.cols,
            height: this._xterm.rows
          };
          activeHoverDisposable = this._showHover({
            viewportRange: convertBufferRangeToViewport(range, this._xterm.buffer.active.viewportY),
            cellDimensions,
            terminalDimensions
          }, this._getLinkHoverString(text, text), void 0, (text2) => this._xterm.options.linkHandler?.activate(e, text2, range));
          activeTooltipScheduler?.dispose();
          activeTooltipScheduler = void 0;
        }, this._configurationService.getValue("workbench.hover.delay"));
        activeTooltipScheduler.schedule();
      }, "hover")
    };
  }
  _setupLinkDetector(id, detector, isExternal = false) {
    const detectorAdapter = this.add(this._instantiationService.createInstance(TerminalLinkDetectorAdapter, detector));
    this.add(detectorAdapter.onDidActivateLink((e) => {
      e.event?.preventDefault();
      if (e.event && !(e.event instanceof TerminalLinkQuickPickEvent) && !this._isLinkActivationModifierDown(e.event)) {
        return;
      }
      if (e.link.activate) {
        e.link.activate(e.link.text);
      } else {
        this._openLink(e.link);
      }
    }));
    this.add(detectorAdapter.onDidShowHover((e) => this._tooltipCallback(e.link, e.viewportRange, e.modifierDownCallback, e.modifierUpCallback)));
    if (!isExternal) {
      this._standardLinkProviders.set(id, detectorAdapter);
    }
    return detectorAdapter;
  }
  async _openLink(link) {
    this._logService.debug("Opening link", link);
    const opener = this._openers.get(link.type);
    if (!opener) {
      throw new Error(`No matching opener for link type "${link.type}"`);
    }
    this._telemetryService.publicLog2("terminal/openLink", { linkType: typeof link.type === "string" ? link.type : `extension:${link.type.id}` });
    await opener.open(link);
  }
  async openRecentLink(type) {
    let links;
    let i = this._xterm.buffer.active.length;
    while ((!links || links.length === 0) && i >= this._xterm.buffer.active.viewportY) {
      links = await this._getLinksForType(i, type);
      i--;
    }
    if (!links || links.length < 1) {
      return void 0;
    }
    const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
    links[0].activate(event, links[0].text);
    return links[0];
  }
  async getLinks() {
    const viewportLinksByLinePromises = [];
    for (let i = this._xterm.buffer.active.viewportY + this._xterm.rows - 1; i >= this._xterm.buffer.active.viewportY; i--) {
      viewportLinksByLinePromises.push(this._getLinksForLine(i));
    }
    const viewportLinksByLine = await Promise.all(viewportLinksByLinePromises);
    const viewportLinks = {
      wordLinks: [],
      webLinks: [],
      fileLinks: [],
      folderLinks: []
    };
    for (const links of viewportLinksByLine) {
      if (links) {
        const { wordLinks, webLinks, fileLinks, folderLinks } = links;
        if (wordLinks?.length) {
          viewportLinks.wordLinks.push(...wordLinks.reverse());
        }
        if (webLinks?.length) {
          viewportLinks.webLinks.push(...webLinks.reverse());
        }
        if (fileLinks?.length) {
          viewportLinks.fileLinks.push(...fileLinks.reverse());
        }
        if (folderLinks?.length) {
          viewportLinks.folderLinks.push(...folderLinks.reverse());
        }
      }
    }
    const aboveViewportLinksPromises = [];
    for (let i = this._xterm.buffer.active.viewportY - 1; i >= 0; i--) {
      aboveViewportLinksPromises.push(this._getLinksForLine(i));
    }
    const belowViewportLinksPromises = [];
    for (let i = this._xterm.buffer.active.length - 1; i >= this._xterm.buffer.active.viewportY + this._xterm.rows; i--) {
      belowViewportLinksPromises.push(this._getLinksForLine(i));
    }
    const allLinks = Promise.all(aboveViewportLinksPromises).then(async (aboveViewportLinks) => {
      const belowViewportLinks = await Promise.all(belowViewportLinksPromises);
      const allResults = {
        wordLinks: [...viewportLinks.wordLinks],
        webLinks: [...viewportLinks.webLinks],
        fileLinks: [...viewportLinks.fileLinks],
        folderLinks: [...viewportLinks.folderLinks]
      };
      for (const links of [...belowViewportLinks, ...aboveViewportLinks]) {
        if (links) {
          const { wordLinks, webLinks, fileLinks, folderLinks } = links;
          if (wordLinks?.length) {
            allResults.wordLinks.push(...wordLinks.reverse());
          }
          if (webLinks?.length) {
            allResults.webLinks.push(...webLinks.reverse());
          }
          if (fileLinks?.length) {
            allResults.fileLinks.push(...fileLinks.reverse());
          }
          if (folderLinks?.length) {
            allResults.folderLinks.push(...folderLinks.reverse());
          }
        }
      }
      return allResults;
    });
    return {
      viewport: viewportLinks,
      all: allLinks
    };
  }
  async _getLinksForLine(y) {
    const unfilteredWordLinks = await this._getLinksForType(y, "word");
    const webLinks = await this._getLinksForType(y, "url");
    const fileLinks = await this._getLinksForType(y, "localFile");
    const folderLinks = await this._getLinksForType(y, "localFolder");
    const words = /* @__PURE__ */ new Set();
    let wordLinks;
    if (unfilteredWordLinks) {
      wordLinks = [];
      for (const link of unfilteredWordLinks) {
        if (!words.has(link.text) && link.text.length > 1) {
          wordLinks.push(link);
          words.add(link.text);
        }
      }
    }
    return { wordLinks, webLinks, fileLinks, folderLinks };
  }
  async _getLinksForType(y, type) {
    switch (type) {
      case "word":
        return await new Promise((r) => this._standardLinkProviders.get(TerminalWordLinkDetector.id)?.provideLinks(y, r));
      case "url":
        return await new Promise((r) => this._standardLinkProviders.get(TerminalUriLinkDetector.id)?.provideLinks(y, r));
      case "localFile": {
        const links = await new Promise((r) => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r));
        return links?.filter(
          (link) => link.type === "LocalFile"
          /* TerminalBuiltinLinkType.LocalFile */
        );
      }
      case "localFolder": {
        const links = await new Promise((r) => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r));
        return links?.filter(
          (link) => link.type === "LocalFolderInWorkspace"
          /* TerminalBuiltinLinkType.LocalFolderInWorkspace */
        );
      }
    }
  }
  _tooltipCallback(link, viewportRange, modifierDownCallback, modifierUpCallback) {
    if (!this._widgetManager) {
      return;
    }
    const core = this._xterm._core;
    const cellDimensions = {
      width: core._renderService.dimensions.css.cell.width,
      height: core._renderService.dimensions.css.cell.height
    };
    const terminalDimensions = {
      width: this._xterm.cols,
      height: this._xterm.rows
    };
    this._showHover({
      viewportRange,
      cellDimensions,
      terminalDimensions,
      modifierDownCallback,
      modifierUpCallback
    }, this._getLinkHoverString(link.text, link.label), link.actions, (text) => link.activate(void 0, text), link);
  }
  _showHover(targetOptions, text, actions, linkHandler, link) {
    if (this._widgetManager) {
      const widget = this._instantiationService.createInstance(TerminalHover, targetOptions, text, actions, linkHandler);
      const attached = this._widgetManager.attachWidget(widget);
      if (attached) {
        link?.onInvalidated(() => attached.dispose());
      }
      return attached;
    }
    return void 0;
  }
  setWidgetManager(widgetManager) {
    this._widgetManager = widgetManager;
  }
  _clearLinkProviders() {
    dispose(this._linkProvidersDisposables);
    this._linkProvidersDisposables.length = 0;
  }
  _registerStandardLinkProviders() {
    const proxyLinkProvider = /* @__PURE__ */ __name(async (bufferLineNumber) => {
      return this.externalProvideLinksCb?.(bufferLineNumber);
    }, "proxyLinkProvider");
    const detectorId = `extension-${this._externalLinkProviders.length}`;
    const wrappedLinkProvider = this._setupLinkDetector(detectorId, new TerminalExternalLinkDetector(detectorId, this._xterm, proxyLinkProvider), true);
    this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(wrappedLinkProvider));
    for (const p of this._standardLinkProviders.values()) {
      this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(p));
    }
  }
  _isLinkActivationModifierDown(event) {
    const editorConf = this._configurationService.getValue("editor");
    if (editorConf.multiCursorModifier === "ctrlCmd") {
      return !!event.altKey;
    }
    return isMacintosh ? event.metaKey : event.ctrlKey;
  }
  _getLinkHoverString(uri, label) {
    const editorConf = this._configurationService.getValue("editor");
    let clickLabel = "";
    if (editorConf.multiCursorModifier === "ctrlCmd") {
      if (isMacintosh) {
        clickLabel = nls.localize("terminalLinkHandler.followLinkAlt.mac", "option + click");
      } else {
        clickLabel = nls.localize("terminalLinkHandler.followLinkAlt", "alt + click");
      }
    } else {
      if (isMacintosh) {
        clickLabel = nls.localize("terminalLinkHandler.followLinkCmd", "cmd + click");
      } else {
        clickLabel = nls.localize("terminalLinkHandler.followLinkCtrl", "ctrl + click");
      }
    }
    let fallbackLabel = nls.localize("followLink", "Follow link");
    try {
      if (this._tunnelService.canTunnel(URI.parse(uri))) {
        fallbackLabel = nls.localize("followForwardedLink", "Follow link using forwarded port");
      }
    } catch {
    }
    const markdown = new MarkdownString("", true);
    if (label) {
      label = markdown.appendText(label).value;
      markdown.value = "";
    }
    if (uri) {
      uri = markdown.appendText(uri).value;
      markdown.value = "";
    }
    label = label || fallbackLabel;
    uri = uri || label;
    if (/(\s|&nbsp;)/.test(uri)) {
      uri = nls.localize("followLinkUrl", "Link");
    }
    return markdown.appendLink(uri, label).appendMarkdown(` (${clickLabel})`);
  }
};
TerminalLinkManager = __decorate([
  __param(4, IConfigurationService),
  __param(5, IInstantiationService),
  __param(6, INotificationService),
  __param(7, ITelemetryService),
  __param(8, ITerminalConfigurationService),
  __param(9, ITerminalLogService),
  __param(10, ITunnelService)
], TerminalLinkManager);
export {
  TerminalLinkManager
};
//# sourceMappingURL=terminalLinkManager.js.map
