import*as l from"path";import*as i from"fs";import{fileURLToPath as n}from"url";import{createRequire as c,register as f}from"node:module";import{product as u,pkg as S}from"./bootstrap-meta.js";import"./bootstrap-node.js";import*as a from"./vs/base/common/performance.js";const d=c(import.meta.url),p=l.dirname(n(import.meta.url));if((process.env.ELECTRON_RUN_AS_NODE||process.versions.electron)&&f(`data:text/javascript;base64,${Buffer.from(`
	export async function resolve(specifier, context, nextResolve) {
		if (specifier === 'fs') {
			return {
				format: 'builtin',
				shortCircuit: true,
				url: 'node:original-fs'
			};
		}

		// Defer to the next hook in the chain, which would be the
		// Node.js default resolve if this is the last user-specified loader.
		return nextResolve(specifier, context);
	}`).toString("base64")}`,import.meta.url),globalThis._VSCODE_PRODUCT_JSON={...u},process.env.VSCODE_DEV)try{const e=d("../product.overrides.json");globalThis._VSCODE_PRODUCT_JSON=Object.assign(globalThis._VSCODE_PRODUCT_JSON,e)}catch{}globalThis._VSCODE_PACKAGE_JSON={...S},globalThis._VSCODE_FILE_ROOT=p;let t;function g(){return t||(t=m()),t}async function m(){a.mark("code/willLoadNls");let e,r;if(process.env.VSCODE_NLS_CONFIG)try{e=JSON.parse(process.env.VSCODE_NLS_CONFIG),e?.languagePack?.messagesFile?r=e.languagePack.messagesFile:e?.defaultMessagesFile&&(r=e.defaultMessagesFile),globalThis._VSCODE_NLS_LANGUAGE=e?.resolvedLanguage}catch(s){console.error(`Error reading VSCODE_NLS_CONFIG from environment: ${s}`)}if(!(process.env.VSCODE_DEV||!r)){try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await i.promises.readFile(r)).toString())}catch(s){if(console.error(`Error reading NLS messages file ${r}: ${s}`),e?.languagePack?.corruptMarkerFile)try{await i.promises.writeFile(e.languagePack.corruptMarkerFile,"corrupted")}catch(o){console.error(`Error writing corrupted NLS marker file: ${o}`)}if(e?.defaultMessagesFile&&e.defaultMessagesFile!==r)try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await i.promises.readFile(e.defaultMessagesFile)).toString())}catch(o){console.error(`Error reading default NLS messages file ${e.defaultMessagesFile}: ${o}`)}}return a.mark("code/didLoadNls"),e}}async function h(){await g()}export{h as bootstrapESM};
