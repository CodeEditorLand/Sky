import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_HEADER, i as decodeKey } from './chunks/astro/server_Ctvb7rCB.mjs';
import 'clsx';
import 'cookie';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

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
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
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
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
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
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
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

const manifest = deserializeManifest({"hrefRoot":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/","cacheDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/node_modules/.astro/","outDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/","srcDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/","publicDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Public/","buildClientDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/client/","buildServerDir":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/server/","adapterName":"","routes":[{"file":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/Editor/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/editor","isIndex":false,"type":"page","pattern":"^\\/Editor\\/?$","segments":[[{"content":"Editor","dynamic":false,"spread":false}]],"params":[],"component":"Source/pages/Editor.astro","pathname":"/Editor","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/VSCode/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/vscode","isIndex":false,"type":"page","pattern":"^\\/VSCode\\/?$","segments":[[{"content":"VSCode","dynamic":false,"spread":false}]],"params":[],"component":"Source/pages/VSCode.astro","pathname":"/VSCode","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"Source/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://editor.land","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:Source/pages/Editor@_@astro":"pages/editor.astro.mjs","\u0000@astro-page:Source/pages/VSCode@_@astro":"pages/vscode.astro.mjs","\u0000@astro-page:Source/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-manifest":"manifest_BpI7BNYo.mjs","@codeeditorland/wind/Target/Element/Page/Editor.js":"_astro/Editor.BjUruqJT.js","D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts":"_astro/Base.astro_astro_type_script_index_0_lang.C1wtB7vu.js","D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=1&lang.ts":"_astro/Base.astro_astro_type_script_index_1_lang.COYIp1nD.js","astro:scripts/page.js":"_astro/page.CO6Oifq5.js","D:/Developer/Application/CodeEditorLand/Land/Element/Wind/Target/Context/Action.js":"_astro/Action.CNmJEIj2.js","__vite-browser-external":"_astro/__vite-browser-external.FmFgRqLi.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/css/css.worker.js?worker":"_astro/css.worker.Dw9oJQ1P.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/html/html.worker.js?worker":"_astro/html.worker.DxFjFvRo.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js?worker":"_astro/ts.worker.DrYjkY6q.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker":"_astro/editor.worker.DMlKZ_qS.js","D:/Developer/Application/CodeEditorLand/Land/Element/Wind/Target/Script/Monaco/Theme/Active4D.json":"_astro/Active4D.BWvStk5T.js","D:/Developer/Application/CodeEditorLand/Land/Element/Wind/Target/Script/Monaco/Theme/Amoled.json":"_astro/Amoled.Ci6ZcdC2.js","D:/Developer/Application/CodeEditorLand/Land/Element/Wind/Target/Context/Action/Context.js":"_astro/Context.9hlU-mfz.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/abap/abap.js":"_astro/abap.LPLW346S.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/apex/apex.js":"_astro/apex.4-0VvSH5.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.js":"_astro/azcli.DPUMmPlX.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/bat/bat.js":"_astro/bat.C1Qbg1bV.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/bicep/bicep.js":"_astro/bicep.D-e-VSJi.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/cameligo/cameligo.js":"_astro/cameligo.CjUqTgqL.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/clojure/clojure.js":"_astro/clojure.BWsu6Kju.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/coffee/coffee.js":"_astro/coffee.DeC36AK3.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/cpp/cpp.js":"_astro/cpp.DcZnmBWT.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/csharp/csharp.js":"_astro/csharp.DqBXBMf0.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/csp/csp.js":"_astro/csp.CkO7y8ul.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/css/css.js":"_astro/css.OAcfVtED.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/cypher/cypher.js":"_astro/cypher.40UGrUjD.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/dart/dart.js":"_astro/dart.DmixyLor.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.js":"_astro/dockerfile.CayO4nTA.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/ecl/ecl.js":"_astro/ecl.DRrKCuVc.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/elixir/elixir.js":"_astro/elixir.J3qpp9mX.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/flow9/flow9.js":"_astro/flow9.DzW2c4Im.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/fsharp/fsharp.js":"_astro/fsharp.D00tn_6c.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/freemarker2/freemarker2.js":"_astro/freemarker2.DT-DgXUR.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/go/go.js":"_astro/go.NnNmgWK_.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/graphql/graphql.js":"_astro/graphql.C9_--VLF.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/handlebars/handlebars.js":"_astro/handlebars.AQZHcXm4.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/hcl/hcl.js":"_astro/hcl.BhbOULbp.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/html/html.js":"_astro/html.CK7E5qac.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/ini/ini.js":"_astro/ini.zR-_X5iG.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/java/java.js":"_astro/java.CSTjsyoZ.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/javascript/javascript.js":"_astro/javascript.CeukLPFh.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/typescript/typescript.js":"_astro/typescript.D2dnabrF.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/julia/julia.js":"_astro/julia.DioMOKVu.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/kotlin/kotlin.js":"_astro/kotlin.Dsb0PKmW.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/less/less.js":"_astro/less.CZYLoAVD.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/lexon/lexon.js":"_astro/lexon.d5JUiwNk.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/lua/lua.js":"_astro/lua.1Al72GG8.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/liquid/liquid.js":"_astro/liquid.Cn4E3u9O.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/m3/m3.js":"_astro/m3.hx1xCPC3.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/markdown/markdown.js":"_astro/markdown.DPGrH1xZ.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/mdx/mdx.js":"_astro/mdx.CK5DB6Dm.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/mips/mips.js":"_astro/mips.CYbZjkIm.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/msdax/msdax.js":"_astro/msdax.DAioKM5A.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/mysql/mysql.js":"_astro/mysql.7e9GUebS.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/objective-c/objective-c.js":"_astro/objective-c.BGf8QNjz.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/pascal/pascal.js":"_astro/pascal.hEDRz3un.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/pascaligo/pascaligo.js":"_astro/pascaligo.gqEhN6pG.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/perl/perl.js":"_astro/perl.CN8Ht9Vk.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/pgsql/pgsql.js":"_astro/pgsql.CRCqHQBx.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/php/php.js":"_astro/php.DTZrlAwe.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/pla/pla.js":"_astro/pla.CRmh4UcC.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/postiats/postiats.js":"_astro/postiats.Car2G7g8.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/powerquery/powerquery.js":"_astro/powerquery.BJKl8V3o.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/powershell/powershell.js":"_astro/powershell.Du7a_J7r.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/protobuf/protobuf.js":"_astro/protobuf.ChneWI0H.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/pug/pug.js":"_astro/pug.BH6LSJaf.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/python/python.js":"_astro/python.DUUQ8G3B.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/qsharp/qsharp.js":"_astro/qsharp.CU-Hxpxi.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/r/r.js":"_astro/r.Bw-W15zh.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/razor/razor.js":"_astro/razor.DbW0szbx.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/redis/redis.js":"_astro/redis.bY-X9-ol.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/redshift/redshift.js":"_astro/redshift.CMu3ubbS.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/restructuredtext/restructuredtext.js":"_astro/restructuredtext.KNkiWGNN.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/ruby/ruby.js":"_astro/ruby.dQWMhU86.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/rust/rust.js":"_astro/rust.BAcHhnEU.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/sb/sb.js":"_astro/sb.Bidr5w2z.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/scala/scala.js":"_astro/scala.imTtxsGY.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/scheme/scheme.js":"_astro/scheme.BY-WHKiB.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/scss/scss.js":"_astro/scss.NDoRP52C.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/shell/shell.js":"_astro/shell.DrIjotnh.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/solidity/solidity.js":"_astro/solidity.DTahNycF.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/sophia/sophia.js":"_astro/sophia.DtyrjGkZ.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/sparql/sparql.js":"_astro/sparql.CFuS5E3z.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/sql/sql.js":"_astro/sql.BRxcnbRv.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/st/st.js":"_astro/st.Dz4uh7MK.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/swift/swift.js":"_astro/swift.Digsrw1G.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/systemverilog/systemverilog.js":"_astro/systemverilog.7TDrkMau.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/tcl/tcl.js":"_astro/tcl.BtaFcnDi.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/twig/twig.js":"_astro/twig.Deid_oBs.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/typespec/typespec.js":"_astro/typespec.zUaxhbG8.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/vb/vb.js":"_astro/vb.DK0rKJzo.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/wgsl/wgsl.js":"_astro/wgsl.A_930Wpq.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/xml/xml.js":"_astro/xml.os6-AY1b.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/basic-languages/yaml/yaml.js":"_astro/yaml.BaFKTyaR.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/css/cssMode.js":"_astro/cssMode.3MuEX6mT.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/html/htmlMode.js":"_astro/htmlMode.DgxToMkK.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/json/jsonMode.js":"_astro/jsonMode.B4JWAkfe.js","D:/Developer/node_modules/.pnpm/monaco-editor@0.52.2/node_modules/monaco-editor/esm/vs/language/typescript/tsMode.js":"_astro/tsMode.BPN2mI8A.js","@astrojs/solid-js/client.js":"_astro/client.D_Xe2-Ix.js","D:/Developer/node_modules/.pnpm/astro@5.6.0_@types+node@22._8f961bbea30b604564a53d1cb13993c0/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":"_astro/ClientRouter.astro_astro_type_script_index_0_lang.uvFcqa6a.js","D:/Developer/Application/CodeEditorLand/Land/Element/Wind/Target/Element/Editor.js":"_astro/Editor.Dtm1NOkA.js","D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/VSCode.astro?astro&type=script&index=0&lang.ts":"_astro/VSCode.astro_astro_type_script_index_0_lang.1Xd1vP4O.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts","window.__TAURI_ISOLATION_HOOK__=_=>_;"],["D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=1&lang.ts","document.documentElement.classList.remove(\"no-js\"),document.documentElement.classList.add(\"js\");"]],"assets":["/_astro/page.CO6Oifq5.js","/file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/Editor/index.html","/file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/VSCode/index.html","/file:///D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Target/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"FIvId3ct3aW5X5VPGLT0s8cxOhIx1skYVB/CqMCa1Qg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
