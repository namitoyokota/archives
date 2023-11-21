import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { AlarmStatusSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject } from 'rxjs';

import { AlarmsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-alarms-status-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})

export class AlarmStatusComponent implements AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Store of alarm ids */
    private alarmIds$ = new BehaviorSubject<string[]>(null);

    /** Ids of alarms to show status for */
    @Input('alarmIds')
    set setAlarmIds(ids: string[]) {
        this.alarmIds$.next(ids);
    }

    /** Flag to indicate whether to show the border around the status icon */
    @Input() showBorder = false;

    /** Flag to indicate whether to show a shadow border around the status icon */
    @Input() showBorderShadow = false;

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
                private adapter: AlarmsAdapterService$v1) { }

    /** Function ran after view initialization. */
    async ngAfterViewInit() {
        await this.adapter.loadCore();
        await this.injectComponentAsync();
    }

    /** Function ran on component destroy. */
    ngOnDestroy(): void {
        if (this.ref) {
            this.ref.destroy();
        }
    }

    private async injectComponentAsync() {

        const settings = new AlarmStatusSettings$v1({
            alarmIds$: this.alarmIds$,
            showBorder: this.showBorder,
            showBorderShadow: this.showBorderShadow
        });

        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmStatus,
            capabilityId, '#' + this.componentId, settings);
    }
}
