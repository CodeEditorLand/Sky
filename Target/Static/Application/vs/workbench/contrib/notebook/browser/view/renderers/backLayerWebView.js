import{getWindow as A}from"../../../../../../base/browser/dom.js";import{$5b as K}from"../../../../../../base/common/arrays.js";import{$8h as x,$1h as V}from"../../../../../../base/common/async.js";import{$4i as X}from"../../../../../../base/common/buffer.js";import{$cf as J}from"../../../../../../base/common/event.js";import{$4B as Y}from"../../../../../../base/common/mime.js";import{$7g as Q,Schemas as p,$Vg as R,$Wg as Z}from"../../../../../../base/common/network.js";import{$6o as ee}from"../../../../../../base/common/objects.js";import*as te from"../../../../../../base/common/path.js";import{$m as ie,$r as oe}from"../../../../../../base/common/platform.js";import{$ih as g,$hh as se,$ch as re,$jh as ne}from"../../../../../../base/common/resources.js";import{URI as b}from"../../../../../../base/common/uri.js";import*as C from"../../../../../../base/common/uuid.js";import{$xD as N}from"../../../../../../editor/common/languages.js";import{$yD as ae}from"../../../../../../editor/common/languages/language.js";import{$RPb as de}from"../../../../../../editor/common/languages/supports/tokenization.js";import{$Cdb as ue}from"../../../../../../editor/common/languages/textToHtmlTokenizer.js";import*as v from"../../../../../../nls.js";import{$aI as le}from"../../../../../../platform/actions/common/actions.js";import{$El as ce}from"../../../../../../platform/configuration/common/configuration.js";import{$Vn as he}from"../../../../../../platform/contextkey/common/contextkey.js";import{$ifb as pe}from"../../../../../../platform/contextview/browser/contextView.js";import{$bp as fe}from"../../../../../../platform/dialogs/common/dialogs.js";import{$6j as be}from"../../../../../../platform/files/common/files.js";import{$X$ as me}from"../../../../../../platform/opener/common/opener.js";import{$Ho as ge}from"../../../../../../platform/storage/common/storage.js";import{$Po as ke}from"../../../../../../platform/telemetry/common/telemetry.js";import{$wq as ve,$yq as we}from"../../../../../../platform/theme/common/colorRegistry.js";import{$Lt as ye,$St as Ie}from"../../../../../../platform/theme/common/themeService.js";import{$hl as S}from"../../../../../../platform/workspace/common/workspace.js";import{$LM as Ce}from"../../../../../../platform/workspace/common/workspaceTrust.js";import{CellEditState as Me}from"../../notebookBrowser.js";import{$STb as Ee}from"../notebookCellList.js";import{$VTb as $e}from"./webviewPreloads.js";import{$WTb as Oe}from"./webviewThemeMapping.js";import{$gTb as M}from"../../viewModel/markupCellViewModel.js";import{CellUri as xe}from"../../../common/notebookCommon.js";import{$XTb as Re}from"../../../common/notebookLoggingService.js";import{$Iyb as Se}from"../../../common/notebookService.js";import{$Yyb as We,$1yb as Pe}from"../../../../webview/browser/webview.js";import{$ZTb as Ge}from"../../../../webview/browser/webviewWindowDragMonitor.js";import{$4Tb as Ne,$3Tb as w}from"../../../../webview/common/webview.js";import{$hI as Be}from"../../../../../services/editor/common/editorGroupsService.js";import{$xX as Le}from"../../../../../services/environment/common/environmentService.js";import{$PX as Te}from"../../../../../services/path/common/pathService.js";var q=function(c,e,t,s){var r=arguments.length,i=r<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(c,e,t,s);else for(var n=c.length-1;n>=0;n--)(o=c[n])&&(i=(r<3?o(i):r>3?o(e,t,i):o(e,t))||i);return r>3&&i&&Object.defineProperty(e,t,i),i},l=function(c,e){return function(t,s){e(t,s,c)}},E;const Ue=/:([\d]+)(?::([\d]+))?$/,He=/line=(\d+)$/,De=/^(.*)#([^#]*)$/;let W=class extends Ie{static{E=this}static b(e){return this.a??=new Pe("notebook.backlayerWebview.origins",e),this.a}constructor(e,t,s,r,i,o,n,a,d,u,h,m,f,y,k,$,B,L,T,U,H,D,F,_,z){super(_),this.notebookEditor=e,this.F=t,this.notebookViewType=s,this.documentUri=r,this.G=i,this.H=o,this.I=n,this.J=a,this.L=d,this.M=u,this.N=h,this.O=m,this.P=f,this.Q=y,this.R=k,this.S=$,this.U=B,this.W=L,this.X=T,this.Y=U,this.Z=H,this.$=D,this.ab=F,this.bb=z,this.webview=void 0,this.insetMapping=new Map,this.pendingWebviewIdleCreationRequest=new Map,this.pendingWebviewIdleInsetMapping=new Map,this.c=new Map,this.markupPreviewMapping=new Map,this.f=new Set,this.g=new Map,this.j=void 0,this.m=this.B(new J),this.r=new Set,this.onMessage=this.m.event,this.s=!1,this.u=!0,this.D=C.$Rm(),this.cb("Creating backlayer webview for notebook"),this.element=document.createElement("div"),this.element.style.height="1400px",this.element.style.position="absolute",o&&(this.B(o),o.receiveMessageHandler=(O,I)=>!this.webview||this.s?Promise.resolve(!1):(this.Eb({__vscode_notebook_message:!0,type:"customRendererMessage",rendererId:O,message:I}),Promise.resolve(!0))),this.B($.onDidChangeTrust(O=>{const I=this.jb(this.lb(),void 0),j=this.gb(I.toString());this.webview?.setHtml(j)})),this.B(N.onDidChange(()=>{this.Eb({type:"tokenizedStylesChanged",css:G()})}))}updateOptions(e){this.G=e,this.db(),this.eb()}cb(e){this.ab.debug("BacklayerWebview",`${this.documentUri} (${this.F}) - ${e}`)}db(){this.Eb({type:"notebookStyles",styles:this.fb()})}eb(){this.Eb({type:"notebookOptions",options:{dragAndDropEnabled:this.G.dragAndDropEnabled},renderOptions:{lineLimit:this.G.outputLineLimit,outputScrolling:this.G.outputScrolling,outputWordWrap:this.G.outputWordWrap,linkifyFilePaths:this.G.outputLinkifyFilePaths,minimalError:this.G.minimalError}})}fb(){return{"notebook-output-left-margin":`${this.G.leftMargin+this.G.runGutter}px`,"notebook-output-width":`calc(100% - ${this.G.leftMargin+this.G.rightMargin+this.G.runGutter}px)`,"notebook-output-node-padding":`${this.G.outputNodePadding}px`,"notebook-run-gutter":`${this.G.runGutter}px`,"notebook-preview-node-padding":`${this.G.previewNodePadding}px`,"notebook-markdown-left-margin":`${this.G.markdownLeftMargin}px`,"notebook-output-node-left-padding":`${this.G.outputNodeLeftPadding}px`,"notebook-markdown-min-height":`${this.G.previewNodePadding*2}px`,"notebook-markup-font-size":typeof this.G.markupFontSize=="number"&&this.G.markupFontSize>0?`${this.G.markupFontSize}px`:`calc(${this.G.fontSize}px * 1.2)`,"notebook-markdown-line-height":typeof this.G.markdownLineHeight=="number"&&this.G.markdownLineHeight>0?`${this.G.markdownLineHeight}px`:"normal","notebook-cell-output-font-size":`${this.G.outputFontSize||this.G.fontSize}px`,"notebook-cell-output-line-height":`${this.G.outputLineHeight}px`,"notebook-cell-output-max-height":`${this.G.outputLineHeight*this.G.outputLineLimit+2}px`,"notebook-cell-output-font-family":this.G.outputFontFamily||this.G.fontFamily,"notebook-cell-markup-empty-content":v.localize(9512,null),"notebook-cell-renderer-not-found-error":v.localize(9513,null),"notebook-cell-renderer-fallbacks-exhausted":v.localize(9514,null),"notebook-markup-font-family":this.G.markupFontFamily}}gb(e){const t=this.hb(),s=this.ib(),r={lineLimit:this.G.outputLineLimit,outputScrolling:this.G.outputScrolling,outputWordWrap:this.G.outputWordWrap,linkifyFilePaths:this.G.outputLinkifyFilePaths,minimalError:this.G.minimalError},i=$e({...this.G,tokenizationCss:G()},{dragAndDropEnabled:this.G.dragAndDropEnabled},r,t,s,this.S.isWorkspaceTrusted(),this.D),o=this.U.getValue("notebook.experimental.enableCsp"),n=this.z(ve),a=this.z(we);return`
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${e}/" />
				${o?`<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${w} 'unsafe-inline' 'unsafe-eval';
					style-src ${w} 'unsafe-inline';
					img-src ${w} https: http: data:;
					font-src ${w} https:;
					connect-src https:;
					child-src https: data:;
				">`:""}
				<style nonce="${this.D}">
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
		</html>`}hb(){return this.L.getRenderers().map(e=>{const t={extends:e.entrypoint.extends,path:this.jb(e.entrypoint.path,e.extensionLocation).toString()};return{id:e.id,entrypoint:t,mimeTypes:e.mimeTypes,messaging:e.messaging!=="never"&&!!this.H,isBuiltin:e.isBuiltin}})}ib(){return Array.from(this.L.getStaticPreloads(this.notebookViewType),e=>({entrypoint:this.jb(e.entrypoint,e.extensionLocation).toString().toString()}))}jb(e,t){return Ne(e,t?.scheme===p.vscodeRemote?{isRemote:!0,authority:t.authority}:void 0)}postKernelMessage(e){this.Eb({__vscode_notebook_message:!0,type:"customKernelMessage",message:e})}kb(e){const t=this.g.get(e);return t?{cellInfo:this.insetMapping.get(t).cellInfo,output:t}:void 0}isResolved(){return!!this.webview}createWebview(e){const t=this.jb(this.lb(),void 0),s=this.gb(t.toString());return this.nb(s,e)}lb(){if(this.documentUri.scheme===p.untitled){const e=this.X.getWorkspaceFolder(this.documentUri);if(e)return e.uri;const t=this.X.getWorkspace().folders;if(t.length)return t[0].uri}return g(this.documentUri)}mb(){return this.documentUri.path.toLowerCase().endsWith(".ipynb")?oe?[]:[g(Q.asFileUri("vs/nls.js"))]:[]}nb(e,t){if(!A(this.element).document.body.contains(this.element))throw new Error("Element is already detached from the DOM tree");this.webview=this.ub(this.I,e),this.webview.mountTo(this.element,t),this.B(this.webview),this.B(new Ge(t,()=>this.webview));const s=new x;return this.B(this.webview.onFatalError(r=>{s.error(new Error(`Could not initialize webview: ${r.message}}`))})),this.B(this.webview.onMessage(async r=>{const i=r.message;if(!this.s&&i.__vscode_notebook_message)switch(i.type){case"initialized":{s.complete(),this.wb();break}case"initializedMarkup":{this.C?.requestId===i.requestId&&(this.C?.p.complete(),this.C=void 0);break}case"dimension":{for(const o of i.updates){const n=o.height;if(o.isOutput){const a=this.kb(o.id);if(a){const{cellInfo:d,output:u}=a;this.notebookEditor.updateOutputHeight(d,u,n,!!o.init,"webview#dimension"),this.notebookEditor.scheduleOutputHeightAck(d,o.id,n)}else if(o.init){const d=this.c.get(o.id);if(d){const u=this.pendingWebviewIdleInsetMapping.get(d);this.pendingWebviewIdleCreationRequest.delete(d),this.pendingWebviewIdleCreationRequest.delete(d);const h=u.cellInfo;this.g.set(o.id,d),this.insetMapping.set(d,u),this.notebookEditor.updateOutputHeight(h,d,n,!!o.init,"webview#dimension"),this.notebookEditor.scheduleOutputHeightAck(h,o.id,n)}this.c.delete(o.id)}{if(!o.init)continue;const d=this.g.get(o.id);if(!d)continue;const u=this.insetMapping.get(d);u.initialized=!0}}else this.notebookEditor.updateMarkupCellHeight(o.id,n,!!o.init)}break}case"mouseenter":{const o=this.kb(i.id);if(o){const n=this.notebookEditor.getCellByInfo(o.cellInfo);n&&(n.outputIsHovered=!0)}break}case"mouseleave":{const o=this.kb(i.id);if(o){const n=this.notebookEditor.getCellByInfo(o.cellInfo);n&&(n.outputIsHovered=!1)}break}case"outputFocus":{const o=this.kb(i.id);if(o){const n=this.notebookEditor.getCellByInfo(o.cellInfo);n&&(n.outputIsFocused=!0,this.notebookEditor.focusNotebookCell(n,"output",{outputId:o.output.model.outputId,skipReveal:!0,outputWebviewFocused:!0}))}break}case"outputBlur":{const o=this.kb(i.id);if(o){const n=this.notebookEditor.getCellByInfo(o.cellInfo);n&&(n.outputIsFocused=!1,n.inputInOutputIsFocused=!1)}break}case"scroll-ack":break;case"scroll-to-reveal":{this.notebookEditor.setScrollTop(i.scrollTop-Ee);break}case"did-scroll-wheel":{this.notebookEditor.triggerScroll({...i.payload,preventDefault:()=>{},stopPropagation:()=>{}});break}case"focus-editor":{const o=this.notebookEditor.getCellById(i.cellId);o&&(i.focusNext?this.notebookEditor.focusNextNotebookCell(o,"editor"):await this.notebookEditor.focusNotebookCell(o,"editor"));break}case"clicked-data-url":{this.tb(i);break}case"clicked-link":{if(R(i.href,p.command)){const o=b.parse(i.href);if(o.path==="workbench.action.openLargeOutput"){const n=o.query,a=this.Y.activeGroup;a&&a.activeEditor&&a.pinEditor(a.activeEditor),this.J.open(xe.generateCellOutputUriWithId(this.documentUri,n));return}if(o.path==="cellOutput.enableScrolling"){const n=o.query,a=this.g.get(n);a&&(this.bb.publicLog2("workbenchActionExecuted",{id:"notebook.cell.toggleOutputScrolling",from:"inlineLink"}),a.cellViewModel.outputsViewModels.forEach(d=>{d.model.metadata&&(d.model.metadata.scrollable=!0,d.resetRenderer())}));return}this.J.open(i.href,{fromUserGesture:!0,fromWorkspace:!0,allowCommands:["github-issues.authNow","workbench.extensions.search","workbench.action.openSettings","_notebook.selectKernel","jupyter.viewOutput","jupyter.createPythonEnvAndSelectController"]});return}if(Z(i.href,p.http,p.https,p.mailto))this.J.open(i.href,{fromUserGesture:!0,fromWorkspace:!0});else if(R(i.href,p.vscodeNotebookCell)){const o=b.parse(i.href);await this.pb(o)}else/^[\w\-]+:/.test(i.href)?te.$5(i.href)?this.rb(b.file(i.href)):this.rb(b.parse(i.href)):await this.qb(Fe(i.href));break}case"customKernelMessage":{this.m.fire({message:i.message});break}case"customRendererMessage":{this.H?.postMessage(i.rendererId,i.message);break}case"clickMarkupCell":{const o=this.notebookEditor.getCellById(i.cellId);o&&(i.shiftKey||(ie?i.metaKey:i.ctrlKey)?this.notebookEditor.toggleNotebookCellSelection(o,i.shiftKey):await this.notebookEditor.focusNotebookCell(o,"container",{skipReveal:!0}));break}case"contextMenuMarkupCell":{const o=this.notebookEditor.getCellById(i.cellId);if(o){await this.notebookEditor.focusNotebookCell(o,"container",{skipReveal:!0});const n=this.element.getBoundingClientRect();this.Q.showContextMenu({menuId:le.NotebookCellTitle,contextKeyService:this.R,getAnchor:()=>({x:n.x+i.clientX,y:n.y+i.clientY})})}break}case"toggleMarkupPreview":{const o=this.notebookEditor.getCellById(i.cellId);o&&!this.notebookEditor.creationOptions.isReadOnly&&(this.notebookEditor.setMarkupCellEditState(i.cellId,Me.Editing),await this.notebookEditor.focusNotebookCell(o,"editor",{skipReveal:!0}));break}case"mouseEnterMarkupCell":{const o=this.notebookEditor.getCellById(i.cellId);o instanceof M&&(o.cellIsHovered=!0);break}case"mouseLeaveMarkupCell":{const o=this.notebookEditor.getCellById(i.cellId);o instanceof M&&(o.cellIsHovered=!1);break}case"cell-drag-start":{this.notebookEditor.didStartDragMarkupCell(i.cellId,i);break}case"cell-drag":{this.notebookEditor.didDragMarkupCell(i.cellId,i);break}case"cell-drop":{this.notebookEditor.didDropMarkupCell(i.cellId,{dragOffsetY:i.dragOffsetY,ctrlKey:i.ctrlKey,altKey:i.altKey});break}case"cell-drag-end":{this.notebookEditor.didEndDragMarkupCell(i.cellId);break}case"renderedMarkup":{const o=this.notebookEditor.getCellById(i.cellId);o instanceof M&&(o.renderedHtml=i.html),this.sb(i.codeBlocks);break}case"renderedCellOutput":{this.sb(i.codeBlocks);break}case"outputResized":{this.notebookEditor.didResizeOutput(i.cellId);break}case"getOutputItem":{const n=this.kb(i.outputId)?.output.model.outputs.find(a=>a.mime===i.mime);this.Eb({type:"returnOutputItem",requestId:i.requestId,output:n?{mime:n.mime,valueBytes:n.data.buffer}:void 0});break}case"logRendererDebugMessage":{this.cb(`${i.message}${i.data?" "+JSON.stringify(i.data,null,4):""}`);break}case"notebookPerformanceMessage":{this.notebookEditor.updatePerformanceMetadata(i.cellId,i.executionId,i.duration,i.rendererId),i.outputSize&&i.rendererId==="vscode.builtin-renderer"&&this.ob(i.outputSize,i.duration);break}case"outputInputFocus":{const o=this.kb(i.id);if(o){const n=this.notebookEditor.getCellByInfo(o.cellInfo);n&&(n.inputInOutputIsFocused=i.inputFocused)}this.notebookEditor.didFocusOutputInputChange(i.inputFocused)}}})),s.p}ob(e,t){const s={outputSize:e,renderTime:t};this.bb.publicLog2("NotebookCellOutputRender",s)}pb(e){const t=e.path.length>0?e:this.documentUri,s=/(?:^|&)line=([^&]+)/.exec(e.query);let r;if(s){const n=parseInt(s[1],10);isNaN(n)||(r={selection:{startLineNumber:n,startColumn:1}})}const i=/(?:^|&)execution_count=([^&]+)/.exec(e.query);if(i){const n=parseInt(i[1],10);if(!isNaN(n)){const d=this.L.getNotebookTextModel(t)?.cells.slice().reverse().find(u=>u.internalMetadata.executionOrder===n);if(d?.uri)return this.J.open(d.uri,{fromUserGesture:!0,fromWorkspace:!0,editorOptions:r})}}const o=/\?line=(\d+)$/.exec(e.fragment);if(o){const n=parseInt(o[1],10);if(!isNaN(n)){const a=n+1,d=e.fragment.substring(0,o.index),u={selection:{startLineNumber:a,startColumn:1,endLineNumber:a,endColumn:1}};return this.J.open(t.with({fragment:d}),{fromUserGesture:!0,fromWorkspace:!0,editorOptions:u})}}return this.J.open(t,{fromUserGesture:!0,fromWorkspace:!0})}async qb(e){let t,s;const r=De.exec(e);if(r&&(e=r[1],s=r[2]),e.startsWith("/")){t=await this.$.fileURI(e);const i=this.X.getWorkspace().folders;i.length&&(t=t.with({scheme:i[0].uri.scheme,authority:i[0].uri.authority}))}else if(e.startsWith("~")){const i=await this.$.userHome();i&&(t=b.joinPath(i,e.substring(2)))}else if(this.documentUri.scheme===p.untitled){const i=this.X.getWorkspace().folders;if(!i.length)return;t=b.joinPath(i[0].uri,e)}else t=b.joinPath(g(this.documentUri),e);t&&(s&&(t=t.with({fragment:s})),this.rb(t))}rb(e){let t,s;const r=Ue.exec(e.path);r&&(e=e.with({path:e.path.slice(0,r.index),fragment:`L${r[0].slice(1)}`}),t=parseInt(r[1],10),s=parseInt(r[2],10));const i=He.exec(e.query);if(i){const n=parseInt(i[1],10);isNaN(n)||(t=n+1,s=1,e=e.with({fragment:`L${t}`}))}e=e.with({query:null});let o;for(const n of this.Y.groups){const a=n.editors.find(d=>d.resource&&re(d.resource,e,!0));if(a){o={group:n,editor:a};break}}if(o){const n=t!==void 0&&s!==void 0?{startLineNumber:t,startColumn:s}:void 0,a={selection:n};o.group.openEditor(o.editor,n?a:void 0)}else this.J.open(e,{fromUserGesture:!0,fromWorkspace:!0})}sb(e){for(const{id:t,value:s,lang:r}of e){const i=this.W.getLanguageIdByLanguageName(r);i&&ue(this.W,s,i).then(o=>{this.s||this.Eb({type:"tokenizedCodeBlock",html:o,codeBlockId:t})})}}async tb(e){if(typeof e.data!="string")return;const[t,s]=e.data.split(";base64,");if(!s||!t)return;const r=se(this.documentUri)===".interactive"?this.X.getWorkspace().folders[0]?.uri??await this.O.defaultFilePath():g(this.documentUri);let i;if(e.downloadName)i=e.downloadName;else{const d=t.replace(/^data:/,""),u=d&&Y(d);i=u?`download${u}`:"download"}const o=ne(r,i),n=await this.O.showSaveDialog({defaultUri:o});if(!n)return;const a=X(s);await this.P.writeFile(n,a),await this.J.open(n)}ub(e,t){this.j=this.vb();const s=e.createWebviewElement({origin:E.b(this.Z).getOrigin(this.notebookViewType,void 0),title:v.localize(9515,null),options:{purpose:"notebookRenderer",enableFindWidget:!1,transformCssVariables:Oe},contentOptions:{allowMultipleAPIAcquire:!0,allowScripts:!0,localResourceRoots:this.j},extension:void 0,providedViewType:"notebook.output"});return s.setHtml(t),s.setContextKeyService(this.R),s}vb(){const e=this.M.getWorkspace().folders.map(s=>s.uri),t=this.lb();return[this.L.getNotebookProviderResourceRoots(),this.L.getRenderers().map(s=>g(s.entrypoint.path)),...Array.from(this.L.getStaticPreloads(this.notebookViewType),s=>[g(s.entrypoint),...s.localResourceRoots]),e,t,this.mb()].flat()}wb(){this.r.clear(),this.t&&this.Cb(this.t);for(const[e,t]of this.insetMapping.entries())this.Eb({...t.cachedCreation,initiallyHidden:this.f.has(e)});if(!this.C?.isFirstInit){const e=[...this.markupPreviewMapping.values()];this.markupPreviewMapping.clear(),this.initializeMarkup(e)}this.db(),this.eb()}xb(e,t,s,r){if(this.s||"isOutputCollapsed"in e&&e.isOutputCollapsed)return!1;if(this.f.has(t))return!0;const i=this.insetMapping.get(t);return!(!i||r===i.cachedCreation.outputOffset&&s===i.cachedCreation.cellTop)}ackHeight(e){this.Eb({type:"ack-dimension",updates:e})}updateScrollTops(e,t){if(this.s)return;const s=K(e.map(r=>{const i=this.insetMapping.get(r.output);if(!i||!r.forceDisplay&&!this.xb(r.cell,r.output,r.cellTop,r.outputOffset))return;const o=i.outputId;return i.cachedCreation.cellTop=r.cellTop,i.cachedCreation.outputOffset=r.outputOffset,this.f.delete(r.output),{cellId:r.cell.id,outputId:o,cellTop:r.cellTop,outputOffset:r.outputOffset,forceDisplay:r.forceDisplay}}));!s.length&&!t.length||this.Eb({type:"view-scroll",widgets:s,markupCells:t})}async yb(e){this.s||this.markupPreviewMapping.has(e.cellId)||(this.markupPreviewMapping.set(e.cellId,e),this.Eb({type:"createMarkupCell",cell:e}))}async showMarkupPreview(e){if(this.s)return;const t=this.markupPreviewMapping.get(e.cellId);if(!t)return this.yb(e);const s=e.content===t.content,r=ee(e.metadata,t.metadata);(!s||!r||!t.visible)&&this.Eb({type:"showMarkupCell",id:e.cellId,handle:e.cellHandle,content:s?void 0:e.content,top:e.offset,metadata:r?void 0:e.metadata}),t.metadata=e.metadata,t.content=e.content,t.offset=e.offset,t.visible=!0}async hideMarkupPreviews(e){if(this.s)return;const t=[];for(const s of e){const r=this.markupPreviewMapping.get(s);r&&r.visible&&(t.push(s),r.visible=!1)}t.length&&this.Eb({type:"hideMarkupCells",ids:t})}async unhideMarkupPreviews(e){if(this.s)return;const t=[];for(const s of e){const r=this.markupPreviewMapping.get(s);r&&(r.visible||(r.visible=!0,t.push(s)))}this.Eb({type:"unhideMarkupCells",ids:t})}async deleteMarkupPreviews(e){if(!this.s){for(const t of e)this.markupPreviewMapping.has(t),this.markupPreviewMapping.delete(t);e.length&&this.Eb({type:"deleteMarkupCell",ids:e})}}async updateMarkupPreviewSelections(e){this.s||this.Eb({type:"updateSelectedMarkupCells",selectedCellIds:e.filter(t=>this.markupPreviewMapping.has(t))})}async initializeMarkup(e){if(this.s)return;this.C?.p.complete();const t=C.$Rm();this.C={p:new x,requestId:t,isFirstInit:this.u},this.u=!1;for(const s of e)this.markupPreviewMapping.set(s.cellId,s);return this.Eb({type:"initializeMarkup",cells:e,requestId:t}),this.C.p.p}zb(e,t){return t.type===1?e.renderer?.id===t.renderer.id:e.cachedCreation.type==="html"}requestCreateOutputWhenWebviewIdle(e,t,s,r){this.s||this.insetMapping.has(t.source)||this.pendingWebviewIdleCreationRequest.has(t.source)||this.pendingWebviewIdleInsetMapping.has(t.source)||this.pendingWebviewIdleCreationRequest.set(t.source,V(()=>{const{message:i,renderer:o,transfer:n}=this.Bb(e,t,s,r,!0,!0);this.Eb(i,n),this.pendingWebviewIdleInsetMapping.set(t.source,{outputId:i.outputId,versionId:t.source.model.versionId,cellInfo:e,renderer:o,cachedCreation:i}),this.c.set(i.outputId,t.source),this.pendingWebviewIdleCreationRequest.delete(t.source)}))}createOutput(e,t,s,r){if(this.s)return;const i=this.insetMapping.get(t.source);if(this.pendingWebviewIdleCreationRequest.get(t.source)?.dispose(),this.pendingWebviewIdleCreationRequest.delete(t.source),this.pendingWebviewIdleInsetMapping.delete(t.source),i&&this.c.delete(i.outputId),i&&this.zb(i,t)){this.f.delete(t.source),this.Eb({type:"showOutput",cellId:i.cellInfo.cellId,outputId:i.outputId,cellTop:s,outputOffset:r});return}const{message:o,renderer:n,transfer:a}=this.Bb(e,t,s,r,!1,!1);this.Eb(o,a),this.insetMapping.set(t.source,{outputId:o.outputId,versionId:t.source.model.versionId,cellInfo:e,renderer:n,cachedCreation:o}),this.f.delete(t.source),this.g.set(o.outputId,t.source)}Ab(e,t){if(t.startsWith("image")){const s=e.outputs.find(r=>r.mime==="text/plain")?.data.buffer;if(s?.length&&s?.length>0){const r=new TextDecoder().decode(s);return{...e.metadata,vscode_altText:r}}}return e.metadata}Bb(e,t,s,r,i,o){const n={type:"html",executionId:e.executionId,cellId:e.cellId,cellTop:s,outputOffset:r,left:0,requiredPreloads:[],createOnIdle:i},a=[];let d,u;if(t.type===1){const h=t.source.model;u=t.renderer;const m=h.outputs.find(k=>k.mime===t.mimeType),f=this.Ab(h,t.mimeType),y=P(m.data.buffer,a);d={...n,outputId:h.outputId,rendererId:t.renderer.id,content:{type:1,outputId:h.outputId,metadata:f,output:{mime:m.mime,valueBytes:y},allOutputs:h.outputs.map(k=>({mime:k.mime}))},initiallyHidden:o}}else d={...n,outputId:C.$Rm(),content:{type:t.type,htmlContent:t.htmlContent},initiallyHidden:o};return{message:d,renderer:u,transfer:a}}updateOutput(e,t,s,r){if(this.s)return;if(!this.insetMapping.has(t.source)){this.createOutput(e,t,s,r);return}const i=this.insetMapping.get(t.source);if(i.versionId===t.source.model.versionId)return;this.f.delete(t.source);let o;const n=[];if(t.type===1){const a=t.source.model,d=a.outputs.find(f=>f.mime===t.mimeType),u=a.appendedSinceVersion(i.versionId,t.mimeType),h=u?{valueBytes:u.buffer,previousVersion:i.versionId}:void 0,m=P(d.data.buffer,n);o={type:1,outputId:i.outputId,metadata:a.metadata,output:{mime:t.mimeType,valueBytes:m,appended:h},allOutputs:a.outputs.map(f=>({mime:f.mime}))}}this.Eb({type:"showOutput",cellId:i.cellInfo.cellId,outputId:i.outputId,cellTop:s,outputOffset:r,content:o},n),i.versionId=t.source.model.versionId}async copyImage(e){this.Eb({type:"copyImage",outputId:e.model.outputId,altOutputId:e.model.alternativeOutputId})}removeInsets(e){if(!this.s)for(const t of e){const s=this.insetMapping.get(t);if(!s)continue;const r=s.outputId;this.Eb({type:"clearOutput",rendererId:s.cachedCreation.rendererId,cellUri:s.cellInfo.cellUri.toString(),outputId:r,cellId:s.cellInfo.cellId}),this.insetMapping.delete(t),this.pendingWebviewIdleCreationRequest.get(t)?.dispose(),this.pendingWebviewIdleCreationRequest.delete(t),this.pendingWebviewIdleInsetMapping.delete(t),this.c.delete(r),this.g.delete(r)}}hideInset(e){if(this.s)return;const t=this.insetMapping.get(e);t&&(this.f.add(e),this.Eb({type:"hideOutput",outputId:t.outputId,cellId:t.cellInfo.cellId}))}focusWebview(){this.s||this.webview?.focus()}selectOutputContents(e){if(this.s)return;const t=e.outputsViewModels.find(r=>r.model.outputId===e.focusedOutputId),s=t?this.insetMapping.get(t)?.outputId:void 0;this.Eb({type:"select-output-contents",cellOrOutputId:s||e.id})}selectInputContents(e){if(this.s)return;const t=e.outputsViewModels.find(r=>r.model.outputId===e.focusedOutputId),s=t?this.insetMapping.get(t)?.outputId:void 0;this.Eb({type:"select-input-contents",cellOrOutputId:s||e.id})}focusOutput(e,t,s){this.s||(s||this.webview?.focus(),this.Eb({type:"focus-output",cellOrOutputId:e,alternateId:t}))}blurOutput(){this.s||this.Eb({type:"blur-output"})}async find(e,t){if(e==="")return this.Eb({type:"findStop",ownerID:t.ownerID}),[];const s=new Promise(i=>{const o=this.webview?.onMessage(n=>{n.message.type==="didFind"&&(i(n.message.matches),o?.dispose())})});return this.Eb({type:"find",query:e,options:t}),await s}findStop(e){this.Eb({type:"findStop",ownerID:e})}async findHighlightCurrent(e,t){const s=new Promise(i=>{const o=this.webview?.onMessage(n=>{n.message.type==="didFindHighlightCurrent"&&(i(n.message.offset),o?.dispose())})});return this.Eb({type:"findHighlightCurrent",index:e,ownerID:t}),await s}async findUnHighlightCurrent(e,t){this.Eb({type:"findUnHighlightCurrent",index:e,ownerID:t})}deltaCellOutputContainerClassNames(e,t,s){this.Eb({type:"decorations",cellId:e,addedClassNames:t,removedClassNames:s})}deltaMarkupPreviewClassNames(e,t,s){this.markupPreviewMapping.get(e)&&this.Eb({type:"markupDecorations",cellId:e,addedClassNames:t,removedClassNames:s})}updateOutputRenderers(){if(!this.webview)return;const e=this.hb();this.j=this.vb();const t=[...this.j||[],...this.t?[this.t.localResourceRoot]:[]];this.webview.localResourcesRoot=t,this.Eb({type:"updateRenderers",rendererData:e})}async updateKernelPreloads(e){if(this.s||e===this.t)return;const t=this.t;this.t=e,t&&t.preloadUris.length>0?this.webview?.reload():e&&this.Cb(e)}Cb(e){const t=[];for(const s of e.preloadUris){const r=this.N.isExtensionDevelopment&&(s.scheme==="http"||s.scheme==="https")?s:this.jb(s,void 0);this.r.has(r.toString())||(t.push({uri:r.toString(),originalUri:s.toString()}),this.r.add(r.toString()))}t.length&&this.Db(t)}Db(e){if(!this.webview)return;const t=[...this.j||[],...this.t?[this.t.localResourceRoot]:[]];this.webview.localResourcesRoot=t,this.Eb({type:"preload",resources:e})}Eb(e,t){this.s||this.webview?.postMessage(e,t)}dispose(){this.s=!0,this.webview?.dispose(),this.webview=void 0,this.notebookEditor=null,this.insetMapping.clear(),this.pendingWebviewIdleCreationRequest.clear(),super.dispose()}};W=E=q([l(6,We),l(7,me),l(8,Se),l(9,S),l(10,Le),l(11,fe),l(12,be),l(13,pe),l(14,he),l(15,Ce),l(16,ce),l(17,ae),l(18,S),l(19,Be),l(20,ge),l(21,Te),l(22,Re),l(23,ye),l(24,ke)],W);function P(c,e){if(c.byteLength===c.buffer.byteLength)return c;{const t=new Uint8Array(c);return e.push(t.buffer),t}}function G(){const c=N.getColorMap();return c?de(c):""}function Fe(c){try{return decodeURIComponent(c)}catch{return c}}export{W as $6Tb};
