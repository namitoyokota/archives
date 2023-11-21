import { lazy, bindable, ObserverLocator } from "aurelia-framework";
import type { IVmGridConfig } from "../../interfaces/vm-grid-interfaces";
import { uniq } from "lodash";
import { VmGridFilterModel } from "../../utilities/grid-filter-utils";
import { Subscription } from "rxjs";
import { searchFilterModelPrefix } from "../search-field/search-field";
import { VmGridDataAbstract } from "../../data/vm-data-abstract";

interface PillModel {
    display: string,
    key: string,
    filterModels: VmGridFilterModel[]
}

const groupSearchFilters = (filterModels: VmGridFilterModel[]): PillModel[] => {
    return uniq(
        filterModels.map(filterModel => filterModel.group)
            .filter((filterModelGroup: string) => filterModelGroup.includes(searchFilterModelPrefix)),
        ).map((filterModelGroup: string): PillModel => {
            return {
                display: filterModelGroup.replace(searchFilterModelPrefix, '').trim(),
                key: filterModelGroup,
                filterModels: filterModels.filter(filterModel => filterModel.group === filterModelGroup)
            };
        });
}

const groupNonSearchFilters = (filterModels: VmGridFilterModel[]): PillModel[] => {
    return filterModels.filter(filterModel => !filterModel.group.includes(searchFilterModelPrefix))
        .map(filterModel => {
            return {
                display: filterModel.name,
                key: filterModel.name,
                filterModels: [filterModel]
            };
        });
}

export class FilterPillbox {
    @bindable gridData: VmGridDataAbstract
    @bindable config: IVmGridConfig

    filterSubscription: Subscription;
    pillList: PillModel[];

    constructor() { }
    attached() {
        this.filterSubscription = this.gridData.changes.getFilterChanges().subscribe(() => {
            this.pillList = [
                ...groupNonSearchFilters(this.gridData.filters),
                ...groupSearchFilters(this.gridData.filters)
            ];
        });
    }
    detached() {
        this.filterSubscription.unsubscribe();
    }

    remove(pill: PillModel) {
        let filter = []
        if (pill.key.includes(searchFilterModelPrefix)) {
            filter = this.gridData.filters.filter(filterModel => filterModel.group !== pill.filterModels[0].group);
        } else {
            filter = this.gridData.filters.filter(filterModel => filterModel.name !== pill.filterModels[0].name);
        }
        this.gridData.set({ filter });
    }
    clearFilters() {
        this.gridData.set({ filter: [] });
    }
}