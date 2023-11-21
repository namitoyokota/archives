import type {
  IActionCommandConfig,
  IDefaultColumnProperties,
  IValueConverter,
  IVmGridOrderModel,
  IVmGridSearchModel,
} from 'shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces';
import {
  VmGridColumnFieldType,
  VmGridColumnPosition,
} from 'shared-from-dcdev/resources/features/vm-grid-v2/enums/vm-grid-enums';
import { VMContextMenuService } from '@venminder/vm-library';
import { IVmDataFilterGroupItem } from '../../vm-data-filter/vm-data-filter.interface';

export class ActionContext {
  constructor(
    public Row: any,
    public Column: GridColumnBase,
    public ContextMenu: VMContextMenuService,
    public OnChange?: any,
    public Options?: any,
  ) {
  }
}

export abstract class GridColumnBase {
  protected ActionComplete: (data: any) => void;
  protected AllowSorting: boolean;
  protected BindingContext: (
    row: any,
    column: GridColumnBase,
    contextMenu?: VMContextMenuService,
    onChange?: (data: any) => void,
  ) => ActionContext;
  protected ColumnFieldType: VmGridColumnFieldType;
  protected CustomSortProperty: string;
  protected ColumnValueConverter: IValueConverter;
  protected CommandItems: Array<IActionCommandConfig>;
  protected ExcludeFromDownload: boolean;
  protected Format: (
    row: any,
    column: any,
    converter?: IValueConverter,
    ignoreSanitize?: boolean,
  ) => string;
  protected GetFilterFormattedValue: (value: any) => any;
  protected GetUniqueGroupList: (
    groupItems: Array<IVmDataFilterGroupItem>,
    groupName: string,
  ) => Array<IVmDataFilterGroupItem>;
  protected GroupFilterOrderKeys: any;
  protected GroupFilterOrderProp: string;
  protected IsActionColumn: boolean;
  protected IsCustomFilter: boolean;
  protected IconClass: string;
  protected MappedPropName: string;
  protected OrderModels: IVmGridOrderModel[];
  protected Position: VmGridColumnPosition;
  protected SearchModel: IVmGridSearchModel;
  protected SortDirection: 'asc' | 'desc' | null;
  protected SortNullsToTop: boolean;
  protected TextAlign: string;
  protected TextOverflow: boolean;
  protected ViewLocked: boolean;
  protected ViewModel: string;
  protected Visible: boolean;

  constructor(
    protected ColumnName: string,
    protected Width: string,
    protected ColumnHeaderText?: string,
  ) {
    this.BindingContext = (
      row: any,
      column: GridColumnBase,
      contextMenu?: VMContextMenuService
    ): ActionContext => {
      return new ActionContext(row, column, contextMenu);
    };
  }

  public OrderBy(
    name: string,
    direction: 'asc' | 'desc',
    orderBy: string,
    defaultOrdinal: number,
  ): this {
    this.OrderModels = [
      {
        Name: name,
        Direction: direction,
        OrderBy: orderBy,
        DefaultOrdinal: defaultOrdinal
      }
    ];

    return this;
  }

  public SetDefaults(model: IDefaultColumnProperties): this {
    this.AllowSorting = model.AllowSorting;
    this.IsCustomFilter = model.IsCustomFilter;
    this.CustomSortProperty = model.CustomSortProperty;
    this.ExcludeFromDownload = this.ExcludeFromDownload || model.ExcludeFromDownload;
    this.GroupFilterOrderKeys = model.GroupFilterOrderKeys;
    this.GroupFilterOrderProp = model.GroupFilterOrderProp;
    this.SortNullsToTop = model.SortNullsToTop;
    this.TextAlign = model.TextAlign;
    this.TextOverflow = model.TextOverflow;
    this.ViewLocked = model.ViewLocked;
    this.Visible = model.Visible;

    return this;
  }
}
