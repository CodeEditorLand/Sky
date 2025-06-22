var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { diffSets } from "../../../../../base/common/collections.js";
import { Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { IMcpRegistry } from "../../../mcp/common/mcpRegistryTypes.js";
import { IMcpService } from "../../../mcp/common/mcpTypes.js";
import { ILanguageModelToolsService, ToolDataSource, ToolSet } from "../../common/languageModelToolsService.js";
import { ConfigureToolSets } from "../tools/toolSetsContribution.js";
var BucketOrdinal;
(function(BucketOrdinal2) {
  BucketOrdinal2[BucketOrdinal2["User"] = 0] = "User";
  BucketOrdinal2[BucketOrdinal2["BuiltIn"] = 1] = "BuiltIn";
  BucketOrdinal2[BucketOrdinal2["Mcp"] = 2] = "Mcp";
  BucketOrdinal2[BucketOrdinal2["Extension"] = 3] = "Extension";
})(BucketOrdinal || (BucketOrdinal = {}));
function isBucketPick(obj) {
  return Boolean(obj.children);
}
__name(isBucketPick, "isBucketPick");
function isToolSetPick(obj) {
  return Boolean(obj.toolset);
}
__name(isToolSetPick, "isToolSetPick");
function isToolPick(obj) {
  return Boolean(obj.tool);
}
__name(isToolPick, "isToolPick");
function isCallbackPick(obj) {
  return Boolean(obj.run);
}
__name(isCallbackPick, "isCallbackPick");
function isActionableButton(obj) {
  return typeof obj.action === "function";
}
__name(isActionableButton, "isActionableButton");
async function showToolsPicker(accessor, placeHolder, toolsEntries, onUpdate) {
  const quickPickService = accessor.get(IQuickInputService);
  const mcpService = accessor.get(IMcpService);
  const mcpRegistry = accessor.get(IMcpRegistry);
  const commandService = accessor.get(ICommandService);
  const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  const editorService = accessor.get(IEditorService);
  const toolsService = accessor.get(ILanguageModelToolsService);
  const mcpServerByTool = /* @__PURE__ */ new Map();
  for (const server of mcpService.servers.get()) {
    for (const tool of server.tools.get()) {
      mcpServerByTool.set(tool.id, server);
    }
  }
  const builtinBucket = {
    type: "item",
    children: [],
    label: localize("defaultBucketLabel", "Built-In"),
    ordinal: 1,
    picked: false
  };
  const userBucket = {
    type: "item",
    children: [],
    label: localize("userBucket", "User Defined Tool Sets"),
    ordinal: 0,
    alwaysShow: true,
    picked: false
  };
  const addMcpPick = { type: "item", label: localize("addServer", "Add MCP Server..."), iconClass: ThemeIcon.asClassName(Codicon.add), pickable: false, run: /* @__PURE__ */ __name(() => commandService.executeCommand(
    "workbench.mcp.addConfiguration"
    /* McpCommandIds.AddConfiguration */
  ), "run") };
  const configureToolSetsPick = { type: "item", label: localize("configToolSet", "Configure Tool Sets..."), iconClass: ThemeIcon.asClassName(Codicon.gear), pickable: false, run: /* @__PURE__ */ __name(() => commandService.executeCommand(ConfigureToolSets.ID), "run") };
  const addExpPick = { type: "item", label: localize("addExtension", "Install Extension..."), iconClass: ThemeIcon.asClassName(Codicon.add), pickable: false, run: /* @__PURE__ */ __name(() => extensionWorkbenchService.openSearch("@tag:language-model-tools"), "run") };
  const addPick = {
    type: "item",
    label: localize("addAny", "Add More Tools..."),
    iconClass: ThemeIcon.asClassName(Codicon.add),
    pickable: false,
    run: /* @__PURE__ */ __name(async () => {
      const pick = await quickPickService.pick([addMcpPick, addExpPick], {
        canPickMany: false,
        placeHolder: localize("noTools", "Add tools to chat")
      });
      pick?.run();
    }, "run")
  };
  const toolBuckets = /* @__PURE__ */ new Map();
  if (!toolsEntries) {
    const defaultEntries = /* @__PURE__ */ new Map();
    for (const tool of toolsService.getTools()) {
      defaultEntries.set(tool, false);
    }
    for (const toolSet of toolsService.toolSets.get()) {
      defaultEntries.set(toolSet, false);
    }
    toolsEntries = defaultEntries;
  }
  for (const [toolSetOrTool, picked] of toolsEntries) {
    let bucket;
    const buttons = [];
    if (toolSetOrTool.source.type === "mcp") {
      const key = ToolDataSource.toKey(toolSetOrTool.source);
      const { definitionId } = toolSetOrTool.source;
      const mcpServer = mcpService.servers.get().find((candidate) => candidate.definition.id === definitionId);
      if (!mcpServer) {
        continue;
      }
      const buttons2 = [];
      bucket = toolBuckets.get(key) ?? {
        type: "item",
        label: localize("mcplabel", "MCP Server: {0}", toolSetOrTool.source.label),
        ordinal: 2,
        picked: false,
        alwaysShow: true,
        children: [],
        buttons: buttons2
      };
      toolBuckets.set(key, bucket);
      const collection = mcpRegistry.collections.get().find((c) => c.id === mcpServer.collection.id);
      if (collection?.presentation?.origin) {
        buttons2.push({
          iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
          tooltip: localize("configMcpCol", "Configure {0}", collection.label),
          action: /* @__PURE__ */ __name(() => editorService.openEditor({
            resource: collection.presentation.origin
          }), "action")
        });
      }
      if (mcpServer.connectionState.get().state === 3) {
        buttons2.push({
          iconClass: ThemeIcon.asClassName(Codicon.warning),
          tooltip: localize("mcpShowOutput", "Show Output"),
          action: /* @__PURE__ */ __name(() => mcpServer.showOutput(), "action")
        });
      }
    } else if (toolSetOrTool.source.type === "extension") {
      const key = ToolDataSource.toKey(toolSetOrTool.source);
      bucket = toolBuckets.get(key) ?? {
        type: "item",
        label: localize("ext", "Extension: {0}", toolSetOrTool.source.label),
        ordinal: 3,
        picked: false,
        alwaysShow: true,
        children: []
      };
      toolBuckets.set(key, bucket);
    } else if (toolSetOrTool.source.type === "internal") {
      bucket = builtinBucket;
    } else if (toolSetOrTool.source.type === "user") {
      bucket = userBucket;
      buttons.push({
        iconClass: ThemeIcon.asClassName(Codicon.edit),
        tooltip: localize("editUserBucket", "Edit Tool Set"),
        action: /* @__PURE__ */ __name(() => {
          assertType(toolSetOrTool.source.type === "user");
          editorService.openEditor({ resource: toolSetOrTool.source.file });
        }, "action")
      });
    } else {
      assertNever(toolSetOrTool.source);
    }
    if (toolSetOrTool instanceof ToolSet) {
      if (toolSetOrTool.source.type !== "mcp") {
        bucket.children.push({
          parent: bucket,
          type: "item",
          picked,
          toolset: toolSetOrTool,
          label: toolSetOrTool.referenceName,
          description: toolSetOrTool.description,
          indented: true,
          buttons
        });
      } else {
        bucket.toolset = toolSetOrTool;
      }
    } else if (toolSetOrTool.canBeReferencedInPrompt) {
      bucket.children.push({
        parent: bucket,
        type: "item",
        picked,
        tool: toolSetOrTool,
        label: toolSetOrTool.toolReferenceName ?? toolSetOrTool.displayName,
        description: toolSetOrTool.userDescription ?? toolSetOrTool.modelDescription,
        indented: true
      });
    }
    if (picked) {
      bucket.picked = true;
    }
  }
  for (const bucket of [builtinBucket, userBucket]) {
    if (bucket.children.length > 0) {
      toolBuckets.set(generateUuid(), bucket);
    }
  }
  const store = new DisposableStore();
  const picks = [];
  for (const bucket of Array.from(toolBuckets.values()).sort((a, b) => a.ordinal - b.ordinal)) {
    picks.push({
      type: "separator",
      label: bucket.status
    });
    picks.push(bucket);
    picks.push(...bucket.children.sort((a, b) => a.label.localeCompare(b.label)));
  }
  const picker = store.add(quickPickService.createQuickPick({ useSeparators: true }));
  picker.placeholder = placeHolder;
  picker.canSelectMany = true;
  picker.keepScrollPosition = true;
  picker.sortByLabel = false;
  picker.matchOnDescription = true;
  if (picks.length === 0) {
    picker.placeholder = localize("noTools", "Add tools to chat");
    picker.canSelectMany = false;
    picks.push(addMcpPick, addExpPick);
  } else {
    picks.push({ type: "separator" }, configureToolSetsPick, addPick);
  }
  let lastSelectedItems = /* @__PURE__ */ new Set();
  let ignoreEvent = false;
  const result = /* @__PURE__ */ new Map();
  const _update = /* @__PURE__ */ __name(() => {
    ignoreEvent = true;
    try {
      const items = picks.filter((p) => p.type === "item" && Boolean(p.picked));
      lastSelectedItems = new Set(items);
      picker.selectedItems = items;
      result.clear();
      for (const item of picks) {
        if (item.type !== "item") {
          continue;
        }
        if (isToolSetPick(item)) {
          result.set(item.toolset, item.picked);
        } else if (isToolPick(item)) {
          result.set(item.tool, item.picked);
        } else if (isBucketPick(item)) {
          if (item.toolset) {
            result.set(item.toolset, item.picked);
          }
          for (const child of item.children) {
            if (isToolSetPick(child)) {
              result.set(child.toolset, item.picked);
            } else if (isToolPick(child)) {
              result.set(child.tool, item.picked);
            }
          }
        }
      }
      if (onUpdate) {
        let didChange = toolsEntries.size !== result.size;
        for (const [key, value] of toolsEntries) {
          if (didChange) {
            break;
          }
          didChange = result.get(key) !== value;
        }
        if (didChange) {
          onUpdate(result);
        }
      }
    } finally {
      ignoreEvent = false;
    }
  }, "_update");
  _update();
  picker.items = picks;
  picker.show();
  store.add(picker.onDidTriggerItemButton((e) => {
    if (isActionableButton(e.button)) {
      e.button.action();
      store.dispose();
    }
  }));
  store.add(picker.onDidChangeSelection((selectedPicks) => {
    if (ignoreEvent) {
      return;
    }
    const addPick2 = selectedPicks.find(isCallbackPick);
    if (addPick2) {
      addPick2.run();
      picker.hide();
      return;
    }
    const { added, removed } = diffSets(lastSelectedItems, new Set(selectedPicks));
    for (const item of added) {
      item.picked = true;
      if (isBucketPick(item)) {
        for (const toolPick of item.children) {
          toolPick.picked = true;
        }
      } else if (isToolPick(item) || isToolSetPick(item)) {
        item.parent.picked = true;
      }
    }
    for (const item of removed) {
      item.picked = false;
      if (isBucketPick(item)) {
        for (const toolPick of item.children) {
          toolPick.picked = false;
        }
      } else if ((isToolPick(item) || isToolSetPick(item)) && item.parent.children.every((child) => !child.picked)) {
        item.parent.picked = false;
      }
    }
    _update();
  }));
  let didAccept = false;
  store.add(picker.onDidAccept(() => {
    picker.activeItems.find(isCallbackPick)?.run();
    didAccept = true;
  }));
  await Promise.race([Event.toPromise(Event.any(picker.onDidAccept, picker.onDidHide))]);
  store.dispose();
  const mcpToolSets = /* @__PURE__ */ new Set();
  for (const item of toolsService.toolSets.get()) {
    if (item.source.type === "mcp") {
      mcpToolSets.add(item);
      if (Iterable.every(item.getTools(), (tool) => result.get(tool))) {
        for (const tool of item.getTools()) {
          result.delete(tool);
        }
        result.set(item, true);
      }
    }
  }
  return didAccept ? result : void 0;
}
__name(showToolsPicker, "showToolsPicker");
export {
  showToolsPicker
};
//# sourceMappingURL=chatToolPicker.js.map
