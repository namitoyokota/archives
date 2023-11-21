import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Utils } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Tenant$v1, TranslationGroup } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from '../../commontenant-adapter.v1.service';
import { SelectionTranslationTokens } from './tenant-selection.translation';

@Component({
    selector: 'hxgn-commontenant-selection',
    templateUrl: 'tenant-selection.component.html',
    styleUrls: ['tenant-selection.component.scss']
})
export class TenantSelectionComponent implements OnInit, OnDestroy {
    /**List of all tenant ids to show as options */
    @Input() tenantIds: string[] = [];

    /** A flag that is true if component is read only */
    @Input() readOnly = false;

    /** Event when the selected tenants change */
    @Output() selectionChange = new EventEmitter<Tenant$v1[]>();

    /** List of all tenants based off passed in tenant ids */
    tenants: Tenant$v1[] = [];

    /** List of selected tenants */
    selectedTenants: Tenant$v1[] = [];

    /** Expose tokens to HTML */
    tokens: typeof SelectionTranslationTokens = SelectionTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private tenantSrv: CommontenantAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) {
        this.localizationSrv.localizeGroup(TranslationGroup.main);
    }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        for (const t of this.tenantIds) {
            const tenant = await this.tenantSrv.getTenantAsync(t);
            if (tenant) {
                this.tenants.push(await this.tenantSrv.getTenantAsync(t));
                this.selectedTenants = Utils.deepCopy(this.tenants);
            }
        }

        this.selectionChange.emit(this.selectedTenants);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeGroup(TranslationGroup.main);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Prevent click event from propagating
     */
    stop() {
        event.stopPropagation();
    }

    /**
     * Returns true if tenant is selected
     * @param id The tenant id to check if is selected
     */
    isChecked(id: string): boolean {
        return !!this.selectedTenants.find(item => item.id === id);
    }

    /**
     * Sets the select state for a tenant
     * @param event Angular Material checkbox change event
     * @param tenant The tenant the event is for
     */
    setIsChecked(event: MatCheckboxChange, tenant: Tenant$v1) {
        if (event.checked) {
            this.selectedTenants.push(Utils.deepCopy(tenant));
        } else {
            const index = this.selectedTenants.findIndex(t => tenant.id === t.id);
            this.selectedTenants.splice(index, 1);
        }
        this.selectionChange.emit(this.selectedTenants);
    }

    /**
     * Sets the selected tenants by id
     * @param ids Tenant ids
     */
    setSelectedTenants(ids: string[]) {
        this.selectedTenants = this.tenants.filter((tenant) => {
            return !!ids?.find(id => id === tenant.id);
        });
    }

    /** gets the urls of the selected tenants */
    getUrlList() {
        return this.selectedTenants?.map(x => x?.tenantIconUrl);
    }
}
