import { c as createComponent, r as renderTemplate, a as renderComponent } from './astro/server_CrPdPs7a.mjs';
import 'kleur/colors';
import { $ as $$Base } from './Base_BOrs_0Zd.mjs';
import { z } from 'zod';
import { config } from 'dotenv';
/* empty css                          */

const{default:t}=await import('./StringURL_eKNM2wuf.mjs'),e=z.object({API:t,Socket:t});

const $$Editor = createComponent(($$result, $$props, $$slots) => {
  config();
  const { API, Socket } = e.parse(process.env);
  return renderTemplate`<!-- <Layout Font={["/Font/AlbertSans/800.css"]}> -->${renderComponent($$result, "Layout", $$Base, {}, { "default": ($$result2) => renderTemplate`
	${renderComponent($$result2, "Page", null, { "client:only": "solid-js", "API": API, "Socket": Socket, "client:component-hydration": "only", "client:component-path": "@codeeditorland/wind/Target/Element/Page/Editor.js", "client:component-export": "default" })}
` })}`;
}, "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/pages/Editor.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/pages/Editor.astro";
const $$url = "/Editor";

export { $$Editor as default, $$file as file, $$url as url };
//# sourceMappingURL=Editor_D0bGeOsE.mjs.map
