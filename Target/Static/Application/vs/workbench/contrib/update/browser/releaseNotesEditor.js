import"./media/releasenoteseditor.css";import{CancellationToken as z}from"../../../../base/common/cancellation.js";import{$jb as _}from"../../../../base/common/errors.js";import{$Zj as y}from"../../../../base/common/htmlContent.js";import{$M0 as D}from"../../../../base/common/keybindingParser.js";import{$Bf as M}from"../../../../base/common/strings.js";import{URI as b}from"../../../../base/common/uri.js";import{$Rm as P}from"../../../../base/common/uuid.js";import{$xD as $}from"../../../../editor/common/languages.js";import{$RPb as q}from"../../../../editor/common/languages/supports/tokenization.js";import{$yD as I}from"../../../../editor/common/languages/language.js";import*as w from"../../../../nls.js";import{$fl as L}from"../../../../platform/environment/common/environment.js";import{$sx as j}from"../../../../platform/keybinding/common/keybinding.js";import{$X$ as A}from"../../../../platform/opener/common/opener.js";import{$nn as B}from"../../../../platform/product/common/productService.js";import{$ro as O,$mo as U}from"../../../../platform/request/common/request.js";import{$Zhc as W,$1hc as T}from"../../markdown/browser/markdownDocumentRenderer.js";import{$IYb as V}from"../../webviewPanel/browser/webviewWorkbenchService.js";import{$hI as H}from"../../../services/editor/common/editorGroupsService.js";import{$mI as K,$lI as Y}from"../../../services/editor/common/editorService.js";import{$ZO as Z}from"../../../services/extensions/common/extensions.js";import{$Gu as F,$Eu as G}from"../../../../platform/telemetry/common/telemetryUtils.js";import{$El as X}from"../../../../platform/configuration/common/configuration.js";import{$td as k}from"../../../../base/common/lifecycle.js";import{$fvc as J}from"../../markdown/browser/markdownSettingRenderer.js";import{$nj as Q}from"../../../../platform/instantiation/common/instantiation.js";import{Schemas as R}from"../../../../base/common/network.js";import{$4_ as ee}from"../../../../editor/browser/services/codeEditorService.js";import{$ih as te}from"../../../../base/common/resources.js";import{$4Tb as oe}from"../../webview/common/webview.js";var S=function(g,e,t,o){var a=arguments.length,n=a<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(g,e,t,o);else for(var r=g.length-1;r>=0;r--)(i=g[r])&&(n=(a<3?i(n):a>3?i(e,t,n):i(e,t))||n);return a>3&&n&&Object.defineProperty(e,t,n),n},d=function(g,e){return function(t,o){e(t,o,g)}};let E=class{constructor(e,t,o,a,n,i,r,m,h,u,s,f,v){this.g=e,this.h=t,this.i=o,this.j=a,this.k=n,this.l=i,this.m=r,this.n=m,this.o=h,this.p=u,this.q=s,this.r=f,this.s=v,this.b=new Map,this.c=void 0,this.f=new k,$.onDidChange(()=>this.t()),i.onDidChangeConfiguration(this.B,this,this.f),u.onDidChangeActiveWebviewEditor(this.C,this,this.f),this.a=this.s.createInstance(J)}async t(){if(!this.c||!this.d)return;const e=await this.A(this.d);this.c&&this.c.webview.setHtml(e)}async u(e){if(e){const t=this.o.getActiveCodeEditor()?.getModel()?.uri;if(t)return te(t)}return b.parse("https://code.visualstudio.com/raw")}async show(e,t){const o=await this.v(e,t),a=await this.u(t);this.d={text:o,base:a};const n=await this.A(this.d),i=w.localize(12555,null,e),r=this.m.activeEditorPane;if(this.c)this.c.setName(i),this.c.webview.setHtml(n),this.p.revealWebview(this.c,r?r.group:this.n.activeGroup,!1);else{this.c=this.p.openWebview({title:i,options:{tryRestoreScrollPosition:!0,enableFindWidget:!0,disableServiceWorker:!t},contentOptions:{localResourceRoots:t?[a]:[],allowScripts:!0},extension:void 0},"releaseNotes",i,{group:K,preserveFocus:!1}),this.c.webview.onDidClickLink(h=>this.w(b.parse(h)));const m=new k;m.add(this.c.webview.onMessage(h=>{if(h.message.type==="showReleaseNotes")this.l.updateValue("update.showReleaseNotes",h.message.value);else if(h.message.type==="clickSetting"){const u=this.c?.webview.container.offsetLeft+h.message.value.x,s=this.c?.webview.container.offsetTop+h.message.value.y;this.a.updateSetting(b.parse(h.message.value.uri),u,s)}})),m.add(this.c.onWillDispose(()=>{m.dispose(),this.c=void 0})),this.c.webview.setHtml(n)}return!0}async v(e,t){const o=/^(\d+\.\d+)\./.exec(e);if(!o)throw new Error("not found");const i=`https://code.visualstudio.com/raw/v${o[1].replace(/\./g,"_")}.md`,r=w.localize(12556,null),m=s=>M(s).replace(/\\/g,"\\\\"),h=s=>{const f=(p,c)=>{const l=this.h.lookupKeybinding(c);return l&&l.getLabel()||r},v=(p,c)=>{const l=D.parseKeybinding(c);if(!l)return r;const x=this.h.resolveKeybinding(l);return x.length===0?r:x[0].getLabel()||r},C=(p,c)=>{const l=f(p,c);return l&&`<code title="${c}">${m(l)}</code>`},N=(p,c)=>{const l=v(p,c);return l&&`<code title="${c}">${m(l)}</code>`};return s.replace(/`kb\(([a-z.\d\-]+)\)`/gi,C).replace(/`kbstyle\(([^\)]+)\)`/gi,N).replace(/kb\(([a-z.\d\-]+)\)/gi,(p,c)=>y(f(p,c))).replace(/kbstyle\(([^\)]+)\)/gi,(p,c)=>y(v(p,c)))},u=async()=>{let s;try{if(t){const f=this.o.getActiveCodeEditor()?.getModel()?.getValue();s=f?f.substring(f.indexOf("#")):void 0}else s=await O(await this.k.request({url:i},z.None))}catch{throw new Error("Failed to fetch release notes")}if(!s||!/^#\s/.test(s)&&!t)throw new Error("Invalid release notes");return h(s)};return t?u():(this.b.has(e)||this.b.set(e,(async()=>{try{return await u()}catch(s){throw this.b.delete(e),s}})()),this.b.get(e))}async w(e){e.scheme===R.codeSetting||this.z(e,"ReleaseNotes").then(t=>this.j.open(t,{allowCommands:["workbench.action.openSettings"]})).then(void 0,_)}async z(e,t,o="1"){return G(this.r,this.g)&&F(this.l)===3&&e.scheme==="https"&&e.authority==="code.visualstudio.com"?e.with({query:`${e.query?e.query+"&":""}utm_source=VsCode&utm_medium=${encodeURIComponent(t)}&utm_content=${encodeURIComponent(o)}`}):e}async A(e){const t=P(),o=await T(e.text,this.q,this.i,{shouldSanitize:!1,markedExtensions:[{renderer:{html:this.a.getHtmlRenderer(),codespan:this.a.getCodeSpanRenderer()}}]}),a=$.getColorMap(),n=a?q(a):"",i=!!this.l.getValue("update.showReleaseNotes");return`<!DOCTYPE html>
		<html>
			<head>
				<base href="${oe(e.base).toString(!0)}/" >
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${t}' https://code.visualstudio.com; script-src 'nonce-${t}';">
				<style nonce="${t}">
					${W}
					${n}

					/* codesetting */

					code:has(.codesetting) {
						background-color: var(--vscode-textPreformat-background);
						color: var(--vscode-textPreformat-foreground);
						padding-left: 1px;
						margin-right: 3px;
						padding-right: 0px;
					}

					code:has(.codesetting):focus {
						border: 1px solid var(--vscode-button-border, transparent);
					}

					.codesetting {
						color: var(--vscode-textPreformat-foreground);
						padding: 0px 1px 1px 0px;
						font-size: 0px;
						overflow: hidden;
						text-overflow: ellipsis;
						outline-offset: 2px !important;
						box-sizing: border-box;
						text-align: center;
						cursor: pointer;
						display: inline;
						margin-right: 3px;
					}
					.codesetting svg {
						font-size: 12px;
						text-align: center;
						cursor: pointer;
						border: 1px solid var(--vscode-button-secondaryBorder, transparent);
						outline: 1px solid transparent;
						line-height: 9px;
						margin-bottom: -5px;
						padding-left: 0px;
						padding-top: 2px;
						padding-bottom: 2px;
						padding-right: 2px;
						display: inline-block;
						text-decoration: none;
						text-rendering: auto;
						text-transform: none;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						user-select: none;
						-webkit-user-select: none;
					}
					.codesetting .setting-name {
						font-size: 13px;
						padding-left: 2px;
						padding-right: 3px;
						padding-top: 1px;
						padding-bottom: 1px;
						margin-top: -3px;
					}
					.codesetting:hover {
						color: var(--vscode-textPreformat-foreground) !important;
						text-decoration: none !important;
					}
					code:has(.codesetting):hover {
						filter: brightness(140%);
						text-decoration: none !important;
					}
					.codesetting:focus {
						outline: 0 !important;
						text-decoration: none !important;
						color: var(--vscode-button-hoverForeground) !important;
					}
					.codesetting .separator {
						width: 1px;
						height: 14px;
						margin-bottom: -3px;
						display: inline-block;
						background-color: var(--vscode-editor-background);
						font-size: 12px;
						margin-right: 4px;
					}

					header { display: flex; align-items: center; padding-top: 1em; }
				</style>
			</head>
			<body>
				${o}
				<script nonce="${t}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${i};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${w.localize(12557,null)}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					window.addEventListener('click', event => {
						const href = event.target.href ?? event.target.parentElement?.href ?? event.target.parentElement?.parentElement?.href;
						if (href && (href.startsWith('${R.codeSetting}'))) {
							vscode.postMessage({ type: 'clickSetting', value: { uri: href, x: event.clientX, y: event.clientY }});
						}
					});

					window.addEventListener('keypress', event => {
						if (event.keyCode === 13) {
							if (event.target.children.length > 0 && event.target.children[0].href) {
								const clientRect = event.target.getBoundingClientRect();
								vscode.postMessage({ type: 'clickSetting', value: { uri: event.target.children[0].href, x: clientRect.right , y: clientRect.bottom }});
							}
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				<\/script>
			</body>
		</html>`}B(e){e.affectsConfiguration("update.showReleaseNotes")&&this.D()}C(e){e&&e===this.c&&this.D()}D(){this.c&&this.c.webview.postMessage({type:"showReleaseNotes",value:this.l.getValue("update.showReleaseNotes")})}};E=S([d(0,L),d(1,j),d(2,I),d(3,A),d(4,U),d(5,X),d(6,Y),d(7,H),d(8,ee),d(9,V),d(10,Z),d(11,B),d(12,Q)],E);export{E as $gvc};
