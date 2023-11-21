import { Pipe, PipeTransform, OnInit } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Observable } from 'rxjs';

export enum TranslationTokens {
    daysAt = 'commonwebroot-admin.component.daysAt',
    expired = 'commonwebroot-admin.component.expired',
    todayAt = 'commonwebroot-admin.component.todayAt',
    tomorrowAt = 'commonwebroot-admin.component.tomorrowAt'
}

@Pipe({
    name: 'expiration',
    pure: true
})
export class ExpirationPipe implements PipeTransform, OnInit {

    /** Expose translation tokens to html template */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(public localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On initialization function call. */
    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnInit() {
        this.initLocalization();
    }

    /** Gets the translation tokens and then calls the getTime function */
    transform(expiration: Date): Observable<string> {
        return new Observable(observer => {
            const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
            this.localizationSrv.getTranslationAsync(tokens).then(result => {
                if (result[tokens[0]] === tokens[0]) {
                    this.localizationSrv.localizeStringsAsync(tokens).then(() => {
                        this.localizationSrv.getTranslationAsync(tokens).then(translations => {
                            observer.next(this.getTime(expiration, translations));
                        });
                    });
                } else {
                    observer.next(this.getTime(expiration, result));
                }
            });
        });
    }

    /** Translates the date into duration in days/hours/minutes */
    getTime(expiration: Date, translatedTokens: Object) {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const days = (expiration.getTime() - now.getTime()) / oneDay;
        let dateString = '';
        const timeString = expiration.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLocaleLowerCase();

        if (Number.isNaN(days)) {
            return '';
        }

        if (days >= 2) {
            dateString = Math.floor(days) + ` ${translatedTokens[TranslationTokens.daysAt]} ` + timeString;
        } else if (days >= 1) {
            dateString = `${translatedTokens[TranslationTokens.tomorrowAt]} ` + timeString;
        } else if (days >= 0) {
            dateString = `${translatedTokens[TranslationTokens.todayAt]} ` + timeString;
        } else {
            dateString = `${translatedTokens[TranslationTokens.expired]}`;
        }

        return dateString;
    }

    /** Set up routine for localization. */
    private initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        this.localizationSrv.localizeStringsAsync(tokens);
    }
}
