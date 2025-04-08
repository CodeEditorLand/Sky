var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { buffer, ExtractError } from "../../../base/node/zip.js";
import { localize } from "../../../nls.js";
import { toExtensionManagementError } from "../common/abstractExtensionManagementService.js";
import { ExtensionManagementError, ExtensionManagementErrorCode } from "../common/extensionManagement.js";
import { IExtensionManifest } from "../../extensions/common/extensions.js";
function fromExtractError(e) {
  let errorCode = ExtensionManagementErrorCode.Extract;
  if (e instanceof ExtractError) {
    if (e.type === "CorruptZip") {
      errorCode = ExtensionManagementErrorCode.CorruptZip;
    } else if (e.type === "Incomplete") {
      errorCode = ExtensionManagementErrorCode.IncompleteZip;
    }
  }
  return toExtensionManagementError(e, errorCode);
}
__name(fromExtractError, "fromExtractError");
async function getManifest(vsixPath) {
  let data;
  try {
    data = await buffer(vsixPath, "extension/package.json");
  } catch (e) {
    throw fromExtractError(e);
  }
  try {
    return JSON.parse(data.toString("utf8"));
  } catch (err) {
    throw new ExtensionManagementError(localize("invalidManifest", "VSIX invalid: package.json is not a JSON file."), ExtensionManagementErrorCode.Invalid);
  }
}
__name(getManifest, "getManifest");
export {
  fromExtractError,
  getManifest
};
//# sourceMappingURL=extensionManagementUtil.js.map
