var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL, IContextMenuEvent, IContextMenuItem, IPopupOptions, ISerializableContextMenuItem } from "../common/contextmenu.js";
import { ipcRenderer } from "../../sandbox/electron-sandbox/globals.js";
let contextMenuIdPool = 0;
function popup(items, options, onHide) {
  const processedItems = [];
  const contextMenuId = contextMenuIdPool++;
  const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
  const onClickChannelHandler = /* @__PURE__ */ __name((event, itemId, context) => {
    const item = processedItems[itemId];
    item.click?.(context);
  }, "onClickChannelHandler");
  ipcRenderer.once(onClickChannel, onClickChannelHandler);
  ipcRenderer.once(CONTEXT_MENU_CLOSE_CHANNEL, (event, closedContextMenuId) => {
    if (closedContextMenuId !== contextMenuId) {
      return;
    }
    ipcRenderer.removeListener(onClickChannel, onClickChannelHandler);
    onHide?.();
  });
  ipcRenderer.send(CONTEXT_MENU_CHANNEL, contextMenuId, items.map((item) => createItem(item, processedItems)), onClickChannel, options);
}
__name(popup, "popup");
function createItem(item, processedItems) {
  const serializableItem = {
    id: processedItems.length,
    label: item.label,
    type: item.type,
    accelerator: item.accelerator,
    checked: item.checked,
    enabled: typeof item.enabled === "boolean" ? item.enabled : true,
    visible: typeof item.visible === "boolean" ? item.visible : true
  };
  processedItems.push(item);
  if (Array.isArray(item.submenu)) {
    serializableItem.submenu = item.submenu.map((submenuItem) => createItem(submenuItem, processedItems));
  }
  return serializableItem;
}
__name(createItem, "createItem");
export {
  popup
};
//# sourceMappingURL=contextmenu.js.map
