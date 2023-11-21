import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { capabilityId, InjectableComponentNames } from '@galileo/web_commonnotifications/_common';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CommonnotificationsAdapterService$v1 } from '../adapter.v1.service';
import { NotificationBtnTranslatedTokens, NotificationBtnTranslationTokens } from './notification-btn.translation';

@Component({
    selector: 'hxgn-commonnotifications-btn-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class NotificationBtnComponent implements AfterViewInit, OnDestroy {

    /** Id of the context for the component. */
    @Input('contextId')
    set setContextId(id: string) {
        this.contextId.next(id);
    }

    /** Id of the context for the component. */
    private contextId = new BehaviorSubject<string>(null);

    /** Stream for context id */
    private contextId$ = this.contextId.pipe(
        filter(data => !!data)
    );

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** Set the title attribute that will be used to inject a component */
    @HostBinding('attr.title') title = '';

    /** Translated tokens */
    tTokens: NotificationBtnTranslatedTokens = {} as NotificationBtnTranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private layoutAdapter: LayoutCompilerAdapterService,
        private adapter: CommonnotificationsAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1) { }

    async ngAfterViewInit(): Promise<void> {
        await this.adapter.loadCore();
        await this.injectComponentAsync();
        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
            InjectableComponentNames.notificationBtn,
            capabilityId, '#' + this.componentId, this.contextId$);
    }

    /** Set up routine for localization */
    private async initLocalization(): Promise<void> {
        const tokens: string[] = Object.keys(NotificationBtnTranslationTokens).map(k => NotificationBtnTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.notifications = translatedTokens[NotificationBtnTranslationTokens.notifications];
        this.title = this.tTokens.notifications;
    }
}
