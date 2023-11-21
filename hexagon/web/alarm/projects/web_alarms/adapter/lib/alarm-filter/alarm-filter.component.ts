import {
    AfterViewInit,
    Component,
    ComponentRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { AlarmFilterSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlarmsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-alarms-filter-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class AlarmFilterComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings = new AlarmFilterSettings$v1();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Outputs the filtered alarm ids based on dropdown selection. */
    @Output() filteredAlarmsIds = new EventEmitter<string[]>();

    /** Outputs the translated filter status. */
    @Output() filteredStatus = new EventEmitter<string>();

    /** Outputs the selected value from the dropdown. */
    @Output() selectedValue = new EventEmitter<string>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** Alarm ids to filter on. */
    @Input('alarmIds')
    set setAlarmIds(ids: string[]) {
        this.settings.setAlarmIds(ids);
    }

    /** Any custom values to add to the dropdown. Optional. */
    @Input('customValues')
    set setCustomValues(customValues: Map<string, string>) {
        this.settings.setCustomValues(customValues);
    }

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
                private adapter: AlarmsAdapterService$v1) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.settings.filteredAlarmIds$.pipe(takeUntil(this.destroy$)).subscribe(filteredAlarmIds => {
            this.filteredAlarmsIds.emit(filteredAlarmIds);
        });

        this.settings.filteredStatus$.pipe(takeUntil(this.destroy$)).subscribe(filteredStatus => {
            this.filteredStatus.emit(filteredStatus);
        });

        this.settings.selectedValue$.pipe(takeUntil(this.destroy$)).subscribe(selectedValue => {
            this.selectedValue.emit(selectedValue);
        });
    }

    /** Function ran after view initialization. */
    async ngAfterViewInit() {
        await this.adapter.loadCore();
        await this.injectComponentAsync();
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmFilter,
            capabilityId, '#' + this.componentId, this.settings);
    }
}
