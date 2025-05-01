import{escape as s}from"../../../../base/common/strings.js";import{localize as e}from"../../../../nls.js";const i=s(e("sendSystemInfo","Include my system information")),l=s(e("sendProcessInfo","Include my currently running processes")),n=s(e("sendWorkspaceInfo","Include my workspace metadata")),a=s(e("sendExtensions","Include my enabled extensions")),o=s(e("sendExperiments","Include A/B experiment info")),t=s(e("sendExtensionData","Include additional extension info")),d=s(e("acknowledgements","I acknowledge that my VS Code version is not updated and this issue may be closed.")),c=e({key:"reviewGuidanceLabel",comment:['{Locked="<a href="https://github.com/microsoft/vscode/wiki/Submitting-Bugs-and-Suggestions" target="_blank">"}','{Locked="</a>"}']},'Before you report an issue here please <a href="https://github.com/microsoft/vscode/wiki/Submitting-Bugs-and-Suggestions" target="_blank">review the guidance we provide</a>. Please complete the form in English.');var u=()=>`
<div id="update-banner" class="issue-reporter-update-banner hidden">
	<span class="update-banner-text" id="update-banner-text">
		<!-- To be dynamically filled -->
	</span>
</div>
<div class="issue-reporter" id="issue-reporter">
	<div id="english" class="input-group hidden">${s(e("completeInEnglish","Please complete the form in English."))}</div>

	<div id="review-guidance-help-text" class="input-group">${c}</div>

	<div class="section">
		<div class="input-group">
			<label class="inline-label" for="issue-type">${s(e("issueTypeLabel","This is a"))}</label>
			<select id="issue-type" class="inline-form-control">
				<!-- To be dynamically filled -->
			</select>
		</div>

		<div class="input-group" id="problem-source">
			<label class="inline-label" for="issue-source">${s(e("issueSourceLabel","For"))} <span class="required-input">*</span></label>
			<select id="issue-source" class="inline-form-control" required>
				<!-- To be dynamically filled -->
			</select>
			<div id="issue-source-empty-error" class="validation-error hidden" role="alert">${s(e("issueSourceEmptyValidation","An issue source is required."))}</div>
			<div id="problem-source-help-text" class="instructions hidden">${s(e("disableExtensionsLabelText","Try to reproduce the problem after {0}. If the problem only reproduces when extensions are active, it is likely an issue with an extension.")).replace("{0}",()=>`<span tabIndex=0 role="button" id="disableExtensions" class="workbenchCommand">${s(e("disableExtensions","disabling all extensions and reloading the window"))}</span>`)}
			</div>

			<div id="extension-selection">
				<label class="inline-label" for="extension-selector">${s(e("chooseExtension","Extension"))} <span class="required-input">*</span></label>
				<select id="extension-selector" class="inline-form-control">
					<!-- To be dynamically filled -->
				</select>
				<div id="extension-selection-validation-error" class="validation-error hidden" role="alert">${s(e("extensionWithNonstandardBugsUrl","The issue reporter is unable to create issues for this extension. Please visit {0} to report an issue.")).replace("{0}",()=>'<span tabIndex=0 role="button" id="extensionBugsLink" class="workbenchCommand"><!-- To be dynamically filled --></span>')}</div>
				<div id="extension-selection-validation-error-no-url" class="validation-error hidden" role="alert">
					${s(e("extensionWithNoBugsUrl","The issue reporter is unable to create issues for this extension, as it does not specify a URL for reporting issues. Please check the marketplace page of this extension to see if other instructions are available."))}
				</div>
			</div>
		</div>

		<div id="issue-title-container" class="input-group">
			<label class="inline-label" for="issue-title">${s(e("issueTitleLabel","Title"))} <span class="required-input">*</span></label>
			<input id="issue-title" type="text" class="inline-form-control" placeholder="${s(e("issueTitleRequired","Please enter a title."))}" required>
			<div id="issue-title-empty-error" class="validation-error hidden" role="alert">${s(e("titleEmptyValidation","A title is required."))}</div>
			<div id="issue-title-length-validation-error" class="validation-error hidden" role="alert">${s(e("titleLengthValidation","The title is too long."))}</div>
			<small id="similar-issues">
				<!-- To be dynamically filled -->
			</small>
		</div>

	</div>

	<div class="input-group description-section">
		<label for="description" id="issue-description-label">
			<!-- To be dynamically filled -->
		</label>
		<div class="instructions" id="issue-description-subtitle">
			<!-- To be dynamically filled -->
		</div>
		<div class="block-info-text">
			<textarea name="description" id="description" placeholder="${s(e("details","Please enter details."))}" required></textarea>
		</div>
		<div id="description-empty-error" class="validation-error hidden" role="alert">${s(e("descriptionEmptyValidation","A description is required."))}</div>
		<div id="description-short-error" class="validation-error hidden" role="alert">${s(e("descriptionTooShortValidation","Please provide a longer description."))}</div>
	</div>

	<div class="system-info" id="block-container">
		<div class="block block-extension-data">
			<input class="send-extension-data" aria-label="${t}" type="checkbox" id="includeExtensionData" checked/>
			<label class="extension-caption" id="extension-caption" for="includeExtensionData">
				${t}
				<span id="ext-loading" hidden></span>
				<span class="ext-parens" hidden>(</span><a href="#" class="showInfo" id="extension-id">${s(e("show","show"))}</a><span class="ext-parens" hidden>)</span>
				<a id="extension-data-download">${s(e("downloadExtensionData","Download Extension Data"))}</a>
			</label>
			<pre class="block-info" id="extension-data" placeholder="${s(e("extensionData","Extension does not have additional data to include."))}" style="white-space: pre-wrap; user-select: text;">
				<!-- To be dynamically filled -->
			</pre>
		</div>

		<div class="block block-system">
			<input class="sendData" aria-label="${i}" type="checkbox" id="includeSystemInfo" checked/>
			<label class="caption" for="includeSystemInfo">
				${i}
				(<a href="#" class="showInfo">${s(e("show","show"))}</a>)
			</label>
			<div class="block-info hidden" style="user-select: text;">
				<!-- To be dynamically filled -->
		</div>
		</div>
		<div class="block block-process">
			<input class="sendData" aria-label="${l}" type="checkbox" id="includeProcessInfo" checked/>
			<label class="caption" for="includeProcessInfo">
				${l}
				(<a href="#" class="showInfo">${s(e("show","show"))}</a>)
			</label>
			<pre class="block-info hidden" style="user-select: text;">
				<code>
				<!-- To be dynamically filled -->
				</code>
			</pre>
		</div>
		<div class="block block-workspace">
			<input class="sendData" aria-label="${n}" type="checkbox" id="includeWorkspaceInfo" checked/>
			<label class="caption" for="includeWorkspaceInfo">
				${n}
				(<a href="#" class="showInfo">${s(e("show","show"))}</a>)
			</label>
			<pre id="systemInfo" class="block-info hidden" style="user-select: text;">
				<code>
				<!-- To be dynamically filled -->
				</code>
			</pre>
		</div>
		<div class="block block-extensions">
			<input class="sendData" aria-label="${a}" type="checkbox" id="includeExtensions" checked/>
			<label class="caption" for="includeExtensions">
				${a}
				(<a href="#" class="showInfo">${s(e("show","show"))}</a>)
			</label>
			<div id="systemInfo" class="block-info hidden" style="user-select: text;">
				<!-- To be dynamically filled -->
			</div>
		</div>
		<div class="block block-experiments">
			<input class="sendData" aria-label="${o}" type="checkbox" id="includeExperiments" checked/>
			<label class="caption" for="includeExperiments">
				${o}
				(<a href="#" class="showInfo">${s(e("show","show"))}</a>)
			</label>
			<pre class="block-info hidden" style="user-select: text;">
				<!-- To be dynamically filled -->
			</pre>
		</div>
		<div class="block block-acknowledgements hidden" id="version-acknowledgements">
			<input class="sendData" aria-label="${d}" type="checkbox" id="includeAcknowledgement"/>
			<label class="caption" for="includeAcknowledgement">
				${d}
			</label>
		</div>
	</div>
</div>`;export{u as default};
