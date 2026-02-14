import{getWindow as A}from"../../../../../../base/browser/dom.js";import{$$b as K}from"../../../../../../base/common/arrays.js";import{$ui as O,$ni as V}from"../../../../../../base/common/async.js";import{$qj as J}from"../../../../../../base/common/buffer.js";import{$xf as X}from"../../../../../../base/common/event.js";import{$6C as Y,$8C as Q}from"../../../../../../base/common/mime.js";import{$th as Z,Schemas as h,$ih as R,$jh as ee}from"../../../../../../base/common/network.js";import{$Gp as te}from"../../../../../../base/common/objects.js";import*as ie from"../../../../../../base/common/path.js";import{$n as oe,$s as se}from"../../../../../../base/common/platform.js";import{$Hh as g,$Gh as re,$Bh as ne,$Ih as ae}from"../../../../../../base/common/resources.js";import{URI as b}from"../../../../../../base/common/uri.js";import*as C from"../../../../../../base/common/uuid.js";import{$YF as W}from"../../../../../../editor/common/languages.js";import{$ZF as de}from"../../../../../../editor/common/languages/language.js";import{$SK as ue}from"../../../../../../editor/common/languages/supports/tokenization.js";import{$eib as le}from"../../../../../../editor/common/languages/textToHtmlTokenizer.js";import*as v from"../../../../../../nls.js";import{$qL as ce}from"../../../../../../platform/actions/common/actions.js";import{$0l as pe}from"../../../../../../platform/configuration/common/configuration.js";import{$ro as he}from"../../../../../../platform/contextkey/common/contextkey.js";import{$ijb as fe}from"../../../../../../platform/contextview/browser/contextView.js";import{$Op as be}from"../../../../../../platform/dialogs/common/dialogs.js";import{$vk as me}from"../../../../../../platform/files/common/files.js";import{$EP as ge}from"../../../../../../platform/opener/common/opener.js";import{$hp as ke}from"../../../../../../platform/storage/common/storage.js";import{$pp as ve}from"../../../../../../platform/telemetry/common/telemetry.js";import{$ar as we,$cr as ye}from"../../../../../../platform/theme/common/colorRegistry.js";import{$qu as Ie,$yu as Ce}from"../../../../../../platform/theme/common/themeService.js";import{$Ml as G}from"../../../../../../platform/workspace/common/workspace.js";import{$2H as Me}from"../../../../../../platform/workspace/common/workspaceTrust.js";import{CellEditState as Ee}from"../../notebookBrowser.js";import{$oHb as $e}from"../notebookCellList.js";import{$rHb as xe}from"./webviewPreloads.js";import{$sHb as Oe}from"./webviewThemeMapping.js";import{$8Gb as M}from"../../viewModel/markupCellViewModel.js";import{CellUri as Re}from"../../../common/notebookCommon.js";import{$RP as Ge}from"../../../common/notebookLoggingService.js";import{$CDb as Se}from"../../../common/notebookService.js";import{$SDb as He,$UDb as Pe}from"../../../../webview/browser/webview.js";import{$uHb as We}from"../../../../webview/browser/webviewWindowDragMonitor.js";import{$yHb as Ne,$xHb as w}from"../../../../webview/common/webview.js";import{$xL as Le}from"../../../../../services/editor/common/editorGroupsService.js";import{$HP as De}from"../../../../../services/environment/common/environmentService.js";import{$D1 as Be}from"../../../../../services/path/common/pathService.js";import{$CHb as Fe,$BHb as Ue,$EHb as Te}from"../../viewModel/cellOutputTextHelper.js";var q=function(c,e,t,o){var r=arguments.length,i=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(c,e,t,o);else for(var n=c.length-1;n>=0;n--)(s=c[n])&&(i=(r<3?s(i):r>3?s(e,t,i):s(e,t))||i);return r>3&&i&&Object.defineProperty(e,t,i),i},l=function(c,e){return function(t,o){e(t,o,c)}},E;const _e=/:([\d]+)(?::([\d]+))?$/,ze=/line=(\d+)$/,je=/^(.*)#([^#]*)$/;let S=class extends Ce{static{E=this}static b(e){return this.a??=new Pe("notebook.backlayerWebview.origins",e),this.a}constructor(e,t,o,r,i,s,n,a,d,u,p,m,f,y,k,$,N,L,D,B,F,U,T,_,z){super(_),this.notebookEditor=e,this.F=t,this.notebookViewType=o,this.documentUri=r,this.G=i,this.H=s,this.I=n,this.J=a,this.L=d,this.M=u,this.N=p,this.O=m,this.P=f,this.Q=y,this.R=k,this.S=$,this.U=N,this.W=L,this.X=D,this.Y=B,this.Z=F,this.$=U,this.ab=T,this.bb=z,this.webview=void 0,this.insetMapping=new Map,this.pendingWebviewIdleCreationRequest=new Map,this.pendingWebviewIdleInsetMapping=new Map,this.c=new Map,this.markupPreviewMapping=new Map,this.f=new Set,this.g=new Map,this.j=void 0,this.m=this.D(new X),this.r=new Set,this.onMessage=this.m.event,this.s=!1,this.u=!0,this.C=C.$ln(),this.cb("Creating backlayer webview for notebook"),this.element=document.createElement("div"),this.element.style.height="1400px",this.element.style.position="absolute",s&&(this.D(s),s.receiveMessageHandler=(x,I)=>!this.webview||this.s?Promise.resolve(!1):(this.Eb({__vscode_notebook_message:!0,type:"customRendererMessage",rendererId:x,message:I}),Promise.resolve(!0))),this.D($.onDidChangeTrust(x=>{const I=this.jb(this.lb(),void 0),j=this.gb(I.toString());this.webview?.setHtml(j)})),this.D(W.onDidChange(()=>{this.Eb({type:"tokenizedStylesChanged",css:P()})}))}updateOptions(e){this.G=e,this.db(),this.eb()}cb(e){this.ab.debug("BacklayerWebview",`${this.documentUri} (${this.F}) - ${e}`)}db(){this.Eb({type:"notebookStyles",styles:this.fb()})}eb(){this.Eb({type:"notebookOptions",options:{dragAndDropEnabled:this.G.dragAndDropEnabled},renderOptions:{lineLimit:this.G.outputLineLimit,outputScrolling:this.G.outputScrolling,outputWordWrap:this.G.outputWordWrap,linkifyFilePaths:this.G.outputLinkifyFilePaths,minimalError:this.G.minimalError}})}fb(){return{"notebook-output-left-margin":`${this.G.leftMargin+this.G.runGutter}px`,"notebook-output-width":`calc(100% - ${this.G.leftMargin+this.G.rightMargin+this.G.runGutter}px)`,"notebook-output-node-padding":`${this.G.outputNodePadding}px`,"notebook-run-gutter":`${this.G.runGutter}px`,"notebook-preview-node-padding":`${this.G.previewNodePadding}px`,"notebook-markdown-left-margin":`${this.G.markdownLeftMargin}px`,"notebook-output-node-left-padding":`${this.G.outputNodeLeftPadding}px`,"notebook-markdown-min-height":`${this.G.previewNodePadding*2}px`,"notebook-markup-font-size":typeof this.G.markupFontSize=="number"&&this.G.markupFontSize>0?`${this.G.markupFontSize}px`:`calc(${this.G.fontSize}px * 1.2)`,"notebook-markdown-line-height":typeof this.G.markdownLineHeight=="number"&&this.G.markdownLineHeight>0?`${this.G.markdownLineHeight}px`:"normal","notebook-cell-output-font-size":`${this.G.outputFontSize||this.G.fontSize}px`,"notebook-cell-output-line-height":`${this.G.outputLineHeight}px`,"notebook-cell-output-max-height":`${this.G.outputLineHeight*this.G.outputLineLimit+2}px`,"notebook-cell-output-font-family":this.G.outputFontFamily||this.G.fontFamily,"notebook-cell-markup-empty-content":v.localize(11214,null),"notebook-cell-renderer-not-found-error":v.localize(11215,null),"notebook-cell-renderer-fallbacks-exhausted":v.localize(11216,null),"notebook-markup-font-family":this.G.markupFontFamily}}gb(e){const t=this.hb(),o=this.ib(),r={lineLimit:this.G.outputLineLimit,outputScrolling:this.G.outputScrolling,outputWordWrap:this.G.outputWordWrap,linkifyFilePaths:this.G.outputLinkifyFilePaths,minimalError:this.G.minimalError},i=xe({...this.G,tokenizationCss:P()},{dragAndDropEnabled:this.G.dragAndDropEnabled},r,t,o,this.S.isWorkspaceTrusted(),this.C),s=this.U.getValue("notebook.experimental.enableCsp"),n=this.z(we),a=this.z(ye);return`
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${e}/" />
				${s?`<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${w} 'unsafe-inline' 'unsafe-eval';
					style-src ${w} 'unsafe-inline';
					img-src ${w} https: http: data:;
					font-src ${w} https:;
					connect-src https:;
					child-src https: data:;
				">`:""}
				<style nonce="${this.C}">
					::highlight(find-highlight) {
						background-color: var(--vscode-editor-findMatchBackground, ${a});
					}

					::highlight(current-find-highlight) {
						background-color: var(--vscode-editor-findMatchHighlightBackground, ${n});
					}

					#container .cell_container {
						width: 100%;
					}

					#container .output_container {
						width: 100%;
					}

					#container .cell_container.nb-insertHighlight div.output_container div.output {
						background-color: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground));
					}

					#container > div > div > div.output {
						font-size: var(--notebook-cell-output-font-size);
						width: var(--notebook-output-width);
						margin-left: var(--notebook-output-left-margin);
						background-color: var(--theme-notebook-output-background);
						padding-top: var(--notebook-output-node-padding);
						padding-right: var(--notebook-output-node-padding);
						padding-bottom: var(--notebook-output-node-padding);
						padding-left: var(--notebook-output-node-left-padding);
						box-sizing: border-box;
						border-top: none;
					}

					/* markdown */
					#container div.preview {
						width: 100%;
						padding-right: var(--notebook-preview-node-padding);
						padding-left: var(--notebook-markdown-left-margin);
						padding-top: var(--notebook-preview-node-padding);
						padding-bottom: var(--notebook-preview-node-padding);

						box-sizing: border-box;
						white-space: nowrap;
						overflow: hidden;
						white-space: initial;

						font-size: var(--notebook-markup-font-size);
						line-height: var(--notebook-markdown-line-height);
						color: var(--theme-ui-foreground);
						font-family: var(--notebook-markup-font-family);
					}

					#container div.preview.draggable {
						user-select: none;
						-webkit-user-select: none;
						-ms-user-select: none;
						cursor: grab;
					}

					#container div.preview.selected {
						background: var(--theme-notebook-cell-selected-background);
					}

					#container div.preview.dragging {
						background-color: var(--theme-background);
						opacity: 0.5 !important;
					}

					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex img,
					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex-block img {
						filter: brightness(0) invert(1)
					}

					#container .markup > div.nb-symbolHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .markup > div.nb-insertHighlight {
						background-color: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground));
					}

					#container .nb-symbolHighlight .output_container .output {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .markup > div.nb-multiCellHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .nb-multiCellHighlight .output_container .output {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .nb-chatGenerationHighlight .output_container .output {
						background-color: var(--vscode-notebook-selectedCellBackground);
					}

					#container > div.nb-cellDeleted .output_container {
						background-color: var(--theme-notebook-diff-removed-background);
					}

					#container > div.nb-cellAdded .output_container {
						background-color: var(--theme-notebook-diff-inserted-background);
					}

					#container > div > div:not(.preview) > div {
						overflow-x: auto;
					}

					#container .no-renderer-error {
						color: var(--vscode-editorError-foreground);
					}

					body {
						padding: 0px;
						height: 100%;
						width: 100%;
					}

					table, thead, tr, th, td, tbody {
						border: none;
						border-color: transparent;
						border-spacing: 0;
						border-collapse: collapse;
					}

					table, th, tr {
						vertical-align: middle;
						text-align: right;
					}

					thead {
						font-weight: bold;
						background-color: rgba(130, 130, 130, 0.16);
					}

					th, td {
						padding: 4px 8px;
					}

					tr:nth-child(even) {
						background-color: rgba(130, 130, 130, 0.08);
					}

					tbody th {
						font-weight: normal;
					}

					.find-match {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
					}

					.current-find-match {
						background-color: var(--vscode-editor-findMatchBackground);
					}

					#_defaultColorPalatte {
						color: var(--vscode-editor-findMatchHighlightBackground);
						background-color: var(--vscode-editor-findMatchBackground);
					}
				</style>
			</head>
			<body style="overflow: hidden;">
				<div id='findStart' tabIndex=-1></div>
				<div id='container' class="widgetarea" style="position: absolute;width:100%;top: 0px"></div>
				<div id="_defaultColorPalatte"></div>
				<script type="module">${i}<\/script>
			</body>
		</html>`}hb(){return this.L.getRenderers().map(e=>{const t={extends:e.entrypoint.extends,path:this.jb(e.entrypoint.path,e.extensionLocation).toString()};return{id:e.id,entrypoint:t,mimeTypes:e.mimeTypes,messaging:e.messaging!=="never"&&!!this.H,isBuiltin:e.isBuiltin}})}ib(){return Array.from(this.L.getStaticPreloads(this.notebookViewType),e=>({entrypoint:this.jb(e.entrypoint,e.extensionLocation).toString().toString()}))}jb(e,t){return Ne(e,t?.scheme===h.vscodeRemote?{isRemote:!0,authority:t.authority}:void 0)}postKernelMessage(e){this.Eb({__vscode_notebook_message:!0,type:"customKernelMessage",message:e})}kb(e){const t=this.g.get(e);return t?{cellInfo:this.insetMapping.get(t).cellInfo,output:t}:void 0}isResolved(){return!!this.webview}createWebview(e){const t=this.jb(this.lb(),void 0),o=this.gb(t.toString());return this.nb(o,e)}lb(){if(this.documentUri.scheme===h.untitled){const e=this.X.getWorkspaceFolder(this.documentUri);if(e)return e.uri;const t=this.X.getWorkspace().folders;if(t.length)return t[0].uri}return g(this.documentUri)}mb(){return this.documentUri.path.toLowerCase().endsWith(".ipynb")?se?[]:[g(Z.asFileUri("vs/nls.js"))]:[]}nb(e,t){if(!A(this.element).document.body.contains(this.element))throw new Error("Element is already detached from the DOM tree");this.webview=this.ub(this.I,e),this.webview.mountTo(this.element,t),this.D(this.webview),this.D(new We(t,()=>this.webview));const o=new O;return this.D(this.webview.onFatalError(r=>{o.error(new Error(`Could not initialize webview: ${r.message}}`))})),this.D(this.webview.onMessage(async r=>{const i=r.message;if(!this.s&&i.__vscode_notebook_message)switch(i.type){case"initialized":{o.complete(),this.wb();break}case"initializedMarkup":{this.w?.requestId===i.requestId&&(this.w?.p.complete(),this.w=void 0);break}case"dimension":{for(const s of i.updates){const n=s.height;if(s.isOutput){const a=this.kb(s.id);if(a){const{cellInfo:d,output:u}=a;this.notebookEditor.updateOutputHeight(d,u,n,!!s.init,"webview#dimension"),this.notebookEditor.scheduleOutputHeightAck(d,s.id,n)}else if(s.init){const d=this.c.get(s.id);if(d){const u=this.pendingWebviewIdleInsetMapping.get(d);this.pendingWebviewIdleCreationRequest.delete(d),this.pendingWebviewIdleCreationRequest.delete(d);const p=u.cellInfo;this.g.set(s.id,d),this.insetMapping.set(d,u),this.notebookEditor.updateOutputHeight(p,d,n,!!s.init,"webview#dimension"),this.notebookEditor.scheduleOutputHeightAck(p,s.id,n)}this.c.delete(s.id)}{if(!s.init)continue;const d=this.g.get(s.id);if(!d)continue;const u=this.insetMapping.get(d);u.initialized=!0}}else this.notebookEditor.updateMarkupCellHeight(s.id,n,!!s.init)}break}case"mouseenter":{const s=this.kb(i.id);if(s){const n=this.notebookEditor.getCellByInfo(s.cellInfo);n&&(n.outputIsHovered=!0)}break}case"mouseleave":{const s=this.kb(i.id);if(s){const n=this.notebookEditor.getCellByInfo(s.cellInfo);n&&(n.outputIsHovered=!1)}break}case"outputFocus":{const s=this.kb(i.id);if(s){const n=this.notebookEditor.getCellByInfo(s.cellInfo);n&&(n.outputIsFocused=!0,this.notebookEditor.focusNotebookCell(n,"output",{outputId:s.output.model.outputId,skipReveal:!0,outputWebviewFocused:!0}))}break}case"outputBlur":{const s=this.kb(i.id);if(s){const n=this.notebookEditor.getCellByInfo(s.cellInfo);n&&(n.outputIsFocused=!1,n.inputInOutputIsFocused=!1)}break}case"scroll-ack":break;case"scroll-to-reveal":{this.notebookEditor.setScrollTop(i.scrollTop-$e);break}case"did-scroll-wheel":{this.notebookEditor.triggerScroll({...i.payload,preventDefault:()=>{},stopPropagation:()=>{}});break}case"focus-editor":{const s=this.notebookEditor.getCellById(i.cellId);s&&(i.focusNext?this.notebookEditor.focusNextNotebookCell(s,"editor"):await this.notebookEditor.focusNotebookCell(s,"editor"));break}case"clicked-data-url":{this.tb(i);break}case"clicked-link":{if(R(i.href,h.command)){const s=b.parse(i.href);if(s.path==="workbench.action.openLargeOutput"){const n=s.query,a=this.Y.activeGroup;a&&a.activeEditor&&a.pinEditor(a.activeEditor),this.J.open(Re.generateCellOutputUriWithId(this.documentUri,n));return}if(s.path==="cellOutput.enableScrolling"){const n=s.query,a=this.g.get(n);a&&(this.bb.publicLog2("workbenchActionExecuted",{id:"notebook.cell.toggleOutputScrolling",from:"inlineLink"}),a.cellViewModel.outputsViewModels.forEach(d=>{d.model.metadata&&(d.model.metadata.scrollable=!0,d.resetRenderer())}));return}this.J.open(i.href,{fromUserGesture:!0,fromWorkspace:!0,allowCommands:["github-issues.authNow","workbench.extensions.search","workbench.action.openSettings","_notebook.selectKernel","jupyter.viewOutput","jupyter.createPythonEnvAndSelectController"]});return}if(ee(i.href,h.http,h.https,h.mailto))this.J.open(i.href,{fromUserGesture:!0,fromWorkspace:!0});else if(R(i.href,h.vscodeNotebookCell)){const s=b.parse(i.href);await this.pb(s)}else/^[\w\-]+:/.test(i.href)?ie.$8(i.href)?this.rb(b.file(i.href)):this.rb(b.parse(i.href)):await this.qb(qe(i.href));break}case"customKernelMessage":{this.m.fire({message:i.message});break}case"customRendererMessage":{this.H?.postMessage(i.rendererId,i.message);break}case"clickMarkupCell":{const s=this.notebookEditor.getCellById(i.cellId);s&&(i.shiftKey||(oe?i.metaKey:i.ctrlKey)?this.notebookEditor.toggleNotebookCellSelection(s,i.shiftKey):await this.notebookEditor.focusNotebookCell(s,"container",{skipReveal:!0}));break}case"contextMenuMarkupCell":{const s=this.notebookEditor.getCellById(i.cellId);if(s){await this.notebookEditor.focusNotebookCell(s,"container",{skipReveal:!0});const n=this.element.getBoundingClientRect();this.Q.showContextMenu({menuId:ce.NotebookCellTitle,contextKeyService:this.R,getAnchor:()=>({x:n.x+i.clientX,y:n.y+i.clientY})})}break}case"toggleMarkupPreview":{const s=this.notebookEditor.getCellById(i.cellId);s&&!this.notebookEditor.creationOptions.isReadOnly&&(this.notebookEditor.setMarkupCellEditState(i.cellId,Ee.Editing),await this.notebookEditor.focusNotebookCell(s,"editor",{skipReveal:!0}));break}case"mouseEnterMarkupCell":{const s=this.notebookEditor.getCellById(i.cellId);s instanceof M&&(s.cellIsHovered=!0);break}case"mouseLeaveMarkupCell":{const s=this.notebookEditor.getCellById(i.cellId);s instanceof M&&(s.cellIsHovered=!1);break}case"cell-drag-start":{this.notebookEditor.didStartDragMarkupCell(i.cellId,i);break}case"cell-drag":{this.notebookEditor.didDragMarkupCell(i.cellId,i);break}case"cell-drop":{this.notebookEditor.didDropMarkupCell(i.cellId,{dragOffsetY:i.dragOffsetY,ctrlKey:i.ctrlKey,altKey:i.altKey});break}case"cell-drag-end":{this.notebookEditor.didEndDragMarkupCell(i.cellId);break}case"renderedMarkup":{const s=this.notebookEditor.getCellById(i.cellId);s instanceof M&&(s.renderedHtml=i.html),this.sb(i.codeBlocks);break}case"renderedCellOutput":{this.sb(i.codeBlocks);break}case"outputResized":{this.notebookEditor.didResizeOutput(i.cellId);break}case"getOutputItem":{const n=this.kb(i.outputId)?.output.model.outputs.find(a=>a.mime===i.mime);this.Eb({type:"returnOutputItem",requestId:i.requestId,output:n?{mime:n.mime,valueBytes:n.data.buffer}:void 0});break}case"logRendererDebugMessage":{this.cb(`${i.message}${i.data?" "+JSON.stringify(i.data,null,4):""}`);break}case"notebookPerformanceMessage":{this.notebookEditor.updatePerformanceMetadata(i.cellId,i.executionId,i.duration,i.rendererId),i.outputSize&&i.rendererId==="vscode.builtin-renderer"&&this.ob(i.outputSize,i.duration);break}case"outputInputFocus":{const s=this.kb(i.id);if(s){const n=this.notebookEditor.getCellByInfo(s.cellInfo);n&&(n.inputInOutputIsFocused=i.inputFocused)}this.notebookEditor.didFocusOutputInputChange(i.inputFocused)}}})),o.p}ob(e,t){const o={outputSize:e,renderTime:t};this.bb.publicLog2("NotebookCellOutputRender",o)}pb(e){const t=e.path.length>0?e:this.documentUri,o=/(?:^|&)line=([^&]+)/.exec(e.query);let r;if(o){const n=parseInt(o[1],10);isNaN(n)||(r={selection:{startLineNumber:n,startColumn:1}})}const i=/(?:^|&)execution_count=([^&]+)/.exec(e.query);if(i){const n=parseInt(i[1],10);if(!isNaN(n)){const d=this.L.getNotebookTextModel(t)?.cells.slice().reverse().find(u=>u.internalMetadata.executionOrder===n);if(d?.uri)return this.J.open(d.uri,{fromUserGesture:!0,fromWorkspace:!0,editorOptions:r})}}const s=/\?line=(\d+)$/.exec(e.fragment);if(s){const n=parseInt(s[1],10);if(!isNaN(n)){const a=n+1,d=e.fragment.substring(0,s.index),u={selection:{startLineNumber:a,startColumn:1,endLineNumber:a,endColumn:1}};return this.J.open(t.with({fragment:d}),{fromUserGesture:!0,fromWorkspace:!0,editorOptions:u})}}return this.J.open(t,{fromUserGesture:!0,fromWorkspace:!0})}async qb(e){let t,o;const r=je.exec(e);if(r&&(e=r[1],o=r[2]),e.startsWith("/")){t=await this.$.fileURI(e);const i=this.X.getWorkspace().folders;i.length&&(t=t.with({scheme:i[0].uri.scheme,authority:i[0].uri.authority}))}else if(e.startsWith("~")){const i=await this.$.userHome();i&&(t=b.joinPath(i,e.substring(2)))}else if(this.documentUri.scheme===h.untitled){const i=this.X.getWorkspace().folders;if(!i.length)return;t=b.joinPath(i[0].uri,e)}else t=b.joinPath(g(this.documentUri),e);t&&(o&&(t=t.with({fragment:o})),this.rb(t))}rb(e){let t,o;const r=_e.exec(e.path);r&&(e=e.with({path:e.path.slice(0,r.index),fragment:`L${r[0].slice(1)}`}),t=parseInt(r[1],10),o=parseInt(r[2],10));const i=ze.exec(e.query);if(i){const n=parseInt(i[1],10);isNaN(n)||(t=n+1,o=1,e=e.with({fragment:`L${t}`}))}e=e.with({query:null});let s;for(const n of this.Y.groups){const a=n.editors.find(d=>d.resource&&ne(d.resource,e,!0));if(a){s={group:n,editor:a};break}}if(s){const n=t!==void 0&&o!==void 0?{startLineNumber:t,startColumn:o}:void 0,a={selection:n};s.group.openEditor(s.editor,n?a:void 0)}else this.J.open(e,{fromUserGesture:!0,fromWorkspace:!0})}sb(e){for(const{id:t,value:o,lang:r}of e){const i=this.W.getLanguageIdByLanguageName(r);i&&le(this.W,o,i).then(s=>{this.s||this.Eb({type:"tokenizedCodeBlock",html:s,codeBlockId:t})})}}async tb(e){if(typeof e.data!="string")return;const[t,o]=e.data.split(";base64,");if(!o||!t)return;const r=re(this.documentUri)===".interactive"?this.X.getWorkspace().folders[0]?.uri??await this.O.defaultFilePath():g(this.documentUri);let i;if(e.downloadName)i=e.downloadName;else{const d=t.replace(/^data:/,""),u=d&&Y(d);i=u?`download${u}`:"download"}const s=ae(r,i),n=await this.O.showSaveDialog({defaultUri:s});if(!n)return;const a=J(o);await this.P.writeFile(n,a),await this.J.open(n)}ub(e,t){this.j=this.vb();const o=e.createWebviewElement({origin:E.b(this.Z).getOrigin(this.notebookViewType,void 0),title:v.localize(11217,null),options:{purpose:"notebookRenderer",enableFindWidget:!1,transformCssVariables:Oe},contentOptions:{allowMultipleAPIAcquire:!0,allowScripts:!0,localResourceRoots:this.j},extension:void 0,providedViewType:"notebook.output"});return o.setHtml(t),o.setContextKeyService(this.R),o}vb(){const e=this.M.getWorkspace().folders.map(o=>o.uri),t=this.lb();return[this.L.getNotebookProviderResourceRoots(),this.L.getRenderers().map(o=>g(o.entrypoint.path)),...Array.from(this.L.getStaticPreloads(this.notebookViewType),o=>[g(o.entrypoint),...o.localResourceRoots]),e,t,this.mb()].flat()}wb(){this.r.clear(),this.t&&this.Cb(this.t);for(const[e,t]of this.insetMapping.entries())this.Eb({...t.cachedCreation,initiallyHidden:this.f.has(e)});if(!this.w?.isFirstInit){const e=[...this.markupPreviewMapping.values()];this.markupPreviewMapping.clear(),this.initializeMarkup(e)}this.db(),this.eb()}xb(e,t,o,r){if(this.s||"isOutputCollapsed"in e&&e.isOutputCollapsed)return!1;if(this.f.has(t))return!0;const i=this.insetMapping.get(t);return!(!i||r===i.cachedCreation.outputOffset&&o===i.cachedCreation.cellTop)}ackHeight(e){this.Eb({type:"ack-dimension",updates:e})}updateScrollTops(e,t){if(this.s)return;const o=K(e.map(r=>{const i=this.insetMapping.get(r.output);if(!i||!r.forceDisplay&&!this.xb(r.cell,r.output,r.cellTop,r.outputOffset))return;const s=i.outputId;return i.cachedCreation.cellTop=r.cellTop,i.cachedCreation.outputOffset=r.outputOffset,this.f.delete(r.output),{cellId:r.cell.id,outputId:s,cellTop:r.cellTop,outputOffset:r.outputOffset,forceDisplay:r.forceDisplay}}));!o.length&&!t.length||this.Eb({type:"view-scroll",widgets:o,markupCells:t})}async yb(e){this.s||this.markupPreviewMapping.has(e.cellId)||(this.markupPreviewMapping.set(e.cellId,e),this.Eb({type:"createMarkupCell",cell:e}))}async showMarkupPreview(e){if(this.s)return;const t=this.markupPreviewMapping.get(e.cellId);if(!t)return this.yb(e);const o=e.content===t.content,r=te(e.metadata,t.metadata);(!o||!r||!t.visible)&&this.Eb({type:"showMarkupCell",id:e.cellId,handle:e.cellHandle,content:o?void 0:e.content,top:e.offset,metadata:r?void 0:e.metadata}),t.metadata=e.metadata,t.content=e.content,t.offset=e.offset,t.visible=!0}async hideMarkupPreviews(e){if(this.s)return;const t=[];for(const o of e){const r=this.markupPreviewMapping.get(o);r&&r.visible&&(t.push(o),r.visible=!1)}t.length&&this.Eb({type:"hideMarkupCells",ids:t})}async unhideMarkupPreviews(e){if(this.s)return;const t=[];for(const o of e){const r=this.markupPreviewMapping.get(o);r&&(r.visible||(r.visible=!0,t.push(o)))}this.Eb({type:"unhideMarkupCells",ids:t})}async deleteMarkupPreviews(e){if(!this.s){for(const t of e)this.markupPreviewMapping.has(t),this.markupPreviewMapping.delete(t);e.length&&this.Eb({type:"deleteMarkupCell",ids:e})}}async updateMarkupPreviewSelections(e){this.s||this.Eb({type:"updateSelectedMarkupCells",selectedCellIds:e.filter(t=>this.markupPreviewMapping.has(t))})}async initializeMarkup(e){if(this.s)return;this.w?.p.complete();const t=C.$ln();this.w={p:new O,requestId:t,isFirstInit:this.u},this.u=!1;for(const o of e)this.markupPreviewMapping.set(o.cellId,o);return this.Eb({type:"initializeMarkup",cells:e,requestId:t}),this.w.p.p}zb(e,t){return t.type===1?e.renderer?.id===t.renderer.id:e.cachedCreation.type==="html"}requestCreateOutputWhenWebviewIdle(e,t,o,r){this.s||this.insetMapping.has(t.source)||this.pendingWebviewIdleCreationRequest.has(t.source)||this.pendingWebviewIdleInsetMapping.has(t.source)||this.pendingWebviewIdleCreationRequest.set(t.source,V(()=>{const{message:i,renderer:s,transfer:n}=this.Bb(e,t,o,r,!0,!0);this.Eb(i,n),this.pendingWebviewIdleInsetMapping.set(t.source,{outputId:i.outputId,versionId:t.source.model.versionId,cellInfo:e,renderer:s,cachedCreation:i}),this.c.set(i.outputId,t.source),this.pendingWebviewIdleCreationRequest.delete(t.source)}))}createOutput(e,t,o,r){if(this.s)return;const i=this.insetMapping.get(t.source);if(this.pendingWebviewIdleCreationRequest.get(t.source)?.dispose(),this.pendingWebviewIdleCreationRequest.delete(t.source),this.pendingWebviewIdleInsetMapping.delete(t.source),i&&this.c.delete(i.outputId),i&&this.zb(i,t)){this.f.delete(t.source),this.Eb({type:"showOutput",cellId:i.cellInfo.cellId,outputId:i.outputId,cellTop:o,outputOffset:r});return}const{message:s,renderer:n,transfer:a}=this.Bb(e,t,o,r,!1,!1);this.Eb(s,a),this.insetMapping.set(t.source,{outputId:s.outputId,versionId:t.source.model.versionId,cellInfo:e,renderer:n,cachedCreation:s}),this.f.delete(t.source),this.g.set(s.outputId,t.source)}Ab(e,t){if(t.startsWith("image")){const o=e.outputs.find(r=>r.mime==="text/plain")?.data.buffer;if(o?.length&&o?.length>0){const r=new TextDecoder().decode(o);return{...e.metadata,vscode_altText:r}}}return e.metadata}Bb(e,t,o,r,i,s){const n={type:"html",executionId:e.executionId,cellId:e.cellId,cellTop:o,outputOffset:r,left:0,requiredPreloads:[],createOnIdle:i},a=[];let d,u;if(t.type===1){const p=t.source.model;u=t.renderer;const m=p.outputs.find(k=>k.mime===t.mimeType),f=this.Ab(p,t.mimeType),y=H(m.data.buffer,a);d={...n,outputId:p.outputId,rendererId:t.renderer.id,content:{type:1,outputId:p.outputId,metadata:f,output:{mime:m.mime,valueBytes:y},allOutputs:p.outputs.map(k=>({mime:k.mime}))},initiallyHidden:s}}else d={...n,outputId:C.$ln(),content:{type:t.type,htmlContent:t.htmlContent},initiallyHidden:s};return{message:d,renderer:u,transfer:a}}updateOutput(e,t,o,r){if(this.s)return;if(!this.insetMapping.has(t.source)){this.createOutput(e,t,o,r);return}const i=this.insetMapping.get(t.source);if(i.versionId===t.source.model.versionId)return;this.f.delete(t.source);let s;const n=[];if(t.type===1){const a=t.source.model,d=a.outputs.find(f=>f.mime===t.mimeType),u=a.appendedSinceVersion(i.versionId,t.mimeType),p=u?{valueBytes:u.buffer,previousVersion:i.versionId}:void 0,m=H(d.data.buffer,n);s={type:1,outputId:i.outputId,metadata:a.metadata,output:{mime:t.mimeType,valueBytes:m,appended:p},allOutputs:a.outputs.map(f=>({mime:f.mime}))}}this.Eb({type:"showOutput",cellId:i.cellInfo.cellId,outputId:i.outputId,cellTop:o,outputOffset:r,content:s},n),i.versionId=t.source.model.versionId}async copyImage(e){const t=[],o=e.model;for(const r of o.outputs)if(Te.includes(r.mime)){const i=Q(r.mime)?Ue(e).text:Fe(r.mime,r);t.push({mimeType:r.mime,content:i})}this.Eb({type:"copyImage",outputId:e.model.outputId,altOutputId:e.model.alternativeOutputId,textAlternates:t.length>0?t:void 0})}removeInsets(e){if(!this.s)for(const t of e){const o=this.insetMapping.get(t);if(!o)continue;const r=o.outputId;this.Eb({type:"clearOutput",rendererId:o.cachedCreation.rendererId,cellUri:o.cellInfo.cellUri.toString(),outputId:r,cellId:o.cellInfo.cellId}),this.insetMapping.delete(t),this.pendingWebviewIdleCreationRequest.get(t)?.dispose(),this.pendingWebviewIdleCreationRequest.delete(t),this.pendingWebviewIdleInsetMapping.delete(t),this.c.delete(r),this.g.delete(r)}}hideInset(e){if(this.s)return;const t=this.insetMapping.get(e);t&&(this.f.add(e),this.Eb({type:"hideOutput",outputId:t.outputId,cellId:t.cellInfo.cellId}))}focusWebview(){this.s||this.webview?.focus()}selectOutputContents(e){if(this.s)return;const t=e.outputsViewModels.find(r=>r.model.outputId===e.focusedOutputId),o=t?this.insetMapping.get(t)?.outputId:void 0;this.Eb({type:"select-output-contents",cellOrOutputId:o||e.id})}selectInputContents(e){if(this.s)return;const t=e.outputsViewModels.find(r=>r.model.outputId===e.focusedOutputId),o=t?this.insetMapping.get(t)?.outputId:void 0;this.Eb({type:"select-input-contents",cellOrOutputId:o||e.id})}focusOutput(e,t,o){this.s||(o||this.webview?.focus(),this.Eb({type:"focus-output",cellOrOutputId:e,alternateId:t}))}blurOutput(){this.s||this.Eb({type:"blur-output"})}async find(e,t){if(e==="")return this.Eb({type:"findStop",ownerID:t.ownerID}),[];const o=new Promise(i=>{const s=this.webview?.onMessage(n=>{n.message.type==="didFind"&&(i(n.message.matches),s?.dispose())})});return this.Eb({type:"find",query:e,options:t}),await o}findStop(e){this.Eb({type:"findStop",ownerID:e})}async findHighlightCurrent(e,t){const o=new Promise(i=>{const s=this.webview?.onMessage(n=>{n.message.type==="didFindHighlightCurrent"&&(i(n.message.offset),s?.dispose())})});return this.Eb({type:"findHighlightCurrent",index:e,ownerID:t}),await o}async findUnHighlightCurrent(e,t){this.Eb({type:"findUnHighlightCurrent",index:e,ownerID:t})}deltaCellOutputContainerClassNames(e,t,o){this.Eb({type:"decorations",cellId:e,addedClassNames:t,removedClassNames:o})}deltaMarkupPreviewClassNames(e,t,o){this.markupPreviewMapping.get(e)&&this.Eb({type:"markupDecorations",cellId:e,addedClassNames:t,removedClassNames:o})}updateOutputRenderers(){if(!this.webview)return;const e=this.hb();this.j=this.vb();const t=[...this.j||[],...this.t?[this.t.localResourceRoot]:[]];this.webview.localResourcesRoot=t,this.Eb({type:"updateRenderers",rendererData:e})}async updateKernelPreloads(e){if(this.s||e===this.t)return;const t=this.t;this.t=e,t&&t.preloadUris.length>0?this.webview?.reload():e&&this.Cb(e)}Cb(e){const t=[];for(const o of e.preloadUris){const r=this.N.isExtensionDevelopment&&(o.scheme==="http"||o.scheme==="https")?o:this.jb(o,void 0);this.r.has(r.toString())||(t.push({uri:r.toString(),originalUri:o.toString()}),this.r.add(r.toString()))}t.length&&this.Db(t)}Db(e){if(!this.webview)return;const t=[...this.j||[],...this.t?[this.t.localResourceRoot]:[]];this.webview.localResourcesRoot=t,this.Eb({type:"preload",resources:e})}Eb(e,t){this.s||this.webview?.postMessage(e,t)}dispose(){this.s=!0,this.webview?.dispose(),this.webview=void 0,this.notebookEditor=null,this.insetMapping.clear(),this.pendingWebviewIdleCreationRequest.clear(),super.dispose()}};S=E=q([l(6,He),l(7,ge),l(8,Se),l(9,G),l(10,De),l(11,be),l(12,me),l(13,fe),l(14,he),l(15,Me),l(16,pe),l(17,de),l(18,G),l(19,Le),l(20,ke),l(21,Be),l(22,Ge),l(23,Ie),l(24,ve)],S);function H(c,e){if(c.byteLength===c.buffer.byteLength)return c;{const t=new Uint8Array(c);return e.push(t.buffer),t}}function P(){const c=W.getColorMap();return c?ue(c):""}function qe(c){try{return decodeURIComponent(c)}catch{return c}}export{S as $FHb};
