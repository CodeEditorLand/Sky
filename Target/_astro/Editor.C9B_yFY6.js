const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Action.DCNYtxZC.js","_astro/solid.f9AvF4Qv.js","_astro/Connection.DHSGEnvF.js","_astro/Editor.CKcvGz5q.js","_astro/editor.main.BxXZFlHO.js","_astro/editor.C_BnueFE.css","_astro/Editor.CdlKhxrg.css","_astro/Environment._xogJA9F.js","_astro/Context.BOjt3nO8.js","_astro/Session.Bp4_UMpF.js","_astro/Context.C5lr4NT9.js","_astro/Context.pG7R-Yt5.js","_astro/Context.oDUqRsZz.js","_astro/Store.BD89W0lb.js"])))=>i.map(i=>d[i]);
import { Suspense, lazy } from './solid.f9AvF4Qv.js';

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (true && deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = Promise.all(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
          link.crossOrigin = "";
        }
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  return promise.then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};

const o=lazy(()=>__vitePreload(() => import('./Action.DCNYtxZC.js'),true?__vite__mapDeps([0,1]):void 0)),t=lazy(()=>__vitePreload(() => import('./Connection.DHSGEnvF.js'),true?__vite__mapDeps([2,1]):void 0)),s=lazy(()=>__vitePreload(() => import('./Editor.CKcvGz5q.js'),true?__vite__mapDeps([3,4,5,1,6]):void 0)),r=lazy(()=>__vitePreload(() => import('./Environment._xogJA9F.js'),true?__vite__mapDeps([7,8,1]):void 0)),p=lazy(()=>__vitePreload(() => import('./Session.Bp4_UMpF.js'),true?__vite__mapDeps([9,10,1,11,12]):void 0)),c=lazy(()=>__vitePreload(() => import('./Store.BD89W0lb.js'),true?__vite__mapDeps([13,1]):void 0));var a=i=>createComponent(Suspense,null,createComponent(r,{Data:i},createComponent(Suspense,null,createComponent(c,{Data:new Map([["Identifier","Identifier"],["Key","Key"]])},createComponent(Suspense,null,createComponent(t,null,createComponent(Suspense,null,createComponent(p,null,createComponent("div",{class:"flex flex-col"},createComponent("main",{class:"flex grow justify-center"},createComponent("div",{class:"flex grow self-center"},createComponent("div",{class:"container"},createComponent("div",{class:"grid min-h-screen content-start gap-7 py-9"},createComponent("div",{class:"mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"},createComponent("div",{class:"order-last lg:order-first"},createComponent(Suspense,null,createComponent(o,null,createComponent(Suspense,null,createComponent(s,{Type:"HTML"})),createComponent(Suspense,null,createComponent(s,{Type:"CSS"})),createComponent(Suspense,null,createComponent(s,{Type:"TypeScript"})))))))))))))))))));

export { __vitePreload as _, a };
//# sourceMappingURL=Editor.C9B_yFY6.js.map
