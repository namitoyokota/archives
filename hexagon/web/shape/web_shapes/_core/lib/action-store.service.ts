import { Injectable } from '@angular/core';
import { CommonAdapterService$v1, SelectionActionData$v2 } from '@galileo/web_common/adapter';
import { ActionData$v1, LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { capabilityId, CommonMailboxService, ShapeFilter$v1, ShapeListFilter$v1 } from '@galileo/web_shapes/_common';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Actions$v1 } from './actions.v1';

export interface FilterActionData$v1 extends ActionData$v1 {
  filter: ShapeListFilter$v1;
}

@Injectable()
/**
 * Service that contains broadcasters and listeners for linked view actions
 */
export class ActionStoreService {

  constructor(
    private commonAdapter: CommonAdapterService$v1,
    private layoutAdapter: LayoutCompilerAdapterService,
    private shapesMailbox: CommonMailboxService,
  ) {
    this.listenToAdapter();
  }

  /**
   * Broadcast filter by shape
   * @param contextId Context id of the component filtering by shape
   * @param filter Shape filter
   */
  shapeFilter(contextId: string, filter: ShapeFilter$v1): void {
    this.layoutAdapter.broadcastAsync<Actions$v1>(contextId, Actions$v1.shapeFilter, filter).catch((err) => {
      return(err);
    });
  }

  /**
   * Returns an observable that emits when shape filter changes
   * @param contextId Context id of the component filtering by shape
   */
  shapeFilter$(contextId: string): Observable<ShapeFilter$v1> {
    const temp: Promise<BehaviorSubject<ShapeFilter$v1>> = this.layoutAdapter.listenAsync<Actions$v1, ShapeFilter$v1>(contextId, Actions$v1.shapeFilter).catch((err) => {
      return(err);
    });
    return from(temp).pipe(
      mergeMap(val => val)
    );
  }

  /**
   * Broadcast action to multiselect shapes
   * @param contextId Context id of the component making the selection
   * @param shapeIds Shape ids to select.
   * @param merge A flag that is true when the shape ids should be merged into the existing selection.
   * If this is false then other capability Ids will be unselected
   */
  multiselect(contextId: string, shapeIds: string[], merge: boolean = true) {
    this.commonAdapter.multiselectAsync(contextId, capabilityId, shapeIds, merge);
  }

  /**
     * Broadcast filter action
     * @param contextId Context id of the component making the selection
     * @param filter The object to use to filter shape data
     */
  filter(contextId: string, filter: ShapeListFilter$v1): void {
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
    this.layoutAdapter.broadcastAsync<Actions$v1>(contextId, Actions$v1.filterSync, { originId: contextId });
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
   * Listen to actions that are coming through the adapter
   */
  private listenToAdapter(): void {
    this.shapesMailbox.mailbox$v1.onShapeFilterAction$.subscribe(async (mailbox) => {
      const bus = await (this.layoutAdapter.listenAsync<Actions$v1, ShapeFilter$v1>(mailbox.payload, Actions$v1.shapeFilter).catch ((err) => {
        return (err);
      }));
      mailbox.response.next(bus);
    });
  }

}
