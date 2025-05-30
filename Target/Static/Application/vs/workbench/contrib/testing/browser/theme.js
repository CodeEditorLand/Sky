import{localize as e}from"../../../../nls.js";import{$Xp as q,$Wp as w,$Sp as F,$Tp as P,$Rr as x,$Nr as B,$Gp as n,$Yq as l,$Zq as c,$7p as d,$fq as g,$8p as R,$lq as i,$up as v,$op as t,$tp as r}from"../../../../platform/theme/common/colorRegistry.js";import{$Rt as G}from"../../../../platform/theme/common/themeService.js";const m=t("testing.iconFailed",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(12349,null)),f=t("testing.iconErrored",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(12350,null)),k=t("testing.iconPassed",{dark:"#73c991",light:"#73c991",hcDark:"#73c991",hcLight:"#007100"},e(12351,null)),T=t("testing.runAction",k,e(12352,null)),D=t("testing.iconQueued","#cca700",e(12353,null)),L=t("testing.iconUnset","#848484",e(12354,null)),b=t("testing.iconSkipped","#848484",e(12355,null)),W=t("testing.peekBorder",{dark:g,light:g,hcDark:n,hcLight:n},e(12356,null)),X=t("testing.messagePeekBorder",{dark:i,light:i,hcDark:n,hcLight:n},e(12357,null)),Y=t("testing.peekHeaderBackground",{dark:r(g,.1),light:r(g,.1),hcDark:null,hcLight:null},e(12358,null)),Z=t("testing.messagePeekHeaderBackground",{dark:r(i,.1),light:r(i,.1),hcDark:null,hcLight:null},e(12359,null)),u=t("testing.coveredBackground",{dark:l,light:l,hcDark:null,hcLight:null},e(12360,null)),S=t("testing.coveredBorder",{dark:r(u,.75),light:r(u,.75),hcDark:n,hcLight:n},e(12361,null)),I=t("testing.coveredGutterBackground",{dark:r(l,.6),light:r(l,.6),hcDark:x,hcLight:x},e(12362,null)),J=t("testing.uncoveredBranchBackground",{dark:v(r(c,2),d),light:v(r(c,2),d),hcDark:null,hcLight:null},e(12363,null)),a=t("testing.uncoveredBackground",{dark:c,light:c,hcDark:null,hcLight:null},e(12364,null)),z=t("testing.uncoveredBorder",{dark:r(a,.75),light:r(a,.75),hcDark:n,hcLight:n},e(12365,null)),K=t("testing.uncoveredGutterBackground",{dark:r(c,1.5),light:r(c,1.5),hcDark:B,hcLight:B},e(12366,null)),M=t("testing.coverCountBadgeBackground",F,e(12367,null)),V=t("testing.coverCountBadgeForeground",P,e(12368,null)),C=t("testing.message.error.badgeBackground",q,e(12369,null));t("testing.message.error.badgeBorder",C,e(12370,null));t("testing.message.error.badgeForeground",w,e(12371,null));t("testing.message.error.lineBackground",null,e(12372,null));t("testing.message.info.decorationForeground",r(R,.5),e(12373,null));t("testing.message.info.lineBackground",null,e(12374,null));const _={6:f,4:m,3:k,1:D,0:L,5:b},A=t("testing.iconErrored.retired",r(f,.7),e(12375,null)),E=t("testing.iconFailed.retired",r(m,.7),e(12376,null)),H=t("testing.iconPassed.retired",r(k,.7),e(12377,null)),O=t("testing.iconQueued.retired",r(D,.7),e(12378,null)),Q=t("testing.iconUnset.retired",r(L,.7),e(12379,null)),U=t("testing.iconSkipped.retired",r(b,.7),e(12380,null)),ee={6:A,4:E,3:H,1:O,0:Q,5:U};G((o,h)=>{const s=o.getColor(d);if(h.addRule(`
	.coverage-deco-inline.coverage-deco-hit.coverage-deco-hovered {
		background: ${o.getColor(u)?.transparent(1.3)};
		outline-color: ${o.getColor(S)?.transparent(2)};
	}
	.coverage-deco-inline.coverage-deco-miss.coverage-deco-hovered {
		background: ${o.getColor(a)?.transparent(1.3)};
		outline-color: ${o.getColor(z)?.transparent(2)};
	}
		`),s){const p=o.getColor(a)?.transparent(2).makeOpaque(s),$=o.getColor(C)?.makeOpaque(s);h.addRule(`
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
		`)}});export{U as $Akc,ee as $Bkc,m as $akc,f as $bkc,k as $ckc,T as $dkc,D as $ekc,L as $fkc,b as $gkc,W as $hkc,X as $ikc,Y as $jkc,Z as $kkc,u as $lkc,S as $mkc,I as $nkc,J as $okc,a as $pkc,z as $qkc,K as $rkc,M as $skc,V as $tkc,_ as $ukc,A as $vkc,E as $wkc,H as $xkc,O as $ykc,Q as $zkc};
