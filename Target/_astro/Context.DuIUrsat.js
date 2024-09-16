import { _ as __vitePreload } from './preload-helper.BelkbqnE.js';
let t, o;
let __tla = (async ()=>{
    t = (await __vitePreload(async ()=>{
        const { createContext } = await import('./dev.CRM9jQJB.js').then((n)=>n.v);
        return {
            createContext
        };
    }, true ? [] : void 0)).createContext();
    o = (await __vitePreload(async ()=>{
        const { useContext } = await import('./dev.CRM9jQJB.js').then((n)=>n.v);
        return {
            useContext
        };
    }, true ? [] : void 0)).useContext(t);
})();
export { t as _Function, o as default, __tla };
