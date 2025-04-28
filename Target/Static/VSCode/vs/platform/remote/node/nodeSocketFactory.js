import*as f from"net";import{NodeSocket as p}from"../../../base/parts/ipc/node/ipc.net.js";import{makeRawSocketHeaders as d}from"../common/managedSocket.js";const D=new class{supports(t){return!0}connect({host:t,port:a},s,c,r){return new Promise((i,e)=>{const o=f.createConnection({host:t,port:a},()=>{o.removeListener("error",e),o.write(d(s,c,r));const n=m=>{m.toString().indexOf(`\r
\r
`)>=0&&(o.off("data",n),i(new p(o,r)))};o.on("data",n)});o.setNoDelay(!0),o.once("error",e)})}};export{D as nodeSocketFactory};
