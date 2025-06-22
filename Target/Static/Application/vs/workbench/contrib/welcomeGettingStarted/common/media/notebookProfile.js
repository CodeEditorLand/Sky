var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { escape } from "../../../../../base/common/strings.js";
import { localize } from "../../../../../nls.js";
const profileArg = /* @__PURE__ */ __name((profile) => encodeURIComponent(JSON.stringify({ profile })), "profileArg");
const imageSize = 400;
var notebookProfile_default = /* @__PURE__ */ __name(() => `
<vertically-centered>
<checklist>
	<checkbox on-checked="command:notebook.setProfile?${profileArg("default")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'both' && config.notebook.globalToolbar == false && config.notebook.compactView == true && config.notebook.showCellStatusBar == 'visible'">
		<img width="${imageSize}" src="./notebookThemes/default.png"/>
		${escape(localize("default", "Default"))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${profileArg("jupyter")}" checked-on="config.notebook.cellFocusIndicator == 'gutter' && config.notebook.insertToolbarLocation == 'notebookToolbar' && config.notebook.globalToolbar == true && config.notebook.compactView == true  && config.notebook.showCellStatusBar == 'visible'">
		<img width="${imageSize}" src="./notebookThemes/jupyter.png"/>
		${escape(localize("jupyter", "Jupyter"))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${profileArg("colab")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'betweenCells' && config.notebook.globalToolbar == false && config.notebook.compactView == false && config.notebook.showCellStatusBar == 'hidden'">
		<img width="${imageSize}" src="./notebookThemes/colab.png"/>
		${escape(localize("colab", "Colab"))}
	</checkbox>
</checklist>
</vertically-centered>
`, "default");
export {
  notebookProfile_default as default
};
//# sourceMappingURL=notebookProfile.js.map
