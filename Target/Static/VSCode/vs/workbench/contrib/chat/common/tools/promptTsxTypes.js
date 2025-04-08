function o(e){const t=[];return r(e.node,t),t.join("")}function r(e,t){if(e.type===PromptNodeType.Text)e.lineBreakBefore&&t.push(`
`),typeof e.text=="string"&&t.push(e.text);else if(e.ctor===PieceCtorKind.ImageChatMessage)t.push("<image>");else if(e.ctor===PieceCtorKind.BaseChatMessage||e.ctor===PieceCtorKind.Other)for(const i of e.children)r(i,t)}export{o as stringifyPromptElementJSON};
