import*as k from"../../../../../../../base/browser/dom.js";import{$1c as I}from"../../../../../../../base/common/assert.js";import{$$h as x}from"../../../../../../../base/common/async.js";import{$qj as g}from"../../../../../../../base/common/buffer.js";import{$Jf as E}from"../../../../../../../base/common/cancellation.js";import{$xf as S}from"../../../../../../../base/common/event.js";import{$Gn as j}from"../../../../../../../base/common/hash.js";import{$jk as w}from"../../../../../../../base/common/htmlContent.js";import{$Ed as L}from"../../../../../../../base/common/lifecycle.js";import{autorun as R,autorunSelfDisposable as T,observableValue as A}from"../../../../../../../base/common/observable.js";import{$Fh as v}from"../../../../../../../base/common/resources.js";import{$Uf as H}from"../../../../../../../base/common/strings.js";import{$rd as b,$dd as O}from"../../../../../../../base/common/types.js";import{localize as P}from"../../../../../../../nls.js";import{$Mj as Y}from"../../../../../../../platform/instantiation/common/instantiation.js";import{$yo as W}from"../../../../../../../platform/log/common/log.js";import{$EP as _}from"../../../../../../../platform/opener/common/opener.js";import{$Vn as q}from"../../../../../../../platform/product/common/productService.js";import{$hp as F}from"../../../../../../../platform/storage/common/storage.js";import{$B3b as N}from"../../../../../mcp/browser/mcpToolCallUI.js";import{McpResourceURI as y}from"../../../../../mcp/common/mcpTypes.js";import{McpApps as z}from"../../../../../mcp/common/modelContextProtocolApps.js";import{$SDb as B,$UDb as U}from"../../../../../webview/browser/webview.js";import{$6T as X}from"../../../../common/tools/languageModelToolsService.js";import{$U4b as Z}from"../../../chat.js";var C=function(h,t,e,o){var i=arguments.length,n=i<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(h,t,e,o);else for(var a=h.length-1;a>=0;a--)(s=h[a])&&(n=(i<3?s(n):i>3?s(t,e,n):s(t,e))||n);return i>3&&n&&Object.defineProperty(t,e,n),n},d=function(h,t){return function(e,o){t(e,o,h)}},m;const J="chatMcpApp.origins";let D=class extends L{static{m=this}static{this.a=new WeakMap}constructor(t,e,o,i,n,s,a,r,l,c,p,$){super(),this.toolInvocation=t,this.renderData=e,this.u=o,this.w=s,this.y=a,this.z=r,this.C=c,this.F=p,this.G=$,this.h=this.D(new E),this.j=!1,this.m=void 0,this.r=A(this,{status:"loading"}),this.loadState=this.r,this.t=this.D(new S),this.onDidChangeHeight=this.t.event,this.b=new U(J,l),this.q=this.b.getOrigin("mcpApp",e.serverDefinitionId),this.g=this.D(this.w.createInstance(N,e)),this.n=m.a.get(this.toolInvocation)??300,this.f=this.D(this.z.createWebviewElement({origin:this.q,title:P(6595,null),options:{purpose:"chatOutputItem",enableFindWidget:!1,disableServiceWorker:!0,retainContextWhenHidden:!0},contentOptions:{allowMultipleAPIAcquire:!0,allowScripts:!0,allowForms:!0},extension:void 0}));const M=k.getWindow(this.u);this.f.mountTo(this.u,M),this.hostContext=this.g.hostContext.map((u,f)=>({...u,containerDimensions:{width:n.read(f),maxHeight:i.read(f)},toolCall:{toolCallId:this.toolInvocation.toolCallId,toolName:this.toolInvocation.toolId}})),this.D(R(u=>{const f=this.hostContext.read(u);this.j&&this.Z({method:"ui/notifications/host-context-changed",params:f})})),this.D(this.f.onMessage(async({message:u})=>{await this.L(u)})),this.H()}get height(){return this.n}remount(){this.f.reinitializeAfterDismount(),this.j=!1}retry(){this.r.set({status:"loading"},void 0),this.H()}async H(){const t=this.h.token;try{const e=await this.g.loadResource(t);if(t.isCancellationRequested)return;const o=this.I(e);this.j=!1,this.m=e.csp,this.f.setHtml(o),this.r.set({status:"loaded"},void 0)}catch(e){this.C.error("[MCP App] Error loading app:",e),this.r.set({status:"error",error:e},void 0)}}I({html:t,csp:e}){const o=a=>(a?.join(" ")||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"),n=`<meta http-equiv="Content-Security-Policy" content="${`
			default-src 'none';
			script-src 'self' 'unsafe-inline' ${o(e?.resourceDomains)};
			style-src 'self' 'unsafe-inline' ${o(e?.resourceDomains)};
			connect-src 'self' ${o(e?.connectDomains)};
			img-src 'self' data: ${o(e?.resourceDomains)};
			font-src 'self' ${o(e?.resourceDomains)};
			media-src 'self' data: ${o(e?.resourceDomains)};
			frame-src ${o(e?.frameDomains)||"'none'"};
			object-src 'none';
			base-uri ${o(e?.baseUriDomains)||"'self'"};
		`}">`;return this.J(t,n+`
			<script>(() => {
				const api = acquireVsCodeApi();
				const setMessageSource = (obj, src) => new Proxy(obj, {
					get: (target, prop) => {
						if (prop === 'source')  {
							return src;
						}
						return target[prop];
					}
				});

				const wrappedFns = new WeakMap();

				let patchedPostMessage = (message, transfer) => api.postMessage(message, transfer);
				const wrap = target => new Proxy(target, {
					set: (obj, prop, value) => {
						if (prop === 'postMessage') {
							patchedPostMessage = (message, transfer) => value.call(target, message, transfer);
						} else {
							obj[prop] = value;
						}
						return true;
					},
					get: (obj, prop) => {
						if (prop === 'postMessage') {
							return patchedPostMessage;
						}
						return obj[prop];
					},
				});

				const originalAddEventListener = window.addEventListener.bind(window);
				window.addEventListener = (type, listener, options) => {
					if (type === 'message') {
						const originalListener = listener;
						const wrappedListener = (event) => {
							if (event.origin === document.location.origin && event.source !== window) { event = setMessageSource(event, window.parent); }
							originalListener(event);
						};
						wrappedFns.set(originalListener, wrappedListener);
						listener = wrappedListener;
					}

					return originalAddEventListener(type, listener, options);
				};

				const originalRemoveEventListener = window.removeEventListener.bind(window);
				window.removeEventListener = (type, listener, options) => {
					const wrappedListener = wrappedFns.get(listener) || listener;
					return originalRemoveEventListener(type, wrappedListener, options);
				};

				window.parent = wrap(window.parent);

				// Scroll boundary detection: bubble wheel events to parent when at scroll boundaries
				const shouldBubbleScroll = (event) => {
					// First check element-level scrolling (for elements with overflow: auto/scroll)
					for (let node = event.target; node; node = node.parentNode) {
						if (!(node instanceof Element)) {
							continue;
						}

						// Skip HTML and BODY - we check document-level scroll separately
						if (node === document.documentElement || node === document.body) {
							continue;
						}

						// Check if the element can actually scroll
						const overflow = window.getComputedStyle(node).overflowY;
						if (overflow === 'hidden' || overflow === 'visible') {
							continue;
						}

						// Scroll up: if there's content above (scrollTop > 0), don't bubble
						if (event.deltaY < 0 && node.scrollTop > 0) {
							return false;
						}

						// Scroll down: if there's content below, don't bubble
						if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
							// Account for rounding: scrollTop isn't rounded but scrollHeight/clientHeight are
							if (node.scrollHeight - node.scrollTop - node.clientHeight < 2) {
								continue;
							}
							return false;
						}
					}

					// Check document-level scrolling (works even with overflow: visible on html/body)
					const docEl = document.documentElement;
					const scrollTop = window.scrollY || docEl.scrollTop || document.body.scrollTop || 0;
					const scrollHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
					const clientHeight = docEl.clientHeight;
					const scrollableDistance = scrollHeight - clientHeight;

					if (scrollableDistance > 2) {
						// Document is scrollable
						if (event.deltaY < 0 && scrollTop > 0) {
							return false;
						}
						if (event.deltaY > 0 && scrollTop < scrollableDistance - 2) {
							return false;
						}
					}

					return true;
				};

				window.addEventListener('wheel', (event) => {
					if (event.defaultPrevented || !shouldBubbleScroll(event)) {
						return;
					}
					api.postMessage({
						method: 'ui/notifications/sandbox-wheel',
						params: {
							deltaMode: event.deltaMode,
							deltaX: event.deltaX,
							deltaY: event.deltaY,
							deltaZ: event.deltaZ,
						}
					});
				}, { passive: true });
			})();<\/script>
		`)}J(t,e){const o=t.match(/<head[^>]*>/i);if(o){const n=o.index+o[0].length;return t.slice(0,n)+`
`+e+t.slice(n)}const i=t.match(/<html[^>]*>/i);if(i){const n=i.index+i[0].length;return t.slice(0,n)+`
<head>`+e+"</head>"+t.slice(n)}return`<!DOCTYPE html><html><head>${e}</head><body>${t}</body></html>`}async L(t){const e=t,o=this.h.token;try{let i={};switch(e.method){case"ui/initialize":i=await this.M(e.params);break;case"tools/call":i=await this.U(e.params,o);break;case"resources/read":i=await this.W(e.params,o);break;case"ping":break;case"ui/notifications/size-changed":this.Q(e.params);break;case"ui/open-link":i=await this.S(e.params);break;case"ui/request-display-mode":i={mode:"inline"};break;case"ui/notifications/initialized":break;case"ui/message":i=await this.O(e.params);break;case"ui/update-model-context":i=await this.P(e.params);break;case"notifications/message":await this.g.log(e.params);break;case"ui/notifications/sandbox-wheel":this.R(e.params);break;default:{I(e);const n=e;n.id!==void 0&&await this.Y(n.id,-32601,`Method not found: ${n.method}`);return}}b(e,{id:!0})&&await this.X(e.id,i)}catch(i){if(this.C.error(`[MCP App] Error handling ${e.method}:`,i),b(e,{id:!0})){const n=i instanceof Error?i.message:String(i);await this.Y(e.id,-32e3,n)}}}async M(t){this.j=!0;let e;try{e=JSON.parse(this.renderData.input)}catch{e=this.renderData.input}const o=this.D(x(async()=>{if(this.B.delete(o),await this.Z({method:"ui/notifications/tool-input",params:{arguments:e}}),this.toolInvocation.kind==="toolInvocationSerialized")this.N(this.toolInvocation.resultDetails);else if(this.toolInvocation.kind==="toolInvocation"){const i=this.toolInvocation;this.D(T(n=>{const s=i.state.read(n);s.type===4&&(this.N(s.resultDetails),n.dispose())}))}}));return{protocolVersion:z.LATEST_PROTOCOL_VERSION,hostInfo:{name:this.F.nameLong,version:this.F.version},hostCapabilities:{openLinks:{},serverTools:{listChanged:!0},serverResources:{listChanged:!0},logging:{},sandbox:{csp:this.m,permissions:{clipboardWrite:{}}},updateModelContext:{audio:{},image:{},resourceLink:{},resource:{},structuredContent:{}}},hostContext:this.hostContext.get()}}N(t){X(t)&&t.mcpOutput&&this.Z({method:"ui/notifications/tool-result",params:t.mcpOutput})}async O(t){const e=this.y.getWidgetBySessionResource(this.renderData.sessionResource);return e?H(e.getInput())?(e.setInput(t.content.filter(o=>o.type==="text").map(o=>o.text).join(`

`)),e.attachmentModel.clearAndSetContext(...t.content.map((o,i)=>{const n=`mcpui-${i}-${Date.now()}`;if(o.type==="image")return{kind:"image",value:g(o.data).buffer,id:n,name:"Image"};if(o.type==="resource_link"){const s=y.fromServer({id:this.renderData.serverDefinitionId,label:""},o.uri);return{kind:"file",value:s,id:n,name:v(s)}}else return}).filter(O)),e.focusInput(),{isError:!1}):{isError:!0}:{isError:!0}}async P(t){const e=this.y.getWidgetBySessionResource(this.renderData.sessionResource);if(!e)return{};const o=`mcpui-context-${j(this.renderData.serverDefinitionId)}-`,i=e.attachmentModel.getAttachmentIDs(),n=Array.from(i).filter(r=>r.startsWith(o)),s=[];let a=0;if(t.content)for(const r of t.content){const l=`${o}${a++}`;if(r.type==="image")s.push({kind:"image",value:g(r.data).buffer,id:l,name:"Image",mimeType:r.mimeType});else if(r.type==="resource_link"){const c=y.fromServer({id:this.renderData.serverDefinitionId,label:""},r.uri);s.push({kind:"file",value:c,id:l,name:v(c)})}else if(r.type==="text"){const c=r.text.replaceAll(/\s+/g," ").trim(),p=20;s.push({kind:"generic",value:r.text,id:l,tooltip:new w().appendCodeblock("plaintext",r.text),name:c.length>p?c.slice(0,p)+"\u2026":c})}}if(t.structuredContent&&Object.keys(t.structuredContent).length>0){const r=`${o}structured`,l=JSON.stringify(t.structuredContent,null,2);s.push({kind:"generic",value:l,tooltip:new w().appendCodeblock("json",l),id:r,name:"UI Data"})}return e.attachmentModel.updateContext(n,s),{}}Q(t){t.height!==void 0&&t.height!==this.n&&(this.n=t.height,m.a.set(this.toolInvocation,t.height),this.t.fire())}R(t){let e=!1;const o={wheelDeltaX:t.deltaX,wheelDeltaY:-t.deltaY,wheelDelta:Math.abs(t.deltaY),deltaX:t.deltaX,deltaY:-t.deltaY,deltaZ:t.deltaZ,deltaMode:t.deltaMode,preventDefault:()=>{e=!0},stopPropagation:()=>{},get defaultPrevented(){return e}};this.y.getWidgetBySessionResource(this.renderData.sessionResource)?.delegateScrollFromMouseWheelEvent(o)}async S(t){return{isError:!await this.G.open(t.url)}}async U(t,e){if(!t?.name)throw new Error("Missing tool name in tools/call request");return this.g.callTool(t.name,t.arguments||{},e)}async W(t,e){if(!t?.uri)throw new Error("Missing uri in resources/read request");return this.g.readResource(t.uri,e)}async X(t,e){await this.f.postMessage({jsonrpc:"2.0",id:t,result:e})}async Y(t,e,o){await this.f.postMessage({jsonrpc:"2.0",id:t,error:{code:e,message:o}})}async Z(t){await this.f.postMessage({jsonrpc:"2.0",...t})}dispose(){this.h.dispose(!0),super.dispose()}};D=m=C([d(5,Y),d(6,Z),d(7,B),d(8,F),d(9,W),d(10,q),d(11,_)],D);export{D as $C3b};
