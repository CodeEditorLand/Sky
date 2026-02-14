import{localize as e}from"../../../../nls.js";import{$zq as C,$yq as w,$uq as F,$vq as P,$vs as v,$rs as x,$hq as n,$Cr as l,$Dr as c,$Jq as d,$Vq as g,$Kq as z,$2q as i,$8p as B,$2p as t,$7p as r}from"../../../../platform/theme/common/colorRegistry.js";import{$xu as E}from"../../../../platform/theme/common/themeService.js";const m=t("testing.iconFailed",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(14398,null)),D=t("testing.iconErrored",{dark:"#f14c4c",light:"#f14c4c",hcDark:"#f14c4c",hcLight:"#B5200D"},e(14399,null)),h=t("testing.iconPassed",{dark:"#73c991",light:"#73c991",hcDark:"#73c991",hcLight:"#007100"},e(14400,null)),K=t("testing.runAction",h,e(14401,null)),f=t("testing.iconQueued","#cca700",e(14402,null)),L=t("testing.iconUnset","#848484",e(14403,null)),b=t("testing.iconSkipped","#848484",e(14404,null)),V=t("testing.peekBorder",{dark:g,light:g,hcDark:n,hcLight:n},e(14405,null)),_=t("testing.messagePeekBorder",{dark:i,light:i,hcDark:n,hcLight:n},e(14406,null)),I=t("testing.peekHeaderBackground",{dark:r(g,.1),light:r(g,.1),hcDark:null,hcLight:null},e(14407,null)),M=t("testing.messagePeekHeaderBackground",{dark:r(i,.1),light:r(i,.1),hcDark:null,hcLight:null},e(14408,null)),u=t("testing.coveredBackground",{dark:l,light:l,hcDark:null,hcLight:null},e(14409,null)),G=t("testing.coveredBorder",{dark:r(u,.75),light:r(u,.75),hcDark:n,hcLight:n},e(14410,null)),N=t("testing.coveredGutterBackground",{dark:r(l,.6),light:r(l,.6),hcDark:v,hcLight:v},e(14411,null)),T=t("testing.uncoveredBranchBackground",{dark:B(r(c,2),d),light:B(r(c,2),d),hcDark:null,hcLight:null},e(14412,null)),s=t("testing.uncoveredBackground",{dark:c,light:c,hcDark:null,hcLight:null},e(14413,null)),H=t("testing.uncoveredBorder",{dark:r(s,.75),light:r(s,.75),hcDark:n,hcLight:n},e(14414,null)),W=t("testing.uncoveredGutterBackground",{dark:r(c,1.5),light:r(c,1.5),hcDark:x,hcLight:x},e(14415,null)),X=t("testing.coverCountBadgeBackground",F,e(14416,null)),Y=t("testing.coverCountBadgeForeground",P,e(14417,null)),q=t("testing.message.error.badgeBackground",C,e(14418,null));t("testing.message.error.badgeBorder",q,e(14419,null));t("testing.message.error.badgeForeground",w,e(14420,null));t("testing.message.error.lineBackground",null,e(14421,null));t("testing.message.info.decorationForeground",r(z,.5),e(14422,null));t("testing.message.info.lineBackground",null,e(14423,null));const Z={6:D,4:m,3:h,1:f,0:L,5:b},O=t("testing.iconErrored.retired",r(D,.7),e(14424,null)),Q=t("testing.iconFailed.retired",r(m,.7),e(14425,null)),R=t("testing.iconPassed.retired",r(h,.7),e(14426,null)),S=t("testing.iconQueued.retired",r(f,.7),e(14427,null)),U=t("testing.iconUnset.retired",r(L,.7),e(14428,null)),j=t("testing.iconSkipped.retired",r(b,.7),e(14429,null)),ee={6:O,4:Q,3:R,1:S,0:U,5:j};E((o,k)=>{const a=o.getColor(d);if(k.addRule(`
	.coverage-deco-inline.coverage-deco-hit.coverage-deco-hovered {
		background: ${o.getColor(u)?.transparent(1.3)};
		outline-color: ${o.getColor(G)?.transparent(2)};
	}
	.coverage-deco-inline.coverage-deco-miss.coverage-deco-hovered {
		background: ${o.getColor(s)?.transparent(1.3)};
		outline-color: ${o.getColor(H)?.transparent(2)};
	}
		`),a){const $=o.getColor(s)?.transparent(2).makeOpaque(a),p=o.getColor(q)?.makeOpaque(a);k.addRule(`
			.coverage-deco-branch-miss-indicator::before {
				border-color: ${$?.transparent(1.3)};
				background-color: ${$};
			}
			.monaco-workbench .test-error-content-widget .inner{
				background: ${p};
			}
			.monaco-workbench .test-error-content-widget .inner .arrow svg {
				fill: ${p};
			}
		`)}});export{K as $$uc,h as $0uc,m as $8uc,D as $9uc,f as $_uc,L as $avc,b as $bvc,V as $cvc,_ as $dvc,I as $evc,M as $fvc,u as $gvc,G as $hvc,N as $ivc,T as $jvc,s as $kvc,H as $lvc,W as $mvc,X as $nvc,Y as $ovc,Z as $pvc,O as $qvc,Q as $rvc,R as $svc,S as $tvc,U as $uvc,j as $vvc,ee as $wvc};
