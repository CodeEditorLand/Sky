const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Action.CPPdn54x.js","_astro/dev.CB3_ATpt.js","_astro/Editor.BSZAgNaC.js","_astro/editor.main.CoRWhmHY.js","_astro/editor.Cwh6TVrJ.css","_astro/Editor.Bhs7m739.css"])))=>i.map(i=>d[i]);
import { t as template, c as createComponent, i as insert, S as Suspense, l as lazy } from './dev.CB3_ATpt.js';
let __vitePreload, w;
let __tla = (async ()=>{
    const scriptRel = 'modulepreload';
    const assetsURL = function(dep) {
        return "/" + dep;
    };
    const seen = {};
    __vitePreload = function preload(baseModule, deps, importerUrl) {
        let promise = Promise.resolve();
        if (true && deps && deps.length > 0) {
            document.getElementsByTagName("link");
            const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
            const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
            promise = Promise.allSettled(deps.map((dep)=>{
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
                }
                link.crossOrigin = "";
                link.href = dep;
                if (cspNonce) {
                    link.setAttribute("nonce", cspNonce);
                }
                document.head.appendChild(link);
                if (isCss) {
                    return new Promise((res, rej)=>{
                        link.addEventListener("load", res);
                        link.addEventListener("error", ()=>rej(new Error(`Unable to preload CSS for ${dep}`)));
                    });
                }
            }));
        }
        function handlePreloadError(err) {
            const e = new Event("vite:preloadError", {
                cancelable: true
            });
            e.payload = err;
            window.dispatchEvent(e);
            if (!e.defaultPrevented) {
                throw err;
            }
        }
        return promise.then((res)=>{
            for (const item of res || []){
                if (item.status !== "rejected") continue;
                handlePreloadError(item.reason);
            }
            return baseModule().catch(handlePreloadError);
        });
    };
    var i = template("<div class=p-5>"), _ = template('<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">');
    const $ = lazy(()=>__vitePreload(()=>import('./Action.CPPdn54x.js').then(async (m)=>{
                await m.__tla;
                return m;
            }), true ? __vite__mapDeps([0,1]) : void 0)), s = lazy(()=>__vitePreload(()=>import('./Editor.BSZAgNaC.js'), true ? __vite__mapDeps([2,1,3,4,5]) : void 0));
    w = ()=>createComponent(Suspense, {
            get children () {
                var o = _(), c = o.firstChild, d = c.firstChild, p = d.firstChild, f = p.firstChild, g = f.firstChild, m = g.firstChild;
                return insert(m, createComponent(Suspense, {
                    get children () {
                        return createComponent($, {
                            get children () {
                                return [
                                    createComponent(Suspense, {
                                        get children () {
                                            var e = i();
                                            return insert(e, createComponent(s, {
                                                Type: "HTML"
                                            })), e;
                                        }
                                    }),
                                    createComponent(Suspense, {
                                        get children () {
                                            var e = i();
                                            return insert(e, createComponent(s, {
                                                Type: "CSS"
                                            })), e;
                                        }
                                    }),
                                    createComponent(Suspense, {
                                        get children () {
                                            var e = i();
                                            return insert(e, createComponent(s, {
                                                Type: "TypeScript"
                                            })), e;
                                        }
                                    })
                                ];
                            }
                        });
                    }
                })), o;
            }
        });
})();
export { __vitePreload as _, w, __tla };
