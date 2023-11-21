/* eslint-disable @typescript-eslint/no-explicit-any */
import { PLATFORM } from 'aurelia-pal';
import { VMContextMenuService } from '@venminder/vm-library';
import { VMTooltipPins, VMTooltipPositions } from '@venminder/vm-library';
import { IVmDataFilterGroupItem } from '../../vm-data-filter/vm-data-filter.interface';
import {
  addressFormatting,
  booleanFormatting,
  contactInfoFormatting,
  dateFormatting,
  linkTextFormatting,
  literalFormatting,
  numberFormatting,
  stringArrayFormatting,
} from '../configuration/formatting';
import { VmGridColumnTemplates } from '../constants';
import { VmGridColumnFieldType } from '../enums/vm-grid-enums';
import {
  IActionButtonParams,
  IActionLinkChangeHandler,
  IBoolValueConverter,
  IDateValueConverter,
  IDefaultActionEllipsisProperties,
  IFormatListValueConverter,
  IFormatTextValueConverter,
  INumberValueConverter,
  IVmGridActionEventArgs,
  IVmNumberFormatting,
} from '../interfaces/vm-grid-interfaces';
import {
  VmGridAddressModel,
  VmGridContactInfoModel,
  VmGridDateModel,
  VmGridMappedArrayModel,
  VmGridMappedBooleanModel,
  VmGridNumberModel,
  VmGridStringArrayModel,
} from './filterModels';
import { ActionContext, GridColumnBase } from './gridColumnBase';

export class ActionLinkColumn extends GridColumnBase {
  onChangeHandler: IActionLinkChangeHandler | undefined;

  constructor(columnName: string, width: string, columnHeaderText: string) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.ActionLink;
    this.ViewModel = VmGridColumnTemplates.ACTION_LINK;

    this.BindingContext = (row: any, column: GridColumnBase, contextMenu?: VMContextMenuService): ActionContext => {
      return new ActionContext(row, column, contextMenu, this.onChangeHandler);
    };
  }

  OnChange(onChangeHandler: IActionLinkChangeHandler): this {
    this.onChangeHandler = onChangeHandler;
    return this;
  }
}

export class ActionEllipsisColumn extends GridColumnBase {
  constructor() {
    super('actionEllipsis', 'min-content');

    this.ColumnFieldType = VmGridColumnFieldType.ActionEllipsis;
    this.ExcludeFromDownload = true;
    this.IsActionColumn = true;
    this.ViewModel = VmGridColumnTemplates.ACTION_ELLIPSIS;
  }

  setDefaults(model: IDefaultActionEllipsisProperties): this {
    this.CommandItems = model.commandItems;
    return this;
  }

  setVisibility(isVisible: boolean): this {
    this.Visible = isVisible ?? true;
    return this;
  }

  onClick(complete: (args: IVmGridActionEventArgs) => void): this {
    this.ActionComplete = complete;
    return this;
  }
}

export class ActionButtonColumn extends GridColumnBase {
  clickHandler: (data: any) => void | undefined = undefined;

  constructor(params: IActionButtonParams) {
    super('actionButton', params.width, params.columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.ActionButton;
    this.ExcludeFromDownload = true;
    this.ViewModel = PLATFORM.moduleName(
      'shared-from-dcdev/resources/features/vm-grid-v2/configuration/templates/action-button/action-button.component',
      'clients-shared',
    );

    this.BindingContext = (
      row: any,
      column: GridColumnBase,
      contextMenu?: VMContextMenuService,
    ): ActionContext => {
      return new ActionContext(row, column, contextMenu, this.clickHandler, params);
    };
  }

  onClick(clickHandler: (data: any) => void): this {
    this.clickHandler = clickHandler;
    return this;
  }
}

export class AddressColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Address;
    this.ViewModel = VmGridColumnTemplates.ADDRESS;

    this.Format = addressFormatting.Format;

    this.SearchModel = {
      Filter: VmGridAddressModel,
    };
  }
}

export class BooleanColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Boolean;
    this.Format = booleanFormatting.Format;

    this.GetFilterFormattedValue = (value: boolean): string => {
      const converter = <IBoolValueConverter>this.ColumnValueConverter;
      return value ? converter.TrueState : converter.FalseState;
    };
  }

  SetFormatting(
    trueState: string,
    falseState: string,
  ): this {
    this.SearchModel = {
      Filter: VmGridMappedBooleanModel,
      Params: {
        trueState: trueState,
        falseState: falseState,
      },
    };

    this.ColumnValueConverter = <IBoolValueConverter>{
      TrueState: trueState,
      FalseState: falseState,
    };

    return this;
  }
}

export class ContactInfoColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.ContactInfo;
    this.ViewModel = VmGridColumnTemplates.CONTACT_INFO;

    this.Format = contactInfoFormatting.Format;

    this.SearchModel = {
      Filter: VmGridContactInfoModel,
    };
  }
}

export class DateColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Date;

    this.Format = dateFormatting.Format;
  }

  SetFormatting(dateFormat: string): this {
    this.SearchModel = {
      Filter: VmGridDateModel,
      Params: {
        formatText: dateFormat,
      },
    };

    this.ColumnValueConverter = <IDateValueConverter>{
      DateFormat: dateFormat,
    };

    return this;
  }
}

