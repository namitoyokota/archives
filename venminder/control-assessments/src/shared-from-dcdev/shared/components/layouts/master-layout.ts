import { AuthService } from 'shared-from-dcdev/shared/services/authService';
import { UserService } from 'shared-from-dcdev/shared/services/userService';
import { AppSettingsService } from 'shared-from-dcdev/shared/services/appSettingsService';
import { bindable, inject, Aurelia, PLATFORM, computedFrom } from 'aurelia-framework';
import { LoggedInUser } from '../../../shared/models/userInfo';
import type { IAppSettingsService } from '../../interfaces/IAppSettingsService';
import { LayoutInformation, PublicAppSettings } from '../../models/app-settings';
import type { INavTemplate } from '../../../shared/interfaces/INavTemplate';
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';
import { hasValue } from '../../utilities/globals';
import { EventNames } from '../../event-names';
import { NavigationInstruction, RouterEvent } from 'aurelia-router';
import { routeHasLayoutViewModel } from '../../services/appLayoutService';
import type { IUserService } from '../../interfaces/IUserService';
import { Feature } from '../../enums/feature-types';
import type { IAuthService } from '../../interfaces/IAuthService';


export class MasterLayout {
    @bindable user: LoggedInUser = null;
    
    layoutInfo: LayoutInformation;
    appSettings: PublicAppSettings;

    argosUrl = '';
    
    venminderBody: HTMLDivElement;
    argosBody: HTMLDivElement;
    helpSectionBrand: HTMLDivElement;
    argosBodyForm: HTMLFormElement;
    argosBodyFrame: HTMLIFrameElement;
    onShowArgos: Subscription = null;
    $argosBodyFrame: any;
    argosIsLoaded = false;
    resizeFuncPointer: any;
    buEnabled: boolean = false;
    buSubscription: Subscription = null;

    redirectToDefaultUrl = '';

    onMainLayoutTemplateReadySubscriber: Subscription = null;
    onRouteProcessingSubscriber: Subscription = null;
    
    navTemplate: INavTemplate = {};
    private isArgosTargetFrame: boolean = true;

    @computedFrom('appSettings', 'layoutInfo')
    get canLoadArgos(): boolean {
        return this.appSettings != null && this.layoutInfo != null;
    }

    constructor(
        @inject(EventAggregator) private eventAggregator: EventAggregator,
        @inject(AppSettingsService) private envService: IAppSettingsService,
        @inject(Aurelia) private au: Aurelia,
        @inject(UserService) private userService: IUserService,
        @inject(AuthService) private auth: IAuthService
    ) { };

    created() {
        this.getFeatureSettings();
        this.getAppSettings();

        if (this.onRouteProcessingSubscriber == null) {
            this.onRouteProcessingSubscriber = this.eventAggregator.subscribe(RouterEvent.Processing, (router) => {
                const instruction: NavigationInstruction = router.instruction;

                //-- Check to see if we need to switch to a non master layout view.
                //if (routeHasLayoutViewModel(instruction.fragment)) {
                //    this.au.setRoot(PLATFORM.moduleName('app-layout', 'global'));
                //}
            });
        }

        if (this.onMainLayoutTemplateReadySubscriber == null) {
            this.onMainLayoutTemplateReadySubscriber = this.eventAggregator.subscribe(EventNames.Navigation.ON_MAIN_LAYOUT_TEMPLATE_READY, (navTemplate: INavTemplate) => {
                this.navTemplate = navTemplate;

                if (this.navTemplate.canShowArgos) {
                    if (this.onShowArgos == null) {
                        this.onShowArgos = this.eventAggregator.subscribe(EventNames.Navigation.SHOW_ARGOS, () => this.loadArgos(0));
                    }

                    this.envService.getLayoutInformation().then(layoutInfo => {
                        this.layoutInfo = layoutInfo;

                        if (this.navTemplate.buSubscriptions) {
                            this.buEnabled = this.layoutInfo.hasBusinessUnits && this.layoutInfo.businessUnitsEnabled;

                            if (this.buSubscription == null) {
                                this.buSubscription = this.eventAggregator.subscribe(EventNames.SystemSettings.BUSINESS_UNIT_SETTINGS_SAVED,
                                    (isEnabled: boolean) => {
                                        this.buEnabled = isEnabled;
                                    });
                            }
                        }
                    });
                }
            });
        }
    }

