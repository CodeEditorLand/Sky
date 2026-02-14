import{URI as C}from"../../../base/common/uri.js";function L(t){if(t.length===0)return[];const e=new Map;for(const o of t)e.set(o.nodeId,o);function n(o){const i=e.get(o);if(!i||!i.childIds)return[];const r=[];for(const l of i.childIds){const u=e.get(l);u&&(u.ignored?r.push(...n(l)):r.push(l))}return r}const s=new Map;for(const o of t)o.ignored||s.set(o.nodeId,{node:o,children:[],parent:null});for(const o of t){if(o.ignored)continue;const i=s.get(o.nodeId);if(o.childIds)for(const r of o.childIds){const l=e.get(r);if(l)if(l.ignored){const u=n(r);for(const I of u){const p=s.get(I);p&&(p.parent=i,i.children.push(p))}}else{const u=s.get(r);u&&(u.parent=i,i.children.push(u))}}}const c=[];for(const o of s.values())o.parent||c.push(o);return c}const g=80;function S(t,e){const n=L(e);if(n.length===0)return"";const s=[],c=[];for(const i of n){const r=T(t,i),l=B(i);r.trim().length>0&&s.push(r),c.push(...l)}return s.join(`

`)+(c.length>0?`

## Additional Links
`+c.join(`
`):"")}function T(t,e){const n=[];return d(t,e,n,0,!0),n.join("")}function d(t,e,n,s,c){switch(h(e.node)){case"navigation":return;case"heading":j(t,e,n,s);return;case"paragraph":M(t,e,n,s,c);return;case"list":n.push(`
`);for(const i of e.children)d(t,i,n,s+1,!0);n.push(`
`);return;case"ListMarker":n.push(a(e.node,c));return;case"listitem":{const i=[];for(const l of e.children)d(t,l,i,s+1,!0);const r=m(e.node)>1?" ".repeat(m(e.node)):"";n.push(`${r}${i.join("").trim()}
`);return}case"link":if(!v(e)){const i=a(e.node,c),r=f(e.node);x(t,e.node)?n.push(i):n.push(`[${i}](${r})`)}return;case"StaticText":{const i=a(e.node,c);i&&n.push(i);break}case"image":{const i=a(e.node,c)||"Image",r=$(e.node);r?n.push(`![${i}](${r})

`):n.push(`[Image: ${i}]

`);break}case"DescriptionList":P(t,e,n,s);return;case"blockquote":n.push("> "+a(e.node,c).replace(/\n/g,`
> `)+`

`);break;case"generic":n.push(" ");break;case"code":{y(t,e,n,s);return}case"pre":n.push("```\n"+a(e.node,!1)+"\n```\n\n");break;case"table":U(e,n);return}for(const i of e.children)d(t,i,n,s+1,c)}function h(t){return t.role?.value||""}function a(t,e){const n=t.name?.value||t.value?.value||"";if(!e||n.length<=g)return n;const s=n.split("");let c=-1;for(let o=1;o<s.length;o++)s[o]===" "&&(c=o),o%g===0&&c!==-1&&(s[c]=`
`,c=o);return s.join("")}function m(t){const e=t.properties?.find(n=>n.name==="level");return e?Math.min(Number(e.value.value)||1,6):1}function f(t){return t.properties?.find(n=>n.name==="url")?.value.value||"#"}function $(t){return t.properties?.find(n=>n.name==="url")?.value.value||null}function v(t){let e=t;for(;e;){const n=h(e.node);if(["navigation","menu","menubar"].includes(n))return!0;e=e.parent}return!1}function x(t,e){const n=f(e);try{const s=C.parse(n);return s.scheme===t.scheme&&s.authority===t.authority&&s.path===t.path}catch{return!1}}function M(t,e,n,s,c){n.push(`
`);for(const o of e.children)d(t,o,n,s+1,c);n.push(`

`)}function j(t,e,n,s){n.push(`
`);const c=m(e.node);n.push(`${"#".repeat(c)} `);for(const o of e.children)h(o.node)==="StaticText"?n.push(a(o.node,!1)):d(t,o,n,s+1,!1);n.push(`

`)}function P(t,e,n,s){n.push(`
`);for(const c of e.children)if(h(c.node)==="term"){n.push("- **");for(const o of c.children)d(t,o,n,s+1,!0);n.push("** ")}else if(h(c.node)==="definition"){for(const o of c.children)d(t,o,n,s+1,!0);n.push(`
`)}n.push(`
`)}function k(t){return t==="cell"||t==="gridcell"||t==="columnheader"||t==="rowheader"}function U(t,e){e.push(`
`);const n=t.children.filter(s=>h(s.node).includes("row"));if(n.length>0){const s=n[0].children.filter(o=>k(h(o.node))),c=s.map(o=>a(o.node,!1)||" ");e.push("| "+c.join(" | ")+` |
`),e.push("| "+s.map(()=>"---").join(" | ")+` |
`);for(let o=1;o<n.length;o++){const r=n[o].children.filter(l=>k(h(l.node))).map(l=>a(l.node,!1)||" ");e.push("| "+r.join(" | ")+` |
`)}}e.push(`
`)}function y(t,e,n,s){const c=[];for(const i of e.children)d(t,i,c,s+1,!1);if(c.some(i=>i.includes(`
`)))n.push("\n```\n"),n.push(c.join("")),n.push("\n```\n");else{n.push("`");let i=0;for(const r of c)i+=r.length,i>g&&(n.push(`
`),i=0),n.push(r),n.push("`")}}function B(t){const e=[];return N(t,e),e}function N(t,e){if(h(t.node)==="link"&&v(t)){const s=a(t.node,!0),c=f(t.node),o=t.node.description?.value||"";e.push(`- [${s}](${c})${o?" - "+o:""}`)}for(const s of t.children)N(s,e)}export{S as $PB};
