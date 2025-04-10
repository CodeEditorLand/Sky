"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable no-restricted-globals */
(async function () {
    // Add a perf entry right from the top
    performance.mark('code/didStartRenderer');
    const bootstrapWindow = window.MonacoBootstrapWindow; // defined by bootstrap-window.ts
    const preloadGlobals = window.vscode; // defined by preload.ts
    //#region Splash Screen Helpers
    function showSplash(configuration) {
        performance.mark('code/willShowPartsSplash');
        let data = configuration.partsSplash;
        if (data) {
            if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
                if ((configuration.colorScheme.dark && data.baseTheme !== 'hc-black') || (!configuration.colorScheme.dark && data.baseTheme !== 'hc-light')) {
                    data = undefined; // high contrast mode has been turned by the OS -> ignore stored colors and layouts
                }
            }
            else if (configuration.autoDetectColorScheme) {
                if ((configuration.colorScheme.dark && data.baseTheme !== 'vs-dark') || (!configuration.colorScheme.dark && data.baseTheme !== 'vs')) {
                    data = undefined; // OS color scheme is tracked and has changed
                }
            }
        }
        // developing an extension -> ignore stored layouts
        if (data && configuration.extensionDevelopmentPath) {
            data.layoutInfo = undefined;
        }
        // minimal color configuration (works with or without persisted data)
        let baseTheme;
        let shellBackground;
        let shellForeground;
        if (data) {
            baseTheme = data.baseTheme;
            shellBackground = data.colorInfo.editorBackground;
            shellForeground = data.colorInfo.foreground;
        }
        else if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
            if (configuration.colorScheme.dark) {
                baseTheme = 'hc-black';
                shellBackground = '#000000';
                shellForeground = '#FFFFFF';
            }
            else {
                baseTheme = 'hc-light';
                shellBackground = '#FFFFFF';
                shellForeground = '#000000';
            }
        }
        else if (configuration.autoDetectColorScheme) {
            if (configuration.colorScheme.dark) {
                baseTheme = 'vs-dark';
                shellBackground = '#1E1E1E';
                shellForeground = '#CCCCCC';
            }
            else {
                baseTheme = 'vs';
                shellBackground = '#FFFFFF';
                shellForeground = '#000000';
            }
        }
        const style = document.createElement('style');
        style.className = 'initialShellColors';
        window.document.head.appendChild(style);
        style.textContent = `body {	background-color: ${shellBackground}; color: ${shellForeground}; margin: 0; padding: 0; }`;
        // set zoom level as soon as possible
        if (typeof data?.zoomLevel === 'number' && typeof preloadGlobals?.webFrame?.setZoomLevel === 'function') {
            preloadGlobals.webFrame.setZoomLevel(data.zoomLevel);
        }
        // restore parts if possible (we might not always store layout info)
        if (data?.layoutInfo) {
            const { layoutInfo, colorInfo } = data;
            const splash = document.createElement('div');
            splash.id = 'monaco-parts-splash';
            splash.className = baseTheme ?? 'vs-dark';
            if (layoutInfo.windowBorder && colorInfo.windowBorder) {
                const borderElement = document.createElement('div');
                borderElement.style.position = 'absolute';
                borderElement.style.width = 'calc(100vw - 2px)';
                borderElement.style.height = 'calc(100vh - 2px)';
                borderElement.style.zIndex = '1'; // allow border above other elements
                borderElement.style.border = `1px solid var(--window-border-color)`;
                borderElement.style.setProperty('--window-border-color', colorInfo.windowBorder);
                if (layoutInfo.windowBorderRadius) {
                    borderElement.style.borderRadius = layoutInfo.windowBorderRadius;
                }
                splash.appendChild(borderElement);
            }
            // ensure there is enough space
            layoutInfo.auxiliarySideBarWidth = Math.min(layoutInfo.auxiliarySideBarWidth, window.innerWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth + layoutInfo.sideBarWidth));
            layoutInfo.sideBarWidth = Math.min(layoutInfo.sideBarWidth, window.innerWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth + layoutInfo.auxiliarySideBarWidth));
            // part: title
            if (layoutInfo.titleBarHeight > 0) {
                const titleDiv = document.createElement('div');
                titleDiv.style.position = 'absolute';
                titleDiv.style.width = '100%';
                titleDiv.style.height = `${layoutInfo.titleBarHeight}px`;
                titleDiv.style.left = '0';
                titleDiv.style.top = '0';
                titleDiv.style.backgroundColor = `${colorInfo.titleBarBackground}`;
                titleDiv.style['-webkit-app-region'] = 'drag';
                splash.appendChild(titleDiv);
                if (colorInfo.titleBarBorder) {
                    const titleBorder = document.createElement('div');
                    titleBorder.style.position = 'absolute';
                    titleBorder.style.width = '100%';
                    titleBorder.style.height = '1px';
                    titleBorder.style.left = '0';
                    titleBorder.style.bottom = '0';
                    titleBorder.style.borderBottom = `1px solid ${colorInfo.titleBarBorder}`;
                    titleDiv.appendChild(titleBorder);
                }
            }
            // part: activity bar
            if (layoutInfo.activityBarWidth > 0) {
                const activityDiv = document.createElement('div');
                activityDiv.style.position = 'absolute';
                activityDiv.style.width = `${layoutInfo.activityBarWidth}px`;
                activityDiv.style.height = `calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px)`;
                activityDiv.style.top = `${layoutInfo.titleBarHeight}px`;
                if (layoutInfo.sideBarSide === 'left') {
                    activityDiv.style.left = '0';
                }
                else {
                    activityDiv.style.right = '0';
                }
                activityDiv.style.backgroundColor = `${colorInfo.activityBarBackground}`;
                splash.appendChild(activityDiv);
                if (colorInfo.activityBarBorder) {
                    const activityBorderDiv = document.createElement('div');
                    activityBorderDiv.style.position = 'absolute';
                    activityBorderDiv.style.width = '1px';
                    activityBorderDiv.style.height = '100%';
                    activityBorderDiv.style.top = '0';
                    if (layoutInfo.sideBarSide === 'left') {
                        activityBorderDiv.style.right = '0';
                        activityBorderDiv.style.borderRight = `1px solid ${colorInfo.activityBarBorder}`;
                    }
                    else {
                        activityBorderDiv.style.left = '0';
                        activityBorderDiv.style.borderLeft = `1px solid ${colorInfo.activityBarBorder}`;
                    }
                    activityDiv.appendChild(activityBorderDiv);
                }
            }
            // part: side bar
            if (layoutInfo.sideBarWidth > 0) {
                const sideDiv = document.createElement('div');
                sideDiv.style.position = 'absolute';
                sideDiv.style.width = `${layoutInfo.sideBarWidth}px`;
                sideDiv.style.height = `calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px)`;
                sideDiv.style.top = `${layoutInfo.titleBarHeight}px`;
                if (layoutInfo.sideBarSide === 'left') {
                    sideDiv.style.left = `${layoutInfo.activityBarWidth}px`;
                }
                else {
                    sideDiv.style.right = `${layoutInfo.activityBarWidth}px`;
                }
                sideDiv.style.backgroundColor = `${colorInfo.sideBarBackground}`;
                splash.appendChild(sideDiv);
                if (colorInfo.sideBarBorder) {
                    const sideBorderDiv = document.createElement('div');
                    sideBorderDiv.style.position = 'absolute';
                    sideBorderDiv.style.width = '1px';
                    sideBorderDiv.style.height = '100%';
                    sideBorderDiv.style.top = '0';
                    sideBorderDiv.style.right = '0';
                    if (layoutInfo.sideBarSide === 'left') {
                        sideBorderDiv.style.borderRight = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    else {
                        sideBorderDiv.style.left = '0';
                        sideBorderDiv.style.borderLeft = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    sideDiv.appendChild(sideBorderDiv);
                }
            }
            // part: auxiliary sidebar
            if (layoutInfo.auxiliarySideBarWidth > 0) {
                const auxSideDiv = document.createElement('div');
                auxSideDiv.style.position = 'absolute';
                auxSideDiv.style.width = `${layoutInfo.auxiliarySideBarWidth}px`;
                auxSideDiv.style.height = `calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px)`;
                auxSideDiv.style.top = `${layoutInfo.titleBarHeight}px`;
                if (layoutInfo.sideBarSide === 'left') {
                    auxSideDiv.style.right = '0';
                }
                else {
                    auxSideDiv.style.left = '0';
                }
                auxSideDiv.style.backgroundColor = `${colorInfo.sideBarBackground}`;
                splash.appendChild(auxSideDiv);
                if (colorInfo.sideBarBorder) {
                    const auxSideBorderDiv = document.createElement('div');
                    auxSideBorderDiv.style.position = 'absolute';
                    auxSideBorderDiv.style.width = '1px';
                    auxSideBorderDiv.style.height = '100%';
                    auxSideBorderDiv.style.top = '0';
                    if (layoutInfo.sideBarSide === 'left') {
                        auxSideBorderDiv.style.left = '0';
                        auxSideBorderDiv.style.borderLeft = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    else {
                        auxSideBorderDiv.style.right = '0';
                        auxSideBorderDiv.style.borderRight = `1px solid ${colorInfo.sideBarBorder}`;
                    }
                    auxSideDiv.appendChild(auxSideBorderDiv);
                }
            }
            // part: statusbar
            if (layoutInfo.statusBarHeight > 0) {
                const statusDiv = document.createElement('div');
                statusDiv.style.position = 'absolute';
                statusDiv.style.width = '100%';
                statusDiv.style.height = `${layoutInfo.statusBarHeight}px`;
                statusDiv.style.bottom = '0';
                statusDiv.style.left = '0';
                if (configuration.workspace && colorInfo.statusBarBackground) {
                    statusDiv.style.backgroundColor = colorInfo.statusBarBackground;
                }
                else if (!configuration.workspace && colorInfo.statusBarNoFolderBackground) {
                    statusDiv.style.backgroundColor = colorInfo.statusBarNoFolderBackground;
                }
                splash.appendChild(statusDiv);
                if (colorInfo.statusBarBorder) {
                    const statusBorderDiv = document.createElement('div');
                    statusBorderDiv.style.position = 'absolute';
                    statusBorderDiv.style.width = '100%';
                    statusBorderDiv.style.height = '1px';
                    statusBorderDiv.style.top = '0';
                    statusBorderDiv.style.borderTop = `1px solid ${colorInfo.statusBarBorder}`;
                    statusDiv.appendChild(statusBorderDiv);
                }
            }
            window.document.body.appendChild(splash);
        }
        performance.mark('code/didShowPartsSplash');
    }
    //#endregion
    const { result, configuration } = await bootstrapWindow.load('vs/workbench/workbench.desktop.main', {
        configureDeveloperSettings: function (windowConfig) {
            return {
                // disable automated devtools opening on error when running extension tests
                // as this can lead to nondeterministic test execution (devtools steals focus)
                forceDisableShowDevtoolsOnError: typeof windowConfig.extensionTestsPath === 'string' || windowConfig['enable-smoke-test-driver'] === true,
                // enable devtools keybindings in extension development window
                forceEnableDeveloperKeybindings: Array.isArray(windowConfig.extensionDevelopmentPath) && windowConfig.extensionDevelopmentPath.length > 0,
                removeDeveloperKeybindingsAfterLoad: true
            };
        },
        beforeImport: function (windowConfig) {
            // Show our splash as early as possible
            showSplash(windowConfig);
            // Code windows have a `vscodeWindowId` property to identify them
            Object.defineProperty(window, 'vscodeWindowId', {
                get: () => windowConfig.windowId
            });
            // It looks like browsers only lazily enable
            // the <canvas> element when needed. Since we
            // leverage canvas elements in our code in many
            // locations, we try to help the browser to
            // initialize canvas when it is idle, right
            // before we wait for the scripts to be loaded.
            window.requestIdleCallback(() => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context?.clearRect(0, 0, canvas.width, canvas.height);
                canvas.remove();
            }, { timeout: 50 });
            // Track import() perf
            performance.mark('code/willLoadWorkbenchMain');
        }
    });
    // Mark start of workbench
    performance.mark('code/didLoadWorkbenchMain');
    // Load workbench
    result.main(configuration);
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vRDovRGV2ZWxvcGVyL0FwcGxpY2F0aW9uL0NvZGVFZGl0b3JMYW5kL0xhbmQvRGVwZW5kZW5jeS9NaWNyb3NvZnQvRGVwZW5kZW5jeS9FZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsidnMvY29kZS9lbGVjdHJvbi1zYW5kYm94L3dvcmtiZW5jaC93b3JrYmVuY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHO0FBRWhHLDBDQUEwQztBQUUxQyxDQUFDLEtBQUs7SUFFTCxzQ0FBc0M7SUFDdEMsV0FBVyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBTzFDLE1BQU0sZUFBZSxHQUFzQixNQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBRSxpQ0FBaUM7SUFDbkgsTUFBTSxjQUFjLEdBQStCLE1BQWMsQ0FBQyxNQUFNLENBQUMsQ0FBSSx3QkFBd0I7SUFFckcsK0JBQStCO0lBRS9CLFNBQVMsVUFBVSxDQUFDLGFBQXlDO1FBQzVELFdBQVcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUU3QyxJQUFJLElBQUksR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO1FBQ3JDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVixJQUFJLGFBQWEsQ0FBQyxzQkFBc0IsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwRixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUM3SSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsbUZBQW1GO2dCQUN0RyxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxJQUFJLGFBQWEsQ0FB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