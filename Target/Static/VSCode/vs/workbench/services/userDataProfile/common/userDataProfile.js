var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isUndefined } from "../../../../base/common/types.js";
import { Event } from "../../../../base/common/event.js";
import { localize, localize2 } from "../../../../nls.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfileUpdateOptions, ProfileResourceType, ProfileResourceTypeFlags } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { URI } from "../../../../base/common/uri.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ITreeItem, ITreeItemLabel } from "../../../common/views.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
const IUserDataProfileService = createDecorator("IUserDataProfileService");
const IUserDataProfileManagementService = createDecorator("IUserDataProfileManagementService");
function isUserDataProfileTemplate(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && (isUndefined(candidate.settings) || typeof candidate.settings === "string") && (isUndefined(candidate.globalState) || typeof candidate.globalState === "string") && (isUndefined(candidate.extensions) || typeof candidate.extensions === "string"));
}
__name(isUserDataProfileTemplate, "isUserDataProfileTemplate");
const PROFILE_URL_AUTHORITY = "profile";
function toUserDataProfileUri(path, productService) {
  return URI.from({
    scheme: productService.urlProtocol,
    authority: PROFILE_URL_AUTHORITY,
    path: path.startsWith("/") ? path : `/${path}`
  });
}
__name(toUserDataProfileUri, "toUserDataProfileUri");
const PROFILE_URL_AUTHORITY_PREFIX = "profile-";
function isProfileURL(uri) {
  return uri.authority === PROFILE_URL_AUTHORITY || new RegExp(`^${PROFILE_URL_AUTHORITY_PREFIX}`).test(uri.authority);
}
__name(isProfileURL, "isProfileURL");
const IUserDataProfileImportExportService = createDecorator("IUserDataProfileImportExportService");
const defaultUserDataProfileIcon = registerIcon("defaultProfile-icon", Codicon.settings, localize("defaultProfileIcon", "Icon for Default Profile."));
const PROFILES_TITLE = localize2("profiles", "Profiles");
const PROFILES_CATEGORY = { ...PROFILES_TITLE };
const PROFILE_EXTENSION = "code-profile";
const PROFILE_FILTER = [{ name: localize("profile", "Profile"), extensions: [PROFILE_EXTENSION] }];
const CURRENT_PROFILE_CONTEXT = new RawContextKey("currentProfile", "");
const IS_CURRENT_PROFILE_TRANSIENT_CONTEXT = new RawContextKey("isCurrentProfileTransient", false);
const HAS_PROFILES_CONTEXT = new RawContextKey("hasProfiles", false);
export {
  CURRENT_PROFILE_CONTEXT,
  HAS_PROFILES_CONTEXT,
  IS_CURRENT_PROFILE_TRANSIENT_CONTEXT,
  IUserDataProfileImportExportService,
  IUserDataProfileManagementService,
  IUserDataProfileService,
  PROFILES_CATEGORY,
  PROFILES_TITLE,
  PROFILE_EXTENSION,
  PROFILE_FILTER,
  PROFILE_URL_AUTHORITY,
  PROFILE_URL_AUTHORITY_PREFIX,
  defaultUserDataProfileIcon,
  isProfileURL,
  isUserDataProfileTemplate,
  toUserDataProfileUri
};
//# sourceMappingURL=userDataProfile.js.map
