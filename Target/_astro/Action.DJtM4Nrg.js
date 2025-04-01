const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/editor.main.D3nO2WnT.js","_astro/preload-helper.BelkbqnE.js","_astro/editor.vvD9CArE.css","_astro/Context.DUhwN2Y1.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
import { c as createComponent, t as template, __tla as __tla_0 } from './Editor.Dq9OhtiX.js';
let r, o, m, p;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
    var s = template('<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">');
    self.MonacoEnvironment = {
        createTrustedTypesPolicy: ()=>{},
        getWorker: async (e, t)=>{
            switch(t){
                case "css":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./css.worker.Du8lNXHY.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default;
                case "html":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./html.worker.C59PPWQg.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default;
                case "typescript":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./ts.worker.-BBV8UgA.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default;
                default:
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./editor.worker.BXuze3zt.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default;
            }
        }
    };
    m = ({ children: e })=>createComponent(o.Provider, {
            get value () {
                return o.defaultValue;
            },
            get children () {
                return [
                    (()=>{
                        var t = s();
                        return t.addEventListener("load", (a)=>{
                            a.target.removeAttribute("onload"), a.target.removeAttribute("media");
                        }), t;
                    })(),
                    e
                ];
            }
        });
    ({ editor: r, languages: p } = await __vitePreload(()=>import('./editor.main.D3nO2WnT.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.a), true ? __vite__mapDeps([0,1,2]) : void 0));
    p.typescript.typescriptDefaults.setEagerModelSync(true), r.defineTheme("Light", (await __vitePreload(async ()=>{
        const { default: __vite_default__ } = await import('./Active4D.CgrYHGUD.js');
        return {
            default: __vite_default__
        };
    }, true ? [] : void 0)).default), r.defineTheme("Dark", (await __vitePreload(async ()=>{
        const { default: __vite_default__ } = await import('./Amoled.gh0wc86c.js');
        return {
            default: __vite_default__
        };
    }, true ? [] : void 0)).default), window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: e })=>r.setTheme(e ? "Dark" : "Light"));
    ({ _Function: o } = await __vitePreload(()=>import('./Context.DUhwN2Y1.js').then(async (m)=>{
            await m.__tla;
            return m;
        }), true ? __vite__mapDeps([3,1]) : void 0));
});
export { r as Monaco, o as _Function, m as default, p as languages, __tla };
