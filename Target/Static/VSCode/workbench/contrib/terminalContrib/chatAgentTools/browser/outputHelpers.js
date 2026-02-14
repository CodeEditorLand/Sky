import{$XCc as a}from"./runInTerminalHelpers.js";const l=16e3;function m(r,u){if(!r.xterm||!r.xterm.raw)return"";const o=r.xterm.raw.buffer.active,n=Math.max(u?.line??0,0),i=o.length,f=new Array(i-n);for(let e=n;e<i;e++){const c=o.getLine(e);f[e-n]=c?c.translateToString(!0):""}let t=f.join(`
`);return t.length>l&&(t=a(t,l)),t}export{m as $3Cc};
