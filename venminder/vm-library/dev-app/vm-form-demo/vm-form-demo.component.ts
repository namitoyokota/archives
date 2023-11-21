import type { DialogCloseResult } from 'aurelia-dialog';
import { DialogService } from 'aurelia-dialog';
import { inject, PLATFORM } from 'aurelia-framework';
import type { ValidationController } from 'aurelia-validation';
import { ValidationRules } from 'aurelia-validation';

export class VMFormDemoComponent {
    callbackValid = false;
    nestedFormRef;
    example = {
        firstName: '',
        lastName: '',
        email: '',
        hasNickname: false,
        nickname: '',
    };

    rules = ValidationRules.ensure('firstName')
        .required()
        .ensure('lastName')
        .required()
        .ensure('email')
        .email()
        .required()
        .ensure('nickname')
        .required()
        .when((form) => form['hasNickname'] === true).rules;

    nestedExample = {
        topLevelInput: '',
        firstNested: { ...this.example },
        secondNested: { ...this.example },
    };

    nestedRules = ValidationRules.ensure('topLevelInput')
        .required()
        .satisfies((val, obj) => {
            const subFormsToValidate = ['firstNested', 'secondNested'];

            return subFormsToValidate.map((key) => obj[key].$valid).every((isValid) => isValid === true);
        })
        .withMessage('Subforms are not valid').rules;

    constructor(@inject(DialogService) private dialogService: DialogService) {}

    getRules = (): ValidationRules => [...this.rules];

    getFormInfo = (params: { controller: ValidationController; valid: boolean }): void => {
        this.callbackValid = params.valid;
    };

    nestedGet = (): void => {
        this.nestedFormRef.validate();
    };

    openWizard(): void {
        this.dialogService
            .open({
                viewModel: PLATFORM.moduleName('vm-form-demo/form-wizard-example.dialog', 'testbed'),
                model: {
                    test: true,
                },
            })
            .whenClosed((response: DialogCloseResult) => {
                if (!response.wasCancelled) {
                    // eslint-disable-next-line no-console
                    console.log('ok button clicked');
                }
            });
    }
}
