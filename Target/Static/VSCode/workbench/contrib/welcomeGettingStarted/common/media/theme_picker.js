import{$Yf as c}from"../../../../../base/common/strings.js";import{localize as h}from"../../../../../nls.js";import{ThemeSettingDefaults as e}from"../../../../services/themes/common/workbenchThemeService.js";var i=()=>`
<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_DARK}'">
			<img width="200" src="./dark.png"/>
			${c(h(15326,null))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_LIGHT}'">
			<img width="200" src="./light.png"/>
			${c(h(15327,null))}
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_DARK}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_DARK}'">
			<img width="200" src="./dark-hc.png"/>
			${c(h(15328,null))}
		</checkbox>
		<checkbox when-checked="setTheme:${e.COLOR_THEME_HC_LIGHT}" checked-on="config.workbench.colorTheme == '${e.COLOR_THEME_HC_LIGHT}'">
			<img width="200" src="./light-hc.png"/>
			${c(h(15329,null))}
		</checkbox>
	</div>
</checklist>
<checkbox class="theme-picker-link" when-checked="command:workbench.action.selectTheme" checked-on="false">
	${c(h(15330,null))}
</checkbox>
`;export{i as default};
