import { c as createComponent$1, r as renderTemplate, a as renderComponent } from './astro/server_CrPdPs7a.mjs';
import 'kleur/colors';
import { lazy, Suspense } from 'solid-js';
import { $ as $$Base } from './Base_CPqJ7yTO.mjs';
import { config } from 'dotenv';

const o=lazy(()=>import('./Action_DayUBbds.mjs')),t=lazy(()=>import('./Connection_DGeFUMff.mjs')),s=lazy(()=>import('./Editor_Cr844gFm.mjs')),r=lazy(()=>import('./Environment_HAuK5VbC.mjs')),p=lazy(()=>import('./Session_Cn6iSptl.mjs')),c=lazy(()=>import('./Store_Dm1r7FDK.mjs'));var a=i=>createComponent(Suspense,null,createComponent(r,{Data:i},createComponent(Suspense,null,createComponent(c,{Data:new Map([["Identifier","Identifier"],["Key","Key"]])},createComponent(Suspense,null,createComponent(t,null,createComponent(Suspense,null,createComponent(p,null,createComponent("div",{class:"flex flex-col"},createComponent("main",{class:"flex grow justify-center"},createComponent("div",{class:"flex grow self-center"},createComponent("div",{class:"container"},createComponent("div",{class:"grid min-h-screen content-start gap-7 py-9"},createComponent("div",{class:"mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"},createComponent("div",{class:"order-last lg:order-first"},createComponent(Suspense,null,createComponent(o,null,createComponent(Suspense,null,createComponent(s,{Type:"HTML"})),createComponent(Suspense,null,createComponent(s,{Type:"CSS"})),createComponent(Suspense,null,createComponent(s,{Type:"TypeScript"})))))))))))))))))));

const $$Editor = createComponent$1(($$result, $$props, $$slots) => {
  config();
  return renderTemplate`<!--
	TODO: Implement font changes in layout 
	<Layout Font={["/Font/AlbertSans/800.css"]}>
-->${renderComponent($$result, "Layout", $$Base, {}, { "default": ($$result2) => renderTemplate`
	${renderComponent($$result2, "Page", a, { "client:load": "solid-js", "client:component-hydration": "load", "client:component-path": "@codeeditorland/wind/Target/Element/Page/Editor.js", "client:component-export": "default" })}
` })}`;
}, "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/pages/Editor.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/pages/Editor.astro";
const $$url = "/Editor";

export { $$Editor as default, $$file as file, $$url as url };
//# sourceMappingURL=Editor_B5_yhMMk.mjs.map
