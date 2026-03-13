import { localize } from "../../nls.js";
import { registerColor, transparent } from "../../platform/theme/common/colorUtils.js";
import { contrastBorder, iconForeground } from "../../platform/theme/common/colorRegistry.js";
import { Color } from "../../base/common/color.js";
import { buttonBackground } from "../../platform/theme/common/colors/inputColors.js";
import { SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND } from "../../workbench/common/theme.js";
const sessionsSidebarBackground = registerColor("sessionsSidebar.background", SIDE_BAR_BACKGROUND, localize("sessionsSidebar.background", "Background color of the sidebar view in the agent sessions window."));
const sessionsSidebarBorder = registerColor("sessionsSidebar.border", { dark: Color.fromHex("#808080").transparent(0.35), light: Color.fromHex("#808080").transparent(0.35), hcDark: contrastBorder, hcLight: contrastBorder }, localize("sessionsSidebar.border", "Border color of the sidebar in the agent sessions window."));
const sessionsSidebarHeaderBackground = registerColor("sessionsSidebarHeader.background", SIDE_BAR_BACKGROUND, localize("sessionsSidebarHeader.background", "Background color of the sidebar header area in the agent sessions window."));
const sessionsSidebarHeaderForeground = registerColor("sessionsSidebarHeader.foreground", SIDE_BAR_FOREGROUND, localize("sessionsSidebarHeader.foreground", "Foreground color of the sidebar header area in the agent sessions window."));
const chatBarTitleBackground = registerColor("chatBarTitle.background", SIDE_BAR_BACKGROUND, localize("chatBarTitle.background", "Background color of the chat bar title area in the agent sessions window."));
const chatBarTitleForeground = registerColor("chatBarTitle.foreground", SIDE_BAR_FOREGROUND, localize("chatBarTitle.foreground", "Foreground color of the chat bar title area in the agent sessions window."));
const agentFeedbackInputWidgetBorder = registerColor("agentFeedbackInputWidget.border", { dark: transparent(iconForeground, 0.8), light: transparent(iconForeground, 0.8), hcDark: contrastBorder, hcLight: contrastBorder }, localize("agentFeedbackInputWidget.border", "Border color of the agent feedback input widget shown in the editor."));
const sessionsUpdateButtonDownloadingBackground = registerColor("sessionsUpdateButton.downloadingBackground", transparent(buttonBackground, 0.4), localize("sessionsUpdateButton.downloadingBackground", "Background color of the update button to show download progress in the agent sessions window."));
const sessionsUpdateButtonDownloadedBackground = registerColor("sessionsUpdateButton.downloadedBackground", transparent(buttonBackground, 0.7), localize("sessionsUpdateButton.downloadedBackground", "Background color of the update button when download is complete in the agent sessions window."));
export {
  agentFeedbackInputWidgetBorder,
  chatBarTitleBackground,
  chatBarTitleForeground,
  sessionsSidebarBackground,
  sessionsSidebarBorder,
  sessionsSidebarHeaderBackground,
  sessionsSidebarHeaderForeground,
  sessionsUpdateButtonDownloadedBackground,
  sessionsUpdateButtonDownloadingBackground
};
//# sourceMappingURL=theme.js.map
