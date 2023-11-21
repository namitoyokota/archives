import {
  VmGridMappedBooleanModel,
  VmGridSearchModel,
  VmGridStringArrayModel,
} from '../configuration/filterModels';
import {
  booleanFormatting,
  numberFormatting,
  stringArrayFormatting,
} from '../configuration/formatting';
import { VmGridColumnTemplates } from '../constants';
import {
  VmGridColumnFieldType,
  VmGridListDisplayType,
} from '../enums/vm-grid-enums';
import {
  IVmGridColumn,
  IVmGridConfig,
} from '../interfaces/vm-grid-interfaces';
import { format } from 'date-fns';
import { IDatePickerConfig } from '../../vm-date-picker/vm-date-picker.interfaces';
import { VmGridDateRangeModel } from '../configuration/filterModels';
import {
  IVmGridColumnWithView
} from '../data/vm-data-managed';
import {
  IVmDataFilterGroupItem,
  IVmDataFilterGroups,
} from '../../vm-data-filter/vm-data-filter.interface';
import { orderBy } from 'lodash';
import { DataFilterGroupOrderProp } from '../../vm-data-filter/vm-data-filter.component';

export function getGridRowStyle(config: IVmGridConfig) {
  const columns = config.ColumnDefinitions.map(column => {
    return column.Width || '1fr';
  }).join(' ');
  return `grid-template-columns: ${columns};`;
}

export function dynamicConfig(
  boolean: boolean,
  config: any[],
): any[] {
  if (boolean) {
    return config
  } else {
    return []
  }
}

export function getDynamicColumnDefaultConfiguration(columnFieldType: VmGridColumnFieldType): any {
  let config;

  const bindingContext = (Row, Column, ContextMenu?) => {
    return { Row, Column, ContextMenu };
  };

  const trueState = 'Yes';
  const falseState = 'No';

  switch (columnFieldType) {
    case VmGridColumnFieldType.List:
      config = {
        bindingContext: bindingContext,
        columnFieldType: VmGridColumnFieldType.List,
        format: stringArrayFormatting.Format,
        searchModel: {
          Filter: VmGridStringArrayModel
        },
        columnValueConverter: {
          DisplayType: VmGridListDisplayType.UnorderedList,
          MaxItems: 3,
        },
        viewModel: VmGridColumnTemplates.FORMAT_LIST,
      };
      break;
    case VmGridColumnFieldType.Boolean:
      config = {
        columnFieldType: VmGridColumnFieldType.Boolean,
        format: booleanFormatting.Format,
        searchModel: {
          Filter: VmGridMappedBooleanModel,
          Params: {
            trueState: trueState,
            falseState: falseState,
          },
        },
        columnValueConverter: {
          TrueState: trueState,
          FalseState: falseState,
        },
      };
      break;
    case VmGridColumnFieldType.Number:
      config = {
        columnFieldType: VmGridColumnFieldType.Number,
        format: numberFormatting.Format,
      };
      break;
    default:
      break;
  }

  return config;
}

export function getDateRangeFilter(
  option: Function,
  config: IDatePickerConfig,
): VmGridDateRangeModel[] {
  const args = option();
  args.dateFrom.setHours(0, 0, 0, 0);
  if (args.dateTo) {
    args.dateTo.setHours(0, 0, 0, 0);
  }
  let searchText = '';
  let dateRangeValues = [];
  let searchTextValues = [];
  dateRangeValues.push(format(args.dateFrom, 'MM/dd/yyyy'));
  if (args.dateTo) {
    dateRangeValues.push(format(args.dateTo, 'MM/dd/yyyy'));
  }
  searchText = args.defaultText || dateRangeValues.join(' - ');
  if (config.ShowColumnName) {
    searchTextValues.push(config.ColumnName);
  }
  searchTextValues.push(searchText);
  const newSearchFilter = [new VmGridDateRangeModel(
    searchTextValues.join(': '),
    'search-date-range ' + searchText,
    config.ColumnName,
    config.ColumnName,
    searchText,
    args.dateFrom,
    args.dateTo,
  )];
  return newSearchFilter;
}

function getFilterFormattedValue(
  column: IVmGridColumn,
  value,
): string {
  let val = value;

  if (column.GetFilterFormattedValue) {
    val = column.GetFilterFormattedValue(value);
  }

  return val;
}

export function prepareDataFilterGroups(
  columns: Array<IVmGridColumnWithView>,
  source: Array<any>,
  config: IVmGridConfig,
): Array<IVmDataFilterGroups> {
  let col: IVmGridColumnWithView | undefined;
  let groupItems: Array<IVmDataFilterGroupItem> = [];
  let sortOrder: 'asc' | 'desc';

  let dataFilterGroups: Array<IVmDataFilterGroups> = [];

  dataFilterGroups = config.ColumnDefinitions
    .filter((column: IVmGridColumn) => column.IsCustomFilter)
    .map((column: IVmGridColumn) => {
      col = columns.find((c: IVmGridColumnWithView) => c.ColumnName == column.ColumnName);

      groupItems = [...new Set(source.map(item => item[column.ColumnName]))]
        .filter(item => item != null)
        .map((item) => <IVmDataFilterGroupItem>{
          groupItemLabel: getFilterFormattedValue(column, item),
          isChecked: false,
          isSearchable: true,
          parentGroupName: column.ColumnName,
          groupOrder: column.GroupFilterOrderKeys ? column.GroupFilterOrderKeys[item] : 0,
        });

      if (column.GetUniqueGroupList) {
        groupItems = column.GetUniqueGroupList(groupItems, column.ColumnName);
      }

      sortOrder = column.ColumnFieldType == VmGridColumnFieldType.Boolean ? 'desc' : 'asc';

      return <IVmDataFilterGroups>{
        filterType: column.SearchModel ? column.SearchModel.Filter : VmGridSearchModel,
        filterParams: column.SearchModel ? column.SearchModel.Params : {},
        groupItems: orderBy(groupItems, (column.GroupFilterOrderProp || DataFilterGroupOrderProp.GROUP_ITEM_LABEL), sortOrder),
        groupLabel: column.ColumnHeaderText,
        groupName: column.ColumnName,
        isExpanded: false,
        visible: !!col,
      }
    });

  return dataFilterGroups;
}