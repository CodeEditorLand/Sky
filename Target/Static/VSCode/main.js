/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'original-fs';
import * as os from 'os';
import { performance } from 'perf_hooks';
import { configurePortable } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
import { fileURLToPath } from 'url';
import { app, protocol, crashReporter, Menu, contentTracing } from 'electron';
import minimist from 'minimist';
import { product } from './bootstrap-meta.js';
import { parse } from './vs/base/common/jsonc.js';
import { getUserDataPath } from './vs/platform/environment/node/userDataPath.js';
import * as perf from './vs/base/common/performance.js';
import { resolveNLSConfiguration } from './vs/base/node/nls.js';
import { getUNCHost, addUNCHostToAllowlist } from './vs/base/node/unc.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
perf.mark('code/didStartMain');
perf.mark('code/willLoadMainBundle', {
    // When built, the main bundle is a single JS file with all
    // dependencies inlined. As such, we mark `willLoadMainBundle`
    // as the start of the main bundle loading process.
    startTime: Math.floor(performance.timeOrigin)
});
perf.mark('code/didLoadMainBundle');
// Enable portable support
const portable = configurePortable(product);
const args = parseCLIArgs();
// Configure static command line arguments
const argvConfig = configureCommandlineSwitchesSync(args);
// Enable sandbox globally unless
// 1) disabled via command line using either
//    `--no-sandbox` or `--disable-chromium-sandbox` argument.
// 2) argv.json contains `disable-chromium-sandbox: true`.
if (args['sandbox'] &&
    !args['disable-chromium-sandbox'] &&
    !argvConfig['disable-chromium-sandbox']) {
    app.enableSandbox();
}
else if (app.commandLine.hasSwitch('no-sandbox') &&
    !app.commandLine.hasSwitch('disable-gpu-sandbox')) {
    // Disable GPU sandbox whenever --no-sandbox is used.
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}
else {
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}
// Set userData path before app 'ready' event
const userDataPath = getUserDataPath(args, product.nameShort ?? 'code-oss-dev');
if (process.platform === 'win32') {
    const userDataUNCHost = getUNCHost(userDataPath);
    if (userDataUNCHost) {
        addUNCHostToAllowlist(userDataUNCHost); // enables to use UNC paths in userDataPath
    }
}
app.setPath('userData', userDataPath);
// Resolve code cache path
const codeCachePath = getCodeCachePath();
// Disable default menu (https://github.com/electron/electron/issues/35512)
Menu.setApplicationMenu(null);
// Configure crash reporter
perf.mark('code/willStartCrashReporter');
// If a crash-reporter-directory is specified we store the crash reports
// in the specified directory and don't upload them to the crash server.
//
// Appcenter crash reporting is enabled if
// * enable-crash-reporter runtime argument is set to 'true'
// * --disable-crash-reporter command line parameter is not set
//
// Disable crash reporting in all other cases.
if (args['crash-reporter-directory'] || (argvConfig['enable-crash-reporter'] && !args['disable-crash-reporter'])) {
    configureCrashReporter();
}
perf.mark('code/didStartCrashReporter');
// Set logs path before app 'ready' event if running portable
// to ensure that no 'logs' folder is created on disk at a
// location outside of the portable directory
// (https://github.com/microsoft/vscode/issues/56651)
if (portable && portable.isPortable) {
    app.setAppLogsPath(path.join(userDataPath, 'logs'));
}
// Register custom schemes with privileges
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'vscode-webview',
        privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true, codeCache: true }
    },
    {
        scheme: 'vscode-file',
        privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, codeCache: true }
    }
]);
// Global app listeners
registerListeners();
/**
 * We can resolve the NLS configuration early if it is defined
 * in argv.json before `app.ready` event. Otherwise we can only
 * resolve NLS after `app.ready` event to resolve the OS locale.
 */
