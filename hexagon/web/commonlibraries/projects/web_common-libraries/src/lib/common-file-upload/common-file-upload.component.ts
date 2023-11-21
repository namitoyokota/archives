import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

import { TranslatedTokens, TranslationTokens } from './common-file-upload.translation';

@Component({
    selector: 'hxgn-common-file-upload',
    templateUrl: 'common-file-upload.component.html',
    styleUrls: ['common-file-upload.component.scss']
})
/**
 * A component for choosing a file to upload. This current version only supports single file upload.
 */
export class FileUploadComponent implements OnInit {

    /** Accepted file extensions separated by a comma */
    @Input() acceptedExtensions = '*';

    /** Text that will be displayed on the choose button */
    @Input() btnText = '';

    /** Text that will be displayed in the drag and drop pane */
    @Input() dragAndDropText = '';

    /** Flag to display icon */
    @Input() displayIcon = false;

    /** Flag to display browse button */
    @Input() displayButton = true;

    /** Flag that is true if the drag and drop should be enabled */
    @Input() dragAndDrop = true;

    /** Flag to display current file */
    @Input() displayFile = false;

    /** Flag that is true if multiple files can be uploaded */
    @Input() uploadMultiple = false;

    /** Current filename */
    @Input() filename = '';

    /** File that is selected */
    @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();

    /** Reference to file input */
    @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

    /** Reference to form group */
    form: FormGroup;

    /** Flag that is true with a file is dragged over the drop zone */
    dragOver = false;

    /** Error message to display to UI */
    errorMsg: string;

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** Maximum upload size */
    private readonly maxFileSize = 100000000;

    constructor(
        private fb: FormBuilder,
        private zone: NgZone,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.createForm();
    }

    /** OnInit */
    ngOnInit() {
        this.initLocalization();

        // Run outsize of zone for performance gains
        this.zone.runOutsideAngular(() => {
            // Disable the default actions for file drag and drop
            window.addEventListener('dragover', (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
            window.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
            window.addEventListener('dragenter', (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
    }

    /**
     * Response when a file is dropped
     * @param event Drag event object
     */
    dropFile(event: DragEvent) {
        this.dragOver = false;
        event.preventDefault();
        event.stopPropagation();
        this.uploadFiles(event.dataTransfer.files);
    }

    /**
     * Event that is fired when a file is changed
     * @param event File change event
     */
    onFileChange(event) {
        this.uploadFiles(event.target.files);
    }

    /**
     * Loop through the list of files and upload
     * @param list FileList object
     */
    uploadFiles(list: FileList) {
        let errorExists = false;
        Array.from(list).forEach((file: File) => {
            if (this.validatedExtension(file.name)) {
                if (file.size < this.maxFileSize) {
                    this.filename = file.name;
                    this.form.get('file').setValue(file);
                    this.fileSelected.emit(file);
                } else {
                    this.errorMsg = this.tTokens.fileTooLarge;
                    errorExists = true;
                }
            } else {
                this.errorMsg = this.tTokens.invalideFileFormat;
                errorExists = true;
            }
        });

        if (!errorExists) {
            this.errorMsg = '';
        }
    }

    /**
     * Clears the selected file
     */
    clear(event = null) {
        if (event) {
            event.stopPropagation();
        }

        this.filename = '';
        this.form.get('file').setValue(null);
        this.fileSelected.emit(null);
        this.fileInput.nativeElement.value = null;
    }

    /**
     * Returns true if the selected file has a valid file extension
     */
    private validatedExtension(fileName: string): boolean {
        if (this.acceptedExtensions === '*') {
            return true;
        }

        const ext = '.' + fileName.substr(fileName.lastIndexOf('.') + 1);
        return !!this.acceptedExtensions.includes(ext);
    }

    /**
     * Init the form
     */
    private createForm() {
        this.form = this.fb.group({
            file: null
        });
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.fileTooLarge = translatedTokens[TranslationTokens.fileTooLarge];
        this.tTokens.invalideFileFormat = translatedTokens[TranslationTokens.invalideFileFormat];
    }
}
