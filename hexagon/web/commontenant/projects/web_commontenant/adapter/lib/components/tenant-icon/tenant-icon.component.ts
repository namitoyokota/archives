import { Component, HostBinding, Input } from '@angular/core';
import { Tenant$v1 } from '@galileo/web_commontenant/_common';

@Component({
    selector: 'hxgn-commontenant-icon',
    styleUrls: ['tenant-icon.component.scss'],
    template: ''
})
export class IconComponent {

    /** The size the icons should be. Can be px, or % ex 30px */
    @Input() size = '22px';

    /** The tenant that has the icon to be displayed. */
    @Input('tenant')
    set setTenant(tenant: Tenant$v1) {
        this.setTenantIcon(tenant, null);
    }

    /** Optional Icon url input. */
    @Input('url')
    set setUrl(url: string) {
        this.setTenantIcon(null, url);
    }

    /** Host binding icon to background image. */
    @HostBinding('style.background-image') iconURL: string;

    /** The size the icons should be. Can be px, or % ex 30px */
    @HostBinding('style.width') width = '0px';

    /** The size the icons should be. Can be px, or % ex 30px */
    @HostBinding('style.height') height = '0px';

    constructor() { }

    /**
     * Sets tenant icon
     * @param tenant Tenant info
     * @param url Icon url
     */
    setTenantIcon(tenant: Tenant$v1, url: string): void {
        if (tenant?.tenantIconUrl) {
            this.iconURL = `url(${tenant.tenantIconUrl})`;
        } else if (url) {
            this.iconURL = `url(${url})`;
        } else {
            this.iconURL = 'url(assets/commontenant-core/default-organization-icon.svg)';
        }

        this.height = this.size;
        this.width = this.size;
    }
}
