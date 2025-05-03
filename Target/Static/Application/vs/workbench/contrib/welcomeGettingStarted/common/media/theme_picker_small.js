import{escape as c}from"../../../../../base/common/strings.js";import{localize as h}from"../../../../../nls.js";import{ThemeSettingDefaults as e}from"../../../../services/themes/common/workbenchThemeService.js";var t=()=>`
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_DARK}'">
			<img width="150" src="./dark.png"/>
			${c(h("dark","Dark Modern"))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_LIGHT}'">
			<img width="150" src="./light.png"/>
			${c(h("light","Light Modern"))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_DARK}'">
			<img width="150" src="./dark-hc.png"/>
			${c(h("HighContrast","Dark High Contrast"))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_LIGHT}'">
			<img width="150" src="./light-hc.png"/>
			${c(h("HighContrastLight","Light High Contrast"))}
		</checkbox>
	</div>
</checklist>
`;export{t as default};
