import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { bindable } from "aurelia-framework";
import { VmGridDataAbstract } from '../data/vm-data-abstract';
import type { IVmGridColumn, IVmGridOrderModel } from '../interfaces/vm-grid-interfaces';

export class VmGridHeaderColumn {
    @bindable column: IVmGridColumn;
    @bindable isLast: boolean;
    @bindable gridData: VmGridDataAbstract;

    direction: 'asc' | 'desc' | null = null;
    subscription;

    constructor() {}

    attached(): void {
        if (this.column.AllowSorting) {
            this.direction = this.getDirection();
            this.subscription = this.gridData.changes.getOrderChanges().subscribe(() => this.direction = this.getDirection());
        }
    }

    detached(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    changeOrder(): void {
        if (!this.column.AllowSorting) {
            return;
        }

        let order = [];

        if (this.direction === null || this.direction === 'desc') {
            order = [{
                name: this.column.ColumnHeaderText,
                direction: 'asc',
                orderBy: this.column.ColumnName
            }];
        } else if (this.direction === 'asc') {
            order = [{
                name: this.column.ColumnHeaderText,
                direction: 'desc',
                orderBy: this.column.ColumnName
            }];
        }
        this.gridData.set({ order });
        this.direction = this.getDirection();
    }
    getDirection() {
        if (this.gridData.orders.map((order: IVmGridOrderModel) => order.orderBy).includes(this.column.ColumnName)) {
            return this.gridData.orders.find((order: IVmGridOrderModel) => order.orderBy === this.column.ColumnName).direction;
        };
        return null;
    }

}
