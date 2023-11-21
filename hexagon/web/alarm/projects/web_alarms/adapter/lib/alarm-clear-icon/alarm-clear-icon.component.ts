import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { AlarmClearIconSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject } from 'rxjs';

import { AlarmsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-alarms-clear-icon-v1',
    template: ``,
    styles: [
        `:host {
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
        }`
    ]
})
export class AlarmClearIconComponent implements AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Store of alarm ids */
    private alarmIds$ = new BehaviorSubject<string[]>(null);

    private selected$ = new BehaviorSubject<boolean>(false);

    /** Whether or not to show associated device info. */
    @Input() showDeviceInfo = false;

    /** Whether or not to show the selected icon. */
    @Input('selected')
    set setSelected(selected: boolean) {
        this.selected$.next(selected);
    }

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

        const settings = new AlarmClearIconSettings$v1({
            alarmIds$: this.alarmIds$.asObservable(),
            selected$: this.selected$.asObservable(),
            showDeviceInfo: this.showDeviceInfo
        });

        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmClearIcon,
            capabilityId, '#' + this.componentId, settings);
    }
}
