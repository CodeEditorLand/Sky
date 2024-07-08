import s from './Context_Bg1jn_nN.mjs';
import p, { _Function as a } from './Context_BBYSa61T.mjs';
import e from './Context_DWsv8h9X.mjs';
import { createEffect, on } from 'solid-js';

var c=({children:i})=>(createEffect(on(s.Messages[0],e=>e?.get("Data")?.get("Session")&&p.Data[1](e?.get("Data")?.get("Session")))),s.Socket[0]()?.send(JSON.stringify({Key:e.Items[0]()?.get("Key")?.[0](),Identifier:e.Items[0]()?.get("Identifier")?.[0](),From:"Data",View:"User"})),createComponent(a.Provider,{value:a.defaultValue},i));

export { c as default };
//# sourceMappingURL=Session_Cn6iSptl.mjs.map
