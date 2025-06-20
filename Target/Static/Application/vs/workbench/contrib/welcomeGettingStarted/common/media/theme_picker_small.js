import{$Cf as c}from"../../../../../base/common/strings.js";import{localize as h}from"../../../../../nls.js";import{ThemeSettingDefaults as e}from"../../../../services/themes/common/workbenchThemeService.js";var n=()=>`
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_DARK}'">
			<img width="150" src="./dark.png"/>
			${c(h(13337,null))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_LIGHT}'">
			<img width="150" src="./light.png"/>
			${c(h(13338,null))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_DARK}'">
			<img width="150" src="./dark-hc.png"/>
			${c(h(13339,null))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_LIGHT}'">
			<img width="150" src="./light-hc.png"/>
			${c(h(13340,null))}
		</checkbox>
	</div>
</checklist>
`;export{n as default};
