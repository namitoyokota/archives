import { DashboardService } from 'shared-from-dcdev/dc-admin/modules/dashboard/services/dashboard-service';
import { AppSettingsService } from 'shared-from-dcdev/shared/services/appSettingsService';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { inject, containerless } from 'aurelia-framework';
import { EventNames } from '../../../shared/event-names';
import type { IAppSettingsService } from '../../../shared/interfaces/IAppSettingsService';
import type { IDashboardInterface } from '../../modules/dashboard/interfaces/dashboard-interface';
import { ButtonInfo } from '../../modules/dashboard/models/models';


@containerless()
export class DcAdminNavigation {
    favoritedNavigationButtons: ButtonInfo[];
    mainNavigationButtons: ButtonInfo[];

    onDCAdminFavoriteChangedSubscriber: Subscription | undefined;

    adminHomePageUrl: string;

    constructor(
        @inject(AppSettingsService) private envService: IAppSettingsService,
        @inject(DashboardService) private dashboardService: IDashboardInterface,
        @inject(EventAggregator) private eventAggregator: EventAggregator
    )
    {
        this.dashboardService.getButtons().then(navigationButtons => {
            this.favoritedNavigationButtons = navigationButtons.filter(b => b.isFavorited).sort((a, b) => (a.label > b.label) ? 1 : -1);
            this.mainNavigationButtons = navigationButtons.filter(b => !b.isFavorited).sort((a, b) => (a.label > b.label) ? 1 : -1);
        });

        this.envService.getAppSettings().then(appSettings => {
            if (!appSettings.appUrl.endsWith('/')) { appSettings.appUrl += '/'; }
            if (!appSettings.rsdUrl.endsWith('/')) { appSettings.rsdUrl += '/'; }

            this.adminHomePageUrl = `${appSettings.appUrl}Account/RedirectToDefault`;
        });
    }

    attached() {
        this.onDCAdminFavoriteChangedSubscriber = this.eventAggregator.subscribe(EventNames.Navigation.ON_DC_ADMIN_FAVORITE_CHANGED, (buttonInfo: ButtonInfo) => {
            if (buttonInfo.isFavorited) {
                this.favoritedNavigationButtons.push(buttonInfo);
                this.favoritedNavigationButtons.sort((a, b) => (a.label > b.label) ? 1 : -1);

                this.mainNavigationButtons.splice(this.mainNavigationButtons.findIndex(e => e.label == buttonInfo.label), 1);
            }
            else {
                this.mainNavigationButtons.push(buttonInfo);
                this.mainNavigationButtons.sort((a, b) => (a.label > b.label) ? 1 : -1);

                this.favoritedNavigationButtons.splice(this.favoritedNavigationButtons.findIndex(e => e.label == buttonInfo.label), 1);
            }
        });
    }

    detached() {
        if (this.onDCAdminFavoriteChangedSubscriber != undefined) {
            this.onDCAdminFavoriteChangedSubscriber.dispose();
        }
    }
}