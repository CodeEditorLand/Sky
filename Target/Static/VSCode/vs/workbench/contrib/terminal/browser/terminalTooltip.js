import{localize as s}from"../../../../nls.js";import"./terminal.js";import{asArray as d}from"../../../../base/common/arrays.js";import{MarkdownString as g}from"../../../../base/common/htmlContent.js";import{TerminalCapability as m}from"../../../../platform/terminal/common/capabilities/capabilities.js";import{TerminalStatus as u}from"./terminalStatusList.js";import I from"../../../../base/common/severity.js";import{StorageScope as p,StorageTarget as f}from"../../../../platform/storage/common/storage.js";import{TerminalStorageKeys as h}from"../common/terminalStorageKeys.js";import{basename as S}from"../../../../base/common/path.js";function x(e,r){const t=parseInt(r.get(h.TabsShowDetailed,p.APPLICATION)??"0");let i="";const l=e.statusList.statuses,o=[];for(const n of l)t?(n.detailedTooltip??n.tooltip)&&(i+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.detailedTooltip??n.tooltip??"")):n.tooltip&&(i+=`

---

${n.icon?`$(${n.icon?.id}) `:""}`+(n.tooltip??"")),n.hoverActions&&o.push(...n.hoverActions);o.push({commandId:"toggleDetailedInfo",label:t?s("hideDetails","Hide Details"):s("showDetails","Show Details"),run(){r.store(h.TabsShowDetailed,(t+1)%2,p.APPLICATION,f.USER)}});const a=T(e,!!t);return{content:new g(e.title+a+i,{supportThemeIcons:!0}),actions:o}}function T(e,r){const t=[];if(e.processId&&e.processId>0&&t.push(s({key:"shellProcessTooltip.processId",comment:[`The first arg is "PID" which shouldn't be translated`]},"Process ID ({0}): {1}","PID",e.processId)+`
`),e.shellLaunchConfig.executable){let i="";if(!r&&e.shellLaunchConfig.executable.length>32){const o=S(e.shellLaunchConfig.executable),a=e.shellLaunchConfig.executable.length-o.length-1,c=e.shellLaunchConfig.executable.substring(a,a+1);i+=`\u2026${c}${o}`}else i+=e.shellLaunchConfig.executable;const l=d(e.injectedArgs||e.shellLaunchConfig.args||[]).map(o=>o.match(/\s/)?`'${o}'`:o).join(" ");l&&(i+=` ${l}`),t.push(s("shellProcessTooltip.commandLine","Command line: {0}",i))}return t.length?`

---

${t.join(`
`)}`:""}function H(e){if(!e.xterm)return;const r=e.capabilities.get(m.CommandDetection)?.hasRichCommandDetection?s("shellIntegration.rich","Rich"):e.capabilities.has(m.CommandDetection)?s("shellIntegration.basic","Basic"):e.usedShellIntegrationInjection?s("shellIntegration.injectionFailed","Injection failed to activate"):s("shellIntegration.no","No"),t=[],i=Array.from(e.xterm.shellIntegration.seenSequences);i.length>0&&t.push(`Seen sequences: ${i.map(c=>`\`${c}\``).join(", ")}`);const l=e.capabilities.get(m.CommandDetection)?.promptType;l&&t.push(`Prompt type: \`${l}\``);const o=e.capabilities.get(m.CommandDetection)?.promptInputModel.getCombinedString();o!==void 0&&t.push(`Prompt input: \`${o}\``);const a=t.length>0?`

`+t.map(c=>`- ${c}`).join(`
`):"";e.statusList.add({id:u.ShellIntegrationInfo,severity:I.Info,tooltip:`${s("shellIntegration","Shell integration")}: ${r}`,detailedTooltip:`${s("shellIntegration","Shell integration")}: ${r}${a}`})}export{x as getInstanceHoverInfo,T as getShellProcessTooltip,H as refreshShellIntegrationInfoStatus};
