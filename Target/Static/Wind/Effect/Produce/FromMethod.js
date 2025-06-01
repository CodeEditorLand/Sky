import{Effect as r}from"../../effect";function y(t,n,a,o){return(...s)=>r.flatMap(t,e=>{const f=e[n];return r.tryPromise({try:()=>f.apply(e,s),catch:d=>a({...o,cause:d})})})}export{y as default};
