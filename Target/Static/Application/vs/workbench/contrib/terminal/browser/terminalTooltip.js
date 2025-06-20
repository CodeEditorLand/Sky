import{localize as i}from"../../../../nls.js";import{$mc as c}from"../../../../base/common/arrays.js";import{$Uj as a}from"../../../../base/common/htmlContent.js";import d from"../../../../base/common/severity.js";import{$$ as h}from"../../../../base/common/path.js";function x(e,s){const t=parseInt(s.get("terminal.integrated.tabs.showDetailed",-1)??"0");let l="";const r=e.statusList.statuses,o=[];for(const n of r)t?(n.detailedTooltip??n.tooltip)&&(l+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.detailedTooltip??n.tooltip??"")):n.tooltip&&(l+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.tooltip??"")),n.hoverActions&&o.push(...n.hoverActions);o.push({commandId:"toggleDetailedInfo",label:t?i(11695,null):i(11696,null),run(){s.store("terminal.integrated.tabs.showDetailed",(t+1)%2,-1,0)}});const u=m(e,!!t);return{content:new a(e.title+u+l,{supportThemeIcons:!0}),actions:o}}function m(e,s){const t=[];if(e.processId&&e.processId>0&&t.push(i(11697,null,"PID",e.processId)+`
`),e.shellLaunchConfig.executable){let l="";if(!s&&e.shellLaunchConfig.executable.length>32){const o=h(e.shellLaunchConfig.executable),u=e.shellLaunchConfig.executable.length-o.length-1,p=e.shellLaunchConfig.executable.substring(u,u+1);l+=`\u2026${p}${o}`}else l+=e.shellLaunchConfig.executable;const r=c(e.injectedArgs||e.shellLaunchConfig.args||[]).map(o=>o.match(/\s/)?`'${o}'`:o).join(" ");r&&(l+=` ${r}`),t.push(i(11698,null,l))}return t.length?`

---

${t.join(`
`)}`:""}function L(e){if(!e.xterm)return;const s=e.capabilities.get(2)?.hasRichCommandDetection?i(11699,null):e.capabilities.has(2)?i(11700,null):e.usedShellIntegrationInjection?i(11701,null):i(11702,null),t=[],l=Array.from(e.xterm.shellIntegration.seenSequences);l.length>0&&t.push(`Seen sequences: ${l.map(p=>`\`${p}\``).join(", ")}`);const r=e.capabilities.get(2)?.promptType;r&&t.push(`Prompt type: \`${r}\``);const o=e.capabilities.get(2)?.promptInputModel.getCombinedString();o!==void 0&&t.push(`Prompt input: \`${o}\``);const u=t.length>0?`

`+t.map(p=>`- ${p}`).join(`
`):"";e.statusList.add({id:"shell-integration-info",severity:d.Info,tooltip:`${i(11703,null)}: ${s}`,detailedTooltip:`${i(11704,null)}: ${s}${u}`})}export{x as $6qc,m as $7qc,L as $8qc};
