var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { IMcpRegistry } from "../../../mcp/common/mcpRegistryTypes.js";
import { IMcpService, IMcpWorkbenchService } from "../../../mcp/common/mcpTypes.js";
import { startServerAndWaitForLiveTools } from "../../../mcp/common/mcpTypesUtils.js";
import { ILanguageModelToolsConfirmationService } from "../../common/tools/languageModelToolsConfirmationService.js";
import { ILanguageModelToolsService, ToolDataSource } from "../../common/tools/languageModelToolsService.js";
import { ConfigureToolSets } from "../tools/toolSetsContribution.js";
var BucketOrdinal;
(function(BucketOrdinal2) {
  BucketOrdinal2[BucketOrdinal2["User"] = 0] = "User";
  BucketOrdinal2[BucketOrdinal2["BuiltIn"] = 1] = "BuiltIn";
  BucketOrdinal2[BucketOrdinal2["Mcp"] = 2] = "Mcp";
  BucketOrdinal2[BucketOrdinal2["Extension"] = 3] = "Extension";
})(BucketOrdinal || (BucketOrdinal = {}));
function isBucketTreeItem(item) {
  return item.itemType === "bucket";
}
__name(isBucketTreeItem, "isBucketTreeItem");
function isToolSetTreeItem(item) {
  return item.itemType === "toolset";
}
__name(isToolSetTreeItem, "isToolSetTreeItem");
function isToolTreeItem(item) {
  return item.itemType === "tool";
}
__name(isToolTreeItem, "isToolTreeItem");
function isCallbackTreeItem(item) {
  return item.itemType === "callback";
}
__name(isCallbackTreeItem, "isCallbackTreeItem");
function mapIconToTreeItem(icon, useDefaultToolIcon = false) {
  if (!icon) {
    if (useDefaultToolIcon) {
      return { iconClass: ThemeIcon.asClassName(Codicon.tools) };
    }
    return {};
  }
  if (ThemeIcon.isThemeIcon(icon)) {
    return { iconClass: ThemeIcon.asClassName(icon) };
  } else {
    return { iconPath: icon };
  }
}
__name(mapIconToTreeItem, "mapIconToTreeItem");
function createToolTreeItemFromData(tool, checked) {
  const iconProps = mapIconToTreeItem(tool.icon, true);
  return {
    itemType: "tool",
    tool,
    id: tool.id,
    label: tool.toolReferenceName ?? tool.displayName,
    description: tool.userDescription ?? tool.modelDescription,
    checked,
    ...iconProps
  };
}
__name(createToolTreeItemFromData, "createToolTreeItemFromData");
function createToolSetTreeItem(toolset, checked, editorService) {
  const iconProps = mapIconToTreeItem(toolset.icon);
  const buttons = [];
  if (toolset.source.type === "user") {
    const resource = toolset.source.file;
    buttons.push({
      iconClass: ThemeIcon.asClassName(Codicon.edit),
      tooltip: localize("editUserBucket", "Edit Tool Set"),
      action: /* @__PURE__ */ __name(() => editorService.openEditor({ resource }), "action")
    });
  }
  return {
    itemType: "toolset",
    toolset,
    buttons,
    id: toolset.id,
    label: toolset.referenceName,
    description: toolset.description,
    checked,
    children: void 0,
    collapsed: true,
    ...iconProps
  };
}
__name(createToolSetTreeItem, "createToolSetTreeItem");
async function showToolsPicker(accessor, placeHolder, source, description, getToolsEntries, model, token) {
  const quickPickService = accessor.get(IQuickInputService);
  const mcpService = accessor.get(IMcpService);
  const mcpRegistry = accessor.get(IMcpRegistry);
  const commandService = accessor.get(ICommandService);
  const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  const editorService = accessor.get(IEditorService);
  const mcpWorkbenchService = accessor.get(IMcpWorkbenchService);
  const toolsService = accessor.get(ILanguageModelToolsService);
  const confirmationService = accessor.get(ILanguageModelToolsConfirmationService);
  const telemetryService = accessor.get(ITelemetryService);
  const mcpServerByTool = /* @__PURE__ */ new Map();
  for (const server of mcpService.servers.get()) {
    for (const tool of server.tools.get()) {
      mcpServerByTool.set(tool.id, server);
    }
  }
  function computeItems(previousToolsEntries) {
    let toolsEntries = getToolsEntries ? new Map([...getToolsEntries()].map(([k, enabled]) => [k.id, enabled])) : void 0;
    if (!toolsEntries) {
      const defaultEntries = /* @__PURE__ */ new Map();
      for (const tool of toolsService.getTools(model)) {
        if (tool.canBeReferencedInPrompt) {
          defaultEntries.set(tool, false);
        }
      }
      for (const toolSet of toolsService.getToolSetsForModel(model)) {
        defaultEntries.set(toolSet, false);
      }
      toolsEntries = defaultEntries;
    }
    previousToolsEntries?.forEach((value, key) => {
      toolsEntries.set(key.id, value);
    });
    const treeItems = [];
    const bucketMap = /* @__PURE__ */ new Map();
    const getKey = /* @__PURE__ */ __name((source2) => {
      switch (source2.type) {
        case "mcp":
        case "extension":
          return ToolDataSource.toKey(source2);
        case "internal":
          return 1 .toString();
        case "user":
          return 0 .toString();
        case "external":
          throw new Error("should not be reachable");
        default:
          assertNever(source2);
      }
    }, "getKey");
    const mcpServers = new Map(mcpService.servers.get().map((s) => [s.definition.id, { server: s, seen: false }]));
    const createBucket = /* @__PURE__ */ __name((source2, key) => {
      if (source2.type === "mcp") {
        const mcpServerEntry = mcpServers.get(source2.definitionId);
        if (!mcpServerEntry) {
          return void 0;
        }
        mcpServerEntry.seen = true;
        const mcpServer = mcpServerEntry.server;
        const buttons = [];
        const collection = mcpRegistry.collections.get().find((c) => c.id === mcpServer.collection.id);
        if (collection?.source) {
          buttons.push({
            iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
            tooltip: localize("configMcpCol", "Configure {0}", collection.label),
            action: /* @__PURE__ */ __name(() => collection.source ? collection.source instanceof ExtensionIdentifier ? extensionsWorkbenchService.open(collection.source.value, { tab: "features", feature: "mcp" }) : mcpWorkbenchService.open(collection.source, {
              tab: "configuration"
              /* McpServerEditorTab.Configuration */
            }) : void 0, "action")
          });
        } else if (collection?.presentation?.origin) {
          buttons.push({
            iconClass: ThemeIcon.asClassName(Codicon.settingsGear),
            tooltip: localize("configMcpCol", "Configure {0}", collection.label),
            action: /* @__PURE__ */ __name(() => editorService.openEditor({
              resource: collection.presentation.origin
            }), "action")
          });
        }
        if (mcpServer.connectionState.get().state === 3) {
          buttons.push({
            iconClass: ThemeIcon.asClassName(Codicon.warning),
            tooltip: localize("mcpShowOutput", "Show Output"),
            action: /* @__PURE__ */ __name(() => mcpServer.showOutput(), "action")
          });
        }
        const cacheState = mcpServer.cacheState.get();
        const children = [];
        let collapsed = true;
        if (cacheState === 0 || cacheState === 2) {
          collapsed = false;
          children.push({
            itemType: "callback",
            iconClass: ThemeIcon.asClassName(Codicon.sync),
            label: localize("mcpUpdate", "Update Tools"),
            pickable: false,
            run: /* @__PURE__ */ __name(() => {
              treePicker.busy = true;
              (async () => {
                const ok = await startServerAndWaitForLiveTools(mcpServer, { promptType: "all-untrusted" });
                if (!ok) {
                  mcpServer.showOutput();
                  treePicker.hide();
                  return;
                }
                treePicker.busy = false;
                computeItems(collectResults());
              })();
              return false;
            }, "run")
          });
        }
        const bucket = {
          itemType: "bucket",
          ordinal: 2,
          id: key,
          label: source2.label,
          checked: void 0,
          collapsed,
          children,
          buttons,
          sortOrder: 2
        };
        const iconPath = mcpServer.serverMetadata.get()?.icons.getUrl(22);
        if (iconPath) {
          bucket.iconPath = iconPath;
        } else {
          bucket.iconClass = ThemeIcon.asClassName(Codicon.mcp);
        }
        return bucket;
      } else if (source2.type === "extension") {
        return {
          itemType: "bucket",
          ordinal: 3,
          id: key,
          label: source2.label,
          checked: void 0,
          children: [],
          buttons: [],
          collapsed: true,
          iconClass: ThemeIcon.asClassName(Codicon.extensions),
          sortOrder: 3
        };
      } else if (source2.type === "internal") {
        return {
          itemType: "bucket",
          ordinal: 1,
          id: key,
          label: localize("defaultBucketLabel", "Built-In"),
          checked: void 0,
          children: [],
          buttons: [],
          collapsed: false,
          sortOrder: 1
        };
      } else {
        return {
          itemType: "bucket",
          ordinal: 0,
          id: key,
          label: localize("userBucket", "User Defined Tool Sets"),
          checked: void 0,
          children: [],
          buttons: [],
          collapsed: true,
          sortOrder: 4
        };
      }
    }, "createBucket");
    const getBucket = /* @__PURE__ */ __name((source2) => {
      const key = getKey(source2);
      let bucket = bucketMap.get(key);
      if (!bucket) {
        bucket = createBucket(source2, key);
        if (bucket) {
          bucketMap.set(key, bucket);
        }
      }
      return bucket;
    }, "getBucket");
    for (const toolSet of toolsService.getToolSetsForModel(model)) {
      if (!toolsEntries.has(toolSet.id)) {
        continue;
      }
      const bucket = getBucket(toolSet.source);
      if (!bucket) {
        continue;
      }
      const toolSetChecked = toolsEntries.get(toolSet.id) === true;
      if (toolSet.source.type === "mcp") {
        bucket.toolset = toolSet;
        if (toolSetChecked) {
          bucket.checked = toolSetChecked;
        }
      } else {
        const treeItem = createToolSetTreeItem(toolSet, toolSetChecked, editorService);
        bucket.children.push(treeItem);
        const children = [];
        for (const tool of toolSet.getTools()) {
          const toolChecked = toolSetChecked || toolsEntries.get(tool.id) === true;
          const toolTreeItem = createToolTreeItemFromData(tool, toolChecked);
          children.push(toolTreeItem);
        }
        if (children.length > 0) {
          treeItem.children = children;
        }
      }
    }
    for (const tool of toolsService.getAllToolsIncludingDisabled()) {
      if (!tool.canBeReferencedInPrompt || !toolsEntries.has(tool.id)) {
        continue;
      }
      const bucket = getBucket(tool.source);
      if (!bucket) {
        continue;
      }
      const toolChecked = bucket.checked === true || toolsEntries.get(tool.id) === true;
      const toolTreeItem = createToolTreeItemFromData(tool, toolChecked);
      bucket.children.push(toolTreeItem);
    }
    for (const { server, seen } of mcpServers.values()) {
      const cacheState = server.cacheState.get();
      if (!seen && (cacheState === 0 || cacheState === 2)) {
        getBucket({ type: "mcp", definitionId: server.definition.id, label: server.definition.label, instructions: "", serverLabel: "", collectionId: server.collection.id });
      }
    }
    const sortedBuckets = Array.from(bucketMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.label.localeCompare(b.label);
    });
    for (const bucket of sortedBuckets) {
      treeItems.push(bucket);
      bucket.children.sort((a, b) => a.label.localeCompare(b.label));
      for (const child of bucket.children) {
        if (isToolSetTreeItem(child) && child.children) {
          child.children.sort((a, b) => a.label.localeCompare(b.label));
        }
      }
    }
    for (const bucket of sortedBuckets) {
      const isMcpBucket = bucket.ordinal === 2;
      const addConfirmationButton = /* @__PURE__ */ __name((toolItem) => {
        if (!confirmationService.toolCanManageConfirmation(toolItem.tool)) {
          return;
        }
        const tool = toolItem.tool;
        const manageTools = isMcpBucket ? bucket.children.flatMap((c) => isToolTreeItem(c) ? [c.tool] : isToolSetTreeItem(c) && c.children ? c.children.filter(isToolTreeItem).map((gc) => gc.tool) : []) : [tool];
        const buttons = toolItem.buttons ? [...toolItem.buttons] : [];
        buttons.push({
          iconClass: ThemeIcon.asClassName(Codicon.pass),
          tooltip: localize("manageToolApproval", "Manage Approval"),
          keepOpen: true,
          action: /* @__PURE__ */ __name(() => confirmationService.manageConfirmationPreferences(manageTools, { focusToolId: tool.id }), "action")
        });
        toolItem.buttons = buttons;
      }, "addConfirmationButton");
      for (const child of bucket.children) {
        if (isToolTreeItem(child)) {
          addConfirmationButton(child);
        } else if (isToolSetTreeItem(child) && child.children) {
          for (const grandchild of child.children) {
            if (isToolTreeItem(grandchild)) {
              addConfirmationButton(grandchild);
            }
          }
        }
      }
    }
    if (treeItems.length === 0) {
      treePicker.placeholder = localize("noTools", "Add tools to chat");
    } else {
      treePicker.placeholder = placeHolder;
    }
    treePicker.setItemTree(treeItems);
  }
  __name(computeItems, "computeItems");
  const store = new DisposableStore();
  const treePicker = store.add(quickPickService.createQuickTree());
  treePicker.placeholder = placeHolder;
  treePicker.description = description;
  treePicker.matchOnDescription = true;
  treePicker.matchOnLabel = true;
  treePicker.sortByLabel = false;
  computeItems();
  store.add(treePicker.onDidTriggerItemButton((e) => {
    if (e.button && typeof e.button.action === "function") {
      const actionableButton = e.button;
      actionableButton.action();
      store.dispose();
    }
  }));
  const collectResults = /* @__PURE__ */ __name(() => {
    const result = /* @__PURE__ */ new Map();
    const traverse = /* @__PURE__ */ __name((items) => {
      for (const item of items) {
        if (isBucketTreeItem(item)) {
          if (item.toolset) {
            const allChecked = item.checked === true;
            result.set(item.toolset, allChecked);
          }
          traverse(item.children);
        } else if (isToolSetTreeItem(item)) {
          result.set(item.toolset, item.checked === true);
          if (item.children) {
            traverse(item.children);
          }
        } else if (isToolTreeItem(item)) {
          result.set(item.tool, item.checked || result.get(item.tool) === true);
        }
      }
    }, "traverse");
    traverse(treePicker.itemTree);
    return result;
  }, "collectResults");
  let didAccept = false;
  const didAcceptFinalItem = store.add(new Emitter());
  store.add(treePicker.onDidAccept(() => {
    const activeItems = treePicker.activeItems;
    const callbackItem = activeItems.find(isCallbackTreeItem);
    if (!callbackItem) {
      didAccept = true;
      treePicker.hide();
      return;
    }
    const ret = callbackItem.run();
    if (ret !== false) {
      didAcceptFinalItem.fire();
    }
  }));
  const addMcpServerButton = {
    iconClass: ThemeIcon.asClassName(Codicon.mcp),
    tooltip: localize("addMcpServer", "Add MCP Server...")
  };
  const installExtension = {
    iconClass: ThemeIcon.asClassName(Codicon.extensions),
    tooltip: localize("addExtensionButton", "Install Extension...")
  };
  const configureToolSets = {
    iconClass: ThemeIcon.asClassName(Codicon.gear),
    tooltip: localize("configToolSets", "Configure Tool Sets...")
  };
  treePicker.title = localize("configureTools", "Configure Tools");
  treePicker.buttons = [addMcpServerButton, installExtension, configureToolSets];
  store.add(treePicker.onDidTriggerButton((button) => {
    if (button === addMcpServerButton) {
      commandService.executeCommand(
        "workbench.mcp.addConfiguration"
        /* McpCommandIds.AddConfiguration */
      );
    } else if (button === installExtension) {
      extensionsWorkbenchService.openSearch("@tag:language-model-tools");
    } else if (button === configureToolSets) {
      commandService.executeCommand(ConfigureToolSets.ID);
    }
    treePicker.hide();
  }));
  if (token) {
    store.add(token.onCancellationRequested(() => {
      treePicker.hide();
    }));
  }
  const initialState = collectResults();
  treePicker.show();
  await Promise.race([Event.toPromise(Event.any(treePicker.onDidHide, didAcceptFinalItem.event), store)]);
  sendDidChangeEvent(source, telemetryService, initialState, collectResults(), mcpRegistry);
  store.dispose();
  return didAccept ? collectResults() : void 0;
}
__name(showToolsPicker, "showToolsPicker");
function categorizeTool(item, mcpRegistry) {
  const source = item.source;
  switch (source.type) {
    case "internal":
      return { category: "builtin", name: item.id };
    case "extension":
      return { category: "extension", name: item.id, extensionId: source.extensionId.value };
    case "mcp": {
      const collection = mcpRegistry.collections.get().find((c) => c.id === source.collectionId);
      if (collection?.source instanceof ExtensionIdentifier) {
        return { category: "extension-mcp", extensionId: collection.source.value };
      }
      return { category: "user-mcp" };
    }
    case "user":
      return { category: "user-toolset" };
    case "external":
      return { category: "user-toolset" };
    default:
      assertNever(source);
  }
}
__name(categorizeTool, "categorizeTool");
function computeToolToggleSummary(initialState, finalState, mcpRegistry) {
  const summary = {
    builtinEnabled: 0,
    builtinDisabled: 0,
    extensionEnabled: 0,
    extensionDisabled: 0,
    extensionMcpEnabled: 0,
    extensionMcpDisabled: 0,
    userMcpEnabled: 0,
    userMcpDisabled: 0,
    userToolsetEnabled: 0,
    userToolsetDisabled: 0,
    details: ""
  };
  const detailItems = [];
  for (const [item, finalEnabled] of finalState) {
    const initialEnabled = initialState.get(item) ?? false;
    if (initialEnabled === finalEnabled) {
      continue;
    }
    const categorized = categorizeTool(item, mcpRegistry);
    const enabled = finalEnabled;
    switch (categorized.category) {
      case "builtin":
        if (enabled) {
          summary.builtinEnabled++;
        } else {
          summary.builtinDisabled++;
        }
        detailItems.push({ category: "builtin", name: categorized.name, enabled });
        break;
      case "extension":
        if (enabled) {
          summary.extensionEnabled++;
        } else {
          summary.extensionDisabled++;
        }
        detailItems.push({ category: "extension", name: categorized.name, extensionId: categorized.extensionId, enabled });
        break;
      case "extension-mcp":
        if (enabled) {
          summary.extensionMcpEnabled++;
        } else {
          summary.extensionMcpDisabled++;
        }
        detailItems.push({ category: "extension-mcp", extensionId: categorized.extensionId, enabled });
        break;
      case "user-mcp":
        if (enabled) {
          summary.userMcpEnabled++;
        } else {
          summary.userMcpDisabled++;
        }
        detailItems.push({ category: "user-mcp", enabled });
        break;
      case "user-toolset":
        if (enabled) {
          summary.userToolsetEnabled++;
        } else {
          summary.userToolsetDisabled++;
        }
        detailItems.push({ category: "user-toolset", enabled });
        break;
    }
  }
  summary.details = JSON.stringify(detailItems);
  return summary;
}
__name(computeToolToggleSummary, "computeToolToggleSummary");
function sendDidChangeEvent(source, telemetryService, initialState, finalState, mcpRegistry) {
  const summary = computeToolToggleSummary(initialState, finalState, mcpRegistry);
  const changed = summary.builtinEnabled > 0 || summary.builtinDisabled > 0 || summary.extensionEnabled > 0 || summary.extensionDisabled > 0 || summary.extensionMcpEnabled > 0 || summary.extensionMcpDisabled > 0 || summary.userMcpEnabled > 0 || summary.userMcpDisabled > 0 || summary.userToolsetEnabled > 0 || summary.userToolsetDisabled > 0;
  telemetryService.publicLog2("chatToolPickerClosed", {
    source,
    changed,
    builtinEnabled: summary.builtinEnabled,
    builtinDisabled: summary.builtinDisabled,
    extensionEnabled: summary.extensionEnabled,
    extensionDisabled: summary.extensionDisabled,
    extensionMcpEnabled: summary.extensionMcpEnabled,
    extensionMcpDisabled: summary.extensionMcpDisabled,
    userMcpEnabled: summary.userMcpEnabled,
    userMcpDisabled: summary.userMcpDisabled,
    userToolsetEnabled: summary.userToolsetEnabled,
    userToolsetDisabled: summary.userToolsetDisabled,
    details: summary.details
  });
}
__name(sendDidChangeEvent, "sendDidChangeEvent");
export {
  showToolsPicker
};
//# sourceMappingURL=chatToolPicker.js.map
