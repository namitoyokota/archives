import type { Rule } from 'aurelia-validation';

export interface VMWizardStep {
    name: string;
    visible: boolean;
    valid: boolean;
    model: any;
    rules: Rule<unknown, any>[][];
}
