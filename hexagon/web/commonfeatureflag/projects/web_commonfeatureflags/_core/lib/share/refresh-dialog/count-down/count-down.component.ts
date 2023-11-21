import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { CountDownTranslationTokens } from './count-down.translaion';

@Component({
    selector: 'hxgn-commonfeatureflags-count-down',
    templateUrl: 'count-down.component.html'
})

export class CountDownComponent implements OnInit {

    /** How long the count down should run for */
    @Input() time: number; // In seconds

    /** Event when the count down is done */
    @Output() done = new EventEmitter();

    /** How much time is left in the count down */
    timeLeft: number; // In seconds

    /** Expose CountDownTranslationTokens to HTML */
    tokens: typeof CountDownTranslationTokens = CountDownTranslationTokens;

    private timeInterval = interval(1000);

    constructor() { }

    /**
     * On init life cycle hooks
     */
    ngOnInit() {
        this.timeLeft = this.time;
        this.timeInterval.pipe(
            take(this.time - 1)
        ).subscribe({
            next: () => {
                --this.timeLeft;
            },
            complete: () => {
                this.done.emit();
            }
        });
    }
}
