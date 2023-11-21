import type { IVmGridConfig, IVmGridOrderModel } from "../interfaces/vm-grid-interfaces";
import { uniq, orderBy, flattenDeep } from 'lodash';
import '../extensions/object.extensions';
import moment from "moment";
import numeral from "numeral";

export const filterRowsFromModels = (rows: object[], filters: VmGridFilterModel[]) => {
    const groups = uniq(filters.map(filter => filter.group))
        .map(groupName =>
            filters.filter(filter => filter.group === groupName)
        );

    return rows.filter(row => {
        const every = groups.every(group => {
            const some = group.some(model => {
                const check = model.filter(row);
                return check;
            });
            return some;
        });
        return every;
    });
}

export const orderRowsFromModels = (rows: object[], orders: IVmGridOrderModel[]) => {
    return orderBy(rows, orders.map(o => o.orderBy), orders.map(o => o.direction));
}

export const getDefaultOrders = (config: IVmGridConfig) => {
    return flattenDeep(
        config.ColumnDefinitions.filter(column => column.OrderModels && column.OrderModels.length)
            .map(column => {
                return column.OrderModels.filter(order => order.defaultOrdinal)
            })
    )
        .sort((a, b) => a.defaultOrdinal - b.defaultOrdinal)

}

export class VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public active: boolean = false
    ) { }

    public filter(row: any): boolean {
        return true;
    }

    public assign(params) {
        Object.assign(this, params);
        return this;
    }
}

export class VmGridSearchModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public text: string) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        return this.columnName !== undefined && row[this.columnName] ? row[this.columnName].toLowerCase().includes(this.text.toLowerCase()) : false;
    }
}

export class VmGridDateModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public text: string,
        public dataType: string,
        public formatText: string) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        if (row[this.columnName]) {
            return moment(row[this.columnName]).format(this.formatText).includes(this.text);
        }
        else {
            return false;
        }
    }
}

export class VmGridNumberModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public text: string,
        public dataType: string,
        public displayFormatText: string,
        public formatText: string) {
        super(name, group, columnReference, columnName)
    }
    public filter(row: any) {
        return row[this.columnName] ? numeral(row[this.columnName]).format(this.formatText).includes(this.text) : false;
    }
}

export class VmGridStringArrayModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public text: string,
        public dataType: string) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        const arr = row[this.columnName];

        if (arr && arr.length > 0) {
            return arr.join(', ').toLowerCase().includes(this.text.toLowerCase());
        }
        else {
            return false;
        }
    }
}

export class VmGridMappedArrayModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public text: string,
        public dataType: string,
        public func: any) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        const arr = row[this.columnName];

        if (arr && arr.length > 0) {
            const values = arr.map(this.func).join(', ');
            return values.toLowerCase().includes(this.text.toLowerCase());
        }
        else {
            return false;
        }
    }
}

export class VmGridQuestionnaireNameModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnName: string,
        public columnReference: string,
        public text: string,
        public columnToCheck: string,
        public display: string,
        public actual: string) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        const value = row[this.columnName] || '';
        const valueToCheck = row[this.columnToCheck] || '';

        this.text = this.text.toLowerCase();

        if (this.display.includes(this.text)) {
            return valueToCheck.toLowerCase().includes(this.actual);
        }
        else {
            return value.toLowerCase().includes(this.text) || valueToCheck.toLowerCase().includes(this.text);
        }
    }
}

export class VmGridBooleanModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnReference: string,
        public columnName: string,
        public boolean: boolean
    ) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        return row[this.columnName] === this.boolean;
    }
}

export class VmGridMappedBooleanModel extends VmGridFilterModel {
    constructor(
        public name: string,
        public group: string,
        public columnName: string,
        public columnReference: string,
        public text: string,
        public map: Function = (val) => val) {
        super(name, group, columnReference, columnName)
    }

    public filter(row: any) {
        const value = row[this.columnName];
        if (!value) {
            return value;
        } else {
            const mappedValue = this.map(value);
            return mappedValue.toLowerCase().includes(this.text.toLowerCase());
        }
    }
}