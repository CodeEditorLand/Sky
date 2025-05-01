var m=function(r,t,n,o){var a=arguments.length,e=a<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,n):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(r,t,n,o);else for(var c=r.length-1;c>=0;c--)(i=r[c])&&(e=(a<3?i(e):a>3?i(t,n,e):i(t,n))||e);return a>3&&e&&Object.defineProperty(t,n,e),e},l=function(r,t){return function(n,o){t(n,o,r)}};import*as u from"../../../../../base/browser/dom.js";import{Button as h}from"../../../../../base/browser/ui/button/button.js";import{Disposable as p}from"../../../../../base/common/lifecycle.js";import{localize as b}from"../../../../../nls.js";import{ITelemetryService as C}from"../../../../../platform/telemetry/common/telemetry.js";import{getCodeCitationsMessage as g}from"../../common/chatModel.js";import{IEditorService as v}from"../../../../services/editor/common/editorService.js";let s=class extends p{constructor(t,n,o,a){super(),this.editorService=o,this.telemetryService=a;const e=g(t.citations),i=u.h(".chat-code-citation-message@root",[u.h("span.chat-code-citation-label@label"),u.h(".chat-code-citation-button-container@button")]);i.label.textContent=e+" - ";const c=this._register(new h(i.button,{buttonBackground:void 0,buttonBorder:void 0,buttonForeground:void 0,buttonHoverBackground:void 0,buttonSecondaryBackground:void 0,buttonSecondaryForeground:void 0,buttonSecondaryHoverBackground:void 0,buttonSeparator:void 0}));c.label=b("viewMatches","View matches"),this._register(c.onDidClick(()=>{const f=`# Code Citations

`+t.citations.map(d=>`## License: ${d.license}
${d.value.toString()}

\`\`\`
${d.snippet}
\`\`\`

`).join(`
`);this.editorService.openEditor({resource:void 0,contents:f,languageId:"markdown"}),this.telemetryService.publicLog2("openedChatCodeCitations")})),this.domNode=i.root}hasSameContent(t,n,o){return t.kind==="codeCitations"}};s=m([l(2,v),l(3,C)],s);export{s as ChatCodeCitationContentPart};
