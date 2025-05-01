import{localize as s}from"../../../../nls.js";import{asArray as c}from"../../../../base/common/arrays.js";import{MarkdownString as p}from"../../../../base/common/htmlContent.js";import d from"../../../../base/common/severity.js";import{basename as g}from"../../../../base/common/path.js";function S(e,l){const t=parseInt(l.get("terminal.integrated.tabs.showDetailed",-1)??"0");let i="";const r=e.statusList.statuses,o=[];for(const n of r)t?(n.detailedTooltip??n.tooltip)&&(i+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.detailedTooltip??n.tooltip??"")):n.tooltip&&(i+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.tooltip??"")),n.hoverActions&&o.push(...n.hoverActions);o.push({commandId:"toggleDetailedInfo",label:t?s("hideDetails","Hide Details"):s("showDetails","Show Details"),run(){l.store("terminal.integrated.tabs.showDetailed",(t+1)%2,-1,0)}});const a=u(e,!!t);return{content:new p(e.title+a+i,{supportThemeIcons:!0}),actions:o}}function u(e,l){const t=[];if(e.processId&&e.processId>0&&t.push(s({key:"shellProcessTooltip.processId",comment:[`The first arg is "PID" which shouldn't be translated`]},"Process ID ({0}): {1}","PID",e.processId)+`
`),e.shellLaunchConfig.executable){let i="";if(!l&&e.shellLaunchConfig.executable.length>32){const o=g(e.shellLaunchConfig.executable),a=e.shellLaunchConfig.executable.length-o.length-1,h=e.shellLaunchConfig.executable.substring(a,a+1);i+=`\u2026${h}${o}`}else i+=e.shellLaunchConfig.executable;const r=c(e.injectedArgs||e.shellLaunchConfig.args||[]).map(o=>o.match(/\s/)?`'${o}'`:o).join(" ");r&&(i+=` ${r}`),t.push(s("shellProcessTooltip.commandLine","Command line: {0}",i))}return t.length?`

---

${t.join(`
`)}`:""}function D(e){if(!e.xterm)return;const l=e.capabilities.get(2)?.hasRichCommandDetection?s("shellIntegration.rich","Rich"):e.capabilities.has(2)?s("shellIntegration.basic","Basic"):e.usedShellIntegrationInjection?s("shellIntegration.injectionFailed","Injection failed to activate"):s("shellIntegration.no","No"),t=[],i=Array.from(e.xterm.shellIntegration.seenSequences);i.length>0&&t.push(`Seen sequences: ${i.map(h=>`\`${h}\``).join(", ")}`);const r=e.capabilities.get(2)?.promptType;r&&t.push(`Prompt type: \`${r}\``);const o=e.capabilities.get(2)?.promptInputModel.getCombinedString();o!==void 0&&t.push(`Prompt input: \`${o}\``);const a=t.length>0?`

`+t.map(h=>`- ${h}`).join(`
`):"";e.statusList.add({id:"shell-integration-info",severity:d.Info,tooltip:`${s("shellIntegration","Shell integration")}: ${l}`,detailedTooltip:`${s("shellIntegration","Shell integration")}: ${l}${a}`})}export{S as getInstanceHoverInfo,u as getShellProcessTooltip,D as refreshShellIntegrationInfoStatus};
