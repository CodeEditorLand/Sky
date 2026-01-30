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
import { BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import "./browserViewActions.js";
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
registerSingleton(
  IBrowserViewWorkbenchService,
  BrowserViewWorkbenchService,
  1
  /* InstantiationType.Delayed */
);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.dataStorage": {
      type: "string",
      enum: [
        BrowserViewStorageScope.Global,
        BrowserViewStorageScope.Workspace,
        BrowserViewStorageScope.Ephemeral
      ],
      markdownEnumDescriptions: [
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage.global" }, "All browser views share a single persistent session across all workspaces."),
        localize({ comment: ["This is the description for a setting. Values surrounded by single quotes are not to be translated."], key: "browser.dataStorage.workspace" }, "Browser views within the same workspace share a persistent session."),
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
