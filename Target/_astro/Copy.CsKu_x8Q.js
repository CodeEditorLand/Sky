const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Merge.BxM7rdZG.js","_astro/Editor.CrSNzv6p.js","_astro/solid.f9AvF4Qv.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './Editor.CrSNzv6p.js';
import './solid.f9AvF4Qv.js';

var C=n=>{const{children:o,Content:i,Class:t,onMount:a,onHidden:p}=d({children:"",Content:"",Class:""},n);let e;return m(()=>(c(e,{content:i??"",arrow:!1,inertia:!1,animation:"shift-away",theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark-border":"light-border",hideOnClick:!1,onMount:r=>window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",({matches:s})=>r.setProps({theme:s?"dark-border":"light-border"})),offset:[0,5],placement:"bottom",interactive:!0,onHidden:r=>p?.(r)}),a?.(e))),h("div",{class:`Tip ${typeof t=="function"?t():t}`.trim(),ref:e},o(()=>o)())};const{default:d}=await __vitePreload(() => import('./Merge.BxM7rdZG.js'),true?__vite__mapDeps([0,1,2]):void 0),{default:c}=await __vitePreload(async () => { const {default:c} = await import('./tippy.esm.DAKJp8X3.js');return {default:c}},true?[]:void 0),{createEffect:w,on:M,children:g,onMount:m}=await __vitePreload(async () => { const {createEffect:w,on:M,children:g,onMount:m} = await import('./solid.f9AvF4Qv.js');return {createEffect:w,on:M,children:g,onMount:m}},true?[]:void 0);

const o=t=>{try{navigator.clipboard.writeText(t.currentTarget.innerText),t.currentTarget.parentElement._tippy.setContent("Copied!");}catch(e){console.log(e);}};var p=({children:t})=>h(C,{Content:"Copy to clipboard.",onHidden:e=>e.setContent("Copy to clipboard.")},t(()=>t));await __vitePreload(() => import('./solid.f9AvF4Qv.js'),true?[]:void 0);

export { o as Fn, p as default };
//# sourceMappingURL=Copy.CsKu_x8Q.js.map
