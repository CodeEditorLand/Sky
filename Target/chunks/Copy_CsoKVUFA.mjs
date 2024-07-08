/* empty css                          */

var u=n=>{const{children:o,Content:i,Class:t,onMount:a,onHidden:p}=d({children:"",Content:"",Class:""},n);let e;return m(()=>(c(e,{content:i??"",arrow:!1,inertia:!1,animation:"shift-away",theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark-border":"light-border",hideOnClick:!1,onMount:r=>window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",({matches:s})=>r.setProps({theme:s?"dark-border":"light-border"})),offset:[0,5],placement:"bottom",interactive:!0,onHidden:r=>p?.(r)}),a?.(e))),createComponent("div",{class:`Tip ${typeof t=="function"?t():t}`.trim(),ref:e},o(()=>o)())};const{default:d}=await import('./Merge_DEo-3zNv.mjs'),{default:c}=await import('tippy.js'),{createEffect:C,on:w,children:M,onMount:m}=await import('solid-js');

const o=t=>{try{navigator.clipboard.writeText(t.currentTarget.innerText),t.currentTarget.parentElement._tippy.setContent("Copied!");}catch(e){console.log(e);}};var p=({children:t})=>createComponent(u,{Content:"Copy to clipboard.",onHidden:e=>e.setContent("Copy to clipboard.")},t(()=>t));await import('solid-js');

export { o as Fn, p as default };
//# sourceMappingURL=Copy_CsoKVUFA.mjs.map
