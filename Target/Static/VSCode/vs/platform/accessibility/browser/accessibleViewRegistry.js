/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export const AccessibleViewRegistry = new class AccessibleViewRegistry {
    constructor() {
        this._implementations = [];
    }
    register(implementation) {
        this._implementations.push(implementation);
        return {
            dispose: () => {
                const idx = this._implementations.indexOf(implementation);
                if (idx !== -1) {
                    this._implementations.splice(idx, 1);
                }
            }
        };
    }
    getImplementations() {
        return this._implementations;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZVZpZXdSZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2FjY2Vzc2liaWxpdHkvYnJvd3Nlci9hY2Nlc3NpYmxlVmlld1JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBa0JoRyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sc0JBQXNCO0lBQTVCO1FBQ3pDLHFCQUFnQixHQUFvQyxFQUFFLENBQUM7SUFpQnhELENBQUM7SUFmQSxRQUFRLENBQUMsY0FBNkM7UUFDckQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyxPQUFPO1lBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFDYixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztZQUNGLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjtRQUNqQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUM5QixDQUFDO0NBQ0QsQ0FBQyJ9