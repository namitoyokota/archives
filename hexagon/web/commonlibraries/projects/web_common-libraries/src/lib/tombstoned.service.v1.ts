import { Inject, Injectable } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { debounce, first } from 'rxjs/operators';
import { DescriptorList$v1 } from '@galileo/platform_common-libraries';
import { StatefulStoreService } from './stateful-store.v1';
import { StoreService } from './store.service';

/**
 * @deprecated Going forward tombstone services should be defined in a platform packaged using the tombstone manager in platform_common-lib
 * A service for managing tombstoned entities.
 */
@Injectable()
export abstract class CommonTombstonedService$v1<T> {

    /** Hold mapping of entity id to context ids that is consuming it */
    private locks = new Map<string, string[]>();

    /** Hold the tenant that owns the entity for use later in reconcile */
    private tenantLookup = new Map<string, string>();

    /** List of entity ids that fail to lock */
    private failedEntities: string[] = [];

    /** List of data calls that needs to be made */
    private dataCallList: DescriptorList$v1[] = [];

    /** List of ids for data */
    private dataCallIds: string[] = [];

    private dataCall$ = new Subject<void>();

    constructor( @Inject('entityStore') private entityStore: StoreService<T> | StatefulStoreService<T>) { 


        // Debounce data calls to load in missing data
        this.dataCall$.pipe(
            debounce(() => interval(200))
        ).subscribe(() => {
            const updateList = [];
            const ids = [].concat(this.dataCallIds);
            this.dataCallIds = [];

            // Remove dups
            this.dataCallList.forEach(item => {
                if (!updateList.some(i => i.id === item.id)) {
                    updateList.push(item);
                }
            });

            this.dataCallList = [];
            
            this.getEntitiesAsync(updateList).then(data => {
                let tombstonedList: T[] = data;

                // Also check the store
                ids.forEach(id => {
                    const a = this.entityStore.snapshot(id);
                    if (a) {
                        tombstonedList.push(a);
                    }
                });
                tombstonedList = tombstonedList.filter(item => !!item);

                // Any ids that are not in the tombstoned list failed to load and never try it again
                for (const id of ids) {
                    // Find it
                    if (!tombstonedList.find((item: any) => item.id === id)) {
                        // This id would not lock
                        this.failedEntities = this.failedEntities.concat([id]);
                    }
                }

                if (tombstonedList.length) {
                    // Add to store and then add to entities
                    this.entityStore.upsert(tombstonedList);
                }
            }).catch(err => null);

            
        });
    }

    /**
     * Get List of entities by descriptors
     * @param list List of descriptors to get entities by
     */
    abstract getEntitiesAsync(list: DescriptorList$v1[]): Promise<T[]>;

    /**
     * Locks ids to the store. Will load any tombstoned entities that are not already in the store.
     * @param ids List of entity ids to lock
     * @param contextId Id of the context that is using the data
     * @param ownerTenantId Id of the tenant that owns the entity
     */
    async lockAsync(ids: string[], contextId: string, ownerTenantId: string) {

        // Loop over ids and save the tenant info
        ids.forEach(eId => {
            this.tenantLookup.set(eId, ownerTenantId);
        });

        // Filter out failed entity ids
        ids = ids.filter(id => {
            return !this.failedEntities.find(fId => fId === id);
        });

        this.dataCallIds = [...new Set(this.dataCallIds.concat(ids))];

        // If there is already a lock for this context updated the lock
        if (this.locks.has(contextId)) {
            // Remove any ids that are not needed anymore
            let lockedIds = this.locks.get(contextId);
            if (lockedIds?.length) {
                lockedIds = lockedIds.filter(id => !ids.find(i => i === id));

                if (lockedIds.length) {
                    // Release the locks
                    lockedIds.forEach(id => {
                        this.remove(id, contextId);
                    });
                }
            }

            const filterEntities = (await this.entityStore.entity$.pipe(first()).toPromise())
                .filter((i: any) => !!ids.find(id => id === i.id));

            /** Lock entities */
            filterEntities.forEach((entity: any) => {
                this.setLock(entity.id, contextId);
            });

            // Now go get missing entities (tombstoned items that have not been loaded)
            const missingIds = ids.filter(id => !filterEntities.find((entity: any) => entity.id === id));

            const list: DescriptorList$v1[] = [];
            missingIds.forEach(id => {
                if (!this.isLocked(id)) {
                    this.setLock(id, contextId);
                    list.push(new DescriptorList$v1({
                        id, tenantId: ownerTenantId
                    } as DescriptorList$v1));
                }
            });

            
            if (list.length) {
                this.dataCallList = this.dataCallList.concat(list);
                this.dataCall$.next();
            }
            
        } else {
            const list: DescriptorList$v1[] = [];
            for (const id of ids) {
                this.setLock(id, contextId);

                // Check if the entity needs to be loaded into the store
                const foundEntity = this.entityStore.snapshot(id);
                if (!foundEntity) {
                    // Load it
                    list.push(new DescriptorList$v1({
                        id, tenantId: ownerTenantId
                    } as DescriptorList$v1))
                }
            }

            if (list.length) {
                this.dataCallList = this.dataCallList.concat(list);
                this.dataCall$.next();
            }
        }
    }

    /**
     * Checks to make sure all locked data has been loaded. Useful to call after data has been reloaded
     */
     reconcileLocksAsync(): void {
        // Look at all locked items
        const list: DescriptorList$v1[] = [];
        this.locks.forEach((context, id) => {
            // Check if its in the store if now add it to the list
            if (!this.entityStore.snapshot(id)) {

                // Check the fail list
                if (!this.failedEntities.find(fId => fId === id)) {
                    list.push(new DescriptorList$v1({
                        id, tenantId: this.tenantLookup.get(id)
                    } as DescriptorList$v1))
                }
            }
        });

        if (list.length) {
            this.getEntitiesAsync(list).then(data => {
                this.entityStore.upsert(data.filter(d => !!d));
            }).catch(err => null);
        }

    }

    /**
     * Release the lock on the the tombstoned data. Allowing them to be cleaned up
     * @param contextId Id of the context that is using the data
     */
    release(contextId: string): void {

        this.locks.forEach((contextIds, entityId) => {
            if (!!contextIds.find(cId => cId === contextId)) {
                this.remove(entityId, contextId);
            }
        });
    }

    /**
     * Returns true if the entity is being used by some component
     * @param id entity id
     */
    isLocked(id: string): boolean {
        return this.locks.has(id);
    }

    /**
     * Locks a given entity to a context id
     * @param id entity id
     * @param contextId Context id
     */
    private setLock(id: string, contextId: string): void {
        let locks = this.locks.get(id);

        if (locks) {
            locks = locks.concat(contextId);
            this.locks.set(id, locks);
        } else {
            this.locks.set(id, [contextId]);
        }
    }

    /**
     * Removes an entity from the store if it is tombstoned and no longer used.
     * @param id entity Id
     * @param contextId Id of where the data is being used. Example list view's context id.
     */
    private remove(id: string, contextId: string): void {

        const entity = this.entityStore.snapshot(id) as any;

        // Remove lock for entity
        let currentLocks = this.locks.get(id);
        currentLocks = currentLocks.filter(item => item !== contextId);

        if (currentLocks.length) {
            this.locks.set(id, currentLocks);
        } else {
            this.locks.delete(id);

            // Clean up tenant mapping
            this.tenantLookup.delete(id);

            // Remove item from store if tombstoned
            if (entity?.tombstoned) {
                this.entityStore.remove(id);
            }
        }
    }


}

