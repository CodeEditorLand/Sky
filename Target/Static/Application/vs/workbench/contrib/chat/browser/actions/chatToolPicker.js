var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { createMarkdownCommandLink } from "../../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import Severity from "../../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { CommandsRegistry, ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { IMcpRegistry } from "../../../mcp/common/mcpRegistryTypes.js";
import { IMcpService, IMcpWorkbenchService } from "../../../mcp/common/mcpTypes.js";
import { startServerAndWaitForLiveTools } from "../../../mcp/common/mcpTypesUtils.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
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
async function showToolsPicker(accessor, placeHolder, description, getToolsEntries, token) {
  const quickPickService = accessor.get(IQuickInputService);
  const mcpService = accessor.get(IMcpService);
  const mcpRegistry = accessor.get(IMcpRegistry);
  const commandService = accessor.get(ICommandService);
  const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
  const editorService = accessor.get(IEditorService);
  const mcpWorkbenchService = accessor.get(IMcpWorkbenchService);
  const toolsService = accessor.get(ILanguageModelToolsService);
  const toolLimit = accessor.get(IContextKeyService).getContextKeyValue(ChatContextKeys.chatToolGroupingThreshold.key);
  const mcpServerByTool = /* @__PURE__ */ new Map();
  for (const server of mcpService.servers.get()) {
    for (const tool of server.tools.get()) {
      mcpServerByTool.set(tool.id, server);
    }
  }
  function computeItems(previousToolsEntries) {
    let toolsEntries = getToolsEntries ? new Map(getToolsEntries()) : void 0;
    if (!toolsEntries) {
      const defaultEntries = /* @__PURE__ */ new Map();
      for (const tool of toolsService.getTools()) {
        if (tool.canBeReferencedInPrompt) {
          defaultEntries.set(tool, false);
        }
      }
      for (const toolSet of toolsService.toolSets.get()) {
        defaultEntries.set(toolSet, false);
      }
      toolsEntries = defaultEntries;
    }
    previousToolsEntries?.forEach((value, key) => {
      toolsEntries.set(key, value);
    });
    const treeItems = [];
    const bucketMap = /* @__PURE__ */ new Map();
    const getKey = /* @__PURE__ */ __name((source) => {
      switch (source.type) {
        case "mcp":
        case "extension":
          return ToolDataSource.toKey(source);
        case "internal":
          return 1 .toString();
        case "user":
          return 0 .toString();
        case "external":
          throw new Error("should not be reachable");
        default:
          assertNever(source);
      }
    }, "getKey");
    const mcpServers = new Map(mcpService.servers.get().map((s) => [s.definition.id, { server: s, seen: false }]));
    const createBucket = /* @__PURE__ */ __name((source, key) => {
      if (source.type === "mcp") {
        const mcpServerEntry = mcpServers.get(source.definitionId);
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
          label: source.label,
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
      } else if (source.type === "extension") {
        return {
          itemType: "bucket",
          ordinal: 3,
          id: key,
          label: source.label,
          checked: void 0,
          children: [],
          buttons: [],
          collapsed: true,
          iconClass: ThemeIcon.asClassName(Codicon.extensions),
          sortOrder: 3
        };
      } else if (source.type === "internal") {
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
    const getBucket = /* @__PURE__ */ __name((source) => {
      const key = getKey(source);
      let bucket = bucketMap.get(key);
      if (!bucket) {
        bucket = createBucket(source, key);
        if (bucket) {
          bucketMap.set(key, bucket);
        }
      }
      return bucket;
    }, "getBucket");
    for (const toolSet of toolsService.toolSets.get()) {
      if (!toolsEntries.has(toolSet)) {
        continue;
      }
      const bucket = getBucket(toolSet.source);
      if (!bucket) {
        continue;
      }
      const toolSetChecked = toolsEntries.get(toolSet) === true;
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
          const toolChecked = toolSetChecked || toolsEntries.get(tool) === true;
          const toolTreeItem = createToolTreeItemFromData(tool, toolChecked);
          children.push(toolTreeItem);
        }
        if (children.length > 0) {
          treeItem.children = children;
        }
      }
    }
    for (const tool of toolsService.getTools()) {
      if (!tool.canBeReferencedInPrompt || !toolsEntries.has(tool)) {
        continue;
      }
      const bucket = getBucket(tool.source);
      if (!bucket) {
        continue;
      }
      const toolChecked = bucket.checked === true || toolsEntries.get(tool) === true;
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
  treePicker.ignoreFocusOut = true;
  treePicker.description = description;
  treePicker.matchOnDescription = true;
  treePicker.matchOnLabel = true;
  treePicker.sortByLabel = false;
  computeItems();
  store.add(treePicker.onDidTriggerItemButton((e) => {
    if (e.button && typeof e.button.action === "function") {
      e.button.action();
      store.dispose();
    }
  }));
  const updateToolLimitMessage = /* @__PURE__ */ __name(() => {
    if (toolLimit) {
      let count = 0;
      const traverse = /* @__PURE__ */ __name((items) => {
        for (const item of items) {
          if (isBucketTreeItem(item) || isToolSetTreeItem(item)) {
            if (item.children) {
              traverse(item.children);
            }
          } else if (isToolTreeItem(item) && item.checked) {
            count++;
          }
        }
      }, "traverse");
      traverse(treePicker.itemTree);
      if (count > toolLimit) {
        treePicker.severity = Severity.Warning;
        treePicker.validationMessage = localize("toolLimitExceeded", "{0} tools are enabled. You may experience degraded tool calling above {1} tools.", count, createMarkdownCommandLink({ title: String(toolLimit), id: "_chat.toolPicker.closeAndOpenVirtualThreshold" }));
      } else {
        treePicker.severity = Severity.Ignore;
        treePicker.validationMessage = void 0;
      }
    }
  }, "updateToolLimitMessage");
  updateToolLimitMessage();
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
  store.add(CommandsRegistry.registerCommand({
    id: "_chat.toolPicker.closeAndOpenVirtualThreshold",
    handler: /* @__PURE__ */ __name(() => {
      treePicker.hide();
      commandService.executeCommand("workbench.action.openSettings", "github.copilot.chat.virtualTools.threshold");
    }, "handler")
  }));
  store.add(treePicker.onDidChangeCheckedLeafItems(() => updateToolLimitMessage()));
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
  treePicker.show();
  await Promise.race([Event.toPromise(Event.any(treePicker.onDidHide, didAcceptFinalItem.event), store)]);
  store.dispose();
  return didAccept ? collectResults() : void 0;
}
__name(showToolsPicker, "showToolsPicker");
export {
  showToolsPicker
};
//# sourceMappingURL=chatToolPicker.js.map