let nlsConfigurationPromise = undefined;
// Use the most preferred OS language for language recommendation.
// The API might return an empty array on Linux, such as when
// the 'C' locale is the user's only configured locale.
// No matter the OS, if the array is empty, default back to 'en'.
const osLocale = processZhLocale((app.getPreferredSystemLanguages()?.[0] ?? 'en').toLowerCase());
const userLocale = getUserDefinedLocale(argvConfig);
if (userLocale) {
    nlsConfigurationPromise = resolveNLSConfiguration({
        userLocale,
        osLocale,
        commit: product.commit,
        userDataPath,
        nlsMetadataPath: __dirname
    });
}
// Pass in the locale to Electron so that the
// Windows Control Overlay is rendered correctly on Windows.
// For now, don't pass in the locale on macOS due to
// https://github.com/microsoft/vscode/issues/167543.
// If the locale is `qps-ploc`, the Microsoft
// Pseudo Language Language Pack is being used.
// In that case, use `en` as the Electron locale.
if (process.platform === 'win32' || process.platform === 'linux') {
    const electronLocale = (!userLocale || userLocale === 'qps-ploc') ? 'en' : userLocale;
    app.commandLine.appendSwitch('lang', electronLocale);
}
// Load our code once ready
app.once('ready', function () {
    if (args['trace']) {
        let traceOptions;
        if (args['trace-memory-infra']) {
            const customCategories = args['trace-category-filter']?.split(',') || [];
            customCategories.push('disabled-by-default-memory-infra', 'disabled-by-default-memory-infra.v8.code_stats');
            traceOptions = {
                included_categories: customCategories,
                excluded_categories: ['*'],
                memory_dump_config: {
                    allowed_dump_modes: ['light', 'detailed'],
                    triggers: [
                        {
                            type: 'periodic_interval',
                            mode: 'detailed',
                            min_time_between_dumps_ms: 10000
                        },
                        {
                            type: 'periodic_interval',
                            mode: 'light',
                            min_time_between_dumps_ms: 1000
                        }
                    ]
                }
            };
        }
        else {
            traceOptions = {
                categoryFilter: args['trace-category-filter'] || '*',
                traceOptions: args['trace-options'] || 'record-until-full,enable-sampling'
            };
        }
        contentTracing.startRecording(traceOptions).finally(() => onReady());
    }
    else {
        onReady();
    }
});
async function onReady() {
    perf.mark('code/mainAppReady');
    try {
        const [, nlsConfig] = await Promise.all([
            mkdirpIgnoreError(codeCachePath),
            resolveNlsConfiguration()
        ]);
        await startup(codeCachePath, nlsConfig);
    }
    catch (error) {
        console.error(error);
    }
}
/**
 * Main startup routine
 */
