import{Event as m}from"../../../../base/common/event.js";import{parse as S}from"../../../../base/common/json.js";import{FileType as g,IFileService as v}from"../../../../platform/files/common/files.js";import{IStorageService as T}from"../../../../platform/storage/common/storage.js";import{VSBuffer as h}from"../../../../base/common/buffer.js";import{readTrustedDomains as _,TRUSTED_DOMAINS_CONTENT_STORAGE_KEY as f,TRUSTED_DOMAINS_STORAGE_KEY as D}from"./trustedDomains.js";import{assertIsDefined as E}from"../../../../base/common/types.js";import{IInstantiationService as O}from"../../../../platform/instantiation/common/instantiation.js";var d=function(r,e,t,o){var i=arguments.length,s=i<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(r,e,t,o);else for(var c=r.length-1;c>=0;c--)(n=r[c])&&(s=(i<3?n(s):i>3?n(e,t,s):n(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s},a=function(r,e){return function(t,o){e(t,o,r)}};const P="trustedDomains",b={type:g.File,ctime:Date.now(),mtime:Date.now(),size:0},u=`// Links matching one or more entries in the list below can be opened without link protection.
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
`,w=`[
	// "https://microsoft.com"
]`;function M(r,e,t){let o=u;return r.length>0?(o+=`// By default, VS Code trusts "localhost" as well as the following domains:
`,r.forEach(i=>{o+=`// - "${i}"
`})):o+=`// By default, VS Code trusts "localhost".
`,o+=p,o+=t?`
// Currently configuring trust for ${t}
`:"",e.length===0?o+=w:o+=JSON.stringify(e,null,2),o}let l=class{static{this.ID="workbench.contrib.trustedDomainsFileSystemProvider"}constructor(e,t,o){this.fileService=e,this.storageService=t,this.instantiationService=o,this.capabilities=2,this.onDidChangeCapabilities=m.None,this.onDidChangeFile=m.None,this.fileService.registerProvider(P,this)}stat(e){return Promise.resolve(b)}async readFile(e){let t=this.storageService.get(f,-1);const o=e.fragment,{defaultTrustedDomains:i,trustedDomains:s}=await this.instantiationService.invokeFunction(_);return(!t||t.indexOf(u)===-1||t.indexOf(p)===-1||t.indexOf(o??"")===-1||[...i,...s].some(c=>!E(t).includes(c)))&&(t=M(i,s,o)),h.fromString(t).buffer}writeFile(e,t,o){try{const i=h.wrap(t).toString(),s=S(i);this.storageService.store(f,i,-1,0),this.storageService.store(D,JSON.stringify(s)||"",-1,0)}catch{}return Promise.resolve()}watch(e,t){return{dispose(){}}}mkdir(e){return Promise.resolve(void 0)}readdir(e){return Promise.resolve(void 0)}delete(e,t){return Promise.resolve(void 0)}rename(e,t,o){return Promise.resolve(void 0)}};l=d([a(0,v),a(1,T),a(2,O)],l);export{l as TrustedDomainsFileSystemProvider};
