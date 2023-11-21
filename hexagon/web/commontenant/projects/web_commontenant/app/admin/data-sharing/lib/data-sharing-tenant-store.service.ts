import { Injectable } from '@angular/core';
import { Tenant$v1 } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Data store for the tenant that data sharing is being
 * configured for. This does not take place of the tenant store, but
 * works with it to track data sharing specific changes to the user's
 * active tenant.
 */
@Injectable()
export class DataSharingTenantStoreService {

    /** The source of truth for tenant. */
    private source = new BehaviorSubject<Tenant$v1>(null);

    /** The current state of the tenant. Can and will contain changes that have not been saved*/
    private valueChanges = new BehaviorSubject<Tenant$v1>(null);

    /** The current state of the tenant */
    valueChanges$ = this.valueChanges.asObservable();

    /** The source of truth for tenant. */
    source$ = this.source.asObservable();

    /** Is true when there are unsaved changes */
    isDirty$ = combineLatest([
        this.source.asObservable(),
        this.valueChanges$
    ]).pipe(
        map(([source, valueChanges]) => {
            // Check if tenant objects are equal
            return !this.isEqual(source, valueChanges);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    constructor() { }

    /**
     * Sets the source's value. The value changed will be synced to be a copy of the source
     * @param tenant The tenant to set as the source
     */
    setSource(tenant: Tenant$v1): void {
        this.source.next(new Tenant$v1(tenant));
        this.valueChanges.next(new Tenant$v1(tenant));
    }

    /**
     * Discard any changes made to the store. Resets the values changes to
     * be the same as the source.
     */
     discardChanges(): void {

        const source = new Tenant$v1(this.source.getValue());
        this.valueChanges.next(source);
    }

    /**
     * Updates the tenant object in the store. This will not update the source, but will
     * update the working value of tenant.
     * @param tenant Updated tenant object
     */
    update(tenant: Tenant$v1): void {
        this.valueChanges.next(new Tenant$v1(tenant));
    }

    /**
     * Compares two tenant objects. Returns true if they are both the same.
     * @param tenantA First tenant object
     * @param tenantB Second tenant object
     */
    private isEqual(tenantA: Tenant$v1, tenantB: Tenant$v1): boolean {
        const strA = JSON.stringify(tenantA);
        const strB = JSON.stringify(tenantB);

        return strA === strB;
    }
}
