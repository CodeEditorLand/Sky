import*as f from"../../../base/common/performance.js";import{createApiFactoryAndRegisterActors as R}from"../common/extHost.api.impl.js";import{RequireInterceptor as g}from"../common/extHostRequireInterceptor.js";import"../common/extHostExtensionActivator.js";import{connectProxyResolver as S}from"./proxyResolver.js";import{AbstractExtHostExtensionService as E}from"../common/extHostExtensionService.js";import{ExtHostDownloadService as P}from"./extHostDownloadService.js";import{URI as h}from"../../../base/common/uri.js";import{Schemas as w}from"../../../base/common/network.js";import"../../../platform/extensions/common/extensions.js";import{ExtensionRuntime as D}from"../common/extHostTypes.js";import{CLIServer as k}from"./extHostCLIServer.js";import{realpathSync as L}from"../../../base/node/extpath.js";import{ExtHostConsoleForwarder as T}from"./extHostConsoleForwarder.js";import{ExtHostDiskFileSystemProvider as b}from"./extHostDiskFileSystemProvider.js";import _ from"node:module";import{assertType as C}from"../../../base/common/types.js";import{generateUuid as A}from"../../../base/common/uuid.js";import{BidirectionalMap as M}from"../../../base/common/map.js";import{DisposableStore as U,toDisposable as F}from"../../../base/common/lifecycle.js";const y=_.createRequire(import.meta.url);class H extends g{_installInterceptor(){const t=this,e=y("module"),o=e._load;e._load=function(i,c,m){return i=a(i),t._factories.has(i)?t._factories.get(i).load(i,h.file(L(c.filename)),n=>o.apply(this,[n,c,m])):o.apply(this,arguments)};const l=e._resolveLookupPaths;e._resolveLookupPaths=(r,i)=>l.call(this,a(r),i);const s=e._resolveFilename;e._resolveFilename=function(i,c,m,n){return i==="vsda"&&Array.isArray(n?.paths)&&n.paths.length===0&&(n.paths=e._nodeModulePaths(import.meta.dirname)),s.call(this,i,c,m,n)};const a=r=>{for(const i of t._alternatives){const c=i(r);if(c){r=c;break}}return r}}}class d extends g{static _createDataUri(t){return`data:text/javascript;base64,${Buffer.from(t).toString("base64")}`}static _loaderScript=`
	let lookup;
	export const initialize = async (context) => {
		let requestIds = 0;
		const { port } = context;
		const pendingRequests = new Map();
		port.onmessage = (event) => {
			const { id, url } = event.data;
			pendingRequests.get(id)?.(url);
		};
		lookup = url => {
			// debugger;
			const myId = requestIds++;
			return new Promise((resolve) => {
				pendingRequests.set(myId, resolve);
				port.postMessage({ id: myId, url, });
			});
		};
	};
	export const resolve = async (specifier, context, nextResolve) => {
		if (specifier !== 'vscode' || !context.parentURL) {
			return nextResolve(specifier, context);
		}
		const otherUrl = await lookup(context.parentURL);
		return {
			url: otherUrl,
			shortCircuit: true,
		};
	};`;static _vscodeImportFnName="_VSCODE_IMPORT_VSCODE_API";_store=new U;dispose(){this._store.dispose()}_installInterceptor(){const t=new M,e=new Map;Object.defineProperty(globalThis,d._vscodeImportFnName,{enumerable:!1,configurable:!1,writable:!1,value:r=>t.getKey(r)});const{port1:o,port2:l}=new MessageChannel;let s;const a=o;a.onmessage=r=>{s||(s=this._factories.get("vscode"),C(s));const{id:i,url:c}=r.data,m=h.parse(c),n=s.load("_not_used",m,()=>{throw new Error("CANNOT LOAD MODULE from here.")});let p=t.get(n);p||(p=A(),t.set(n,p));let u=e.get(p);if(!u){const I=`const _vscodeInstance = globalThis.${d._vscodeImportFnName}('${p}');

${Object.keys(n).map(v=>`export const ${v} = _vscodeInstance['${v}'];`).join(`
`)}`;u=d._createDataUri(I),e.set(p,u)}o.postMessage({id:i,url:u})},_.register(d._createDataUri(d._loaderScript),{parentURL:import.meta.url,data:{port:l},transferList:[l]}),this._store.add(F(()=>{o.close(),l.close()}))}}class ne extends E{extensionRuntime=D.Node;async _beforeAlmostReadyToRunExtensions(){this._instaService.createInstance(T);const t=this._instaService.invokeFunction(R);if(this._instaService.createInstance(P),this._initData.remote.isRemote&&this._initData.remote.authority){const o=this._instaService.createInstance(k);process.env.VSCODE_IPC_HOOK_CLI=o.ipcHandlePath}this._instaService.createInstance(b),await this._instaService.createInstance(H,t,{mine:this._myRegistry,all:this._globalRegistry}).install(),await this._store.add(this._instaService.createInstance(d,t,{mine:this._myRegistry,all:this._globalRegistry})).install(),f.mark("code/extHost/didInitAPI");const e=await this._extHostConfiguration.getConfigProvider();await S(this._extHostWorkspace,e,this,this._logService,this._mainThreadTelemetryProxy,this._initData,this._store),f.mark("code/extHost/didInitProxyResolver")}_getEntryPoint(t){return t.main}async _doLoadModule(t,e,o,l){if(e.scheme!==w.file)throw new Error(`Cannot load URI: '${e}', must be of file-scheme`);let s=null;o.codeLoadingStart(),this._logService.trace(`ExtensionService#loadModule [${l}] -> ${e.toString(!0)}`),this._logService.flush();const a=t?.identifier.value;t&&await this._extHostLocalizationService.initializeLocalizedMessages(t);try{a&&f.mark(`code/extHost/willLoadExtensionCode/${a}`),l==="esm"?s=await import(e.fsPath):s=y(e.fsPath)}finally{a&&f.mark(`code/extHost/didLoadExtensionCode/${a}`),o.codeLoadingStop()}return s}async _loadCommonJSModule(t,e,o){return this._doLoadModule(t,e,o,"cjs")}async _loadESMModule(t,e,o){return this._doLoadModule(t,e,o,"esm")}async $setRemoteEnvironment(t){if(this._initData.remote.isRemote)for(const e in t){const o=t[e];o===null?delete process.env[e]:process.env[e]=o}}}export{ne as ExtHostExtensionService};
