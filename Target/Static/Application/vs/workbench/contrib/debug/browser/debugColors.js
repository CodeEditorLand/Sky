import{$op as e,$Ap as a,$lq as x,$iq as g,$Cp as ko,$Sp as po,$Tp as Co,$4s as wo,$Gp as $o,$Vr as So,$dr as Fo}from"../../../../platform/theme/common/colorRegistry.js";import{$Rt as mo}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as r}from"../../../../base/common/themables.js";import{$hp as fo}from"../../../../base/common/color.js";import{localize as c}from"../../../../nls.js";import*as n from"./debugIcons.js";import{$Jt as vo}from"../../../../platform/theme/common/theme.js";const Vo=e("debugToolBar.background",{dark:"#333333",light:"#F3F3F3",hcDark:"#000000",hcLight:"#FFFFFF"},c(6388,null)),Bo=e("debugToolBar.border",null,c(6389,null)),xo=e("debugIcon.startForeground",{dark:"#89D185",light:"#388A34",hcDark:"#89D185",hcLight:"#388A34"},c(6390,null));function To(){const L=e("debugTokenExpression.name",{dark:"#c586c0",light:"#9b46b0",hcDark:a,hcLight:a},"Foreground color for the token names shown in the debug views (ie. the Variables or Watch view)."),I=e("debugTokenExpression.type",{dark:"#4A90E2",light:"#4A90E2",hcDark:a,hcLight:a},"Foreground color for the token types shown in the debug views (ie. the Variables or Watch view)."),E=e("debugTokenExpression.value",{dark:"#cccccc99",light:"#6c6c6ccc",hcDark:a,hcLight:a},"Foreground color for the token values shown in the debug views (ie. the Variables or Watch view)."),D=e("debugTokenExpression.string",{dark:"#ce9178",light:"#a31515",hcDark:"#f48771",hcLight:"#a31515"},"Foreground color for strings in the debug views (ie. the Variables or Watch view)."),z=e("debugTokenExpression.boolean",{dark:"#4e94ce",light:"#0000ff",hcDark:"#75bdfe",hcLight:"#0000ff"},"Foreground color for booleans in the debug views (ie. the Variables or Watch view)."),A=e("debugTokenExpression.number",{dark:"#b5cea8",light:"#098658",hcDark:"#89d185",hcLight:"#098658"},"Foreground color for numbers in the debug views (ie. the Variables or Watch view)."),V=e("debugTokenExpression.error",{dark:"#f48771",light:"#e51400",hcDark:"#f48771",hcLight:"#e51400"},"Foreground color for expression errors in the debug views (ie. the Variables or Watch view) and for error logs shown in the debug console."),B=e("debugView.exceptionLabelForeground",{dark:a,light:"#FFF",hcDark:a,hcLight:a},"Foreground color for a label shown in the CALL STACK view when the debugger breaks on an exception."),T=e("debugView.exceptionLabelBackground",{dark:"#6C2022",light:"#A31515",hcDark:"#6C2022",hcLight:"#A31515"},"Background color for a label shown in the CALL STACK view when the debugger breaks on an exception."),R=e("debugView.stateLabelForeground",a,"Foreground color for a label in the CALL STACK view showing the current session's or thread's state."),y=e("debugView.stateLabelBackground","#88888844","Background color for a label in the CALL STACK view showing the current session's or thread's state."),O=e("debugView.valueChangedHighlight","#569CD6","Color used to highlight value changes in the debug views (ie. in the Variables view)."),W=e("debugConsole.infoForeground",{dark:x,light:x,hcDark:a,hcLight:a},"Foreground color for info messages in debug REPL console."),P=e("debugConsole.warningForeground",{dark:g,light:g,hcDark:"#008000",hcLight:g},"Foreground color for warning messages in debug REPL console."),H=e("debugConsole.errorForeground",ko,"Foreground color for error messages in debug REPL console."),N=e("debugConsole.sourceForeground",a,"Foreground color for source filenames in debug REPL console."),u=e("debugConsoleInputIcon.foreground",a,"Foreground color for debug console input marker icon."),q=e("debugIcon.pauseForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6391,null)),K=e("debugIcon.stopForeground",{dark:"#F48771",light:"#A1260D",hcDark:"#F48771",hcLight:"#A1260D"},c(6392,null)),j=e("debugIcon.disconnectForeground",{dark:"#F48771",light:"#A1260D",hcDark:"#F48771",hcLight:"#A1260D"},c(6393,null)),G=e("debugIcon.restartForeground",{dark:"#89D185",light:"#388A34",hcDark:"#89D185",hcLight:"#388A34"},c(6394,null)),J=e("debugIcon.stepOverForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6395,null)),M=e("debugIcon.stepIntoForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6396,null)),Q=e("debugIcon.stepOutForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6397,null)),U=e("debugIcon.continueForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6398,null)),X=e("debugIcon.stepBackForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c(6399,null));mo((o,t)=>{const s=o.getColor(po),i=o.getColor(Co),Y=o.getColor(wo),d=o.getColor(B),b=o.getColor(T),Z=o.getColor(R),_=o.getColor(y),l=o.getColor(O),oo=o.getColor(Fo);t.addRule(`
			/* Text colour of the call stack row's filename */
			.debug-pane .debug-call-stack .monaco-list-row:not(.selected) .stack-frame > .file .file-name {
				color: ${Y}
			}

			/* Line & column number "badge" for selected call stack row */
			.debug-pane .monaco-list-row.selected .line-number {
				background-color: ${s};
				color: ${i};
			}

			/* Line & column number "badge" for unselected call stack row (basically all other rows) */
			.debug-pane .line-number {
				background-color: ${s.transparent(.6)};
				color: ${i.transparent(.6)};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running.
			*/
			.debug-pane .debug-call-stack .thread > .state.label,
			.debug-pane .debug-call-stack .session > .state.label {
				background-color: ${_};
				color: ${Z};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running
			* and thread paused due to a thrown exception.
			*/
			.debug-pane .debug-call-stack .thread > .state.label.exception,
			.debug-pane .debug-call-stack .session > .state.label.exception {
				background-color: ${b};
				color: ${d};
			}

			/* Info "badge" shown when the debugger pauses due to a thrown exception. */
			.debug-pane .call-stack-state-message > .label.exception {
				background-color: ${b};
				color: ${d};
			}

			/* Animation of changed values in Debug viewlet */
			@keyframes debugViewletValueChanged {
				0%   { background-color: ${l.transparent(0)} }
				5%   { background-color: ${l.transparent(.9)} }
				100% { background-color: ${l.transparent(.3)} }
			}

			.debug-pane .monaco-list-row .expression .value.changed {
				background-color: ${l.transparent(.3)};
				animation-name: debugViewletValueChanged;
				animation-duration: 1s;
				animation-fill-mode: forwards;
			}

			.monaco-list-row .expression .lazy-button:hover {
				background-color: ${oo}
			}
		`);const h=o.getColor($o);h&&t.addRule(`
			.debug-pane .line-number {
				border: 1px solid ${h};
			}
			`),vo(o.type)&&t.addRule(`
			.debug-pane .line-number {
				background-color: ${s};
				color: ${i};
			}`);const eo=o.getColor(L),ro=o.getColor(I),no=o.getColor(E),to=o.getColor(D),ao=o.getColor(z),co=o.getColor(V),lo=o.getColor(A);t.addRule(`
			.monaco-workbench .monaco-list-row .expression .name {
				color: ${eo};
			}

			.monaco-workbench .monaco-list-row .expression .type {
				color: ${ro};
			}

			.monaco-workbench .monaco-list-row .expression .value,
			.monaco-workbench .debug-hover-widget .value {
				color: ${no};
			}

			.monaco-workbench .monaco-list-row .expression .value.string,
			.monaco-workbench .debug-hover-widget .value.string {
				color: ${to};
			}

			.monaco-workbench .monaco-list-row .expression .value.boolean,
			.monaco-workbench .debug-hover-widget .value.boolean {
				color: ${ao};
			}

			.monaco-workbench .monaco-list-row .expression .error,
			.monaco-workbench .debug-hover-widget .error,
			.monaco-workbench .debug-pane .debug-variables .scope .error {
				color: ${co};
			}

			.monaco-workbench .monaco-list-row .expression .value.number,
			.monaco-workbench .debug-hover-widget .value.number {
				color: ${lo};
			}
		`);const so=o.getColor(So)||fo.fromHex("#80808060"),io=o.getColor(W),go=o.getColor(P),uo=o.getColor(H),bo=o.getColor(N),ho=o.getColor(u);t.addRule(`
			.repl .repl-input-wrapper {
				border-top: 1px solid ${so};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.info {
				color: ${io};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.warn {
				color: ${go};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.error {
				color: ${uo};
			}

			.monaco-workbench .repl .repl-tree .output .expression .source {
				color: ${bo};
			}

			.monaco-workbench .repl .repl-tree .monaco-tl-contents .arrow {
				color: ${ho};
			}
		`),o.defines(u)||t.addRule(`
				.monaco-workbench.vs .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.25;
				}

				.monaco-workbench.vs-dark .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.4;
				}

				.monaco-workbench.hc-black .repl .repl-tree .monaco-tl-contents .arrow,
				.monaco-workbench.hc-light .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 1;
				}
			`);const k=o.getColor(xo);k&&t.addRule(`.monaco-workbench ${r.asCSSSelector(n.$vzb)} { color: ${k}; }`);const p=o.getColor(q);p&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$rzb)}, .monaco-workbench ${r.asCSSSelector(n.$rzb)} { color: ${p}; }`);const C=o.getColor(K);C&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$kzb)},.monaco-workbench ${r.asCSSSelector(n.$kzb)} { color: ${C}; }`);const w=o.getColor(j);w&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$lzb)},.monaco-workbench .debug-view-content ${r.asCSSSelector(n.$lzb)}, .monaco-workbench .debug-toolbar ${r.asCSSSelector(n.$lzb)}, .monaco-workbench .command-center-center ${r.asCSSSelector(n.$lzb)} { color: ${w}; }`);const $=o.getColor(G);$&&t.addRule(`.monaco-workbench ${r.asCSSSelector(n.$mzb)}, .monaco-workbench ${r.asCSSSelector(n.$jzb)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$mzb)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$jzb)} { color: ${$}; }`);const S=o.getColor(J);S&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$nzb)}, .monaco-workbench ${r.asCSSSelector(n.$nzb)} { color: ${S}; }`);const F=o.getColor(M);F&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$ozb)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$ozb)}, .monaco-workbench ${r.asCSSSelector(n.$ozb)} { color: ${F}; }`);const m=o.getColor(Q);m&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$pzb)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$pzb)}, .monaco-workbench ${r.asCSSSelector(n.$pzb)} { color: ${m}; }`);const f=o.getColor(U);f&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$szb)}, .monaco-workbench ${r.asCSSSelector(n.$szb)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$tzb)}, .monaco-workbench ${r.asCSSSelector(n.$tzb)} { color: ${f}; }`);const v=o.getColor(X);v&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.$qzb)}, .monaco-workbench ${r.asCSSSelector(n.$qzb)} { color: ${v}; }`)})}export{Vo as $Mzb,Bo as $Nzb,xo as $Ozb,To as $Pzb};