    private async getAppSettings() {
        let appSettings = await this.envService.getAppSettings();

        if (hasValue(appSettings.argosRootUrl)) {
            if (!appSettings.argosRootUrl.endsWith('/'))
                appSettings.argosRootUrl += '/';
            this.argosUrl = `${appSettings.argosRootUrl}argosrisk/index.php/api/sso`;
        }

        if (!appSettings.appUrl.endsWith('/'))
            appSettings.appUrl += '/';
        if (!appSettings.rsdUrl.endsWith('/'))
            appSettings.rsdUrl += '/';

        this.redirectToDefaultUrl = `${appSettings.appUrl}Account/RedirectToDefault`;
        this.appSettings = appSettings;
    }

    private async getFeatureSettings() {
        const isLoggedIn = await this.auth.isLoggedIn();
        if (!isLoggedIn) {
            return;
        }
        const featureAccessResponse = await this.userService.areFeaturesOnForUser([Feature.loadVendorMonitoringInNewTab]);
        this.isArgosTargetFrame = !featureAccessResponse.get(Feature.loadVendorMonitoringInNewTab);
    }

    detached() {
        if (this.onMainLayoutTemplateReadySubscriber != null) {
            this.onMainLayoutTemplateReadySubscriber.dispose();
            this.onMainLayoutTemplateReadySubscriber = null;
        }

        if (this.onRouteProcessingSubscriber != null) {
            this.onRouteProcessingSubscriber.dispose();
            this.onRouteProcessingSubscriber = null;
        }

        if (this.onShowArgos != null) {
            this.onShowArgos.dispose();
            this.onShowArgos = null;
        }

        if (this.buSubscription != null) {
            this.buSubscription.dispose();
            this.buSubscription = null;
        }
    }

    resizeArgos() {
        let $helpSectionBrand = $(this.helpSectionBrand);
        this.$argosBodyFrame = $(this.argosBodyFrame);
        let position = this.$argosBodyFrame.position();
        let positionTop = position.top > 0 ? position.top : ($helpSectionBrand.position().top + $helpSectionBrand.height() + 8)
        let frameHeight = window.innerHeight - positionTop;
        this.$argosBodyFrame.height(frameHeight);
    };

    showArgos() {
        if (!this.isArgosTargetFrame) {
            return;
        }

        this.argosIsLoaded = true;
        let $venminderBody = $(this.venminderBody);
        let $argosBody = $(this.argosBody);
        let $helpSectionBrand = $(this.helpSectionBrand);
        this.resizeFuncPointer = this.resizeArgos.bind(this);
        $(window).on('resize', this.resizeFuncPointer);
        this.resizeArgos();

        $venminderBody.fadeOut('fast', () => {
            $helpSectionBrand.fadeIn('fast');
            $argosBody.fadeIn('fast', () => { this.resizeArgos(); });
        });
    };

    showVenminder() {
        let $venminderBody = $(this.venminderBody);
        let $argosBody = $(this.argosBody);
        let $helpSectionBrand = $(this.helpSectionBrand);
        $(window).off('resize', this.resizeFuncPointer);

        $helpSectionBrand.fadeOut('fast');
        $argosBody.fadeOut('fast', () => {
            $venminderBody.fadeIn('fast');
            this.argosBodyFrame.src = 'about:blank';
            this.argosIsLoaded = false;
        });
    };

    loadArgos(retryCount: number) {
        retryCount = retryCount || 0;
        if (this.argosIsLoaded === false) {
            this.$argosBodyFrame = $(this.argosBodyFrame);
            let $argosBodyForm = $(this.argosBodyForm);
            if ($argosBodyForm.length > 0) {
                (<HTMLFormElement>$argosBodyForm[0]).submit();
                this.showArgos();
            }
            else if (retryCount < 10) {
                window.setTimeout(() => this.loadArgos(++retryCount), 100);
            }
        }
    };
}