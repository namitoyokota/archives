import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { capabilityId, FilterOptions$v1 } from '@galileo/web_commonnotifications/_common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { SettingsPaneTranslationTokens } from './settings-pane.translation';

interface CapabilityOrder {
    capabilityId: string;
    token: string;
}

@Component({
    selector: 'hxgn-commonnotifications-settings-pane',
    templateUrl: 'settings-pane.component.html',
    styleUrls: ['settings-pane.component.scss']
})
export class SettingsPaneComponent {

    /** Settings key used to save the order */
    private readonly settingsKey = 'NOTIFICATION_CATEGORY_ORDER';

    /** List of the order the filter options should be in */
    @Input('order')
    set setOrder(order: string[]) {
        this.order.next(order);
    }

    /** Store for order */
    private order = new BehaviorSubject<string[]>([]);

    /** List of filter options */
    @Input('filterOptions')
    set setFilterOptions(options: FilterOptions$v1[]) {
        let newCapabilityOrder: CapabilityOrder[] = [];

        // Added flagged order
        newCapabilityOrder.push(
            {
                capabilityId,
                token: SettingsPaneTranslationTokens.flagged
            } as CapabilityOrder
        );

        for (const option of options) {
            if (!newCapabilityOrder.find(o => o.capabilityId === option.capabilityId)) {
                newCapabilityOrder = [...newCapabilityOrder, {
                    capabilityId: option.capabilityId,
                    token: option.capabilityToken
                } as CapabilityOrder];
            }
        }

        this.capabilityOrder.next(newCapabilityOrder);
    }

    /** A flag that is true if sound is enabled */
    @Input() enableSound = true;

    /** Event when order has changed */
    @Output() reorder = new EventEmitter<string[]>();

    /** Event when sound toggle changes */
    @Output() toggleSound = new EventEmitter<boolean>();

    /** The order the capabilities should be in  */
    private capabilityOrder = new BehaviorSubject<CapabilityOrder[]>([]);

    /** Stream of capabilities that are always in order */
    readonly capabilityOrder$ = combineLatest([
        this.capabilityOrder.asObservable(),
        this.order.asObservable()
    ]).pipe(
        map(([options, order]) => {
            const sortedOptions = [].concat(options);

            if (!order?.length) {
                return sortedOptions;
            }

            sortedOptions.sort((a, b) => {
                return order?.indexOf(a.capabilityId) - order?.indexOf(b.capabilityId);
            });

            return sortedOptions;
        })
    );

    /** Expose SettingsPaneTranslationTokens to HTML */
    tokens: typeof SettingsPaneTranslationTokens = SettingsPaneTranslationTokens;

    constructor(
        private identityAdapter: CommonidentityAdapterService$v1
    ) { }

    /**
     * Event that is fired when an item is reorder
     * @param event Angular drag drop event object
     */
    async drop(event: CdkDragDrop<CapabilityOrder[]>) {
        const order = [].concat(await this.capabilityOrder$.pipe(first()).toPromise());
        moveItemInArray(order, event.previousIndex, event.currentIndex);

        const orderList = order.map(o => o.capabilityId);

        this.order.next(orderList);
        this.reorder.emit(orderList);

        this.identityAdapter.getUserInfoAsync().then(async user => {
            this.identityAdapter.saveUserPersonalizationSettingsAsync<string[]>(
                user.id, this.settingsKey, orderList
            );
        });
    }

    /**
     * Toggle sound value
     */
    toggleSoundSetting(event: MatSlideToggleChange): void {
        this.toggleSound.emit(event.checked);
    }
}
