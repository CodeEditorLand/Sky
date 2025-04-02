const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Editor.C5f0AHuK.js","_astro/preload-helper.BelkbqnE.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
let _Function;
let __tla = (async ()=>{
    _Function = (await __vitePreload(async ()=>{
        const { createContext } = await import('./Editor.C5f0AHuK.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.n);
        return {
            createContext
        };
    }, true ? __vite__mapDeps([0,1]) : void 0)).createContext();
    (await __vitePreload(async ()=>{
        const { useContext } = await import('./Editor.C5f0AHuK.js').then(async (m)=>{
            await m.__tla;
            return m;
        }).then((n)=>n.n);
        return {
            useContext
        };
    }, true ? __vite__mapDeps([0,1]) : void 0)).useContext(_Function);
})();
export { _Function, __tla };
