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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { ExtensionRecommendationNotificationServiceChannel } from "../../../../platform/extensionRecommendations/common/extensionRecommendationsIpc.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor, IEditorPaneRegistry } from "../../../browser/editor.js";
import { IWorkbenchContribution, IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { EditorExtensions, IEditorFactoryRegistry, IEditorSerializer } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import { DebugExtensionHostAction, DebugExtensionsContribution } from "./debugExtensionHostAction.js";
import { ExtensionHostProfileService } from "./extensionProfileService.js";
import { CleanUpExtensionsFolderAction, OpenExtensionsFolderAction } from "./extensionsActions.js";
import { ExtensionsAutoProfiler } from "./extensionsAutoProfiler.js";
import { InstallRemoteExtensionsContribution, RemoteExtensionsInitializerContribution } from "./remoteExtensionsInit.js";
import { IExtensionHostProfileService, OpenExtensionHostProfileACtion, RuntimeExtensionsEditor, SaveExtensionHostProfileAction, StartExtensionHostProfileAction, StopExtensionHostProfileAction } from "./runtimeExtensionsEditor.js";
registerSingleton(IExtensionHostProfileService, ExtensionHostProfileService, InstantiationType.Delayed);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize("runtimeExtension", "Running Extensions")),
  [new SyncDescriptor(RuntimeExtensionsInput)]
);
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
let ExtensionsContributions = class extends Disposable {
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
ExtensionsContributions = __decorateClass([
  __decorateParam(0, IExtensionRecommendationNotificationService),
  __decorateParam(1, ISharedProcessService)
], ExtensionsContributions);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, LifecyclePhase.Restored);
workbenchRegistry.registerWorkbenchContribution(ExtensionsAutoProfiler, LifecyclePhase.Eventually);
workbenchRegistry.registerWorkbenchContribution(RemoteExtensionsInitializerContribution, LifecyclePhase.Restored);
workbenchRegistry.registerWorkbenchContribution(InstallRemoteExtensionsContribution, LifecyclePhase.Restored);
workbenchRegistry.registerWorkbenchContribution(DebugExtensionsContribution, LifecyclePhase.Restored);
registerAction2(DebugExtensionHostAction);
registerAction2(StartExtensionHostProfileAction);
registerAction2(StopExtensionHostProfileAction);
registerAction2(SaveExtensionHostProfileAction);
registerAction2(OpenExtensionHostProfileACtion);
//# sourceMappingURL=extensions.contribution.js.map
