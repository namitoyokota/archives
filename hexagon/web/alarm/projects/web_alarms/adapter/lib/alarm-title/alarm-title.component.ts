import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject } from 'rxjs';

import { AlarmsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-alarms-title-v1',
    template: ``
})
export class AlarmTitleComponent implements AfterViewInit, OnDestroy {

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
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmTitleComponent,
            capabilityId, '#' + this.componentId, this.alarmIds$);
    }
}
