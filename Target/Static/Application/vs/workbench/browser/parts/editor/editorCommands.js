var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyChord } from "../../../../base/common/keyCodes.js";
import { Schemas, matchesScheme } from "../../../../base/common/network.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { isNumber, isObject, isString, isUndefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorResolution } from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess } from "./editorQuickAccess.js";
import { SideBySideEditor } from "./sideBySideEditor.js";
import { TextDiffEditor } from "./textDiffEditor.js";
import { ActiveEditorCanSplitInGroupContext, ActiveEditorGroupEmptyContext, ActiveEditorGroupLockedContext, ActiveEditorStickyContext, MultipleEditorGroupsContext, SideBySideEditorActiveContext, TextCompareEditorActiveContext } from "../../../common/contextkeys.js";
import { isEditorInputWithOptionsAndGroup } from "../../../common/editor.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import { columnToEditorGroup } from "../../../services/editor/common/editorGroupColumn.js";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorResolverService } from "../../../services/editor/common/editorResolverService.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { IUntitledTextEditorService } from "../../../services/untitled/common/untitledTextEditorService.js";
import { DIFF_FOCUS_OTHER_SIDE, DIFF_FOCUS_PRIMARY_SIDE, DIFF_FOCUS_SECONDARY_SIDE, registerDiffEditorCommands } from "./diffEditorCommands.js";
import { resolveCommandsContext } from "./editorCommandsContext.js";
import { prepareMoveCopyEditors } from "./editor.js";
const CLOSE_SAVED_EDITORS_COMMAND_ID = "workbench.action.closeUnmodifiedEditors";
const CLOSE_EDITORS_IN_GROUP_COMMAND_ID = "workbench.action.closeEditorsInGroup";
const CLOSE_EDITORS_AND_GROUP_COMMAND_ID = "workbench.action.closeEditorsAndGroup";
const CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = "workbench.action.closeEditorsToTheRight";
const CLOSE_EDITOR_COMMAND_ID = "workbench.action.closeActiveEditor";
const CLOSE_PINNED_EDITOR_COMMAND_ID = "workbench.action.closeActivePinnedEditor";
const CLOSE_EDITOR_GROUP_COMMAND_ID = "workbench.action.closeGroup";
const CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = "workbench.action.closeOtherEditors";
const MOVE_ACTIVE_EDITOR_COMMAND_ID = "moveActiveEditor";
const COPY_ACTIVE_EDITOR_COMMAND_ID = "copyActiveEditor";
const LAYOUT_EDITOR_GROUPS_COMMAND_ID = "layoutEditorGroups";
const KEEP_EDITOR_COMMAND_ID = "workbench.action.keepEditor";
const TOGGLE_KEEP_EDITORS_COMMAND_ID = "workbench.action.toggleKeepEditors";
const TOGGLE_LOCK_GROUP_COMMAND_ID = "workbench.action.toggleEditorGroupLock";
const LOCK_GROUP_COMMAND_ID = "workbench.action.lockEditorGroup";
const UNLOCK_GROUP_COMMAND_ID = "workbench.action.unlockEditorGroup";
const SHOW_EDITORS_IN_GROUP = "workbench.action.showEditorsInGroup";
const REOPEN_WITH_COMMAND_ID = "workbench.action.reopenWithEditor";
const REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID = "reopenActiveEditorWith";
const PIN_EDITOR_COMMAND_ID = "workbench.action.pinEditor";
const UNPIN_EDITOR_COMMAND_ID = "workbench.action.unpinEditor";
const SPLIT_EDITOR = "workbench.action.splitEditor";
const SPLIT_EDITOR_UP = "workbench.action.splitEditorUp";
const SPLIT_EDITOR_DOWN = "workbench.action.splitEditorDown";
const SPLIT_EDITOR_LEFT = "workbench.action.splitEditorLeft";
const SPLIT_EDITOR_RIGHT = "workbench.action.splitEditorRight";
const MOVE_EDITOR_INTO_ABOVE_GROUP = "workbench.action.moveEditorToAboveGroup";
const MOVE_EDITOR_INTO_BELOW_GROUP = "workbench.action.moveEditorToBelowGroup";
const MOVE_EDITOR_INTO_LEFT_GROUP = "workbench.action.moveEditorToLeftGroup";
const MOVE_EDITOR_INTO_RIGHT_GROUP = "workbench.action.moveEditorToRightGroup";
const TOGGLE_MAXIMIZE_EDITOR_GROUP = "workbench.action.toggleMaximizeEditorGroup";
const SPLIT_EDITOR_IN_GROUP = "workbench.action.splitEditorInGroup";
const TOGGLE_SPLIT_EDITOR_IN_GROUP = "workbench.action.toggleSplitEditorInGroup";
const JOIN_EDITOR_IN_GROUP = "workbench.action.joinEditorInGroup";
const TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = "workbench.action.toggleSplitEditorInGroupLayout";
const FOCUS_FIRST_SIDE_EDITOR = "workbench.action.focusFirstSideEditor";
const FOCUS_SECOND_SIDE_EDITOR = "workbench.action.focusSecondSideEditor";
const FOCUS_OTHER_SIDE_EDITOR = "workbench.action.focusOtherSideEditor";
const FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusLeftGroupWithoutWrap";
const FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusRightGroupWithoutWrap";
const FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusAboveGroupWithoutWrap";
const FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = "workbench.action.focusBelowGroupWithoutWrap";
const OPEN_EDITOR_AT_INDEX_COMMAND_ID = "workbench.action.openEditorAtIndex";
const MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.moveEditorToNewWindow";
const COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.copyEditorToNewWindow";
const MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.moveEditorGroupToNewWindow";
const COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID = "workbench.action.copyEditorGroupToNewWindow";
const NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID = "workbench.action.newEmptyEditorWindow";
const API_OPEN_EDITOR_COMMAND_ID = "_workbench.open";
const API_OPEN_DIFF_EDITOR_COMMAND_ID = "_workbench.diff";
const API_OPEN_WITH_EDITOR_COMMAND_ID = "_workbench.openWith";
const EDITOR_CORE_NAVIGATION_COMMANDS = [
  SPLIT_EDITOR,
  CLOSE_EDITOR_COMMAND_ID,
  UNPIN_EDITOR_COMMAND_ID,
  UNLOCK_GROUP_COMMAND_ID,
  TOGGLE_MAXIMIZE_EDITOR_GROUP
];
const isSelectedEditorsMoveCopyArg = /* @__PURE__ */ __name(function(arg) {
  if (!isObject(arg)) {
    return false;
  }
  if (!isString(arg.to)) {
    return false;
  }
  if (!isUndefined(arg.by) && !isString(arg.by)) {
    return false;
  }
  if (!isUndefined(arg.value) && !isNumber(arg.value)) {
    return false;
  }
  return true;
}, "isSelectedEditorsMoveCopyArg");
function registerEditorMoveCopyCommand() {
  const moveCopyJSONSchema = {
    "type": "object",
    "required": ["to"],
    "properties": {
      "to": {
        "type": "string",
        "enum": ["left", "right"]
      },
      "by": {
        "type": "string",
        "enum": ["tab", "group"]
      },
      "value": {
        "type": "number"
      }
    }
  };
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: MOVE_ACTIVE_EDITOR_COMMAND_ID,
    weight: 200,
    when: EditorContextKeys.editorTextFocus,
    primary: 0,
    handler: /* @__PURE__ */ __name((accessor, args) => moveCopySelectedEditors(true, args, accessor), "handler"),
    metadata: {
      description: localize("editorCommand.activeEditorMove.description", "Move the active editor by tabs or groups"),
      args: [
        {
          name: localize("editorCommand.activeEditorMove.arg.name", "Active editor move argument"),
          description: localize("editorCommand.activeEditorMove.arg.description", "Argument Properties:\n	* 'to': String value providing where to move.\n	* 'by': String value providing the unit for move (by tab or by group).\n	* 'value': Number value providing how many positions or an absolute position to move."),
          constraint: isSelectedEditorsMoveCopyArg,
          schema: moveCopyJSONSchema
        }
      ]
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: COPY_ACTIVE_EDITOR_COMMAND_ID,
    weight: 200,
    when: EditorContextKeys.editorTextFocus,
    primary: 0,
    handler: /* @__PURE__ */ __name((accessor, args) => moveCopySelectedEditors(false, args, accessor), "handler"),
    metadata: {
      description: localize("editorCommand.activeEditorCopy.description", "Copy the active editor by groups"),
      args: [
        {
          name: localize("editorCommand.activeEditorCopy.arg.name", "Active editor copy argument"),
          description: localize("editorCommand.activeEditorCopy.arg.description", "Argument Properties:\n	* 'to': String value providing where to copy.\n	* 'value': Number value providing how many positions or an absolute position to copy."),
          constraint: isSelectedEditorsMoveCopyArg,
          schema: moveCopyJSONSchema
        }
      ]
    }
  });
  [
    { id: MOVE_EDITOR_INTO_ABOVE_GROUP, to: "up" },
    { id: MOVE_EDITOR_INTO_BELOW_GROUP, to: "down" },
    { id: MOVE_EDITOR_INTO_LEFT_GROUP, to: "left" },
    { id: MOVE_EDITOR_INTO_RIGHT_GROUP, to: "right" }
  ].forEach(({ id, to }) => {
    CommandsRegistry.registerCommand(id, function(accessor, ...args) {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (resolvedContext.groupedEditors.length) {
        moveCopyEditorsToGroup(true, { to, by: "group" }, resolvedContext.groupedEditors[0].group, resolvedContext.groupedEditors[0].editors, accessor);
      }
    });
  });
  function moveCopySelectedEditors(isMove, args = /* @__PURE__ */ Object.create(null), accessor) {
    args.to = args.to || "right";
    args.by = args.by || "tab";
    args.value = typeof args.value === "number" ? args.value : 1;
    const activeGroup = accessor.get(IEditorGroupsService).activeGroup;
    const selectedEditors = activeGroup.selectedEditors;
    if (selectedEditors.length > 0) {
      switch (args.by) {
        case "tab":
          if (isMove) {
            return moveTabs(args, activeGroup, selectedEditors);
          }
          break;
        case "group":
          return moveCopyEditorsToGroup(isMove, args, activeGroup, selectedEditors, accessor);
      }
    }
  }
  __name(moveCopySelectedEditors, "moveCopySelectedEditors");
  function moveTabs(args, group, editors) {
    const to = args.to;
    if (to === "first" || to === "right") {
      editors = [...editors].reverse();
    } else if (to === "position" && (args.value ?? 1) < group.getIndexOfEditor(editors[0])) {
      editors = [...editors].reverse();
    }
    for (const editor of editors) {
      moveTab(args, group, editor);
    }
  }
  __name(moveTabs, "moveTabs");
  function moveTab(args, group, editor) {
    let index = group.getIndexOfEditor(editor);
    switch (args.to) {
      case "first":
        index = 0;
        break;
      case "last":
        index = group.count - 1;
        break;
      case "left":
        index = index - (args.value ?? 1);
        break;
      case "right":
        index = index + (args.value ?? 1);
        break;
      case "center":
        index = Math.round(group.count / 2) - 1;
        break;
      case "position":
        index = (args.value ?? 1) - 1;
        break;
    }
    index = index < 0 ? 0 : index >= group.count ? group.count - 1 : index;
    group.moveEditor(editor, group, { index });
  }
  __name(moveTab, "moveTab");
  function moveCopyEditorsToGroup(isMove, args, sourceGroup, editors, accessor) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    let targetGroup;
    switch (args.to) {
      case "left":
        targetGroup = editorGroupsService.findGroup({
          direction: 2
          /* GroupDirection.LEFT */
        }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(
            sourceGroup,
            2
            /* GroupDirection.LEFT */
          );
        }
        break;
      case "right":
        targetGroup = editorGroupsService.findGroup({
          direction: 3
          /* GroupDirection.RIGHT */
        }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(
            sourceGroup,
            3
            /* GroupDirection.RIGHT */
          );
        }
        break;
      case "up":
        targetGroup = editorGroupsService.findGroup({
          direction: 0
          /* GroupDirection.UP */
        }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(
            sourceGroup,
            0
            /* GroupDirection.UP */
          );
        }
        break;
      case "down":
        targetGroup = editorGroupsService.findGroup({
          direction: 1
          /* GroupDirection.DOWN */
        }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(
            sourceGroup,
            1
            /* GroupDirection.DOWN */
          );
        }
        break;
      case "first":
        targetGroup = editorGroupsService.findGroup({
          location: 0
          /* GroupLocation.FIRST */
        }, sourceGroup);
        break;
      case "last":
        targetGroup = editorGroupsService.findGroup({
          location: 1
          /* GroupLocation.LAST */
        }, sourceGroup);
        break;
      case "previous":
        targetGroup = editorGroupsService.findGroup({
          location: 3
          /* GroupLocation.PREVIOUS */
        }, sourceGroup);
        if (!targetGroup) {
          const oppositeDirection = preferredSideBySideGroupDirection(configurationService) === 3 ? 2 : 0;
          targetGroup = editorGroupsService.addGroup(sourceGroup, oppositeDirection);
        }
        break;
      case "next":
        targetGroup = editorGroupsService.findGroup({
          location: 2
          /* GroupLocation.NEXT */
        }, sourceGroup);
        if (!targetGroup) {
          targetGroup = editorGroupsService.addGroup(sourceGroup, preferredSideBySideGroupDirection(configurationService));
        }
        break;
      case "center":
        targetGroup = editorGroupsService.getGroups(
          2
          /* GroupsOrder.GRID_APPEARANCE */
        )[editorGroupsService.count / 2 - 1];
        break;
      case "position":
        targetGroup = editorGroupsService.getGroups(
          2
          /* GroupsOrder.GRID_APPEARANCE */
        )[(args.value ?? 1) - 1];
        break;
    }
    if (targetGroup) {
      const editorsWithOptions = prepareMoveCopyEditors(sourceGroup, editors);
      if (isMove) {
        sourceGroup.moveEditors(editorsWithOptions, targetGroup);
      } else if (sourceGroup.id !== targetGroup.id) {
        sourceGroup.copyEditors(editorsWithOptions, targetGroup);
      }
      targetGroup.focus();
    }
  }
  __name(moveCopyEditorsToGroup, "moveCopyEditorsToGroup");
}
__name(registerEditorMoveCopyCommand, "registerEditorMoveCopyCommand");
function registerEditorGroupsLayoutCommands() {
  function applyEditorLayout(accessor, layout) {
    if (!layout || typeof layout !== "object") {
      return;
    }
    const editorGroupsService = accessor.get(IEditorGroupsService);
    editorGroupsService.applyLayout(layout);
  }
  __name(applyEditorLayout, "applyEditorLayout");
  CommandsRegistry.registerCommand(LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args) => {
    applyEditorLayout(accessor, args);
  });
  CommandsRegistry.registerCommand({
    id: "vscode.setEditorLayout",
    handler: /* @__PURE__ */ __name((accessor, args) => applyEditorLayout(accessor, args), "handler"),
    metadata: {
      "description": `Set the editor layout. Editor layout is represented as a tree of groups in which the first group is the root group of the layout.
					The orientation of the first group is 0 (horizontal) by default unless specified otherwise. The other orientations are 1 (vertical).
					The orientation of subsequent groups is the opposite of the orientation of the group that contains it.
					Here are some examples: A layout representing 1 row and 2 columns: { orientation: 0, groups: [{}, {}] }.
					A layout representing 3 rows and 1 column: { orientation: 1, groups: [{}, {}, {}] }.
					A layout representing 3 rows and 1 column in which the second row has 2 columns: { orientation: 1, groups: [{}, { groups: [{}, {}] }, {}] }
					`,
      args: [{
        name: "args",
        schema: {
          "type": "object",
          "required": ["groups"],
          "properties": {
            "orientation": {
              "type": "number",
              "default": 0,
              "description": `The orientation of the root group in the layout. 0 for horizontal, 1 for vertical.`,
              "enum": [0, 1],
              "enumDescriptions": [
                localize("editorGroupLayout.horizontal", "Horizontal"),
                localize("editorGroupLayout.vertical", "Vertical")
              ]
            },
            "groups": {
              "$ref": "#/definitions/editorGroupsSchema",
              "default": [{}, {}]
            }
          }
        }
      }]
    }
  });
  CommandsRegistry.registerCommand({
    id: "vscode.getEditorLayout",
    handler: /* @__PURE__ */ __name((accessor) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      return editorGroupsService.getLayout();
    }, "handler"),
    metadata: {
      description: "Get Editor Layout",
      args: [],
      returns: "An editor layout object, in the same format as vscode.setEditorLayout"
    }
  });
}
__name(registerEditorGroupsLayoutCommands, "registerEditorGroupsLayoutCommands");
function registerOpenEditorAPICommands() {
  function mixinContext(context, options, column) {
    if (!context) {
      return [options, column];
    }
    return [
      { ...context.editorOptions, ...options ?? /* @__PURE__ */ Object.create(null) },
      context.sideBySide ? SIDE_GROUP : column
    ];
  }
  __name(mixinContext, "mixinContext");
  CommandsRegistry.registerCommand({
    id: "vscode.open",
    handler: /* @__PURE__ */ __name((accessor, arg) => {
      accessor.get(ICommandService).executeCommand(API_OPEN_EDITOR_COMMAND_ID, arg);
    }, "handler"),
    metadata: {
      description: "Opens the provided resource in the editor.",
      args: [{ name: "Uri" }]
    }
  });
  CommandsRegistry.registerCommand(API_OPEN_EDITOR_COMMAND_ID, async function(accessor, resourceArg, columnAndOptions, label, context) {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const openerService = accessor.get(IOpenerService);
    const pathService = accessor.get(IPathService);
    const configurationService = accessor.get(IConfigurationService);
    const untitledTextEditorService = accessor.get(IUntitledTextEditorService);
    const resourceOrString = typeof resourceArg === "string" ? resourceArg : URI.from(resourceArg, true);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    if (optionsArg || typeof columnArg === "number" || matchesScheme(resourceOrString, Schemas.untitled)) {
      const [options, column] = mixinContext(context, optionsArg, columnArg);
      const resource = URI.isUri(resourceOrString) ? resourceOrString : URI.parse(resourceOrString);
      let input;
      if (untitledTextEditorService.isUntitledWithAssociatedResource(resource)) {
        input = { resource: resource.with({ scheme: pathService.defaultUriScheme }), forceUntitled: true, options, label };
      } else {
        input = { resource, options, label };
      }
      await editorService.openEditor(input, columnToEditorGroup(editorGroupsService, configurationService, column));
    } else if (matchesScheme(resourceOrString, Schemas.command)) {
      return;
    } else {
      await openerService.open(resourceOrString, { openToSide: context?.sideBySide, editorOptions: context?.editorOptions });
    }
  });
  CommandsRegistry.registerCommand({
    id: "vscode.diff",
    handler: /* @__PURE__ */ __name((accessor, left, right, label) => {
      accessor.get(ICommandService).executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, left, right, label);
    }, "handler"),
    metadata: {
      description: "Opens the provided resources in the diff editor to compare their contents.",
      args: [
        { name: "left", description: "Left-hand side resource of the diff editor" },
        { name: "right", description: "Right-hand side resource of the diff editor" },
        { name: "title", description: "Human readable title for the diff editor" }
      ]
    }
  });
  CommandsRegistry.registerCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, async function(accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context) {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    const [options, column] = mixinContext(context, optionsArg, columnArg);
    let label = void 0;
    let description = void 0;
    if (typeof labelAndOrDescription === "string") {
      label = labelAndOrDescription;
    } else if (labelAndOrDescription) {
      label = labelAndOrDescription.label;
      description = labelAndOrDescription.description;
    }
    await editorService.openEditor({
      original: { resource: URI.from(originalResource, true) },
      modified: { resource: URI.from(modifiedResource, true) },
      label,
      description,
      options
    }, columnToEditorGroup(editorGroupsService, configurationService, column));
  });
  CommandsRegistry.registerCommand(API_OPEN_WITH_EDITOR_COMMAND_ID, async (accessor, resource, id, columnAndOptions) => {
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const configurationService = accessor.get(IConfigurationService);
    const [columnArg, optionsArg] = columnAndOptions ?? [];
    await editorService.openEditor({ resource: URI.from(resource, true), options: { pinned: true, ...optionsArg, override: id } }, columnToEditorGroup(editorGroupsService, configurationService, columnArg));
  });
  CommandsRegistry.registerCommand({
    id: "vscode.changes",
    handler: /* @__PURE__ */ __name((accessor, title, resources) => {
      accessor.get(ICommandService).executeCommand("_workbench.changes", title, resources);
    }, "handler"),
    metadata: {
      description: "Opens a list of resources in the changes editor to compare their contents.",
      args: [
        { name: "title", description: "Human readable title for the diff editor" },
        { name: "resources", description: "List of resources to open in the changes editor" }
      ]
    }
  });
  CommandsRegistry.registerCommand("_workbench.changes", async (accessor, title, resources) => {
    const editorService = accessor.get(IEditorService);
    const editor = [];
    for (const [label, original, modified] of resources) {
      editor.push({
        resource: URI.revive(label),
        original: { resource: URI.revive(original) },
        modified: { resource: URI.revive(modified) }
      });
    }
    await editorService.openEditor({ resources: editor, label: title });
  });
  CommandsRegistry.registerCommand("_workbench.openMultiDiffEditor", async (accessor, options) => {
    const editorService = accessor.get(IEditorService);
    const resources = options.resources?.map((r) => ({ original: { resource: URI.revive(r.originalUri) }, modified: { resource: URI.revive(r.modifiedUri) } }));
    const revealUri = options.reveal?.modifiedUri ? URI.revive(options.reveal.modifiedUri) : void 0;
    const revealResource = revealUri && resources ? resources.find((r) => isEqual(r.modified.resource, revealUri)) : void 0;
    if (options.reveal && !revealResource) {
      console.error("Reveal resource not found");
    }
    const multiDiffEditorOptions = {
      viewState: revealResource ? {
        revealData: {
          resource: {
            original: revealResource.original.resource,
            modified: revealResource.modified.resource
          },
          range: options.reveal?.range
        }
      } : void 0
    };
    await editorService.openEditor({
      multiDiffSource: options.multiDiffSourceUri ? URI.revive(options.multiDiffSourceUri) : void 0,
      resources,
      label: options.title,
      options: multiDiffEditorOptions
    });
  });
}
__name(registerOpenEditorAPICommands, "registerOpenEditorAPICommands");
function registerOpenEditorAtIndexCommands() {
  const openEditorAtIndex = /* @__PURE__ */ __name((accessor, editorIndex) => {
    const editorService = accessor.get(IEditorService);
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane && typeof editorIndex === "number") {
      const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
      if (editor) {
        editorService.openEditor(editor);
      }
    }
  }, "openEditorAtIndex");
  CommandsRegistry.registerCommand({
    id: OPEN_EDITOR_AT_INDEX_COMMAND_ID,
    handler: openEditorAtIndex
  });
  for (let i = 0; i < 9; i++) {
    const editorIndex = i;
    const visibleIndex = i + 1;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
      weight: 200,
      when: void 0,
      primary: 512 | toKeyCode(visibleIndex),
      mac: { primary: 256 | toKeyCode(visibleIndex) },
      handler: /* @__PURE__ */ __name((accessor) => openEditorAtIndex(accessor, editorIndex), "handler")
    });
  }
  function toKeyCode(index) {
    switch (index) {
      case 0:
        return 21;
      case 1:
        return 22;
      case 2:
        return 23;
      case 3:
        return 24;
      case 4:
        return 25;
      case 5:
        return 26;
      case 6:
        return 27;
      case 7:
        return 28;
      case 8:
        return 29;
      case 9:
        return 30;
    }
    throw new Error("invalid index");
  }
  __name(toKeyCode, "toKeyCode");
}
__name(registerOpenEditorAtIndexCommands, "registerOpenEditorAtIndexCommands");
function registerFocusEditorGroupAtIndexCommands() {
  for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: toCommandId(groupIndex),
      weight: 200,
      when: void 0,
      primary: 2048 | toKeyCode(groupIndex),
      handler: /* @__PURE__ */ __name((accessor) => {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        if (groupIndex > editorGroupsService.count) {
          return;
        }
        const groups = editorGroupsService.getGroups(
          2
          /* GroupsOrder.GRID_APPEARANCE */
        );
        if (groups[groupIndex]) {
          return groups[groupIndex].focus();
        }
        const direction = preferredSideBySideGroupDirection(configurationService);
        const lastGroup = editorGroupsService.findGroup({
          location: 1
          /* GroupLocation.LAST */
        });
        if (!lastGroup) {
          return;
        }
        const newGroup = editorGroupsService.addGroup(lastGroup, direction);
        newGroup.focus();
      }, "handler")
    });
  }
  function toCommandId(index) {
    switch (index) {
      case 1:
        return "workbench.action.focusSecondEditorGroup";
      case 2:
        return "workbench.action.focusThirdEditorGroup";
      case 3:
        return "workbench.action.focusFourthEditorGroup";
      case 4:
        return "workbench.action.focusFifthEditorGroup";
      case 5:
        return "workbench.action.focusSixthEditorGroup";
      case 6:
        return "workbench.action.focusSeventhEditorGroup";
      case 7:
        return "workbench.action.focusEighthEditorGroup";
    }
    throw new Error("Invalid index");
  }
  __name(toCommandId, "toCommandId");
  function toKeyCode(index) {
    switch (index) {
      case 1:
        return 23;
      case 2:
        return 24;
      case 3:
        return 25;
      case 4:
        return 26;
      case 5:
        return 27;
      case 6:
        return 28;
      case 7:
        return 29;
    }
    throw new Error("Invalid index");
  }
  __name(toKeyCode, "toKeyCode");
}
__name(registerFocusEditorGroupAtIndexCommands, "registerFocusEditorGroupAtIndexCommands");
function splitEditor(editorGroupsService, direction, resolvedContext) {
  if (!resolvedContext.groupedEditors.length) {
    return;
  }
  const { group, editors } = resolvedContext.groupedEditors[0];
  const preserveFocus = resolvedContext.preserveFocus;
  const newGroup = editorGroupsService.addGroup(group, direction);
  for (const editorToCopy of editors) {
    if (editorToCopy && !editorToCopy.hasCapability(
      8
      /* EditorInputCapabilities.Singleton */
    )) {
      group.copyEditor(editorToCopy, newGroup, { preserveFocus });
    }
  }
  newGroup.focus();
}
__name(splitEditor, "splitEditor");
function registerSplitEditorCommands() {
  [
    {
      id: SPLIT_EDITOR_UP,
      direction: 0
      /* GroupDirection.UP */
    },
    {
      id: SPLIT_EDITOR_DOWN,
      direction: 1
      /* GroupDirection.DOWN */
    },
    {
      id: SPLIT_EDITOR_LEFT,
      direction: 2
      /* GroupDirection.LEFT */
    },
    {
      id: SPLIT_EDITOR_RIGHT,
      direction: 3
      /* GroupDirection.RIGHT */
    }
  ].forEach(({ id, direction }) => {
    CommandsRegistry.registerCommand(id, function(accessor, ...args) {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      splitEditor(accessor.get(IEditorGroupsService), direction, resolvedContext);
    });
  });
}
__name(registerSplitEditorCommands, "registerSplitEditorCommands");
function registerCloseEditorCommands() {
  function closeEditorHandler(accessor, forceCloseStickyEditors, ...args) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const editorService = accessor.get(IEditorService);
    let keepStickyEditors = void 0;
    if (forceCloseStickyEditors) {
      keepStickyEditors = false;
    } else if (args.length) {
      keepStickyEditors = false;
    } else {
      keepStickyEditors = editorGroupsService.partOptions.preventPinnedEditorClose === "keyboard" || editorGroupsService.partOptions.preventPinnedEditorClose === "keyboardAndMouse";
    }
    if (keepStickyEditors) {
      const activeGroup = editorGroupsService.activeGroup;
      const activeEditor = activeGroup.activeEditor;
      if (activeEditor && activeGroup.isSticky(activeEditor)) {
        const nextNonStickyEditorInGroup = activeGroup.getEditors(0, { excludeSticky: true })[0];
        if (nextNonStickyEditorInGroup) {
          return activeGroup.openEditor(nextNonStickyEditorInGroup);
        }
        const nextNonStickyEditorInAllGroups = editorService.getEditors(0, { excludeSticky: true })[0];
        if (nextNonStickyEditorInAllGroups) {
          return Promise.resolve(editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)?.openEditor(nextNonStickyEditorInAllGroups.editor));
        }
      }
    }
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const preserveFocus = resolvedContext.preserveFocus;
    return Promise.all(resolvedContext.groupedEditors.map(async ({ group, editors }) => {
      const editorsToClose = editors.filter((editor) => !keepStickyEditors || !group.isSticky(editor));
      await group.closeEditors(editorsToClose, { preserveFocus });
    }));
  }
  __name(closeEditorHandler, "closeEditorHandler");
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITOR_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: 2048 | 53,
    win: { primary: 2048 | 62, secondary: [
      2048 | 53
      /* KeyCode.KeyW */
    ] },
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      return closeEditorHandler(accessor, false, ...args);
    }, "handler")
  });
  CommandsRegistry.registerCommand(CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, ...args) => {
    return closeEditorHandler(accessor, true, ...args);
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: KeyChord(
      2048 | 41,
      53
      /* KeyCode.KeyW */
    ),
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group }) => {
        await group.closeAllEditors({ excludeSticky: true });
      }));
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITOR_GROUP_COMMAND_ID,
    weight: 200,
    when: ContextKeyExpr.and(ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext),
    primary: 2048 | 53,
    win: { primary: 2048 | 62, secondary: [
      2048 | 53
      /* KeyCode.KeyW */
    ] },
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const commandsContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
      if (commandsContext.groupedEditors.length) {
        editorGroupsService.removeGroup(commandsContext.groupedEditors[0].group);
      }
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_SAVED_EDITORS_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: KeyChord(
      2048 | 41,
      51
      /* KeyCode.KeyU */
    ),
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group }) => {
        await group.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
      }));
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: void 0,
    mac: {
      primary: 2048 | 512 | 50
      /* KeyCode.KeyT */
    },
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      return Promise.all(resolvedContext.groupedEditors.map(async ({ group, editors }) => {
        const editorsToClose = group.getEditors(1, { excludeSticky: true }).filter((editor) => !editors.includes(editor));
        for (const editorToKeep of editors) {
          if (editorToKeep) {
            group.pinEditor(editorToKeep);
          }
        }
        await group.closeEditors(editorsToClose, { preserveFocus: resolvedContext.preserveFocus });
      }));
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name(async (accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (resolvedContext.groupedEditors.length) {
        const { group, editors } = resolvedContext.groupedEditors[0];
        if (group.activeEditor) {
          group.pinEditor(group.activeEditor);
        }
        await group.closeEditors({ direction: 1, except: editors[0], excludeSticky: true }, { preserveFocus: resolvedContext.preserveFocus });
      }
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: REOPEN_WITH_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      return reopenEditorWith(accessor, EditorResolution.PICK, ...args);
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, override, ...args) => {
      return reopenEditorWith(accessor, override ?? EditorResolution.PICK, ...args);
    }, "handler")
  });
  async function reopenEditorWith(accessor, editorOverride, ...args) {
    const editorService = accessor.get(IEditorService);
    const editorResolverService = accessor.get(IEditorResolverService);
    const telemetryService = accessor.get(ITelemetryService);
    const resolvedContext = resolveCommandsContext(args, editorService, accessor.get(IEditorGroupsService), accessor.get(IListService));
    const editorReplacements = /* @__PURE__ */ new Map();
    for (const { group, editors } of resolvedContext.groupedEditors) {
      for (const editor of editors) {
        const untypedEditor = editor.toUntyped();
        if (!untypedEditor) {
          return;
        }
        untypedEditor.options = { ...editorService.activeEditorPane?.options, override: editorOverride };
        const resolvedEditor = await editorResolverService.resolveEditor(untypedEditor, group);
        if (!isEditorInputWithOptionsAndGroup(resolvedEditor)) {
          return;
        }
        let editorReplacementsInGroup = editorReplacements.get(group);
        if (!editorReplacementsInGroup) {
          editorReplacementsInGroup = [];
          editorReplacements.set(group, editorReplacementsInGroup);
        }
        editorReplacementsInGroup.push({
          editor,
          replacement: resolvedEditor.editor,
          forceReplaceDirty: editor.resource?.scheme === Schemas.untitled,
          options: resolvedEditor.options
        });
        telemetryService.publicLog2("workbenchEditorReopen", {
          scheme: editor.resource?.scheme ?? "",
          ext: editor.resource ? extname(editor.resource) : "",
          from: editor.editorId ?? "",
          to: resolvedEditor.editor.editorId ?? ""
        });
      }
    }
    for (const [group, replacements] of editorReplacements) {
      await group.replaceEditors(replacements);
      await group.openEditor(replacements[0].replacement);
    }
  }
  __name(reopenEditorWith, "reopenEditorWith");
  CommandsRegistry.registerCommand(CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, ...args) => {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
    if (resolvedContext.groupedEditors.length) {
      const { group } = resolvedContext.groupedEditors[0];
      await group.closeAllEditors();
      if (group.count === 0 && editorGroupsService.getGroup(group.id)) {
        editorGroupsService.removeGroup(group);
      }
    }
  });
}
__name(registerCloseEditorCommands, "registerCloseEditorCommands");
function registerFocusEditorGroupWihoutWrapCommands() {
  const commands = [
    {
      id: FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 2
      /* GroupDirection.LEFT */
    },
    {
      id: FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 3
      /* GroupDirection.RIGHT */
    },
    {
      id: FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 0
    },
    {
      id: FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
      direction: 1
      /* GroupDirection.DOWN */
    }
  ];
  for (const command of commands) {
    CommandsRegistry.registerCommand(command.id, async (accessor) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const group = editorGroupsService.findGroup({ direction: command.direction }, editorGroupsService.activeGroup, false) ?? editorGroupsService.activeGroup;
      group.focus();
    });
  }
}
__name(registerFocusEditorGroupWihoutWrapCommands, "registerFocusEditorGroupWihoutWrapCommands");
function registerSplitEditorInGroupCommands() {
  async function splitEditorInGroup(accessor, resolvedContext) {
    const instantiationService = accessor.get(IInstantiationService);
    if (!resolvedContext.groupedEditors.length) {
      return;
    }
    const { group, editors } = resolvedContext.groupedEditors[0];
    const editor = editors[0];
    if (!editor) {
      return;
    }
    await group.replaceEditors([{
      editor,
      replacement: instantiationService.createInstance(SideBySideEditorInput, void 0, void 0, editor, editor),
      forceReplaceDirty: true
    }]);
  }
  __name(splitEditorInGroup, "splitEditorInGroup");
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: SPLIT_EDITOR_IN_GROUP,
        title: localize2("splitEditorInGroup", "Split Editor in Group"),
        category: Categories.View,
        precondition: ActiveEditorCanSplitInGroupContext,
        f1: true,
        keybinding: {
          weight: 200,
          when: ActiveEditorCanSplitInGroupContext,
          primary: KeyChord(
            2048 | 41,
            2048 | 1024 | 93
            /* KeyCode.Backslash */
          )
        }
      });
    }
    run(accessor, ...args) {
      return splitEditorInGroup(accessor, resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
    }
  });
  async function joinEditorInGroup(resolvedContext) {
    if (!resolvedContext.groupedEditors.length) {
      return;
    }
    const { group, editors } = resolvedContext.groupedEditors[0];
    const editor = editors[0];
    if (!editor) {
      return;
    }
    if (!(editor instanceof SideBySideEditorInput)) {
      return;
    }
    let options = void 0;
    const activeEditorPane = group.activeEditorPane;
    if (activeEditorPane instanceof SideBySideEditor && group.activeEditor === editor) {
      for (const pane of [activeEditorPane.getPrimaryEditorPane(), activeEditorPane.getSecondaryEditorPane()]) {
        if (pane?.hasFocus()) {
          options = { viewState: pane.getViewState() };
          break;
        }
      }
    }
    await group.replaceEditors([{
      editor,
      replacement: editor.primary,
      options
    }]);
  }
  __name(joinEditorInGroup, "joinEditorInGroup");
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: JOIN_EDITOR_IN_GROUP,
        title: localize2("joinEditorInGroup", "Join Editor in Group"),
        category: Categories.View,
        precondition: SideBySideEditorActiveContext,
        f1: true,
        keybinding: {
          weight: 200,
          when: SideBySideEditorActiveContext,
          primary: KeyChord(
            2048 | 41,
            2048 | 1024 | 93
            /* KeyCode.Backslash */
          )
        }
      });
    }
    run(accessor, ...args) {
      return joinEditorInGroup(resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService)));
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_SPLIT_EDITOR_IN_GROUP,
        title: localize2("toggleJoinEditorInGroup", "Toggle Split Editor in Group"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext),
        f1: true
      });
    }
    async run(accessor, ...args) {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      if (!resolvedContext.groupedEditors.length) {
        return;
      }
      const { editors } = resolvedContext.groupedEditors[0];
      if (editors[0] instanceof SideBySideEditorInput) {
        await joinEditorInGroup(resolvedContext);
      } else if (editors[0]) {
        await splitEditorInGroup(accessor, resolvedContext);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
        title: localize2("toggleSplitEditorInGroupLayout", "Toggle Layout of Split Editor in Group"),
        category: Categories.View,
        precondition: SideBySideEditorActiveContext,
        f1: true
      });
    }
    async run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const currentSetting = configurationService.getValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING);
      let newSetting;
      if (currentSetting !== "horizontal") {
        newSetting = "horizontal";
      } else {
        newSetting = "vertical";
      }
      return configurationService.updateValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
    }
  });
}
__name(registerSplitEditorInGroupCommands, "registerSplitEditorInGroupCommands");
function registerFocusSideEditorsCommands() {
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_FIRST_SIDE_EDITOR,
        title: localize2("focusLeftSideEditor", "Focus First Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor) {
        activeEditorPane.getSecondaryEditorPane()?.focus();
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_SECONDARY_SIDE);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_SECOND_SIDE_EDITOR,
        title: localize2("focusRightSideEditor", "Focus Second Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor) {
        activeEditorPane.getPrimaryEditorPane()?.focus();
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_PRIMARY_SIDE);
      }
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: FOCUS_OTHER_SIDE_EDITOR,
        title: localize2("focusOtherSideEditor", "Focus Other Side in Active Editor"),
        category: Categories.View,
        precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
        f1: true
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      const activeEditorPane = editorService.activeEditorPane;
      if (activeEditorPane instanceof SideBySideEditor) {
        if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
          activeEditorPane.getSecondaryEditorPane()?.focus();
        } else {
          activeEditorPane.getPrimaryEditorPane()?.focus();
        }
      } else if (activeEditorPane instanceof TextDiffEditor) {
        await commandService.executeCommand(DIFF_FOCUS_OTHER_SIDE);
      }
    }
  });
}
__name(registerFocusSideEditorsCommands, "registerFocusSideEditorsCommands");
function registerOtherEditorCommands() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: KEEP_EDITOR_COMMAND_ID,
    weight: 200,
    when: void 0,
    primary: KeyChord(
      2048 | 41,
      3
      /* KeyCode.Enter */
    ),
    handler: /* @__PURE__ */ __name(async (accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group.pinEditor(editor);
        }
      }
    }, "handler")
  });
  CommandsRegistry.registerCommand({
    id: TOGGLE_KEEP_EDITORS_COMMAND_ID,
    handler: /* @__PURE__ */ __name((accessor) => {
      const configurationService = accessor.get(IConfigurationService);
      const currentSetting = configurationService.getValue("workbench.editor.enablePreview");
      const newSetting = currentSetting !== true;
      configurationService.updateValue("workbench.editor.enablePreview", newSetting);
    }, "handler")
  });
  function setEditorGroupLock(accessor, locked, ...args) {
    const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
    const group = resolvedContext.groupedEditors[0]?.group;
    group?.lock(locked ?? !group.isLocked);
  }
  __name(setEditorGroupLock, "setEditorGroupLock");
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: TOGGLE_LOCK_GROUP_COMMAND_ID,
        title: localize2("toggleEditorGroupLock", "Toggle Editor Group Lock"),
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor, ...args) {
      setEditorGroupLock(accessor, void 0, ...args);
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: LOCK_GROUP_COMMAND_ID,
        title: localize2("lockEditorGroup", "Lock Editor Group"),
        category: Categories.View,
        precondition: ActiveEditorGroupLockedContext.toNegated(),
        f1: true
      });
    }
    async run(accessor, ...args) {
      setEditorGroupLock(accessor, true, ...args);
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: UNLOCK_GROUP_COMMAND_ID,
        title: localize2("unlockEditorGroup", "Unlock Editor Group"),
        precondition: ActiveEditorGroupLockedContext,
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor, ...args) {
      setEditorGroupLock(accessor, false, ...args);
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: PIN_EDITOR_COMMAND_ID,
    weight: 200,
    when: ActiveEditorStickyContext.toNegated(),
    primary: KeyChord(
      2048 | 41,
      1024 | 3
      /* KeyCode.Enter */
    ),
    handler: /* @__PURE__ */ __name(async (accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group.stickEditor(editor);
        }
      }
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: UNPIN_EDITOR_COMMAND_ID,
    weight: 200,
    when: ActiveEditorStickyContext,
    primary: KeyChord(
      2048 | 41,
      1024 | 3
      /* KeyCode.Enter */
    ),
    handler: /* @__PURE__ */ __name(async (accessor, ...args) => {
      const resolvedContext = resolveCommandsContext(args, accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IListService));
      for (const { group, editors } of resolvedContext.groupedEditors) {
        for (const editor of editors) {
          group.unstickEditor(editor);
        }
      }
    }, "handler")
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: SHOW_EDITORS_IN_GROUP,
    weight: 200,
    when: void 0,
    primary: void 0,
    handler: /* @__PURE__ */ __name((accessor, ...args) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const quickInputService = accessor.get(IQuickInputService);
      const commandsContext = resolveCommandsContext(args, accessor.get(IEditorService), editorGroupsService, accessor.get(IListService));
      const group = commandsContext.groupedEditors[0]?.group;
      if (group) {
        editorGroupsService.activateGroup(group);
      }
      return quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }, "handler")
  });
}
__name(registerOtherEditorCommands, "registerOtherEditorCommands");
function setup() {
  registerEditorMoveCopyCommand();
  registerEditorGroupsLayoutCommands();
  registerDiffEditorCommands();
  registerOpenEditorAPICommands();
  registerOpenEditorAtIndexCommands();
  registerCloseEditorCommands();
  registerOtherEditorCommands();
  registerSplitEditorInGroupCommands();
  registerFocusSideEditorsCommands();
  registerFocusEditorGroupAtIndexCommands();
  registerSplitEditorCommands();
  registerFocusEditorGroupWihoutWrapCommands();
}
__name(setup, "setup");
export {
  API_OPEN_DIFF_EDITOR_COMMAND_ID,
  API_OPEN_EDITOR_COMMAND_ID,
  API_OPEN_WITH_EDITOR_COMMAND_ID,
  CLOSE_EDITORS_AND_GROUP_COMMAND_ID,
  CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
  CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
  CLOSE_EDITOR_COMMAND_ID,
  CLOSE_EDITOR_GROUP_COMMAND_ID,
  CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
  CLOSE_PINNED_EDITOR_COMMAND_ID,
  CLOSE_SAVED_EDITORS_COMMAND_ID,
  COPY_ACTIVE_EDITOR_COMMAND_ID,
  COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,
  COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
  EDITOR_CORE_NAVIGATION_COMMANDS,
  FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
  FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
  FOCUS_FIRST_SIDE_EDITOR,
  FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
  FOCUS_OTHER_SIDE_EDITOR,
  FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
  FOCUS_SECOND_SIDE_EDITOR,
  JOIN_EDITOR_IN_GROUP,
  KEEP_EDITOR_COMMAND_ID,
  LAYOUT_EDITOR_GROUPS_COMMAND_ID,
  LOCK_GROUP_COMMAND_ID,
  MOVE_ACTIVE_EDITOR_COMMAND_ID,
  MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,
  MOVE_EDITOR_INTO_ABOVE_GROUP,
  MOVE_EDITOR_INTO_BELOW_GROUP,
  MOVE_EDITOR_INTO_LEFT_GROUP,
  MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
  MOVE_EDITOR_INTO_RIGHT_GROUP,
  NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID,
  OPEN_EDITOR_AT_INDEX_COMMAND_ID,
  PIN_EDITOR_COMMAND_ID,
  REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID,
  REOPEN_WITH_COMMAND_ID,
  SHOW_EDITORS_IN_GROUP,
  SPLIT_EDITOR,
  SPLIT_EDITOR_DOWN,
  SPLIT_EDITOR_IN_GROUP,
  SPLIT_EDITOR_LEFT,
  SPLIT_EDITOR_RIGHT,
  SPLIT_EDITOR_UP,
  TOGGLE_KEEP_EDITORS_COMMAND_ID,
  TOGGLE_LOCK_GROUP_COMMAND_ID,
  TOGGLE_MAXIMIZE_EDITOR_GROUP,
  TOGGLE_SPLIT_EDITOR_IN_GROUP,
  TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
  UNLOCK_GROUP_COMMAND_ID,
  UNPIN_EDITOR_COMMAND_ID,
  setup,
  splitEditor
};
//# sourceMappingURL=editorCommands.js.map
