import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum TranslationTokens {
    noFilesAttached = 'commonlibraries-main.component.noFilesAttached',
}

@Component({
    selector: 'hxgn-common-file-list',
    templateUrl: 'common-file-list.component.html',
    styleUrls: ['common-file-list.component.scss']
})
/**
 * A component for displaying the list of files
 */
export class FileListComponent {

    /** List of files to display */
    @Input() files: File[] = [];

    /** Filename of the currently uploading file */
    @Input() uploadingFilename = '';

    /** File to be removed */
    @Output() removeFile: EventEmitter<number> = new EventEmitter<number>();

    /**  Expose tokens to html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() {}

    /** Emits event to remove file from list */
    removeFromList(index: number) {
        this.removeFile.emit(index);
    }
}
