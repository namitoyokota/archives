import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { AuthParamsHxCPTranslationTokens } from './auth-params-hxcp.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-auth-params-hxcp',
    templateUrl: './auth-params-hxcp.component.html',
    styleUrls: ['./auth-params-hxcp.component.scss']
})

export class AuthParamsHxCPComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: Common.MapLayer$v1;
    @Output() authParamChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof AuthParamsHxCPTranslationTokens = AuthParamsHxCPTranslationTokens;

    preFetchTokensList = [
        this.tokens.authClientIdPlaceholder,
        this.tokens.authClientSecretPlaceholder
    ];

    transStrings = {};

    authClientId: Common.MapOptionParam;
    authClientSecret: Common.MapOptionParam;
    authErrorToken: string;

    private destroy$ = new Subject<boolean>();

    private initialized = false;

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }
    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
        
        this.initAuthParams();
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.initAuthParams();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    fireAuthParamChanged(authParam: Common.MapOptionParam, reason) {
        this.authParamChanged.emit({authParam: authParam, reason: reason, needToSave: true});
    }

    initAuthParams() {
        this.authErrorToken = null;
        if (!this.mapLayer.authentication) {
            this.mapLayer.authentication = new Common.MapLayerAuthentication$v1({
                authenticationProvider: Common.MapLayerAuthenticationProvider$v1.HxCP,
            });
            this.authClientId = new Common.MapOptionParam({
                mapOption: new Common.MapLayerOption$v1({
                                name: 'clientId'
                            }),
                isNew: true
            });
            this.authClientSecret = new Common.MapOptionParam({
                mapOption: new Common.MapLayerOption$v1({
                                name: 'clientSecret',
                                type: 'secret'
                            }),
                isNew: true
            });
        } else {
            this.mapLayer.authentication.authenticationProvider = Common.MapLayerAuthenticationProvider$v1.HxCP;
            if (this.mapLayer.authentication?.options) {
                let option = this.mapLayer.authentication.options.find((opt) => opt.name === 'clientId');
                if (option) {
                    this.authClientId = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1(option)
                    });
                } else {
                    this.authClientId = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1({
                                        name: 'clientId'
                                    }),
                        isNew: true
                    });
                }

                option = this.mapLayer.authentication.options.find((opt) => opt.name === 'clientSecret');
                if (option) {
                    this.authClientSecret = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1(option)
                    });
                } else {
                    this.authClientSecret = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1({
                                        name: 'clientSecret',
                                        type: 'secret'
                                    }),
                        isNew: true
                    });
                }
            }

        }
    }

    validateAuthClientId(event: any) {
        const value = event.target.value.trim();
        if (!value) {
            this.authClientId.isError = true;
            this.authErrorToken = this.tokens.errorAuthClientIdEmpty;
            this.setIsValid(false);
        } else {
            this.authClientId.isError = false;
            if (this.authClientSecret.isError) {
                this.authErrorToken = this.tokens.errorAuthClientSecretEmpty
            } else {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }
    }

    setAuthClientId(event: any) {
        this.authClientId.mapOption.value = event.target.value.trim();
        this.authClientId.isError = false;
        const option = this.mapLayer.upsertAuthOption(this.authClientId.mapOption.name,
            this.authClientId.mapOption.value);
        if (!this.authClientId.mapOption.value) {
            this.authClientId.isError = true;
            this.authErrorToken = this.tokens.errorAuthClientIdEmpty;
            this.setIsValid(false);
        } else {
            if (this.authClientSecret.isError) {
                this.authErrorToken = this.tokens.errorAuthClientSecretEmpty
            } else {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }

        this.fireAuthParamChanged(this.authClientId, 'clientId');
    }

    validateAuthClientSecret(event: any) {
        const value = event.target.value.trim();
        if (!value && this.authClientSecret.isNew) {
            this.authClientSecret.isError = true;
            if (!this.authClientId.isError) {
                this.authErrorToken = this.tokens.errorAuthClientSecretEmpty;
            }
            this.setIsValid(false);
        } else {
            this.authClientSecret.isError = false;
            if (!this.authClientId.isError) {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }
    }

    setAuthClientSecret(event: any) {
        this.authClientSecret.mapOption.value = event.target.value.trim();
        this.authClientSecret.isError = false;
        const option = this.mapLayer.upsertAuthOption(this.authClientSecret.mapOption.name,
            this.authClientSecret.mapOption.value, 'secret');
        if (!this.authClientSecret.mapOption.value && this.authClientSecret.isNew) {
            this.authClientSecret.isError = true;
            if (!this.authClientId.isError) {
                this.authErrorToken = this.tokens.errorAuthClientSecretEmpty;
            }
            this.setIsValid(false);
        } else {
            if (!this.authClientId.isError) {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }

        this.fireAuthParamChanged(this.authClientSecret, 'clientSecret');
    }

    validateAuthParams() {
        if (!this.authClientId.mapOption.value || (!this.authClientSecret.mapOption.value && this.authClientSecret.isNew)) {
            return(false);
        }
        return(true);
    }


    setIsValid(valid: boolean) {
        this.isValid.emit(valid);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
