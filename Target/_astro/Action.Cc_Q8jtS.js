const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/editor.main.D3nO2WnT.js","_astro/preload-helper.BelkbqnE.js","_astro/editor.vvD9CArE.css","_astro/Context.4Uu2myoy.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
import { c as createComponent, t as template, __tla as __tla_0 } from './Editor.C5f0AHuK.js';
let Monaco, _Function, Action_default, languages;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
    var __defProp = Object.defineProperty;
    var __name = (target, value)=>__defProp(target, "name", {
            value,
            configurable: true
        });
    var _tmpl$ = template(`<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">`);
    self.MonacoEnvironment = {
        createTrustedTypesPolicy: __name(()=>void 0, "createTrustedTypesPolicy"),
        getWorker: __name(async (_WorkerID, Label)=>{
            switch(Label){
                case "css":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./css.worker.Du8lNXHY.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default();
                case "html":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./html.worker.C59PPWQg.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default();
                case "typescript":
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./ts.worker.-BBV8UgA.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default();
                default:
                    return new (await __vitePreload(async ()=>{
                        const { default: __vite_default__ } = await import('./editor.worker.BXuze3zt.js');
                        return {
                            default: __vite_default__
                        };
                    }, true ? [] : void 0)).default();
            }
        }, "getWorker")
    };
    Action_default = __name(({ children })=>createComponent(_Function.Provider, {
            get value () {
                return _Function.defaultValue;
            },
            get children () {
                return [
                    (()=>{
                        var _el$ = _tmpl$();
                        _el$.addEventListener("load", (Event)=>{
                            Event.target.removeAttribute("onload");
                            Event.target.removeAttribute("media");
                        });
                        return _el$;
                    })(),
                    children
                ];
            }
        }), "default");
    ({ editor: Monaco, languages } = await __vitePreload(async ()=>{
        const { editor: Monaco, languages } = await import('./editor.main.D3nO2WnT.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.a);
        return {
            editor: Monaco,
            languages
        };
    }, true ? __vite__mapDeps([0,1,2]) : void 0));
    languages.typescript.typescriptDefaults.setEagerModelSync(true);
    Monaco.defineTheme("Light", (await __vitePreload(async ()=>{
        const { default: __vite_default__ } = await import('./Active4D.CgrYHGUD.js');
        return {
            default: __vite_default__
        };
    }, true ? [] : void 0)).default);
    Monaco.defineTheme("Dark", (await __vitePreload(async ()=>{
        const { default: __vite_default__ } = await import('./Amoled.gh0wc86c.js');
        return {
            default: __vite_default__
        };
    }, true ? [] : void 0)).default);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches })=>Monaco.setTheme(matches ? "Dark" : "Light"));
    ({ _Function } = await __vitePreload(async ()=>{
        const { _Function } = await import('./Context.4Uu2myoy.js').then(async (m)=>{
            await m.__tla;
            return m;
        });
        return {
            _Function
        };
    }, true ? __vite__mapDeps([3,1]) : void 0));
});
export { Monaco, _Function, Action_default as default, languages, __tla };
