import {
  IBoolValueConverter,
  IDateValueConverter,
  INumberValueConverter,
} from '../interfaces/vm-grid-interfaces';
import {
  addressFormatting,
  booleanFormatting,
  contactInfoFormatting,
  dateFormatting,
  mappedArrayFormatting,
  numberFormatting,
  stringArrayFormatting,
} from '../configuration/formatting';
import { isEqual } from 'date-fns';
import moment from 'moment';
import { FilterGroup } from '../filters/custom-filter-group/custom-filter-group';

export class VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public active: boolean = false,
    public pillGroup?: string,
    public pillExpandable?: boolean,
    public customClickHandler?: (event, currentGroup: FilterGroup) => void,
  ) {}

  filter(row: any): boolean {
    return true;
  }

  public assign(params): this {
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
    public text: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    let val = row[this.columnName];

    if (val) {
      val = val.toLowerCase ? val : val.toString();
      return val.toLowerCase().includes(this.text.toLowerCase());
    } else {
      return false;
    }
  }
}

export class VmGridAddressModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const value = addressFormatting.Format(row, this.columnName, null, true);
    return value.toLowerCase().includes(this.text.toLowerCase());
  }
}

export class VmGridDataFilter {
  public groupName: string = '';
  public filters: Array<VmGridNullModel> = [];

  public addGroup(
    groupName: string,
    customClickHandler: (event, groupName) => void,
  ): this {
    this.groupName = groupName;
    this.filters.push(new VmGridNullModel(this.groupName, this.groupName.toLowerCase(), false, customClickHandler));
    return this;
  }
}

export class VmGridBooleanFilter {
  public groupName: string = '';
  private columnReference: string = '';
  public filters: Array<VmGridBooleanModel> = [];
  
  public addGroup(
    groupName: string,
    columnReference: string = '',
  ): this {
    this.groupName = groupName;
    this.columnReference = columnReference;
    return this;
  }

  public addItem(
    itemText: string,
    columnName, checkState: boolean,
  ): this {
    if (!!this.groupName) {
      this.filters.push(new VmGridBooleanModel(itemText, this.groupName, (this.columnReference
        || this.groupName.toLowerCase()), columnName, checkState));
    }
    return this;
  }
}

export class VmGridNullModel extends VmGridFilterModel {
  constructor(
    public group: string,
    public columnReference: string,
    public boolean: boolean,
    public customClickHandler?: (event, groupName) => void,
  ) {
    super(null, group, columnReference, null);
  }
}

export class VmGridBooleanModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public boolean: boolean,
    public pillGroup?: string,
    public pillExpandable?: boolean,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    return row[this.columnName] === this.boolean;
  }
}

export class VmGridStringFilter {
  public groupName: string = '';
  public filters: Array<VmGridStringFilterModel> = [];

  public addGroup(groupName: string): this {
    this.groupName = groupName;
    return this;
  }

  public addItem(filterDisplay: string, columnName: string, filterValue: string): this {
    if (!!this.groupName) {
      this.filters.push(new VmGridStringFilterModel(filterDisplay, this.groupName, this.groupName.toLowerCase(), columnName, filterValue));
    }
    return this;
  }
}

export class VmGridStringFilterModel extends VmGridFilterModel {
  constructor(
    public filterDisplayValue: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public filterValue: string,
    public pillGroup?: string,
    public pillExpandable?: boolean,
  ) {
    super(filterDisplayValue, group, columnReference, columnName, false, pillGroup, pillExpandable);
  }

  public filter(row: any): boolean {
    let columnString: string = row[this.columnName];
    if (columnString == undefined || this.filterValue == undefined) {
      return false;
    }
    return columnString.toLowerCase() == this.filterValue.toLowerCase();
  }
}

export class VmGridContactInfoModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const value = contactInfoFormatting.Format(row, null, null, true);
    return value.toLowerCase().includes(this.text.toLowerCase());
  }
}

export class VmGridDateModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
    public formatText: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const date = dateFormatting.Format(row, this.columnName, <IDateValueConverter>{ DateFormat: this.formatText }, true);
    return date.includes(this.text);
  }
}

export class VmGridDateRangeModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
    public dateFrom: Date,
    public dateTo: Date,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const date = new Date(row[this.columnName]);
    date.setHours(0, 0, 0, 0);

    if (!this.dateTo) {
      return isEqual(date, this.dateFrom);
    }
    else {
      return date && moment(date).isBetween(
        this.dateFrom,
        this.dateTo,
        null,
        '[]'
      );
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
    public func: any,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const mappedArray = mappedArrayFormatting(this.columnName).Format(row, this.columnName);
    return mappedArray.toLowerCase().includes(this.text.toLowerCase());
  }
}

export class VmGridMappedBooleanModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnName: string,
    public columnReference: string,
    public text: string,
    public trueState: string,
    public falseState: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const value = booleanFormatting.Format(row, this.columnName, <IBoolValueConverter>{
      TrueState: this.trueState,
      FalseState: this.falseState
    }, true);
    return value.toLowerCase().includes(this.text.toLowerCase());
  }
}

export class VmGridNumberModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
    public formatText: string,
  ) {
    super(name, group, columnReference, columnName);
  }
  public filter(row: any): boolean {
    const value = numberFormatting.Format(row, this.columnName, <INumberValueConverter>{ NumberFormat: this.formatText }, true);
    return value.includes(this.text);
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
    public actual: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const value = row[this.columnName] || '';
    const valueToCheck = row[this.columnToCheck] || '';

    this.text = this.text.toLowerCase();

    if (this.display.includes(this.text)) {
      return valueToCheck.toLowerCase().includes(this.actual);
    } else {
      return value.toLowerCase().includes(this.text) || valueToCheck.toLowerCase().includes(this.text);
    }
  }
}

export class VmGridStringArrayModel extends VmGridFilterModel {
  constructor(
    public name: string,
    public group: string,
    public columnReference: string,
    public columnName: string,
    public text: string,
  ) {
    super(name, group, columnReference, columnName);
  }

  public filter(row: any): boolean {
    const stringArray = stringArrayFormatting.Format(row, this.columnName);
    return stringArray.toLowerCase().includes(this.text.toLowerCase());
  }
}

export class VmGridStringFilterMultiPill extends VmGridStringFilter {
  pillGroup?: string;
  pillExpandable = false;

  setMultiPill(pillGroup: string, pillExpandable = false): this {
    this.pillGroup = pillGroup;
    this.pillExpandable = pillExpandable;
    return this;
  }

  addItem(filterDisplay: string, columnName: string, filterValue: string): this {
    if (this.groupName) {
      this.filters.push(
        new VmGridStringFilterModel(
          filterDisplay,
          this.groupName,
          this.groupName.toLowerCase(),
          columnName,
          filterValue,
          this.pillGroup,
          this.pillExpandable,
        ),
      );
    }
    return this;
  }
}

export class VmGridBooleanFilterMultiPill extends VmGridBooleanFilter {
  pillGroup?: string;
  pillExpandable = false;

  setMultiPill(pillGroup: string, pillExpandable = false): this {
    this.pillGroup = pillGroup;
    this.pillExpandable = pillExpandable;
    return this;
  }

  addItem(filterDisplay: string, columnName: string, boolean: boolean): this {
    if (this.groupName) {
      this.filters.push(
        new VmGridBooleanModel(
          filterDisplay,
          this.groupName,
          this.groupName.toLowerCase(),
          columnName,
          boolean,
          this.pillGroup,
          this.pillExpandable,
        )
      );
    }
    return this;
  }
}
