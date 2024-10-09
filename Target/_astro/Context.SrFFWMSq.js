import { _ as __vitePreload, __tla as __tla_0 } from './Editor.DAnszMTL.js';
import './dev.CB3_ATpt.js';
let t, o;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
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
});
export { t as _Function, o as default, __tla };
