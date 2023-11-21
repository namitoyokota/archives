import { Injectable } from '@angular/core';
import { CriteriaType$v1, SharingCriteria$v1 } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable()
export class SharingCriteriaStoreService {

    /** The source of truth for sharing criteria that matches the database */
    private source = new BehaviorSubject<SharingCriteria$v1<any, any>[]>([]);

    /** The current state of the sharing criteria. Can contain changes that have not been saved */
    private valueChanges = new BehaviorSubject<SharingCriteria$v1<any, any>[]>([]);

    /** The current state of the sharing criteria */
    valueChanges$ = this.valueChanges.asObservable();

    /** Sharing criteria that has been updated */
    valueChangeUpdates$ = combineLatest([
        this.source.asObservable(),
        this.valueChanges$
    ]).pipe(
        map(([source, changes]) => {
            // Look for updates
            // Compare criteria that is in the source to changes
            let updates: SharingCriteria$v1<any, any>[] = [];
            updates = changes.filter(u => {
                const sourceItem = source.find(s => s.referenceId === u.referenceId);
                if (sourceItem) {
                    return !this.isEqual(sourceItem, u);
                } else {
                    return false;
                }
            });

            return updates;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /** Sharing criteria that has been inserted */
    valueChangeInserts$ = combineLatest([
        this.source.asObservable(),
        this.valueChanges$
    ]).pipe(
        map(([source, changes]) => {
            // Return any criteria that is not in the source
            let inserts: SharingCriteria$v1<any, any>[] = [];
            inserts = changes.filter(criteria => {
                // Return true if the criteria is not in the source
                return !(!!source.find(c => c.referenceId === criteria.referenceId));
            });

            return inserts;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /** Sharing criteria that has been deleted */
    valueChangeDeletes$ = combineLatest([
        this.source.asObservable(),
        this.valueChanges$
    ]).pipe(
        map(([source, changes]) => {
            // Return any criteria that is in the source but not in changes
            let deletes: SharingCriteria$v1<any, any>[] = [];
            deletes = source.filter(criteria => {
                // Return true if the criteria is no longer in source
                return !(!!changes.find(c => c.referenceId === criteria.referenceId));
            });

            return deletes;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /** Is true when there are unsaved changes */
    isDirty$ = combineLatest([
        this.valueChangeUpdates$,
        this.valueChangeInserts$,
        this.valueChangeDeletes$
    ]).pipe(
        map(([updates, inserts, deletes]) => {
            return !!updates?.length || !!inserts?.length || !!deletes?.length;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /**
     * Sets the source's value. This should always match the database. The values changed
     * will be synced to be a copy of the source.
     * @param sharingCriteria The sharing criteria to set as the source
     */
    setSource(sharingCriteria: SharingCriteria$v1<any, any>[]): void {

        // Set the source value
        this.source.next(sharingCriteria.map(c => new SharingCriteria$v1<any, any>(c)));

        // Set the value changes value
        this.valueChanges.next(sharingCriteria.map(c => new SharingCriteria$v1<any, any>(c)));
    }

    /**
     * Sets the value changes data. This is useful if lots of changes has been made in bulk (such as a wizard) and the unsaved
     * changes values needs to be updated. This will update the source
     * @param sharingCriteria The sharing criteria to set as values changed
     */
    setValueChanges(sharingCriteria: SharingCriteria$v1<any, any>[]): void {
        // Set the value changes value
        this.valueChanges.next(sharingCriteria.map(c => new SharingCriteria$v1<any, any>(c)));
    }

    /**
     * Commit given changes to source. For the given ids it takes the values found in values changes and
     * sets it on the source. If ids are not found in the values changed list then they will be removed from the source.
     */
    commit(ids: string[]): void {
        // Get list of items to upsert into the source
        const upsertList = this.valueChanges.getValue().filter(item => !!ids.find(id => id === item.referenceId));
        if (upsertList?.length) {
            this.upsertSourceCriteria(upsertList);
        }

        // Deal with items that have been removed from value changes
        const currentIds = this.valueChanges.getValue().map(item => item.referenceId);
        const removeList = ids.filter(id => !(!!currentIds.find(cId => cId === id)));

        if (removeList?.length) {
            this.deleteSourceCriteria(removeList);
        }
    }

    /**
     * Discard any changes made to the store. Resets the values changes to
     * be the same as the source.
     */
    discardChanges(): void {

        const source = this.source.getValue().map(c => new SharingCriteria$v1<any, any>(c));
        this.valueChanges.next(source);
    }

    /**
     * Updates or inserts changes to sharing criteria. This will not update the
     * source, but will update the working value of the sharing criteria.
     * @param sharingCriteria The sharing criteria to insert or update
     */
    upsertCriteria(sharingCriteria: SharingCriteria$v1<any, any> | SharingCriteria$v1<any, any>[]): void {
        if (!Array.isArray(sharingCriteria)) {
            sharingCriteria = [sharingCriteria];
        }

        sharingCriteria.forEach(criteria => {
            const found = this.valueChanges.getValue().find(c => c.referenceId === criteria.referenceId);
            if (!found) {
                // Insert
                this.valueChanges.next([...this.valueChanges.getValue(), new SharingCriteria$v1<any, any>(criteria)]);
            } else {
                // Update
                this.valueChanges.next(this.valueChanges.getValue().map(item => {
                    if (item.referenceId === criteria.referenceId) {
                        item = new SharingCriteria$v1<any, any>(criteria);
                    }
                    return item;
                }));
            }
        });
    }

    /**
     * Deletes sharing criteria from the store. This will not update the source,
     * but will update the working value of the sharing criteria.
     * @param ids List of sharing criteria ids to remove from the store.
     */
    deleteCriteria(ids: string | string[]): void {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        this.valueChanges.next(this.valueChanges.getValue().filter(item => {
            return !ids.includes(item.referenceId);
        }));
    }

    /**
     * Checks if the given criteria exists in the store.
     * @returns Returns true if criteria exists
     */
    exists(capabilityId: string, type: CriteriaType$v1): boolean {
        const list = this.valueChanges.getValue();
        return !!list.find(sc => sc.capabilityId === capabilityId && sc.criteriaType === type);
    }

    /**
     * Compares two sharing criteria. Stringify works in this case
     * since both object a and b come from the same data source and
     * will only be different including order if a user has changed a
     * property.
     * @param criteriaA First sharing criteria
     * @param criteriaB Second sharing criteria
     */
    private isEqual(
        criteriaA: SharingCriteria$v1<any, any>,
        criteriaB: SharingCriteria$v1<any, any>
    ): boolean {
        const strA = JSON.stringify(criteriaA);
        const strB = JSON.stringify(criteriaB);

        return strA === strB;
    }

    /**
     * Updates or inserts changes to sharing criteria in the source. IMPORTANT: This should not be called outside of this service.
     * @param sharingCriteria The sharing criteria to insert or update
     */
     private upsertSourceCriteria(sharingCriteria: SharingCriteria$v1<any, any> | SharingCriteria$v1<any, any>[]): void {
        if (!Array.isArray(sharingCriteria)) {
            sharingCriteria = [sharingCriteria];
        }

        sharingCriteria.forEach(criteria => {
            const found = this.source.getValue().find(c => c.referenceId === criteria.referenceId);
            if (!found) {
                // Insert
                this.source.next([...this.source.getValue(), new SharingCriteria$v1<any, any>(criteria)]);
            } else {
                // Update
                this.source.next(this.source.getValue().map(item => {
                    if (item.referenceId === criteria.referenceId) {
                        item = new SharingCriteria$v1<any, any>(criteria);
                    }
                    return item;
                }));
            }
        });
    }

    /**
     * Deletes sharing criteria from the store. IMPORTANT: This should not be called outside of this service.
     * @param ids List of sharing criteria ids to remove from the store.
     */
    private deleteSourceCriteria(ids: string | string[]): void {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        this.source.next(this.valueChanges.getValue().filter(item => {
            return !ids.includes(item.referenceId);
        }));
    }
}
