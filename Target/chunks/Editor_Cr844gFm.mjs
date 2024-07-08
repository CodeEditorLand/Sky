import { createForm, setValue, validate, required, clearError } from '@modular-forms/solid';
import { editor } from 'monaco-editor';
import { createEffect, on, createSignal, onMount, For } from 'solid-js';
/* empty css                          */

var H=({Type:r}={Type:"HTML"})=>{const[n,{Form:d,Field:f}]=createForm(),i=crypto.randomUUID();createEffect(on(o.Editors[0],e=>{setValue(n,"Content",e.get(i)?.Content??"",{shouldFocus:!1,shouldTouched:!1}),validate(n);},{defer:!1}));const s=createSignal(E(r));createEffect(on(c.Messages[0],e=>e?.get("Type")&&s[1](e?.get("Type")),{defer:!1}));let u,t;return o.Editors[0]().set(i,{Type:r,Hidden:o.Editors[0]().size>0,Content:s[0]()}),onMount(()=>{u instanceof HTMLElement&&(t=editor.create(u,{value:s[0](),language:r.toLowerCase(),automaticLayout:!0,lineNumbers:"off","semanticHighlighting.enabled":"configuredByTheme",autoClosingBrackets:"always",autoIndent:"full",tabSize:4,detectIndentation:!1,useTabStops:!0,minimap:{enabled:!1},scrollbar:{useShadows:!0,horizontal:"hidden",verticalScrollbarSize:10,verticalSliderSize:4,alwaysConsumeMouseWheel:!1},folding:!1,theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light",wrappingStrategy:"advanced",word:"on",bracketPairColorization:{enabled:!0,independentColorPoolPerBracketType:!0},padding:{top:12,bottom:12},fixedOverflowWidgets:!0,tabCompletion:"on",acceptSuggestionOnEnter:"on",cursorWidth:5,roundedSelection:!0,matchBrackets:"always",autoSurround:"languageDefined",screenReaderAnnounceInlineSuggestion:!1,renderFinalNewline:"on",selectOnLineNumbers:!1,formatOnType:!0,formatOnPaste:!0,fontFamily:"'Source Code Pro'",fontWeight:"400",fontLigatures:!0,links:!1,fontSize:16}),t.getModel()?.setEOL(editor.EndOfLineSequence.LF),t.onKeyDown(e=>{e.ctrlKey&&e.code==="KeyS"&&(e.preventDefault(),validate(n),n.element?.submit());}),t.getModel()?.onDidChangeContent(()=>{o.Editors[1](h(o.Editors[0](),new Map([[i,{Content:t.getModel()?.getValue()??"",Hidden:o.Editors[0]()?.get(i)?.Hidden??!0,Type:r}]])));}),t.onDidChangeModelLanguageConfiguration(()=>t.getAction("editor.action.formatDocument")?.run()),t.onDidLayoutChange(()=>t.getAction("editor.action.formatDocument")?.run()),window.addEventListener("load",()=>t.getAction("editor.action.formatDocument")?.run()),setTimeout(()=>t.getAction("editor.action.formatDocument")?.run(),1e3),createEffect(on(s[0],e=>t.getModel()?.setValue(e),{defer:!1})),c.Socket[0]()?.send(JSON.stringify({Key:l.Items[0]()?.get("Key")?.[0](),Identifier:l.Items[0]()?.get("Identifier")?.[0](),From:"Content",View:r})));}),createComponent("div",{class:!o.Editors[0]()?.get(i)?.Hidden&&b.Data[0]()?.get("Name")?"":"hidden"},createComponent("p",null,"Edit your"," ",createComponent(For,{each:Array.from(o.Editors[0]().entries())},(e,a)=>createComponent(Fragment,null,createComponent(T,{Action:()=>{o.Editors[0]().forEach((g,y)=>{g.Hidden=e[0]!==y,o.Editors[1](h(o.Editors[0](),new Map([[y,g]])));}),setTimeout(()=>{t.setScrollPosition({scrollTop:-50});},1e3);}},e[1].Type),a()===o.Editors[0]().size-1?"":" / "))," ","here:"),createComponent("br",null),createComponent(d,{method:"post",onSubmit:w},createComponent(f,{name:"Content",validate:[required(`Please enter some ${r}.`)]},(e,a)=>createComponent("div",{class:"w-full"},createComponent("div",{class:"Editor"},createComponent("code",{ref:u,class:"Monaco"}),e.error&&createComponent(Fragment,null,createComponent("div",{class:"Error",onClick:()=>{clearError(n,"Content"),t.focus();}},createComponent("span",null,"\xA0\xA0\xA0",e.error))),createComponent("input",{...a,value:o.Editors[0]()?.get(i)?.Content??"",type:"hidden",required:!0})))),createComponent(f,{name:"Field"},(e,a)=>createComponent("input",{type:"hidden",...a,value:r}))))};const E=r=>{switch(r){case"CSS":return `
/* Example CSS Code */
body {

}			
`;case"HTML":return `
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;case"TypeScript":return `
/**
 * Example TypeScript Code
 */
export default () => ({});
`;default:return ""}},w=({Content:r,Field:n},d)=>{d&&(d.preventDefault(),c.Socket[0]()?.send(JSON.stringify({Key:l.Items[0]()?.get("Key")?.[0](),Identifier:l.Items[0]()?.get("Identifier")?.[0](),To:n,Input:r})));},{default:o}=await import('./Context_DlaBBZnU.mjs'),{default:c}=await import('./Context_Bg1jn_nN.mjs'),{default:b}=await import('./Context_BBYSa61T.mjs'),{default:l}=await import('./Context_DWsv8h9X.mjs'),{default:T}=await import('./Anchor_CqDsSnH9.mjs'),{default:A}=await import('./Button_BWowwLti.mjs'),{default:k,Fn:O}=await import('./Copy_CsoKVUFA.mjs'),{default:h}=await import('./Merge_DEo-3zNv.mjs');

export { o as Action, T as Anchor, A as Button, c as Connection, O as Copy, h as Merge, E as Return, b as Session, l as Store, k as Tip, w as Update, H as default };
//# sourceMappingURL=Editor_Cr844gFm.mjs.map
