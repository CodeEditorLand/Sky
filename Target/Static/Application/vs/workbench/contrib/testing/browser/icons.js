import{$Mj as t}from"../../../../base/common/codicons.js";import{localize as e}from"../../../../nls.js";import{$Ct as o,$Jt as g}from"../../../../platform/theme/common/iconRegistry.js";import{$St as a}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as n}from"../../../../base/common/themables.js";import{$fkc as p,$wkc as $,$Dkc as d}from"./theme.js";const R=o("test-view-icon",t.beaker,e(12265,null)),A=o("test-results-icon",t.checklist,e(12266,null)),k=o("testing-run-icon",t.run,e(12267,null)),M=o("testing-rerun-icon",t.debugRerun,e(12268,null)),S=o("testing-run-all-icon",t.runAll,e(12269,null)),m=o("testing-debug-all-icon",t.debugAltSmall,e(12270,null)),x=o("testing-debug-icon",t.debugAltSmall,e(12271,null)),O=o("testing-coverage-icon",t.runCoverage,e(12272,null)),T=o("testing-coverage-all-icon",t.runAllCoverage,e(12273,null)),q=o("testing-cancel-icon",t.debugStop,e(12274,null)),F=o("testing-filter",t.filter,e(12275,null)),I=o("testing-hidden",t.eyeClosed,e(12276,null)),J=o("testing-show-as-list-icon",t.listTree,e(12277,null)),j=o("testing-show-as-list-icon",t.listFlat,e(12278,null)),z=o("testing-update-profiles",t.gear,e(12279,null)),D=o("testing-refresh-tests",t.refresh,e(12280,null)),E=o("testing-turn-continuous-run-on",t.eye,e(12281,null)),G=o("testing-turn-continuous-run-off",t.eyeClosed,e(12282,null)),H=o("testing-continuous-is-on",t.eye,e(12283,null)),K=o("testing-cancel-refresh-tests",t.stop,e(12284,null)),L=o("testing-coverage",t.coverage,e(12285,null)),N=o("testing-was-covered",t.check,e(12286,null)),P=o("testing-missing-branch",t.question,e(12287,null)),f=new Map([[6,o("testing-error-icon",t.issues,e(12288,null))],[4,o("testing-failed-icon",t.error,e(12289,null))],[3,o("testing-passed-icon",t.pass,e(12290,null))],[1,o("testing-queued-icon",t.history,e(12291,null))],[2,g],[5,o("testing-skipped-icon",t.debugStepOver,e(12292,null))],[0,o("testing-unset-icon",t.circleOutline,e(12293,null))]]);a((r,l)=>{for(const[c,s]of f.entries()){const i=$[c],u=d[c];i&&(l.addRule(`.monaco-workbench ${n.asCSSSelector(s)} {
			color: ${r.getColor(i)} !important;
		}`),u&&l.addRule(`
			.test-explorer .computed-state.retired${n.asCSSSelector(s)},
			.testing-run-glyph.retired${n.asCSSSelector(s)}{
				color: ${r.getColor(u)} !important;
			}
		`))}l.addRule(`
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(k)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(S)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(x)},
		.monaco-editor .glyph-margin-widgets ${n.asCSSSelector(m)} {
			color: ${r.getColor(p)};
		}
	`)});export{P as $1kc,f as $2kc,R as $Ekc,A as $Fkc,k as $Gkc,M as $Hkc,S as $Ikc,m as $Jkc,x as $Kkc,O as $Lkc,T as $Mkc,q as $Nkc,F as $Okc,I as $Pkc,J as $Qkc,j as $Rkc,z as $Skc,D as $Tkc,E as $Ukc,G as $Vkc,H as $Wkc,K as $Xkc,L as $Ykc,N as $Zkc};
