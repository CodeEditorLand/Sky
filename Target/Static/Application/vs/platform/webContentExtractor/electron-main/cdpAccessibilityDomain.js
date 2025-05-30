import{URI as I}from"../../../base/common/uri.js";function N(t){if(t.length===0)return null;const e=new Map;for(const o of t)e.set(o.nodeId,o);function n(o){const c=e.get(o);if(!c||!c.childIds)return[];const i=[];for(const r of c.childIds){const l=e.get(r);l&&(l.ignored?i.push(...n(r)):i.push(r))}return i}const s=new Map;for(const o of t)o.ignored||s.set(o.nodeId,{node:o,children:[],parent:null});for(const o of t){if(o.ignored)continue;const c=s.get(o.nodeId);if(o.childIds)for(const i of o.childIds){const r=e.get(i);if(r)if(r.ignored){const l=n(i);for(const v of l){const u=s.get(v);u&&(u.parent=c,c.children.push(u))}}else{const l=s.get(i);l&&(l.parent=c,c.children.push(l))}}}for(const o of s.values())if(!o.parent)return o;return null}const p=80;function A(t,e){const n=N(e);if(!n)return"";const s=C(t,n),o=U(n);return s+(o.length>0?`

## Additional Links
`+o.join(`
`):"")}function C(t,e){const n=[];return d(t,e,n,0,!0),n.join("")}function d(t,e,n,s,o){switch(h(e.node)){case"navigation":return;case"heading":x(t,e,n,s);return;case"paragraph":$(t,e,n,s,o);return;case"list":n.push(`
`);for(const i of e.children)d(t,i,n,s+1,!0);n.push(`
`);return;case"ListMarker":n.push(a(e.node,o));return;case"listitem":{const i=[];for(const l of e.children)d(t,l,i,s+1,!0);const r=g(e.node)>1?" ".repeat(g(e.node)):"";n.push(`${r}${i.join("").trim()}
`);return}case"link":if(!f(e)){const i=a(e.node,o),r=m(e.node);T(t,e.node)?n.push(i):n.push(`[${i}](${r})`)}return;case"StaticText":{const i=a(e.node,o);i&&n.push(i);break}case"image":{const i=a(e.node,o)||"Image",r=L(e.node);r?n.push(`![${i}](${r})

`):n.push(`[Image: ${i}]

`);break}case"DescriptionList":j(t,e,n,s);return;case"blockquote":n.push("> "+a(e.node,o).replace(/\n/g,`
> `)+`

`);break;case"generic":n.push(" ");break;case"code":{P(t,e,n,s);return}case"pre":n.push("```\n"+a(e.node,!1)+"\n```\n\n");break;case"table":M(e,n);return}for(const i of e.children)d(t,i,n,s+1,o)}function h(t){return t.role?.value||""}function a(t,e){const n=t.name?.value||t.value?.value||"";if(!e||n.length<=p)return n;const s=n.split("");let o=-1;for(let c=1;c<s.length;c++)s[c]===" "&&(o=c),c%p===0&&o!==-1&&(s[o]=`
`,o=c);return s.join("")}function g(t){const e=t.properties?.find(n=>n.name==="level");return e?Math.min(Number(e.value.value)||1,6):1}function m(t){return t.properties?.find(n=>n.name==="url")?.value.value||"#"}function L(t){return t.properties?.find(n=>n.name==="url")?.value.value||null}function f(t){let e=t;for(;e;){const n=h(e.node);if(["navigation","menu","menubar"].includes(n))return!0;e=e.parent}return!1}function T(t,e){const n=m(e);try{const s=I.parse(n);return s.scheme===t.scheme&&s.authority===t.authority&&s.path===t.path}catch{return!1}}function $(t,e,n,s,o){n.push(`
`);for(const c of e.children)d(t,c,n,s+1,o);n.push(`

`)}function x(t,e,n,s){n.push(`
`);const o=g(e.node);n.push(`${"#".repeat(o)} `);for(const c of e.children)h(c.node)==="StaticText"?n.push(a(c.node,!1)):d(t,c,n,s+1,!1);n.push(`

`)}function j(t,e,n,s){n.push(`
`);for(const o of e.children)if(h(o.node)==="term"){n.push("- **");for(const c of o.children)d(t,c,n,s+1,!0);n.push("** ")}else if(h(o.node)==="definition"){for(const c of o.children)d(t,c,n,s+1,!0);n.push(`
`)}n.push(`
`)}function M(t,e){e.push(`
`);const n=t.children.filter(s=>h(s.node).includes("row"));if(n.length>0){const s=n[0].children.filter(c=>h(c.node).includes("cell")),o=s.map(c=>a(c.node,!1)||" ");e.push("| "+o.join(" | ")+` |
`),e.push("| "+s.map(()=>"---").join(" | ")+` |
`);for(let c=1;c<n.length;c++){const r=n[c].children.filter(l=>h(l.node).includes("cell")).map(l=>a(l.node,!1)||" ");e.push("| "+r.join(" | ")+` |
`)}}e.push(`
`)}function P(t,e,n,s){const o=[];for(const i of e.children)d(t,i,o,s+1,!1);if(o.some(i=>i.includes(`
`)))n.push("\n```\n"),n.push(o.join("")),n.push("\n```\n");else{n.push("`");let i=0;for(const r of o)i+=r.length,i>p&&(n.push(`
`),i=0),n.push(r),n.push("`")}}function U(t){const e=[];return k(t,e),e}function k(t,e){if(h(t.node)==="link"&&f(t)){const s=a(t.node,!0),o=m(t.node),c=t.node.description?.value||"";e.push(`- [${s}](${o})${c?" - "+c:""}`)}for(const s of t.children)k(s,e)}export{A as $PA};
