import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { AuthParamsHxDRTranslationTokens } from './auth-params-hxdr.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-auth-params-hxdr',
    templateUrl: './auth-params-hxdr.component.html',
    styleUrls: ['./auth-params-hxdr.component.scss']
})

export class AuthParamsHxDRComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: Common.MapLayer$v1;
    @Output() authParamChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof AuthParamsHxDRTranslationTokens = AuthParamsHxDRTranslationTokens;

    preFetchTokensList = [
        this.tokens.authUsernamePlaceholder,
        this.tokens.authPasswordPlaceholder
    ];

    transStrings = {};

    authUsername: Common.MapOptionParam;
    authPassword: Common.MapOptionParam;
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
                authenticationProvider: Common.MapLayerAuthenticationProvider$v1.HxDR,
            });
            this.authUsername = new Common.MapOptionParam({
                mapOption: new Common.MapLayerOption$v1({
                                name: 'username'
                            }),
                isNew: true
            });
            this.authPassword = new Common.MapOptionParam({
                mapOption: new Common.MapLayerOption$v1({
                                name: 'password',
                                type: 'secret'
                            }),
                isNew: true
            });
        } else {
            this.mapLayer.authentication.authenticationProvider = Common.MapLayerAuthenticationProvider$v1.HxDR;
            if (this.mapLayer.authentication?.options) {
                let option = this.mapLayer.authentication.options.find((opt) => opt.name === 'username');
                if (option) {
                    this.authUsername = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1(option)
                    });
                } else {
                    this.authUsername = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1({
                                        name: 'username'
                                    }),
                        isNew: true
                    });
                }

                option = this.mapLayer.authentication.options.find((opt) => opt.name === 'password');
                if (option) {
                    this.authPassword = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1(option)
                    });
                } else {
                    this.authPassword = new Common.MapOptionParam({
                        mapOption: new Common.MapLayerOption$v1({
                                        name: 'password',
                                        type: 'secret'
                                    }),
                        isNew: true
                    });
                }
            }

        }
    }

    validateAuthUsername(event: any) {
        const value = event.target.value.trim();
        if (!value) {
            this.authUsername.isError = true;
            this.authErrorToken = this.tokens.errorAuthUsernameEmpty;
            this.setIsValid(false);
        } else {
            this.authUsername.isError = false;
            if (this.authPassword.isError) {
                this.authErrorToken = this.tokens.errorAuthPasswordEmpty;
            } else {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }
    }

    setAuthUsername(event: any) {
        this.authUsername.mapOption.value = event.target.value.trim();
        this.authUsername.isError = false;
        const option = this.mapLayer.upsertAuthOption(this.authUsername.mapOption.name,
            this.authUsername.mapOption.value);
        if (!this.authUsername.mapOption.value) {
            this.authUsername.isError = true;
            this.authErrorToken = this.tokens.errorAuthUsernameEmpty;
            this.setIsValid(false);
        } else {
            if (this.authPassword.isError) {
                this.authErrorToken = this.tokens.errorAuthPasswordEmpty;
            } else {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }

        this.fireAuthParamChanged(this.authUsername, 'username');
    }

    validateAuthPassword(event: any) {
        const value = event.target.value.trim();
        if (!value && this.authPassword.isNew) {
            this.authPassword.isError = true;
            if (!this.authUsername.isError) {
                this.authErrorToken = this.tokens.errorAuthPasswordEmpty;
            }
            this.setIsValid(false);
        } else {
            this.authPassword.isError = false;
            if (!this.authUsername.isError) {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }
    }

    setAuthPassword(event: any) {
        this.authPassword.mapOption.value = event.target.value.trim();
        this.authPassword.isError = false;
        const option = this.mapLayer.upsertAuthOption(this.authPassword.mapOption.name,
            this.authPassword.mapOption.value, 'secret');
        if (!this.authPassword.mapOption.value && this.authPassword.isNew) {
            this.authPassword.isError = true;
            if (!this.authUsername.isError) {
                this.authErrorToken = this.tokens.errorAuthPasswordEmpty;
            }
            this.setIsValid(false);
        } else {
            if (!this.authUsername.isError) {
                this.authErrorToken = null;
            }
            this.setIsValid(this.validateAuthParams());
        }

        this.fireAuthParamChanged(this.authPassword, 'password');
    }

    validateAuthParams() {
        if (!this.authUsername.mapOption.value || (!this.authPassword.mapOption.value && this.authPassword.isNew)) {
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
