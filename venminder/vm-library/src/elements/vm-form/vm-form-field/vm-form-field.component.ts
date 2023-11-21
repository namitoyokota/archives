import { bindable, customElement } from 'aurelia-framework';
import { BehaviorSubject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { BINDING_MODES } from './../../../constants/binding-modes';

const elementSelectors = ['input', 'label', 'button', 'textarea', 'select'];

@customElement('vm-form-field')
export class VMFormFieldComponent {
    /** Property name on the vm-form model this field relates to */
    @bindable() name: string;

    /** Bridges manually added css classes from template author */
    @bindable(BINDING_MODES.TWO_WAY) class: string;

    /** List of errors from validation controller; set by parent vm-form */
    errors: string[];

    /** Class to apply on error; set by parent vm-form */
    errorClass = '';

    /** Template ref */
    field: HTMLElement;

    /** Subject and subscription to debounce error appearance */
    private errors$ = new BehaviorSubject<{ errors: string[] }>({ errors: [] });
    private errorSubscription$ = null;

    attached(): void {
        this.errorSubscription$ = this.errors$
            .pipe(
                debounce(({ errors }) => {
                    /**
                     * When there are validation errors, create a grace period of 350ms before
                     * enabling error state.
                     */
                    return timer(errors.length ? 350 : 0);
                }),
            )
            .subscribe(({ errors }) => {
                this.errors = errors;
                if (errors.length) {
                    this.addClasses();
                } else {
                    this.removeClasses();
                }
            });
    }

    clear(): void {
        this.setErrors([]);
    }

    detached(): void {
        this.errorSubscription$?.unsubscribe();
    }

    private setErrors = (errors: string[]): void => {
        this.errors$.next({ errors });
    };

    /** class.bind is anti-pattern, so these funcs use classList to safely add and remove */
    private addClasses(): void {
        this.field.querySelectorAll(elementSelectors.join(', ')).forEach((element) => {
            element?.classList.add(this.errorClass);
        });
    }

    private removeClasses(): void {
        this.field.querySelectorAll(elementSelectors.join(', ')).forEach((element) => {
            element?.classList.remove(this.errorClass);
        });
    }
}
