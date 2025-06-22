var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { escape } from "../../../../../base/common/strings.js";
import { localize } from "../../../../../nls.js";
import { ThemeSettingDefaults } from "../../../../services/themes/common/workbenchThemeService.js";
var theme_picker_default = /* @__PURE__ */ __name(() => `
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_DARK}'">
			<img width="200" src="./dark.png"/>
			${escape(localize("dark", "Dark Modern"))}
		</checkbox>
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_LIGHT}'">
			<img width="200" src="./light.png"/>
			${escape(localize("light", "Light Modern"))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_HC_DARK}'">
			<img width="200" src="./dark-hc.png"/>
			${escape(localize("HighContrast", "Dark High Contrast"))}
		</checkbox>
		<checkbox when-checked="setTheme:${ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${ThemeSettingDefaults.COLOR_THEME_HC_LIGHT}'">
			<img width="200" src="./light-hc.png"/>
			${escape(localize("HighContrastLight", "Light High Contrast"))}
		</checkbox>
	</div>
</checklist>
<checkbox class="theme-picker-link" when-checked="command:workbench.action.selectTheme" checked-on="false">
	${escape(localize("seeMore", "See More Themes..."))}
</checkbox>
`, "default");
export {
  theme_picker_default as default
};
//# sourceMappingURL=theme_picker.js.map
