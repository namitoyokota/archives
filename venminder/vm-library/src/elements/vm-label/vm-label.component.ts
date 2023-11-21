import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { BINDING_MODES } from '../../constants/binding-modes';

enum LabelStateClasses {
    Selected = '__selected',
    Disabled = '__disabled',
}

@customElement('vm-label')
export class VMLabelComponent {
    /** Whether or not the checkbox should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isDisabled = false;

    /** Whether or not the checkbox should be disabled. */
    @bindable(BINDING_MODES.TO_VIEW) isSelected = false;

    @computedFrom('isSelected', 'isDisabled')
    get stateClasses(): string {
        const classes = [];
        if (this.isSelected) {
            classes.push(LabelStateClasses.Selected);
        }

        if (this.isDisabled) {
            classes.push(LabelStateClasses.Disabled);
        }

        return classes.join(' ');
    }
}
