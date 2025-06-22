import{$Cf as o}from"../../../../../base/common/strings.js";import{localize as e}from"../../../../../nls.js";const c=t=>encodeURIComponent(JSON.stringify({profile:t})),n=400;var b=()=>`
<vertically-centered>
<checklist>
	<checkbox on-checked="command:notebook.setProfile?${c("default")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'both' && config.notebook.globalToolbar == false && config.notebook.compactView == true && config.notebook.showCellStatusBar == 'visible'">
		<img width="${n}" src="./notebookThemes/default.png"/>
		${o(e(13334,null))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${c("jupyter")}" checked-on="config.notebook.cellFocusIndicator == 'gutter' && config.notebook.insertToolbarLocation == 'notebookToolbar' && config.notebook.globalToolbar == true && config.notebook.compactView == true  && config.notebook.showCellStatusBar == 'visible'">
		<img width="${n}" src="./notebookThemes/jupyter.png"/>
		${o(e(13335,null))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${c("colab")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'betweenCells' && config.notebook.globalToolbar == false && config.notebook.compactView == false && config.notebook.showCellStatusBar == 'hidden'">
		<img width="${n}" src="./notebookThemes/colab.png"/>
		${o(e(13336,null))}
	</checkbox>
</checklist>
</vertically-centered>
`;export{b as default};
