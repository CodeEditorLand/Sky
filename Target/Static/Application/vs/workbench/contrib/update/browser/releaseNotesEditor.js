var E=function(v,e,t,o){var a=arguments.length,i=a<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(v,e,t,o);else for(var s=v.length-1;s>=0;s--)(r=v[s])&&(i=(a<3?r(i):a>3?r(e,t,i):r(e,t))||i);return a>3&&i&&Object.defineProperty(e,t,i),i},l=function(v,e){return function(t,o){e(t,o,v)}};import"./media/releasenoteseditor.css";import{CancellationToken as I}from"../../../../base/common/cancellation.js";import{onUnexpectedError as M}from"../../../../base/common/errors.js";import{escapeMarkdownSyntaxTokens as y}from"../../../../base/common/htmlContent.js";import{KeybindingParser as $}from"../../../../base/common/keybindingParser.js";import{escape as W}from"../../../../base/common/strings.js";import{URI as b}from"../../../../base/common/uri.js";import{generateUuid as D}from"../../../../base/common/uuid.js";import{TokenizationRegistry as S}from"../../../../editor/common/languages.js";import{generateTokensCSSForColorMap as L}from"../../../../editor/common/languages/supports/tokenization.js";import{ILanguageService as P}from"../../../../editor/common/languages/language.js";import*as w from"../../../../nls.js";import{IEnvironmentService as T}from"../../../../platform/environment/common/environment.js";import{IKeybindingService as z}from"../../../../platform/keybinding/common/keybinding.js";import{IOpenerService as U}from"../../../../platform/opener/common/opener.js";import{IProductService as q}from"../../../../platform/product/common/productService.js";import{asTextOrError as A,IRequestService as O}from"../../../../platform/request/common/request.js";import{DEFAULT_MARKDOWN_STYLES as B,renderMarkdownDocument as K}from"../../markdown/browser/markdownDocumentRenderer.js";import{IWebviewWorkbenchService as G}from"../../webviewPanel/browser/webviewWorkbenchService.js";import{IEditorGroupsService as H}from"../../../services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as V,IEditorService as F}from"../../../services/editor/common/editorService.js";import{IExtensionService as j}from"../../../services/extensions/common/extensions.js";import{getTelemetryLevel as Y,supportsTelemetry as X}from"../../../../platform/telemetry/common/telemetryUtils.js";import{IConfigurationService as J}from"../../../../platform/configuration/common/configuration.js";import{DisposableStore as R}from"../../../../base/common/lifecycle.js";import{SimpleSettingRenderer as Q}from"../../markdown/browser/markdownSettingRenderer.js";import{IInstantiationService as Z}from"../../../../platform/instantiation/common/instantiation.js";import{Schemas as k}from"../../../../base/common/network.js";import{ICodeEditorService as ee}from"../../../../editor/browser/services/codeEditorService.js";import{dirname as te}from"../../../../base/common/resources.js";import{asWebviewUri as oe}from"../../webview/common/webview.js";let _=class{constructor(e,t,o,a,i,r,s,m,p,g,n,u,f){this._environmentService=e,this._keybindingService=t,this._languageService=o,this._openerService=a,this._requestService=i,this._configurationService=r,this._editorService=s,this._editorGroupService=m,this._codeEditorService=p,this._webviewWorkbenchService=g,this._extensionService=n,this._productService=u,this._instantiationService=f,this._releaseNotesCache=new Map,this._currentReleaseNotes=void 0,this.disposables=new R,S.onDidChange(()=>this.updateHtml()),r.onDidChangeConfiguration(this.onDidChangeConfiguration,this,this.disposables),g.onDidChangeActiveWebviewEditor(this.onDidChangeActiveWebviewEditor,this,this.disposables),this._simpleSettingRenderer=this._instantiationService.createInstance(Q)}async updateHtml(){if(!this._currentReleaseNotes||!this._lastMeta)return;const e=await this.renderBody(this._lastMeta);this._currentReleaseNotes&&this._currentReleaseNotes.webview.setHtml(e)}async getBase(e){if(e){const t=this._codeEditorService.getActiveCodeEditor()?.getModel()?.uri;if(t)return te(t)}return b.parse("https://code.visualstudio.com/raw")}async show(e,t){const o=await this.loadReleaseNotes(e,t),a=await this.getBase(t);this._lastMeta={text:o,base:a};const i=await this.renderBody(this._lastMeta),r=w.localize("releaseNotesInputName","Release Notes: {0}",e),s=this._editorService.activeEditorPane;if(this._currentReleaseNotes)this._currentReleaseNotes.setName(r),this._currentReleaseNotes.webview.setHtml(i),this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes,s?s.group:this._editorGroupService.activeGroup,!1);else{this._currentReleaseNotes=this._webviewWorkbenchService.openWebview({title:r,options:{tryRestoreScrollPosition:!0,enableFindWidget:!0,disableServiceWorker:!t},contentOptions:{localResourceRoots:t?[a]:[],allowScripts:!0},extension:void 0},"releaseNotes",r,{group:V,preserveFocus:!1}),this._currentReleaseNotes.webview.onDidClickLink(p=>this.onDidClickLink(b.parse(p)));const m=new R;m.add(this._currentReleaseNotes.webview.onMessage(p=>{if(p.message.type==="showReleaseNotes")this._configurationService.updateValue("update.showReleaseNotes",p.message.value);else if(p.message.type==="clickSetting"){const g=this._currentReleaseNotes?.webview.container.offsetLeft+p.message.value.x,n=this._currentReleaseNotes?.webview.container.offsetTop+p.message.value.y;this._simpleSettingRenderer.updateSetting(b.parse(p.message.value.uri),g,n)}})),m.add(this._currentReleaseNotes.onWillDispose(()=>{m.dispose(),this._currentReleaseNotes=void 0})),this._currentReleaseNotes.webview.setHtml(i)}return!0}async loadReleaseNotes(e,t){const o=/^(\d+\.\d+)\./.exec(e);if(!o)throw new Error("not found");const r=`https://code.visualstudio.com/raw/v${o[1].replace(/\./g,"_")}.md`,s=w.localize("unassigned","unassigned"),m=n=>W(n).replace(/\\/g,"\\\\"),p=n=>{const u=(h,c)=>{const d=this._keybindingService.lookupKeybinding(c);return d&&d.getLabel()||s},f=(h,c)=>{const d=$.parseKeybinding(c);if(!d)return s;const x=this._keybindingService.resolveKeybinding(d);return x.length===0?s:x[0].getLabel()||s},N=(h,c)=>{const d=u(h,c);return d&&`<code title="${c}">${m(d)}</code>`},C=(h,c)=>{const d=f(h,c);return d&&`<code title="${c}">${m(d)}</code>`};return n.replace(/`kb\(([a-z.\d\-]+)\)`/gi,N).replace(/`kbstyle\(([^\)]+)\)`/gi,C).replace(/kb\(([a-z.\d\-]+)\)/gi,(h,c)=>y(u(h,c))).replace(/kbstyle\(([^\)]+)\)/gi,(h,c)=>y(f(h,c)))},g=async()=>{let n;try{if(t){const u=this._codeEditorService.getActiveCodeEditor()?.getModel()?.getValue();n=u?u.substring(u.indexOf("#")):void 0}else n=await A(await this._requestService.request({url:r},I.None))}catch{throw new Error("Failed to fetch release notes")}if(!n||!/^#\s/.test(n)&&!t)throw new Error("Invalid release notes");return p(n)};return t?g():(this._releaseNotesCache.has(e)||this._releaseNotesCache.set(e,(async()=>{try{return await g()}catch(n){throw this._releaseNotesCache.delete(e),n}})()),this._releaseNotesCache.get(e))}async onDidClickLink(e){e.scheme===k.codeSetting||this.addGAParameters(e,"ReleaseNotes").then(t=>this._openerService.open(t,{allowCommands:["workbench.action.openSettings"]})).then(void 0,M)}async addGAParameters(e,t,o="1"){return X(this._productService,this._environmentService)&&Y(this._configurationService)===3&&e.scheme==="https"&&e.authority==="code.visualstudio.com"?e.with({query:`${e.query?e.query+"&":""}utm_source=VsCode&utm_medium=${encodeURIComponent(t)}&utm_content=${encodeURIComponent(o)}`}):e}async renderBody(e){const t=D(),o=await K(e.text,this._extensionService,this._languageService,{shouldSanitize:!1,markedExtensions:[{renderer:{html:this._simpleSettingRenderer.getHtmlRenderer(),codespan:this._simpleSettingRenderer.getCodeSpanRenderer()}}]}),a=S.getColorMap(),i=a?L(a):"",r=!!this._configurationService.getValue("update.showReleaseNotes");return`<!DOCTYPE html>
		<html>
			<head>
				<base href="${oe(e.base).toString(!0)}/" >
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${t}' https://code.visualstudio.com; script-src 'nonce-${t}';">
				<style nonce="${t}">
					${B}
					${i}

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
					input.checked = ${r};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${w.localize("showOnUpdate","Show release notes after an update")}';
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
						if (href && (href.startsWith('${k.codeSetting}'))) {
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
				</script>
			</body>
		</html>`}onDidChangeConfiguration(e){e.affectsConfiguration("update.showReleaseNotes")&&this.updateCheckboxWebview()}onDidChangeActiveWebviewEditor(e){e&&e===this._currentReleaseNotes&&this.updateCheckboxWebview()}updateCheckboxWebview(){this._currentReleaseNotes&&this._currentReleaseNotes.webview.postMessage({type:"showReleaseNotes",value:this._configurationService.getValue("update.showReleaseNotes")})}};_=E([l(0,T),l(1,z),l(2,P),l(3,U),l(4,O),l(5,J),l(6,F),l(7,H),l(8,ee),l(9,G),l(10,j),l(11,q),l(12,Z)],_);export{_ as ReleaseNotesManager};
