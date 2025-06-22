import*as l from"path";import*as s from"fs";import{fileURLToPath as n}from"url";import{createRequire as c,register as f}from"node:module";import{$O as u,$P as S}from"./bootstrap-meta.js";import"./bootstrap-node.js";import*as i from"./vs/base/common/performance.js";const d=c(import.meta.url),g=l.dirname(n(import.meta.url));(process.env.ELECTRON_RUN_AS_NODE||process.versions.electron)&&f(`data:text/javascript;base64,${Buffer.from(`
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
	}`).toString("base64")}`,import.meta.url);globalThis._VSCODE_PRODUCT_JSON={...u};if(process.env.VSCODE_DEV)try{const e=d("../product.overrides.json");globalThis._VSCODE_PRODUCT_JSON=Object.assign(globalThis._VSCODE_PRODUCT_JSON,e)}catch{}globalThis._VSCODE_PACKAGE_JSON={...S};globalThis._VSCODE_FILE_ROOT=g;let o;function p(){return o||(o=_()),o}async function _(){i.$T("code/willLoadNls");let e,r;if(process.env.VSCODE_NLS_CONFIG)try{e=JSON.parse(process.env.VSCODE_NLS_CONFIG),e?.languagePack?.messagesFile?r=e.languagePack.messagesFile:e?.defaultMessagesFile&&(r=e.defaultMessagesFile),globalThis._VSCODE_NLS_LANGUAGE=e?.resolvedLanguage}catch{}if(!(process.env.VSCODE_DEV||!r)){try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await s.promises.readFile(r)).toString())}catch{if(e?.languagePack?.corruptMarkerFile)try{await s.promises.writeFile(e.languagePack.corruptMarkerFile,"corrupted")}catch{}if(e?.defaultMessagesFile&&e.defaultMessagesFile!==r)try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await s.promises.readFile(e.defaultMessagesFile)).toString())}catch{}}return i.$T("code/didLoadNls"),e}}async function C(){await p()}export{C as $V};
