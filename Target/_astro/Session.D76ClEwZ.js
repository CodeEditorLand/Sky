import s from './Context.BZLk1yC5.js';
import p, { _Function as a } from './Context.-ndUiMgL.js';
import e from './Context.BPxC-h9f.js';
import { createEffect, on } from './solid.f9AvF4Qv.js';
import './Editor.CrSNzv6p.js';

var c=({children:i})=>(createEffect(on(s.Messages[0],e=>e?.get("Data")?.get("Session")&&p.Data[1](e?.get("Data")?.get("Session")))),s.Socket[0]()?.send(JSON.stringify({Key:e.Items[0]()?.get("Key")?.[0](),Identifier:e.Items[0]()?.get("Identifier")?.[0](),From:"Data",View:"User"})),h(a.Provider,{value:a.defaultValue},i));

export { c as default };
//# sourceMappingURL=Session.D76ClEwZ.js.map
