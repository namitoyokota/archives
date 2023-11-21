import { MenuState } from '@venminder/vm-library';
import { IVmDataFilterGroups } from './vm-data-filter.interface';
import gsap from 'gsap';
import { VmCheckbox } from '@venminder/vm-library';
import { Subject } from 'rxjs';

export enum DataFilterGroup {
  MORE_FILTER_GROUP_NAME = 'More Filters'
}

export enum DataFilterGroupOrderProp {
  GROUP_ORDER = 'groupOrder',
  GROUP_ITEM_LABEL = 'groupItemLabel'
}

export enum DataFilterGroupSubscriptions {
  DATA_FILTER_GROUP_CHECK_CHANGED = 'DATA_FILTER_GROUP_CHECK_CHANGED'
}

export class VmDataFilter {
  private menuState: MenuState;

  dataFilterGroups: Array<IVmDataFilterGroups> = [];
  moreFiltersObservable: Subject<{ type: string }>;

  activate(model: MenuState): void {
    this.menuState = model;
    this.dataFilterGroups = this.menuState.data.dataFilterGroups;
    this.moreFiltersObservable = this.menuState.methods.moreFiltersObservable;
  }

  attached(): void {
    this.menuState.render();

    const expandedGroup = this.dataFilterGroups.filter(group => group.isExpanded)[0];
        
    if (expandedGroup) {
      const expandedOuterEl = <HTMLElement>document.querySelector(`#vm-data-filter-group${expandedGroup.groupName}`);
      const expandedInnerEl = <HTMLElement>document.querySelector(`#vm-data-filter-group-child${expandedGroup.groupName}`);

      if (!expandedInnerEl) {
        expandedGroup.isExpanded = false;
        expandedGroup.selectedCount = 0;
        return;
      }

      gsap.set(expandedOuterEl, { height: expandedInnerEl.offsetHeight });
    }
  }

  clearGroup(group: IVmDataFilterGroups): void {
    group.groupItems.forEach((groupItem) => {
      groupItem.isChecked = false;
    });

    group.selectedCount = 0;

    this.publishCheckChanges({
      type: DataFilterGroupSubscriptions.DATA_FILTER_GROUP_CHECK_CHANGED,
      groupName: group.groupName
    });
  }

  clearAll(): void {
    this.dataFilterGroups.forEach((group) => {
      group.groupItems.forEach((groupItem) => {
        groupItem.isChecked = false;
      });

      group.selectedCount = 0;
    });

    this.publishCheckChanges({
      type: DataFilterGroupSubscriptions.DATA_FILTER_GROUP_CHECK_CHANGED
    });
  }

  toggleGroup(currentGroup: IVmDataFilterGroups): void {
    const expandedGroup = this.dataFilterGroups
      .filter(group => group.isExpanded && group.groupName != currentGroup.groupName)[0];

    const currentOuterEl = <HTMLElement>document.querySelector(`#vm-data-filter-group${currentGroup.groupName}`);
    const currentInnerEl = <HTMLElement>document.querySelector(`#vm-data-filter-group-child${currentGroup.groupName}`);

    const expandedOuterEl = <HTMLElement>document.querySelector(`#vm-data-filter-group${expandedGroup?.groupName}`);
        
    if (expandedGroup) {
      expandedGroup.isExpanded = false;

      gsap.to(expandedOuterEl, {
        duration: .3,
        height: 0,
      });
    }

    currentGroup.isExpanded = !currentGroup.isExpanded;

    gsap.to(currentOuterEl, {
      duration: .3,
      height: ((currentGroup.isExpanded) ? currentInnerEl.offsetHeight : 0)
    });
  }

  updateMoreFilterGroups(
    $event,
    element: VmCheckbox,
  ): void {
    const groupName = element.name.split('-')[0];

    const group = this.dataFilterGroups.filter(g => g.groupName == groupName)[0];

    group.selectedCount = group.groupItems.filter(gi => gi.isChecked)?.length;

    this.publishCheckChanges({
      type: DataFilterGroupSubscriptions.DATA_FILTER_GROUP_CHECK_CHANGED,
      groupName: groupName
    });
  }

  private publishCheckChanges(type: { type: string, [key: string]: any }): void {
    this.moreFiltersObservable.next(type);
  }
}