import{URI as A}from"../../../base/common/uri.js";function X(t){if(t.length===0)return null;const n=new Map;for(const o of t)n.set(o.nodeId,o);function e(o){const s=n.get(o);if(!s||!s.childIds)return[];const i=[];for(const l of s.childIds){const c=n.get(l);c&&(c.ignored?i.push(...e(l)):i.push(l))}return i}const r=new Map;for(const o of t)o.ignored||r.set(o.nodeId,{node:o,children:[],parent:null});for(const o of t){if(o.ignored)continue;const s=r.get(o.nodeId);if(o.childIds)for(const i of o.childIds){const l=n.get(i);if(l)if(l.ignored){const c=e(i);for(const p of c){const h=r.get(p);h&&(h.parent=s,s.children.push(h))}}else{const c=r.get(i);c&&(c.parent=s,s.children.push(c))}}}for(const o of r.values())if(!o.parent)return o;return null}function P(t,n){const e=X(n);if(!e)return"";const r=v(t,e),o=C(e);return r+(o.length>0?`

## Additional Links
`+o.join(`
`):"")}function v(t,n){const e=[];return u(t,n,e,0,!0),e.join("")}function u(t,n,e,r,o){switch(a(n.node)){case"navigation":return;case"heading":x(t,n,e,r);return;case"paragraph":I(t,n,e,r,o);return;case"list":V(t,n,e,r);return;case"listitem":return;case"link":if(!m(n)){const i=d(n.node,o),l=g(n.node);y(t,n.node)?e.push(i):e.push(`[${i}](${l})`)}return;case"StaticText":{const i=d(n.node,o);i&&e.push(i);break}case"image":{const i=d(n.node,o)||"Image",l=T(n.node);l?e.push(`![${i}](${l})

`):e.push(`[Image: ${i}]

`);break}case"DescriptionList":k(t,n,e,r);return;case"blockquote":e.push("> "+d(n.node,o).replace(/\n/g,`
> `)+`

`);break;case"generic":e.push(" ");break;case"code":{U(t,n,e,r);return}case"pre":e.push("```\n"+d(n.node,!1)+"\n```\n\n");break;case"table":R(n,e);return}for(const i of n.children)u(t,i,e,r+1,o)}function a(t){return t.role?.value||""}function d(t,n){const e=t.name?.value||t.value?.value||"";return n?e.replace(/([.!?:;])\s/g,`$1
`):e}function f(t){const n=t.properties?.find(e=>e.name==="level");return n?Math.min(Number(n.value.value)||1,6):1}function g(t){return t.properties?.find(e=>e.name==="url")?.value.value||"#"}function T(t){return t.properties?.find(e=>e.name==="url")?.value.value||null}function m(t){let n=t;for(;n;){const e=a(n.node);if(["navigation","menu","menubar"].includes(e))return!0;n=n.parent}return!1}function y(t,n){const e=g(n);try{const r=A.parse(e);return r.scheme===t.scheme&&r.authority===t.authority&&r.path===t.path}catch{return!1}}function I(t,n,e,r,o){e.push(`
`);for(const s of n.children)u(t,s,e,r+1,o);e.push(`

`)}function x(t,n,e,r){e.push(`
`);const o=f(n.node);e.push(`${"#".repeat(o)} `);for(const s of n.children)a(s.node)==="StaticText"?e.push(d(s.node,!1)):u(t,s,e,r+1,!1);e.push(`

`)}function k(t,n,e,r){e.push(`
`);for(const o of n.children)if(a(o.node)==="term"){e.push("- **");for(const s of o.children)u(t,s,e,r+1,!0);e.push("** ")}else if(a(o.node)==="definition"){for(const s of o.children)u(t,s,e,r+1,!0);e.push(`
`)}e.push(`
`)}function V(t,n,e,r){const o=a(n.node).includes("ordered");let s=1;e.push(`
`);for(const i of n.children)if(a(i.node)==="listitem"){const l=[];for(const p of i.children)u(t,p,l,r+1,!0);const c=l.join("").trim();o?e.push(`${s++}. ${c}
`):e.push(`- ${c}
`)}e.push(`
`)}function R(t,n){n.push(`
`);const e=t.children.filter(r=>a(r.node).includes("row"));if(e.length>0){const r=e[0].children.filter(s=>a(s.node).includes("cell")),o=r.map(s=>d(s.node,!1)||" ");n.push("| "+o.join(" | ")+` |
`),n.push("| "+r.map(()=>"---").join(" | ")+` |
`);for(let s=1;s<e.length;s++){const l=e[s].children.filter(c=>a(c.node).includes("cell")).map(c=>d(c.node,!1)||" ");n.push("| "+l.join(" | ")+` |
`)}}n.push(`
`)}function U(t,n,e,r){const o=[];for(const i of n.children)u(t,i,o,r+1,!1);if(o.some(i=>i.includes(`
`)))e.push("\n```\n"),e.push(o.join("")),e.push("\n```\n");else{e.push("`");let i=0;for(const l of o)i+=l.length,i>80&&(e.push(`
`),i=0),e.push(l),e.push("`")}}function C(t){const n=[];return N(t,n),n}function N(t,n){if(a(t.node)==="link"&&m(t)){const r=d(t.node,!0),o=g(t.node),s=t.node.description?.value||"";n.push(`- [${r}](${o})${s?" - "+s:""}`)}for(const r of t.children)N(r,n)}export{P as convertAXTreeToMarkdown};
