import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
let t, o;
let __tla = (async ()=>{
    t = (await __vitePreload(async ()=>{
        const { createContext } = await import('./dev.CB3_ATpt.js').then((n)=>n.x);
        return {
            createContext
        };
    }, true ? [] : void 0)).createContext();
    o = (await __vitePreload(async ()=>{
        const { useContext } = await import('./dev.CB3_ATpt.js').then((n)=>n.x);
        return {
            useContext
        };
    }, true ? [] : void 0)).useContext(t);
})();
export { t as _Function, o as default, __tla };
