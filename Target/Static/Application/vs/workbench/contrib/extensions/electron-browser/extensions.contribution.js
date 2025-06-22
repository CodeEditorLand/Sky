var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { ExtensionRecommendationNotificationServiceChannel } from "../../../../platform/extensionRecommendations/common/extensionRecommendationsIpc.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-browser/services.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import { DebugExtensionHostAction, DebugExtensionsContribution } from "./debugExtensionHostAction.js";
import { ExtensionHostProfileService } from "./extensionProfileService.js";
import { CleanUpExtensionsFolderAction, OpenExtensionsFolderAction } from "./extensionsActions.js";
import { ExtensionsAutoProfiler } from "./extensionsAutoProfiler.js";
import { InstallRemoteExtensionsContribution, RemoteExtensionsInitializerContribution } from "./remoteExtensionsInit.js";
import { IExtensionHostProfileService, OpenExtensionHostProfileACtion, RuntimeExtensionsEditor, SaveExtensionHostProfileAction, StartExtensionHostProfileAction, StopExtensionHostProfileAction } from "./runtimeExtensionsEditor.js";
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
registerSingleton(
  IExtensionHostProfileService,
  ExtensionHostProfileService,
  1
  /* InstantiationType.Delayed */
);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize("runtimeExtension", "Running Extensions")), [new SyncDescriptor(RuntimeExtensionsInput)]);
class RuntimeExtensionsInputSerializer {
  static {
    __name(this, "RuntimeExtensionsInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return RuntimeExtensionsInput.instance;
  }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);
let ExtensionsContributions = class ExtensionsContributions2 extends Disposable {
  static {
    __name(this, "ExtensionsContributions");
  }
  constructor(extensionRecommendationNotificationService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel("extensionRecommendationNotification", new ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
    this._register(registerAction2(OpenExtensionsFolderAction));
    this._register(registerAction2(CleanUpExtensionsFolderAction));
  }
};
ExtensionsContributions = __decorate([
  __param(0, IExtensionRecommendationNotificationService),
  __param(1, ISharedProcessService)
], ExtensionsContributions);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsContributions,
  3
  /* LifecyclePhase.Restored */
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsAutoProfiler,
  4
  /* LifecyclePhase.Eventually */
);
workbenchRegistry.registerWorkbenchContribution(
  RemoteExtensionsInitializerContribution,
  3
  /* LifecyclePhase.Restored */
);
workbenchRegistry.registerWorkbenchContribution(
  InstallRemoteExtensionsContribution,
  3
  /* LifecyclePhase.Restored */
);
workbenchRegistry.registerWorkbenchContribution(
  DebugExtensionsContribution,
  3
  /* LifecyclePhase.Restored */
);
registerAction2(DebugExtensionHostAction);
registerAction2(StartExtensionHostProfileAction);
registerAction2(StopExtensionHostProfileAction);
registerAction2(SaveExtensionHostProfileAction);
registerAction2(OpenExtensionHostProfileACtion);
//# sourceMappingURL=extensions.contribution.js.map
