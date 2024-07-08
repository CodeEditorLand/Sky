import s from './Context.C5lr4NT9.js';
import p, { _Function as a } from './Context.pG7R-Yt5.js';
import e from './Context.oDUqRsZz.js';
import { createEffect, on } from './solid.f9AvF4Qv.js';
import './Editor.C9B_yFY6.js';

var c=({children:i})=>(createEffect(on(s.Messages[0],e=>e?.get("Data")?.get("Session")&&p.Data[1](e?.get("Data")?.get("Session")))),s.Socket[0]()?.send(JSON.stringify({Key:e.Items[0]()?.get("Key")?.[0](),Identifier:e.Items[0]()?.get("Identifier")?.[0](),From:"Data",View:"User"})),createComponent(a.Provider,{value:a.defaultValue},i));

export { c as default };
//# sourceMappingURL=Session.Bp4_UMpF.js.map
