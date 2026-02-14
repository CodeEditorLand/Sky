class n{constructor(s,e){this.a=s,this.onMessage=e}send(s){try{this.a.send("vscode:message",s.buffer)}catch{}}disconnect(){this.a.send("vscode:disconnect",null)}}export{n as $An};
