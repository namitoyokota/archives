import { Subject } from 'rxjs';
import { VmGridFilterModel } from '../vm-grid-v2/configuration/filterModels';

export interface IVmDataFilterGroups {
  filterType: any;
  filterParams: Object;
  groupLabel: string;
  groupName: string;
  groupItems: Array<IVmDataFilterGroupItem>;
  isExpanded: boolean;
  selectedCount: number;
  visible: boolean;
}

export interface IVmDataFilterGroupItem {
  groupItemLabel: string;
  isChecked: boolean;
  isSearchable: boolean;
  parentGroupName: string;
  groupOrder: number;
}

export interface IVmDataFilterActivateModel {
  y: number;
  x: number;
  component: string;
  data: IVmDataFilterData;
  methods: IVmDataFilterMethods;
}

export interface IVmDataFilterData {
  dataFilterGroups: Array<IVmDataFilterGroups>;
}

export interface IVmDataFilterMethods {
  moreFiltersObservable: Subject<{ type: string }>;
}

export interface IVmDataFilterChanged {
  key: string;
  active: boolean;
}