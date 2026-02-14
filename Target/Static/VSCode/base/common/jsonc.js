const c=/("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;function l(n){return n.replace(c,function(r,i,t,o,e,u){if(o)return"";if(e){const s=e.length;return e[s-1]===`
`?e[s-2]==="\r"?`\r
`:`
`:""}else return u?r.substring(1):r})}function p(n){const r=l(n);try{return JSON.parse(r)}catch{const t=r.replace(/,\s*([}\]])/g,"$1");return JSON.parse(t)}}export{l as $Gl,p as $Hl};
