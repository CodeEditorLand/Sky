import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { IEditorWorkerService } from "../../common/services/editorWorker.js";
import { registerEditorContribution } from "../editorExtensions.js";
import { EditorWorkerService } from "./editorWorkerService.js";
import { MarkerDecorationsContribution } from "./markerDecorations.js";
registerSingleton(
  IEditorWorkerService,
  EditorWorkerService,
  0
  /* InstantiationType.Eager */
);
registerEditorContribution(
  MarkerDecorationsContribution.ID,
  MarkerDecorationsContribution,
  0
  /* EditorContributionInstantiation.Eager */
);
//# sourceMappingURL=contribution.js.map
