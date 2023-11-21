
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import 'moment/min/locales';

import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

@Pipe({
    name: 'commonTimeSince'
})
export class TimeSincePipe implements PipeTransform {
    constructor(private localizationSrv: CommonlocalizationAdapterService$v1) {}

    /**
     * Appends the proper suffix to a given time
     * This suffix is relative to the current time
     */
    async transform(value: string | Date, update: any = null): Promise<string> {
        const settingObj = {
            relativeTime : {
                future: 'in %s',
                past: '%s',
                s  : 'Now',
                ss : 'Now',
                m:  '%d min',
                mm: '%d mins',
                h:  '%d hr',
                hh: '%d hrs',
                d:  '%d day',
                dd: '%d days',
                M:  '%d mth',
                MM: '%d mths',
                y:  '%d yr',
                yy: '%d yrs'
            }
        };

        moment.updateLocale('en', settingObj);
        const currentLang = await this.localizationSrv.getCurrentLangAsync();
        return moment.utc(value).locale(currentLang).fromNow(false);
    }
}
