var $=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var h=(c,e,n,t)=>{for(var o=t>1?void 0:t?k(e,n):e,r=c.length-1,i;r>=0;r--)(i=c[r])&&(o=(t?i(e,n,o):i(o))||o);return t&&o&&$(e,n,o),o},a=(c,e)=>(n,t)=>e(n,t,c);import{generateUuid as d}from"../../../../base/common/uuid.js";import{generateTokensCSSForColorMap as g}from"../../../../editor/common/languages/supports/tokenization.js";import{TokenizationRegistry as p}from"../../../../editor/common/languages.js";import{DEFAULT_MARKDOWN_STYLES as u,renderMarkdownDocument as w}from"../../markdown/browser/markdownDocumentRenderer.js";import"../../../../base/common/uri.js";import{language as y}from"../../../../base/common/platform.js";import{joinPath as b}from"../../../../base/common/resources.js";import{assertIsDefined as f}from"../../../../base/common/types.js";import{asWebviewUri as I}from"../../webview/common/webview.js";import{ResourceMap as v}from"../../../../base/common/map.js";import{IFileService as P}from"../../../../platform/files/common/files.js";import{INotificationService as U}from"../../../../platform/notification/common/notification.js";import{ILanguageService as L}from"../../../../editor/common/languages/language.js";import{IExtensionService as E}from"../../../services/extensions/common/extensions.js";import{gettingStartedContentRegistry as q}from"../common/gettingStartedContent.js";let l=class{constructor(e,n,t,o){this.fileService=e;this.notificationService=n;this.extensionService=t;this.languageService=o}mdCache=new v;svgCache=new v;async renderMarkdown(e,n){const t=await this.readAndCacheStepMarkdown(e,n),o=d(),r=p.getColorMap(),i=r?g(r):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${document.location.protocol==="http:"?"img-src https: data: http:":"img-src https: data:"}; media-src https:; script-src 'nonce-${o}'; style-src 'nonce-${o}';">
				<style nonce="${o}">
					${u}
					${i}
					body > img {
						align-self: flex-start;
					}
					body > img[centered] {
						align-self: center;
					}
					body {
						display: flex;
						flex-direction: column;
						padding: 0;
						height: inherit;
					}
					.theme-picker-row {
						display: flex;
						justify-content: center;
						gap: 32px;
					}
					checklist {
						display: flex;
						gap: 32px;
						flex-direction: column;
					}
					checkbox {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin: 5px;
						cursor: pointer;
					}
					checkbox > img {
						margin-bottom: 8px !important;
					}
					checkbox.checked > img {
						box-sizing: border-box;
					}
					checkbox.checked > img {
						outline: 2px solid var(--vscode-focusBorder);
						outline-offset: 4px;
						border-radius: 4px;
					}
					.theme-picker-link {
						margin-top: 16px;
						color: var(--vscode-textLink-foreground);
					}
					blockquote > p:first-child {
						margin-top: 0;
					}
					body > * {
						margin-block-end: 0.25em;
						margin-block-start: 0.25em;
					}
					vertically-centered {
						padding-top: 5px;
						padding-bottom: 5px;
						display: flex;
						justify-content: center;
						flex-direction: column;
					}
					html {
						height: 100%;
						padding-right: 32px;
					}
					h1 {
						font-size: 19.5px;
					}
					h2 {
						font-size: 18.5px;
					}
				</style>
			</head>
			<body>
				<vertically-centered>
					${t}
				</vertically-centered>
			</body>
			<script nonce="${o}">
				const vscode = acquireVsCodeApi();

				document.querySelectorAll('[when-checked]').forEach(el => {
					el.addEventListener('click', () => {
						vscode.postMessage(el.getAttribute('when-checked'));
					});
				});

				let ongoingLayout = undefined;
				const doLayout = () => {
					document.querySelectorAll('vertically-centered').forEach(element => {
						element.style.marginTop = Math.max((document.body.clientHeight - element.scrollHeight) * 3/10, 0) + 'px';
					});
					ongoingLayout = undefined;
				};

				const layout = () => {
					if (ongoingLayout) {
						clearTimeout(ongoingLayout);
					}
					ongoingLayout = setTimeout(doLayout, 0);
				};

				layout();

				document.querySelectorAll('img').forEach(element => {
					element.onload = layout;
				})

				window.addEventListener('message', event => {
					if (event.data.layoutMeNow) {
						layout();
					}
					if (event.data.enabledContextKeys) {
						document.querySelectorAll('.checked').forEach(element => element.classList.remove('checked'))
						for (const key of event.data.enabledContextKeys) {
							document.querySelectorAll('[checked-on="' + key + '"]').forEach(element => element.classList.add('checked'))
						}
					}
				});
		</script>
		</html>`}async renderSVG(e){const n=await this.readAndCacheSVGFile(e),t=d(),o=p.getColorMap(),r=o?g(o):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${t}';">
				<style nonce="${t}">
					${u}
					${r}
					svg {
						position: fixed;
						height: 100%;
						width: 80%;
						left: 50%;
						top: 50%;
						max-width: 530px;
						min-width: 350px;
						transform: translate(-50%,-50%);
					}
				</style>
			</head>
			<body>
				${n}
			</body>
		</html>`}async renderVideo(e,n,t){const o=d();return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; media-src https:; script-src 'nonce-${o}'; style-src 'nonce-${o}';">
				<style nonce="${o}">
					video {
						max-width: 100%;
						max-height: 100%;
						object-fit: cover;
					}
				</style>
			</head>
			<body>
				<video controls autoplay ${n?`poster="${n.toString(!0)}"`:""} muted ${t?`aria-label="${t}"`:""}>
					<source src="${e.toString(!0)}" type="video/mp4">
				</video>
			</body>
		</html>`}async readAndCacheSVGFile(e){if(!this.svgCache.has(e)){const n=await this.readContentsOfPath(e,!1);this.svgCache.set(e,n)}return f(this.svgCache.get(e))}async readAndCacheStepMarkdown(e,n){if(!this.mdCache.has(e)){const t=await this.readContentsOfPath(e),o=await w(M(t,n),this.extensionService,this.languageService,{allowUnknownProtocols:!0});this.mdCache.set(e,o)}return f(this.mdCache.get(e))}async readContentsOfPath(e,n=!0){try{const t=JSON.parse(e.query).moduleId;if(n&&t)return await new Promise((r,i)=>{const s=q.getProvider(t);s?r(s()):i(`Getting started: no provider registered for ${t}`)})}catch{}try{const t=e.with({path:e.path.replace(/\.md$/,`.nls.${y}.md`)}),o=y?.replace(/-.*$/,""),r=e.with({path:e.path.replace(/\.md$/,`.nls.${o}.md`)}),i=S=>this.fileService.stat(S).then(C=>!!C.size).catch(()=>!1),[s,m]=await Promise.all([i(t),i(r)]);return(await this.fileService.readFile(s?t:m?r:e)).value.toString()}catch(t){return this.notificationService.error("Error reading markdown document at `"+e+"`: "+t),""}}};l=h([a(0,P),a(1,U),a(2,E),a(3,L)],l);const x=(c,e)=>{const n=b(e,c);return I(n).toString(!0)},M=(c,e)=>c.replace(/src="([^"]*)"/g,(n,t)=>t.startsWith("https://")?`src="${t}"`:`src="${x(t,e)}"`).replace(/!\[([^\]]*)\]\(([^)]*)\)/g,(n,t,o)=>o.startsWith("https://")?`![${t}](${o})`:`![${t}](${x(o,e)})`);export{l as GettingStartedDetailsRenderer};
