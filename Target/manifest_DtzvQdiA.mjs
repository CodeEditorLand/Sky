import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'devalue';
import { i as decodeKey } from './chunks/astro/server_BBImsahs.mjs';
import 'clsx';
import 'html-escaper';
import { compile } from 'path-to-regexp';

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    const path = toPath(sanitizedParams);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/","adapterName":"","routes":[{"file":"file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/Editor/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/editor","isIndex":false,"type":"page","pattern":"^\\/Editor\\/?$","segments":[[{"content":"Editor","dynamic":false,"spread":false}]],"params":[],"component":"Source/pages/Editor.astro","pathname":"/Editor","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/VSCode/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/vscode","isIndex":false,"type":"page","pattern":"^\\/VSCode\\/?$","segments":[[{"content":"VSCode","dynamic":false,"spread":false}]],"params":[],"component":"Source/pages/VSCode.astro","pathname":"/VSCode","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"Source/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"http://localhost","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:Source/pages/Editor@_@astro":"pages/editor.astro.mjs","\u0000@astro-page:Source/pages/VSCode@_@astro":"pages/vscode.astro.mjs","\u0000@astro-page:Source/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-manifest":"manifest_DtzvQdiA.mjs","@astrojs/solid-js/client.js":"_astro/client.BTzBztYh.js","@codeeditorland/wind/Target/Element/Page/Editor.js":"_astro/Editor.B86AYKf4.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Layout/Base.astro?astro&type=script&index=1&lang.ts":"_astro/Base.astro_astro_type_script_index_1_lang.D4DYKVOQ.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Layout/Base.astro?astro&type=script&index=0&lang.ts":"_astro/Base.astro_astro_type_script_index_0_lang.DvSLRLVP.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/node_modules/@codeeditorland/wind/Target/Context/Action.js":"_astro/Action.DLZPKfwE.js","/run/media/nikola/Developer/Developer/node_modules/@swup/head-plugin/dist/index.modern.js":"_astro/index.modern.FjGODCox.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/html/html.worker.js?worker":"_astro/html.worker.OEJYsPKm.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/css/css.worker.js?worker":"_astro/css.worker.grZpeJG4.js","/run/media/nikola/Developer/Developer/node_modules/@swup/body-class-plugin/dist/index.modern.js":"_astro/index.modern.aa8fLSdp.js","/run/media/nikola/Developer/Developer/node_modules/@swup/preload-plugin/dist/index.modern.js":"_astro/index.modern.CUPCPLSa.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/node_modules/@codeeditorland/wind/Target/Script/Monaco/Theme/Active4D.json":"_astro/Active4D.DCMaBw04.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker":"_astro/editor.worker.BQkWA7y-.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/cameligo/cameligo.js":"_astro/cameligo.C4sOAjVA.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js?worker":"_astro/ts.worker.XxyRDIvN.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/clojure/clojure.js":"_astro/clojure.km7gOPWA.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/node_modules/@codeeditorland/wind/Target/Context/Action/Context.js":"_astro/Context.hKYIVnMC.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/node_modules/@codeeditorland/wind/Target/Script/Monaco/Theme/Amoled.json":"_astro/Amoled.Ci6ZcdC2.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/csharp/csharp.js":"_astro/csharp.COGe4-Oj.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/abap/abap.js":"_astro/abap.CTDuhESq.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/cpp/cpp.js":"_astro/cpp.Mb7vluXc.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/bicep/bicep.js":"_astro/bicep.BajGc2gV.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/kotlin/kotlin.js":"_astro/kotlin.DJFFZN88.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/apex/apex.js":"_astro/apex.Cj5GRJWY.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.js":"_astro/azcli.CxGCmomZ.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/bat/bat.js":"_astro/bat.CojzBgLk.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/lexon/lexon.js":"_astro/lexon.g9-SPPpR.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/coffee/coffee.js":"_astro/coffee.B1qwj4cg.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/markdown/markdown.js":"_astro/markdown.C6r-Ctxu.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/java/java.js":"_astro/java.BDMr4C-F.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/liquid/liquid.js":"_astro/liquid.B4N5u8Ku.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/less/less.js":"_astro/less.DYPbtITh.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/html/html.js":"_astro/html.HLFqyZ75.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/ini/ini.js":"_astro/ini.CEL1BUY5.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/typescript/typescript.js":"_astro/typescript.BxA-CR17.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/julia/julia.js":"_astro/julia.CCa8knG0.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/javascript/javascript.js":"_astro/javascript.CztzzAr0.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/m3/m3.js":"_astro/m3.De81O-lx.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/flow9/flow9.js":"_astro/flow9.apP2y119.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/hcl/hcl.js":"_astro/hcl.BW3_dzap.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/fsharp/fsharp.js":"_astro/fsharp.819v3oiY.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/csp/csp.js":"_astro/csp.B7bn6X9D.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/css/css.js":"_astro/css.Cl0SsTAo.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/handlebars/handlebars.js":"_astro/handlebars.CaABp7Gw.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/dart/dart.js":"_astro/dart.Dis5v2Yk.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.js":"_astro/dockerfile.CKqlJTe7.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/graphql/graphql.js":"_astro/graphql.Cscg5D_h.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/go/go.js":"_astro/go.DQDiuXP0.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/cypher/cypher.js":"_astro/cypher.DFSwMhQl.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/ecl/ecl.js":"_astro/ecl.c9ICOgh_.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/mips/mips.js":"_astro/mips.ckaX6WKA.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/elixir/elixir.js":"_astro/elixir.DGMKHkh4.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/mdx/mdx.js":"_astro/mdx.DZVXyvrw.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/mysql/mysql.js":"_astro/mysql.CvvTGz1Y.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/powershell/powershell.js":"_astro/powershell.MRySAVbO.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/r/r.js":"_astro/r.C4tRHCIg.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/qsharp/qsharp.js":"_astro/qsharp.C8HxWQfN.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/msdax/msdax.js":"_astro/msdax.r-ymrbt-.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/objective-c/objective-c.js":"_astro/objective-c.DAlI40hx.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/python/python.js":"_astro/python.Cm6V7Hk8.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/freemarker2/freemarker2.js":"_astro/freemarker2.DbXfnDGL.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/protobuf/protobuf.js":"_astro/protobuf.C-vwJca_.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/php/php.js":"_astro/php.6xrNid1u.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/pascal/pascal.js":"_astro/pascal.Yc4PVahs.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/pascaligo/pascaligo.js":"_astro/pascaligo.BpqHOLRG.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/powerquery/powerquery.js":"_astro/powerquery.Bpp2IoU2.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/pla/pla.js":"_astro/pla.D3SAz3NG.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/perl/perl.js":"_astro/perl.DDNolSKE.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/postiats/postiats.js":"_astro/postiats.DALqg9NI.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/pgsql/pgsql.js":"_astro/pgsql.DjkS-f6l.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/lua/lua.js":"_astro/lua.DKtjMSsE.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/pug/pug.js":"_astro/pug.DtKyQW4m.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/sb/sb.js":"_astro/sb.6lAUxaMY.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/razor/razor.js":"_astro/razor.Hjr_JhAX.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/restructuredtext/restructuredtext.js":"_astro/restructuredtext.19gx7Pon.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/ruby/ruby.js":"_astro/ruby.BuVRPwXF.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/shell/shell.js":"_astro/shell.C-ceuncq.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/redshift/redshift.js":"_astro/redshift.B2deT8ea.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/swift/swift.js":"_astro/swift.CCz-ik8g.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/scss/scss.js":"_astro/scss.CaTMA2EC.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/systemverilog/systemverilog.js":"_astro/systemverilog.k-4Imtct.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/sophia/sophia.js":"_astro/sophia.BoXW638B.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/solidity/solidity.js":"_astro/solidity.C0XJgDpv.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/tcl/tcl.js":"_astro/tcl.BPCeKgRr.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/sparql/sparql.js":"_astro/sparql.CBveH8Q-.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/scheme/scheme.js":"_astro/scheme.CVTFHbNW.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/st/st.js":"_astro/st.BTB-AL0W.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/redis/redis.js":"_astro/redis.B2dG_Tts.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/rust/rust.js":"_astro/rust.Bq4c2IFd.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/sql/sql.js":"_astro/sql.v6ECwVwu.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/scala/scala.js":"_astro/scala.BqvMzPJO.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/twig/twig.js":"_astro/twig.BLiTs6S6.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/vb/vb.js":"_astro/vb.NgIhl3Cq.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/typespec/typespec.js":"_astro/typespec.BAMRHA2x.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/xml/xml.js":"_astro/xml.BGTANJhV.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/yaml/yaml.js":"_astro/yaml.uw5ZFn6H.js","astro:scripts/page.js":"_astro/page.gH9HJ_Vs.js","/run/media/nikola/Developer/Developer/node_modules/@swup/overlay-theme/dist/index.modern.js":"_astro/index.modern.DpLP8u1C.js","/run/media/nikola/Developer/Developer/node_modules/@swup/scroll-plugin/dist/index.modern.js":"_astro/index.modern.ljjH5-f0.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/typescript/tsMode.js":"_astro/tsMode.BPx_K_j9.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/basic-languages/wgsl/wgsl.js":"_astro/wgsl.3wyC_xLI.js","/run/media/nikola/Developer/Developer/node_modules/astro/components/ViewTransitions.astro?astro&type=script&index=0&lang.ts":"_astro/ViewTransitions.astro_astro_type_script_index_0_lang.DSSDe5pU.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/css/cssMode.js":"_astro/cssMode.DPxyh2ED.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/html/htmlMode.js":"_astro/htmlMode.Bq9crBri.js","/run/media/nikola/Developer/Developer/node_modules/swup/dist/Swup.modern.js":"_astro/Swup.modern.BemQoQWS.js","/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/node_modules/@codeeditorland/wind/Target/Element/Editor.js":"_astro/Editor.rwyWjOsN.js","/run/media/nikola/Developer/Developer/node_modules/monaco-editor/esm/vs/language/json/jsonMode.js":"_astro/jsonMode.DAA4qnY5.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Layout/Base.astro?astro&type=script&index=1&lang.ts","document.documentElement.classList.remove(\"no-js\");document.documentElement.classList.add(\"js\");\n//# sourceMappingURL=Base.astro_astro_type_script_index_1_lang.D4DYKVOQ.js.map"]],"assets":["/_astro/page.gH9HJ_Vs.js","/file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/Editor/index.html","/file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/VSCode/index.html","/file:///run/media/nikola/Developer/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Target/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"Ie28arLHwtabO84YC475M1mixGMau5g5/olfyI+Uj40=","experimentalEnvGetSecretEnabled":false});

export { manifest };
//# sourceMappingURL=manifest_DtzvQdiA.mjs.map
