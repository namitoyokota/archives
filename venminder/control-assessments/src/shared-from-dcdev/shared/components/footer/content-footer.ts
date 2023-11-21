import { AppSettingsService } from 'shared-from-dcdev/shared/services/appSettingsService';
import { inject, bindable } from 'aurelia-framework';
import type { IAppSettingsService } from "../../interfaces/IAppSettingsService";
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';
import { EventNames } from '../../event-names';


export class ContentFooter {
    @bindable termsUrl: string = '';
    @bindable hideTermsAndConditions: boolean = false;

    onTopToThePage: Subscription = null;

    private currentyear = (new Date).getFullYear();
    private privacyPolicyUrl: string = 'https://www.venminder.com/privacy-policy';
    
    constructor(
        @inject(EventAggregator) private eventAggreator: EventAggregator,
        @inject(AppSettingsService) private envService: IAppSettingsService
    ) {}

    attached() {
        this.envService.getAppSettings().then((appSettings) => {
            if (!appSettings.appUrl.endsWith('/'))
                appSettings.appUrl += '/';

            this.termsUrl = appSettings.appUrl + this.termsUrl;
        });

        $(document).ready(function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 50) {
                    $('#back-to-top').fadeIn();
                } else {
                    $('#back-to-top').fadeOut();
                }
            });
            // scroll body to 0px on click
            $('#back-to-top').click(function () {
                $('body,html').animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        });
        this.attachSubscriptions();
    }

    detached() {
        this.detachSubscriptions();
    }

    attachSubscriptions() {
        if (this.onTopToThePage == null) {
            this.onTopToThePage = this.eventAggreator.subscribe(EventNames.ContentFooter.BACK_TO_TOP, () => this.scrollToTop());
        }
    }

    detachSubscriptions() {
        if (this.onTopToThePage != null) { this.onTopToThePage.dispose(); this.onTopToThePage = null; }
    }

    scrollToTop() {
        $('body,html').animate({ scrollTop: 0 });
    }
}