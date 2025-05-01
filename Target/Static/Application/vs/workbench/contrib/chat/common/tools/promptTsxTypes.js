function r(t){const i=[];return e(t.node,i),i.join("")}function e(t,i){if(t.type===2)t.lineBreakBefore&&i.push(`
`),typeof t.text=="string"&&i.push(t.text);else if(t.ctor===3)i.push("<image>");else if(t.ctor===1||t.ctor===2)for(const f of t.children)e(f,i)}export{r as stringifyPromptElementJSON};
