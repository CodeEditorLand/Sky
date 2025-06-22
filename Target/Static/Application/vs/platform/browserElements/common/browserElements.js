import { createDecorator } from "../../instantiation/common/instantiation.js";
const INativeBrowserElementsService = createDecorator("nativeBrowserElementsService");
var BrowserType;
(function(BrowserType2) {
  BrowserType2["SimpleBrowser"] = "simpleBrowser";
  BrowserType2["LiveServer"] = "liveServer";
})(BrowserType || (BrowserType = {}));
export {
  BrowserType,
  INativeBrowserElementsService
};
//# sourceMappingURL=browserElements.js.map
