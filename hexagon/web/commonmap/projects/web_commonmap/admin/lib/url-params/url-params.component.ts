import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { PanelState } from '@galileo/web_common-libraries';
import { MapOptionParam } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { URLParamsTranslationTokens } from './url-params.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'hxgn-commonmap-admin-url-params',
    templateUrl: './url-params.component.html',
    styleUrls: ['./url-params.component.scss']
})
export class URLParamsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: Common.MapLayer$v1;
    @Input() localAccessOnly = false;
    @Output() urlParamChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof URLParamsTranslationTokens = URLParamsTranslationTokens;

    preFetchTokensList = [
        this.tokens.urlParamNamePlaceholder,
        this.tokens.urlParamValuePlaceholder,
        this.tokens.lockValueTooltip,
        this.tokens.unlockValueTooltip,
        this.tokens.readOnlyParameterTooltip,
        this.tokens.urlParamValuePasswordPlaceholder
    ];

    transStrings = {};

    showUrlParams = PanelState.Collapsed;

    urlParams: MapOptionParam[] = [];
    urlParamsValid = true;

    urlParamErrorMsg: string;

    private initialized = false;
    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }
    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.initURLParams();
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (this.initialized) {
            if (changes.mapLayer) {
                this.urlParamsValid = true;
                this.initURLParams();
            } else if (changes.localAccessOnly) {
                this.initURLParamsForLocalAccessOnlyChange();
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    fireUrlParamChanged(urlParam: MapOptionParam, reason = 'value') {
        const needToSave = urlParam.needToSave || !!this.urlParams.find((param) => param.needToSave === true);
        this.urlParamChanged.emit({urlParam: urlParam, reason: reason, needToSave: needToSave});
    }

    initURLParams() {
        this.urlParams = this.mapLayer.urlParams.map((opt) => {
            const urlParam = new MapOptionParam({
                mapOption: new Common.MapLayerOption$v1(opt),
                valuePlaceholderToken: this.tokens.urlParamValuePlaceholder,
                lockBtnTooltipToken: this.tokens.lockValueTooltip,
                origType: opt.type,
                valueHidden: opt.type === 'secret',
                isNameVisited: true,
                isValueVisited: true,
            });
            return(urlParam);
        });

        const secretOpts = this.mapLayer.secretOptions.map((opt) => {
            const urlParam = new MapOptionParam({
                mapOption:  new Common.MapLayerOption$v1(opt),
                valueHidden: true,
                readOnly: opt.value ? false : true,
                valuePlaceholderToken: this.tokens.urlParamValuePasswordPlaceholder,
                readOnlyTooltipToken: opt.value ? null : this.tokens.readOnlyParameterTooltip,
                lockBtnTooltipToken: this.tokens.unlockValueTooltip,
                origType: 'secret',
                isNameVisited: true,
                isValueVisited: true
            });
            return (urlParam);
        });

        this.urlParams = this.urlParams.concat(secretOpts);

        if (this.urlParams.length === 0) {
            this.showUrlParams = PanelState.Collapsed;
        } else {
            this.showUrlParams = PanelState.Expanded;
            this.urlParams.sort(this.sortByName);
        }
    }

    initURLParamsForLocalAccessOnlyChange() {
        if (this.localAccessOnly) {
            if (this.mapLayer.secretOptions?.length > 0) {
                const options = this.mapLayer.secretOptions.map((opt) => {
                    opt.type = 'secret';
                    return(opt);
                });
                this.mapLayer.urlParams = this.mapLayer.urlParams.concat(options);
                this.mapLayer.secretOptions = [];
            }
        } else {
            if (this.mapLayer.urlParams?.length > 0) {
                const secOptions: Common.MapLayerOption$v1[] = [];
                for (let ii = this.mapLayer.urlParams.length - 1; ii >= 0; ii--) {
                    if (this.mapLayer.urlParams[ii].type === 'secret') {
                        this.mapLayer.urlParams[ii].type = 'string';
                        secOptions.push(this.mapLayer.urlParams[ii]);
                        const urlParam = this.urlParams.find((param) => param.mapOption.name === this.mapLayer.urlParams[ii].name);
                        if (urlParam) {
                            urlParam.origType = this.mapLayer.urlParams[ii].type;
                        }
                        this.mapLayer.urlParams.splice(ii, 1);
                    }
                }
                this.mapLayer.secretOptions = this.mapLayer.secretOptions.concat(secOptions);
            }

        }

        this.initURLParams();
    }

    sortByName(a, b) {
        const name1 = a.mapOption.name ? a.mapOption.name.toUpperCase() : '';
        const name2 = b.mapOption.name ? b.mapOption.name.toUpperCase() : '';
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    addUrlParam() {
        const mapOption = new Common.MapLayerOption$v1({
            type: 'urlParam'
        });
        const urlParam = new MapOptionParam({
            mapOption: mapOption,
            isNew: true,
            valuePlaceholderToken: this.tokens.urlParamValuePlaceholder
        });
        this.urlParams.push(urlParam);
        this.setIsValid(false);
        this.fireUrlParamChanged(urlParam, 'added');
    }

    removeUrlParam(index: number) {
        const urlParam = this.urlParams[index];
        this.urlParams.splice(index, 1);


        let mapOption;
        if (!urlParam.valueHidden) {
            mapOption = this.mapLayer.removeUrlParam(urlParam.mapOption.name);
        } else {
            mapOption = this.mapLayer.removeSecretOption(urlParam.mapOption.name);
            urlParam.needToSave = !urlParam.isNew && urlParam.origType === 'secret';
        }

        this.setIsValid(this.validateUrlParams());

        this.fireUrlParamChanged(urlParam, 'deleted');
    }

    setUrlParamName(urlParam: MapOptionParam, event: any) {
        urlParam.isNameVisited = true;
        const name = event.target.value.trim();
        let mapOption;
        if (!urlParam.valueHidden) {
            mapOption = this.mapLayer.getUrlParam(urlParam.mapOption.name);
            if (mapOption) {
                mapOption.name = name;
            } else {
                this.mapLayer.upsertUrlParam(name, urlParam.mapOption.value);
            }
        } else {
            mapOption = this.mapLayer.getSecretOption(urlParam.mapOption.name);
            if (mapOption) {
                mapOption.name = event.target.value;
            } else {
                this.mapLayer.upsertSecretOption(name, urlParam.mapOption.value);
            }

            urlParam.needToSave = true;
        }
        urlParam.mapOption.name = name;
        urlParam.isError = false;
        if (!urlParam.mapOption.name || !urlParam.mapOption.value) {
            if (urlParam.isNameVisited && urlParam.isValueVisited) {
                urlParam.isError = true;
            }
            this.setIsValid(false);
        } else {
            this.setIsValid(this.validateUrlParams());
        }
        this.fireUrlParamChanged(urlParam, 'name');
    }

    setUrlParamValue(urlParam: MapOptionParam, event: any) {
        urlParam.isValueVisited = true;
        const value = event.target.value.trim();
        event.target.value = value;
        let mapOption;
        if (!urlParam.valueHidden) {
            mapOption = this.mapLayer.getUrlParam(urlParam.mapOption.name);
            if (mapOption) {
                mapOption.value = value;
            } else {
                this.mapLayer.upsertUrlParam(urlParam.mapOption.name, value);
            }
        } else {
            mapOption = this.mapLayer.getSecretOption(urlParam.mapOption.name);
            if (mapOption) {
                mapOption.value = event.target.value;
            } else {
                this.mapLayer.upsertSecretOption(urlParam.mapOption.name, value);
            }
            urlParam.needToSave = true;

        }
        urlParam.mapOption.value = value;
        urlParam.isError = false;
        if (!urlParam.mapOption.name || !urlParam.mapOption.value) {
            if (urlParam.isNameVisited && urlParam.isValueVisited) {
                urlParam.isError = true;
            }
            this.setIsValid(false);
        } else {
            this.setIsValid(this.validateUrlParams());
        }
        this.fireUrlParamChanged(urlParam, 'value');
    }

    validateUrlParams(): boolean {
        for (const param of this.urlParams) {
            if (!param.mapOption.name || (param.isNew && !param.mapOption.value) ||
                (!param.isNew && !param.valueHidden && !param.mapOption.value)) {
                return(false);
            }
        }
        return(true);
    }

    toggleTextDisplay(urlParam: MapOptionParam) {
        urlParam.valueHidden = !urlParam.valueHidden;
        if (urlParam.valueHidden) {
            if (!this.localAccessOnly) {
                const mapOption = this.mapLayer.removeUrlParam(urlParam.mapOption.name);
                if (mapOption) {
                    this.mapLayer.upsertSecretOption(urlParam.mapOption.name, urlParam.mapOption.value, urlParam.mapOption.type);
                }
            } else {
                this.mapLayer.upsertUrlParam(urlParam.mapOption.name, urlParam.mapOption.value, 'secret');
                urlParam.mapOption.type = 'secret';
            }
            urlParam.valuePlaceholderToken = this.tokens.urlParamValuePasswordPlaceholder;
            urlParam.lockBtnTooltipToken = this.tokens.unlockValueTooltip;
            if (urlParam.isNew && !urlParam.mapOption.value) {
                urlParam.isError = true;
                this.urlParamErrorMsg = this.tokens.urlParamError;
                this.setIsValid(false);
            } else if (!urlParam.isNew) {
                urlParam.isError = false;
                this.urlParamErrorMsg = null;
                this.setIsValid(this.validateUrlParams());
            }

            // Check to see if we have to save.  Only if this was originally not a secret option
            if (urlParam.origType) {
                if (urlParam.origType === 'urlParam') {
                    urlParam.needToSave = true;
                } else if (!urlParam.mapOption.value) {
                    urlParam.needToSave = false;  // Set it back to false if it was a secret option and we have not modified the value
                }
            } else {
                urlParam.needToSave = true;
            }
        } else {
            if (!this.localAccessOnly) {
                const mapOption = this.mapLayer.removeSecretOption(urlParam.mapOption.name);
                if (mapOption) {
                    this.mapLayer.upsertUrlParam(urlParam.mapOption.name, urlParam.mapOption.value, urlParam.mapOption.type);
                }
            } else {
                this.mapLayer.upsertUrlParam(urlParam.mapOption.name, urlParam.mapOption.value, 'urlParam');
                urlParam.mapOption.type = 'urlParam';
            }
            urlParam.valuePlaceholderToken = this.tokens.urlParamValuePlaceholder;
            urlParam.lockBtnTooltipToken = this.tokens.lockValueTooltip;
            if (!urlParam.mapOption.value) {
                urlParam.isError = true;
                this.urlParamErrorMsg = this.tokens.urlParamError;
                this.setIsValid(false);
            } else {
                urlParam.isError = false;
                this.urlParamErrorMsg = null;
                this.setIsValid(this.validateUrlParams());
            }

            // Check to see if we have to save.  Only if this was originally a secret option
            if (!urlParam.isNew && urlParam.origType === 'secret') {
                urlParam.needToSave = true;
            } else {
                urlParam.needToSave = false;
            }
        }
        this.fireUrlParamChanged(urlParam, 'toggle');
    }

    setIsValid(valid: boolean) {
        this.urlParamsValid = valid;
        this.isValid.emit(valid);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
