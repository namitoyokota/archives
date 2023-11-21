import { Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { EntityTenant$v1 } from '@galileo/web_commonconversations/adapter';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { TombstonedService } from '../../tombstoned.service';
import { CardListTranslationTokens } from './card-list.translation';

export interface CardListInjectableComponentSettings {

    /** Alarm ids */
    ids: Observable<EntityTenant$v1[]>;

    /** Context id */
    contextId: string;
}

@Component({
    templateUrl: 'card-list.component.html',
    styleUrls: ['card-list.component.scss']
})
export class CardListInjectableComponent implements OnInit, OnDestroy {

    /** Reference to cards in list */
    @ViewChildren("cardRef", { read: ElementRef }) cardRefs: QueryList<ElementRef>;

    /** Alarms data. */
    alarms$: Observable<Alarm$v1[]> = combineLatest([
        this.settings.ids, this.alarmStore.entity$
    ]).pipe(map(([ids, alarms]) => {
        return alarms?.filter(alarm => {
            return !!ids?.find(id => alarm.id === id.entityId);
        }).sort((a, b) => {
            // Sort by if is tombstoned
            if (a.tombstoned && !b.tombstoned) {
                return 1;
            } else {
                return -1;
            }
        });
    }));

    /** List of entity ids that are not in the store */
    missingIds$: Observable<string[]> = combineLatest([
        this.settings.ids, this.alarmStore.entity$
    ]).pipe(map(([ids, alarms]) => {
        return ids.filter(id => {
            return !alarms.find(alarm => alarm.id === id.entityId);
        }).map(id => id.entityId);
    }));

    /** A flag that is true when loading is complete */
    loadingDone = false;

    /** Expose CardListTranslationTokens to HTML */
    tokens: typeof CardListTranslationTokens = CardListTranslationTokens;

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private settings: CardListInjectableComponentSettings,
        private alarmStore: StoreService<Alarm$v1>,
        private tombstonedSrv: TombstonedService
    ) { }

    ngOnInit(): void {
        // Clear any existing holds
        // When list changes make sure to update the recollection
        this.settings.ids.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (ids: EntityTenant$v1[]) => {
            this.loadingDone = false;

            // Make a call by tenant id
            let tenantList: string[] = ids.map(id => id.ownerTenantId);
            tenantList = [...new Set(tenantList)];

            const lockList: Promise<void>[] = [];
            for (const tenantId of tenantList) {
                const entityIds: string[] = ids.filter(id => id.ownerTenantId === tenantId).map(id => id.entityId);
                lockList.push(this.tombstonedSrv.lockAsync(entityIds, this.settings.contextId, tenantId));
            }

            if (lockList?.length) {
                await Promise.all(lockList).catch(err => {
                    this.loadingDone = true;
                });
            }

            this.loadingDone = true;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Function used by a ngFor loop in the html to help with performance.
     * @param index Item's index in list
     * @param item Alarm
     */
    trackByFn(index, item: Alarm$v1) {
        return item.id;
    }

    /**
     * Focuses the card in the list
     */
    focusCard(focus: boolean, index: number) {
        if (focus) {
            // Wait for animation to be done
            setTimeout(() => {
            const ref = this.cardRefs.get(index);
            ref?.nativeElement.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: 'smooth'
            });
            }, 310);
        }
    }
}
