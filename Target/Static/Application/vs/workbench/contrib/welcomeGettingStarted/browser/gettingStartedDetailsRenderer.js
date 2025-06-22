import{$Rm as l}from"../../../../base/common/uuid.js";import{$aQb as m}from"../../../../editor/common/languages/supports/tokenization.js";import{$AD as h}from"../../../../editor/common/languages.js";import{$hhc as p,$ihc as w}from"../../markdown/browser/markdownDocumentRenderer.js";import{$A as u}from"../../../../base/common/platform.js";import{$kh as k}from"../../../../base/common/resources.js";import{$$c as f}from"../../../../base/common/types.js";import{$2Sb as C}from"../../webview/common/webview.js";import{$Ic as y}from"../../../../base/common/map.js";import{$5j as S}from"../../../../platform/files/common/files.js";import{$RI as L}from"../../../../platform/notification/common/notification.js";import{$BD as q}from"../../../../editor/common/languages/language.js";import{$XO as E}from"../../../services/extensions/common/extensions.js";import{$Cuc as P}from"../common/gettingStartedContent.js";var b=function(i,t,n,e){var o=arguments.length,r=o<3?t:e===null?e=Object.getOwnPropertyDescriptor(t,n):e,c;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,t,n,e);else for(var s=i.length-1;s>=0;s--)(c=i[s])&&(r=(o<3?c(r):o>3?c(t,n,r):c(t,n))||r);return o>3&&r&&Object.defineProperty(t,n,r),r},a=function(i,t){return function(n,e){t(n,e,i)}};let g=class{constructor(t,n,e,o){this.c=t,this.d=n,this.f=e,this.g=o,this.a=new y,this.b=new y}async renderMarkdown(t,n){const e=await this.i(t,n),o=l(),r=h.getColorMap(),c=r?m(r):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${document.location.protocol==="http:"?"img-src https: data: http:":"img-src https: data:"}; media-src https:; script-src 'nonce-${o}'; style-src 'nonce-${o}';">
				<style nonce="${o}">
					${p}
					${c}
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
					${e}
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
		<\/script>
		</html>`}async renderSVG(t){const n=await this.h(t),e=l(),o=h.getColorMap(),r=o?m(o):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${e}';">
				<style nonce="${e}">
					${p}
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
		</html>`}async renderVideo(t,n,e){const o=l();return`<!DOCTYPE html>
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
				<video controls autoplay ${n?`poster="${n.toString(!0)}"`:""} muted ${e?`aria-label="${e}"`:""}>
					<source src="${t.toString(!0)}" type="video/mp4">
				</video>
			</body>
		</html>`}async h(t){if(!this.b.has(t)){const n=await this.j(t,!1);this.b.set(t,n)}return f(this.b.get(t))}async i(t,n){if(!this.a.has(t)){const e=await this.j(t),o=await w(z(e,n),this.f,this.g,{allowUnknownProtocols:!0});this.a.set(t,o)}return f(this.a.get(t))}async j(t,n=!0){try{const e=JSON.parse(t.query).moduleId;if(n&&e)return await new Promise((r,c)=>{const s=P.getProvider(e);s?r(s()):c(`Getting started: no provider registered for ${e}`)})}catch{}try{const e=t.with({path:t.path.replace(/\.md$/,`.nls.${u}.md`)}),o=u?.replace(/-.*$/,""),r=t.with({path:t.path.replace(/\.md$/,`.nls.${o}.md`)}),c=x=>this.c.stat(x).then(v=>!!v.size).catch(()=>!1),[s,d]=await Promise.all([c(e),c(r)]);return(await this.c.readFile(s?e:d?r:t)).value.toString()}catch(e){return this.d.error("Error reading markdown document at `"+t+"`: "+e),""}}};g=b([a(0,S),a(1,L),a(2,E),a(3,q)],g);const $=(i,t)=>{const n=k(t,i);return C(n).toString(!0)},z=(i,t)=>i.replace(/src="([^"]*)"/g,(n,e)=>e.startsWith("https://")?`src="${e}"`:`src="${$(e,t)}"`).replace(/!\[([^\]]*)\]\(([^)]*)\)/g,(n,e,o)=>o.startsWith("https://")?`![${e}](${o})`:`![${e}](${$(o,t)})`);export{g as $Dvc};
