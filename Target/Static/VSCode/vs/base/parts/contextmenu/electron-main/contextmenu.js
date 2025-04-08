var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IpcMainEvent, Menu, MenuItem } from "electron";
import { validatedIpcMain } from "../../ipc/electron-main/ipcMain.js";
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL, IPopupOptions, ISerializableContextMenuItem } from "../common/contextmenu.js";
function registerContextMenuListener() {
  validatedIpcMain.on(CONTEXT_MENU_CHANNEL, (event, contextMenuId, items, onClickChannel, options) => {
    const menu = createMenu(event, onClickChannel, items);
    menu.popup({
      x: options ? options.x : void 0,
      y: options ? options.y : void 0,
      positioningItem: options ? options.positioningItem : void 0,
      callback: /* @__PURE__ */ __name(() => {
        if (menu) {
          event.sender.send(CONTEXT_MENU_CLOSE_CHANNEL, contextMenuId);
        }
      }, "callback")
    });
  });
}
__name(registerContextMenuListener, "registerContextMenuListener");
function createMenu(event, onClickChannel, items) {
  const menu = new Menu();
  items.forEach((item) => {
    let menuitem;
    if (item.type === "separator") {
      menuitem = new MenuItem({
        type: item.type
      });
    } else if (Array.isArray(item.submenu)) {
      menuitem = new MenuItem({
        submenu: createMenu(event, onClickChannel, item.submenu),
        label: item.label
      });
    } else {
      menuitem = new MenuItem({
        label: item.label,
        type: item.type,
        accelerator: item.accelerator,
        checked: item.checked,
        enabled: item.enabled,
        visible: item.visible,
        click: /* @__PURE__ */ __name((menuItem, win, contextmenuEvent) => event.sender.send(onClickChannel, item.id, contextmenuEvent), "click")
      });
    }
    menu.append(menuitem);
  });
  return menu;
}
__name(createMenu, "createMenu");
export {
  registerContextMenuListener
};
//# sourceMappingURL=contextmenu.js.map
