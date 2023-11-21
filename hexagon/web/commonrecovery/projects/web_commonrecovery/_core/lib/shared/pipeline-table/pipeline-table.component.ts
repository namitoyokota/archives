import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { PopoverPosition, Utils } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Operation$v1, Pipeline$v1, PipelineColumn$v1, Scope$v1, Status$v1 } from '@galileo/web_commonrecovery/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslatedTokens, TranslationTokens } from './pipeline-table.translation';

enum TenantName {
    other = 'Other',
    system = 'System',
    unknown = 'Unknown'
}

@Component({
    selector: 'hxgn-commonrecovery-pipeline-table',
    templateUrl: 'pipeline-table.component.html',
    styleUrls: ['pipeline-table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]
})
export class PipelineTableComponent implements OnInit, OnDestroy {

    /** List of pipeline runs to display */
    @Input('pipelines')
    set setPipelines(pipelines: Pipeline$v1[]) {
        if (pipelines?.length) {
            this.parentPipelines = this.sortPipelines(pipelines);
        }
    }

    /** List of columns to not display */
    @Input('hiddenColumns')
    set setHiddenColumns(columns: string[]) {
        this.displayedColumns = this.displayColumnOptions.filter(c => {
            return !columns.includes(c);
        });
    }

    /** List of child pipelines */
    @Input() childPipelines: Pipeline$v1[];

    /** Flag to display expand button to see children pipeline runs */
    @Input() showChildren = false;

    /** Emits when row expand changes */
    @Output() expandChange: EventEmitter<string> = new EventEmitter<string>();

    /** List of pipelines runs */
    parentPipelines: Pipeline$v1[];

    /** Dictionary to store tenant name relative to its id */
    tenantStore: Map<string, string> = new Map<string, string>();

    /** Id of the currently expanded row */
    expandedRunId = '';

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Tenant id used from backend for system data */
    readonly otherTenantId = '00000000-0000-0000-0000-000000000000';

    /** Expose operation enum to HTML */
    operation: typeof Operation$v1 = Operation$v1;

    /** Expose status enum to HTML */
    status: typeof Status$v1 = Status$v1;

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** String array of grid displayed columns. */
    readonly displayColumnOptions = [
        PipelineColumn$v1.organization,
        PipelineColumn$v1.operation,
        PipelineColumn$v1.status,
        PipelineColumn$v1.duration,
        PipelineColumn$v1.date
    ];

    /** String array of grid displayed columns. */
    displayedColumns: string[] = this.displayColumnOptions;

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        this.initLocalizationAsync();

        if (this.displayedColumns.includes(PipelineColumn$v1.organization)) {
            this.tenantStore.set(Scope$v1.system, TenantName.system);
            this.tenantStore.set(this.otherTenantId, TenantName.other);
            await this.tenantSrv.getTenantsAsync().then(tenants => {
                tenants.forEach(tenant => {
                    this.tenantStore.set(tenant.id, tenant.name);
                });
            });

            this.parentPipelines = Utils.deepCopy(this.sortPipelines(this.parentPipelines));
        }

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Expand row */
    async expand(id: string) {
        if (this.expandedRunId === id) {
            this.expandedRunId = null;
        } else {
            this.expandedRunId = id;
        }
        this.expandChange.emit(this.expandedRunId);
    }

    /** Get tenant name from tenant id */
    getTenantName(tenantId) {
        if (this.tenantStore.has(tenantId)) {
            return this.tenantStore.get(tenantId);
        } else {
            return TenantName.unknown;
        }
    }

    /** Calculate duration in years/months/days/hours/minutes/seconds */
    getDuration(run: Pipeline$v1) {
        const startTime = new Date(run.startTime);
        let endTime;
        if (run.endTime) {
            endTime = new Date(run.endTime);
        } else {
            endTime = new Date();
        }

        const seconds = Math.round(Math.abs((endTime.getTime() - startTime.getTime()) / 1000));
        const minutes = Math.round(Math.abs(seconds / 60));
        const hours = Math.round(Math.abs(minutes / 60));
        const days = Math.round(Math.abs(hours / 24));

        let dateString = '';

        if (days > 0) {
            dateString += (days > 1) ? days + ` ${this.tTokens.days} ` : `1 ${this.tTokens.day} `;
        } else if (hours > 0) {
            dateString += (hours > 1) ? hours + ` ${this.tTokens.hours} ` : `1 ${this.tTokens.hour} `;
        } else if (minutes > 0) {
            dateString += (minutes > 1) ? minutes + ` ${this.tTokens.minutes} ` : `1 ${this.tTokens.minute} `;
        } else {
            dateString += (seconds > 1) ? seconds + ` ${this.tTokens.seconds} ` : `1 ${this.tTokens.second} `;
        }

        return dateString;
    }

    /** Sort pipelines by organization and date */
    sortPipelines(pipelines: Pipeline$v1[]): Pipeline$v1[] {
        return pipelines.sort((a: Pipeline$v1, b: Pipeline$v1) => {
            if (this.tenantStore.has(a.tenantId) && this.tenantStore.has(b.tenantId)) {
                if (this.tenantStore.get(a.tenantId) === this.tenantStore.get(b.tenantId)) {
                    return +new Date(b.startTime) - +new Date(a.startTime);
                } else {
                    return this.tenantStore.get(a.tenantId).localeCompare(this.tenantStore.get(b.tenantId));
                }
            } else {
                if (a.tenantId === b.tenantId) {
                    return +new Date(b.startTime) - +new Date(a.startTime);
                } else {
                    return a.tenantId.localeCompare(b.tenantId);
                }
            }
        });
    }

    /** Gets the token that needs to be displayed */
    getDisplayOperation(operation: string): string {
        return operation === this.operation.backup ? this.tokens.backup
            : operation === this.operation.restore ? this.tokens.restore
                : operation === this.operation.deleteBackup ? this.tokens.deleteBackup
                    : operation === this.operation.download ? this.tokens.download
                        : operation;
    }

    /** Gets flag whether to display status indicator */
    showStatus(): boolean {
        return !this.displayedColumns.includes(PipelineColumn$v1.organization);
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        const keys = Object.keys(TranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[TranslationTokens[prop]];
        }
    }
}
