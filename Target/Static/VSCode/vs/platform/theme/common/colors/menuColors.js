import * as nls from "../../../../nls.js";
import { registerColor } from "../colorUtils.js";
import { contrastBorder, activeContrastBorder } from "./baseColors.js";
import { selectForeground, selectBackground } from "./inputColors.js";
import { listActiveSelectionBackground, listActiveSelectionForeground } from "./listColors.js";
const menuBorder = registerColor(
  "menu.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  nls.localize("menuBorder", "Border color of menus.")
);
const menuForeground = registerColor(
  "menu.foreground",
  selectForeground,
  nls.localize("menuForeground", "Foreground color of menu items.")
);
const menuBackground = registerColor(
  "menu.background",
  selectBackground,
  nls.localize("menuBackground", "Background color of menu items.")
);
const menuSelectionForeground = registerColor(
  "menu.selectionForeground",
  listActiveSelectionForeground,
  nls.localize("menuSelectionForeground", "Foreground color of the selected menu item in menus.")
);
const menuSelectionBackground = registerColor(
  "menu.selectionBackground",
  listActiveSelectionBackground,
  nls.localize("menuSelectionBackground", "Background color of the selected menu item in menus.")
);
const menuSelectionBorder = registerColor(
  "menu.selectionBorder",
  { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
  nls.localize("menuSelectionBorder", "Border color of the selected menu item in menus.")
);
const menuSeparatorBackground = registerColor(
  "menu.separatorBackground",
  { dark: "#606060", light: "#D4D4D4", hcDark: contrastBorder, hcLight: contrastBorder },
  nls.localize("menuSeparatorBackground", "Color of a separator menu item in menus.")
);
export {
  menuBackground,
  menuBorder,
  menuForeground,
  menuSelectionBackground,
  menuSelectionBorder,
  menuSelectionForeground,
  menuSeparatorBackground
};
//# sourceMappingURL=menuColors.js.map
