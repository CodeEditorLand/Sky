import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
let productObj = { BUILD_INSERT_PRODUCT_CONFIGURATION: "BUILD_INSERT_PRODUCT_CONFIGURATION" };
if (productObj["BUILD_INSERT_PRODUCT_CONFIGURATION"]) {
  productObj = require2("../product.json");
}
let pkgObj = { BUILD_INSERT_PACKAGE_CONFIGURATION: "BUILD_INSERT_PACKAGE_CONFIGURATION" };
if (pkgObj["BUILD_INSERT_PACKAGE_CONFIGURATION"]) {
  pkgObj = require2("../package.json");
}
if (process.isEmbeddedApp) {
  try {
    const productSubObj = require2("../product.sub.json");
    productObj = Object.assign(productObj, productSubObj);
  } catch (error) {
  }
  try {
    const pkgSubObj = require2("../package.sub.json");
    pkgObj = Object.assign(pkgObj, pkgSubObj);
  } catch (error) {
  }
}
let productOverridesObj = {};
if (process.env["VSCODE_DEV"]) {
  try {
    productOverridesObj = require2("../product.overrides.json");
    productObj = Object.assign(productObj, productOverridesObj);
  } catch (error) {
  }
}
const product = productObj;
const pkg = pkgObj;
export {
  pkg,
  product
};
//# sourceMappingURL=bootstrap-meta.js.map
