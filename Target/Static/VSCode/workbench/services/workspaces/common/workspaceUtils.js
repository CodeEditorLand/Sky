async function o(e,t){for(const n of e.folders){const r=await t.resolve(n.uri);if(r.children&&r.children.length>0)return!1}return!0}export{o as $zmc};
