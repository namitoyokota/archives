import type { IVmGridOrderModel } from "../interfaces/vm-grid-interfaces";
import { filterRowsFromModels, orderRowsFromModels, VmGridFilterModel } from "../utilities/grid-filter-utils";
import { VmGridChanges, VmGridChangeTypes } from "./vm-data-changes";
import { deepEqual } from 'fast-equals';
import { VmGridPagination } from "./vm-data-pagination";

export class VmGridDataAbstract {
    public rows: any[];
    public modifiedSource: object[];
    public filters: VmGridFilterModel[] = [];
    public orders: IVmGridOrderModel[] = [];
    public defaultOrders: IVmGridOrderModel[] = []
    public changes: VmGridChanges = new VmGridChanges();

    constructor(
        public source: object[],
        public pagination: VmGridPagination
    ) { }

    init(data) {
        this.source = data;
        this.update().pageBy()
        this.changes.publish({ type: VmGridChangeTypes.DATA_CHANGE, data: this.modifiedSource });
        return this;
    }
    setDefault({ defaultOrders = this.defaultOrders }) {
        this.defaultOrders = defaultOrders
        return this
    }
    set({ filter = this.filters, order = this.orders, page = this.pagination.currentPage, data = this.source }) {
        if (!deepEqual(data, this.source)) {
            this.source = data;
            this.update()
            this.changes.publish({ type: VmGridChangeTypes.DATA_CHANGE, data: this.modifiedSource });
        }
        if (deepEqual(filter, this.filters) && deepEqual(order, this.orders)) {
            this.pageBy(page);
        } else {
            this.update().filterBy(filter).orderBy(order).pageBy(this.pagination.currentPage);
        }
        return this
    }
    protected update() {
        this.modifiedSource = this.source;
        this.pagination.updateRowsAndPages(this.modifiedSource);
        return this;
    }
    protected filterBy(filters = this.filters) {
        this.modifiedSource = filterRowsFromModels(this.modifiedSource, filters);
        this.pagination.updateRowsAndPages(this.modifiedSource);
        this.filters = filters;
        this.changes.publish({ type: VmGridChangeTypes.FILTER_CHANGE });
        return this;
    }
    protected orderBy(orders = this.orders) {
        let newOrders = orders.filter(order => !this.defaultOrders.map(defaultOrder => defaultOrder.orderBy).includes(order.orderBy))
        let newDefaults = this.defaultOrders.map(defaultOrder => {
            let findOrder = orders.find(order => order.orderBy === defaultOrder.orderBy)
            if (findOrder) {
                return {
                    ...defaultOrder,
                    direction: findOrder.direction
                }
            } else {
                return defaultOrder
            }
        });

        let combinedOrders = [
            ...newOrders,
            ...newDefaults
        ]

        this.modifiedSource = orderRowsFromModels(
            this.modifiedSource,
            combinedOrders
        );

        this.pagination.updateRowsAndPages(this.modifiedSource);
        this.orders = orders;
        this.defaultOrders = newDefaults;
        this.changes.publish({ type: VmGridChangeTypes.ORDER_CHANGE });
        return this;
    }
    protected pageBy(page: number = this.pagination.currentPage) {
        const slice = this.pagination.getSlice(page);
        this.rows = [
            ...this.modifiedSource.slice(slice.start, slice.end)
        ];
        this.pagination.setCurrentPage(page);
        this.changes.publish({ type: VmGridChangeTypes.PAGINATION_CHANGE });
        return this;
    }
}
