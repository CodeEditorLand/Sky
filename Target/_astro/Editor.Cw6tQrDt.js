import{a as _,m as A,u as y,b,d as z,o as ne,e as D,s as ie,g as re,f as X,j as M,k as se,t as w,n as ae,i as L,c as O,p as oe,q as le}from"./web.Cch9Y2F5.js";import{e as H}from"./editor.main.D2dq6I3t.js";import"./preload-helper.BiBI96sQ.js";function d(e){const[t,n]=_(e);return{get:t,set:n}}function ue({initialValues:e={},validateOn:t="submit",revalidateOn:n="input",validate:r}={}){const i=d([]),a=d([]),o=d(),s=d(0),l=d(!1),u=d(!1),c=d(!1),f=d(!1),g=d(!1),m=d(!1),y=d({});return{internal:{initialValues:e,validate:r,validateOn:t,revalidateOn:n,fieldNames:i,fieldArrayNames:a,element:o,submitCount:s,submitting:l,submitted:u,validating:c,touched:f,dirty:g,invalid:m,response:y,fields:{},fieldArrays:{},validators:new Set},get element(){return o.get()},get submitCount(){return s.get()},get submitting(){return l.get()},get submitted(){return u.get()},get validating(){return c.get()},get touched(){return f.get()},get dirty(){return g.get()},get invalid(){return m.get()},get response(){return y.get()}}}function ce(e){const t=ue(e);return[t,{Form:e=>De(A({of:t},e)),Field:e=>Ce(A({of:t},e)),FieldArray:e=>Ne(A({of:t},e))}]}function U(e,t,n){const{checked:r,files:i,options:a,value:o,valueAsDate:s,valueAsNumber:l}=e;return y((()=>n&&"string"!==n?"string[]"===n?a?[...a].filter((e=>e.selected&&!e.disabled)).map((e=>e.value)):r?[...t.value.get()||[],o]:(t.value.get()||[]).filter((e=>e!==o)):"number"===n?l:"boolean"===n?r:"File"===n&&i?i[0]:"File[]"===n&&i?[...i]:"Date"===n&&s?s:t.value.get():o))}function V(e){return[...Object.values(e.internal.fields),...Object.values(e.internal.fieldArrays)]}function S(e,t){return e.internal.fieldArrays[t]}function de(e,t){return+t.replace(`${e}.`,"").split(".")[0]}function G(e,t){J(e,!1).forEach((n=>{const r=y(S(e,n).items.get).length-1;t.filter((e=>e.startsWith(`${n}.`)&&de(n,e)>r)).forEach((e=>{t.splice(t.indexOf(e),1)}))}))}function J(e,t=!0){const n=[...y(e.internal.fieldArrayNames.get)];return t&&G(e,n),n}function fe(e,t=!0){const n=[...y(e.internal.fieldNames.get)];return t&&G(e,n),n}function F(e,t){return e.internal.fields[t]}function $(e,t,n){return y((()=>{const r=fe(e,n),i=J(e,n);return"string"==typeof t||Array.isArray(t)?("string"==typeof t?[t]:t).reduce(((e,t)=>{const[n,a]=e;return i.includes(t)?(i.forEach((e=>{e.startsWith(t)&&a.add(e)})),r.forEach((e=>{e.startsWith(t)&&n.add(e)}))):n.add(t),e}),[new Set,new Set]).map((e=>[...e])):[r,i]}))}function j(e,t){return("string"==typeof e||Array.isArray(e)?t:e)||{}}function T(e,t){return e.split(".").reduce(((e,t)=>e?.[t]),t)}let ge=0;function I(){return ge++}function ye(e,t){const n=e=>e instanceof Blob?e.size:e;return Array.isArray(e)&&Array.isArray(t)?e.map(n).join()!==t.map(n).join():e instanceof Date&&t instanceof Date?e.getTime()!==t.getTime():(!Number.isNaN(e)||!Number.isNaN(t))&&e!==t}function me(e,t){y((()=>e.internal.dirty.set(t||V(e).some((e=>e.active.get()&&e.dirty.get())))))}function ve(e,t){y((()=>{const n=ye(t.startValue.get(),t.value.get());n!==t.dirty.get()&&b((()=>{t.dirty.set(n),me(e,n)}))}))}function he(e,t,n,{on:r,shouldFocus:i=!1}){y((()=>{r.includes(("submit"===e.internal.validateOn?e.internal.submitted.get():t.error.get())?e.internal.revalidateOn:e.internal.validateOn)&&R(e,n,{shouldFocus:i})}))}function P(e,t,n,r,i,a){b((()=>{t.value.set((e=>t.transform.reduce(((e,t)=>t(e,r)),a??e))),t.touched.set(!0),e.internal.touched.set(!0),ve(e,t),he(e,t,n,{on:i})}))}function pe(e,t){if(!S(e,t)){const n=T(t,e.internal.initialValues)?.map((()=>I()))||[],r=d(n),i=d(n),a=d(n),o=d(""),s=d(!1),l=d(!1),u=d(!1);e.internal.fieldArrays[t]={initialItems:r,startItems:i,items:a,error:o,active:s,touched:l,dirty:u,validate:[],consumers:new Set},e.internal.fieldArrayNames.set((e=>[...e,t]))}return S(e,t)}function be(e,t){if(!F(e,t)){const n=T(t,e.internal.initialValues),r=d([]),i=d(n),a=d(n),o=d(n),s=d(""),l=d(!1),u=d(!1),c=d(!1);e.internal.fields[t]={elements:r,initialValue:i,startValue:a,value:o,error:s,active:l,touched:u,dirty:c,validate:[],transform:[],consumers:new Set},e.internal.fieldNames.set((e=>[...e,t]))}return F(e,t)}function Ae(e,t,{shouldActive:n=!0}){const r=Object.entries(t).reduce(((t,[r,i])=>([F(e,r),S(e,r)].every((e=>!e||n&&!y(e.active.get)))&&t.push(i),t)),[]).join(" ");r&&e.internal.response.set({status:"error",message:r})}function Q(e,t){y((()=>{e.internal.invalid.set(t||V(e).some((e=>e.active.get()&&e.error.get())))}))}function x(e){let t=!1,n=!1,r=!1;y((()=>{for(const i of V(e))if(i.active.get()&&(i.touched.get()&&(t=!0),i.dirty.get()&&(n=!0),i.error.get()&&(r=!0)),t&&n&&r)break})),b((()=>{e.internal.touched.set(t),e.internal.dirty.set(n),e.internal.invalid.set(r)}))}function Y(e,t){y((()=>F(e,t)?.elements.get()[0]?.focus()))}function Z(e,t,n,{shouldActive:r=!0,shouldTouched:i=!1,shouldDirty:a=!1,shouldFocus:o=!!n}={}){b((()=>{y((()=>{for(const s of[F(e,t),S(e,t)])s&&(!r||s.active.get())&&(!i||s.touched.get())&&(!a||s.dirty.get())&&(s.error.set(n),n&&"value"in s&&o&&Y(e,t))})),Q(e,!!n)}))}function Se(e,t,n){Z(e,t,"",n)}function ee(e,t,n){const[r,i]=$(e,t),{shouldActive:a=!0,shouldTouched:o=!1,shouldDirty:s=!1,shouldValid:l=!1}=j(t,n);return"string"==typeof t||Array.isArray(t)?i.forEach((t=>S(e,t).items.get())):e.internal.fieldNames.get(),r.reduce(((n,r)=>{const i=F(e,r);return(!a||i.active.get())&&(!o||i.touched.get())&&(!s||i.dirty.get())&&(!l||!i.error.get())&&("string"==typeof t?r.replace(`${t}.`,""):r).split(".").reduce(((e,t,n,r)=>e[t]=n===r.length-1?i.value.get():"object"==typeof e[t]&&e[t]||(isNaN(+r[n+1])?{}:[])),n),n}),"string"==typeof t?[]:{})}function Fe(e,t,n){const[r,i]=$(e,t,!1),a="string"==typeof t&&1===r.length,o=!a&&!Array.isArray(t),s=j(t,n),{initialValue:l,initialValues:u,keepResponse:d=!1,keepSubmitCount:c=!1,keepSubmitted:f=!1,keepValues:g=!1,keepDirtyValues:m=!1,keepItems:p=!1,keepDirtyItems:v=!1,keepErrors:h=!1,keepTouched:A=!1,keepDirty:w=!1}=s;b((()=>y((()=>{r.forEach((t=>{const n=F(e,t);(a?"initialValue"in s:u)&&n.initialValue.set((()=>a?l:T(t,u)));const r=m&&n.dirty.get();!g&&!r&&(n.startValue.set(n.initialValue.get),n.value.set(n.initialValue.get),n.elements.get().forEach((e=>{"file"===e.type&&(e.value="")}))),A||n.touched.set(!1),!w&&!g&&!r&&n.dirty.set(!1),h||n.error.set("")})),i.forEach((t=>{const n=S(e,t),r=v&&n.dirty.get();!p&&!r&&(u&&n.initialItems.set(T(t,u)?.map((()=>I()))||[]),n.startItems.set([...n.initialItems.get()]),n.items.set([...n.initialItems.get()])),A||n.touched.set(!1),!w&&!p&&!r&&n.dirty.set(!1),h||n.error.set("")})),o&&(d||e.internal.response.set({}),c||e.internal.submitCount.set(0),f||e.internal.submitted.set(!1)),x(e)}))))}function Ee(e,t,{duration:n}={}){e.internal.response.set(t),n&&setTimeout((()=>{y(e.internal.response.get)===t&&e.internal.response.set({})}),n)}async function R(e,t,n){const[r,i]=$(e,t),{shouldActive:a=!0,shouldFocus:o=!0}=j(t,n),s=I();e.internal.validators.add(s),e.internal.validating.set(!0);const l=e.internal.validate?await e.internal.validate(y((()=>ee(e,{shouldActive:a})))):{};let u=!("string"!=typeof t&&!Array.isArray(t))||!Object.keys(l).length;const[d]=await Promise.all([Promise.all(r.map((async t=>{const n=F(e,t);if(!a||y(n.active.get)){let e;for(const t of n.validate)if(e=await t(y(n.value.get)),e)break;const r=e||l[t]||"";return r&&(u=!1),n.error.set(r),r?t:null}}))),Promise.all(i.map((async t=>{const n=S(e,t);if(!a||y(n.active.get)){let e="";for(const t of n.validate)if(e=await t(y(n.items.get)),e)break;const r=e||l[t]||"";r&&(u=!1),n.error.set(r)}})))]);return b((()=>{if(Ae(e,l,{shouldActive:a}),o){const t=d.find((e=>e));t&&Y(e,t)}Q(e,!u),e.internal.validators.delete(s),e.internal.validators.size||e.internal.validating.set(!1)})),u}function te({of:e,name:t,getStore:n,validate:r,transform:i,keepActive:a=!1,keepState:o=!0}){z((()=>{const s=n();s.validate=r?Array.isArray(r)?r:[r]:[],"transform"in s&&(s.transform=i?Array.isArray(i)?i:[i]:[]);const l=I();s.consumers.add(l),y(s.active.get)||b((()=>{s.active.set(!0),x(e)})),ne((()=>setTimeout((()=>{s.consumers.delete(l),b((()=>{!a&&!s.consumers.size&&(s.active.set(!1),o?x(e):Fe(e,t))})),"elements"in s&&s.elements.set((e=>e.filter((e=>e.isConnected))))}))))}))}function Ce(e){const t=D((()=>be(e.of,e.name)));return te(A({getStore:t},e)),D((()=>e.children({get name(){return e.name},get value(){return t().value.get()},get error(){return t().error.get()},get active(){return t().active.get()},get touched(){return t().touched.get()},get dirty(){return t().dirty.get()}},{get name(){return e.name},get autofocus(){return!!t().error.get()},ref(n){t().elements.set((e=>[...e,n])),z((()=>{if("radio"!==n.type&&void 0===t().startValue.get()&&void 0===y(t().value.get)){const r=U(n,t(),e.type);t().startValue.set((()=>r)),t().value.set((()=>r))}}))},onInput(n){P(e.of,t(),e.name,n,["touched","input"],U(n.currentTarget,t(),e.type))},onChange(n){P(e.of,t(),e.name,n,["change"])},onBlur(n){P(e.of,t(),e.name,n,["touched","blur"])}})))}function Ne(e){const t=D((()=>pe(e.of,e.name)));return te(A({getStore:t},e)),D((()=>e.children({get name(){return e.name},get items(){return t().items.get()},get error(){return t().error.get()},get active(){return t().active.get()},get touched(){return t().touched.get()},get dirty(){return t().dirty.get()}})))}class K extends Error{name="FormError";errors;constructor(e,t){super("string"==typeof e?e:""),this.errors="string"==typeof e?t||{}:e}}var ke=w("<form novalidate>");function De(e){const[,t,n]=ie(e,["of"],["keepResponse","shouldActive","shouldTouched","shouldDirty","shouldFocus"]);return r=re(ke),"function"==typeof(i=e.of.internal.element.set)?X(i,r):e.of.internal.element.set=r,M(r,A(n,{onSubmit:async n=>{n.preventDefault();const{of:r,onSubmit:i,responseDuration:a}=e;b((()=>{t.keepResponse||r.internal.response.set({}),r.internal.submitCount.set((e=>e+1)),r.internal.submitted.set(!0),r.internal.submitting.set(!0)}));try{await R(r,t)&&await i(ee(r,t),n)}catch(e){b((()=>{e instanceof K&&Object.entries(e.errors).forEach((([e,n])=>{n&&Z(r,e,n,{...t,shouldFocus:!1})})),(!(e instanceof K)||e.message)&&Ee(r,{status:"error",message:e?.message||"An unknown error has occurred."},{duration:a})}))}finally{r.internal.submitting.set(!1)}}}),!1),se(),r;var r,i}function we(e){return t=>!t&&0!==t||Array.isArray(t)&&!t.length?e:""}var Te=w("<div>"),Ie=w("<div class=w-full><div class=Editor><code class=Monaco></code><input>"),Le=w("<div class=Error><span>&nbsp;&nbsp;&nbsp;"),Oe=w("<input type=hidden>"),$e=({Type:e}={Type:"HTML"})=>{const[t,{Form:n,Field:r}]=ce();crypto.randomUUID();const i=_(Pe(e));let a,o;return ae((()=>{console.log(void 0),a instanceof HTMLElement&&(o=H.create(a,{value:i[0](),language:e.toLowerCase(),automaticLayout:!0,lineNumbers:"off","semanticHighlighting.enabled":"configuredByTheme",autoClosingBrackets:"always",autoIndent:"full",tabSize:4,detectIndentation:!1,useTabStops:!0,minimap:{enabled:!1},scrollbar:{useShadows:!0,horizontal:"hidden",verticalScrollbarSize:10,verticalSliderSize:4,alwaysConsumeMouseWheel:!1},folding:!1,theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light",wrappingStrategy:"advanced",bracketPairColorization:{enabled:!0,independentColorPoolPerBracketType:!0},padding:{top:12,bottom:12},fixedOverflowWidgets:!0,tabCompletion:"on",acceptSuggestionOnEnter:"on",cursorWidth:5,roundedSelection:!0,matchBrackets:"always",autoSurround:"languageDefined",screenReaderAnnounceInlineSuggestion:!1,renderFinalNewline:"on",selectOnLineNumbers:!1,formatOnType:!0,formatOnPaste:!0,fontFamily:"'Source Code Pro'",fontWeight:"400",fontLigatures:!0,links:!1,fontSize:16}),o.getModel()?.setEOL(H.EndOfLineSequence.LF),o.onKeyDown((e=>{e.ctrlKey&&"KeyS"===e.code&&(e.preventDefault(),R(t),t.element?.submit())})),o.onDidChangeModelLanguageConfiguration((()=>o.getAction("editor.action.formatDocument")?.run())),o.onDidLayoutChange((()=>o.getAction("editor.action.formatDocument")?.run())),window.addEventListener("load",(()=>o.getAction("editor.action.formatDocument")?.run())),setTimeout((()=>o.getAction("editor.action.formatDocument")?.run()),1e3),z(le(i[0],(e=>o.getModel()?.setValue(e)),{defer:!1})))})),s=Te(),L(s,O(n,{method:"post",onSubmit:Me,get children(){return[O(r,{name:"Content",get validate(){return[we(`Please enter some ${e}.`)]},children:(e,n)=>{return i=Ie(),s=i.firstChild,l=s.firstChild,u=l.nextSibling,"function"==typeof a?X(a,l):a=l,L(s,(r=D((()=>!!e.error)),()=>{return r()&&(n=Le(),(i=n.firstChild).firstChild,n.$$click=()=>{Se(t,"Content"),o.focus()},L(i,(()=>e.error),null),n);var n,i}),u),M(u,A(n,{type:"hidden",required:!0}),!1),i;var r,i,s,l,u}}),O(r,{name:"Field",children:(t,n)=>{return r=Oe(),M(r,A(n,{value:e}),!1),r;var r}})]}})),s;var s};const Pe=e=>{switch(e){case"CSS":return"\n/* Example CSS Code */\nbody {\n\n}\t\t\t\n";case"HTML":return'\n\x3c!-- Example HTML Code --\x3e\n<!doctype html>\n<html lang="en">\n\t<body>\n\t</body>\n</html>\n';case"TypeScript":return"\n/**\n * Example TypeScript Code\n */\nexport default () => ({});\n";default:return""}},Me=({Content:e,Field:t},n)=>{n&&(n.preventDefault(),console.log(e),console.log(t))};oe(["click"]);export{Pe as Return,Me as Update,$e as default};