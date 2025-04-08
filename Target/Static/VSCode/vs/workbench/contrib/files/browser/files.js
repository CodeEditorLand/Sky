var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { OpenEditor, ISortOrderConfiguration } from "../common/files.js";
import { EditorResourceAccessor, SideBySideEditor, IEditorIdentifier } from "../../../common/editor.js";
import { List } from "../../../../base/browser/ui/list/listWidget.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ExplorerItem } from "../common/explorerModel.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { AsyncDataTree } from "../../../../base/browser/ui/tree/asyncDataTree.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditableData } from "../../../common/views.js";
import { createDecorator, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ResourceFileEdit } from "../../../../editor/browser/services/bulkEditService.js";
import { ProgressLocation } from "../../../../platform/progress/common/progress.js";
import { isActiveElement } from "../../../../base/browser/dom.js";
const IExplorerService = createDecorator("explorerService");
function getFocus(listService) {
  const list = listService.lastFocusedList;
  const element = list?.getHTMLElement();
  if (element && isActiveElement(element)) {
    let focus;
    if (list instanceof List) {
      const focused = list.getFocusedElements();
      if (focused.length) {
        focus = focused[0];
      }
    } else if (list instanceof AsyncDataTree) {
      const focused = list.getFocus();
      if (focused.length) {
        focus = focused[0];
      }
    }
    return focus;
  }
  return void 0;
}
__name(getFocus, "getFocus");
function getResourceForCommand(commandArg, editorService, listService) {
  if (URI.isUri(commandArg)) {
    return commandArg;
  }
  const focus = getFocus(listService);
  if (focus instanceof ExplorerItem) {
    return focus.resource;
  } else if (focus instanceof OpenEditor) {
    return focus.getResource();
  }
  return EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
}
__name(getResourceForCommand, "getResourceForCommand");
function getMultiSelectedResources(commandArg, listService, editorSerice, editorGroupService, explorerService) {
  const list = listService.lastFocusedList;
  const element = list?.getHTMLElement();
  if (element && isActiveElement(element)) {
    if (list instanceof AsyncDataTree && list.getFocus().every((item) => item instanceof ExplorerItem)) {
      const context = explorerService.getContext(true, true);
      if (context.length) {
        return context.map((c) => c.resource);
      }
    }
    if (list instanceof List) {
      const selection2 = coalesce(list.getSelectedElements().filter((s) => s instanceof OpenEditor).map((oe) => oe.getResource()));
      const focusedElements = list.getFocusedElements();
      const focus = focusedElements.length ? focusedElements[0] : void 0;
      let mainUriStr = void 0;
      if (URI.isUri(commandArg)) {
        mainUriStr = commandArg.toString();
      } else if (focus instanceof OpenEditor) {
        const focusedResource = focus.getResource();
        mainUriStr = focusedResource ? focusedResource.toString() : void 0;
      }
      const mainIndex = selection2.findIndex((s) => s.toString() === mainUriStr);
      if (mainIndex !== -1) {
        const mainResource = selection2[mainIndex];
        selection2.splice(mainIndex, 1);
        selection2.unshift(mainResource);
        return selection2;
      }
    }
  }
  const activeGroup = editorGroupService.activeGroup;
  const selection = activeGroup.selectedEditors;
  if (selection.length > 1 && URI.isUri(commandArg)) {
    const mainEditorSelectionIndex = selection.findIndex((e) => e.matches({ resource: commandArg }));
    if (mainEditorSelectionIndex !== -1) {
      const mainEditor = selection[mainEditorSelectionIndex];
      selection.splice(mainEditorSelectionIndex, 1);
      selection.unshift(mainEditor);
      return selection.map((editor) => EditorResourceAccessor.getOriginalUri(editor)).filter((uri) => !!uri);
    }
  }
  const result = getResourceForCommand(commandArg, editorSerice, listService);
  return !!result ? [result] : [];
}
__name(getMultiSelectedResources, "getMultiSelectedResources");
function getOpenEditorsViewMultiSelection(accessor) {
  const list = accessor.get(IListService).lastFocusedList;
  const element = list?.getHTMLElement();
  if (element && isActiveElement(element)) {
    if (list instanceof List) {
      const selection = coalesce(list.getSelectedElements().filter((s) => s instanceof OpenEditor));
      const focusedElements = list.getFocusedElements();
      const focus = focusedElements.length ? focusedElements[0] : void 0;
      let mainEditor = void 0;
      if (focus instanceof OpenEditor) {
        mainEditor = focus;
      }
      if (selection.some((s) => s === mainEditor)) {
        return selection;
      }
      return mainEditor ? [mainEditor] : void 0;
    }
  }
  return void 0;
}
__name(getOpenEditorsViewMultiSelection, "getOpenEditorsViewMultiSelection");
export {
  IExplorerService,
  getMultiSelectedResources,
  getOpenEditorsViewMultiSelection,
  getResourceForCommand
};
//# sourceMappingURL=files.js.map
