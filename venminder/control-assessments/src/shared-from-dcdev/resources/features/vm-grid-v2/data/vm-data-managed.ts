import { deepEqual } from 'fast-equals';
import { difference, orderBy } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { literalFormatting } from '../configuration/formatting';
import { VmGridColumnFieldType, VmGridColumnPosition } from '../enums/vm-grid-enums';
import type { IVmGridColumn, IVmGridConfig } from '../interfaces/vm-grid-interfaces';
import { VmGridDataAbstract } from './vm-data-abstract';
import { VmGridChangeTypes } from './vm-data-changes';
import { VmGridPagination } from './vm-data-pagination';

interface IVmGridColumnView {
  ColumnName: string;
  Visible: boolean;
  ColumnPosition: number | null;
  ColumnId: string;
  ColumnHeaderText: string;
  ColumnType: string;
}

export interface IVmGridColumnWithView extends IVmGridColumn {
  View: IVmGridColumnView;
}

const initialColumn: IVmGridColumnWithView = {
  AllowSorting: false,
  ColumnFieldType: VmGridColumnFieldType.Literal,
  ColumnHeaderText: '',
  Width: 'minmax(250px, 1fr)',
  ViewLocked: false,
  View: {
    ColumnName: '',
    Visible: true,
    ColumnPosition: -1,
    ColumnId: '',
    ColumnHeaderText: '',
    ColumnType: VmGridColumnFieldType.Literal,
  },
};

const getColumnStyle = (columns) => {
  const style = columns
    .map((column) => {
      return column.Width || '1fr';
    })
    .join(' ');
  return `grid-template-columns: ${style};`;
};

export class VmGridDataManaged extends VmGridDataAbstract {
  columns: IVmGridColumnWithView[];
  columnSettings: { [key: string]: IVmGridColumnWithView };
  userSettings: unknown;
  rowStyle: BehaviorSubject<{ columns: any }>;
  startingDynamicPostion = 100;
  isOngoing = false;

  constructor(public source: object[], public pagination: VmGridPagination) {
    super(source, pagination);

    this.rowStyle = new BehaviorSubject({ columns: this.columns });
  }

  init({
    data,
    config,
    userSettings,
    dynamicColumns,
  }: {
    data: any;
    config: IVmGridConfig;
    userSettings?: any;
    dynamicColumns?: any;
  }) {
    dynamicColumns = orderBy(dynamicColumns || [], ['isCustomQuestion', 'columnHeaderText'], ['asc', 'asc']);

    this.columnSettings = Object.assign(
      {},
      ...[
        ...config.ColumnDefinitions.map(
          (column: IVmGridColumn, index: number): { [key: string]: IVmGridColumnWithView } => {
            const ColumnId = [config.ColumnPrefix, column.ColumnName].join('_');
            const ColumnHeaderText = column.ColumnHeaderText;
            const ColumnFieldType = column.ColumnFieldType;

            if (index == 0 && config.AllowLeftColumnSticky) {
              column.Position = VmGridColumnPosition.StickyLeft;
            }

            if (
              index == config.ColumnDefinitions.length - 1 &&
              config.AllowRightColumnSticky &&
              column.IsActionColumn
            ) {
              column.Position = VmGridColumnPosition.StickyRight;
              index = this.startingDynamicPostion + 1;
            }

            return {
              [ColumnId]: {
                ...column,
                ViewLocked: column.ViewLocked || false,
                View: {
                  ColumnName: column.ColumnName,
                  Visible: column.Visible ?? true,
                  ColumnPosition: 0,
                  ColumnId,
                  ColumnHeaderText,
                  ColumnType: ColumnFieldType,
                },
              },
            };
          },
        ),
        ...dynamicColumns.map((column: any, index: number): { [key: string]: IVmGridColumnWithView } => {
          return {
            [column.columnId]: {
              ...initialColumn,
              AllowSorting: true,
              BindingContext: column.bindingContext,
              ColumnName: column.columnName,
              ColumnHeaderText: column.columnHeaderText,
              ColumnFieldType: column.columnFieldType || VmGridColumnFieldType.Literal,
              Format: column.format || literalFormatting.Format,
              SearchModel: column.searchModel,
              ColumnValueConverter: column.columnValueConverter,
              TextOverflow: column.textOverflow,
              ViewModel: column.viewModel,
              View: {
                ColumnName: column.ColumnName,
                Visible: false,
                ColumnPosition: index + 1,
                ColumnId: column.columnId,
                ColumnHeaderText: column.columnHeaderText,
                ColumnType: column.columnFieldType || VmGridColumnFieldType.Literal,
              },
            },
          };
        }),
      ],
    );

    this.userSettings = userSettings;

    this.columnSettings = Object.assign(
      this.columnSettings,
      ...(userSettings?.columns || [])
        .filter((column: IVmGridColumnView) => Object.keys(this.columnSettings).includes(column.ColumnId))
        .map((column: IVmGridColumnView): { [key: string]: IVmGridColumnWithView } => {
          return {
            [column.ColumnId]: {
              ...this.columnSettings[column.ColumnId],
              View: {
                ...this.columnSettings[column.ColumnId].View,
                ...column,
              },
            },
          };
        }),
    );

    return super.init(data).updateColumns();
  }

  set({
    filter = this.filters,
    order = this.orders,
    page = this.pagination.currentPage,
    columnSettings = this.columnSettings,
    data = this.source,
  }) {
    if (!deepEqual(data, this.source)) {
      this.source = data;
      this.update().filterBy(filter).orderBy(order).pageBy(page);
      this.changes.publish({ type: VmGridChangeTypes.DATA_CHANGE, data: this.modifiedSource });
    }

    let clearFilters = [];
    if (!deepEqual(columnSettings, this.columnSettings)) {
      const newView = Object.values(columnSettings)
        .filter((column) => column.View.Visible)
        .map((column) => column.ColumnName);
      const oldView = Object.values(this.columnSettings)
        .filter((column) => column.View.Visible)
        .map((column) => column.ColumnName);
      clearFilters = difference(oldView, newView);
      this.columnSettings = columnSettings;
      this.updateColumns();
    }

    if (clearFilters.length) {
      return super.set({
        filter: filter.filter((filterModel) => !clearFilters.includes(filterModel.columnReference)),
        order: order.filter((orderModel) => !clearFilters.includes(orderModel.OrderBy)),
        page,
        data,
      });
    } else {
      return super.set({ filter, order, page, data });
    }
  }

  updateColumns() {
    this.columns = orderBy(
      Object.values(this.columnSettings).filter((column: IVmGridColumnWithView) => column.View.Visible),
      'View.ColumnPosition',
    );
    this.rowStyle.next({ columns: this.columns });
    this.changes.publish({
      type: VmGridChangeTypes.COLUMN_CHANGE,
      columns: Object.values(this.columnSettings).map((column) => column.View),
    });

    return this;
  }

  getRowStyle() {
    return this.rowStyle.pipe(
      switchMap((BehaviorSubject: { columns: any }) => {
        return of({
          style: getColumnStyle(BehaviorSubject.columns),
        });
      }),
    );
  }
}
