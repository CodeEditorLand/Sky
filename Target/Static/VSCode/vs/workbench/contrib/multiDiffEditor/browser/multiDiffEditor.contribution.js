import { localize } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor, IEditorPaneRegistry } from "../../../browser/editor.js";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions, IEditorFactoryRegistry } from "../../../common/editor.js";
import { MultiDiffEditor } from "./multiDiffEditor.js";
import { MultiDiffEditorInput, MultiDiffEditorResolverContribution, MultiDiffEditorSerializer } from "./multiDiffEditorInput.js";
import { CollapseAllAction, ExpandAllAction, GoToFileAction } from "./actions.js";
import { IMultiDiffSourceResolverService, MultiDiffSourceResolverService } from "./multiDiffSourceResolverService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { OpenScmGroupAction, ScmMultiDiffSourceResolverContribution } from "./scmMultiDiffSourceResolver.js";
registerAction2(GoToFileAction);
registerAction2(CollapseAllAction);
registerAction2(ExpandAllAction);
Registry.as(Extensions.Configuration).registerConfiguration({
  properties: {
    "multiDiffEditor.experimental.enabled": {
      type: "boolean",
      default: true,
      description: "Enable experimental multi diff editor."
    }
  }
});
registerSingleton(IMultiDiffSourceResolverService, MultiDiffSourceResolverService, InstantiationType.Delayed);
registerWorkbenchContribution2(
  MultiDiffEditorResolverContribution.ID,
  MultiDiffEditorResolverContribution,
  WorkbenchPhase.BlockStartup
  /* only registering an editor resolver */
);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(MultiDiffEditor, MultiDiffEditor.ID, localize("name", "Multi Diff Editor")),
  [new SyncDescriptor(MultiDiffEditorInput)]
);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(MultiDiffEditorInput.ID, MultiDiffEditorSerializer);
registerAction2(OpenScmGroupAction);
registerWorkbenchContribution2(
  ScmMultiDiffSourceResolverContribution.ID,
  ScmMultiDiffSourceResolverContribution,
  WorkbenchPhase.BlockStartup
  /* only registering an editor resolver  */
);
//# sourceMappingURL=multiDiffEditor.contribution.js.map
