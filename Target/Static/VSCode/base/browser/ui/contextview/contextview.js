import{$e8 as C}from"../../canIUse.js";import*as i from"../../dom.js";import{$Ed as p,$Dd as w,$Cd as b}from"../../../common/lifecycle.js";import*as B from"../../../common/platform.js";import{Range as S}from"../../../common/range.js";import"./contextview.css";var x;(function(s){s[s.ABSOLUTE=1]="ABSOLUTE",s[s.FIXED=2]="FIXED",s[s.FIXED_SHADOW=3]="FIXED_SHADOW"})(x||(x={}));function L(s){const t=s;return!!t&&typeof t.x=="number"&&typeof t.y=="number"}var H;(function(s){s[s.LEFT=0]="LEFT",s[s.RIGHT=1]="RIGHT"})(H||(H={}));var I;(function(s){s[s.BELOW=0]="BELOW",s[s.ABOVE=1]="ABOVE"})(I||(I={}));var $;(function(s){s[s.VERTICAL=0]="VERTICAL",s[s.HORIZONTAL=1]="HORIZONTAL"})($||($={}));var E;(function(s){s[s.Before=0]="Before",s[s.After=1]="After"})(E||(E={}));var r;(function(s){s[s.AVOID=0]="AVOID",s[s.ALIGN=1]="ALIGN"})(r||(r={}));function d(s,t,e){const a=e.mode===r.ALIGN?e.offset:e.offset+e.size,o=e.mode===r.ALIGN?e.offset+e.size:e.offset;return e.position===0?t<=s-a?a:t<=o?o-t:Math.max(s-t,0):t<=o?o-t:t<=s-a&&o<t/2?a:0}class g extends p{static{this.a=["click","keydown","focus","blur"]}static{this.b=["click"]}constructor(t,e){super(),this.c=null,this.g=!1,this.h=!1,this.j=null,this.m=p.None,this.n=p.None,this.q=null,this.r=null,this.f=i.$(".context-view"),i.$F9(this.f),this.setContainer(t,e),this.D(b(()=>this.setContainer(null,1)))}setContainer(t,e){this.g=e!==1;const a=this.h;if(this.h=e===3,!(t===this.c&&a===this.h)&&(this.c&&(this.n.dispose(),this.f.remove(),this.q&&(this.q=null,this.r?.remove(),this.r=null),this.c=null),t)){if(this.c=t,this.h){this.r=i.$(".shadow-root-host"),this.c.appendChild(this.r),this.q=this.r.attachShadow({mode:"open"});const h=document.createElement("style");h.textContent=j,this.q.appendChild(h),this.q.appendChild(this.f),this.q.appendChild(i.$("slot"))}else this.c.appendChild(this.f);const o=new w;g.a.forEach(h=>{o.add(i.$v8(this.c,h,l=>{this.u(l,!1)}))}),g.b.forEach(h=>{o.add(i.$v8(this.c,h,l=>{this.u(l,!0)},!0))}),this.n=o}}show(t){this.t()&&this.hide(),i.$t8(this.f),this.f.className="context-view monaco-component",this.f.style.top="0px",this.f.style.left="0px",this.f.style.zIndex=`${2575+(t.layer??0)}`,this.f.style.position=this.g?"fixed":"absolute",i.$E9(this.f),this.m=t.render(this.f)||p.None,this.j=t,this.s(),this.j.focus?.()}getViewElement(){return this.f}layout(){if(this.t()){if(this.j.canRelayout===!1&&!(B.$v&&C.pointerEvents)){this.hide();return}this.j?.layout?.(),this.s()}}s(){if(!this.t())return;const t=this.j.getAnchor();let e;if(i.$f9(t)){const n=i.$R8(t),f=i.$T8(t);e={top:n.top*f,left:n.left*f,width:n.width*f,height:n.height*f}}else L(t)?e={top:t.y,left:t.x,width:t.width||1,height:t.height||2}:e={top:t.posy,left:t.posx,width:2,height:2};const a=i.$U8(this.f),o=i.$Y8(this.f),h=this.j.anchorPosition??0,l=this.j.anchorAlignment??0,D=this.j.anchorAxisAlignment??0;let u,m;const c=i.$b9();if(D===0){const n={offset:e.top-c.pageYOffset,size:e.height,position:h===0?0:1},f={offset:e.left,size:e.width,position:l===0?0:1,mode:r.ALIGN};u=d(c.innerHeight,o,n)+c.pageYOffset,S.intersects({start:u,end:u+o},{start:n.offset,end:n.offset+n.size})&&(f.mode=r.AVOID),m=d(c.innerWidth,a,f)}else{const n={offset:e.left,size:e.width,position:l===0?0:1},f={offset:e.top,size:e.height,position:h===0?0:1,mode:r.ALIGN};m=d(c.innerWidth,a,n),S.intersects({start:m,end:m+a},{start:n.offset,end:n.offset+n.size})&&(f.mode=r.AVOID),u=d(c.innerHeight,o,f)+c.pageYOffset}this.f.classList.remove("top","bottom","left","right"),this.f.classList.add(h===0?"bottom":"top"),this.f.classList.add(l===0?"left":"right"),this.f.classList.toggle("fixed",this.g);const y=i.$R8(this.c),O=this.c.scrollTop||0,A=this.c.scrollLeft||0;this.f.style.top=`${u-(this.g?i.$R8(this.f).top:y.top)+O}px`,this.f.style.left=`${m-(this.g?i.$R8(this.f).left:y.left)+A}px`,this.f.style.width="initial"}hide(t){const e=this.j;this.j=null,e?.onHide&&e.onHide(t),this.m.dispose(),i.$F9(this.f)}t(){return!!this.j}u(t,e){this.j&&(this.j.onDOMEvent?this.j.onDOMEvent(t,i.getWindow(t).document.activeElement):e&&!i.$18(t.target,this.c)&&this.hide())}dispose(){this.hide(),super.dispose()}}const j=`
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Nanum Gothic", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
`;export{g as $A0,L as $y0,d as $z0,H as AnchorAlignment,$ as AnchorAxisAlignment,I as AnchorPosition,x as ContextViewDOMPosition,r as LayoutAnchorMode,E as LayoutAnchorPosition};
