var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fromNow } from "../../../base/common/date.js";
import { isLinuxSnap } from "../../../base/common/platform.js";
import { localize } from "../../../nls.js";
import { process } from "../../../base/parts/sandbox/electron-browser/globals.js";
function createNativeAboutDialogDetails(productService, osProps) {
  let version = productService.version;
  if (productService.target) {
    version = `${version} (${productService.target} setup)`;
  } else if (productService.darwinUniversalAssetId) {
    version = `${version} (Universal)`;
  }
  const getDetails = /* @__PURE__ */ __name((useAgo) => {
    return localize({ key: "aboutDetail", comment: ["Electron, Chromium, Node.js and V8 are product names that need no translation"] }, "Version: {0}\nCommit: {1}\nDate: {2}\nElectron: {3}\nElectronBuildId: {4}\nChromium: {5}\nNode.js: {6}\nV8: {7}\nOS: {8}", version, productService.commit || "Unknown", productService.date ? `${productService.date}${useAgo ? " (" + fromNow(new Date(productService.date), true) + ")" : ""}` : "Unknown", process.versions["electron"], process.versions["microsoft-build"], process.versions["chrome"], process.versions["node"], process.versions["v8"], `${osProps.type} ${osProps.arch} ${osProps.release}${isLinuxSnap ? " snap" : ""}`);
  }, "getDetails");
  const details = getDetails(true);
  const detailsToCopy = getDetails(false);
  return {
    title: productService.nameLong,
    details,
    detailsToCopy
  };
}
__name(createNativeAboutDialogDetails, "createNativeAboutDialogDetails");
export {
  createNativeAboutDialogDetails
};
//# sourceMappingURL=dialog.js.map
