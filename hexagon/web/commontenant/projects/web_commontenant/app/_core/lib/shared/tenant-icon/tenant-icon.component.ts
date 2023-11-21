import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { Tenant$v1 } from '@galileo/web_commontenant/_common';

@Component({
    selector: 'hxgn-commontenant-tenant-icon',
    styleUrls: ['tenant-icon.component.scss'],
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantIconComponent implements OnInit, OnChanges {

    /** The size the icons should be. Can be px, or % ex 30px */
    @Input() size = '22px';

    /** Tenant object */
    @Input() tenant: Tenant$v1;

    /** Optional Icon url input. */
    @Input() url: string;

    /** URL of icon */
    @HostBinding('style.background-image') iconURL: string;

    /** The size the icons should be. Can be px, or % ex 30px */
    @HostBinding('style.width') width = '0px';

    /** The size the icons should be. Can be px, or % ex 30px */
    @HostBinding('style.height') height = '0px';

    constructor(private cdr: ChangeDetectorRef) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        setTimeout(() => {
            this.init();
        });
    }

    /**
     * On changes lifecycle hook
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.init();
    }

    private init() {
        if (this.tenant && this.tenant.tenantIconUrl) {
            this.iconURL = `url(${this.tenant.tenantIconUrl})`;
        } else if (this.url) {
            this.iconURL = `url(${this.url})`;
        } else {
            this.iconURL = 'url(assets/commontenant-core/default-organization-icon.svg)';
        }
        this.height = this.size;
        this.width = this.size;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }
}
