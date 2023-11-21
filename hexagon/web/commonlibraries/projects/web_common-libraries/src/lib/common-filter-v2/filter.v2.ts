import { FilterOperation$v2, FilterOperationType$v2 } from './filter-operation.v2';

export abstract class Filter$v2<T> {

    /** List of tenant ids to filter on */
    tenants?: string[];

    /** String to use to filter over name, contacts, comments, location, ect */
    searchString?: string;

    /** List of filter operations to apply */
    operations?: FilterOperation$v2[];

    constructor(params: Filter$v2<T> = {} as Filter$v2<T>) {
        const {
            tenants = [],
            searchString = null,
            operations = []
        } = params;

        this.operations = operations.length ? operations.map(item => new FilterOperation$v2(item)) : operations;
        this.tenants = tenants;
        this.searchString = searchString;
    }

    /**
     * Apply the filter to given list of items
     * @param list List of items to filter
     */
    apply(list: T[]): T[] {
        let filterList = [].concat(list);

        filterList = filterList.filter(item => {
            return this.applyFilter(item);
        });

        return filterList;
    }

    /**
     * Applies filters to item. Returns true if item passes filters
     * @param item Item to apply filters to
     */
    protected applyFilter(item: T): Boolean {
        let passFilter = true;

        if (item['tenantId']) {
            passFilter = !!this.tenants.find(id => id === item['tenantId']);
        }

        // Keep applying filters
        if (passFilter) {

            for (const operation of this.operations) {
                passFilter = this.applyFilterOperation(operation, item);

                if (!passFilter) {
                    break;
                }
            }

        }

        if (passFilter && this.searchString) {
            passFilter = this.applySearchOperation(item);
        }

        return passFilter;
    }

    /**
     * Returns true if item passes filter
     * @param operation Filter operation
     * @param filterItem Item to apply filter to
     */
    protected applyFilterOperation(operation: FilterOperation$v2, filterItem: T) {
        let passFilter = true;

        const values: string[] = operation.operationString ? operation.operationString.split(',')
            .map(item => item ? item.toLocaleLowerCase().trim() : null) : [];

        if (values.length) {

            if (!filterItem[operation.property]) {
                passFilter = false;
            } else if (operation.type === FilterOperationType$v2.equals) {
                passFilter = false;

                if (Array.isArray(filterItem[operation.property])) {
                    for (const item of filterItem[operation.property]) {
                        if (!!values.find(equal => equal === (item.toString().toLocaleLowerCase().trim()))) {
                            passFilter = true;
                        }
                    }
                } else {
                    passFilter = !!values.find(equal => equal === (filterItem[operation.property]).toString().toLocaleLowerCase().trim());
                }
            } else if (operation.type === FilterOperationType$v2.contains) {

                passFilter = !!values.find(contain => {
                    return (filterItem[operation.property]).toString().toLocaleLowerCase().trim().includes(contain);
                });

            } else {
                // Custom filter
                passFilter = this.customFilter(operation, filterItem);
            }
        }

        return passFilter;
    }

    /**
     * Returns true if item passes custom filter. This is to be overridden if custom filtering is needed
     * @param operation Filter operation
     * @param filterItem Item to apply filter to
     */
    protected customFilter(operation: FilterOperation$v2, filterItem: T): boolean {
        return false;
    }

    /**
     * Returns true if passes search
     */
    protected abstract applySearchOperation(item: T): boolean;
}
