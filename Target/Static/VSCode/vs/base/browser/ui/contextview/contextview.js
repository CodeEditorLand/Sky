import{BrowserFeatures as O}from"../../canIUse.js";import*as o from"../../dom.js";import{Disposable as m,DisposableStore as B,toDisposable as I}from"../../../common/lifecycle.js";import*as L from"../../../common/platform.js";import{Range as w}from"../../../common/range.js";import"./contextview.css";var y;(function(e){e[e.ABSOLUTE=1]="ABSOLUTE",e[e.FIXED=2]="FIXED",e[e.FIXED_SHADOW=3]="FIXED_SHADOW"})(y||(y={}));function N(e){const t=e;return!!t&&typeof t.x=="number"&&typeof t.y=="number"}var x;(function(e){e[e.LEFT=0]="LEFT",e[e.RIGHT=1]="RIGHT"})(x||(x={}));var D;(function(e){e[e.BELOW=0]="BELOW",e[e.ABOVE=1]="ABOVE"})(D||(D={}));var v;(function(e){e[e.VERTICAL=0]="VERTICAL",e[e.HORIZONTAL=1]="HORIZONTAL"})(v||(v={}));var E;(function(e){e[e.Before=0]="Before",e[e.After=1]="After"})(E||(E={}));var r;(function(e){e[e.AVOID=0]="AVOID",e[e.ALIGN=1]="ALIGN"})(r||(r={}));function p(e,t,s){const a=s.mode===r.ALIGN?s.offset:s.offset+s.size,n=s.mode===r.ALIGN?s.offset+s.size:s.offset;return s.position===0?t<=e-a?a:t<=n?n-t:Math.max(e-t,0):t<=n?n-t:t<=e-a?a:0}class g extends m{static{this.BUBBLE_UP_EVENTS=["click","keydown","focus","blur"]}static{this.BUBBLE_DOWN_EVENTS=["click"]}constructor(t,s){super(),this.container=null,this.useFixedPosition=!1,this.useShadowDOM=!1,this.delegate=null,this.toDisposeOnClean=m.None,this.toDisposeOnSetContainer=m.None,this.shadowRoot=null,this.shadowRootHostElement=null,this.view=o.$(".context-view"),o.hide(this.view),this.setContainer(t,s),this._register(I(()=>this.setContainer(null,1)))}setContainer(t,s){this.useFixedPosition=s!==1;const a=this.useShadowDOM;if(this.useShadowDOM=s===3,!(t===this.container&&a===this.useShadowDOM)&&(this.container&&(this.toDisposeOnSetContainer.dispose(),this.view.remove(),this.shadowRoot&&(this.shadowRoot=null,this.shadowRootHostElement?.remove(),this.shadowRootHostElement=null),this.container=null),t)){if(this.container=t,this.useShadowDOM){this.shadowRootHostElement=o.$(".shadow-root-host"),this.container.appendChild(this.shadowRootHostElement),this.shadowRoot=this.shadowRootHostElement.attachShadow({mode:"open"});const h=document.createElement("style");h.textContent=A,this.shadowRoot.appendChild(h),this.shadowRoot.appendChild(this.view),this.shadowRoot.appendChild(o.$("slot"))}else this.container.appendChild(this.view);const n=new B;g.BUBBLE_UP_EVENTS.forEach(h=>{n.add(o.addStandardDisposableListener(this.container,h,f=>{this.onDOMEvent(f,!1)}))}),g.BUBBLE_DOWN_EVENTS.forEach(h=>{n.add(o.addStandardDisposableListener(this.container,h,f=>{this.onDOMEvent(f,!0)},!0))}),this.toDisposeOnSetContainer=n}}show(t){this.isVisible()&&this.hide(),o.clearNode(this.view),this.view.className="context-view monaco-component",this.view.style.top="0px",this.view.style.left="0px",this.view.style.zIndex=`${2575+(t.layer??0)}`,this.view.style.position=this.useFixedPosition?"fixed":"absolute",o.show(this.view),this.toDisposeOnClean=t.render(this.view)||m.None,this.delegate=t,this.doLayout(),this.delegate.focus?.()}getViewElement(){return this.view}layout(){if(this.isVisible()){if(this.delegate.canRelayout===!1&&!(L.isIOS&&O.pointerEvents)){this.hide();return}this.delegate?.layout?.(),this.doLayout()}}doLayout(){if(!this.isVisible())return;const t=this.delegate.getAnchor();let s;if(o.isHTMLElement(t)){const i=o.getDomNodePagePosition(t),l=o.getDomNodeZoomLevel(t);s={top:i.top*l,left:i.left*l,width:i.width*l,height:i.height*l}}else N(t)?s={top:t.y,left:t.x,width:t.width||1,height:t.height||2}:s={top:t.posy,left:t.posx,width:2,height:2};const a=o.getTotalWidth(this.view),n=o.getTotalHeight(this.view),h=this.delegate.anchorPosition??0,f=this.delegate.anchorAlignment??0,H=this.delegate.anchorAxisAlignment??0;let c,u;const d=o.getActiveWindow();if(H===0){const i={offset:s.top-d.pageYOffset,size:s.height,position:h===0?0:1},l={offset:s.left,size:s.width,position:f===0?0:1,mode:r.ALIGN};c=p(d.innerHeight,n,i)+d.pageYOffset,w.intersects({start:c,end:c+n},{start:i.offset,end:i.offset+i.size})&&(l.mode=r.AVOID),u=p(d.innerWidth,a,l)}else{const i={offset:s.left,size:s.width,position:f===0?0:1},l={offset:s.top,size:s.height,position:h===0?0:1,mode:r.ALIGN};u=p(d.innerWidth,a,i),w.intersects({start:u,end:u+a},{start:i.offset,end:i.offset+i.size})&&(l.mode=r.AVOID),c=p(d.innerHeight,n,l)+d.pageYOffset}this.view.classList.remove("top","bottom","left","right"),this.view.classList.add(h===0?"bottom":"top"),this.view.classList.add(f===0?"left":"right"),this.view.classList.toggle("fixed",this.useFixedPosition);const S=o.getDomNodePagePosition(this.container);this.view.style.top=`${c-(this.useFixedPosition?o.getDomNodePagePosition(this.view).top:S.top)}px`,this.view.style.left=`${u-(this.useFixedPosition?o.getDomNodePagePosition(this.view).left:S.left)}px`,this.view.style.width="initial"}hide(t){const s=this.delegate;this.delegate=null,s?.onHide&&s.onHide(t),this.toDisposeOnClean.dispose(),o.hide(this.view)}isVisible(){return!!this.delegate}onDOMEvent(t,s){this.delegate&&(this.delegate.onDOMEvent?this.delegate.onDOMEvent(t,o.getWindow(t).document.activeElement):s&&!o.isAncestor(t.target,this.container)&&this.hide())}dispose(){this.hide(),super.dispose()}}const A=`
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
`;export{x as AnchorAlignment,v as AnchorAxisAlignment,D as AnchorPosition,g as ContextView,y as ContextViewDOMPosition,r as LayoutAnchorMode,E as LayoutAnchorPosition,N as isAnchor,p as layout};
