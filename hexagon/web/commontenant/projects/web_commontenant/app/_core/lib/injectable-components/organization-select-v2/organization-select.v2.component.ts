import { Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, OrganizationSelectSettings$v2 } from '@galileo/web_commontenant/_common';

@Component({
    template: `<hxgn-commontenant-organization-select-v2
        [selectedTenants]="settings.selectedTenants$ | async"
        (selectedTenantsChange)="setSelectedTenants($event)">
    </hxgn-commontenant-organization-select-v2>
    `,
    styles: [
        `
           :host {
                width: 100%;
                height: 100%;
            }
        `
    ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OrganizationSelectInjectableComponent$v2 {
    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public settings: OrganizationSelectSettings$v2) { }

    /**
     * Sets the selected tenants
     * @param tenants Tenants that are selected
     */
    setSelectedTenants(tenantIds: string[]) {
        this.settings.setSelectedTenants(tenantIds);
    }
}
