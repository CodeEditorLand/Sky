import{$uk as l}from"../../../../../base/common/htmlContent.js";import{$Yf as o}from"../../../../../base/common/strings.js";import{localize as e}from"../../../../../nls.js";const c=n=>l("notebook.setProfile",{profile:n}).toString(),t=400;var a=()=>`
<vertically-centered>
<checklist>
	<checkbox on-checked="${c("default")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'both' && config.notebook.globalToolbar == false && config.notebook.compactView == true && config.notebook.showCellStatusBar == 'visible'">
		<img width="${t}" src="./notebookThemes/default.png"/>
		${o(e(15319,null))}
	</checkbox>
	<checkbox on-checked="${c("jupyter")}" checked-on="config.notebook.cellFocusIndicator == 'gutter' && config.notebook.insertToolbarLocation == 'notebookToolbar' && config.notebook.globalToolbar == true && config.notebook.compactView == true  && config.notebook.showCellStatusBar == 'visible'">
		<img width="${t}" src="./notebookThemes/jupyter.png"/>
		${o(e(15320,null))}
	</checkbox>
	<checkbox on-checked="${c("colab")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'betweenCells' && config.notebook.globalToolbar == false && config.notebook.compactView == false && config.notebook.showCellStatusBar == 'hidden'">
		<img width="${t}" src="./notebookThemes/colab.png"/>
		${o(e(15321,null))}
	</checkbox>
</checklist>
</vertically-centered>
`;export{a as default};
