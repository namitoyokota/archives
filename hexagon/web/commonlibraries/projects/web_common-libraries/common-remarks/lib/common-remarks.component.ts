import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Remark$v1, PostStyle$v1 } from '@galileo/web_common-libraries';
import { UserInfo$v1 } from '@galileo/web_commonidentity/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { BehaviorSubject } from 'rxjs';

import { TranslatedTokens, TranslationTokens } from './common-remarks.translation';

@Component({
    selector: 'hxgn-common-remarks',
    templateUrl: 'common-remarks.component.html',
    styleUrls: ['common-remarks.component.scss'],
    animations: [
        trigger('expansionState', [
            state(':enter', style({ height: '*' })),
            state(':leave', style({ height: '0' })),
            state('void', style({ height: '0' })),
            transition('* => *', animate('300ms ease-in-out'))
        ])
    ]
})
export class CommonRemarksComponent implements OnInit {

    /** Remarks */
    @Input('remarks')
    set setRemarks(remarks: Remark$v1[]) {
        this.remarks = remarks;
        this.sortRemarks();
    }

    /** Current logged in user */
    @Input() user: UserInfo$v1;

    /** Relays back updated remark list */
    @Output() listUpdated: EventEmitter<Remark$v1[]> = new EventEmitter<Remark$v1[]>();

    /** State of the remark style button and expansion pane */
    private paneState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** List of remarks to display */
    remarks: Remark$v1[];

    /** Text typed inside of the input field */
    message = '';

    /** Currently selected remark priority */
    priority = PostStyle$v1.normal;

    /** Observable for remark style state */
    paneState$ = this.paneState.asObservable();

    /** Letter used for the styling preview */
    readonly previewLetter = 'A';

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.initLocalization();
    }

    /** Open or close filter pane */
    triggerPane() {
        this.paneState.next(!this.paneState.getValue());
    }

    /** Updates selected priority */
    changePriority(priority: PostStyle$v1) {
        this.priority = priority;
    }

    /** Adds new comment to the list */
    sendMessage() {
        const newRemark = {
            authorFirstName: this.user?.givenName,
            authorMiddleName: '',
            authorLastName: this.user?.familyName,
            text: this.message,
            createdTime: new Date(),
            priority: this.priority
        }

        this.remarks = [newRemark, ...this.remarks];
        this.sortRemarks();
        this.listUpdated.emit(this.remarks);
        this.message = '';
    }

    /** Sort list of remarks by created time */
    sortRemarks() {
        this.remarks.sort((a, b) => a.createdTime < b.createdTime ? 1 : -1)
    }

    /** Set up routine for localization */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.typeCommentHere = translatedTokens[TranslationTokens.typeCommentHere];
    }
}
