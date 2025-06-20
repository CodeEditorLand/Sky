import{Event as h}from"../../../../base/common/event.js";import{$Vu as g}from"../../../../base/common/json.js";import{FileType as b,$5j as _}from"../../../../platform/files/common/files.js";import{$Ho as D}from"../../../../platform/storage/common/storage.js";import{$Ji as a}from"../../../../base/common/buffer.js";import{$WZb as T,$TZb as f,$SZb as w}from"./trustedDomains.js";import{$$c as P}from"../../../../base/common/types.js";import{$mj as v}from"../../../../platform/instantiation/common/instantiation.js";var d=function(r,o,t,e){var i=arguments.length,s=i<3?o:e===null?e=Object.getOwnPropertyDescriptor(o,t):e,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,o,t,e);else for(var c=r.length-1;c>=0;c--)(n=r[c])&&(s=(i<3?n(s):i>3?n(o,t,s):n(o,t))||s);return i>3&&s&&Object.defineProperty(o,t,s),s},m=function(r,o){return function(t,e){o(t,e,r)}};const S="trustedDomains",C={type:b.File,ctime:Date.now(),mtime:Date.now(),size:0},l=`// Links matching one or more entries in the list below can be opened without link protection.
// The following examples show what entries can look like:
// - "https://microsoft.com": Matches this specific domain using https
// - "https://microsoft.com:8080": Matches this specific domain on this port using https
// - "https://microsoft.com:*": Matches this specific domain on any port using https
// - "https://microsoft.com/foo": Matches https://microsoft.com/foo and https://microsoft.com/foo/bar,
//   but not https://microsoft.com/foobar or https://microsoft.com/bar
// - "https://*.microsoft.com": Match all domains ending in "microsoft.com" using https
// - "microsoft.com": Match this specific domain using either http or https
// - "*.microsoft.com": Match all domains ending in "microsoft.com" using either http or https
// - "http://192.168.0.1: Matches this specific IP using http
// - "http://192.168.0.*: Matches all IP's with this prefix using http
// - "*": Match all domains using either http or https
//
`,p=`//
// You can use the "Manage Trusted Domains" command to open this file.
// Save this file to apply the trusted domains rules.
`,E=`[
	// "https://microsoft.com"
]`;function M(r,o,t){let e=l;return r.length>0?(e+=`// By default, VS Code trusts "localhost" as well as the following domains:
`,r.forEach(i=>{e+=`// - "${i}"
`})):e+=`// By default, VS Code trusts "localhost".
`,e+=p,e+=t?`
// Currently configuring trust for ${t}
`:"",o.length===0?e+=E:e+=JSON.stringify(o,null,2),e}let u=class{static{this.ID="workbench.contrib.trustedDomainsFileSystemProvider"}constructor(o,t,e){this.a=o,this.b=t,this.c=e,this.capabilities=2,this.onDidChangeCapabilities=h.None,this.onDidChangeFile=h.None,this.a.registerProvider(S,this)}stat(o){return Promise.resolve(C)}async readFile(o){let t=this.b.get(f,-1);const e=o.fragment,{defaultTrustedDomains:i,trustedDomains:s}=await this.c.invokeFunction(T);return(!t||t.indexOf(l)===-1||t.indexOf(p)===-1||t.indexOf(e??"")===-1||[...i,...s].some(c=>!P(t).includes(c)))&&(t=M(i,s,e)),a.fromString(t).buffer}writeFile(o,t,e){try{const i=a.wrap(t).toString(),s=g(i);this.b.store(f,i,-1,0),this.b.store(w,JSON.stringify(s)||"",-1,0)}catch{}return Promise.resolve()}watch(o,t){return{dispose(){}}}mkdir(o){return Promise.resolve(void 0)}readdir(o){return Promise.resolve(void 0)}delete(o,t){return Promise.resolve(void 0)}rename(o,t,e){return Promise.resolve(void 0)}};u=d([m(0,_),m(1,D),m(2,v)],u);export{u as $sqc};
