import { DialogController } from 'aurelia-dialog';
import { inject } from 'aurelia-framework';
import { ValidationRules } from 'aurelia-validation';

const formModel = {
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
};

const wizardStepInitial = {
    name: '',
    visible: false,
    valid: false,
    model: {},
    rules: [],
};

export class FormWizardExampleDialog {
    stepIndex = 0;
    steps = [];
    wizardValid = false;
    rules = ValidationRules.ensure('firstName').required().ensure('lastName').required().ensure('email').email().required().rules;

    constructor(@inject(DialogController) private dialog: DialogController) {}

    activate(): void {
        this.steps = new Array(3).fill(wizardStepInitial).map((step, index: number) => {
            return {
                name: 'Step ' + index,
                visible: index === 0,
                valid: false,
                model: { ...formModel },
                rules: { ...this.rules },
            };
        });
    }

    setValid(index): (params) => void {
        return (params) => {
            this.steps[index].valid = params.valid;
            this.wizardValid = this.steps.every((step) => step.valid);
        };
    }

    select(index): void {
        this.stepIndex = index;
    }

    nextHandler = (): void => {
        const maxIndex = this.steps.length - 1;
        if (this.stepIndex >= maxIndex) {
            this.stepIndex = 0;
        } else {
            this.stepIndex += 1;
        }
    };

    prevHandler = (): void => {
        const minIndex = 0;
        if (this.stepIndex <= minIndex) {
            this.stepIndex = 0;
        } else {
            this.stepIndex -= 1;
        }
    };

    saveHandler = (): void => {
        this.dialog.ok({ model: this.steps.map((step) => step.model) });
    };
}
