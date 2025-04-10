/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BrowserWindow } from 'electron';
import { convertAXTreeToMarkdown } from './cdpAccessibilityDomain.js';
import { Limiter } from '../../../base/common/async.js';
import { ResourceMap } from '../../../base/common/map.js';
export class NativeWebContentExtractorService {
    constructor() {
        // Only allow 3 windows to be opened at a time
        // to avoid overwhelming the system with too many processes.
        this._limiter = new Limiter(3);
        this._webContentsCache = new ResourceMap();
        this._cacheDuration = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > this._cacheDuration;
    }
    extract(uris) {
        if (uris.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.all(uris.map((uri) => this._limiter.queue(() => this.doExtract(uri))));
    }
    async doExtract(uri) {
        const cached = this._webContentsCache.get(uri);
        if (cached) {
            if (this.isExpired(cached)) {
                this._webContentsCache.delete(uri);
            }
            else {
                return cached.content;
            }
        }
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                javascript: false,
                offscreen: true,
                sandbox: true,
                webgl: false
            }
        });
        try {
            await win.loadURL(uri.toString(true));
            win.webContents.debugger.attach('1.1');
            const result = await win.webContents.debugger.sendCommand('Accessibility.getFullAXTree');
            const str = convertAXTreeToMarkdown(uri, result.nodes);
            this._webContentsCache.set(uri, { content: str, timestamp: Date.now() });
            return str;
        }
        catch (err) {
            console.log(err);
        }
        finally {
            win.destroy();
        }
        return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViQ29udGVudEV4dHJhY3RvclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93ZWJDb250ZW50RXh0cmFjdG9yL2VsZWN0cm9uLW1haW4vd2ViQ29udGVudEV4dHJhY3RvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUd6QyxPQUFPLEVBQVUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTzFELE1BQU0sT0FBTyxnQ0FBZ0M7SUFBN0M7UUFHQyw4Q0FBOEM7UUFDOUMsNERBQTREO1FBQ3BELGFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FBUyxDQUFDLENBQUMsQ0FBQztRQUNsQyxzQkFBaUIsR0FBRyxJQUFJLFdBQVcsRUFBYyxDQUFDO1FBQ3pDLG1CQUFjLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsd0JBQXdCO0lBZ0RoRixDQUFDO0lBOUNRLFNBQVMsQ0FBQyxLQUFpQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDM0QsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFXO1FBQ2xCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQVE7UUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1osSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksYUFBYSxDQUFDO1lBQzdCLEtBQUssRUFBRSxHQUFHO1lBQ1YsTUFBTSxFQUFFLEdBQUc7WUFDWCxJQUFJLEVBQUUsS0FBSztZQUNYLGNBQWMsRUFBRTtnQkFDZixVQUFVLEVBQUUsS0FBSztnQkFDakIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsS0FBSyxFQUFFLEtBQUs7YUFDWjtTQUNELENBQUMsQ0FBQztRQUNILElBQUksQ0FBQztZQUNKLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sTUFBTSxHQUF3QixNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQzlHLE1BQU0sR0FBRyxHQUFHLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7Z0JBQVMsQ0FBQztZQUNWLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7Q0FDRCJ9