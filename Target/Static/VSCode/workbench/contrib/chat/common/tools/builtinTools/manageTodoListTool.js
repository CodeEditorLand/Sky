import{$Ed as h}from"../../../../../../base/common/lifecycle.js";import{$bk as f}from"../../../../../../base/common/codicons.js";import{ThemeIcon as k}from"../../../../../../base/common/themables.js";import{ToolDataSource as b}from"../languageModelToolsService.js";import{$yo as y}from"../../../../../../platform/log/common/log.js";import{$pp as C}from"../../../../../../platform/telemetry/common/telemetry.js";import{$iPb as T}from"../chatTodoListService.js";import{localize as l}from"../../../../../../nls.js";import{$jk as v}from"../../../../../../base/common/htmlContent.js";import{URI as I}from"../../../../../../base/common/uri.js";var g=function(u,t,e,o){var i=arguments.length,s=i<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(u,t,e,o);else for(var n=u.length-1;n>=0;n--)(r=u[n])&&(s=(i<3?r(s):i>3?r(t,e,s):r(t,e))||s);return i>3&&s&&Object.defineProperty(t,e,s),s},p=function(u,t){return function(e,o){t(e,o,u)}};const M="manage_todo_list";function x(){const u={type:"object",properties:{todoList:{type:"array",description:"Complete array of all todo items. Must include ALL items - both existing and new.",items:{type:"object",properties:{id:{type:"number",description:"Unique identifier for the todo. Use sequential numbers starting from 1."},title:{type:"string",description:"Concise action-oriented todo label (3-7 words). Displayed in UI."},status:{type:"string",enum:["not-started","in-progress","completed"],description:"not-started: Not begun | in-progress: Currently working (max 1) | completed: Fully finished with no blockers"}},required:["id","title","status"]}}},required:["todoList"]};return{id:M,toolReferenceName:"todo",legacyToolReferenceFullNames:["todos"],canBeReferencedInPrompt:!0,icon:k.fromId(f.checklist.id),displayName:l(7096,null),userDescription:l(7097,null),modelDescription:`Manage a structured todo list to track progress and plan tasks throughout your coding session. Use this tool VERY frequently to ensure task visibility and proper planning.

When to use this tool:
- Complex multi-step work requiring planning and tracking
- When user provides multiple tasks or requests (numbered/comma-separated)
- After receiving new instructions that require multiple steps
- BEFORE starting work on any todo (mark as in-progress)
- IMMEDIATELY after completing each todo (mark completed individually)
- When breaking down larger tasks into smaller actionable steps
- To give users visibility into your progress and planning

When NOT to use:
- Single, trivial tasks that can be completed in one step
- Purely conversational/informational requests
- When just reading files or performing simple searches

CRITICAL workflow:
1. Plan tasks by writing todo list with specific, actionable items
2. Mark ONE todo as in-progress before starting work
3. Complete the work for that specific todo
4. Mark that todo as completed IMMEDIATELY
5. Move to next todo and repeat

Todo states:
- not-started: Todo not yet begun
- in-progress: Currently working (limit ONE at a time)
- completed: Finished successfully

IMPORTANT: Mark todos completed as soon as they are done. Do not batch completions.`,source:b.Internal,inputSchema:u}}const N=x();let m=class extends h{constructor(t,e,o){super(),this.a=t,this.b=e,this.c=o}async invoke(t,e,o,i){const s=t.parameters;let r=t.context?.sessionResource;if(!r&&s.operation==="read"&&s.chatSessionResource)try{r=I.parse(s.chatSessionResource)}catch(n){this.b.error("ManageTodoListTool: Invalid chatSessionResource URI",n)}if(!r)return{content:[{kind:"text",value:"Error: No session resource available"}]};this.b.debug(`ManageTodoListTool: Invoking with options ${JSON.stringify(s)}`);try{return s.operation==="read"?this.h(r):this.j(s,r)}catch(n){return{content:[{kind:"text",value:`Error: ${n instanceof Error?n.message:"Unknown error"}`}]}}}async prepareToolInvocation(t,e){const o=t.parameters,i=t.chatSessionResource;if(!i)return;const s=this.a.getTodos(i);let r;o.operation==="read"?r=l(7098,null):o.todoList&&(r=this.f(s,o.todoList));const a=(o.todoList??s).map(c=>({id:c.id.toString(),title:c.title,status:c.status}));return{pastTenseMessage:new v(r??l(7099,null)),toolSpecificData:{kind:"todoList",todoList:a}}}f(t,e){if(t.length===0)return e.length===1?l(7100,null):l(7101,null,e.length);const o=new Map(t.map(n=>[n.id,n])),i=e.filter(n=>{const a=o.get(n.id);return a&&a.status!=="in-progress"&&n.status==="in-progress"});if(i.length>0){const n=i[0],a=e.length,c=e.findIndex(d=>d.id===n.id)+1;return l(7102,null,n.title,c,a)}const s=e.filter(n=>{const a=o.get(n.id);return a&&a.status!=="completed"&&n.status==="completed"});if(s.length>0){const n=s[0],a=e.length,c=e.findIndex(d=>d.id===n.id)+1;return l(7103,null,n.title,c,a)}const r=e.filter(n=>!o.has(n.id));return r.length>0?r.length===1?l(7104,null):l(7105,null,r.length):l(7106,null)}g(t,e){return t.length===0?"No todo list found.":`# Todo List

${this.q(t)}`}h(t){const e=this.a.getTodos(t),o=this.g(e,t),i=this.m(e);return this.c.publicLog2("todoListToolInvoked",{operation:"read",notStartedCount:i.notStartedCount,inProgressCount:i.inProgressCount,completedCount:i.completedCount}),{content:[{kind:"text",value:o}]}}j(t,e){if(!t.todoList)return{content:[{kind:"text",value:"Error: todoList is required for write operation"}]};const o=t.todoList.map(a=>({id:a.id,title:a.title,status:a.status})),i=this.a.getTodos(e),s=this.r(i,o);this.a.setTodos(e,o);const r=this.m(o),n=[];return o.length<3?n.push("Warning: Small todo list (<3 items). This task might not need a todo list."):o.length>10&&n.push("Warning: Large todo list (>10 items). Consider keeping the list focused and actionable."),s>3&&n.push("Warning: Did you mean to update so many todos at the same time? Consider working on them one by one."),this.c.publicLog2("todoListToolInvoked",{operation:"write",notStartedCount:r.notStartedCount,inProgressCount:r.inProgressCount,completedCount:r.completedCount}),{content:[{kind:"text",value:`Successfully wrote todo list${n.length?`

`+n.join(`
`):""}`}],toolMetadata:{warnings:n}}}m(t){const e=t.filter(s=>s.status==="not-started").length,o=t.filter(s=>s.status==="in-progress").length,i=t.filter(s=>s.status==="completed").length;return{notStartedCount:e,inProgressCount:o,completedCount:i}}q(t){return t.length===0?"":t.map(e=>{let o;switch(e.status){case"completed":o="[x]";break;case"in-progress":o="[-]";break;default:o="[ ]";break}return[`- ${o} ${e.title}`].join(`
`)}).join(`
`)}r(t,e){let o=0;const i=Math.min(t.length,e.length);for(let a=0;a<i;a++){const c=t[a],d=e[a];(c.title!==d.title||c.status!==d.status)&&o++}const s=Math.max(0,e.length-t.length),r=Math.max(0,t.length-e.length);return s+r+o}};m=g([p(0,T),p(1,y),p(2,C)],m);export{N as $$2b,x as $02b,M as $92b,m as $_2b};
