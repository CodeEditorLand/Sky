import{localize as e}from"../../../../nls.js";import{$Xp as q,$Wp as w,$Sp as F,$Tp as S,$Sr as x,$Or as B,$Gp as n,$Zq as l,$1q as c,$7p as d,$gq as g,$8p as P,$mq as i,$up as v,$op as t,$tp as r}from"../../../../platform/theme/common/colorRegistry.js";import{$St as G}from"../../../../platform/theme/common/themeService.js";const m=t("testing.iconFailed",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(12479,null)),D=t("testing.iconErrored",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(12480,null)),k=t("testing.iconPassed",{dark:"#73c991",light:"#73c991",hcDark:"#73c991",hcLight:"#007100"},e(12481,null)),W=t("testing.runAction",k,e(12482,null)),f=t("testing.iconQueued","#cca700",e(12483,null)),L=t("testing.iconUnset","#848484",e(12484,null)),b=t("testing.iconSkipped","#848484",e(12485,null)),X=t("testing.peekBorder",{dark:g,light:g,hcDark:n,hcLight:n},e(12486,null)),Z=t("testing.messagePeekBorder",{dark:i,light:i,hcDark:n,hcLight:n},e(12487,null)),I=t("testing.peekHeaderBackground",{dark:r(g,.1),light:r(g,.1),hcDark:null,hcLight:null},e(12488,null)),J=t("testing.messagePeekHeaderBackground",{dark:r(i,.1),light:r(i,.1),hcDark:null,hcLight:null},e(12489,null)),u=t("testing.coveredBackground",{dark:l,light:l,hcDark:null,hcLight:null},e(12490,null)),O=t("testing.coveredBorder",{dark:r(u,.75),light:r(u,.75),hcDark:n,hcLight:n},e(12491,null)),K=t("testing.coveredGutterBackground",{dark:r(l,.6),light:r(l,.6),hcDark:x,hcLight:x},e(12492,null)),M=t("testing.uncoveredBranchBackground",{dark:v(r(c,2),d),light:v(r(c,2),d),hcDark:null,hcLight:null},e(12493,null)),s=t("testing.uncoveredBackground",{dark:c,light:c,hcDark:null,hcLight:null},e(12494,null)),z=t("testing.uncoveredBorder",{dark:r(s,.75),light:r(s,.75),hcDark:n,hcLight:n},e(12495,null)),N=t("testing.uncoveredGutterBackground",{dark:r(c,1.5),light:r(c,1.5),hcDark:B,hcLight:B},e(12496,null)),V=t("testing.coverCountBadgeBackground",F,e(12497,null)),Y=t("testing.coverCountBadgeForeground",S,e(12498,null)),C=t("testing.message.error.badgeBackground",q,e(12499,null));t("testing.message.error.badgeBorder",C,e(12500,null));t("testing.message.error.badgeForeground",w,e(12501,null));t("testing.message.error.lineBackground",null,e(12502,null));t("testing.message.info.decorationForeground",r(P,.5),e(12503,null));t("testing.message.info.lineBackground",null,e(12504,null));const _={6:D,4:m,3:k,1:f,0:L,5:b},A=t("testing.iconErrored.retired",r(D,.7),e(12505,null)),E=t("testing.iconFailed.retired",r(m,.7),e(12506,null)),H=t("testing.iconPassed.retired",r(k,.7),e(12507,null)),Q=t("testing.iconQueued.retired",r(f,.7),e(12508,null)),R=t("testing.iconUnset.retired",r(L,.7),e(12509,null)),U=t("testing.iconSkipped.retired",r(b,.7),e(12510,null)),ee={6:A,4:E,3:H,1:Q,0:R,5:U};G((o,h)=>{const a=o.getColor(d);if(h.addRule(`
	.coverage-deco-inline.coverage-deco-hit.coverage-deco-hovered {
		background: ${o.getColor(u)?.transparent(1.3)};
		outline-color: ${o.getColor(O)?.transparent(2)};
	}
	.coverage-deco-inline.coverage-deco-miss.coverage-deco-hovered {
		background: ${o.getColor(s)?.transparent(1.3)};
		outline-color: ${o.getColor(z)?.transparent(2)};
	}
		`),a){const p=o.getColor(s)?.transparent(2).makeOpaque(a),$=o.getColor(C)?.makeOpaque(a);h.addRule(`
			.coverage-deco-branch-miss-indicator::before {
				border-color: ${p?.transparent(1.3)};
				background-color: ${p};
			}
			.monaco-workbench .test-error-content-widget .inner{
				background: ${$};
			}
			.monaco-workbench .test-error-content-widget .inner .arrow svg {
				fill: ${$};
			}
		`)}});export{Q as $Akc,R as $Bkc,U as $Ckc,ee as $Dkc,m as $ckc,D as $dkc,k as $ekc,W as $fkc,f as $gkc,L as $hkc,b as $ikc,X as $jkc,Z as $kkc,I as $lkc,J as $mkc,u as $nkc,O as $okc,K as $pkc,M as $qkc,s as $rkc,z as $skc,N as $tkc,V as $ukc,Y as $vkc,_ as $wkc,A as $xkc,E as $ykc,H as $zkc};
