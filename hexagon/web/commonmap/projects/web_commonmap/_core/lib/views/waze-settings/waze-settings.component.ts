import { Component, Inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ViewEditorSettings, LayoutManagerEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { ViewSettings$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { WazeSettingsTranslationTokens } from './waze-settings.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface WazeSettings$v1 extends ViewSettings$v1 {
    wazeUrl: string;
    zoom: number;
    latitude: number;
    longitude: number;
    enablePin: boolean;
}

@Component({
    templateUrl: './waze-settings.component.html',
    styleUrls: ['./waze-settings.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WazeSettingsInjectableComponent$v1 extends LayoutManagerEditorSettings<WazeSettings$v1> implements OnInit, OnDestroy {

    public wazeUrlIsValid: boolean = null;
    public zoomIsValid: boolean = null;
    public latIsValid: boolean = null;
    public lonIsValid: boolean = null;

    /**  Expose translation tokens to html template */
    tokens: typeof WazeSettingsTranslationTokens = WazeSettingsTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(@Inject(Common.LAYOUT_MANAGER_SETTINGS) public editorSettings: ViewEditorSettings<WazeSettings$v1>,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        public cdr: ChangeDetectorRef) {

        super(editorSettings);
        this.initLocalization();
    }

    /** On init life cycle hook */
    ngOnInit(): void {
        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private initLocalization() {
        this.localizationSrv.localizeGroup(Common.TranslationGroup.waze);
    }

    validateHttps() {
        if (this.settings.wazeUrl.trim().toLowerCase().substr(0, 5) === 'https') {
            this.wazeUrlIsValid = true;
            this.emitUpdate();
        } else {
            this.wazeUrlIsValid = false;
        }
    }

    validateNumber(num: any) {
        if (!isNaN(num) && !isNaN(parseFloat(num))) {
            return true;
        }

        return false;
    }

    validateZoom(zoom: any) {
        const temp = parseInt(zoom, 10);
        if (!isNaN(zoom) && !isNaN(temp)) {
            if (temp > 2 && temp < 18) {
                this.zoomIsValid = true;

            } else {
                this.zoomIsValid = false;
            }

        } else {
            this.zoomIsValid = false;
        }
    }

    replaceParameter(paramName: string) {
        let param, value: any;
        switch (paramName) {
            case 'zoom':
                param = 'zoom=';
                value = this.settings.zoom;
                this.validateZoom(value);
                break;
            case 'lat':
                param = 'lat=';
                value = this.settings.latitude;
                this.latIsValid = this.validateNumber(this.settings.latitude);
                break;
            case 'lon':
                param = 'lon=';
                value = this.settings.longitude;
                this.lonIsValid = this.validateNumber(this.settings.longitude);
                break;
            case 'pin':
                param = 'pin=';
                value = Number(this.settings.enablePin);
                break;
        }

        const url = this.settings.wazeUrl;
        let i;
        let modifiedUrl;

        if (url) {
            i = url.indexOf(param);
            const startOfParam = i + param.length;
            const endOfParam = url.indexOf('&', startOfParam);

            if (i === -1) {
                if (this.numberOfParameters() < 1) {
                    modifiedUrl = 'https://embed.waze.com/iframe?' + param + value;
                } else {
                    modifiedUrl = url + '&' + param + value;
                }
            } else {
                if (endOfParam === -1) {
                    modifiedUrl = url.substring(0, startOfParam) + value;
                } else {
                    modifiedUrl = url.substring(0, startOfParam) + value + url.slice(endOfParam);
                }
            }
        } else {
            modifiedUrl = 'https://embed.waze.com/iframe?' + param + value;
        }

        this.settings.wazeUrl = modifiedUrl;
        this.validateHttps();
    }

    numberOfParameters() {
        const url = this.settings.wazeUrl;
        const zoom = url.indexOf('zoom=') !== -1 ? 1 : 0;
        const lat = url.indexOf('lat=') !== -1 ? 1 : 0;
        const lon = url.indexOf('lon=') !== -1 ? 1 : 0;
        const pin = url.indexOf('pin=') !== -1 ? 1 : 0;
        const desc = url.indexOf('desc=') !== -1 ? 1 : 0;

        return zoom + lat + lon + pin + desc;
    }

    parseUrl() {
        const regex = /[?&]([^=#]+)=([^&#]*)/g;
        let url = this.settings.wazeUrl;
        let match;
        const params = {
            zoom: undefined,
            lat: undefined,
            lon: undefined,
            pin: undefined,
            desc: undefined
        };

        if (url === '') {
            this.settings.zoom = undefined;
            this.settings.latitude = undefined;
            this.settings.longitude = undefined;
            this.settings.enablePin = undefined;
            this.latIsValid = false;
            this.lonIsValid = false;
            this.validateZoom(this.settings.zoom);
            this.validateHttps();
        } else {
            if (url && url.indexOf('<iframe') !== -1) {
                const urlStart = url.indexOf('http');
                const urlEnd = url.indexOf('"', urlStart);
                url = url.substring(urlStart, urlEnd);
                this.settings.wazeUrl = url;
            }

            while (match = regex.exec(url)) {
                params[match[1]] = match[2];
            }

            if (params.zoom) {
                this.validateZoom(params.zoom);
                if (this.zoomIsValid) {
                    this.settings.zoom = parseInt(params.zoom, 10);
                }
            }

            if (params.lat) {
                this.latIsValid = this.validateNumber(params.lat);
                if (this.latIsValid) {
                    this.settings.latitude = parseFloat(params.lat);
                }
            }

            if (params.lon) {
                this.lonIsValid = this.validateNumber(params.lon);
                if (this.lonIsValid) {
                    this.settings.longitude = parseFloat(params.lon);
                }
            }

            if (params.pin) {
                this.settings.enablePin = Boolean(Number(params.pin));
            } else {
                this.settings.enablePin = false;
            }

            this.validateHttps();
        }
    }
}
