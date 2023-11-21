import { Output, EventEmitter, Directive } from '@angular/core';

/**
 * If a component shows any data that can be redacted then
 * this class should be extended to insure parent
 * components can know about the redacted properties.
 */
@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class Redactable$v1 {
    /**
     * Emits a list of translation token of the names
     * of properties that have been redacted inside this component.
     * This output should emit when the component knows about data that is
     * redacted.
     */
    @Output() redacted: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * Should emit true if the whole component is redacted.
     */
    @Output() isRedacted = new EventEmitter<boolean>();
}

