import { Component, DoCheck, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Alarm$v1, capabilityId, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { CardExpansionState, PopoverPosition, StoreService } from '@galileo/web_common-libraries';
import { CommonconversationsAdapterService$v1 } from '@galileo/web_commonconversations/adapter';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { ActionStoreService } from '../../../action-store.service';
import { CoreService } from '../../../core.service';
import { DataService } from '../../../data.service';
import { EventService } from '../../../event.service';
import { AlarmCardTranslationTokens } from './card.translation';

@Component({
    selector: 'hxgn-alarms-card',
    templateUrl: 'card.component.html',
    styleUrls: ['card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy, DoCheck {

    /** Alarm setter */
    @Input('alarm')
    set setAlarm(alarm: Alarm$v1) {
        this.alarm = alarm;
        this.setHeaderTitle();
    }

    /** A flag that is true when tenant info should be shown */
    @Input() showTenantInfo = false;

    /** The context id of the view using this component.  Needed for portal injection */
    @Input() contextId: string;

    /** Details are being shown when true */
    @Input() isExpanded = false;

    /** A flag that is true when the clear alarm button should be shown */
    @Input() showClearAlarmButton = false;

    /** Flag that is true if the card can be expanded */
    @Input() enableCardExpansion = true;

    /** When true will show remarks if they are not redacted. */
    @Input() enableRemarks = false;

    /** When true will show media if they are not redacted. */
    @Input() enableMedia = false;

    /** When true will show keywords if they are not redacted. */
    @Input() enableKeywords = false;

    /** A flag that is true when the action panel should be shown */
    @Input() showActionPanel = false;

    /** True if create channel btn should be shown */
    @Input() showCreateChannelBtn = true;

    /** A flag that is true if the card was auto closed */
    @Input() wasExpanded: boolean;

    /** Flag that is true when card is selected */
    @Input() isSelected = false;

    /** Id of the current tenant */
    @Input() currentTenantId: string;

    /** Event that is fired when the state of the expansion pane changes */
    @Output() expansionChange = new EventEmitter<boolean>();

    /** Event when size of card changes */
    @Output() sizeChange = new EventEmitter<number>();

    /** Event if card is destroyed when expanded */
    @Output() expandedDestroy = new EventEmitter();

    /** Alarm for the card */
    alarm: Alarm$v1;

    /** Header title to show on card */
    headerTitle: string = null;

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Expose restrict ids to html. */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose AlarmCardTranslationTokens to HTML */
    tokens: typeof AlarmCardTranslationTokens = AlarmCardTranslationTokens;

    /** Size when expanded */
    expandSize = 0;

    /** Subject used unsubscribe to all subject on destroy of component */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Can an alarm be created from this channel */
    canCreateChannel$: Observable<boolean>;

    /** Can the alarm be bulk deleted */
    canBulkDelete$: Observable<boolean>;

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private conversationAdapter: CommonconversationsAdapterService$v1,
        private dataSrv: DataService,
        private coreSrv: CoreService,
        private eventSrv: EventService,
        private elementRef: ElementRef,
        private actionStore: ActionStoreService,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        private alarmStore: StoreService<Alarm$v1>
    ) { }

    /**
     * On init life cycle hook
     */
    ngOnInit() {
        this.setHeaderTitle();

        this.eventSrv.minuteTick$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });

        this.canCreateChannel$ = this.actionStore.multiselect$(this.contextId).pipe(
            map(data => {
                if (data?.items?.length > 1 && data?.items?.some(item => item.entityId === this.alarm.id)) {
                    return false;
                } else {
                    return true;
                }
            })
        );

        this.canBulkDelete$ = combineLatest([
            this.actionStore.multiselect$(this.contextId),
            this.alarmStore.entity$
        ]).pipe(
            map(([selection, alarms]) => {

                if (selection?.items?.length > 1 && selection.items.some(item => item.entityId === this.alarm.id)) {
                    // Is any selected alarms managed?
                    const selectedAlarms = alarms.filter(a => selection.items.some(item => item.entityId === a.id));
                    return selectedAlarms.some(alarm => !alarm.isManaged && alarm.tenantId === this.currentTenantId); // My tenant
                } else {
                    return this.showClearAlarmButton;
                }
            })
        );

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.setHeaderTitle();
            }
        });
    }

    /**
     * Check for size changes
     */
    ngDoCheck() {
        if (this.isExpanded) {
            const currentSize = this.elementRef.nativeElement.offsetHeight;
            if (currentSize !== this.expandSize) {
                this.expandSize = currentSize;
                this.sizeChange.emit(this.expandSize);
            }
        }
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy() {
        if (this.isExpanded) {
            this.expandedDestroy.emit();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Starts a channel
     */
    startChannel() {
        this.conversationAdapter.startNewChannel(capabilityId, this.alarm.id, this.alarm.title, this.alarm.location, this.alarm.tenantId);
    }

    /**
     * Toggle the state of the expansion panel
     */
    toggleExpansionPanel(state: CardExpansionState) {
        this.expansionChange.emit(state === CardExpansionState.expanded);
    }

    /**
     * Clears the alarm
     */
    async clearAsync(event: MouseEvent) {
        this.actionStore.multiselect$(this.contextId).pipe(first()).subscribe(async data => {
            if (data?.items?.length > 1 && data?.items.some(item => item.entityId === this.alarm.id)) {
                this.coreSrv.confirmDeleteBulkAsync(data?.items.map(item => item.entityId), this.currentTenantId);
            } else {
                if (await this.coreSrv.confirmDeleteAsync()) {
                    await this.dataSrv.deleteUnmanagedAlarms$([this.alarm.id]).toPromise();
                }
            }
        });
    }

    /**
     * Returns the state of the expansion pane
     */
    getExpansionState(): CardExpansionState {
        if (!this.enableCardExpansion) {
            return CardExpansionState.hidden;
        } else if (this.areDetailsRedacted()) {
            return CardExpansionState.locked;
        } else if (this.isExpanded) {
            return CardExpansionState.expanded;
        } else {
            return CardExpansionState.collapsed;
        }
    }

    /**
     * Returns true if all data in the detail area is redacted
     */
    private areDetailsRedacted(): boolean {
        if (!this.alarm.isRedacted(RestrictIds$v1.attachments)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.keywords)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.lastUpdateTime)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.location)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.primaryContact)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.priority)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.remarks)) {
            return false;
        }

        if (!this.alarm.isRedacted(RestrictIds$v1.type)) {
            return false;
        }

        return true;
    }

    /**
     * Sets header title if alarm is tombstoned
     */
    private setHeaderTitle() {
        if (this.alarm.tombstoned) {
            if (!this.headerTitle) {
                this.localizationSrv.getTranslationAsync(AlarmCardTranslationTokens.alarmClosed).then(text => {
                    this.headerTitle = text;
                });
            }
        } else {
            this.headerTitle = null;
        }
    }
}
