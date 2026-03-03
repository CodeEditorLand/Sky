import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import { isIMenuItem, MenuRegistry } from "../../../platform/actions/common/actions.js";
import { Menus } from "../../browser/menus.js";
import "../../browser/layoutActions.js";
suite("Sessions - Layout Actions", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("always-on-top toggle action is contributed to TitleBarRight", () => {
    const items = MenuRegistry.getMenuItems(Menus.TitleBarRight);
    const menuItems = items.filter(isIMenuItem);
    const toggleAlwaysOnTop = menuItems.find((item) => item.command.id === "workbench.action.toggleWindowAlwaysOnTop");
    assert.ok(toggleAlwaysOnTop, "toggleWindowAlwaysOnTop should be contributed to TitleBarRight");
    assert.strictEqual(toggleAlwaysOnTop.group, "navigation");
  });
});
//# sourceMappingURL=layoutActions.test.js.map
