var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { isEditorInput } from "vs/workbench/common/editor.js";
import {
  findGroup,
  isPreferredGroup
} from "vs/workbench/services/editor/common/editorGroupFinder.js";
const Definition = Effect.gen(function* (_) {
  const InstantiationService = yield* _(Instantiation.Tag);
  const EditorGroupsService = yield* _(EditorGroups.Tag);
  const TextEditorService = yield* _(TextEditor.Tag);
  const CreateOpenEditorEffect = /* @__PURE__ */ __name((Editor, Options, Group) => Effect.gen(function* (_2) {
    const TypedEditor = isEditorInput(Editor) ? Editor : yield* _2(
      Effect.promise(() => TextEditorService.resolve(Editor))
    );
    const [TargetGroup, Activation] = InstantiationService.invokeFunction(
      findGroup,
      { editor: TypedEditor, options: Options },
      Group
    );
    const FinalOptions = { ...Options, activation: Activation };
    return yield* _2(
      Effect.promise(
        () => TargetGroup.openEditor(TypedEditor, FinalOptions)
      )
    );
  }), "CreateOpenEditorEffect");
  const Service = {
    _serviceBrand: void 0,
    openEditor: /* @__PURE__ */ __name((editor, optionsOrGroup, group) => {
      const options = !isPreferredGroup(optionsOrGroup) ? optionsOrGroup : void 0;
      const targetGroup = isPreferredGroup(optionsOrGroup) ? optionsOrGroup : group;
      return Effect.runPromise(
        CreateOpenEditorEffect(editor, options, targetGroup)
      );
    }, "openEditor"),
    // --- Stubs for other methods and events ---
    // A full implementation would involve more complex orchestration Effects.
    openEditors: /* @__PURE__ */ __name(() => Promise.resolve([]), "openEditors"),
    replaceEditors: /* @__PURE__ */ __name(() => Promise.resolve(), "replaceEditors"),
    save: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "save"),
    saveAll: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "saveAll"),
    revert: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "revert"),
    revertAll: /* @__PURE__ */ __name(() => Promise.resolve({ success: true, editors: [] }), "revertAll"),
    activeEditorPane: void 0,
    activeEditor: void 0,
    count: 0,
    visibleEditorPanes: [],
    visibleEditors: [],
    onDidActiveEditorChange: new Emitter().event,
    onDidVisibleEditorsChange: new Emitter().event,
    onDidCloseEditor: new Emitter().event,
    onDidOpenEditorFail: new Emitter().event,
    onDidMostRecentlyActiveEditorsChange: new Emitter().event
  };
  return Service;
});
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
