import{$ln as l}from"../../../../base/common/uuid.js";import{$SK as m}from"../../../../editor/common/languages/supports/tokenization.js";import{$YF as h}from"../../../../editor/common/languages.js";import{$5rc as p,$6rc as w}from"../../markdown/browser/markdownDocumentRenderer.js";import{$A as u}from"../../../../base/common/platform.js";import{$Ih as k}from"../../../../base/common/resources.js";import{$gd as f}from"../../../../base/common/types.js";import{$yHb as C}from"../../webview/common/webview.js";import{$Oc as y}from"../../../../base/common/map.js";import{$vk as S}from"../../../../platform/files/common/files.js";import{$pH as L}from"../../../../platform/notification/common/notification.js";import{$ZF as q}from"../../../../editor/common/languages/language.js";import{$NR as E}from"../../../services/extensions/common/extensions.js";import{$SGc as P}from"../common/gettingStartedContent.js";var b=function(i,e,n,t){var o=arguments.length,r=o<3?e:t===null?t=Object.getOwnPropertyDescriptor(e,n):t,c;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,n,t);else for(var s=i.length-1;s>=0;s--)(c=i[s])&&(r=(o<3?c(r):o>3?c(e,n,r):c(e,n))||r);return o>3&&r&&Object.defineProperty(e,n,r),r},a=function(i,e){return function(n,t){e(n,t,i)}};let g=class{constructor(e,n,t,o){this.c=e,this.d=n,this.f=t,this.g=o,this.a=new y,this.b=new y}async renderMarkdown(e,n){const t=await this.i(e,n),o=l(),r=h.getColorMap(),c=r?m(r):"";return`<!DOCTYPE html>
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
		<\/script>
		</html>`}async renderSVG(e){const n=await this.h(e),t=l(),o=h.getColorMap(),r=o?m(o):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${t}';">
				<style nonce="${t}">
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
		</html>`}async renderVideo(e,n,t){const o=l();return`<!DOCTYPE html>
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
		</html>`}async h(e){if(!this.b.has(e)){const n=await this.j(e,!1);this.b.set(e,n)}return f(this.b.get(e))}async i(e,n){if(!this.a.has(e)){const t=await this.j(e),o=await w(z(t,n),this.f,this.g,{sanitizerConfig:{allowedLinkProtocols:{override:"*"},allowedTags:{augment:["select","checkbox","checklist"]},allowedAttributes:{augment:["x-dispatch","data-command","when-checked","checked-on","checked"]}}});this.a.set(e,o)}return f(this.a.get(e))}async j(e,n=!0){try{const t=JSON.parse(e.query).moduleId;if(n&&t)return await new Promise((r,c)=>{const s=P.getProvider(t);s?r(s()):c(`Getting started: no provider registered for ${t}`)})}catch{}try{const t=e.with({path:e.path.replace(/\.md$/,`.nls.${u}.md`)}),o=u?.replace(/-.*$/,""),r=e.with({path:e.path.replace(/\.md$/,`.nls.${o}.md`)}),c=x=>this.c.stat(x).then(v=>!!v.size).catch(()=>!1),[s,d]=await Promise.all([c(t),c(r)]);return(await this.c.readFile(s?t:d?r:e)).value.toString()}catch(t){return this.d.error("Error reading markdown document at `"+e+"`: "+t),""}}};g=b([a(0,S),a(1,L),a(2,E),a(3,q)],g);const $=(i,e)=>{const n=k(e,i);return C(n).toString(!0)},z=(i,e)=>i.replace(/src="([^"]*)"/g,(n,t)=>t.startsWith("https://")?`src="${t}"`:`src="${$(t,e)}"`).replace(/!\[([^\]]*)\]\(([^)]*)\)/g,(n,t,o)=>o.startsWith("https://")?`![${t}](${o})`:`![${t}](${$(o,e)})`);export{g as $_Hc};
