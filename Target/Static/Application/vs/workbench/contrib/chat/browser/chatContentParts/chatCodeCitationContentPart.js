import*as u from"../../../../../base/browser/dom.js";import{$p9 as m}from"../../../../../base/browser/ui/button/button.js";import{$vd as p}from"../../../../../base/common/lifecycle.js";import{localize as h}from"../../../../../nls.js";import{$Po as g}from"../../../../../platform/telemetry/common/telemetry.js";import{$gT as C}from"../../common/chatModel.js";import{$oI as $}from"../../../../services/editor/common/editorService.js";var b=function(r,n,o,e){var a=arguments.length,t=a<3?n:e===null?e=Object.getOwnPropertyDescriptor(n,o):e,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(r,n,o,e);else for(var d=r.length-1;d>=0;d--)(i=r[d])&&(t=(a<3?i(t):a>3?i(n,o,t):i(n,o))||t);return a>3&&t&&Object.defineProperty(n,o,t),t},l=function(r,n){return function(o,e){n(o,e,r)}};let s=class extends p{constructor(n,o,e,a){super(),this.a=e,this.b=a;const t=C(n.citations),i=u.h(".chat-code-citation-message@root",[u.h("span.chat-code-citation-label@label"),u.h(".chat-code-citation-button-container@button")]);i.label.textContent=t+" - ";const d=this.B(new m(i.button,{buttonBackground:void 0,buttonBorder:void 0,buttonForeground:void 0,buttonHoverBackground:void 0,buttonSecondaryBackground:void 0,buttonSecondaryForeground:void 0,buttonSecondaryHoverBackground:void 0,buttonSeparator:void 0}));d.label=h(5158,null),this.B(d.onDidClick(()=>{const f=`# Code Citations

`+n.citations.map(c=>`## License: ${c.license}
${c.value.toString()}

\`\`\`
${c.snippet}
\`\`\`

`).join(`
`);this.a.openEditor({resource:void 0,contents:f,languageId:"markdown"}),this.b.publicLog2("openedChatCodeCitations")})),this.domNode=i.root}hasSameContent(n,o,e){return n.kind==="codeCitations"}};s=b([l(2,$),l(3,g)],s);export{s as $ROb};
