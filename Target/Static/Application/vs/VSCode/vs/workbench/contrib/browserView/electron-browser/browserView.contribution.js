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
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { EditorExtensions } from "../../../common/editor.js";
import { BrowserEditor } from "./browserEditor.js";
import { BrowserEditorInput, BrowserEditorSerializer } from "./browserEditorInput.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Schemas } from "../../../../base/common/network.js";
import { IBrowserViewWorkbenchService } from "../common/browserView.js";
import { BrowserViewWorkbenchService } from "./browserViewWorkbenchService.js";
import { BrowserZoomService, IBrowserZoomService, MATCH_WINDOW_ZOOM_LABEL } from "../common/browserZoomService.js";
import { browserZoomFactors, BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { isLocalhostAuthority } from "../../../../platform/url/common/trustedDomains.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { PolicyCategory } from "../../../../base/common/policy.js";
import { getZoomLevel, onDidChangeZoomLevel } from "../../../../base/browser/browser.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { zoomLevelToZoomFactor } from "../../../../platform/window/common/window.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { logBrowserOpen } from "../../../../platform/browserView/common/browserViewTelemetry.js";
import "./browserViewActions.js";
import "./tools/browserTools.contribution.js";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(BrowserEditor, BrowserEditor.ID, localize("browser.editorLabel", "Browser")), [
  new SyncDescriptor(BrowserEditorInput)
]);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(BrowserEditorInput.ID, BrowserEditorSerializer);
let BrowserEditorResolverContribution = class BrowserEditorResolverContribution2 {
  static {
    __name(this, "BrowserEditorResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.browserEditorResolver";
  }
  constructor(editorResolverService, instantiationService) {
    editorResolverService.registerEditor(`${Schemas.vscodeBrowser}:/**`, {
      id: BrowserEditorInput.ID,
      label: localize("browser.editorLabel", "Browser"),
      priority: RegisteredEditorPriority.exclusive
    }, {
      canSupportResource: /* @__PURE__ */ __name((resource) => resource.scheme === Schemas.vscodeBrowser, "canSupportResource"),
      singlePerResource: true
    }, {
      createEditorInput: /* @__PURE__ */ __name(({ resource, options }) => {
        const parsed = BrowserViewUri.parse(resource);
        if (!parsed) {
          throw new Error(`Invalid browser view resource: ${resource.toString()}`);
        }
        const browserInput = instantiationService.createInstance(BrowserEditorInput, {
          id: parsed.id,
          url: parsed.url
        });
        void browserInput.resolve();
        return {
          editor: browserInput,
          options: {
            ...options,
            pinned: !!parsed.url
            // pin if navigated
          }
        };
      }, "createEditorInput")
    });
  }
};
BrowserEditorResolverContribution = __decorate([
  __param(0, IEditorResolverService),
  __param(1, IInstantiationService)
], BrowserEditorResolverContribution);
registerWorkbenchContribution2(
  BrowserEditorResolverContribution.ID,
  BrowserEditorResolverContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
let LocalhostLinkOpenerContribution = class LocalhostLinkOpenerContribution2 extends Disposable {
  static {
    __name(this, "LocalhostLinkOpenerContribution");
  }
  static {
    this.ID = "workbench.contrib.localhostLinkOpener";
  }
  constructor(openerService, configurationService, editorService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.telemetryService = telemetryService;
    this._register(openerService.registerExternalOpener(this));
  }
  async openExternal(href, _ctx, _token) {
    if (!this.configurationService.getValue("workbench.browser.openLocalhostLinks")) {
      return false;
    }
    try {
      const parsed = new URL(href);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }
      if (!isLocalhostAuthority(parsed.host)) {
        return false;
      }
    } catch {
      return false;
    }
    logBrowserOpen(this.telemetryService, "localhostLinkOpener");
    const browserUri = BrowserViewUri.forUrl(href);
    await this.editorService.openEditor({ resource: browserUri, options: { pinned: true } });
    return true;
  }
};
LocalhostLinkOpenerContribution = __decorate([
  __param(0, IOpenerService),
  __param(1, IConfigurationService),
  __param(2, IEditorService),
  __param(3, ITelemetryService)
], LocalhostLinkOpenerContribution);
registerWorkbenchContribution2(
  LocalhostLinkOpenerContribution.ID,
  LocalhostLinkOpenerContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
let WindowZoomSynchronizer = class WindowZoomSynchronizer2 extends Disposable {
  static {
    __name(this, "WindowZoomSynchronizer");
  }
  static {
    this.ID = "workbench.contrib.browserView.windowZoomSynchronizer";
  }
  constructor(browserZoomService) {
    super();
    browserZoomService.notifyWindowZoomChanged(zoomLevelToZoomFactor(getZoomLevel(mainWindow)));
    this._register(onDidChangeZoomLevel(() => {
      browserZoomService.notifyWindowZoomChanged(zoomLevelToZoomFactor(getZoomLevel(mainWindow)));
    }));
  }
};
WindowZoomSynchronizer = __decorate([
  __param(0, IBrowserZoomService)
], WindowZoomSynchronizer);
registerWorkbenchContribution2(
  WindowZoomSynchronizer.ID,
  WindowZoomSynchronizer,
  4
  /* WorkbenchPhase.Eventually */
);
registerSingleton(
  IBrowserViewWorkbenchService,
  BrowserViewWorkbenchService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IBrowserZoomService,
  BrowserZoomService,
  1
  /* InstantiationType.Delayed */
);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.openLocalhostLinks": {
      type: "boolean",
      default: false,
      markdownDescription: localize({ comment: ["This is the description for a setting."], key: "browser.openLocalhostLinks" }, "When enabled, localhost links from the terminal, chat, and other sources will open in the Integrated Browser instead of the system browser.")
    },
    "workbench.browser.enableChatTools": {
      type: "boolean",
      default: false,
      experiment: { mode: "startup" },
      tags: ["experimental"],
      markdownDescription: localize({ comment: ["This is the description for a setting."], key: "browser.enableChatTools" }, "When enabled, chat agents can use browser tools to open and interact with pages in the Integrated Browser."),
      policy: {
        name: "BrowserChatTools",
        category: PolicyCategory.InteractiveSession,
        minimumVersion: "1.110",
        value: /* @__PURE__ */ __name((policyData) => policyData.chat_preview_features_enabled === false ? false : void 0, "value"),
        localization: {
          description: {
            key: "browser.enableChatTools",
            value: localize("browser.enableChatTools", "When enabled, chat agents can use browser tools to open and interact with pages in the Integrated Browser.")
          }
        }
      }
    },
    "workbench.browser.pageZoom": {
      type: "string",
      enum: [MATCH_WINDOW_ZOOM_LABEL, ...browserZoomFactors.map((f) => `${Math.round(f * 100)}%`)],
      markdownEnumDescriptions: [
        localize({ comment: ["This is the description for a setting enum value."], key: "browser.defaultZoomLevel.matchWindow" }, "Matches the application's current UI zoom level."),
        ...browserZoomFactors.map(() => "")
      ],
      default: MATCH_WINDOW_ZOOM_LABEL,
      markdownDescription: localize({ comment: ["This is the description for a setting."], key: "browser.pageZoom" }, "Default zoom level for all sites in the Integrated Browser."),
      // Zoom can change from machine to machine, so we don't need the workspace-level nor syncing that WINDOW has.
      scope: 2
      /* ConfigurationScope.MACHINE */
    },
    "workbench.browser.dataStorage": {
      type: "string",
      enum: [
        BrowserViewStorageScope.Global,
        BrowserViewStorageScope.Workspace,
        BrowserViewStorageScope.Ephemeral
      ],
      markdownEnumDescriptions: [
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage.global" }, "All browser views share a single persistent session across all workspaces."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage.workspace" }, "Browser views within the same workspace share a persistent session. If no workspace is opened, `ephemeral` storage is used."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage.ephemeral" }, "Each browser view has its own session that is cleaned up when closed.")
      ],
      restricted: true,
      default: BrowserViewStorageScope.Global,
      markdownDescription: localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage" }, "Controls how browser data (cookies, cache, storage) is shared between browser views.\n\n**Note**: In untrusted workspaces, this setting is ignored and `ephemeral` storage is always used."),
      scope: 4,
      order: 100
    }
  }
});
//# sourceMappingURL=browserView.contribution.js.map
