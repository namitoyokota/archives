import { Injectable } from '@angular/core';
import { AlarmFilter$v1, capabilityId } from '@galileo/web_alarms/_common';
import { CommonAdapterService$v1, SelectionActionData$v1, SelectionActionData$v2 } from '@galileo/web_common/adapter';
import { ActionData$v1, LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { ShapeFilter$v1, ShapesAdapterService$v1 } from '@galileo/web_shapes/adapter';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Actions$v1 } from './actions.v1';

export interface FilterActionData$v1 extends ActionData$v1 {
    filter: AlarmFilter$v1;
}

@Injectable()
/**
 * Service that contains broadcasters and listeners for linked view actions
 */
export class ActionStoreService {

    constructor(
        private commonAdapter: CommonAdapterService$v1,
        private layoutAdapter: LayoutCompilerAdapterService,
        private shapeAdapter: ShapesAdapterService$v1
    ) { }

    /**
     * Broadcast action to select alarm
     * @param contextId Context id of the component making the selection
     * @param alarmId The id of the alarm to select
     * @deprecated Use multiselect
     */
    select(contextId: string, alarmId: string): void {
        this.commonAdapter.selectAsync(contextId, alarmId);
    }

    /**
     * Broadcast action to multiselect alarms
     * @param contextId Context id of the component making the selection
     * @param alarmIds Alarm ids to select.
     * @param merge A flag that is true when the alarm ids should be merged into the existing selection.
     * If this is false then other capability Ids will be unselected
     */
    multiselect(contextId: string, alarmIds: string[], merge: boolean = true) {
        this.commonAdapter.multiselectAsync(contextId, capabilityId, alarmIds, merge);
    }

    /**
     * Returns an observable that emits when shape filter changes
     * @param contextId The view's context id
     */
    shapeFilter$(contextId: string): Observable<ShapeFilter$v1> {
        return from(this.shapeAdapter.shapeFilterChangeAsync(contextId)).pipe(
          mergeMap(bus => bus)
        );
    }

    /**
     * Returns an observable that emits when selection changes
     * @param contextId The view's context id
     * @deprecated Use multiselect$
     */
    select$(contextId: string): Observable<SelectionActionData$v1> {
        return from(this.commonAdapter.selectChangeAsync(contextId)).pipe(
            mergeMap(bus => bus)
        );
    }

    /**
     * Returns an observable that emits when selection changes
     * @param contextId The view's context id
     * @param capabilityId The capability Id that should be returned
     */
    multiselect$(contextId: string): Observable<SelectionActionData$v2> {
        return from(this.commonAdapter.multiselectChangeAsync(contextId, capabilityId)).pipe(
            mergeMap(bus => bus)
        );
    }

    /**
     * Broadcast filter action
     * @param contextId Context id of the component making the selection
     * @param filter The object to use to filter alarm data
     */
    filter(contextId: string, filter: AlarmFilter$v1): void {
        this.layoutAdapter.broadcastAsync<Actions$v1>(contextId, Actions$v1.filter, {
            filter: filter
        } as FilterActionData$v1);
    }

    /**
     * Returns an observable that emits when filter changes
     * @param contextId Context id of the component making the selection
     */
    filter$(contextId: string): Observable<FilterActionData$v1> {
        return from(this.layoutAdapter.listenAsync<Actions$v1, FilterActionData$v1>(contextId, Actions$v1.filter)).pipe(
            mergeMap(val => val)
        );
    }

    /**
     * Broadcast filter action
     * @param contextId Context id of the component making the selection
     */
    filterSync(contextId: string): void {
        this.layoutAdapter.broadcastAsync<Actions$v1>(contextId, Actions$v1.filterSync, { originId: contextId});
    }

    /**
     * Returns an observable that emits when filter sync changes
     * @param contextId Context id of the component making the selection
     */
    filterSync$(contextId: string): Observable<ActionData$v1> {
        return from(this.layoutAdapter.listenAsync<Actions$v1, ActionData$v1>(contextId, Actions$v1.filterSync)).pipe(
            mergeMap(val => val)
        );
    }
}
