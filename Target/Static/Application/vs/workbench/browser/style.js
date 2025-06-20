import"./media/style.css";import{$St as i}from"../../platform/theme/common/themeService.js";import{$eub as d,$iwb as a}from"../common/theme.js";import{$s as l,$v as u}from"../../base/common/platform.js";import{$r6 as b}from"../../base/browser/dom.js";import{$r5 as f,$v5 as $}from"../../base/browser/browser.js";import{$Ip as k}from"../../platform/theme/common/colorRegistry.js";import{$c5 as s}from"../../base/browser/window.js";i((t,e)=>{const r=d(t);e.addRule(`.monaco-workbench { background-color: ${r}; }`);const n=t.getColor(k);if(n&&e.addRule(`.monaco-workbench ::selection { background-color: ${n}; }`),l){const c=t.getColor(a);if(c){const m="monaco-workbench-meta-theme-color";let o=s.document.getElementById(m);o||(o=b(),o.name="theme-color",o.id=m),o.content=c.toString()}}f&&e.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`),u&&$()&&e.addRule(`body { background-color: ${r}; }`)});
