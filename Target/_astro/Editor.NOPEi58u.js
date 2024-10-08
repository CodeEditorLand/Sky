const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Action.Cvhc9g_f.js","_astro/preload-helper.BelkbqnE.js","_astro/dev.CB3_ATpt.js","_astro/Editor.DJ1qvII-.js","_astro/editor.main.DRixcDvy.js","_astro/editor.Cwh6TVrJ.css","_astro/Editor.Bhs7m739.css"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
import { t as template, c as createComponent, i as insert, S as Suspense, l as lazy } from './dev.CB3_ATpt.js';
let w;
let __tla = (async ()=>{
    var i = template("<div class=p-5>"), _ = template('<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">');
    const $ = lazy(()=>__vitePreload(()=>import('./Action.Cvhc9g_f.js').then(async (m)=>{
                await m.__tla;
                return m;
            }), true ? __vite__mapDeps([0,1,2]) : void 0)), s = lazy(()=>__vitePreload(()=>import('./Editor.DJ1qvII-.js'), true ? __vite__mapDeps([3,2,4,1,5,6]) : void 0));
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
export { w as default, __tla };
