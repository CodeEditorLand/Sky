import{isFirefox as q}from"../../browser.js";import{EventType as O,Gesture as T}from"../../touch.js";import{$ as b,addDisposableListener as m,append as p,clearNode as K,Dimension as F,EventHelper as d,EventType as h,getActiveElement as k,getWindow as y,isAncestor as g,isInShadowDOM as N}from"../../dom.js";import{createStyleSheet as $}from"../../domStylesheets.js";import{StandardKeyboardEvent as f}from"../../keyboardEvent.js";import{StandardMouseEvent as W}from"../../mouseEvent.js";import{ActionBar as Y}from"../actionbar/actionbar.js";import{ActionViewItem as G,BaseActionViewItem as H}from"../actionbar/actionViewItems.js";import{layout as U}from"../contextview/contextview.js";import{DomScrollableElement as j}from"../scrollbar/scrollableElement.js";import{EmptySubmenuAction as X,Separator as S,SubmenuAction as J}from"../../../common/actions.js";import{RunOnceScheduler as D}from"../../../common/async.js";import{Codicon as w}from"../../../common/codicons.js";import{getCodiconFontCharacters as Q}from"../../../common/codiconsUtil.js";import{ThemeIcon as P}from"../../../common/themables.js";import{stripIcons as Z}from"../../../common/iconLabels.js";import{DisposableStore as ee}from"../../../common/lifecycle.js";import{isLinux as z,isMacintosh as te}from"../../../common/platform.js";import*as I from"../../../common/strings.js";const M=/\(&([^\s&])\)|(^|[^&])&([^\s&])/,A=/(&amp;)?(&amp;)([^\s&])/g;var C;(function(c){c[c.Right=0]="Right",c[c.Left=1]="Left"})(C||(C={}));var _;(function(c){c[c.Above=0]="Above",c[c.Below=1]="Below"})(_||(_={}));const we={shadowColor:void 0,borderColor:void 0,foregroundColor:void 0,backgroundColor:void 0,selectionForegroundColor:void 0,selectionBackgroundColor:void 0,selectionBorderColor:void 0,separatorColor:void 0,scrollbarShadow:void 0,scrollbarSliderBackground:void 0,scrollbarSliderHoverBackground:void 0,scrollbarSliderActiveBackground:void 0};class x extends Y{constructor(e,t,i,s){e.classList.add("monaco-menu-container"),e.setAttribute("role","presentation");const n=document.createElement("div");n.classList.add("monaco-menu"),n.setAttribute("role","presentation"),super(n,{orientation:1,actionViewItemProvider:a=>this.doGetActionViewItem(a,i,r),context:i.context,actionRunner:i.actionRunner,ariaLabel:i.ariaLabel,ariaRole:"menu",focusOnlyEnabledItems:!0,triggerKeys:{keys:[3,...te||z?[10]:[]],keyDown:!0}}),this.menuStyles=s,this.menuElement=n,this.actionsList.tabIndex=0,this.initializeOrUpdateStyleSheet(e,s),this._register(T.addTarget(n)),this._register(m(n,h.KEY_DOWN,a=>{new f(a).equals(2)&&a.preventDefault()})),i.enableMnemonics&&this._register(m(n,h.KEY_DOWN,a=>{const o=a.key.toLocaleLowerCase();if(this.mnemonics.has(o)){d.stop(a,!0);const l=this.mnemonics.get(o);if(l.length===1&&(l[0]instanceof L&&l[0].container&&this.focusItemByElement(l[0].container),l[0].onClick(a)),l.length>1){const v=l.shift();v&&v.container&&(this.focusItemByElement(v.container),l.push(v)),this.mnemonics.set(o,l)}}})),z&&this._register(m(n,h.KEY_DOWN,a=>{const o=new f(a);o.equals(14)||o.equals(11)?(this.focusedItem=this.viewItems.length-1,this.focusNext(),d.stop(a,!0)):(o.equals(13)||o.equals(12))&&(this.focusedItem=0,this.focusPrevious(),d.stop(a,!0))})),this._register(m(this.domNode,h.MOUSE_OUT,a=>{const o=a.relatedTarget;g(o,this.domNode)||(this.focusedItem=void 0,this.updateFocus(),a.stopPropagation())})),this._register(m(this.actionsList,h.MOUSE_OVER,a=>{let o=a.target;if(!(!o||!g(o,this.actionsList)||o===this.actionsList)){for(;o.parentElement!==this.actionsList&&o.parentElement!==null;)o=o.parentElement;if(o.classList.contains("action-item")){const l=this.focusedItem;this.setFocusedItem(o),l!==this.focusedItem&&this.updateFocus()}}})),this._register(T.addTarget(this.actionsList)),this._register(m(this.actionsList,O.Tap,a=>{let o=a.initialTarget;if(!(!o||!g(o,this.actionsList)||o===this.actionsList)){for(;o.parentElement!==this.actionsList&&o.parentElement!==null;)o=o.parentElement;if(o.classList.contains("action-item")){const l=this.focusedItem;this.setFocusedItem(o),l!==this.focusedItem&&this.updateFocus()}}}));const r={parent:this};this.mnemonics=new Map,this.scrollableElement=this._register(new j(n,{alwaysConsumeMouseWheel:!0,horizontal:2,vertical:3,verticalScrollbarSize:7,handleMouseWheel:!0,useShadows:!0}));const u=this.scrollableElement.getDomNode();u.style.position="",this.styleScrollElement(u,s),this._register(m(n,O.Change,a=>{d.stop(a,!0);const o=this.scrollableElement.getScrollPosition().scrollTop;this.scrollableElement.setScrollPosition({scrollTop:o-a.translationY})})),this._register(m(u,h.MOUSE_UP,a=>{a.preventDefault()}));const E=y(e);n.style.maxHeight=`${Math.max(10,E.innerHeight-e.getBoundingClientRect().top-35)}px`,t=t.filter((a,o)=>!(i.submenuIds?.has(a.id)||a instanceof S&&(o===t.length-1||o===0||t[o-1]instanceof S))),this.push(t,{icon:!0,label:!0,isMenu:!0}),e.appendChild(this.scrollableElement.getDomNode()),this.scrollableElement.scanDomNode(),this.viewItems.filter(a=>!(a instanceof R)).forEach((a,o,l)=>{a.updatePositionInSet(o+1,l.length)})}initializeOrUpdateStyleSheet(e,t){this.styleSheet||(N(e)?this.styleSheet=$(e):(x.globalStyleSheet||(x.globalStyleSheet=$()),this.styleSheet=x.globalStyleSheet)),this.styleSheet.textContent=ne(t,N(e))}styleScrollElement(e,t){const i=t.foregroundColor??"",s=t.backgroundColor??"",n=t.borderColor?`1px solid ${t.borderColor}`:"",r="5px",u=t.shadowColor?`0 2px 8px ${t.shadowColor}`:"";e.style.outline=n,e.style.borderRadius=r,e.style.color=i,e.style.backgroundColor=s,e.style.boxShadow=u}getContainer(){return this.scrollableElement.getDomNode()}get onScroll(){return this.scrollableElement.onScroll}get scrollOffset(){return this.menuElement.scrollTop}trigger(e){if(e<=this.viewItems.length&&e>=0){const t=this.viewItems[e];if(t instanceof L)super.focus(e),t.open(!0);else if(t instanceof B)super.run(t._action,t._context);else return}}focusItemByElement(e){const t=this.focusedItem;this.setFocusedItem(e),t!==this.focusedItem&&this.updateFocus()}setFocusedItem(e){for(let t=0;t<this.actionsList.children.length;t++){const i=this.actionsList.children[t];if(e===i){this.focusedItem=t;break}}}updateFocus(e){super.updateFocus(e,!0,!0),typeof this.focusedItem<"u"&&this.scrollableElement.setScrollPosition({scrollTop:Math.round(this.menuElement.scrollTop)})}doGetActionViewItem(e,t,i){if(e instanceof S)return new R(t.context,e,{icon:!0},this.menuStyles);if(e instanceof J){const s=new L(e,e.actions,i,{...t,submenuIds:new Set([...t.submenuIds||[],e.id])},this.menuStyles);if(t.enableMnemonics){const n=s.getMnemonic();if(n&&s.isEnabled()){let r=[];this.mnemonics.has(n)&&(r=this.mnemonics.get(n)),r.push(s),this.mnemonics.set(n,r)}}return s}else{const s={enableMnemonics:t.enableMnemonics,useEventAsContext:t.useEventAsContext};if(t.getKeyBinding){const r=t.getKeyBinding(e);if(r){const u=r.getLabel();u&&(s.keybinding=u)}}const n=new B(t.context,e,s,this.menuStyles);if(t.enableMnemonics){const r=n.getMnemonic();if(r&&n.isEnabled()){let u=[];this.mnemonics.has(r)&&(u=this.mnemonics.get(r)),u.push(n),this.mnemonics.set(r,u)}}return n}}}class B extends H{constructor(e,t,i,s){if(i.isMenu=!0,super(t,t,i),this.menuStyle=s,this.options=i,this.options.icon=i.icon!==void 0?i.icon:!1,this.options.label=i.label!==void 0?i.label:!0,this.cssClass="",this.options.label&&i.enableMnemonics){const n=this.action.label;if(n){const r=M.exec(n);r&&(this.mnemonic=(r[1]?r[1]:r[3]).toLocaleLowerCase())}}this.runOnceToEnableMouseUp=new D(()=>{this.element&&(this._register(m(this.element,h.MOUSE_UP,n=>{if(d.stop(n,!0),q){if(new W(y(this.element),n).rightButton)return;this.onClick(n)}else setTimeout(()=>{this.onClick(n)},0)})),this._register(m(this.element,h.CONTEXT_MENU,n=>{d.stop(n,!0)})))},100),this._register(this.runOnceToEnableMouseUp)}render(e){super.render(e),this.element&&(this.container=e,this.item=p(this.element,b("a.action-menu-item")),this._action.id===S.ID?this.item.setAttribute("role","presentation"):(this.item.setAttribute("role","menuitem"),this.mnemonic&&this.item.setAttribute("aria-keyshortcuts",`${this.mnemonic}`)),this.check=p(this.item,b("span.menu-item-check"+P.asCSSSelector(w.menuSelection))),this.check.setAttribute("role","none"),this.label=p(this.item,b("span.action-label")),this.options.label&&this.options.keybinding&&(p(this.item,b("span.keybinding")).textContent=this.options.keybinding),this.runOnceToEnableMouseUp.schedule(),this.updateClass(),this.updateLabel(),this.updateTooltip(),this.updateEnabled(),this.updateChecked(),this.applyStyle())}blur(){super.blur(),this.applyStyle()}focus(){super.focus(),this.item?.focus(),this.applyStyle()}updatePositionInSet(e,t){this.item&&(this.item.setAttribute("aria-posinset",`${e}`),this.item.setAttribute("aria-setsize",`${t}`))}updateLabel(){if(this.label&&this.options.label){K(this.label);let e=Z(this.action.label);if(e){const t=ie(e);this.options.enableMnemonics||(e=t),this.label.setAttribute("aria-label",t.replace(/&&/g,"&"));const i=M.exec(e);if(i){e=I.escape(e),A.lastIndex=0;let s=A.exec(e);for(;s&&s[1];)s=A.exec(e);const n=r=>r.replace(/&amp;&amp;/g,"&amp;");s?this.label.append(I.ltrim(n(e.substr(0,s.index))," "),b("u",{"aria-hidden":"true"},s[3]),I.rtrim(n(e.substr(s.index+s[0].length))," ")):this.label.innerText=n(e).trim(),this.item?.setAttribute("aria-keyshortcuts",(i[1]?i[1]:i[3]).toLocaleLowerCase())}else this.label.innerText=e.replace(/&&/g,"&").trim()}}}updateTooltip(){}updateClass(){this.cssClass&&this.item&&this.item.classList.remove(...this.cssClass.split(" ")),this.options.icon&&this.label?(this.cssClass=this.action.class||"",this.label.classList.add("icon"),this.cssClass&&this.label.classList.add(...this.cssClass.split(" ")),this.updateEnabled()):this.label&&this.label.classList.remove("icon")}updateEnabled(){this.action.enabled?(this.element&&(this.element.classList.remove("disabled"),this.element.removeAttribute("aria-disabled")),this.item&&(this.item.classList.remove("disabled"),this.item.removeAttribute("aria-disabled"),this.item.tabIndex=0)):(this.element&&(this.element.classList.add("disabled"),this.element.setAttribute("aria-disabled","true")),this.item&&(this.item.classList.add("disabled"),this.item.setAttribute("aria-disabled","true")))}updateChecked(){if(!this.item)return;const e=this.action.checked;this.item.classList.toggle("checked",!!e),e!==void 0?(this.item.setAttribute("role","menuitemcheckbox"),this.item.setAttribute("aria-checked",e?"true":"false")):(this.item.setAttribute("role","menuitem"),this.item.setAttribute("aria-checked",""))}getMnemonic(){return this.mnemonic}applyStyle(){const e=this.element&&this.element.classList.contains("focused"),t=e&&this.menuStyle.selectionForegroundColor?this.menuStyle.selectionForegroundColor:this.menuStyle.foregroundColor,i=e&&this.menuStyle.selectionBackgroundColor?this.menuStyle.selectionBackgroundColor:void 0,s=e&&this.menuStyle.selectionBorderColor?`1px solid ${this.menuStyle.selectionBorderColor}`:"",n=e&&this.menuStyle.selectionBorderColor?"-1px":"";this.item&&(this.item.style.color=t??"",this.item.style.backgroundColor=i??"",this.item.style.outline=s,this.item.style.outlineOffset=n),this.check&&(this.check.style.color=t??"")}}class L extends B{constructor(e,t,i,s,n){super(e,e,s,n),this.submenuActions=t,this.parentData=i,this.submenuOptions=s,this.mysubmenu=null,this.submenuDisposables=this._register(new ee),this.mouseOver=!1,this.expandDirection=s&&s.expandDirection!==void 0?s.expandDirection:{horizontal:C.Right,vertical:_.Below},this.showScheduler=new D(()=>{this.mouseOver&&(this.cleanupExistingSubmenu(!1),this.createSubmenu(!1))},250),this.hideScheduler=new D(()=>{this.element&&!g(k(),this.element)&&this.parentData.submenu===this.mysubmenu&&(this.parentData.parent.focus(!1),this.cleanupExistingSubmenu(!0))},750)}render(e){super.render(e),this.element&&(this.item&&(this.item.classList.add("monaco-submenu-item"),this.item.tabIndex=0,this.item.setAttribute("aria-haspopup","true"),this.updateAriaExpanded("false"),this.submenuIndicator=p(this.item,b("span.submenu-indicator"+P.asCSSSelector(w.menuSubmenu))),this.submenuIndicator.setAttribute("aria-hidden","true")),this._register(m(this.element,h.KEY_UP,t=>{const i=new f(t);(i.equals(17)||i.equals(3))&&(d.stop(t,!0),this.createSubmenu(!0))})),this._register(m(this.element,h.KEY_DOWN,t=>{const i=new f(t);k()===this.item&&(i.equals(17)||i.equals(3))&&d.stop(t,!0)})),this._register(m(this.element,h.MOUSE_OVER,t=>{this.mouseOver||(this.mouseOver=!0,this.showScheduler.schedule())})),this._register(m(this.element,h.MOUSE_LEAVE,t=>{this.mouseOver=!1})),this._register(m(this.element,h.FOCUS_OUT,t=>{this.element&&!g(k(),this.element)&&this.hideScheduler.schedule()})),this._register(this.parentData.parent.onScroll(()=>{this.parentData.submenu===this.mysubmenu&&(this.parentData.parent.focus(!1),this.cleanupExistingSubmenu(!0))})))}updateEnabled(){}open(e){this.cleanupExistingSubmenu(!1),this.createSubmenu(e)}onClick(e){d.stop(e,!0),this.cleanupExistingSubmenu(!1),this.createSubmenu(!0)}cleanupExistingSubmenu(e){if(this.parentData.submenu&&(e||this.parentData.submenu!==this.mysubmenu)){try{this.parentData.submenu.dispose()}catch{}this.parentData.submenu=void 0,this.updateAriaExpanded("false"),this.submenuContainer&&(this.submenuDisposables.clear(),this.submenuContainer=void 0)}}calculateSubmenuMenuLayout(e,t,i,s){const n={top:0,left:0};return n.left=U(e.width,t.width,{position:s.horizontal===C.Right?0:1,offset:i.left,size:i.width}),n.left>=i.left&&n.left<i.left+i.width&&(i.left+10+t.width<=e.width&&(n.left=i.left+10),i.top+=10,i.height=0),n.top=U(e.height,t.height,{position:0,offset:i.top,size:0}),n.top+t.height===i.top&&n.top+i.height+t.height<=e.height&&(n.top+=i.height),n}createSubmenu(e=!0){if(this.element)if(this.parentData.submenu)this.parentData.submenu.focus(!1);else{this.updateAriaExpanded("true"),this.submenuContainer=p(this.element,b("div.monaco-submenu")),this.submenuContainer.classList.add("menubar-menu-items-holder","context-view");const t=y(this.parentData.parent.domNode).getComputedStyle(this.parentData.parent.domNode),i=parseFloat(t.paddingTop||"0")||0;this.submenuContainer.style.position="fixed",this.submenuContainer.style.top="0",this.submenuContainer.style.left="0",this.parentData.submenu=new x(this.submenuContainer,this.submenuActions.length?this.submenuActions:[new X],this.submenuOptions,this.menuStyle);const s=this.element.getBoundingClientRect(),n={top:s.top-i,left:s.left,height:s.height+2*i,width:s.width},r=this.submenuContainer.getBoundingClientRect(),u=y(this.element),{top:E,left:a}=this.calculateSubmenuMenuLayout(new F(u.innerWidth,u.innerHeight),F.lift(r),n,this.expandDirection);this.submenuContainer.style.left=`${a-r.left}px`,this.submenuContainer.style.top=`${E-r.top}px`,this.submenuDisposables.add(m(this.submenuContainer,h.KEY_UP,o=>{new f(o).equals(15)&&(d.stop(o,!0),this.parentData.parent.focus(),this.cleanupExistingSubmenu(!0))})),this.submenuDisposables.add(m(this.submenuContainer,h.KEY_DOWN,o=>{new f(o).equals(15)&&d.stop(o,!0)})),this.submenuDisposables.add(this.parentData.submenu.onDidCancel(()=>{this.parentData.parent.focus(),this.cleanupExistingSubmenu(!0)})),this.parentData.submenu.focus(e),this.mysubmenu=this.parentData.submenu}}updateAriaExpanded(e){this.item&&this.item?.setAttribute("aria-expanded",e)}applyStyle(){super.applyStyle();const t=this.element&&this.element.classList.contains("focused")&&this.menuStyle.selectionForegroundColor?this.menuStyle.selectionForegroundColor:this.menuStyle.foregroundColor;this.submenuIndicator&&(this.submenuIndicator.style.color=t??"")}dispose(){super.dispose(),this.hideScheduler.dispose(),this.mysubmenu&&(this.mysubmenu.dispose(),this.mysubmenu=null),this.submenuContainer&&(this.submenuContainer=void 0)}}class R extends G{constructor(e,t,i,s){super(e,t,i),this.menuStyles=s}render(e){super.render(e),this.label&&(this.label.style.borderBottomColor=this.menuStyles.separatorColor?`${this.menuStyles.separatorColor}`:"")}}function ie(c){const e=M,t=e.exec(c);if(!t)return c;const i=!t[1];return c.replace(e,i?"$2$3":"").trim()}function V(c){const e=Q()[c.id];return`.codicon-${c.id}:before { content: '\\${e.toString(16)}'; }`}function ne(c,e){let t=`
.monaco-menu {
	font-size: 13px;
	border-radius: 5px;
	min-width: 160px;
}

${V(w.menuSelection)}
${V(w.menuSubmenu)}

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
			`);const n=c.scrollbarSliderHoverBackground;n&&(t+=`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${n};
				}
			`);const r=c.scrollbarSliderActiveBackground;r&&(t+=`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${r};
				}
			`)}return t}export{C as HorizontalDirection,A as MENU_ESCAPED_MNEMONIC_REGEX,M as MENU_MNEMONIC_REGEX,x as Menu,_ as VerticalDirection,ie as cleanMnemonic,V as formatRule,we as unthemedMenuStyles};
