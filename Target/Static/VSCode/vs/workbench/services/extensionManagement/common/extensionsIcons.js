import { Codicon } from "../../../../base/common/codicons.js";
import { localize } from "../../../../nls.js";
import { registerColor, textLinkForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const verifiedPublisherIcon = registerIcon("extensions-verified-publisher", Codicon.verifiedFilled, localize("verifiedPublisher", "Icon used for the verified extension publisher in the extensions view and editor."));
const extensionVerifiedPublisherIconColor = registerColor("extensionIcon.verifiedForeground", textLinkForeground, localize("extensionIconVerifiedForeground", "The icon color for extension verified publisher."), false);
export {
  extensionVerifiedPublisherIconColor,
  verifiedPublisherIcon
};
//# sourceMappingURL=extensionsIcons.js.map
