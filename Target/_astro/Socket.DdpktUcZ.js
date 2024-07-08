import { p } from './Context.BOjt3nO8.js';
import { createSignal, onCleanup } from './solid.f9AvF4Qv.js';

// src/index.ts
var makeWS = (url, protocols, sendQueue = []) => {
  const ws = new WebSocket(url, protocols);
  const _send = ws.send.bind(ws);
  ws.send = (msg) => ws.readyState == 1 ? _send(msg) : sendQueue.push(msg);
  ws.addEventListener("open", () => {
    while (sendQueue.length)
      _send(sendQueue.shift());
  });
  return ws;
};
var createWSState = (ws) => {
  const [state, setState] = createSignal(ws.readyState);
  const _close = ws.close.bind(ws);
  ws.addEventListener("open", () => setState(1));
  ws.close = (...args) => {
    _close(...args);
    setState(2);
  };
  ws.addEventListener("close", () => setState(3));
  return state;
};
var makeReconnectingWS = (url, protocols, options = {}) => {
  let retries = options.retries || Infinity;
  let ws;
  const queue = [];
  let events = [
    [
      "close",
      () => {
        retries-- > 0 && setTimeout(getWS, options.delay || 3e3);
      }
    ]
  ];
  const getWS = () => {
    if (ws && ws.readyState < 2)
      ws.close();
    ws = Object.assign(makeWS(url, protocols, queue), {
      reconnect: getWS
    });
    events.forEach((args) => ws.addEventListener(...args));
  };
  getWS();
  const wws = {
    close: (...args) => {
      retries = 0;
      return ws.close(...args);
    },
    addEventListener: (...args) => {
      events.push(args);
      return ws.addEventListener(...args);
    },
    removeEventListener: (...args) => {
      events = events.filter((ev) => args[0] !== ev[0] || args[1] !== ev[1]);
      return ws.removeEventListener(...args);
    },
    send: (msg) => {
      wws.send.before?.();
      return ws.send(msg);
    }
  };
  for (const name in ws)
    wws[name] == null && Object.defineProperty(wws, name, {
      enumerable: true,
      get: () => typeof ws[name] === "function" ? ws[name].bind(ws) : ws[name]
    });
  return wws;
};
var createReconnectingWS = (url, protocols, options) => {
  const ws = makeReconnectingWS(url, protocols, options);
  onCleanup(() => ws.close());
  return ws;
};
var makeHeartbeatWS = (ws, options = {}) => {
  let pingtimer;
  let pongtimer;
  const clearTimers = () => (clearTimeout(pingtimer), clearTimeout(pongtimer));
  ws.send.before = () => {
    clearTimers();
    pongtimer = setTimeout(ws.reconnect, options.wait || 1500);
  };
  const receiveMessage = () => {
    clearTimers();
    pingtimer = setTimeout(() => ws.send(options.message || "ping"), options.interval || 1e3);
  };
  ws.addEventListener("close", clearTimers);
  ws.addEventListener("message", receiveMessage);
  ws.addEventListener("open", () => setTimeout(receiveMessage, options.interval || 1e3));
  return ws;
};

var m=createSignal(makeHeartbeatWS(createReconnectingWS(p.Data[0]().Socket,void 0,{delay:0,retries:5}),{interval:5e4,message:"beat"}));

const Socket = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: m
}, Symbol.toStringTag, { value: 'Module' }));

export { Socket as S, createWSState as c, m };
//# sourceMappingURL=Socket.DdpktUcZ.js.map
