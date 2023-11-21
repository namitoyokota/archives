/* eslint-disable @typescript-eslint/no-explicit-any */
import { flattenDeep, orderBy, uniq } from 'lodash';
import { VmGridFilterModel } from '../configuration/filterModels';
import '../extensions/object.extensions';
import { IVmGridConfig, IVmGridOrderModel } from '../interfaces/vm-grid-interfaces';

const orderFunction =
  (orderModel: IVmGridOrderModel) =>
  (order: any): any => {
    const columnValue = order[orderModel.OrderBy];

    switch (typeof columnValue) {
      case 'string':
        return columnValue?.toLowerCase();
      default:
        if (orderModel.CustomSortProperty) {
          return columnValue[orderModel.CustomSortProperty]?.toLowerCase();
        } else {
          return orderModel.SortNullsToTop ? columnValue || '' : columnValue;
        }
    }
  };

export const filterRowsFromModels = (rows: object[], filters: VmGridFilterModel[]): object[] => {
  const groups = uniq(filters.map((filter) => filter.group)).map((groupName) =>
    filters.filter((filter) => filter.group === groupName),
  );

  return rows.filter((row: object) => {
    return groups.every((group: VmGridFilterModel[]) => {
      return group.some((model: VmGridFilterModel) => {
        return model.filter(row);
      });
    });
  });
};

export const orderRowsFromModels = (rows: object[], orders: IVmGridOrderModel[]): any[] => {
  const columnOrders = orders.map((o) => orderFunction(o));
  const columnDirections = orders.map((o) => o.Direction);

  return orderBy(rows, columnOrders, columnDirections);
};

export const getDefaultOrders = (config: IVmGridConfig): any[] => {
  return flattenDeep(
    config.ColumnDefinitions.filter((column) => column.OrderModels?.length).map((column) => {
      return column.OrderModels.filter((order) => order.DefaultOrdinal);
    }),
  ).sort((a, b) => a.DefaultOrdinal - b.DefaultOrdinal);
};
