import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { AlarmMediaSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_alarms/_common';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Redactable$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlarmsAdapterService$v1 } from '../adapter.v1.service';
import { AlarmMediaTranslationTokens } from './alarm-media.translation';

@Component({
    selector: 'hxgn-alarms-media-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})

export class AlarmMediaComponent extends Redactable$v1 implements OnInit, AfterViewInit, OnDestroy {

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

    private settings: AlarmMediaSettings$v1;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
                private adapter: AlarmsAdapterService$v1) {  super(); }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.settings = new AlarmMediaSettings$v1(this.alarmIds$);

        this.settings.isRedacted$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(isRedacted => {
            if (isRedacted) {
                this.redacted.emit([AlarmMediaTranslationTokens.media]);
            }

            this.isRedacted.emit(isRedacted);
        });
    }

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

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {

        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.alarmMedia,
            capabilityId, '#' + this.componentId, this.settings);
    }
}