export class FormatListColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.List;
    this.ViewModel = VmGridColumnTemplates.FORMAT_LIST;

    this.Format = stringArrayFormatting.Format;

    this.GetUniqueGroupList = (
      groupItems: Array<IVmDataFilterGroupItem>,
      groupName: string,
    ): Array<IVmDataFilterGroupItem> => {
      let rtnGroupItems: Array<IVmDataFilterGroupItem> = [];
      let sourceGroupItems: Array<string> = [];

      groupItems.forEach((groupItem) => {
        sourceGroupItems.push(...groupItem.groupItemLabel);
      });

      rtnGroupItems = [...new Set(sourceGroupItems.map(item => item))]
        .filter(item => item != null)
        .map((item) => <IVmDataFilterGroupItem>{
          groupItemLabel: item,
          isChecked: false,
          isSearchable: true,
          parentGroupName: groupName
        });

      return rtnGroupItems;
    };

    this.SearchModel = {
      Filter: VmGridStringArrayModel,
    };
  }

  SetFormatting(model: IFormatListValueConverter): this {
    this.ColumnValueConverter = <IFormatListValueConverter>{
      DisplayType: model.DisplayType,
      ItemDelimiter: model.ItemDelimiter,
      MaxItems: model.MaxItems,
    };

    this.Visible = model.Visible ?? true;

    return this;
  }
}

export class LinkTextColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.LinkText;

    this.Format = linkTextFormatting.Format;
  }

  Clicked(complete: (row: any) => void): this {
    this.ActionComplete = complete;
    return this;
  }

  SetFormatting(model: IFormatTextValueConverter): this {
    this.ColumnValueConverter = <IFormatTextValueConverter>{
      CheckColumnForTrueState: model.CheckColumnForTrueState,
    };

    return this;
  }
}

export class LiteralColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Literal;

    this.Format = literalFormatting.Format;
  }

  SetFormatting(model: IFormatTextValueConverter): this {
    this.ColumnValueConverter = <IFormatTextValueConverter>{
      FormatTemplate: model.FormatTemplate,
      ReplaceText: model.ReplaceText,
    };

    return this;
  }
}

export class MappedArrayColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
    mappedPropName: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.MappedArray;
    this.ViewModel = VmGridColumnTemplates.MAPPED_ARRAY;
    this.MappedPropName = mappedPropName;

    this.Format = (
      row: any,
      columnName: string,
    ): string => {
      const value = row[columnName];
      return value?.length ? value.map((x) => x[mappedPropName]).join(', ') : '';
    };
  }

  SearchFormat(mappedPropName: string): this {
    this.SearchModel = {
      Filter: VmGridMappedArrayModel,
      Params: {
        func: (x) => x[mappedPropName],
      },
    };
    return this;
  }
}

export class NumberColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Number;

    this.Format = numberFormatting.Format;
  }

  SetFormatting(model: IVmNumberFormatting): this {
    if (model.SearchFormat) {
      this.SearchModel = {
        Filter: VmGridNumberModel,
        Params: {
          formatText: model.SearchFormat,
        },
      };

      model.DisplayFormat = model.DisplayFormat || model.SearchFormat;

      this.ColumnValueConverter = <INumberValueConverter>{
        IgnoreFormatIfZero: model.IgnoreFormatIfZero,
        NumberFormat: model.DisplayFormat,
      };
    }

    return this;
  }
}

export class ProgressColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
    viewModel: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Progress;
    this.ViewModel = viewModel;
  }
}

export class StringArrayColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.StringArray;
    this.ViewModel = VmGridColumnTemplates.STRING_ARRAY;

    this.Format = stringArrayFormatting.Format;

    this.SearchModel = {
      Filter: VmGridStringArrayModel,
    };
  }
}

export class SubtextColumn extends GridColumnBase {
  constructor(columnName: string, width: string, columnHeaderText: string) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Subtext;
    this.ViewModel = PLATFORM.moduleName(
      '../configuration/templates/subtext-column/subtext-column.component',
      'clients-shared',
    );

    this.BindingContext = (row: any, column: GridColumnBase, contextMenu?: VMContextMenuService): ActionContext => {
      return new ActionContext(row, column, contextMenu, null, { columnName: columnName });
    };
  }
}

export class ToggleColumn extends GridColumnBase {
  ChangeHandler: (data: any) => void | undefined = undefined;

  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
    viewModel: string,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Toggle;
    this.ViewModel = viewModel;

    this.BindingContext = (
      row: any,
      column: GridColumnBase,
      contextMenu?: VMContextMenuService,
    ): ActionContext => {
      return new ActionContext(row, column, contextMenu, this.ChangeHandler);
    };
  }

  OnChange(changeHandler: (data: any) => void): this {
    this.ChangeHandler = changeHandler;
    return this;
  }
}

export class TooltipColumn extends GridColumnBase {
  constructor(
    columnName: string,
    width: string,
    columnHeaderText: string,
    position?: VMTooltipPositions,
    pin?: VMTooltipPins,
  ) {
    super(columnName, width, columnHeaderText);

    this.ColumnFieldType = VmGridColumnFieldType.Tooltip;
    this.ViewModel = PLATFORM.moduleName(
      '../configuration/templates/tooltip-column/tooltip-column.component',
      'clients-shared',
    );

    this.BindingContext = (row: any, column: GridColumnBase, contextMenu?: VMContextMenuService): ActionContext => {
      return new ActionContext(row, column, contextMenu, null, {
        columnName: columnName,
        position: position,
        pin: pin,
      });
    };
  }
}
