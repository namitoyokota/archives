import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { ChipColor, PopoverPosition } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    capabilityId as TenantCapabilityId,
    CapabilityManifest$v1,
    CriteriaOperation$v1,
    DataSharingCapabilityOptions$v1,
    RestrictionLevels$v1,
    SharingConfiguration$v2,
    SharingCriteria$v1,
} from '@galileo/web_commontenant/_common';
import { CoreService } from '@galileo/web_commontenant/app/_core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CriteriaTableTranslationTokens } from './criteria-table.translation';

enum UserPersonalizations {
    externalSharing = 'externalSharing',
    internalSharing = 'internalSharing'
}

@Component({
    selector: 'hxgn-commontenant-criteria-table',
    templateUrl: 'criteria-table.component.html',
    styleUrls: ['criteria-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]
})
export class CriteriaTableComponent implements OnInit, OnDestroy {

    /** List of sharing configuration to show */
    @Input('configuration')
    set setConfiguration(c: SharingConfiguration$v2[]) {
        this.configuration = c;

        // Clean up expanded item
        if (this.expandedRowId) {
            const isFound = c.find(s => s.ownerId === this.expandedRowId);

            if (!isFound) {
                this.expandedRowId = null;
            }
        }

        // Clean up selection
        // Remove selection if it is no longer in the configuration
        this.selectedRows.forEach(id => {
            const isFound = !!this.configuration.find(item => item.ownerId === id);

            if (!isFound) {
                this.selectedRows = this.selectedRows.filter(rId => rId !== id);
            }
        });

        if (this.configuration?.length === 1) {
            this.expandedRowId = this.configuration[0]?.ownerId;
        }
    }

    /** List of sharing configuration to show */
    configuration: SharingConfiguration$v2[];

    /** List of global criteria */
    @Input() globalCriteria: SharingCriteria$v1<any, any>[] = [];

    /** List of columns to not display */
    @Input('hiddenColumns')
    set setHiddenColumns(columns: string[]) {
        this.displayedColumns = this.displayColumnOptions.filter(c => {
            return !columns.includes(c);
        });
    }

    /** A flag that is true if data sharing is external */
    @Input() isExternal = true;

    /** Whether or not the external tour should be shown. */
    @Input() showExternalTour = true;

    /** Whether or not the internal tour should be shown. */
    @Input() showInternalTour = true;

    /** Event when sharing criteria has been updated */
    @Output() criteriaUpdate = new EventEmitter<SharingCriteria$v1<any, any>>();

    /** Event when sharing criteria has been deleted */
    @Output() criteriaDeleted = new EventEmitter<string[]>();

    /** Event when internal tour has been shown. */
    @Output() externalTourShown: EventEmitter<void> = new EventEmitter<void>();

    /** Event when internal tour has been shown. */
    @Output() internalTourShown: EventEmitter<void> = new EventEmitter<void>();

    /** Table view child. */
    @ViewChild('mattable', { static: true }) table: MatTable<any>;

    /** Select all checkbox view child. */
    @ViewChild('selectallcheckbox') selectAllCheckbox: MatCheckbox;

    /** CUrrent user info */
    userInfo: UserInfo$v1;

    /** A flag that is true if internal data sharing is being set up */
    isInternal = false;

    /** Grid chip color. */
    ChipColor: typeof ChipColor = ChipColor;

    /** List of rows that are selected */
    selectedRows: string[] = [];

    /** The grid element that is expanded. OwnerId */
    expandedRowId: string;

    /** Expose translation tokens to html template */
    tokens: typeof CriteriaTableTranslationTokens = CriteriaTableTranslationTokens;

    /** User personalization string for popover. */
    userPersonalization = '';

    /** Flag to display popover */
    showPopover = true;

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** List of columns that can be displayed */
    readonly displayColumnOptions = [
        'organizations',
        'canAccess',
        'dataShared',
        'useGlobalPermissions'
    ];

    /** String array of grid displayed columns. */
    displayedColumns: string[] = this.displayColumnOptions;

    /** The current height of the window. */
    private windowHeight;

    /** List of capability name tokens to translate */
    private capabilityNameTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.userPersonalization = this.isExternal ? UserPersonalizations.externalSharing : UserPersonalizations.internalSharing;

        const capabilities = this.coreSrv.getCapabilityList();
        this.capabilityNameTokens = capabilities.map(x => x.nameToken);
        this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);

        this.windowHeight = window.innerHeight;

        /** Get flag from user personalization settings to show popover or not */
        this.identitySrv.getUserInfoAsync().then((user: UserInfo$v1) => {
            this.userInfo = user;
            this.identitySrv.getUserPersonalizationSettingsAsync(
                this.userInfo.id,
                this.userPersonalization
            ).then((result: string) => {
                this.showPopover = !JSON.parse(result);
            });
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Toggles selection
     * @param event Angular Mat checkbox change obj
     * @param ownerId Id of the owner of the critiera
     */
    toggleSelection(event: MatCheckboxChange, ownerId: string): void {
        if (event.checked) {
            // Add
            this.selectedRows.push(ownerId);
        } else {
            // Remove
            this.selectedRows = this.selectedRows.filter(rId => rId !== ownerId);
        }
    }

    /**
     * Toggle the selection of all the rows
     * @param event Angular Mat checkbox change obj
     */
    toggleSelectAll(event: MatCheckboxChange): void {
        if (event.checked) {
            this.selectedRows = this.configuration.map(c => c.ownerId);
        } else {
            this.selectedRows = [];
        }
    }

    /**
     * Returns true if the row is selected
     */
    isSelected(ownerId: string): boolean {
        return !!this.selectedRows.find(id => id === ownerId);
    }

    /**
     * Returns true if all rows are selected
     */
    isAllSelected(): boolean {
        return this.selectedRows?.length === this.configuration?.length &&
            this.configuration?.length > 0;
    }

    /**
     * Toggles the access state for a given capability
     * @param hasAccess A flag that is true if the user has access
     * @param capabilityId The target capability
     * @param ownerId The id of the owner of the sharing criteria
     */
    async toggleAccess(hasAccess: boolean, capabilityId: string, ownerId: string) {
        const criteria: SharingCriteria$v1<any, any> = this.configuration.find(c => {
            return c.ownerId === ownerId;
        })?.criteria?.find(sc => sc.capabilityId === capabilityId);

        // Get the capability manifest
        const manifests = this.coreSrv.getCapabilityList(null, true, this.isInternal, this.isExternal);
        const capability = manifests.find(m => m.id === capabilityId);
        const operationSettings = new DataSharingCapabilityOptions$v1(
            capability.compatible.find(c => c.capabilityId === TenantCapabilityId)?.options
        );

        let operations: string[] = [];
        if (this.isExternal) {
            operations = operationSettings.externalSharingOperations;
        } else {
            operations = operationSettings.internalSharingOperations;
        }

        const update = new SharingCriteria$v1<any, any>(criteria);
        update.capabilityOperations = operations.map(id => {
            const operation = new CriteriaOperation$v1({
                capabilityOperationId: id,
                enabled: hasAccess
            });

            return operation;
        });

        this.criteriaUpdate.emit(update);
    }

    /**
     * Toggles the access state for all capabilities
     * @param hasAccess A flag that is true if the user has access
     * @param ownerId The id of the owner of the criteria
     */
    async toggleAllAccess(hasAccess: boolean, ownerId: string) {
        const criteriaList: SharingCriteria$v1<any, any>[] = this.configuration.find(c => {
            return c.ownerId === ownerId;
        })?.criteria;

        criteriaList.forEach(c => {
            this.toggleAccess(hasAccess, c.capabilityId, ownerId);
        });
    }

    /**
     * Deletes the selected rows
     * @param ownerId Owner id of the row
     */
    delete(ownerId: string) {
        const ownerList = [...new Set(this.selectedRows.concat(ownerId))]; // List of selected plus the row that is selected

        // Get list of criteria ids that belong to the owner
        let removeList: string[] = [];
        this.configuration.forEach(c => {
            if (!!ownerList.find(id => id === c.ownerId)) {
                removeList = removeList.concat(c.criteria.map(item => item.referenceId));
            }
        });

        this.criteriaDeleted.emit(removeList);
    }

    /**
     * Mapping method that will return the chip color based on provided restriction level.
     * @param level The restriction level that to use to look up chip color
     */
    getChipColor(level: string) {
        switch (level) {
            case RestrictionLevels$v1.low:
                return ChipColor.Low;
            case RestrictionLevels$v1.medium:
                return ChipColor.Medium;
            case RestrictionLevels$v1.high:
                return ChipColor.High;
            default:
                return ChipColor.Selected;
        }
    }

    /**
    * Return the capability that matches the provided capability id.
    * @param capabilityId The capability to get
    */
    getCapability(capabilityId: string): CapabilityManifest$v1 {
        return this.coreSrv.getCapability(capabilityId);
    }

    /**
     * Returns if the capability is enabled
     * @param ownerId Id that owns the capability
     * @param capabilityId The capability id
     */
    getCapabilityAccess(ownerId: string, capabilityId: string): boolean {
        // Get list of operation id data sharing cares about
        const criteria = this.configuration.find(c => {
            return c.ownerId === ownerId;
        })?.criteria?.find(sc => sc.capabilityId === capabilityId);

        // Get the capability manifest
        const manifests = this.coreSrv.getCapabilityList(null, true, this.isInternal, this.isExternal);
        const capability = manifests.find(m => m.id === capabilityId);
        const operationSettings = new DataSharingCapabilityOptions$v1(
            capability?.compatible?.find(c => c.capabilityId === TenantCapabilityId)?.options
        );

        // Return true if the operations are enabled for the criteria

        let hasAccess = true;

        const operations = this.isExternal ? operationSettings.externalSharingOperations : operationSettings.internalSharingOperations;

        operations.forEach(id => {
            const operation = criteria?.capabilityOperations?.find(co => co?.capabilityOperationId === id);
            if (!operation?.enabled) {
                hasAccess = false;
            }
        });

        return hasAccess;
    }

    /**
     * Sets parent flag for tour shown to true on close
     */
    handlePopoverClose(dontShowAgain: boolean): void {
        if (dontShowAgain) {
            this.showPopover = false;
            this.identitySrv.saveUserPersonalizationSettingsAsync(
                this.userInfo.id,
                this.userPersonalization,
                dontShowAgain
            );
        }

        if (this.isExternal) {
            this.externalTourShown.emit();
        } else {
            this.internalTourShown.emit();
        }
    }

    /**
     * Used by the table to track changes
     * @param index Index of item
     * @param item Item
     * @returns string
     */
    trackByTask(index, item: SharingConfiguration$v2) {
        return item.ownerId;
    }

    /**
     * Filters sharing criteria and returns a list of only active criteria
     * @param SharingCriteria$v1 Sharing criteria to check
     */
    filterActiveCriteria(config: SharingConfiguration$v2): SharingConfiguration$v2 {
        const filterConfig = new SharingConfiguration$v2(config);
        filterConfig.criteria = filterConfig.criteria.filter(c => {
            return this.getCapabilityAccess(filterConfig.ownerId, c.capabilityId) &&
                this.globalCriteria.find(gc => gc.capabilityId === c.capabilityId);
        });

        return filterConfig;
    }

    /**
     * Returns the roll up access status. If any capability is enabled
     * then the access status enabled.
     */
    checkRollUpAccess(ownerId: string): boolean {
        // Check all the status
        let hasAccess = false;

        for (const c of this.globalCriteria) {
            if (this.getCapabilityAccess(ownerId, c.capabilityId)) {
                hasAccess = true;
                break;
            }
        }

        return hasAccess;
    }

    /**
     * Returns the currently active restriction level. This could be the
     * global or override level.
     * @param ownerId Id of the owner of the criteria (tenantId or groupId)
     * @param global The global sharing criteria
     */
    getCurrentRestrictionLevel(ownerId: string, global: SharingCriteria$v1<any, any>): string {

        // Check for an override
        const overrideLevel = this.configuration.find(c => {
            return c.ownerId === ownerId;
        })?.criteria?.find(sc => sc.capabilityId === global.capabilityId)?.currentLevel;

        if (overrideLevel) {
            return overrideLevel;
        }

        return global.currentLevel;

    }

    /**
     * Sets the access status for all selected rows
     * @param hasAccess Is access granted
     * @param ownerId Id of the owner of the criteria
     */
    async setBulkHasAccess(hasAccess: boolean, ownerId: string) {
        const ownerList = [...new Set(this.selectedRows.concat(ownerId))]; // List of selected plus the row that is selected
        ownerList.forEach(id => {
            this.toggleAllAccess(hasAccess, id);
        });
        // this.resetExpandedElement();
    }

    /**
     * Keep up with the height of the window.
     */
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.windowHeight = window.innerHeight;
    }
}
