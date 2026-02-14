import{$sc as h}from"../../../../base/common/arrays.js";import{$jk as a}from"../../../../base/common/htmlContent.js";import{$ab as p}from"../../../../base/common/path.js";import{localize as r}from"../../../../nls.js";function b(t,s){const n=parseInt(s.get("terminal.integrated.tabs.showDetailed",-1)??"0");let l="";const i=t.statusList.statuses,o=[];for(const e of i)n?(e.detailedTooltip??e.tooltip)&&(l+=`

---

${e.icon?`$(${e.icon?.id}) `:""}`+(e.detailedTooltip??e.tooltip??"")):e.tooltip&&(l+=`

---

${e.icon?`$(${e.icon?.id}) `:""}`+(e.tooltip??"")),e.hoverActions&&o.push(...e.hoverActions);o.push({commandId:"toggleDetailedInfo",label:n?r(13363,null):r(13364,null),run(){s.store("terminal.integrated.tabs.showDetailed",(n+1)%2,-1,0)}});const c=f(t,!!n);return{content:new a(t.title+c+l,{supportThemeIcons:!0}),actions:o}}function f(t,s){const n=[];if(t.processId&&t.processId>0&&n.push(r(13365,null,"PID",t.processId)+`
`),t.shellLaunchConfig.executable){let l="";if(!s&&t.shellLaunchConfig.executable.length>32){const o=p(t.shellLaunchConfig.executable),c=t.shellLaunchConfig.executable.length-o.length-1,u=t.shellLaunchConfig.executable.substring(c,c+1);l+=`\u2026${u}${o}`}else l+=t.shellLaunchConfig.executable;const i=h(t.injectedArgs||t.shellLaunchConfig.args||[]).map(o=>o.match(/\s/)?`'${o}'`:o).join(" ");i&&(l+=` ${i}`),n.push(r(13366,null,l))}return n.length?`

---

${n.join(`
`)}`:""}export{b as $yBc,f as $zBc};
