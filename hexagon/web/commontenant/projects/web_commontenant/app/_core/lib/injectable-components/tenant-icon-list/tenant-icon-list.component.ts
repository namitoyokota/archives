import { Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, TenantIconListSettings$v1 } from '@galileo/web_commontenant/_common';

@Component({
    templateUrl: 'tenant-icon-list.component.html',
    styleUrls: ['tenant-icon-list.component.scss']
})
export class TenantIconListInjectableComponent {
    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public settings: TenantIconListSettings$v1) { }
}
