import{$D0 as w}from"../../../../base/browser/domSanitize.js";import{$K0 as x,$J0 as v}from"../../../../base/browser/markdownRenderer.js";import{$Wh as y}from"../../../../base/common/async.js";import{CancellationToken as u}from"../../../../base/common/cancellation.js";import*as k from"../../../../base/common/marked/marked.js";import{Schemas as f}from"../../../../base/common/network.js";import{$Yf as M}from"../../../../base/common/strings.js";import{$eib as $}from"../../../../editor/common/languages/textToHtmlTokenizer.js";import{$4rc as R}from"./markedGfmHeadingIdPlugin.js";const B=`
body {
	padding: 10px 20px;
	line-height: 22px;
	max-width: 882px;
	margin: 0 auto;
}

body *:last-child {
	margin-bottom: 0;
}

img {
	max-width: 100%;
	max-height: 100%;
}

a {
	text-decoration: var(--text-link-decoration);
}

a:hover {
	text-decoration: underline;
}

a:focus,
input:focus,
select:focus,
textarea:focus {
	outline: 1px solid -webkit-focus-ring-color;
	outline-offset: -1px;
}

hr {
	border: 0;
	height: 2px;
	border-bottom: 2px solid;
}

h1 {
	padding-bottom: 0.3em;
	line-height: 1.2;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h1, h2, h3 {
	font-weight: normal;
}

table {
	border-collapse: collapse;
}

th {
	text-align: left;
	border-bottom: 1px solid;
}

th,
td {
	padding: 5px 10px;
}

table > tbody > tr + tr > td {
	border-top-width: 1px;
	border-top-style: solid;
}

blockquote {
	margin: 0 7px 0 5px;
	padding: 0 16px 0 10px;
	border-left-width: 5px;
	border-left-style: solid;
}

code {
	font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
}

pre {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

pre code {
	font-family: var(--vscode-editor-font-family);
	font-weight: var(--vscode-editor-font-weight);
	font-size: var(--vscode-editor-font-size);
	line-height: 1.5;
	color: var(--vscode-editor-foreground);
	tab-size: 4;
}

.monaco-tokenized-source {
	white-space: pre;
}

/** Theming */

.pre {
	background-color: var(--vscode-textCodeBlock-background);
}

.vscode-high-contrast h1 {
	border-color: rgb(0, 0, 0);
}

.vscode-light th {
	border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark th {
	border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light h1,
.vscode-light hr,
.vscode-light td {
	border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark h1,
.vscode-dark hr,
.vscode-dark td {
	border-color: rgba(255, 255, 255, 0.18);
}

@media (forced-colors: active) and (prefers-color-scheme: light){
	body {
		forced-color-adjust: none;
	}
}

@media (forced-colors: active) and (prefers-color-scheme: dark){
	body {
		forced-color-adjust: none;
	}
}
`,P=Object.freeze([f.http,f.https]);function L(i,t){return w(i,{allowedLinkProtocols:{override:t?.allowedLinkProtocols?.override??P},allowRelativeLinkPaths:t?.allowRelativeLinkPaths,allowedMediaProtocols:t?.allowedMediaProtocols,allowRelativeMediaPaths:t?.allowRelativeMediaPaths,allowedTags:{override:v,augment:t?.allowedTags?.augment},allowedAttributes:{override:[...x,"name","id","class","role","tabindex","placeholder"],augment:t?.allowedAttributes?.augment??[]}})}async function z(i,t,r,n,c=u.None){const l=new k.Marked(p.markedHighlight({async:!0,async highlight(s,a){if(typeof a!="string")return M(s);if(await t.whenInstalledExtensionsRegistered(),c?.isCancellationRequested)return"";const h=r.getLanguageIdByLanguageName(a)??r.getLanguageIdByLanguageName(a.split(/\s+|:|,|(?!^)\{|\?]/,1)[0]);return $(r,s,h)}}),R(),...n?.markedExtensions??[]),g=await y(l.parse(i,{async:!0}),c??u.None);return L(g,n?.sanitizerConfig)}var p;(function(i){function t(e){if(typeof e=="function"&&(e={highlight:e}),!e||typeof e.highlight!="function")throw new Error("Must provide highlight function");return{async:!!e.async,walkTokens(o){if(o.type!=="code")return;if(e.async)return Promise.resolve(e.highlight(o.text,o.lang)).then(r(o));const d=e.highlight(o.text,o.lang);if(d instanceof Promise)throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");r(o)(d)},renderer:{code({text:o,lang:d,escaped:m}){const b=d?` class="language-${h(d)}"`:"";return o=o.replace(/\n$/,""),`<pre><code${b}>${m?o:h(o,!0)}
</code></pre>`}}}}i.markedHighlight=t;function r(e){return o=>{typeof o=="string"&&o!==e.text&&(e.escaped=!0,e.text=o)}}const n=/[&<>"']/,c=new RegExp(n.source,"g"),l=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,g=new RegExp(l.source,"g"),s={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},a=e=>s[e];function h(e,o){if(o){if(n.test(e))return e.replace(c,a)}else if(l.test(e))return e.replace(g,a);return e}})(p||(p={}));export{B as $5rc,z as $6rc};
