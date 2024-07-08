const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Action.DA3lNBqS.js","_astro/solid.f9AvF4Qv.js","_astro/Connection.Clq6-iyQ.js","_astro/Editor.gL_Lz7uS.js","_astro/editor.main.Dxn49_N2.js","_astro/editor.C_BnueFE.css","_astro/web.CXTPjqvK.js","_astro/Editor.CvmYnbvy.css","_astro/Environment.yVILzxPU.js","_astro/Context.Se-khBZi.js","_astro/Session.D76ClEwZ.js","_astro/Context.BZLk1yC5.js","_astro/Context.-ndUiMgL.js","_astro/Context.BPxC-h9f.js","_astro/Store.1eYxSV3K.js"])))=>i.map(i=>d[i]);
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

const o=lazy(()=>__vitePreload(() => import('./Action.DA3lNBqS.js'),true?__vite__mapDeps([0,1]):void 0)),t=lazy(()=>__vitePreload(() => import('./Connection.Clq6-iyQ.js'),true?__vite__mapDeps([2,1]):void 0)),s=lazy(()=>__vitePreload(() => import('./Editor.gL_Lz7uS.js'),true?__vite__mapDeps([3,4,5,1,6,7]):void 0)),r=lazy(()=>__vitePreload(() => import('./Environment.yVILzxPU.js'),true?__vite__mapDeps([8,9,1]):void 0)),p=lazy(()=>__vitePreload(() => import('./Session.D76ClEwZ.js'),true?__vite__mapDeps([10,11,1,12,13]):void 0)),c=lazy(()=>__vitePreload(() => import('./Store.1eYxSV3K.js'),true?__vite__mapDeps([14,1]):void 0));var a=i=>h(Suspense,null,h(r,{Data:i},h(Suspense,null,h(c,{Data:new Map([["Identifier","Identifier"],["Key","Key"]])},h(Suspense,null,h(t,null,h(Suspense,null,h(p,null,h("div",{class:"flex flex-col"},h("main",{class:"flex grow justify-center"},h("div",{class:"flex grow self-center"},h("div",{class:"container"},h("div",{class:"grid min-h-screen content-start gap-7 py-9"},h("div",{class:"mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"},h("div",{class:"order-last lg:order-first"},h(Suspense,null,h(o,null,h(Suspense,null,h(s,{Type:"HTML"})),h(Suspense,null,h(s,{Type:"CSS"})),h(Suspense,null,h(s,{Type:"TypeScript"})))))))))))))))))));

export { __vitePreload as _, a };
//# sourceMappingURL=Editor.CrSNzv6p.js.map
