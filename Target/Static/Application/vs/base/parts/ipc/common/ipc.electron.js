class t{constructor(s,e){this.a=s,this.onMessage=e}send(s){try{this.a.send("vscode:message",s.buffer)}catch{}}disconnect(){this.a.send("vscode:disconnect",null)}}export{t as $5m};
