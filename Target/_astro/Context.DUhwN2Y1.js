const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Editor.Dq9OhtiX.js","_astro/preload-helper.BelkbqnE.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
let t, o;
let __tla = (async ()=>{
    t = (await __vitePreload(async ()=>{
        const { createContext } = await import('./Editor.Dq9OhtiX.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.n);
        return {
            createContext
        };
    }, true ? __vite__mapDeps([0,1]) : void 0)).createContext();
    o = (await __vitePreload(async ()=>{
        const { useContext } = await import('./Editor.Dq9OhtiX.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.n);
        return {
            useContext
        };
    }, true ? __vite__mapDeps([0,1]) : void 0)).useContext(t);
})();
export { t as _Function, o as default, __tla };
