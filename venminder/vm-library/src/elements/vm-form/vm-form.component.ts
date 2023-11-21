import type { Subscription as eaSubscription } from 'aurelia-event-aggregator';
import { bindable, BindingEngine, children, customElement, inject } from 'aurelia-framework';
import type { ValidateEvent, ValidationController } from 'aurelia-validation';
import { validateTrigger, ValidationControllerFactory } from 'aurelia-validation';
import { get, set } from 'lodash';
import type { Subscription as rxjsSubscription } from 'rxjs';
import { from, Subject } from 'rxjs';
import { mergeMap, tap, throttleTime } from 'rxjs/operators';
import { BINDING_MODES } from '../../constants/binding-modes';

const VALIDATION_PROPERTY = '$valid';

@customElement('vm-form')
export class VMFormComponent {
    /** The form data to which vm-form-fields are bound; used here with rules bindable
     *  for validation handling */
    @bindable(BINDING_MODES.TWO_WAY) model;

    /** ValidationRules the controller applies to this.model */
    @bindable(BINDING_MODES.ONE_TIME) rules;

    /** CSS class to apply to error fields  */
    @bindable(BINDING_MODES.ONE_TIME) errorClass = 'has-error';

    /** Optional callback bindable */
    @bindable(BINDING_MODES.TO_VIEW) get: ({ controller, valid }: { controller: ValidationController; valid: boolean }) => unknown;

    /** Array of child vm-form-field elements */
    @children('vm-form-field') fields = [];

    private change: Subject<unknown> = null;
    private changeSubscription: rxjsSubscription = null;
    private controller: ValidationController = null;
    private dirty = [];
    private observers = [];
    private validateSubscription: eaSubscription = null;
    private watchChanges = true;

    constructor(
        @inject(BindingEngine) private bindingEngine: BindingEngine,
        @inject(ValidationControllerFactory) factory: ValidationControllerFactory,
    ) {
        this.controller = factory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.change = new Subject();
    }

    attached(): void {
        set(this.model, VALIDATION_PROPERTY, false);

        this.fields.forEach((field) => {
            const fieldName = field.name;
            const fieldModel = get(this.model, fieldName);
            if (fieldName) {
                if (fieldModel && Array.isArray(fieldModel)) {
                    this.observers.push(
                        this.bindingEngine.collectionObserver(fieldModel).subscribe(() => {
                            return this.change.next({
                                newVal: fieldModel,
                                oldVal: null,
                                fieldName: fieldName,
                            });
                        }),
                    );
                }

                this.observers.push(
                    this.bindingEngine.propertyObserver(this.model, fieldName).subscribe((newVal, oldVal) => {
                        return this.change.next({ newVal, oldVal, fieldName });
                    }),
                );
            }

            field.errorClass = this.errorClass;
        });
        this.controller.addObject(this.model, this.rules);
        this.validate();

        this.changeSubscription = this.change
            .pipe(
                tap((change: { newVal; oldVal; fieldName }) => {
                    if (!this.dirty.includes(change.fieldName)) {
                        this.dirty.push(change.fieldName);
                    }
                }),
                throttleTime(150, undefined, { leading: true, trailing: true }),
                mergeMap((change: { newVal; oldVal; fieldName }) => {
                    this.update({ value: change.newVal, field: change.fieldName });

                    return from(this.controller.validate());
                }),
            )
            .subscribe((result: { instruction; valid; results }) => {
                if (this.watchChanges) {
                    this.emit(result.valid);
                    this.validate();
                } else {
                    this.watchChanges = true;
                }
            });

        this.validateSubscription = this.controller.subscribe((cb: ValidateEvent) => {
            if (cb.type === 'reset') {
                this.watchChanges = false;
                if (cb.instruction) {
                    Object.keys(cb.instruction).forEach((key) => {
                        if (this.model?.[key]) {
                            this.model[key] = cb.instruction[key];
                        }
                    });
                }

                this.fields.forEach((field) => {
                    field.clear();
                });
                this.dirty = [];
                this.controller.validate();
            }
        });

        this.emit();
    }

    update({ field, value }): void {
        set(this.model, field, value);
    }

    validate(): void {
        this.controller.validate();
        this.fields.forEach((field) => {
            const errors = this.controller?.errors
                .filter((error) => {
                    return error.propertyName === field.name && this.dirty.includes(field.name);
                })
                .map((error) => {
                    return error.message;
                });
            field.setErrors(errors);
        });
    }

    emit(valid = false): void {
        set(this.model, VALIDATION_PROPERTY, valid);
        this?.get?.({
            controller: this.controller,
            valid,
        });
    }

    detached(): void {
        this.observers.forEach((obs) => {
            obs.dispose();
        });
        this.change = null;
        this.changeSubscription.unsubscribe();
        this.changeSubscription = null;
        this.controller = null;
        this.validateSubscription.dispose();
        this.validateSubscription = null;
    }
}
