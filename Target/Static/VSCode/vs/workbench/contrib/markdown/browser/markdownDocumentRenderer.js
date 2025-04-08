import{basicMarkupHtmlTags as f,hookDomPurifyHrefAndSrcSanitizer as b}from"../../../../base/browser/dom.js";import x from"../../../../base/browser/dompurify/dompurify.js";import{allowedMarkdownAttr as k}from"../../../../base/browser/markdownRenderer.js";import"../../../../base/common/cancellation.js";import*as y from"../../../../base/common/marked/marked.js";import{Schemas as h}from"../../../../base/common/network.js";import{escape as w}from"../../../../base/common/strings.js";import"../../../../editor/common/languages/language.js";import{tokenizeToString as v}from"../../../../editor/common/languages/textToHtmlTokenizer.js";import"../../../services/extensions/common/extensions.js";import{markedGfmHeadingIdPlugin as E}from"./markedGfmHeadingIdPlugin.js";const W=`
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
`,M=[h.http,h.https,h.command];function T(d,t){const r=b(M,!0);try{return x.sanitize(d,{ALLOWED_TAGS:[...f,"checkbox","checklist"],ALLOWED_ATTR:[...k,"data-command","name","id","role","tabindex","x-dispatch","required","checked","placeholder","when-checked","checked-on"],...t?{ALLOW_UNKNOWN_PROTOCOLS:!0}:{}})}finally{r.dispose()}}async function q(d,t,r,n){const s=await new y.Marked(m.markedHighlight({async:!0,async highlight(c,i){if(typeof i!="string")return w(c);if(await t.whenInstalledExtensionsRegistered(),n?.token?.isCancellationRequested)return"";const l=r.getLanguageIdByLanguageName(i)??r.getLanguageIdByLanguageName(i.split(/\s+|:|,|(?!^)\{|\?]/,1)[0]);return v(r,c,l)}}),E(),...n?.markedExtensions??[]).parse(d,{async:!0});return n?.shouldSanitize??!0?T(s,n?.allowUnknownProtocols??!1):s}var m;(L=>{function d(e){if(typeof e=="function"&&(e={highlight:e}),!e||typeof e.highlight!="function")throw new Error("Must provide highlight function");return{async:!!e.async,walkTokens(o){if(o.type!=="code")return;if(e.async)return Promise.resolve(e.highlight(o.text,o.lang)).then(t(o));const a=e.highlight(o.text,o.lang);if(a instanceof Promise)throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");t(o)(a)},renderer:{code({text:o,lang:a,escaped:p}){const u=a?` class="language-${l(a)}"`:"";return o=o.replace(/\n$/,""),`<pre><code${u}>${p?o:l(o,!0)}
</code></pre>`}}}}L.markedHighlight=d;function t(e){return o=>{typeof o=="string"&&o!==e.text&&(e.escaped=!0,e.text=o)}}const r=/[&<>"']/,n=new RegExp(r.source,"g"),g=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,s=new RegExp(g.source,"g"),c={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},i=e=>c[e];function l(e,o){if(o){if(r.test(e))return e.replace(n,i)}else if(g.test(e))return e.replace(s,i);return e}})(m||={});export{W as DEFAULT_MARKDOWN_STYLES,q as renderMarkdownDocument};