async function startup(codeCachePath, nlsConfig) {
    process.env['VSCODE_NLS_CONFIG'] = JSON.stringify(nlsConfig);
    process.env['VSCODE_CODE_CACHE_PATH'] = codeCachePath || '';
    // Bootstrap ESM
    await bootstrapESM();
    // Load Main
    await import('./vs/code/electron-main/main.js');
    perf.mark('code/didRunMainBundle');
}
function configureCommandlineSwitchesSync(cliArgs) {
    const SUPPORTED_ELECTRON_SWITCHES = [
        // alias from us for --disable-gpu
        'disable-hardware-acceleration',
        // override for the color profile to use
        'force-color-profile',
        // disable LCD font rendering, a Chromium flag
        'disable-lcd-text',
        // bypass any specified proxy for the given semi-colon-separated list of hosts
        'proxy-bypass-list'
    ];
    if (process.platform === 'linux') {
        // Force enable screen readers on Linux via this flag
        SUPPORTED_ELECTRON_SWITCHES.push('force-renderer-accessibility');
        // override which password-store is used on Linux
        SUPPORTED_ELECTRON_SWITCHES.push('password-store');
    }
    const SUPPORTED_MAIN_PROCESS_SWITCHES = [
        // Persistently enable proposed api via argv.json: https://github.com/microsoft/vscode/issues/99775
        'enable-proposed-api',
        // Log level to use. Default is 'info'. Allowed values are 'error', 'warn', 'info', 'debug', 'trace', 'off'.
        'log-level',
        // Use an in-memory storage for secrets
        'use-inmemory-secretstorage'
    ];
    // Read argv config
    const argvConfig = readArgvConfigSync();
    Object.keys(argvConfig).forEach(argvKey => {
        const argvValue = argvConfig[argvKey];
        // Append Electron flags to Electron
        if (SUPPORTED_ELECTRON_SWITCHES.indexOf(argvKey) !== -1) {
            if (argvValue === true || argvValue === 'true') {
                if (argvKey === 'disable-hardware-acceleration') {
                    app.disableHardwareAcceleration(); // needs to be called explicitly
                }
                else {
                    app.commandLine.appendSwitch(argvKey);
                }
            }
            else if (typeof argvValue === 'string' && argvValue) {
                if (argvKey === 'password-store') {
                    // Password store
                    // TODO@TylerLeonhardt: Remove this migration in 3 months
                    let migratedArgvValue = argvValue;
                    if (argvValue === 'gnome' || argvValue === 'gnome-keyring') {
                        migratedArgvValue = 'gnome-libsecret';
                    }
                    app.commandLine.appendSwitch(argvKey, migratedArgvValue);
                }
                else {
                    app.commandLine.appendSwitch(argvKey, argvValue);
                }
            }
        }
        // Append main process flags to process.argv
        else if (SUPPORTED_MAIN_PROCESS_SWITCHES.indexOf(argvKey) !== -1) {
            switch (argvKey) {
                case 'enable-proposed-api':
                    if (Array.isArray(argvValue)) {
                        argvValue.forEach(id => id && typeof id === 'string' && process.argv.push('--enable-proposed-api', id));
                    }
                    else {
                        console.error(`Unexpected value for \`enable-proposed-api\` in argv.json. Expected array of extension ids.`);
                    }
                    break;
                case 'log-level':
                    if (typeof argvValue === 'string') {
                        process.argv.push('--log', argvValue);
                    }
                    else if (Array.isArray(argvValue)) {
                        for (const value of argvValue) {
                            process.argv.push('--log', value);
                        }
                    }
                    break;
                case 'use-inmemory-secretstorage':
                    if (argvValue) {
                        process.argv.push('--use-inmemory-secretstorage');
                    }
                    break;
            }
        }
    });
    // Following features are enabled from the runtime:
    // `DocumentPolicyIncludeJSCallStacksInCrashReports` - https://www.electronjs.org/docs/latest/api/web-frame-main#framecollectjavascriptcallstack-experimental
    // `EarlyEstablishGpuChannel` - Refs https://issues.chromium.org/issues/40208065
    // `EstablishGpuChannelAsync` - Refs https://issues.chromium.org/issues/40208065
    const featuresToEnable = `DocumentPolicyIncludeJSCallStacksInCrashReports,EarlyEstablishGpuChannel,EstablishGpuChannelAsync,${app.commandLine.getSwitchValue('enable-features')}`;
    app.commandLine.appendSwitch('enable-features', featuresToEnable);
    // Following features are disabled from the runtime:
    // `CalculateNativeWinOcclusion` - Disable native window occlusion tracker (https://groups.google.com/a/chromium.org/g/embedder-dev/c/ZF3uHHyWLKw/m/VDN2hDXMAAAJ)
    const featuresToDisable = `CalculateNativeWinOcclusion,${app.commandLine.getSwitchValue('disable-features')}`;
    app.commandLine.appendSwitch('disable-features', featuresToDisable);
    // Blink features to configure.
    // `FontMatchingCTMigration` - Siwtch font matching on macOS to Appkit (Refs https://github.com/microsoft/vscode/issues/224496#issuecomment-2270418470).
    // `StandardizedBrowserZoom` - Disable zoom adjustment for bounding box (https://github.com/microsoft/vscode/issues/232750#issuecomment-2459495394)
    const blinkFeaturesToDisable = `FontMatchingCTMigration,StandardizedBrowserZoom,${app.commandLine.getSwitchValue('disable-blink-features')}`;
    app.commandLine.appendSwitch('disable-blink-features', blinkFeaturesToDisable);
    // Support JS Flags
    const jsFlags = getJSFlags(cliArgs);
    if (jsFlags) {
        app.commandLine.appendSwitch('js-flags', jsFlags);
    }
    // Use portal version 4 that supports current_folder option
    // to address https://github.com/microsoft/vscode/issues/213780
    // Runtime sets the default version to 3, refs https://github.com/electron/electron/pull/44426
    app.commandLine.appendSwitch('xdg-portal-required-version', '4');
    return argvConfig;
}
function readArgvConfigSync() {
    // Read or create the argv.json config file sync before app('ready')
    const argvConfigPath = getArgvConfigPath();
    let argvConfig = undefined;
    try {
        argvConfig = parse(fs.readFileSync(argvConfigPath).toString());
    }
    catch (error) {
        if (error && error.code === 'ENOENT') {
            createDefaultArgvConfigSync(argvConfigPath);
        }
        else {
            console.warn(`Unable to read argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
        }
    }
    // Fallback to default
    if (!argvConfig) {
        argvConfig = {};
    }
    return argvConfig;
}
function createDefaultArgvConfigSync(argvConfigPath) {
    try {
        // Ensure argv config parent exists
        const argvConfigPathDirname = path.dirname(argvConfigPath);
        if (!fs.existsSync(argvConfigPathDirname)) {
            fs.mkdirSync(argvConfigPathDirname);
        }
        // Default argv content
        const defaultArgvConfigContent = [
            '// This configuration file allows you to pass permanent command line arguments to VS Code.',
            '// Only a subset of arguments is currently supported to reduce the likelihood of breaking',
            '// the installation.',
            '//',
            '// PLEASE DO NOT CHANGE WITHOUT UNDERSTANDING THE IMPACT',
            '//',
            '// NOTE: Changing this file requires a restart of VS Code.',
            '{',
            '	// Use software rendering instead of hardware accelerated rendering.',
            '	// This can help in cases where you see rendering issues in VS Code.',
            '	// "disable-hardware-acceleration": true',
            '}'
        ];
        // Create initial argv.json with default content
        fs.writeFileSync(argvConfigPath, defaultArgvConfigContent.join('\n'));
    }
    catch (error) {
        console.error(`Unable to create argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
    }
}
function getArgvConfigPath() {
    const vscodePortable = process.env['VSCODE_PORTABLE'];
    if (vscodePortable) {
        return path.join(vscodePortable, 'argv.json');
    }
    let dataFolderName = product.dataFolderName;
    if (process.env['VSCODE_DEV']) {
        dataFolderName = `${dataFolderName}-dev`;
    }
    return path.join(os.homedir(), dataFolderName, 'argv.json');
}
function configureCrashReporter() {
    let crashReporterDirectory = args['crash-reporter-directory'];
    let submitURL = '';
    if (crashReporterDirectory) {
        crashReporterDirectory = path.normalize(crashReporterDirectory);
        if (!path.isAbsolute(crashReporterDirectory)) {
            console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory must be absolute.`);
            app.exit(1);
        }
        if (!fs.existsSync(crashReporterDirectory)) {
            try {
                fs.mkdirSync(crashReporterDirectory, { recursive: true });
            }
            catch (error) {
                console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory does not seem to exist or cannot be created.`);
                app.exit(1);
            }
        }
        // Crashes are stored in the crashDumps directory by default, so we
        // need to change that directory to the provided one
        console.log(`Found --crash-reporter-directory argument. Setting crashDumps directory to be '${crashReporterDirectory}'`);
        app.setPath('crashDumps', crashReporterDirectory);
    }
    // Otherwise we configure the crash reporter from product.json
    else {
        const appCenter = product.appCenter;
        if (appCenter) {
            const isWindows = (process.platform === 'win32');
            const isLinux = (process.platform === 'linux');
            const isDarwin = (process.platform === 'darwin');
            const crashReporterId = argvConfig['crash-reporter-id'];
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (crashReporterId && uuidPattern.test(crashReporterId)) {
                if (isWindows) {
                    switch (process.arch) {
                        case 'x64':
                            submitURL = appCenter['win32-x64'];
                            break;
                        case 'arm64':
                            submitURL = appCenter['win32-arm64'];
                            break;
                    }
                }
                else if (isDarwin) {
                    if (product.darwinUniversalAssetId) {
                        submitURL = appCenter['darwin-universal'];
                    }
                    else {
                        switch (process.arch) {
                            case 'x64':
                                submitURL = appCenter['darwin'];
                                break;
                            case 'arm64':
                                submitURL = appCenter['darwin-arm64'];
                                break;
                        }
                    }
                }
                else if (isLinux) {
                    submitURL = appCenter['linux-x64'];
                }
                submitURL = submitURL.concat('&uid=', crashReporterId, '&iid=', crashReporterId, '&sid=', crashReporterId);
                // Send the id for child node process that are explicitly starting crash reporter.
                // For vscode this is ExtensionHost process currently.
                const argv = process.argv;
                const endOfArgsMarkerIndex = argv.indexOf('--');
                if (endOfArgsMarkerIndex === -1) {
                    argv.push('--crash-reporter-id', crashReporterId);
                }
                else {
                    // if the we have an argument "--" (end of argument marker)
                    // we cannot add arguments at the end. rather, we add
                    // arguments before the "--" marker.
                    argv.splice(endOfArgsMarkerIndex, 0, '--crash-reporter-id', crashReporterId);
                }
            }
        }
    }
    // Start crash reporter for all processes
    const productName = (product.crashReporter ? product.crashReporter.productName : undefined) || product.nameShort;
    const companyName = (product.crashReporter ? product.crashReporter.companyName : undefined) || 'Microsoft';
    const uploadToServer = Boolean(!process.env['VSCODE_DEV'] && submitURL && !crashReporterDirectory);
    crashReporter.start({
        companyName,
        productName: process.env['VSCODE_DEV'] ? `${productName} Dev` : productName,
        submitURL,
        uploadToServer,
        compress: true
    });
}
function getJSFlags(cliArgs) {
    const jsFlags = [];
    // Add any existing JS flags we already got from the command line
    if (cliArgs['js-flags']) {
        jsFlags.push(cliArgs['js-flags']);
    }
    if (process.platform === 'linux') {
        // Fix cppgc crash on Linux with 16KB page size.
        // Refs https://issues.chromium.org/issues/378017037
        // The fix from https://github.com/electron/electron/commit/6c5b2ef55e08dc0bede02384747549c1eadac0eb
        // only affects non-renderer process.
        // The following will ensure that the flag will be
        // applied to the renderer process as well.
        // TODO(deepak1556): Remove this once we update to
        // Chromium >= 134.
        jsFlags.push('--nodecommit_pooled_pages');
    }
    return jsFlags.length > 0 ? jsFlags.join(' ') : null;
}
function parseCLIArgs() {
    return minimist(process.argv, {
        string: [
            'user-data-dir',
            'locale',
            'js-flags',
            'crash-reporter-directory'
        ],
        boolean: [
            'disable-chromium-sandbox',
        ],
        default: {
            'sandbox': true
        },
        alias: {
            'no-sandbox': 'sandbox'
        }
    });
}
function registerListeners() {
    /**
     * macOS: when someone drops a file to the not-yet running VSCode, the open-file event fires even before
     * the app-ready event. We listen very early for open-file and remember this upon startup as path to open.
     */
    const macOpenFiles = [];
    globalThis['macOpenFiles'] = macOpenFiles;
    app.on('open-file', function (event, path) {
        macOpenFiles.push(path);
    });
    /**
     * macOS: react to open-url requests.
     */
    const openUrls = [];
    const onOpenUrl = function (event, url) {
        event.preventDefault();
        openUrls.push(url);
    };
    app.on('will-finish-launching', function () {
        app.on('open-url', onOpenUrl);
    });
    globalThis['getOpenUrls'] = function () {
        app.removeListener('open-url', onOpenUrl);
        return openUrls;
    };
}
function getCodeCachePath() {
    // explicitly disabled via CLI args
    if (process.argv.indexOf('--no-cached-data') > 0) {
        return undefined;
    }
    // running out of sources
    if (process.env['VSCODE_DEV']) {
        return undefined;
    }
    // require commit id
    const commit = product.commit;
    if (!commit) {
        return undefined;
    }
    return path.join(userDataPath, 'CachedData', commit);
}
async function mkdirpIgnoreError(dir) {
    if (typeof dir === 'string') {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
            return dir;
        }
        catch (error) {
            // ignore
        }
    }
    return undefined;
}
//#region NLS Support
function processZhLocale(appLocale) {
    if (appLocale.startsWith('zh')) {
        const region = appLocale.split('-')[1];
        // On Windows and macOS, Chinese languages returned by
        // app.getPreferredSystemLanguages() start with zh-hans
        // for Simplified Chinese or zh-hant for Traditional Chinese,
        // so we can easily determine whether to use Simplified or Traditional.
        // However, on Linux, Chinese languages returned by that same API
        // are of the form zh-XY, where XY is a country code.
        // For China (CN), Singapore (SG), and Malaysia (MY)
        // country codes, assume they use Simplified Chinese.
        // For other cases, assume they use Traditional.
        if (['hans', 'cn', 'sg', 'my'].includes(region)) {
            return 'zh-cn';
        }
        return 'zh-tw';
    }
    return appLocale;
}
/**
 * Resolve the NLS configuration
 */
