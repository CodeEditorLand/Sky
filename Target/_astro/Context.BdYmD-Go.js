import { _ as __vitePreload, __tla as __tla_0 } from './Editor.B-7PokKC.js';
import './dev.Dy0jFPJ2.js';
let _Function;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
    _Function = (await __vitePreload(async ()=>{
        const { createContext } = await import('./dev.Dy0jFPJ2.js').then((n)=>n.x);
        return {
            createContext
        };
    }, true ? [] : void 0)).createContext();
    (await __vitePreload(async ()=>{
        const { useContext } = await import('./dev.Dy0jFPJ2.js').then((n)=>n.x);
        return {
            useContext
        };
    }, true ? [] : void 0)).useContext(_Function);
});
export { _Function, __tla };
