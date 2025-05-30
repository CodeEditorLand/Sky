import{$b5 as D}from"../../browser.js";import{EventType as U,$f7 as T}from"../../touch.js";import{$ as b,$G5 as h,$J6 as f,$F5 as V,$Y5 as O,$E6 as d,$C6 as u,$h6 as $,getWindow as C,$_5 as g,$f6 as W}from"../../dom.js";import{$w5 as z}from"../../domStylesheets.js";import{$t5 as p}from"../../keyboardEvent.js";import{$o5 as q}from"../../mouseEvent.js";import{$G7 as K}from"../actionbar/actionbar.js";import{$K8 as Q,$J8 as j}from"../actionbar/actionViewItems.js";import{$J7 as P}from"../contextview/contextview.js";import{$v7 as J}from"../scrollbar/scrollableElement.js";import{$dm as X,$bm as w,$cm as H}from"../../../common/actions.js";import{$Wh as R}from"../../../common/async.js";import{$Nj as k}from"../../../common/codicons.js";import{$Jj as G}from"../../../common/codiconsUtil.js";import{ThemeIcon as F}from"../../../common/themables.js";import{$Rj as Z}from"../../../common/iconLabels.js";import{$td as ee}from"../../../common/lifecycle.js";import{$n as N,$m as te}from"../../../common/platform.js";import*as B from"../../../common/strings.js";const I=/\(&([^\s&])\)|(^|[^&])&([^\s&])/,A=/(&amp;)?(&amp;)([^\s&])/g;var y;(function(c){c[c.Right=0]="Right",c[c.Left=1]="Left"})(y||(y={}));var L;(function(c){c[c.Above=0]="Above",c[c.Below=1]="Below"})(L||(L={}));const ke={shadowColor:void 0,borderColor:void 0,foregroundColor:void 0,backgroundColor:void 0,selectionForegroundColor:void 0,selectionBackgroundColor:void 0,selectionBorderColor:void 0,separatorColor:void 0,scrollbarShadow:void 0,scrollbarSliderBackground:void 0,scrollbarSliderHoverBackground:void 0,scrollbarSliderActiveBackground:void 0};class x extends K{constructor(e,t,i,s){e.classList.add("monaco-menu-container"),e.setAttribute("role","presentation");const o=document.createElement("div");o.classList.add("monaco-menu"),o.setAttribute("role","presentation"),super(o,{orientation:1,actionViewItemProvider:a=>this.fb(a,i,r),context:i.context,actionRunner:i.actionRunner,ariaLabel:i.ariaLabel,ariaRole:"menu",focusOnlyEnabledItems:!0,triggerKeys:{keys:[3,...te||N?[10]:[]],keyDown:!0}}),this.Z=s,this.X=o,this.C.tabIndex=0,this.ab(e,s),this.B(T.addTarget(o)),this.B(h(o,u.KEY_DOWN,a=>{new p(a).equals(2)&&a.preventDefault()})),i.enableMnemonics&&this.B(h(o,u.KEY_DOWN,a=>{const n=a.key.toLocaleLowerCase();if(this.U.has(n)){d.stop(a,!0);const l=this.U.get(n);if(l.length===1&&(l[0]instanceof E&&l[0].container&&this.cb(l[0].container),l[0].onClick(a)),l.length>1){const v=l.shift();v&&v.container&&(this.cb(v.container),l.push(v)),this.U.set(n,l)}}})),N&&this.B(h(o,u.KEY_DOWN,a=>{const n=new p(a);n.equals(14)||n.equals(11)?(this.u=this.viewItems.length-1,this.P(),d.stop(a,!0)):(n.equals(13)||n.equals(12))&&(this.u=0,this.Q(),d.stop(a,!0))})),this.B(h(this.domNode,u.MOUSE_OUT,a=>{const n=a.relatedTarget;g(n,this.domNode)||(this.u=void 0,this.R(),a.stopPropagation())})),this.B(h(this.C,u.MOUSE_OVER,a=>{let n=a.target;if(!(!n||!g(n,this.C)||n===this.C)){for(;n.parentElement!==this.C&&n.parentElement!==null;)n=n.parentElement;if(n.classList.contains("action-item")){const l=this.u;this.db(n),l!==this.u&&this.R()}}})),this.B(T.addTarget(this.C)),this.B(h(this.C,U.Tap,a=>{let n=a.initialTarget;if(!(!n||!g(n,this.C)||n===this.C)){for(;n.parentElement!==this.C&&n.parentElement!==null;)n=n.parentElement;if(n.classList.contains("action-item")){const l=this.u;this.db(n),l!==this.u&&this.R()}}}));const r={parent:this};this.U=new Map,this.W=this.B(new J(o,{alwaysConsumeMouseWheel:!0,horizontal:2,vertical:3,verticalScrollbarSize:7,handleMouseWheel:!0,useShadows:!0}));const m=this.W.getDomNode();m.style.position="",this.bb(m,s),this.B(h(o,U.Change,a=>{d.stop(a,!0);const n=this.W.getScrollPosition().scrollTop;this.W.setScrollPosition({scrollTop:n-a.translationY})})),this.B(h(m,u.MOUSE_UP,a=>{a.preventDefault()}));const S=C(e);o.style.maxHeight=`${Math.max(10,S.innerHeight-e.getBoundingClientRect().top-35)}px`,t=t.filter((a,n)=>!(i.submenuIds?.has(a.id)||a instanceof w&&(n===t.length-1||n===0||t[n-1]instanceof w))),this.push(t,{icon:!0,label:!0,isMenu:!0}),e.appendChild(this.W.getDomNode()),this.W.scanDomNode(),this.viewItems.filter(a=>!(a instanceof Y)).forEach((a,n,l)=>{a.updatePositionInSet(n+1,l.length)})}ab(e,t){this.Y||(W(e)?this.Y=z(e):(x.globalStyleSheet||(x.globalStyleSheet=z()),this.Y=x.globalStyleSheet)),this.Y.textContent=oe(t,W(e))}bb(e,t){const i=t.foregroundColor??"",s=t.backgroundColor??"",o=t.borderColor?`1px solid ${t.borderColor}`:"",r="5px",m=t.shadowColor?`0 2px 8px ${t.shadowColor}`:"";e.style.outline=o,e.style.borderRadius=r,e.style.color=i,e.style.backgroundColor=s,e.style.boxShadow=m}getContainer(){return this.W.getDomNode()}get onScroll(){return this.W.onScroll}get scrollOffset(){return this.X.scrollTop}trigger(e){if(e<=this.viewItems.length&&e>=0){const t=this.viewItems[e];if(t instanceof E)super.focus(e),t.open(!0);else if(t instanceof M)super.run(t._action,t._context);else return}}cb(e){const t=this.u;this.db(e),t!==this.u&&this.R()}db(e){for(let t=0;t<this.C.children.length;t++){const i=this.C.children[t];if(e===i){this.u=t;break}}}R(e){super.R(e,!0,!0),typeof this.u<"u"&&this.W.setScrollPosition({scrollTop:Math.round(this.X.scrollTop)})}fb(e,t,i){if(e instanceof w)return new Y(t.context,e,{icon:!0},this.Z);if(e instanceof H){const s=new E(e,e.actions,i,{...t,submenuIds:new Set([...t.submenuIds||[],e.id])},this.Z);if(t.enableMnemonics){const o=s.getMnemonic();if(o&&s.isEnabled()){let r=[];this.U.has(o)&&(r=this.U.get(o)),r.push(s),this.U.set(o,r)}}return s}else{const s={enableMnemonics:t.enableMnemonics,useEventAsContext:t.useEventAsContext};if(t.getKeyBinding){const r=t.getKeyBinding(e);if(r){const m=r.getLabel();m&&(s.keybinding=m)}}const o=new M(t.context,e,s,this.Z);if(t.enableMnemonics){const r=o.getMnemonic();if(r&&o.isEnabled()){let m=[];this.U.has(r)&&(m=this.U.get(r)),m.push(o),this.U.set(r,m)}}return o}}}class M extends j{constructor(e,t,i,s){if(i.isMenu=!0,super(t,t,i),this.w=s,this.t=i,this.t.icon=i.icon!==void 0?i.icon:!1,this.t.label=i.label!==void 0?i.label:!0,this.s="",this.t.label&&i.enableMnemonics){const o=this.action.label;if(o){const r=I.exec(o);r&&(this.r=(r[1]?r[1]:r[3]).toLocaleLowerCase())}}this.h=new R(()=>{this.element&&(this.B(h(this.element,u.MOUSE_UP,o=>{if(d.stop(o,!0),D){if(new q(C(this.element),o).rightButton)return;this.onClick(o)}else setTimeout(()=>{this.onClick(o)},0)})),this.B(h(this.element,u.CONTEXT_MENU,o=>{d.stop(o,!0)})))},100),this.B(this.h)}render(e){super.render(e),this.element&&(this.container=e,this.g=f(this.element,b("a.action-menu-item")),this._action.id===w.ID?this.g.setAttribute("role","presentation"):(this.g.setAttribute("role","menuitem"),this.r&&this.g.setAttribute("aria-keyshortcuts",`${this.r}`)),this.n=f(this.g,b("span.menu-item-check"+F.asCSSSelector(k.menuSelection))),this.n.setAttribute("role","none"),this.m=f(this.g,b("span.action-label")),this.t.label&&this.t.keybinding&&(f(this.g,b("span.keybinding")).textContent=this.t.keybinding),this.h.schedule(),this.I(),this.C(),this.G(),this.z(),this.J(),this.P())}blur(){super.blur(),this.P()}focus(){super.focus(),this.g?.focus(),this.P()}updatePositionInSet(e,t){this.g&&(this.g.setAttribute("aria-posinset",`${e}`),this.g.setAttribute("aria-setsize",`${t}`))}C(){if(this.m&&this.t.label){V(this.m);let e=Z(this.action.label);if(e){const t=ie(e);this.t.enableMnemonics||(e=t),this.m.setAttribute("aria-label",t.replace(/&&/g,"&"));const i=I.exec(e);if(i){e=B.$Bf(e),A.lastIndex=0;let s=A.exec(e);for(;s&&s[1];)s=A.exec(e);const o=r=>r.replace(/&amp;&amp;/g,"&amp;");s?this.m.append(B.$Hf(o(e.substr(0,s.index))," "),b("u",{"aria-hidden":"true"},s[3]),B.$If(o(e.substr(s.index+s[0].length))," ")):this.m.innerText=o(e).trim(),this.g?.setAttribute("aria-keyshortcuts",(i[1]?i[1]:i[3]).toLocaleLowerCase())}else this.m.innerText=e.replace(/&&/g,"&").trim()}}}G(){}I(){this.s&&this.g&&this.g.classList.remove(...this.s.split(" ")),this.t.icon&&this.m?(this.s=this.action.class||"",this.m.classList.add("icon"),this.s&&this.m.classList.add(...this.s.split(" ")),this.z()):this.m&&this.m.classList.remove("icon")}z(){this.action.enabled?(this.element&&(this.element.classList.remove("disabled"),this.element.removeAttribute("aria-disabled")),this.g&&(this.g.classList.remove("disabled"),this.g.removeAttribute("aria-disabled"),this.g.tabIndex=0)):(this.element&&(this.element.classList.add("disabled"),this.element.setAttribute("aria-disabled","true")),this.g&&(this.g.classList.add("disabled"),this.g.setAttribute("aria-disabled","true")))}J(){if(!this.g)return;const e=this.action.checked;this.g.classList.toggle("checked",!!e),e!==void 0?(this.g.setAttribute("role","menuitemcheckbox"),this.g.setAttribute("aria-checked",e?"true":"false")):(this.g.setAttribute("role","menuitem"),this.g.setAttribute("aria-checked",""))}getMnemonic(){return this.r}P(){const e=this.element&&this.element.classList.contains("focused"),t=e&&this.w.selectionForegroundColor?this.w.selectionForegroundColor:this.w.foregroundColor,i=e&&this.w.selectionBackgroundColor?this.w.selectionBackgroundColor:void 0,s=e&&this.w.selectionBorderColor?`1px solid ${this.w.selectionBorderColor}`:"",o=e&&this.w.selectionBorderColor?"-1px":"";this.g&&(this.g.style.color=t??"",this.g.style.backgroundColor=i??"",this.g.style.outline=s,this.g.style.outlineOffset=o),this.n&&(this.n.style.color=t??"")}}class E extends M{constructor(e,t,i,s,o){super(e,e,s,o),this.ab=t,this.bb=i,this.cb=s,this.Q=null,this.U=this.B(new ee),this.W=!1,this.Z=s&&s.expandDirection!==void 0?s.expandDirection:{horizontal:y.Right,vertical:L.Below},this.X=new R(()=>{this.W&&(this.eb(!1),this.gb(!1))},250),this.Y=new R(()=>{this.element&&!g($(),this.element)&&this.bb.submenu===this.Q&&(this.bb.parent.focus(!1),this.eb(!0))},750)}render(e){super.render(e),this.element&&(this.g&&(this.g.classList.add("monaco-submenu-item"),this.g.tabIndex=0,this.g.setAttribute("aria-haspopup","true"),this.hb("false"),this.S=f(this.g,b("span.submenu-indicator"+F.asCSSSelector(k.menuSubmenu))),this.S.setAttribute("aria-hidden","true")),this.B(h(this.element,u.KEY_UP,t=>{const i=new p(t);(i.equals(17)||i.equals(3))&&(d.stop(t,!0),this.gb(!0))})),this.B(h(this.element,u.KEY_DOWN,t=>{const i=new p(t);$()===this.g&&(i.equals(17)||i.equals(3))&&d.stop(t,!0)})),this.B(h(this.element,u.MOUSE_OVER,t=>{this.W||(this.W=!0,this.X.schedule())})),this.B(h(this.element,u.MOUSE_LEAVE,t=>{this.W=!1})),this.B(h(this.element,u.FOCUS_OUT,t=>{this.element&&!g($(),this.element)&&this.Y.schedule()})),this.B(this.bb.parent.onScroll(()=>{this.bb.submenu===this.Q&&(this.bb.parent.focus(!1),this.eb(!0))})))}z(){}open(e){this.eb(!1),this.gb(e)}onClick(e){d.stop(e,!0),this.eb(!1),this.gb(!0)}eb(e){if(this.bb.submenu&&(e||this.bb.submenu!==this.Q)){try{this.bb.submenu.dispose()}catch{}this.bb.submenu=void 0,this.hb("false"),this.R&&(this.U.clear(),this.R=void 0)}}fb(e,t,i,s){const o={top:0,left:0};return o.left=P(e.width,t.width,{position:s.horizontal===y.Right?0:1,offset:i.left,size:i.width}),o.left>=i.left&&o.left<i.left+i.width&&(i.left+10+t.width<=e.width&&(o.left=i.left+10),i.top+=10,i.height=0),o.top=P(e.height,t.height,{position:0,offset:i.top,size:0}),o.top+t.height===i.top&&o.top+i.height+t.height<=e.height&&(o.top+=i.height),o}gb(e=!0){if(this.element)if(this.bb.submenu)this.bb.submenu.focus(!1);else{this.hb("true"),this.R=f(this.element,b("div.monaco-submenu")),this.R.classList.add("menubar-menu-items-holder","context-view");const t=C(this.bb.parent.domNode).getComputedStyle(this.bb.parent.domNode),i=parseFloat(t.paddingTop||"0")||0;this.R.style.position="fixed",this.R.style.top="0",this.R.style.left="0",this.bb.submenu=new x(this.R,this.ab.length?this.ab:[new X],this.cb,this.w);const s=this.element.getBoundingClientRect(),o={top:s.top-i,left:s.left,height:s.height+2*i,width:s.width},r=this.R.getBoundingClientRect(),m=C(this.element),{top:S,left:a}=this.fb(new O(m.innerWidth,m.innerHeight),O.lift(r),o,this.Z);this.R.style.left=`${a-r.left}px`,this.R.style.top=`${S-r.top}px`,this.U.add(h(this.R,u.KEY_UP,n=>{new p(n).equals(15)&&(d.stop(n,!0),this.bb.parent.focus(),this.eb(!0))})),this.U.add(h(this.R,u.KEY_DOWN,n=>{new p(n).equals(15)&&d.stop(n,!0)})),this.U.add(this.bb.submenu.onDidCancel(()=>{this.bb.parent.focus(),this.eb(!0)})),this.bb.submenu.focus(e),this.Q=this.bb.submenu}}hb(e){this.g&&this.g?.setAttribute("aria-expanded",e)}P(){super.P();const t=this.element&&this.element.classList.contains("focused")&&this.w.selectionForegroundColor?this.w.selectionForegroundColor:this.w.foregroundColor;this.S&&(this.S.style.color=t??"")}dispose(){super.dispose(),this.Y.dispose(),this.Q&&(this.Q.dispose(),this.Q=null),this.R&&(this.R=void 0)}}class Y extends Q{constructor(e,t,i,s){super(e,t,i),this.b=s}render(e){super.render(e),this.L&&(this.L.style.borderBottomColor=this.b.separatorColor?`${this.b.separatorColor}`:"")}}function ie(c){const e=I,t=e.exec(c);if(!t)return c;const i=!t[1];return c.replace(e,i?"$2$3":"").trim()}function _(c){const e=G()[c.id];return`.codicon-${c.id}:before { content: '\\${e.toString(16)}'; }`}function oe(c,e){let t=`
.monaco-menu {
	font-size: 13px;
	border-radius: 5px;
	min-width: 160px;
}

${_(k.menuSelection)}
${_(k.menuSubmenu)}

.monaco-menu .monaco-action-bar {
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
}

.monaco-menu .monaco-action-bar .actions-container {
	display: flex;
	margin: 0 auto;
	padding: 0;
	width: 100%;
	justify-content: flex-end;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: inline-block;
}

.monaco-menu .monaco-action-bar.reverse .actions-container {
	flex-direction: row-reverse;
}

.monaco-menu .monaco-action-bar .action-item {
	cursor: pointer;
	display: inline-block;
	transition: transform 50ms ease;
	position: relative;  /* DO NOT REMOVE - this is the key to preventing the ghosting icon bug in Chrome 42 */
}

.monaco-menu .monaco-action-bar .action-item.disabled {
	cursor: default;
}

.monaco-menu .monaco-action-bar .action-item .icon,
.monaco-menu .monaco-action-bar .action-item .codicon {
	display: inline-block;
}

.monaco-menu .monaco-action-bar .action-item .codicon {
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar .action-label {
	font-size: 11px;
	margin-right: 4px;
}

.monaco-menu .monaco-action-bar .action-item.disabled .action-label,
.monaco-menu .monaco-action-bar .action-item.disabled .action-label:hover {
	color: var(--vscode-disabledForeground);
}

/* Vertical actions */

.monaco-menu .monaco-action-bar.vertical {
	text-align: left;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	display: block;
	border-bottom: 1px solid var(--vscode-menu-separatorBackground);
	padding-top: 1px;
	padding: 30px;
}

.monaco-menu .secondary-actions .monaco-action-bar .action-label {
	margin-left: 6px;
}

/* Action Items */
.monaco-menu .monaco-action-bar .action-item.select-container {
	overflow: hidden; /* somehow the dropdown overflows its container, we prevent it here to not push */
	flex: 1;
	max-width: 170px;
	min-width: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.monaco-menu .monaco-action-bar.vertical {
	margin-left: 0;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	padding: 0;
	transform: none;
	display: flex;
}

.monaco-menu .monaco-action-bar.vertical .action-item.active {
	transform: none;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	flex: 1 1 auto;
	display: flex;
	height: 2em;
	align-items: center;
	position: relative;
	margin: 0 4px;
	border-radius: 4px;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item:hover .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-menu-item:focus .keybinding {
	opacity: unset;
}

.monaco-menu .monaco-action-bar.vertical .action-label {
	flex: 1 1 auto;
	text-decoration: none;
	padding: 0 1em;
	background: none;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .keybinding,
.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	display: inline-block;
	flex: 2 1 auto;
	padding: 0 1em;
	text-align: right;
	font-size: 12px;
	line-height: 1;
	opacity: 0.7;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon {
	font-size: 16px !important;
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon::before {
	margin-left: auto;
	margin-right: -20px;
}

.monaco-menu .monaco-action-bar.vertical .action-item.disabled .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-item.disabled .submenu-indicator {
	opacity: 0.4;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator) {
	display: inline-block;
	box-sizing: border-box;
	margin: 0;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	position: static;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .action-item .monaco-submenu {
	position: absolute;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	width: 100%;
	height: 0px !important;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator.text {
	padding: 0.7em 1em 0.1em 1em;
	font-weight: bold;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label:hover {
	color: inherit;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	position: absolute;
	visibility: hidden;
	width: 1em;
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item.checked .menu-item-check {
	visibility: visible;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Context Menu */

.context-view.monaco-menu-container {
	outline: 0;
	border: none;
	animation: fadeIn 0.083s linear;
	-webkit-app-region: no-drag;
}

.context-view.monaco-menu-container :focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical:focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical :focus {
	outline: 0;
}

.hc-black .context-view.monaco-menu-container,
.hc-light .context-view.monaco-menu-container,
:host-context(.hc-black) .context-view.monaco-menu-container,
:host-context(.hc-light) .context-view.monaco-menu-container {
	box-shadow: none;
}

.hc-black .monaco-menu .monaco-action-bar.vertical .action-item.focused,
.hc-light .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-black) .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-light) .monaco-menu .monaco-action-bar.vertical .action-item.focused {
	background: none;
}

/* Vertical Action Bar Styles */

.monaco-menu .monaco-action-bar.vertical {
	padding: 4px 0;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	height: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator),
.monaco-menu .monaco-action-bar.vertical .keybinding {
	font-size: inherit;
	padding: 0 2em;
	max-height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	font-size: inherit;
	width: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	font-size: inherit;
	margin: 5px 0 !important;
	padding: 0;
	border-radius: 0;
}

.linux .monaco-menu .monaco-action-bar.vertical .action-label.separator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .action-label.separator {
	margin-left: 0;
	margin-right: 0;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	font-size: 60%;
	padding: 0 1.8em;
}

.linux .monaco-menu .monaco-action-bar.vertical .submenu-indicator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
	mask-size: 10px 10px;
	-webkit-mask-size: 10px 10px;
}

.monaco-menu .action-item {
	cursor: default;
}`;if(e){t+=`
			/* Arrows */
			.monaco-scrollable-element > .scrollbar > .scra {
				cursor: pointer;
				font-size: 11px !important;
			}

			.monaco-scrollable-element > .visible {
				opacity: 1;

				/* Background rule added for IE9 - to allow clicks on dom node */
				background:rgba(0,0,0,0);

				transition: opacity 100ms linear;
			}
			.monaco-scrollable-element > .invisible {
				opacity: 0;
				pointer-events: none;
			}
			.monaco-scrollable-element > .invisible.fade {
				transition: opacity 800ms linear;
			}

			/* Scrollable Content Inset Shadow */
			.monaco-scrollable-element > .shadow {
				position: absolute;
				display: none;
			}
			.monaco-scrollable-element > .shadow.top {
				display: block;
				top: 0;
				left: 3px;
				height: 3px;
				width: 100%;
			}
			.monaco-scrollable-element > .shadow.left {
				display: block;
				top: 3px;
				left: 0;
				height: 100%;
				width: 3px;
			}
			.monaco-scrollable-element > .shadow.top-left-corner {
				display: block;
				top: 0;
				left: 0;
				height: 3px;
				width: 3px;
			}
			/* Fix for https://github.com/microsoft/vscode/issues/103170 */
			.monaco-menu .action-item .monaco-submenu {
				z-index: 1;
			}
		`;const i=c.scrollbarShadow;i&&(t+=`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${i} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${i} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${i} 6px 6px 6px -6px inset;
				}
			`);const s=c.scrollbarSliderBackground;s&&(t+=`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${s};
				}
			`);const o=c.scrollbarSliderHoverBackground;o&&(t+=`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${o};
				}
			`);const r=c.scrollbarSliderActiveBackground;r&&(t+=`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${r};
				}
			`)}return t}export{_ as $08,I as $58,A as $68,ke as $78,x as $88,ie as $98,y as HorizontalDirection,L as VerticalDirection};
