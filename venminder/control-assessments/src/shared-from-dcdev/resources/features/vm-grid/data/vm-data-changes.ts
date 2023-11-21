import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum VmGridChangeTypes {
    PAGINATION_CHANGE = 'PAGINATION_CHANGE',
    ORDER_CHANGE = 'ORDER_CHANGE',
    FILTER_CHANGE = 'FILTER_CHANGE',
    COLUMN_CHANGE = 'COLUMN_CHANGE',
    DATA_CHANGE = 'DATA_CHANGE'
}

export class VmGridChanges {
    private observable: Subject<{ type: string }> = new Subject();

    publish(type: { type: string, [key:string]: any }) {
        this.observable.next(type);
    }

    getDataChanges() {
        return this.observable.pipe(
            filter((change: { type: string }) => change.type === VmGridChangeTypes.DATA_CHANGE)
        )
    }
    getFilterChanges() {
        return this.observable.pipe(
            filter((change: { type: string }) => change.type === VmGridChangeTypes.FILTER_CHANGE)
        );
    }
    getOrderChanges() {
        return this.observable.pipe(
            filter((change: { type: string }) => change.type === VmGridChangeTypes.ORDER_CHANGE)
        );
    }
    getPaginationChanges() {
        return this.observable.pipe(
            filter((change: { type: string }) => change.type === VmGridChangeTypes.PAGINATION_CHANGE)
        );
    }
    getColumnChanges() {
        return this.observable.pipe(
            filter((change: { type: string, [key:string]: any }) => change.type === VmGridChangeTypes.COLUMN_CHANGE )
        )
    }
}
