class o{constructor(t=5){this.timesPerSecond=t,this.a=0,this.b=1e3/t}runIfNotLimited(t){const s=Date.now();s-this.a>=this.b&&(this.a=s,t())}}export{o as $SE};
