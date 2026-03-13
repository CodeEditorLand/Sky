var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { localize2 } from "../../../../nls.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { resolveCommandsContext } from "../../../browser/parts/editor/editorCommandsContext.js";
import { MultiDiffEditor } from "./multiDiffEditor.js";
import { MultiDiffEditorInput } from "./multiDiffEditorInput.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ActiveEditorContext } from "../../../common/contextkeys.js";
class GoToFileAction extends Action2 {
  static {
    __name(this, "GoToFileAction");
  }
  constructor() {
    super({
      id: "multiDiffEditor.goToFile",
      title: localize2("goToFile", "Open File"),
      icon: Codicon.goToFile,
      precondition: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
      menu: {
        when: ActiveEditorContext.isEqualTo(MultiDiffEditor.ID),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 22,
        group: "navigation"
      }
    });
  }
  async run(accessor, ...args) {
    const uri = args[0];
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    let selections = void 0;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    const editor = activeEditorPane.tryGetCodeEditor(uri);
    if (editor) {
      selections = editor.editor.getSelections() ?? void 0;
    }
    let targetUri = uri;
    const item = activeEditorPane.findDocumentDiffItem(uri);
    if (item && item.goToFileUri) {
      targetUri = item.goToFileUri;
    }
    await editorService.openEditor({
      label: item?.goToFileEditorTitle,
      resource: targetUri,
      options: {
        selection: selections?.[0],
        selectionRevealType: 1
      }
    });
  }
}
class GoToNextChangeAction extends Action2 {
  static {
    __name(this, "GoToNextChangeAction");
  }
  constructor() {
    super({
      id: "multiDiffEditor.goToNextChange",
      title: localize2("goToNextChange", "Go to Next Change"),
      icon: Codicon.arrowDown,
      precondition: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id) => ({
        id,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        group: "navigation",
        order: 2
      })),
      keybinding: {
        primary: 512 | 63,
        weight: 100,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID)
      },
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    activeEditorPane.goToNextChange();
  }
}
class GoToPreviousChangeAction extends Action2 {
  static {
    __name(this, "GoToPreviousChangeAction");
  }
  constructor() {
    super({
      id: "multiDiffEditor.goToPreviousChange",
      title: localize2("goToPreviousChange", "Go to Previous Change"),
      icon: Codicon.arrowUp,
      precondition: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id) => ({
        id,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID),
        group: "navigation",
        order: 1
      })),
      keybinding: {
        primary: 512 | 1024 | 63,
        weight: 100,
        when: ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID)
      },
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (!(activeEditorPane instanceof MultiDiffEditor)) {
      return;
    }
    activeEditorPane.goToPreviousChange();
  }
}
class CollapseAllAction extends Action2 {
  static {
    __name(this, "CollapseAllAction");
  }
  constructor() {
    super({
      id: "multiDiffEditor.collapseAll",
      title: localize2("collapseAllDiffs", "Collapse All Diffs"),
      icon: Codicon.collapseAll,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed")),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id) => ({
        id,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.not("multiDiffEditorAllCollapsed")),
        group: "navigation",
        order: 100
      })),
      f1: true
    });
  }
  async run(accessor, ...args) {
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.collapseAll();
    }
  }
}
class ExpandAllAction extends Action2 {
  static {
    __name(this, "ExpandAllAction");
  }
  constructor() {
    super({
      id: "multiDiffEditor.expandAll",
      title: localize2("ExpandAllDiffs", "Expand All Diffs"),
      icon: Codicon.expandAll,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed")),
      menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id) => ({
        id,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", MultiDiffEditor.ID), ContextKeyExpr.has("multiDiffEditorAllCollapsed")),
        group: "navigation",
        order: 100
      })),
      f1: true
    });
  }
  async run(accessor, ...args) {
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (editor instanceof MultiDiffEditorInput) {
      const viewModel = await editor.getViewModel();
      viewModel.expandAll();
    }
  }
}
export {
  CollapseAllAction,
  ExpandAllAction,
  GoToFileAction,
  GoToNextChangeAction,
  GoToPreviousChangeAction
};
//# sourceMappingURL=actions.js.map
