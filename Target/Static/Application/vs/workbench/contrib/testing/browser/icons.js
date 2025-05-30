import{$Nj as t}from"../../../../base/common/codicons.js";import{localize as e}from"../../../../nls.js";import{$Bt as o,$It as g}from"../../../../platform/theme/common/iconRegistry.js";import{$Rt as a}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as n}from"../../../../base/common/themables.js";import{$dkc as p,$ukc as $,$Bkc as d}from"./theme.js";const R=o("test-view-icon",t.beaker,e(12135,null)),A=o("test-results-icon",t.checklist,e(12136,null)),k=o("testing-run-icon",t.run,e(12137,null)),I=o("testing-rerun-icon",t.debugRerun,e(12138,null)),m=o("testing-run-all-icon",t.runAll,e(12139,null)),S=o("testing-debug-all-icon",t.debugAltSmall,e(12140,null)),x=o("testing-debug-icon",t.debugAltSmall,e(12141,null)),O=o("testing-coverage-icon",t.runCoverage,e(12142,null)),T=o("testing-coverage-all-icon",t.runAllCoverage,e(12143,null)),q=o("testing-cancel-icon",t.debugStop,e(12144,null)),B=o("testing-filter",t.filter,e(12145,null)),F=o("testing-hidden",t.eyeClosed,e(12146,null)),M=o("testing-show-as-list-icon",t.listTree,e(12147,null)),N=o("testing-show-as-list-icon",t.listFlat,e(12148,null)),j=o("testing-update-profiles",t.gear,e(12149,null)),z=o("testing-refresh-tests",t.refresh,e(12150,null)),D=o("testing-turn-continuous-run-on",t.eye,e(12151,null)),E=o("testing-turn-continuous-run-off",t.eyeClosed,e(12152,null)),G=o("testing-continuous-is-on",t.eye,e(12153,null)),H=o("testing-cancel-refresh-tests",t.stop,e(12154,null)),J=o("testing-coverage",t.coverage,e(12155,null)),K=o("testing-was-covered",t.check,e(12156,null)),L=o("testing-missing-branch",t.question,e(12157,null)),f=new Map([[6,o("testing-error-icon",t.issues,e(12158,null))],[4,o("testing-failed-icon",t.error,e(12159,null))],[3,o("testing-passed-icon",t.pass,e(12160,null))],[1,o("testing-queued-icon",t.history,e(12161,null))],[2,g],[5,o("testing-skipped-icon",t.debugStepOver,e(12162,null))],[0,o("testing-unset-icon",t.circleOutline,e(12163,null))]]);a((r,l)=>{for(const[c,s]of f.entries()){const i=$[c],u=d[c];i&&(l.addRule(`.monaco-workbench ${n.asCSSSelector(s)} {
			color: ${r.getColor(i)} !important;
		}`),u&&l.addRule(`
			.test-explorer .computed-state.retired${n.asCSSSelector(s)},
			.testing-run-glyph.retired${n.asCSSSelector(s)}{
				color: ${r.getColor(u)} !important;
			}
		`))}l.addRule(`
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(k)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(m)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(x)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(S)} {
			color: ${r.getColor(p)};
		}
	`)});export{R as $Ckc,A as $Dkc,k as $Ekc,I as $Fkc,m as $Gkc,S as $Hkc,x as $Ikc,O as $Jkc,T as $Kkc,q as $Lkc,B as $Mkc,F as $Nkc,M as $Okc,N as $Pkc,j as $Qkc,z as $Rkc,D as $Skc,E as $Tkc,G as $Ukc,H as $Vkc,J as $Wkc,K as $Xkc,L as $Ykc,f as $Zkc};
