var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyChord } from "../../../../base/common/keyCodes.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { localize, localize2 } from "../../../../nls.js";
import { MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { TextDiffEditor } from "./textDiffEditor.js";
import { ActiveCompareEditorCanSwapContext, TextCompareEditorActiveContext, TextCompareEditorVisibleContext } from "../../../common/contextkeys.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
const TOGGLE_DIFF_SIDE_BY_SIDE = "toggle.diff.renderSideBySide";
const GOTO_NEXT_CHANGE = "workbench.action.compareEditor.nextChange";
const GOTO_PREVIOUS_CHANGE = "workbench.action.compareEditor.previousChange";
const DIFF_FOCUS_PRIMARY_SIDE = "workbench.action.compareEditor.focusPrimarySide";
const DIFF_FOCUS_SECONDARY_SIDE = "workbench.action.compareEditor.focusSecondarySide";
const DIFF_FOCUS_OTHER_SIDE = "workbench.action.compareEditor.focusOtherSide";
const DIFF_OPEN_SIDE = "workbench.action.compareEditor.openSide";
const TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = "toggle.diff.ignoreTrimWhitespace";
const DIFF_SWAP_SIDES = "workbench.action.compareEditor.swapSides";
function registerDiffEditorCommands() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_OPEN_SIDE,
    weight: 200,
    when: EditorContextKeys.inDiffEditor,
    primary: KeyChord(
      2048 | 41,
      1024 | 45
      /* KeyCode.KeyO */
    ),
    handler: /* @__PURE__ */ __name(async (accessor) => {
      const editorService = accessor.get(IEditorService);
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const activeEditor = editorService.activeEditor;
      const activeTextEditorControl = editorService.activeTextEditorControl;
      if (!isDiffEditor(activeTextEditorControl) || !(activeEditor instanceof DiffEditorInput)) {
        return;
      }
      let editor;
      const originalEditor = activeTextEditorControl.getOriginalEditor();
      if (originalEditor.hasTextFocus()) {
        editor = activeEditor.original;
      } else {
        editor = activeEditor.modified;
      }
      return editorGroupsService.activeGroup.openEditor(editor);
    }, "handler")
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: DIFF_OPEN_SIDE,
      title: localize2("compare.openSide", "Open Active Diff Side")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_NEXT_CHANGE,
    weight: 200,
    when: TextCompareEditorVisibleContext,
    primary: 512 | 63,
    handler: /* @__PURE__ */ __name((accessor, ...args) => navigateInDiffEditor(accessor, args, true), "handler")
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_NEXT_CHANGE,
      title: localize2("compare.nextChange", "Go to Next Change")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_PREVIOUS_CHANGE,
    weight: 200,
    when: TextCompareEditorVisibleContext,
    primary: 512 | 1024 | 63,
    handler: /* @__PURE__ */ __name((accessor, ...args) => navigateInDiffEditor(accessor, args, false), "handler")
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_PREVIOUS_CHANGE,
      title: localize2("compare.previousChange", "Go to Previous Change")
    }
  });
  function getActiveTextDiffEditor(accessor, args) {
    const editorService = accessor.get(IEditorService);
    const resource = args.length > 0 && args[0] instanceof URI ? args[0] : void 0;
    for (const editor of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
      if (editor instanceof TextDiffEditor && (!resource || editor.input instanceof DiffEditorInput && isEqual(editor.input.primary.resource, resource))) {
        return editor;
      }
    }
    return void 0;
  }
  __name(getActiveTextDiffEditor, "getActiveTextDiffEditor");
  function navigateInDiffEditor(accessor, args, next) {
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    if (activeTextDiffEditor) {
      activeTextDiffEditor.getControl()?.goToDiff(next ? "next" : "previous");
    }
  }
  __name(navigateInDiffEditor, "navigateInDiffEditor");
  let FocusTextDiffEditorMode;
  (function(FocusTextDiffEditorMode2) {
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Original"] = 0] = "Original";
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Modified"] = 1] = "Modified";
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Toggle"] = 2] = "Toggle";
  })(FocusTextDiffEditorMode || (FocusTextDiffEditorMode = {}));
  function focusInDiffEditor(accessor, args, mode) {
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    if (activeTextDiffEditor) {
      switch (mode) {
        case FocusTextDiffEditorMode.Original:
          activeTextDiffEditor.getControl()?.getOriginalEditor().focus();
          break;
        case FocusTextDiffEditorMode.Modified:
          activeTextDiffEditor.getControl()?.getModifiedEditor().focus();
          break;
        case FocusTextDiffEditorMode.Toggle:
          if (activeTextDiffEditor.getControl()?.getModifiedEditor().hasWidgetFocus()) {
            return focusInDiffEditor(accessor, args, FocusTextDiffEditorMode.Original);
          } else {
            return focusInDiffEditor(accessor, args, FocusTextDiffEditorMode.Modified);
          }
      }
    }
  }
  __name(focusInDiffEditor, "focusInDiffEditor");
  function toggleDiffSideBySide(accessor, args) {
    const configService = accessor.get(ITextResourceConfigurationService);
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    const m = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (!m) {
      return;
    }
    const key = "diffEditor.renderSideBySide";
    const val = configService.getValue(m.uri, key);
    configService.updateValue(m.uri, key, !val);
  }
  __name(toggleDiffSideBySide, "toggleDiffSideBySide");
  function toggleDiffIgnoreTrimWhitespace(accessor, args) {
    const configService = accessor.get(ITextResourceConfigurationService);
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    const m = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (!m) {
      return;
    }
    const key = "diffEditor.ignoreTrimWhitespace";
    const val = configService.getValue(m.uri, key);
    configService.updateValue(m.uri, key, !val);
  }
  __name(toggleDiffIgnoreTrimWhitespace, "toggleDiffIgnoreTrimWhitespace");
  async function swapDiffSides(accessor, args) {
    const editorService = accessor.get(IEditorService);
    const diffEditor = getActiveTextDiffEditor(accessor, args);
    const activeGroup = diffEditor?.group;
    const diffInput = diffEditor?.input;
    if (!diffEditor || typeof activeGroup === "undefined" || !(diffInput instanceof DiffEditorInput) || !diffInput.modified.resource) {
      return;
    }
    const untypedDiffInput = diffInput.toUntyped({ preserveViewState: activeGroup.id, preserveResource: true });
    if (!untypedDiffInput) {
      return;
    }
    if (diffInput.modified.isModified() && editorService.findEditors({ resource: diffInput.modified.resource, typeId: diffInput.modified.typeId, editorId: diffInput.modified.editorId }).length === 0) {
      const editorToOpen = { ...untypedDiffInput.modified };
      if (!editorToOpen.options) {
        editorToOpen.options = {};
      }
      editorToOpen.options.pinned = true;
      editorToOpen.options.inactive = true;
      await editorService.openEditor(editorToOpen, activeGroup);
    }
    await editorService.replaceEditors([
      {
        editor: diffInput,
        replacement: {
          ...untypedDiffInput,
          original: untypedDiffInput.modified,
          modified: untypedDiffInput.original,
          options: {
            ...untypedDiffInput.options,
            pinned: true
          }
        }
      }
    ], activeGroup);
  }
  __name(swapDiffSides, "swapDiffSides");
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_SIDE_BY_SIDE,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => toggleDiffSideBySide(accessor, args), "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_PRIMARY_SIDE,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => focusInDiffEditor(accessor, args, FocusTextDiffEditorMode.Modified), "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_SECONDARY_SIDE,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => focusInDiffEditor(accessor, args, FocusTextDiffEditorMode.Original), "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_OTHER_SIDE,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => focusInDiffEditor(accessor, args, FocusTextDiffEditorMode.Toggle), "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => toggleDiffIgnoreTrimWhitespace(accessor, args), "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_SWAP_SIDES,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => swapDiffSides(accessor, args), "handler")
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: TOGGLE_DIFF_SIDE_BY_SIDE,
      title: localize2("toggleInlineView", "Toggle Inline View"),
      category: localize("compare", "Compare")
    },
    when: TextCompareEditorActiveContext
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: DIFF_SWAP_SIDES,
      title: localize2("swapDiffSides", "Swap Left and Right Editor Side"),
      category: localize("compare", "Compare")
    },
    when: ContextKeyExpr.and(TextCompareEditorActiveContext, ActiveCompareEditorCanSwapContext)
  });
}
__name(registerDiffEditorCommands, "registerDiffEditorCommands");
export {
  DIFF_FOCUS_OTHER_SIDE,
  DIFF_FOCUS_PRIMARY_SIDE,
  DIFF_FOCUS_SECONDARY_SIDE,
  DIFF_OPEN_SIDE,
  DIFF_SWAP_SIDES,
  GOTO_NEXT_CHANGE,
  GOTO_PREVIOUS_CHANGE,
  TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
  TOGGLE_DIFF_SIDE_BY_SIDE,
  registerDiffEditorCommands
};
//# sourceMappingURL=diffEditorCommands.js.map
