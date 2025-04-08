const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Action.C2oBzEuX.js","_astro/dev.Dy0jFPJ2.js","_astro/Editor.ChQqcOtQ.js","_astro/editor.main.DDIAdpjZ.js","_astro/editor.CtNXkihu.css","_astro/Editor.BXsEeXJ4.css"])))=>i.map(i=>d[i]);
import { c as createComponent, S as Suspense, t as template, i as insert, l as lazy } from './dev.Dy0jFPJ2.js';
let Editor_default, __vitePreload;
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
    var __defProp = Object.defineProperty;
    var __name = (target, value)=>__defProp(target, "name", {
            value,
            configurable: true
        });
    var _tmpl$ = template(`<div class=p-5>`), _tmpl$2 = template(`<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">`);
    const Action = lazy(()=>__vitePreload(()=>import('./Action.C2oBzEuX.js').then(async (m)=>{
                await m.__tla;
                return m;
            }), true ? __vite__mapDeps([0,1]) : void 0));
    const Editor = lazy(()=>__vitePreload(()=>import('./Editor.ChQqcOtQ.js'), true ? __vite__mapDeps([2,1,3,4,5]) : void 0));
    Editor_default = __name(()=>createComponent(Suspense, {
            get children () {
                var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild;
                insert(_el$7, createComponent(Suspense, {
                    get children () {
                        return createComponent(Action, {
                            get children () {
                                return [
                                    createComponent(Suspense, {
                                        get children () {
                                            var _el$8 = _tmpl$();
                                            insert(_el$8, createComponent(Editor, {
                                                Type: "HTML"
                                            }));
                                            return _el$8;
                                        }
                                    }),
                                    createComponent(Suspense, {
                                        get children () {
                                            var _el$9 = _tmpl$();
                                            insert(_el$9, createComponent(Editor, {
                                                Type: "CSS"
                                            }));
                                            return _el$9;
                                        }
                                    }),
                                    createComponent(Suspense, {
                                        get children () {
                                            var _el$10 = _tmpl$();
                                            insert(_el$10, createComponent(Editor, {
                                                Type: "TypeScript"
                                            }));
                                            return _el$10;
                                        }
                                    })
                                ];
                            }
                        });
                    }
                }));
                return _el$;
            }
        }), "default");
})();
export { Editor_default as E, __vitePreload as _, __tla };
