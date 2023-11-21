import { bindable } from 'aurelia-framework';
import { flatten, uniq, uniqBy } from 'lodash';
import { VmGridFilterModel } from '../../configuration/filterModels';
import { VmGridDataAbstract } from '../../data/vm-data-abstract';
import type { IVmGridConfig } from '../../interfaces/vm-grid-interfaces';
import { Subscription } from 'rxjs';
import { VmGridChangeTypes } from '../../data/vm-data-changes';

export interface PillModel {
  display: string;
  key: string;
  filterModels: VmGridFilterModel[];
}

const groupMultiFilters = (filterModels: VmGridFilterModel[], pillGroup: string): PillModel[] => {
  return uniqBy(
    filterModels.filter((filterModel) => {
      return filterModel?.pillGroup === pillGroup;
    }),
    'group',
  ).map((filterModel): PillModel => {
    return {
      display: filterModel.pillExpandable ? filterModel.pillGroup : filterModel.group,
      key: filterModel.group,
      filterModels: filterModels.filter((filterModel) => {
        return filterModel.group === filterModel.group;
      }),
    };
  });
};

const groupSingleFilters = (filterModels: VmGridFilterModel[]): PillModel[] => {
  return filterModels
    .filter((filterModel) => {
      return !filterModel.pillGroup;
    })
    .map((filterModel) => {
      return {
        display: filterModel.name,
        key: filterModel.name,
        filterModels: [filterModel],
      };
    });
};

export class FilterPillbox {
  @bindable gridData: VmGridDataAbstract;
  @bindable config: IVmGridConfig;

  filterSubscription: Subscription;
  pillList: PillModel[];

  constructor() {}
  attached(): void {
    this.filterSubscription = this.gridData.changes.getFilterChanges().subscribe(() => {
      const pillGroups = uniq(
        this.gridData.filters
          .filter((filterModel) => {
            return !!filterModel?.pillGroup;
          })
          .map((filterModel) => {
            return filterModel.pillGroup;
          }),
      );
      this.pillList = [
        ...groupSingleFilters(this.gridData.filters),
        ...flatten(
          pillGroups.map((pillGroupString) => {
            return groupMultiFilters(this.gridData.filters, pillGroupString);
          }),
        ),
      ];
    });
  }
  detached(): void {
    this.filterSubscription.unsubscribe();
  }

  remove(pill: PillModel): void {
    let filter = [];
    filter = this.gridData.filters.filter((filterModel) => {
      return filterModel.pillGroup ? filterModel.group !== pill.key : filterModel.name !== pill.key;
    });
    this.gridData.set({ filter });
  }
  clearFilters(): void {
    this.gridData.set({ filter: [] });
    this.publishFilterPillChanges();
  }

  private publishFilterPillChanges(pill?: PillModel): void {
    this.gridData.changes.publish({
      type: VmGridChangeTypes.FILTER_PILL_CHANGE,
      pill: pill,
    });
  }
}
