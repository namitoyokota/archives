import { Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { WizardService } from '../wizard.service';
import { WizardStepType } from './wizard-step-type';

@Component({
    selector: 'hxgn-commontenant-wizard-step-layout-content',
    template: '<ng-content></ng-content>'
})
export class WizardStepLayoutContentComponent { }

@Component({
    selector: 'hxgn-commontenant-wizard-step-layout-description',
    template: '<ng-content></ng-content>'
})
export class WizardStepLayoutDescriptionComponent { }

@Component({
    selector: 'hxgn-commontenant-wizard-step-layout',
    templateUrl: 'wizard-step-layout.component.html',
    styleUrls: ['wizard-step-layout.component.scss']
})
export class WizardStepLayoutComponent {

    /** What type of layout should the step have */
    @Input('layoutType')
    set setLayoutType(type: WizardStepType) {
        this.layoutType = type;

        this.isSimple = type === WizardStepType.simple;
    }

    /** What type of layout should the step have */
    layoutType = WizardStepType.split;

    /** The title for the step */
    @Input() stepTitle: string;

    /** Reference to action pane */
    @Input() actionPaneRef: TemplateRef<any>;

    /** Reference to description header pane */
    @Input() descriptionHeaderPaneRef: TemplateRef<any>;

    /** Flag that is true if the layout is simple */
    @HostBinding('class.simple') isSimple = false;

    /** Expose WizardStepType to HTML */
    wizardStepType: typeof WizardStepType = WizardStepType;

    constructor(private wizardSrv: WizardService) {
    }

    /**
     * Close the wizard
     */
    close(): void {
        this.wizardSrv.closeWizard();
    }
}
