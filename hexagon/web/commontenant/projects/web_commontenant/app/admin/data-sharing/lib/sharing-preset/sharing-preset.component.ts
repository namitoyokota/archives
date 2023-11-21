import { Component, ComponentRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import {
    CapabilityManifest$v1,
    CommontenantMailboxService,
    RestrictionGrouping$v1,
    RestrictionLevels$v1,
    SharingCriteria$v1,
} from '@galileo/web_commontenant/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { SharingPresetTranslationTokens } from './sharing-preset.translation';

@Component({
    selector: 'hxgn-commontenant-sharing-preset',
    templateUrl: 'sharing-preset.component.html',
    styleUrls: ['sharing-preset.component.scss']
})
export class SharingPresetComponent implements OnDestroy {

    /** The sharing criteria to edit */
    @Input('sharingCriteria')
    set setSharingCriteria(sc: SharingCriteria$v1<any, any>) {
        if (sc) {
            this.sharingCriteria.next(new SharingCriteria$v1<any, any>(sc));
        }
    }

    /** Capability to display preset for */
    @Input('capability')
    set setCapability(c: CapabilityManifest$v1) {
        this.capability = c;

        if (this.portalDestroy$) {
            this.portalDestroy$.next(true);
            this.portalDestroy$.complete();
        }

        combineLatest([
            this.sharingCriteria$.pipe(
                filter(sc => sc.capabilityId === this.capability.id)
            ),
            this.readonlyCriteria$.pipe(
                filter((sc: SharingCriteria$v1<any, any>) => {
                    return sc === null || sc?.capabilityId === this.capability?.id;
                })
            )
        ]).pipe(
            first()
        ).subscribe(([sc, ro]) => {

            if (this.portalDestroy$) {
                this.portalDestroy$.next(true);
                this.portalDestroy$.complete();
            }

            this.initListener();
            this.injectFilterComponentAsync(sc, this.capability, ro as SharingCriteria$v1<any, any>);
        });


    }

    /** A flag that is true if an override is being edited */
    @Input() isOverride = false;

    /** Criteria that cannot be edited */
    @Input('readOnlyCriteria')
    set setReadOnlyCriteria(sc: SharingCriteria$v1<any, any>) {
        if (sc) {
            this.readonlyCriteria.next(new SharingCriteria$v1<any, any>(sc));
        } else {
            this.readonlyCriteria.next(null);
        }
    }

    /** Event when sharing criteria changes */
    @Output() sharingCriteriaChange = new EventEmitter<SharingCriteria$v1<any, any>>();

    /** The sharing criteria to edit */
    private sharingCriteria = new BehaviorSubject<SharingCriteria$v1<any, any>>(null);

    /** The sharing criteria to edit */
    readonly sharingCriteria$ = this.sharingCriteria.asObservable().pipe(
        filter(data => !!data)
    );

    /** Criteria that cannot be edited */
    private readonlyCriteria = new BehaviorSubject<SharingCriteria$v1<any, any>>(undefined);

    /** Criteria that cannot be edited */
    readonly readonlyCriteria$ = this.readonlyCriteria.asObservable().pipe(
        filter(data => data !== undefined)
    );

    /** The restriction level to display */
    displayedLevel: RestrictionLevels$v1;

    /** The default level that is selected */
    defaultLevel$ = combineLatest([
        this.sharingCriteria$,
        this.readonlyCriteria$
    ]).pipe(
        map(([sc, ro]) => {
            if (sc.currentLevel) {
                return sc.currentLevel;
            } else if (ro.currentLevel) {
                return ro.currentLevel;
            }
        })
    );

    /** Expose RestrictionLevels$v1 to HTML */
    restrictionLevels: typeof RestrictionLevels$v1 = RestrictionLevels$v1;

    /** Expose SharingPresetTranslationTokens to HTML */
    tokens: typeof SharingPresetTranslationTokens = SharingPresetTranslationTokens;

    /** Capability to display preset for */
    private capability: CapabilityManifest$v1;

    /** Observable that is fired when a portal is destroyed. */
    private portalDestroy$: Subject<boolean>;

    /** Observable use to get filter criteria from filter portal */
    private filterCriteriaNotification$: Subject<RestrictionGrouping$v1<any, any>[]>;

    /** Observable used to get redaction criteria from redaction portal. */
    private redactionCriteriaNotification$: Subject<RestrictionGrouping$v1<any, any>[]>;

    /** Ref to the injected component */
    private componentRef: ComponentRef<any>;

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private layoutCompiler: LayoutCompilerAdapterService,
        private mailbox: CommontenantMailboxService
    ) { }

    /**
    * Life cycle hook for when the component is destroyed.
    */
    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Selects the current displayed level.
     * @param level The level to be selected
     */
    setSelectedDisplayLevel(level: RestrictionLevels$v1): void {
        this.displayedLevel = level;
        this.mailbox.mailbox$v1.adminDataFilterLevelChanged$.next(level);
    }

    /**
     * Sets the given level as the default sharing level
     * @param level The Restriction level to set at default
     */
    setDefaultLevel(level: RestrictionLevels$v1, event: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }

        const sc = this.sharingCriteria.getValue();
        sc.currentLevel = level;

        this.sharingCriteriaChange.emit(new SharingCriteria$v1<any, any>(sc));
    }

    /**
     * Injects the filter component for the given capability
     */
    private async injectFilterComponentAsync(
        sharingCriteria: SharingCriteria$v1<any, any>,
        capability: CapabilityManifest$v1,
        readOnlyCriteria: SharingCriteria$v1<any, any> = null
    ): Promise<void> {

        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }

        const portalOutlet = '.portal-host-criteria-setup';

        const injectionSettings = {
            editableFilterCriteria: sharingCriteria ? sharingCriteria.filterOperations : [],
            filterNotify$: this.filterCriteriaNotification$,
            editableRedactionCriteria: sharingCriteria ? sharingCriteria.redactionOperations : [],
            redactionNotify$: this.redactionCriteriaNotification$,
            isOverride: this.isOverride,
            readOnlyFilterCriteria: readOnlyCriteria ? readOnlyCriteria.filterOperations : [],
            readOnlyRedactionCriteria: readOnlyCriteria ? readOnlyCriteria.redactionOperations : []
        };

        this.componentRef = await this.layoutCompiler.delegateInjectComponentPortalAsync(
            capability.dataSharingComponentType,
            capability.id,
            portalOutlet,
            injectionSettings
        );

        const level = sharingCriteria.currentLevel ? sharingCriteria.currentLevel : readOnlyCriteria?.currentLevel;

        // Set the current display level
        this.setSelectedDisplayLevel(level as RestrictionLevels$v1);
    }

    /**
     * Sets up listeners to observables passed to portals.
     */
    private initListener() {
        this.filterCriteriaNotification$ = new Subject<RestrictionGrouping$v1<any, any>[]>();
        this.redactionCriteriaNotification$ = new Subject<RestrictionGrouping$v1<any, any>[]>();
        this.portalDestroy$ = new Subject<boolean>();

        const response = combineLatest([
            this.filterCriteriaNotification$,
            this.redactionCriteriaNotification$
        ]);

        response.pipe(
            takeUntil(this.portalDestroy$),
            takeUntil(this.destroy$)
        ).subscribe(([filterCriteria, redactionCriteria]) => {

            const sc = this.sharingCriteria.getValue();
            sc.filterOperations = filterCriteria;
            sc.redactionOperations = redactionCriteria;

            this.sharingCriteriaChange.emit(new SharingCriteria$v1<any, any>(sc));
        });
    }
}
