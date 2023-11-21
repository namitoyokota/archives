import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Observable, from } from 'rxjs';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { mergeMap } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'option-pane-btn',
    templateUrl: 'option-pane-btn.component.html',
    styleUrls: ['option-pane-btn.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class OptionPaneBtnComponent implements OnInit {

    /** Context id that is controlling the btn */
    @Input() contextId: string;

    /** State of the button */
    paneState$: Observable<boolean>;

    constructor(private layoutCompiler: LayoutCompilerAdapterService) { }

    /**
     * On init life cycle hook
     */
    ngOnInit() {
        this.paneState$ = from(this.layoutCompiler.getOptionPaneStateAsync(this.contextId)).pipe(
            mergeMap(bus => bus)
        );

    }

    /**
     * Close the option pane
     */
    openPane() {
        this.layoutCompiler.openOptionPane(this.contextId);
    }

    /**
     * Open the option pane
     */
    closePane() {
        this.layoutCompiler.closeOptionPane(this.contextId);
    }
}
