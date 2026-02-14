import{$bk as t}from"../../../../base/common/codicons.js";import{localize as e}from"../../../../nls.js";import{$gu as o,$nu as g}from"../../../../platform/theme/common/iconRegistry.js";import{$xu as p}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as n}from"../../../../base/common/themables.js";import{$$uc as a,$pvc as $,$wvc as d}from"./theme.js";const A=o("test-view-icon",t.beaker,e(14181,null)),R=o("test-results-icon",t.checklist,e(14182,null)),v=o("testing-run-icon",t.run,e(14183,null)),O=o("testing-rerun-icon",t.debugRerun,e(14184,null)),x=o("testing-run-all-icon",t.runAll,e(14185,null)),m=o("testing-debug-all-icon",t.debugAltSmall,e(14186,null)),S=o("testing-debug-icon",t.debugAltSmall,e(14187,null)),T=o("testing-coverage-icon",t.runCoverage,e(14188,null)),q=o("testing-coverage-all-icon",t.runAllCoverage,e(14189,null)),z=o("testing-cancel-icon",t.debugStop,e(14190,null)),F=o("testing-filter",t.filter,e(14191,null)),I=o("testing-hidden",t.eyeClosed,e(14192,null)),M=o("testing-show-as-list-icon",t.listTree,e(14193,null)),B=o("testing-show-as-list-icon",t.listFlat,e(14194,null)),D=o("testing-update-profiles",t.gear,e(14195,null)),E=o("testing-refresh-tests",t.refresh,e(14196,null)),G=o("testing-turn-continuous-run-on",t.eye,e(14197,null)),H=o("testing-turn-continuous-run-off",t.eyeClosed,e(14198,null)),J=o("testing-continuous-is-on",t.eye,e(14199,null)),K=o("testing-cancel-refresh-tests",t.stop,e(14200,null)),L=o("testing-coverage",t.coverage,e(14201,null)),N=o("testing-was-covered",t.check,e(14202,null)),P=o("testing-missing-branch",t.question,e(14203,null)),f=new Map([[6,o("testing-error-icon",t.issues,e(14204,null))],[4,o("testing-failed-icon",t.error,e(14205,null))],[3,o("testing-passed-icon",t.pass,e(14206,null))],[1,o("testing-queued-icon",t.history,e(14207,null))],[2,g],[5,o("testing-skipped-icon",t.debugStepOver,e(14208,null))],[0,o("testing-unset-icon",t.circleOutline,e(14209,null))]]);p((r,l)=>{for(const[c,s]of f.entries()){const i=$[c],u=d[c];i&&(l.addRule(`.monaco-workbench ${n.asCSSSelector(s)} {
			color: ${r.getColor(i)} !important;
		}`),u&&l.addRule(`
			.test-explorer .computed-state.retired${n.asCSSSelector(s)},
			.testing-run-glyph.retired${n.asCSSSelector(s)}{
				color: ${r.getColor(u)} !important;
			}
		`))}l.addRule(`
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(v)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(x)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(S)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(m)} {
			color: ${r.getColor(a)};
		}
	`)});export{O as $Avc,x as $Bvc,m as $Cvc,S as $Dvc,T as $Evc,q as $Fvc,z as $Gvc,F as $Hvc,I as $Ivc,M as $Jvc,B as $Kvc,D as $Lvc,E as $Mvc,G as $Nvc,H as $Ovc,J as $Pvc,K as $Qvc,L as $Rvc,N as $Svc,P as $Tvc,f as $Uvc,A as $xvc,R as $yvc,v as $zvc};
