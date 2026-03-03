var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const INativeBrowserElementsService = createDecorator("nativeBrowserElementsService");
function getDisplayNameFromOuterHTML(outerHTML) {
  const firstElementMatch = outerHTML.match(/^<([^ >]+)([^>]*?)>/);
  if (!firstElementMatch) {
    throw new Error("No outer element found");
  }
  const tagName = firstElementMatch[1];
  const idMatch = firstElementMatch[2].match(/\s+id\s*=\s*["']([^"']+)["']/i);
  const id = idMatch ? `#${idMatch[1]}` : "";
  const classMatch = firstElementMatch[2].match(/\s+class\s*=\s*["']([^"']+)["']/i);
  const className = classMatch ? `.${classMatch[1].replace(/\s+/g, ".")}` : "";
  return `${tagName}${id}${className}`;
}
__name(getDisplayNameFromOuterHTML, "getDisplayNameFromOuterHTML");
export {
  INativeBrowserElementsService,
  getDisplayNameFromOuterHTML
};
//# sourceMappingURL=browserElements.js.map