async function resolveNlsConfiguration() {
    // First, we need to test a user defined locale.
    // If it fails we try the app locale.
    // If that fails we fall back to English.
    const nlsConfiguration = nlsConfigurationPromise ? await nlsConfigurationPromise : undefined;
    if (nlsConfiguration) {
        return nlsConfiguration;
    }
    // Try to use the app locale which is only valid
    // after the app ready event has been fired.
    let userLocale = app.getLocale();
    if (!userLocale) {
        return {
            userLocale: 'en',
            osLocale,
            resolvedLanguage: 'en',
            defaultMessagesFile: path.join(__dirname, 'nls.messages.json'),
            // NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
            locale: 'en',
            availableLanguages: {}
        };
    }
    // See above the comment about the loader and case sensitiveness
    userLocale = processZhLocale(userLocale.toLowerCase());
    return resolveNLSConfiguration({
        userLocale,
        osLocale,
        commit: product.commit,
        userDataPath,
        nlsMetadataPath: __dirname
    });
}
/**
 * Language tags are case insensitive however an ESM loader is case sensitive
 * To make this work on case preserving & insensitive FS we do the following:
 * the language bundles have lower case language tags and we always lower case
 * the locale we receive from the user or OS.
 */
function getUserDefinedLocale(argvConfig) {
    const locale = args['locale'];
    if (locale) {
        return locale.toLowerCase(); // a directly provided --locale always wins
    }
    return typeof argvConfig?.locale === 'string' ? argvConfig.locale.toLowerCase() : undefined;
}
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbEMsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUNwQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM5RSxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDakYsT0FBTyxLQUFLLElBQUksTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFJMUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRS9ELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFO0lBQ3BDLDJEQUEyRDtJQUMzRCw4REFBOEQ7SUFDOUQsbURBQW1EO0lBQ25ELFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7Q0FDN0MsQ0FBQyxDQUFDO0FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXBDLDBCQUEwQjtBQUMxQixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUU1QyxNQUFNLElBQUksR0FBRyxZQUFZLEVBQUUsQ0FBQztBQUM1QiwwQ0FBMEM7QUFDMUMsTUFBTSxVQUFVLEdBQUcsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUQsaUNBQWlDO0FBQ2pDLDRDQUE0QztBQUM1Qyw4REFBOEQ7QUFDOUQsMERBQTBEO0FBQzFELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNsQixDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUNqQyxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLENBQUM7SUFDMUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLENBQUM7S0FBTSxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztJQUNqRCxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQztJQUNwRCxxREFBcUQ7SUFDckQsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNyRCxDQUFDO0tBQU0sQ0FBQztJQUNQLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNDLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVELDZDQUE2QztBQUM3QyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksY0FBYyxDQUFDLENBQUM7QUFDaEYsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO0lBQ2xDLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3JCLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsMkNBQTJDO0lBQ3BGLENBQUM7QUFDRixDQUFDO0FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFdEMsMEJBQTBCO0FBQzFCLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFFekMsMkVBQTJFO0FBQzNFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5QiwyQkFBMkI7QUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ3pDLHdFQUF3RTtBQUN4RSx3RUFBd0U7QUFDeEUsRUFBRTtBQUNGLDBDQUEwQztBQUMxQyw0REFBNEQ7QUFDNUQsK0RBQStEO0FBQy9ELEVBQUU7QUFDRiw4Q0FBOEM7QUFDOUMsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2xILHNCQUFzQixFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUNELElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUV4Qyw2REFBNkQ7QUFDN0QsMERBQTBEO0FBQzFELDZDQUE2QztBQUM3QyxxREFBcUQ7QUFDckQsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3JDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQsMENBQTBDO0FBQzFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQztJQUNwQztRQUNDLE1BQU0sRUFBRSxnQkFBZ0I7UUFDeEIsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtLQUNsSTtJQUNEO1FBQ0MsTUFBTSxFQUFFLGFBQWE7UUFDckIsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO0tBQ3ZHO0NBQ0QsQ0FBQyxDQUFDO0FBRUgsdUJBQXVCO0FBQ3ZCLGlCQUFpQixFQUFFLENBQUM7QUFFcEI7Ozs7R0FJRztBQUNILElBQUksdUJBQXVCLEdBQTJDLFNBQVMsQ0FBQztBQUVoRixrRUFBa0U7QUFDbEUsNkRBQTZEO0FBQzdELHVEQUF1RDtBQUN2RCxpRUFBaUU7QUFDakUsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ2pHLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BELElBQUksVUFBVSxFQUFFLENBQUM7SUFDaEIsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7UUFDakQsVUFBVTtRQUNWLFFBQVE7UUFDUixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07UUFDdEIsWUFBWTtRQUNaLGVBQWUsRUFBRSxTQUFTO0tBQzFCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCw2Q0FBNkM7QUFDN0MsNERBQTREO0FBQzVELG9EQUFvRDtBQUNwRCxxREFBcUQ7QUFDckQsNkNBQTZDO0FBQzdDLCtDQUErQztBQUMvQyxpREFBaUQ7QUFFakQsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO0lBQ2xFLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksVUFBVSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztJQUN0RixHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVELDJCQUEyQjtBQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUNqQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ25CLElBQUksWUFBdUUsQ0FBQztRQUM1RSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7WUFDaEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO1lBQzVHLFlBQVksR0FBRztnQkFDZCxtQkFBbUIsRUFBRSxnQkFBZ0I7Z0JBQ3JDLG1CQUFtQixFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUMxQixrQkFBa0IsRUFBRTtvQkFDbkIsa0JBQWtCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO29CQUN6QyxRQUFRLEVBQUU7d0JBQ1Q7NEJBQ0MsSUFBSSxFQUFFLG1CQUFtQjs0QkFDekIsSUFBSSxFQUFFLFVBQVU7NEJBQ2hCLHlCQUF5QixFQUFFLEtBQUs7eUJBQ2hDO3dCQUNEOzRCQUNDLElBQUksRUFBRSxtQkFBbUI7NEJBQ3pCLElBQUksRUFBRSxPQUFPOzRCQUNiLHlCQUF5QixFQUFFLElBQUk7eUJBQy9CO3FCQUNEO2lCQUNEO2FBQ0QsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ1AsWUFBWSxHQUFHO2dCQUNkLGNBQWMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxHQUFHO2dCQUNwRCxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1DQUFtQzthQUMxRSxDQUFDO1FBQ0gsQ0FBQztRQUVELGNBQWMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztTQUFNLENBQUM7UUFDUCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7QUFDRixDQUFDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxPQUFPO0lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUUvQixJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdkMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO1lBQ2hDLHVCQUF1QixFQUFFO1NBQ3pCLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLENBQUM7QUFDRixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsT0FBTyxDQUFDLGFBQWlDLEVBQUUsU0FBNEI7SUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLGFBQWEsSUFBSSxFQUFFLENBQUM7SUFFNUQsZ0JBQWdCO0lBQ2hCLE1BQU0sWUFBWSxFQUFFLENBQUM7SUFFckIsWUFBWTtJQUNaLE1BQU0sTUFBTSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxTQUFTLGdDQUFnQyxDQUFDLE9BQXlCO0lBQ2xFLE1BQU0sMkJBQTJCLEdBQUc7UUFFbkMsa0NBQWtDO1FBQ2xDLCtCQUErQjtRQUUvQix3Q0FBd0M7UUFDeEMscUJBQXFCO1FBRXJCLDhDQUE4QztRQUM5QyxrQkFBa0I7UUFFbEIsOEVBQThFO1FBQzlFLG1CQUFtQjtLQUNuQixDQUFDO0lBRUYsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBRWxDLHFEQUFxRDtRQUNyRCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUVqRSxpREFBaUQ7UUFDakQsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELE1BQU0sK0JBQStCLEdBQUc7UUFFdkMsbUdBQW1HO1FBQ25HLHFCQUFxQjtRQUVyQiw0R0FBNEc7UUFDNUcsV0FBVztRQUVYLHVDQUF1QztRQUN2Qyw0QkFBNEI7S0FDNUIsQ0FBQztJQUVGLG1CQUFtQjtJQUNuQixNQUFNLFVBQVUsR0FBRyxrQkFBa0IsRUFBRSxDQUFDO0lBRXhDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxvQ0FBb0M7UUFDcEMsSUFBSSwyQkFBMkIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN6RCxJQUFJLFNBQVMsS0FBSyxJQUFJLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNoRCxJQUFJLE9BQU8sS0FBSywrQkFBK0IsRUFBRSxDQUFDO29CQUNqRCxHQUFHLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLGdDQUFnQztnQkFDcEUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxPQUFPLEtBQUssZ0JBQWdCLEVBQUUsQ0FBQztvQkFDbEMsaUJBQWlCO29CQUNqQix5REFBeUQ7b0JBQ3pELElBQUksaUJBQWlCLEdBQUcsU0FBUyxDQUFDO29CQUNsQyxJQUFJLFNBQVMsS0FBSyxPQUFPLElBQUksU0FBUyxLQUFLLGVBQWUsRUFBRSxDQUFDO3dCQUM1RCxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztvQkFDdkMsQ0FBQztvQkFDRCxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDMUQsQ0FBQztxQkFBTSxDQUFDO29CQUNQLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsNENBQTRDO2FBQ3ZDLElBQUksK0JBQStCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbEUsUUFBUSxPQUFPLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxxQkFBcUI7b0JBQ3pCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUM5QixTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6RyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyw2RkFBNkYsQ0FBQyxDQUFDO29CQUM5RyxDQUFDO29CQUNELE1BQU07Z0JBRVAsS0FBSyxXQUFXO29CQUNmLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7d0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDdkMsQ0FBQzt5QkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3QkFDckMsS0FBSyxNQUFNLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQzs0QkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNuQyxDQUFDO29CQUNGLENBQUM7b0JBQ0QsTUFBTTtnQkFFUCxLQUFLLDRCQUE0QjtvQkFDaEMsSUFBSSxTQUFTLEVBQUUsQ0FBQzt3QkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUNuRCxDQUFDO29CQUNELE1BQU07WUFDUixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsbURBQW1EO0lBQ25ELDZKQUE2SjtJQUM3SixnRkFBZ0Y7SUFDaEYsZ0ZBQWdGO0lBQ2hGLE1BQU0sZ0JBQWdCLEdBQ3JCLHFHQUFxRyxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7SUFDMUosR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVsRSxvREFBb0Q7SUFDcEQsaUtBQWlLO0lBQ2pLLE1BQU0saUJBQWlCLEdBQ3RCLCtCQUErQixHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7SUFDckYsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUVwRSwrQkFBK0I7SUFDL0Isd0pBQXdKO0lBQ3hKLG1KQUFtSjtJQUNuSixNQUFNLHNCQUFzQixHQUMzQixtREFBbUQsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDO0lBQy9HLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLHdCQUF3QixFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFFL0UsbUJBQW1CO0lBQ25CLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ2IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsK0RBQStEO0lBQy9ELDhGQUE4RjtJQUM5RixHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVqRSxPQUFPLFVBQVUsQ0FBQztBQUNuQixDQUFDO0FBaUJELFNBQVMsa0JBQWtCO0lBRTFCLG9FQUFvRTtJQUNwRSxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNDLElBQUksVUFBVSxHQUE0QixTQUFTLENBQUM7SUFDcEQsSUFBSSxDQUFDO1FBQ0osVUFBVSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN0QywyQkFBMkIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QyxDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0RBQWtELGNBQWMsK0JBQStCLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDdkgsQ0FBQztJQUNGLENBQUM7SUFFRCxzQkFBc0I7SUFDdEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pCLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLDJCQUEyQixDQUFDLGNBQXNCO0lBQzFELElBQUksQ0FBQztRQUVKLG1DQUFtQztRQUNuQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsdUJBQXVCO1FBQ3ZCLE1BQU0sd0JBQXdCLEdBQUc7WUFDaEMsNEZBQTRGO1lBQzVGLDJGQUEyRjtZQUMzRixzQkFBc0I7WUFDdEIsSUFBSTtZQUNKLDBEQUEwRDtZQUMxRCxJQUFJO1lBQ0osNERBQTREO1lBQzVELEdBQUc7WUFDSCx1RUFBdUU7WUFDdkUsdUVBQXVFO1lBQ3ZFLDJDQUEyQztZQUMzQyxHQUFHO1NBQ0gsQ0FBQztRQUVGLGdEQUFnRDtRQUNoRCxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxjQUFjLCtCQUErQixLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzFILENBQUM7QUFDRixDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDekIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3RELElBQUksY0FBYyxFQUFFLENBQUM7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztJQUM1QyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUMvQixjQUFjLEdBQUcsR0FBRyxjQUFjLE1BQU0sQ0FBQztJQUMxQyxDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxjQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVELFNBQVMsc0JBQXNCO0lBQzlCLElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDOUQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLElBQUksc0JBQXNCLEVBQUUsQ0FBQztRQUM1QixzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxzQkFBc0IsOERBQThELENBQUMsQ0FBQztZQUNqSCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUM7Z0JBQ0osRUFBRSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsc0JBQXNCLHlGQUF5RixDQUFDLENBQUM7Z0JBQzVJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDO1FBQ0YsQ0FBQztRQUVELG1FQUFtRTtRQUNuRSxvREFBb0Q7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrRkFBa0Ysc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQ3pILEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELDhEQUE4RDtTQUN6RCxDQUFDO1FBQ0wsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNwQyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2YsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELE1BQU0sT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQztZQUMvQyxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDakQsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDeEQsTUFBTSxXQUFXLEdBQUcsaUVBQWlFLENBQUM7WUFDdEYsSUFBSSxlQUFlLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO2dCQUMxRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNmLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN0QixLQUFLLEtBQUs7NEJBQ1QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFDbkMsTUFBTTt3QkFDUCxLQUFLLE9BQU87NEJBQ1gsU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDckMsTUFBTTtvQkFDUixDQUFDO2dCQUNGLENBQUM7cUJBQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzt3QkFDcEMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUMzQyxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ3RCLEtBQUssS0FBSztnQ0FDVCxTQUFTLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNoQyxNQUFNOzRCQUNQLEtBQUssT0FBTztnQ0FDWCxTQUFTLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dDQUN0QyxNQUFNO3dCQUNSLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO3FCQUFNLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ3BCLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDM0csa0ZBQWtGO2dCQUNsRixzREFBc0Q7Z0JBQ3RELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsMkRBQTJEO29CQUMzRCxxREFBcUQ7b0JBQ3JELG9DQUFvQztvQkFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQzlFLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFFRCx5Q0FBeUM7SUFDekMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUNqSCxNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxXQUFXLENBQUM7SUFDM0csTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxTQUFTLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ25HLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbkIsV0FBVztRQUNYLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXO1FBQzNFLFNBQVM7UUFDVCxjQUFjO1FBQ2QsUUFBUSxFQUFFLElBQUk7S0FDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsT0FBeUI7SUFDNUMsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBRTdCLGlFQUFpRTtJQUNqRSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxnREFBZ0Q7UUFDaEQsb0RBQW9EO1FBQ3BELG9HQUFvRztRQUNwRyxxQ0FBcUM7UUFDckMsa0RBQWtEO1FBQ2xELDJDQUEyQztRQUMzQyxrREFBa0Q7UUFDbEQsbUJBQW1CO1FBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3RELENBQUM7QUFFRCxTQUFTLFlBQVk7SUFDcEIsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtRQUM3QixNQUFNLEVBQUU7WUFDUCxlQUFlO1lBQ2YsUUFBUTtZQUNSLFVBQVU7WUFDViwwQkFBMEI7U0FDMUI7UUFDRCxPQUFPLEVBQUU7WUFDUiwwQkFBMEI7U0FDMUI7UUFDRCxPQUFPLEVBQUU7WUFDUixTQUFTLEVBQUUsSUFBSTtTQUNmO1FBQ0QsS0FBSyxFQUFFO1lBQ04sWUFBWSxFQUFFLFNBQVM7U0FDdkI7S0FDRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFFekI7OztPQUdHO0lBQ0gsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO0lBQ2pDLFVBQWtCLENBQUMsY0FBYyxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsS0FBSyxFQUFFLElBQUk7UUFDeEMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUVIOztPQUVHO0lBQ0gsTUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBQzlCLE1BQU0sU0FBUyxHQUNkLFVBQVUsS0FBcUMsRUFBRSxHQUFXO1FBQzNELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV2QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUU7UUFDL0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFRixVQUFrQixDQUFDLGFBQWEsQ0FBQyxHQUFHO1FBQ3BDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTFDLE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUMsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGdCQUFnQjtJQUV4QixtQ0FBbUM7SUFDbkMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELG9CQUFvQjtJQUNwQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNiLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBRUQsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEdBQXVCO0lBQ3ZELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDO1lBQ0osTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVsRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLFNBQVM7UUFDVixDQUFDO0lBQ0YsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxxQkFBcUI7QUFFckIsU0FBUyxlQUFlLENBQUMsU0FBaUI7SUFDekMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDaEMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2QyxzREFBc0Q7UUFDdEQsdURBQXVEO1FBQ3ZELDZEQUE2RDtRQUM3RCx1RUFBdUU7UUFDdkUsaUVBQWlFO1FBQ2pFLHFEQUFxRDtRQUNyRCxvREFBb0Q7UUFDcEQscURBQXFEO1FBQ3JELGdEQUFnRDtRQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNsQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsdUJBQXVCO0lBRXJDLGdEQUFnRDtJQUNoRCxxQ0FBcUM7SUFDckMseUNBQXlDO0lBRXpDLE1BQU0sZ0JBQWdCLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLE1BQU0sdUJBQXVCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUM3RixJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFDdEIsT0FBTyxnQkFBZ0IsQ0FBQztJQUN6QixDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELDRDQUE0QztJQUU1QyxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pCLE9BQU87WUFDTixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRO1lBQ1IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixtQkFBbUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQztZQUU5RCxpRkFBaUY7WUFDakYsTUFBTSxFQUFFLElBQUk7WUFDWixrQkFBa0IsRUFBRSxFQUFFO1NBQ3RCLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLFVBQVUsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFdkQsT0FBTyx1QkFBdUIsQ0FBQztRQUM5QixVQUFVO1FBQ1YsUUFBUTtRQUNSLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixZQUFZO1FBQ1osZUFBZSxFQUFFLFNBQVM7S0FDMUIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxVQUF1QjtJQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUNaLE9BQU8sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsMkNBQTJDO0lBQ3pFLENBQUM7SUFFRCxPQUFPLE9BQU8sVUFBVSxFQUFFLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUM3RixDQUFDO0FBRUQsWUFBWSJ9