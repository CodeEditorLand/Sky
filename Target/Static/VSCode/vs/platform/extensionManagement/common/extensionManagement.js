/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize, localize2 } from '../../../nls.js';
import { Extensions } from '../../configuration/common/configurationRegistry.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Registry } from '../../registry/common/platform.js';
export const EXTENSION_IDENTIFIER_PATTERN = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
export const EXTENSION_IDENTIFIER_REGEX = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
export const WEB_EXTENSION_TAG = '__web_extension';
export const EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = 'skipWalkthrough';
export const EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT = 'skipPublisherTrust';
export const EXTENSION_INSTALL_SOURCE_CONTEXT = 'extensionInstallSource';
export const EXTENSION_INSTALL_DEP_PACK_CONTEXT = 'dependecyOrPackExtensionInstall';
export const EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = 'clientTargetPlatform';
export var ExtensionInstallSource;
(function (ExtensionInstallSource) {
    ExtensionInstallSource["COMMAND"] = "command";
    ExtensionInstallSource["SETTINGS_SYNC"] = "settingsSync";
})(ExtensionInstallSource || (ExtensionInstallSource = {}));
export function TargetPlatformToString(targetPlatform) {
    switch (targetPlatform) {
        case "win32-x64" /* TargetPlatform.WIN32_X64 */: return 'Windows 64 bit';
        case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return 'Windows ARM';
        case "linux-x64" /* TargetPlatform.LINUX_X64 */: return 'Linux 64 bit';
        case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return 'Linux ARM 64';
        case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return 'Linux ARM';
        case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return 'Alpine Linux 64 bit';
        case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return 'Alpine ARM 64';
        case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return 'Mac';
        case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return 'Mac Silicon';
        case "web" /* TargetPlatform.WEB */: return 'Web';
        case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
        case "unknown" /* TargetPlatform.UNKNOWN */: return "unknown" /* TargetPlatform.UNKNOWN */;
        case "undefined" /* TargetPlatform.UNDEFINED */: return "undefined" /* TargetPlatform.UNDEFINED */;
    }
}
export function toTargetPlatform(targetPlatform) {
    switch (targetPlatform) {
        case "win32-x64" /* TargetPlatform.WIN32_X64 */: return "win32-x64" /* TargetPlatform.WIN32_X64 */;
        case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
        case "linux-x64" /* TargetPlatform.LINUX_X64 */: return "linux-x64" /* TargetPlatform.LINUX_X64 */;
        case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
        case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
        case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
        case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
        case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
        case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
        case "web" /* TargetPlatform.WEB */: return "web" /* TargetPlatform.WEB */;
        case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
        default: return "unknown" /* TargetPlatform.UNKNOWN */;
    }
}
export function getTargetPlatform(platform, arch) {
    switch (platform) {
        case 3 /* Platform.Windows */:
            if (arch === 'x64') {
                return "win32-x64" /* TargetPlatform.WIN32_X64 */;
            }
            if (arch === 'arm64') {
                return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 2 /* Platform.Linux */:
            if (arch === 'x64') {
                return "linux-x64" /* TargetPlatform.LINUX_X64 */;
            }
            if (arch === 'arm64') {
                return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
            }
            if (arch === 'arm') {
                return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 'alpine':
            if (arch === 'x64') {
                return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
            }
            if (arch === 'arm64') {
                return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 1 /* Platform.Mac */:
            if (arch === 'x64') {
                return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
            }
            if (arch === 'arm64') {
                return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
            }
            return "unknown" /* TargetPlatform.UNKNOWN */;
        case 0 /* Platform.Web */: return "web" /* TargetPlatform.WEB */;
    }
}
export function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
    // Not a web extension in web target platform
    return productTargetPlatform === "web" /* TargetPlatform.WEB */ && !allTargetPlatforms.includes("web" /* TargetPlatform.WEB */);
}
export function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
    // Not compatible when extension is not a web extension in web target platform
    if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
        return false;
    }
    // Compatible when extension target platform is not defined
    if (extensionTargetPlatform === "undefined" /* TargetPlatform.UNDEFINED */) {
        return true;
    }
    // Compatible when extension target platform is universal
    if (extensionTargetPlatform === "universal" /* TargetPlatform.UNIVERSAL */) {
        return true;
    }
    // Not compatible when extension target platform is unknown
    if (extensionTargetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
        return false;
    }
    // Compatible when extension and product target platforms matches
    if (extensionTargetPlatform === productTargetPlatform) {
        return true;
    }
    return false;
}
export function isIExtensionIdentifier(thing) {
    return thing
        && typeof thing === 'object'
        && typeof thing.id === 'string'
        && (!thing.uuid || typeof thing.uuid === 'string');
}
export var SortBy;
(function (SortBy) {
    SortBy["NoneOrRelevance"] = "NoneOrRelevance";
    SortBy["LastUpdatedDate"] = "LastUpdatedDate";
    SortBy["Title"] = "Title";
    SortBy["PublisherName"] = "PublisherName";
    SortBy["InstallCount"] = "InstallCount";
    SortBy["PublishedDate"] = "PublishedDate";
    SortBy["AverageRating"] = "AverageRating";
    SortBy["WeightedRating"] = "WeightedRating";
})(SortBy || (SortBy = {}));
export var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["Default"] = 0] = "Default";
    SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
    SortOrder[SortOrder["Descending"] = 2] = "Descending";
})(SortOrder || (SortOrder = {}));
export var FilterType;
(function (FilterType) {
    FilterType["Category"] = "Category";
    FilterType["ExtensionId"] = "ExtensionId";
    FilterType["ExtensionName"] = "ExtensionName";
    FilterType["ExcludeWithFlags"] = "ExcludeWithFlags";
    FilterType["Featured"] = "Featured";
    FilterType["SearchText"] = "SearchText";
    FilterType["Tag"] = "Tag";
    FilterType["Target"] = "Target";
})(FilterType || (FilterType = {}));
export var StatisticType;
(function (StatisticType) {
    StatisticType["Install"] = "install";
    StatisticType["Uninstall"] = "uninstall";
})(StatisticType || (StatisticType = {}));
export var InstallOperation;
(function (InstallOperation) {
    InstallOperation[InstallOperation["None"] = 1] = "None";
    InstallOperation[InstallOperation["Install"] = 2] = "Install";
    InstallOperation[InstallOperation["Update"] = 3] = "Update";
    InstallOperation[InstallOperation["Migrate"] = 4] = "Migrate";
})(InstallOperation || (InstallOperation = {}));
export const IExtensionGalleryService = createDecorator('extensionGalleryService');
export var ExtensionGalleryErrorCode;
(function (ExtensionGalleryErrorCode) {
    ExtensionGalleryErrorCode["Timeout"] = "Timeout";
    ExtensionGalleryErrorCode["Cancelled"] = "Cancelled";
    ExtensionGalleryErrorCode["Failed"] = "Failed";
    ExtensionGalleryErrorCode["DownloadFailedWriting"] = "DownloadFailedWriting";
    ExtensionGalleryErrorCode["Offline"] = "Offline";
})(ExtensionGalleryErrorCode || (ExtensionGalleryErrorCode = {}));
export class ExtensionGalleryError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = code;
    }
}
export var ExtensionManagementErrorCode;
(function (ExtensionManagementErrorCode) {
    ExtensionManagementErrorCode["NotFound"] = "NotFound";
    ExtensionManagementErrorCode["Unsupported"] = "Unsupported";
    ExtensionManagementErrorCode["Deprecated"] = "Deprecated";
    ExtensionManagementErrorCode["Malicious"] = "Malicious";
    ExtensionManagementErrorCode["Incompatible"] = "Incompatible";
    ExtensionManagementErrorCode["IncompatibleApi"] = "IncompatibleApi";
    ExtensionManagementErrorCode["IncompatibleTargetPlatform"] = "IncompatibleTargetPlatform";
    ExtensionManagementErrorCode["ReleaseVersionNotFound"] = "ReleaseVersionNotFound";
    ExtensionManagementErrorCode["Invalid"] = "Invalid";
    ExtensionManagementErrorCode["Download"] = "Download";
    ExtensionManagementErrorCode["DownloadSignature"] = "DownloadSignature";
    ExtensionManagementErrorCode["DownloadFailedWriting"] = "DownloadFailedWriting";
    ExtensionManagementErrorCode["UpdateMetadata"] = "UpdateMetadata";
    ExtensionManagementErrorCode["Extract"] = "Extract";
    ExtensionManagementErrorCode["Scanning"] = "Scanning";
    ExtensionManagementErrorCode["ScanningExtension"] = "ScanningExtension";
    ExtensionManagementErrorCode["ReadRemoved"] = "ReadRemoved";
    ExtensionManagementErrorCode["UnsetRemoved"] = "UnsetRemoved";
    ExtensionManagementErrorCode["Delete"] = "Delete";
    ExtensionManagementErrorCode["Rename"] = "Rename";
    ExtensionManagementErrorCode["IntializeDefaultProfile"] = "IntializeDefaultProfile";
    ExtensionManagementErrorCode["AddToProfile"] = "AddToProfile";
    ExtensionManagementErrorCode["InstalledExtensionNotFound"] = "InstalledExtensionNotFound";
    ExtensionManagementErrorCode["PostInstall"] = "PostInstall";
    ExtensionManagementErrorCode["CorruptZip"] = "CorruptZip";
    ExtensionManagementErrorCode["IncompleteZip"] = "IncompleteZip";
    ExtensionManagementErrorCode["PackageNotSigned"] = "PackageNotSigned";
    ExtensionManagementErrorCode["SignatureVerificationInternal"] = "SignatureVerificationInternal";
    ExtensionManagementErrorCode["SignatureVerificationFailed"] = "SignatureVerificationFailed";
    ExtensionManagementErrorCode["NotAllowed"] = "NotAllowed";
    ExtensionManagementErrorCode["Gallery"] = "Gallery";
    ExtensionManagementErrorCode["Cancelled"] = "Cancelled";
    ExtensionManagementErrorCode["Unknown"] = "Unknown";
    ExtensionManagementErrorCode["Internal"] = "Internal";
})(ExtensionManagementErrorCode || (ExtensionManagementErrorCode = {}));
export var ExtensionSignatureVerificationCode;
(function (ExtensionSignatureVerificationCode) {
    ExtensionSignatureVerificationCode["NotSigned"] = "NotSigned";
    ExtensionSignatureVerificationCode["Success"] = "Success";
    ExtensionSignatureVerificationCode["RequiredArgumentMissing"] = "RequiredArgumentMissing";
    ExtensionSignatureVerificationCode["InvalidArgument"] = "InvalidArgument";
    ExtensionSignatureVerificationCode["PackageIsUnreadable"] = "PackageIsUnreadable";
    ExtensionSignatureVerificationCode["UnhandledException"] = "UnhandledException";
    ExtensionSignatureVerificationCode["SignatureManifestIsMissing"] = "SignatureManifestIsMissing";
    ExtensionSignatureVerificationCode["SignatureManifestIsUnreadable"] = "SignatureManifestIsUnreadable";
    ExtensionSignatureVerificationCode["SignatureIsMissing"] = "SignatureIsMissing";
    ExtensionSignatureVerificationCode["SignatureIsUnreadable"] = "SignatureIsUnreadable";
    ExtensionSignatureVerificationCode["CertificateIsUnreadable"] = "CertificateIsUnreadable";
    ExtensionSignatureVerificationCode["SignatureArchiveIsUnreadable"] = "SignatureArchiveIsUnreadable";
    ExtensionSignatureVerificationCode["FileAlreadyExists"] = "FileAlreadyExists";
    ExtensionSignatureVerificationCode["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
    ExtensionSignatureVerificationCode["SignatureArchiveHasSameSignatureFile"] = "SignatureArchiveHasSameSignatureFile";
    ExtensionSignatureVerificationCode["PackageIntegrityCheckFailed"] = "PackageIntegrityCheckFailed";
    ExtensionSignatureVerificationCode["SignatureIsInvalid"] = "SignatureIsInvalid";
    ExtensionSignatureVerificationCode["SignatureManifestIsInvalid"] = "SignatureManifestIsInvalid";
    ExtensionSignatureVerificationCode["SignatureIntegrityCheckFailed"] = "SignatureIntegrityCheckFailed";
    ExtensionSignatureVerificationCode["EntryIsMissing"] = "EntryIsMissing";
    ExtensionSignatureVerificationCode["EntryIsTampered"] = "EntryIsTampered";
    ExtensionSignatureVerificationCode["Untrusted"] = "Untrusted";
    ExtensionSignatureVerificationCode["CertificateRevoked"] = "CertificateRevoked";
    ExtensionSignatureVerificationCode["SignatureIsNotValid"] = "SignatureIsNotValid";
    ExtensionSignatureVerificationCode["UnknownError"] = "UnknownError";
    ExtensionSignatureVerificationCode["PackageIsInvalidZip"] = "PackageIsInvalidZip";
    ExtensionSignatureVerificationCode["SignatureArchiveHasTooManyEntries"] = "SignatureArchiveHasTooManyEntries";
})(ExtensionSignatureVerificationCode || (ExtensionSignatureVerificationCode = {}));
export class ExtensionManagementError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = code;
    }
}
export const IExtensionManagementService = createDecorator('extensionManagementService');
export const DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
export const ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
export const IGlobalExtensionEnablementService = createDecorator('IGlobalExtensionEnablementService');
export const IExtensionTipsService = createDecorator('IExtensionTipsService');
export const IAllowedExtensionsService = createDecorator('IAllowedExtensionsService');
export async function computeSize(location, fileService) {
    let stat;
    try {
        stat = await fileService.resolve(location);
    }
    catch (e) {
        if (e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
            return 0;
        }
        throw e;
    }
    if (stat.children) {
        const sizes = await Promise.all(stat.children.map(c => computeSize(c.resource, fileService)));
        return sizes.reduce((r, s) => r + s, 0);
    }
    return stat.size ?? 0;
}
export const ExtensionsLocalizedLabel = localize2('extensions', "Extensions");
export const PreferencesLocalizedLabel = localize2('preferences', 'Preferences');
export const UseUnpkgResourceApiConfigKey = 'extensions.gallery.useUnpkgResourceApi';
export const AllowedExtensionsConfigKey = 'extensions.allowed';
Registry.as(Extensions.Configuration)
    .registerConfiguration({
    id: 'extensions',
    order: 30,
    title: localize('extensionsConfigurationTitle', "Extensions"),
    type: 'object',
    properties: {
        [AllowedExtensionsConfigKey]: {
            // Note: Type is set only to object because to support policies generation during build time, where single type is expected.
            type: 'object',
            markdownDescription: localize('extensions.allowed', "Specify a list of extensions that are allowed to use. This helps maintain a secure and consistent development environment by restricting the use of unauthorized extensions. For more information on how to configure this setting, please visit the [Configure Allowed Extensions](https://code.visualstudio.com/docs/setup/enterprise#_configure-allowed-extensions) section."),
            default: '*',
            defaultSnippets: [{
                    body: {},
                    description: localize('extensions.allowed.none', "No extensions are allowed."),
                }, {
                    body: {
                        '*': true
                    },
                    description: localize('extensions.allowed.all', "All extensions are allowed."),
                }],
            scope: 1 /* ConfigurationScope.APPLICATION */,
            policy: {
                name: 'AllowedExtensions',
                minimumVersion: '1.96',
                description: localize('extensions.allowed.policy', "Specify a list of extensions that are allowed to use. This helps maintain a secure and consistent development environment by restricting the use of unauthorized extensions. More information: https://code.visualstudio.com/docs/setup/enterprise#_configure-allowed-extensions"),
            },
            additionalProperties: false,
            patternProperties: {
                '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                    anyOf: [
                        {
                            type: ['boolean', 'string'],
                            enum: [true, false, 'stable'],
                            description: localize('extensions.allow.description', "Allow or disallow the extension."),
                            enumDescriptions: [
                                localize('extensions.allowed.enable.desc', "Extension is allowed."),
                                localize('extensions.allowed.disable.desc', "Extension is not allowed."),
                                localize('extensions.allowed.disable.stable.desc', "Allow only stable versions of the extension."),
                            ],
                        },
                        {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: localize('extensions.allow.version.description', "Allow or disallow specific versions of the extension. To specifcy a platform specific version, use the format `platform@1.2.3`, e.g. `win32-x64@1.2.3`. Supported platforms are `win32-x64`, `win32-arm64`, `linux-x64`, `linux-arm64`, `linux-armhf`, `alpine-x64`, `alpine-arm64`, `darwin-x64`, `darwin-arm64`"),
                        },
                    ]
                },
                '([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                    type: ['boolean', 'string'],
                    enum: [true, false, 'stable'],
                    description: localize('extension.publisher.allow.description', "Allow or disallow all extensions from the publisher."),
                    enumDescriptions: [
                        localize('extensions.publisher.allowed.enable.desc', "All extensions from the publisher are allowed."),
                        localize('extensions.publisher.allowed.disable.desc', "All extensions from the publisher are not allowed."),
                        localize('extensions.publisher.allowed.disable.stable.desc', "Allow only stable versions of the extensions from the publisher."),
                    ],
                },
                '\\*': {
                    type: 'boolean',
                    enum: [true, false],
                    description: localize('extensions.allow.all.description', "Allow or disallow all extensions."),
                    enumDescriptions: [
                        localize('extensions.allow.all.enable', "Allow all extensions."),
                        localize('extensions.allow.all.disable', "Disallow all extensions.")
                    ],
                }
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbk1hbmFnZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFTaEcsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0RCxPQUFPLEVBQXNCLFVBQVUsRUFBMEIsTUFBTSxxREFBcUQsQ0FBQztBQUc3SCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRTdELE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLDJEQUEyRCxDQUFDO0FBQ3hHLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLElBQUksTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDbkYsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7QUFDbkQsTUFBTSxDQUFDLE1BQU0sMENBQTBDLEdBQUcsaUJBQWlCLENBQUM7QUFDNUUsTUFBTSxDQUFDLE1BQU0sOENBQThDLEdBQUcsb0JBQW9CLENBQUM7QUFDbkYsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQUcsd0JBQXdCLENBQUM7QUFDekUsTUFBTSxDQUFDLE1BQU0sa0NBQWtDLEdBQUcsaUNBQWlDLENBQUM7QUFDcEYsTUFBTSxDQUFDLE1BQU0sZ0RBQWdELEdBQUcsc0JBQXNCLENBQUM7QUFFdkYsTUFBTSxDQUFOLElBQWtCLHNCQUdqQjtBQUhELFdBQWtCLHNCQUFzQjtJQUN2Qyw2Q0FBbUIsQ0FBQTtJQUNuQix3REFBOEIsQ0FBQTtBQUMvQixDQUFDLEVBSGlCLHNCQUFzQixLQUF0QixzQkFBc0IsUUFHdkM7QUFPRCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsY0FBOEI7SUFDcEUsUUFBUSxjQUFjLEVBQUUsQ0FBQztRQUN4QiwrQ0FBNkIsQ0FBQyxDQUFDLE9BQU8sZ0JBQWdCLENBQUM7UUFDdkQsbURBQStCLENBQUMsQ0FBQyxPQUFPLGFBQWEsQ0FBQztRQUV0RCwrQ0FBNkIsQ0FBQyxDQUFDLE9BQU8sY0FBYyxDQUFDO1FBQ3JELG1EQUErQixDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7UUFDdkQsbURBQStCLENBQUMsQ0FBQyxPQUFPLFdBQVcsQ0FBQztRQUVwRCxpREFBOEIsQ0FBQyxDQUFDLE9BQU8scUJBQXFCLENBQUM7UUFDN0QscURBQWdDLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQztRQUV6RCxpREFBOEIsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1FBQzdDLHFEQUFnQyxDQUFDLENBQUMsT0FBTyxhQUFhLENBQUM7UUFFdkQsbUNBQXVCLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQztRQUV0QywrQ0FBNkIsQ0FBQyxDQUFDLGtEQUFnQztRQUMvRCwyQ0FBMkIsQ0FBQyxDQUFDLDhDQUE4QjtRQUMzRCwrQ0FBNkIsQ0FBQyxDQUFDLGtEQUFnQztJQUNoRSxDQUFDO0FBQ0YsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxjQUFzQjtJQUN0RCxRQUFRLGNBQWMsRUFBRSxDQUFDO1FBQ3hCLCtDQUE2QixDQUFDLENBQUMsa0RBQWdDO1FBQy9ELG1EQUErQixDQUFDLENBQUMsc0RBQWtDO1FBRW5FLCtDQUE2QixDQUFDLENBQUMsa0RBQWdDO1FBQy9ELG1EQUErQixDQUFDLENBQUMsc0RBQWtDO1FBQ25FLG1EQUErQixDQUFDLENBQUMsc0RBQWtDO1FBRW5FLGlEQUE4QixDQUFDLENBQUMsb0RBQWlDO1FBQ2pFLHFEQUFnQyxDQUFDLENBQUMsd0RBQW1DO1FBRXJFLGlEQUE4QixDQUFDLENBQUMsb0RBQWlDO1FBQ2pFLHFEQUFnQyxDQUFDLENBQUMsd0RBQW1DO1FBRXJFLG1DQUF1QixDQUFDLENBQUMsc0NBQTBCO1FBRW5ELCtDQUE2QixDQUFDLENBQUMsa0RBQWdDO1FBQy9ELE9BQU8sQ0FBQyxDQUFDLDhDQUE4QjtJQUN4QyxDQUFDO0FBQ0YsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxRQUE2QixFQUFFLElBQXdCO0lBQ3hGLFFBQVEsUUFBUSxFQUFFLENBQUM7UUFDbEI7WUFDQyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsa0RBQWdDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsc0RBQWtDO1lBQ25DLENBQUM7WUFDRCw4Q0FBOEI7UUFFL0I7WUFDQyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsa0RBQWdDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsc0RBQWtDO1lBQ25DLENBQUM7WUFDRCxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsc0RBQWtDO1lBQ25DLENBQUM7WUFDRCw4Q0FBOEI7UUFFL0IsS0FBSyxRQUFRO1lBQ1osSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLG9EQUFpQztZQUNsQyxDQUFDO1lBQ0QsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLHdEQUFtQztZQUNwQyxDQUFDO1lBQ0QsOENBQThCO1FBRS9CO1lBQ0MsSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLG9EQUFpQztZQUNsQyxDQUFDO1lBQ0QsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLHdEQUFtQztZQUNwQyxDQUFDO1lBQ0QsOENBQThCO1FBRS9CLHlCQUFpQixDQUFDLENBQUMsc0NBQTBCO0lBQzlDLENBQUM7QUFDRixDQUFDO0FBRUQsTUFBTSxVQUFVLG9DQUFvQyxDQUFDLGtCQUFvQyxFQUFFLHFCQUFxQztJQUMvSCw2Q0FBNkM7SUFDN0MsT0FBTyxxQkFBcUIsbUNBQXVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLGdDQUFvQixDQUFDO0FBQ3pHLENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsdUJBQXVDLEVBQUUsa0JBQW9DLEVBQUUscUJBQXFDO0lBQzlKLDhFQUE4RTtJQUM5RSxJQUFJLG9DQUFvQyxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztRQUNyRixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsSUFBSSx1QkFBdUIsK0NBQTZCLEVBQUUsQ0FBQztRQUMxRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCx5REFBeUQ7SUFDekQsSUFBSSx1QkFBdUIsK0NBQTZCLEVBQUUsQ0FBQztRQUMxRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsSUFBSSx1QkFBdUIsMkNBQTJCLEVBQUUsQ0FBQztRQUN4RCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsSUFBSSx1QkFBdUIsS0FBSyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQThCRCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsS0FBVTtJQUNoRCxPQUFPLEtBQUs7V0FDUixPQUFPLEtBQUssS0FBSyxRQUFRO1dBQ3pCLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxRQUFRO1dBQzVCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBNkZELE1BQU0sQ0FBTixJQUFrQixNQVNqQjtBQVRELFdBQWtCLE1BQU07SUFDdkIsNkNBQW1DLENBQUE7SUFDbkMsNkNBQW1DLENBQUE7SUFDbkMseUJBQWUsQ0FBQTtJQUNmLHlDQUErQixDQUFBO0lBQy9CLHVDQUE2QixDQUFBO0lBQzdCLHlDQUErQixDQUFBO0lBQy9CLHlDQUErQixDQUFBO0lBQy9CLDJDQUFpQyxDQUFBO0FBQ2xDLENBQUMsRUFUaUIsTUFBTSxLQUFOLE1BQU0sUUFTdkI7QUFFRCxNQUFNLENBQU4sSUFBa0IsU0FJakI7QUFKRCxXQUFrQixTQUFTO0lBQzFCLCtDQUFXLENBQUE7SUFDWCxtREFBYSxDQUFBO0lBQ2IscURBQWMsQ0FBQTtBQUNmLENBQUMsRUFKaUIsU0FBUyxLQUFULFNBQVMsUUFJMUI7QUFFRCxNQUFNLENBQU4sSUFBa0IsVUFTakI7QUFURCxXQUFrQixVQUFVO0lBQzNCLG1DQUFxQixDQUFBO0lBQ3JCLHlDQUEyQixDQUFBO0lBQzNCLDZDQUErQixDQUFBO0lBQy9CLG1EQUFxQyxDQUFBO0lBQ3JDLG1DQUFxQixDQUFBO0lBQ3JCLHVDQUF5QixDQUFBO0lBQ3pCLHlCQUFXLENBQUE7SUFDWCwrQkFBaUIsQ0FBQTtBQUNsQixDQUFDLEVBVGlCLFVBQVUsS0FBVixVQUFVLFFBUzNCO0FBYUQsTUFBTSxDQUFOLElBQWtCLGFBR2pCO0FBSEQsV0FBa0IsYUFBYTtJQUM5QixvQ0FBbUIsQ0FBQTtJQUNuQix3Q0FBdUIsQ0FBQTtBQUN4QixDQUFDLEVBSGlCLGFBQWEsS0FBYixhQUFhLFFBRzlCO0FBeUJELE1BQU0sQ0FBTixJQUFrQixnQkFLakI7QUFMRCxXQUFrQixnQkFBZ0I7SUFDakMsdURBQVEsQ0FBQTtJQUNSLDZEQUFPLENBQUE7SUFDUCwyREFBTSxDQUFBO0lBQ04sNkRBQU8sQ0FBQTtBQUNSLENBQUMsRUFMaUIsZ0JBQWdCLEtBQWhCLGdCQUFnQixRQUtqQztBQTZCRCxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQTJCLHlCQUF5QixDQUFDLENBQUM7QUFpRTdHLE1BQU0sQ0FBTixJQUFrQix5QkFNakI7QUFORCxXQUFrQix5QkFBeUI7SUFDMUMsZ0RBQW1CLENBQUE7SUFDbkIsb0RBQXVCLENBQUE7SUFDdkIsOENBQWlCLENBQUE7SUFDakIsNEVBQStDLENBQUE7SUFDL0MsZ0RBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQU5pQix5QkFBeUIsS0FBekIseUJBQXlCLFFBTTFDO0FBRUQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLEtBQUs7SUFDL0MsWUFBWSxPQUFlLEVBQVcsSUFBK0I7UUFDcEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRHNCLFNBQUksR0FBSixJQUFJLENBQTJCO1FBRXBFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7Q0FDRDtBQUVELE1BQU0sQ0FBTixJQUFrQiw0QkFtQ2pCO0FBbkNELFdBQWtCLDRCQUE0QjtJQUM3QyxxREFBcUIsQ0FBQTtJQUNyQiwyREFBMkIsQ0FBQTtJQUMzQix5REFBeUIsQ0FBQTtJQUN6Qix1REFBdUIsQ0FBQTtJQUN2Qiw2REFBNkIsQ0FBQTtJQUM3QixtRUFBbUMsQ0FBQTtJQUNuQyx5RkFBeUQsQ0FBQTtJQUN6RCxpRkFBaUQsQ0FBQTtJQUNqRCxtREFBbUIsQ0FBQTtJQUNuQixxREFBcUIsQ0FBQTtJQUNyQix1RUFBdUMsQ0FBQTtJQUN2QywrRUFBdUUsQ0FBQTtJQUN2RSxpRUFBaUMsQ0FBQTtJQUNqQyxtREFBbUIsQ0FBQTtJQUNuQixxREFBcUIsQ0FBQTtJQUNyQix1RUFBdUMsQ0FBQTtJQUN2QywyREFBMkIsQ0FBQTtJQUMzQiw2REFBNkIsQ0FBQTtJQUM3QixpREFBaUIsQ0FBQTtJQUNqQixpREFBaUIsQ0FBQTtJQUNqQixtRkFBbUQsQ0FBQTtJQUNuRCw2REFBNkIsQ0FBQTtJQUM3Qix5RkFBeUQsQ0FBQTtJQUN6RCwyREFBMkIsQ0FBQTtJQUMzQix5REFBeUIsQ0FBQTtJQUN6QiwrREFBK0IsQ0FBQTtJQUMvQixxRUFBcUMsQ0FBQTtJQUNyQywrRkFBK0QsQ0FBQTtJQUMvRCwyRkFBMkQsQ0FBQTtJQUMzRCx5REFBeUIsQ0FBQTtJQUN6QixtREFBbUIsQ0FBQTtJQUNuQix1REFBdUIsQ0FBQTtJQUN2QixtREFBbUIsQ0FBQTtJQUNuQixxREFBcUIsQ0FBQTtBQUN0QixDQUFDLEVBbkNpQiw0QkFBNEIsS0FBNUIsNEJBQTRCLFFBbUM3QztBQUVELE1BQU0sQ0FBTixJQUFZLGtDQTRCWDtBQTVCRCxXQUFZLGtDQUFrQztJQUM3Qyw2REFBeUIsQ0FBQTtJQUN6Qix5REFBcUIsQ0FBQTtJQUNyQix5RkFBcUQsQ0FBQTtJQUNyRCx5RUFBcUMsQ0FBQTtJQUNyQyxpRkFBNkMsQ0FBQTtJQUM3QywrRUFBMkMsQ0FBQTtJQUMzQywrRkFBMkQsQ0FBQTtJQUMzRCxxR0FBaUUsQ0FBQTtJQUNqRSwrRUFBMkMsQ0FBQTtJQUMzQyxxRkFBaUQsQ0FBQTtJQUNqRCx5RkFBcUQsQ0FBQTtJQUNyRCxtR0FBK0QsQ0FBQTtJQUMvRCw2RUFBeUMsQ0FBQTtJQUN6QyxtR0FBK0QsQ0FBQTtJQUMvRCxtSEFBK0UsQ0FBQTtJQUMvRSxpR0FBNkQsQ0FBQTtJQUM3RCwrRUFBMkMsQ0FBQTtJQUMzQywrRkFBMkQsQ0FBQTtJQUMzRCxxR0FBaUUsQ0FBQTtJQUNqRSx1RUFBbUMsQ0FBQTtJQUNuQyx5RUFBcUMsQ0FBQTtJQUNyQyw2REFBeUIsQ0FBQTtJQUN6QiwrRUFBMkMsQ0FBQTtJQUMzQyxpRkFBNkMsQ0FBQTtJQUM3QyxtRUFBK0IsQ0FBQTtJQUMvQixpRkFBNkMsQ0FBQTtJQUM3Qyw2R0FBeUUsQ0FBQTtBQUMxRSxDQUFDLEVBNUJXLGtDQUFrQyxLQUFsQyxrQ0FBa0MsUUE0QjdDO0FBRUQsTUFBTSxPQUFPLHdCQUF5QixTQUFRLEtBQUs7SUFDbEQsWUFBWSxPQUFlLEVBQVcsSUFBa0M7UUFDdkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRHNCLFNBQUksR0FBSixJQUFJLENBQThCO1FBRXZFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7Q0FDRDtBQStDRCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxlQUFlLENBQThCLDRCQUE0QixDQUFDLENBQUM7QUFtQ3RILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLGdDQUFnQyxDQUFDO0FBQ2pGLE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFHLCtCQUErQixDQUFDO0FBQy9FLE1BQU0sQ0FBQyxNQUFNLGlDQUFpQyxHQUFHLGVBQWUsQ0FBb0MsbUNBQW1DLENBQUMsQ0FBQztBQStCekksTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsZUFBZSxDQUF3Qix1QkFBdUIsQ0FBQyxDQUFDO0FBV3JHLE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUFHLGVBQWUsQ0FBNEIsMkJBQTJCLENBQUMsQ0FBQztBQVdqSCxNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxRQUFhLEVBQUUsV0FBeUI7SUFDekUsSUFBSSxJQUFlLENBQUM7SUFDcEIsSUFBSSxDQUFDO1FBQ0osSUFBSSxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNaLElBQXlCLENBQUUsQ0FBQyxtQkFBbUIsK0NBQXVDLEVBQUUsQ0FBQztZQUN4RixPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQztJQUNULENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixNQUFNLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUYsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM5RSxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2pGLE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLHdDQUF3QyxDQUFDO0FBQ3JGLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDO0FBRS9ELFFBQVEsQ0FBQyxFQUFFLENBQXlCLFVBQVUsQ0FBQyxhQUFhLENBQUM7S0FDM0QscUJBQXFCLENBQUM7SUFDdEIsRUFBRSxFQUFFLFlBQVk7SUFDaEIsS0FBSyxFQUFFLEVBQUU7SUFDVCxLQUFLLEVBQUUsUUFBUSxDQUFDLDhCQUE4QixFQUFFLFlBQVksQ0FBQztJQUM3RCxJQUFJLEVBQUUsUUFBUTtJQUNkLFVBQVUsRUFBRTtRQUNYLENBQUMsMEJBQTBCLENBQUMsRUFBRTtZQUM3Qiw0SEFBNEg7WUFDNUgsSUFBSSxFQUFFLFFBQVE7WUFDZCxtQkFBbUIsRUFBRSxRQUFRLENBQUMsb0JBQW9CLEVBQUUsaVhBQWlYLENBQUM7WUFDdGEsT0FBTyxFQUFFLEdBQUc7WUFDWixlQUFlLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsV0FBVyxFQUFFLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSw0QkFBNEIsQ0FBQztpQkFDOUUsRUFBRTtvQkFDRixJQUFJLEVBQUU7d0JBQ0wsR0FBRyxFQUFFLElBQUk7cUJBQ1Q7b0JBQ0QsV0FBVyxFQUFFLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSw2QkFBNkIsQ0FBQztpQkFDOUUsQ0FBQztZQUNGLEtBQUssd0NBQWdDO1lBQ3JDLE1BQU0sRUFBRTtnQkFDUCxJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixjQUFjLEVBQUUsTUFBTTtnQkFDdEIsV0FBVyxFQUFFLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxrUkFBa1IsQ0FBQzthQUN0VTtZQUNELG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsaUJBQWlCLEVBQUU7Z0JBQ2xCLDBEQUEwRCxFQUFFO29CQUMzRCxLQUFLLEVBQUU7d0JBQ047NEJBQ0MsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQzs0QkFDM0IsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7NEJBQzdCLFdBQVcsRUFBRSxRQUFRLENBQUMsOEJBQThCLEVBQUUsa0NBQWtDLENBQUM7NEJBQ3pGLGdCQUFnQixFQUFFO2dDQUNqQixRQUFRLENBQUMsZ0NBQWdDLEVBQUUsdUJBQXVCLENBQUM7Z0NBQ25FLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSwyQkFBMkIsQ0FBQztnQ0FDeEUsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLDhDQUE4QyxDQUFDOzZCQUNsRzt5QkFDRDt3QkFDRDs0QkFDQyxJQUFJLEVBQUUsT0FBTzs0QkFDYixLQUFLLEVBQUU7Z0NBQ04sSUFBSSxFQUFFLFFBQVE7NkJBQ2Q7NEJBQ0QsV0FBVyxFQUFFLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxtVEFBbVQsQ0FBQzt5QkFDbFg7cUJBQ0Q7aUJBQ0Q7Z0JBQ0QsNkJBQTZCLEVBQUU7b0JBQzlCLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7b0JBQzNCLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO29CQUM3QixXQUFXLEVBQUUsUUFBUSxDQUFDLHVDQUF1QyxFQUFFLHNEQUFzRCxDQUFDO29CQUN0SCxnQkFBZ0IsRUFBRTt3QkFDakIsUUFBUSxDQUFDLDBDQUEwQyxFQUFFLGdEQUFnRCxDQUFDO3dCQUN0RyxRQUFRLENBQUMsMkNBQTJDLEVBQUUsb0RBQW9ELENBQUM7d0JBQzNHLFFBQVEsQ0FBQyxrREFBa0QsRUFBRSxrRUFBa0UsQ0FBQztxQkFDaEk7aUJBQ0Q7Z0JBQ0QsS0FBSyxFQUFFO29CQUNOLElBQUksRUFBRSxTQUFTO29CQUNmLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7b0JBQ25CLFdBQVcsRUFBRSxRQUFRLENBQUMsa0NBQWtDLEVBQUUsbUNBQW1DLENBQUM7b0JBQzlGLGdCQUFnQixFQUFFO3dCQUNqQixRQUFRLENBQUMsNkJBQTZCLEVBQUUsdUJBQXVCLENBQUM7d0JBQ2hFLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSwwQkFBMEIsQ0FBQztxQkFDcEU7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0Q7Q0FDRCxDQUFDLENBQUMifQ==