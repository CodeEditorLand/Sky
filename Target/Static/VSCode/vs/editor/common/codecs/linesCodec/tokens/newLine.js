import{VSBuffer as r}from"../../../../../base/common/buffer.js";import{SimpleToken as e}from"../../simpleCodec/tokens/simpleToken.js";class t extends e{static{this.symbol=`
`}static{this.byte=r.fromString(t.symbol)}get text(){return t.symbol}get byte(){return t.byte}toString(){return`newline${this.range}`}}export{t as NewLine};
