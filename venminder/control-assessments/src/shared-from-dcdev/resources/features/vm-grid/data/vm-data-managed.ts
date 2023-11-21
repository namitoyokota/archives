import type { IVmGridColumn, IVmGridConfig } from "../interfaces/vm-grid-interfaces";
import { VmGridDataAbstract } from "./vm-data-abstract";
import { BehaviorSubject, of } from 'rxjs';
import { VmGridPagination } from "./vm-data-pagination";
import { deepEqual } from 'fast-equals';
import { orderBy, differenceBy, difference } from 'lodash';
import { VmGridColumnFieldType } from "../enums/vm-grid-enums";
import { VmGridChangeTypes } from "./vm-data-changes";
import { switchMap } from "rxjs/operators";

interface IVmGridColumnView {
    ColumnName: string,
    Visible: boolean,
    ColumnPosition: number | null,
    ColumnId: string,
    ColumnHeaderText: string,
    ColumnType: string
}

export interface IVmGridColumnWithView extends IVmGridColumn {
    View: IVmGridColumnView
}

const initialColumn: IVmGridColumnWithView = {
    AllowSorting: false,
    ColumnFieldType: VmGridColumnFieldType.Literal,
    ColumnHeaderText: '',
    Width: '250px',
    ViewLocked: false,
    View: {
        ColumnName: '',
        Visible: true,
        ColumnPosition: -1,
        ColumnId: '',
        ColumnHeaderText: '',
        ColumnType: VmGridColumnFieldType.Literal
    }
}

const getColumnStyle = (columns) => {
    const style = columns.map(column => {
        return column.Width || '1fr';
    }).join(' ');
    return `grid-template-columns: ${style};`
}

export class VmGridDataManaged extends VmGridDataAbstract {
    columns: IVmGridColumnWithView[];
    columnSettings: { [key: string]: IVmGridColumnWithView };
    userSettings: any;
    rowStyle: BehaviorSubject<{ columns: any; }>

    constructor(
        public source: object[],
        public pagination: VmGridPagination
    ) {
        super(source, pagination)

        this.rowStyle = new BehaviorSubject({ columns: this.columns })
        
    }
    init({ data, config, userSettings = {}, dynamicColumns = [] }:
        { data: any, config: IVmGridConfig, userSettings?: any, dynamicColumns?: any }) {
        this.columnSettings = Object.assign({}, ...[
                ...config.ColumnDefinitions.map((column: IVmGridColumn, index: number): { [key: string]: IVmGridColumnWithView } => {
                    let ColumnId = [config.ColumnPrefix, column.ColumnName].join('_')
                    let ColumnHeaderText = column.ColumnHeaderText
                    let ColumnFieldType = column.ColumnFieldType
                    return {
                        [ColumnId]: {
                            ...column,
                            ViewLocked: column.ViewLocked || false,
                            View: {
                                ColumnName: column.ColumnName,
                                Visible: true,
                                ColumnPosition: index,
                                ColumnId,
                                ColumnHeaderText,
                                ColumnType: ColumnFieldType
                            }
                        }
                    }
                }),
            ...dynamicColumns.map((column: any): { [key: string]: IVmGridColumnWithView } => {
                    return {
                        [column.columnId]: {
                            ...initialColumn,
                            AllowSorting: true,
                            ColumnName: column.columnName,
                            ColumnHeaderText: column.columnHeaderText,
                            ColumnFieldType: column.columnFieldType || VmGridColumnFieldType.Literal,
                            View: {
                                ColumnName: column.ColumnName,
                                Visible: false,
                                ColumnPosition: 100,
                                ColumnId: column.columnId,
                                ColumnHeaderText: column.columnHeaderText,
                                ColumnType: column.columnFieldType || VmGridColumnFieldType.Literal
                            }
                        }
                    }
                })
            ]
        )

        this.userSettings = userSettings;
        
        this.columnSettings = Object.assign(
            this.columnSettings,
            ...(userSettings?.columns || [])
                .filter((column: IVmGridColumnView) => Object.keys(this.columnSettings).includes(column.ColumnId))
                .map((column: IVmGridColumnView): { [key:string]: IVmGridColumnWithView } => {
                    return { 
                        [column.ColumnId]: {
                            ...this.columnSettings[column.ColumnId],
                            View: {
                                ...this.columnSettings[column.ColumnId].View,
                                ...column
                            }
                        }
                    }
                })
        )

        return super.init(data).updateColumns()
    }
    set({ filter = this.filters, order = this.orders, page = this.pagination.currentPage, columnSettings = this.columnSettings }) {
        let clearFilters = []
        if (!deepEqual(columnSettings, this.columnSettings)) {
            let newView = Object.values(columnSettings).filter(column => column.View.Visible).map(column => column.ColumnName)
            let oldView = Object.values(this.columnSettings).filter(column => column.View.Visible).map(column => column.ColumnName)
            clearFilters = difference(oldView, newView)
            this.columnSettings = columnSettings;
            this.updateColumns()
        }

        if (clearFilters.length) {
            return super.set({
                filter: filter.filter(filterModel => !clearFilters.includes(filterModel.columnReference)),
                order: order.filter(orderModel => !clearFilters.includes(orderModel.orderBy)),
                page
            })
        } else {
            return super.set({ filter, order, page })
        }
    }
    updateColumns() {
        this.columns = orderBy(
            Object.values(this.columnSettings).filter((column: IVmGridColumnWithView) => column.View.Visible),
            'View.ColumnPosition')
        this.rowStyle.next({ columns: this.columns })
        this.changes.publish({
            type: VmGridChangeTypes.COLUMN_CHANGE,
            columns: Object.values(this.columnSettings).map(column => column.View)
        });

        return this
    }
    getRowStyle() {
        return this.rowStyle.pipe(
            switchMap((BehaviorSubject: { columns: any }) => {
                return of({
                    style: getColumnStyle(BehaviorSubject.columns)
                })
            })
        )
    }

}