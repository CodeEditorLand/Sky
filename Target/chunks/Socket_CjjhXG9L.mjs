import { p } from './Context_3od9L2Fg.mjs';
import { makeHeartbeatWS, createReconnectingWS } from '@solid-primitives/websocket';
import { createSignal } from 'solid-js';

var m=createSignal(makeHeartbeatWS(createReconnectingWS(p.Data[0]().Socket,void 0,{delay:0,retries:5}),{interval:5e4,message:"beat"}));

export { m as default };
//# sourceMappingURL=Socket_CjjhXG9L.mjs.map
