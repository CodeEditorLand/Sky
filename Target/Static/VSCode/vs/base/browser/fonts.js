var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "./window.js";
import { isElectron, isMacintosh, isWindows } from "../common/platform.js";
const DEFAULT_FONT_FAMILY = isWindows ? '"Segoe WPC", "Segoe UI", sans-serif' : isMacintosh ? "-apple-system, BlinkMacSystemFont, sans-serif" : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
const getFonts = /* @__PURE__ */ __name(async () => {
  try {
    const fonts = await mainWindow.queryLocalFonts();
    const fontsArray = [...fonts];
    const families = fontsArray.map((font) => font.family);
    return families;
  } catch (error) {
    console.error(`Failed to query fonts: ${error}`);
    return [];
  }
}, "getFonts");
const getFontSnippets = /* @__PURE__ */ __name(async () => {
  if (!isElectron) {
    return [];
  }
  const fonts = await getFonts();
  const snippets = fonts.map((font) => {
    return {
      body: `${font}`
    };
  });
  return snippets;
}, "getFontSnippets");
export {
  DEFAULT_FONT_FAMILY,
  getFontSnippets,
  getFonts
};
//# sourceMappingURL=fonts.js.map
