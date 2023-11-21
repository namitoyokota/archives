import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum VmGridChangeTypes {
  PAGINATION_CHANGE = 'PAGINATION_CHANGE',
  ORDER_CHANGE = 'ORDER_CHANGE',
  MORE_FILTER_CHANGE = 'MORE_FILTER_CHANGE',
  FILTER_CHANGE = 'FILTER_CHANGE',
  FILTER_PILL_CHANGE = 'FILTER_PILL_CHANGE',
  COLUMN_CHANGE = 'COLUMN_CHANGE',
  DATA_CHANGE = 'DATA_CHANGE',
}

export class VmGridChanges {
  private observable: Subject<{ type: string }> = new Subject();

  publish(type: { type: string, [key: string]: any }): void {
    this.observable.next(type);
  }

  getDataChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string }) => change.type === VmGridChangeTypes.DATA_CHANGE)
    )
  }

  getFilterChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string }) => change.type === VmGridChangeTypes.FILTER_CHANGE)
    );
  }

  getMoreFilterChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string, [key: string]: any }) => change.type === VmGridChangeTypes.MORE_FILTER_CHANGE)
    );
  }

  getFilterPillChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string, [key: string]: any }) => change.type === VmGridChangeTypes.FILTER_PILL_CHANGE)
    );
  }

  getOrderChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string }) => change.type === VmGridChangeTypes.ORDER_CHANGE)
    );
  }

  getPaginationChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string }) => change.type === VmGridChangeTypes.PAGINATION_CHANGE)
    );
  }

  getColumnChanges(): Observable<{ type: string }> {
    return this.observable.pipe(
      filter((change: { type: string, [key: string]: any }) => change.type === VmGridChangeTypes.COLUMN_CHANGE)
    )
  }
}