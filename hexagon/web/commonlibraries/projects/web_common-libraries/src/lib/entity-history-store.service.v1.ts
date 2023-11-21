import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChangeRecord$v1 } from '@galileo/platform_common-libraries';

class HistoryStoreLookup {

    /** List of context ids that is using this data */
    contextIds: string[];

    /** List of history items */
    history: BehaviorSubject<ChangeRecord$v1[]>;

    constructor(params: HistoryStoreLookup = {} as HistoryStoreLookup) {
        const {
            contextIds = [],
            history = new BehaviorSubject<ChangeRecord$v1[]>([])
        } = params;

        this.contextIds = contextIds;
        this.history = history;
    }
}

/**
 * Prototype entity history store
 */
@Injectable()
export class EntityHistoryStoreService$v1 {

    /** Hold a mapping of entity id to history store lookup objects */
    private history = new Map<string, HistoryStoreLookup>();

    /**
     * Returns an stream of history items for the given entity id.
     * @param id Entity id
     * @param contextId Id of where the data is being used. Example list view's context id.
     */
    get$(id: string, contextId: string): Observable<ChangeRecord$v1[]> {
        if (this.history.has(id)) {
            const lookup = this.history.get(id);
            // Added context id to list of context ids that are using the data
            const contextFound = !!lookup.contextIds.find(lookupId => lookupId === contextId);
            if (!contextFound) {
                lookup.contextIds = [...lookup.contextIds, contextId];
                this.history.set(id, lookup);
            }

            return lookup.history.asObservable();

        } else {
            return null;
        }
    }

    /**
     * Concatenates a list of history objects to the current store.
     * @param id Entity Id
     * @param history History items to add to the store.
     * @param contextId Id of where the data is being used. Example list view's context id.
     */
    concatenate(id: string, history: ChangeRecord$v1[], contextId: string): void {
        if (!this.history.has(id)) {
            // Create cache
            this.history.set(id, new HistoryStoreLookup());
        }

        const lookup = this.history.get(id);

        // Added context id to list of context ids that are using the data
        const contextFound = !!lookup.contextIds.find(lookupId => lookupId === contextId);
        if (!contextFound) {
            lookup.contextIds = [...lookup.contextIds, contextId];
            this.history.set(id, lookup);
        }

        let lookupList = lookup.history.getValue();
        history.forEach(item => {
            lookupList = this.upsert(item, lookupList, contextId);
        });

        lookup.history.next(lookupList);
        this.history.set(id, lookup);
    }

     /**
     * Removes an entity's history from the store.
     * @param id Entity Id
     * @param contextId Id of where the data is being used. Example list view's context id.
     */
    remove(id: string, contextId: string): void {

        // If id not in the store we are done
        if (!this.history.has(id)) {
            return;
        }

        // Remove the context id for the given entity id
        const lookup = this.history.get(id);
        lookup.contextIds = lookup.contextIds.filter(item => {
            return item !== contextId;
        });

        if (!lookup.contextIds.length) {
            // Empty cache for this entity
            this.history.delete(id);
        } else {
            // Update lookup
            this.history.set(id, lookup);
        }
    }

    /**
     * Removes items from the store by context id. This can remove the history for many different
     * entities at once
     * @param id Context id
     */
    removeByContextId(id: string): void {
        this.history.forEach((lookup, entityId) => {
            if (!!lookup.contextIds.find(cId => cId === id)) {
                this.remove(entityId, id);
            }
        });
    }

    /**
     * Updates or adds a history item to the store.
     * @param history History item to add or update.
     * @param contextId Id of where the data is being used. Example list view's context id.
     */
    private upsert(history: ChangeRecord$v1, list: ChangeRecord$v1[], contextId: string): ChangeRecord$v1[] {

        const found = !!list.find(item => item.timestamp === history.timestamp);
        if (found) {
            // Update flow
            list = list.map(item => {
                if (item.timestamp === history.timestamp) {
                    item = history;
                }

                return new ChangeRecord$v1(item);
            });
        } else {
            // Insert flow
            list = [...list, new ChangeRecord$v1(history)];
        }

        return list;
    }
}
