function c(n,r){let e=0,t=0;const l=n.length;for(;t<l;){const o=n.charCodeAt(t);if(o===32)e++;else if(o===9)e=e-e%r+r;else break;t++}return t===l?-1:e}export{c as $DJ};
