var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IResourceEditorInput, IEditorOptions, IResourceEditorInputIdentifier, ITextResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { IEditorPane, GroupIdentifier, IUntitledTextResourceEditorInput, IResourceDiffEditorInput, ITextDiffEditorPane, IEditorIdentifier, ISaveOptions, IRevertOptions, EditorsOrder, IVisibleEditorPane, IEditorCloseEvent, IUntypedEditorInput, IFindEditorOptions, IEditorWillOpenEvent } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { Event } from "../../../../base/common/event.js";
import { IEditor, IDiffEditor } from "../../../../editor/common/editorCommon.js";
import { ICloseEditorOptions, IEditorGroup, IEditorGroupsContainer, isEditorGroup } from "./editorGroupsService.js";
import { URI } from "../../../../base/common/uri.js";
import { IGroupModelChangeEvent } from "../../../common/editor/editorGroupModel.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
const IEditorService = createDecorator("editorService");
const ACTIVE_GROUP = -1;
const SIDE_GROUP = -2;
const AUX_WINDOW_GROUP = -3;
function isPreferredGroup(obj) {
  const candidate = obj;
  return typeof obj === "number" || isEditorGroup(candidate);
}
__name(isPreferredGroup, "isPreferredGroup");
export {
  ACTIVE_GROUP,
  AUX_WINDOW_GROUP,
  IEditorService,
  SIDE_GROUP,
  isPreferredGroup
};
//# sourceMappingURL=editorService.js.map
