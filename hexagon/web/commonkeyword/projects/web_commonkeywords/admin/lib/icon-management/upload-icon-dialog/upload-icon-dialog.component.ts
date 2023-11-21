import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreatePrimitiveIcon$v1 } from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CapabilityManifest$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PrimitiveIconStoreService } from '../primitivie-icon-store.service';
import { TranslatedTokens, TranslationTokens } from './upload-icon-dialog.translation';

interface UploadIconDialogData {
	/** List of capabilities to display in dropdown */
	capabilityList: CapabilityManifest$v1[];

	/** Default selected capability */
	defaultCapability: CapabilityManifest$v1;
}

@Component({
	templateUrl: 'upload-icon-dialog.component.html',
	styleUrls: ['upload-icon-dialog.component.scss']
})
export class UploadIconDialogComponent implements OnInit, OnDestroy {

	/** New icon to be created */
	newIcon: CreatePrimitiveIcon$v1 = new CreatePrimitiveIcon$v1();

	/** Currently selected capability */
	selectedCapability: CapabilityManifest$v1;

	/** List of capabilies to assign new icon to */
	capabilityList: CapabilityManifest$v1[] = [];

	/** Flag to indicate state of waiting for data */
	isLoading = true;

	/** Flag to indicate all information are provided */
	isValid = false;

	/** Invalid name that already exists in system */
	invalidNames: string[] = [];

	/** Filename already exists error message */
	errorMsg: string;

	/** Expose TranslationTokens to the HTML */
	tokens: typeof TranslationTokens = TranslationTokens;

	/** Translated tokens */
	tTokens: TranslatedTokens = {} as TranslatedTokens;

	private destroy$: Subject<boolean> = new Subject<boolean>();

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: UploadIconDialogData,
		private dialogRef: MatDialogRef<UploadIconDialogComponent>,
		private localizationAdapter: CommonlocalizationAdapterService$v1,
		private primitiveIconStore: PrimitiveIconStoreService,
		private dataSrv: DataService
	) { }

	/** On init lifecycle hook */
	ngOnInit(): void {
		this.initLocalization();

		this.capabilityList = this.data?.capabilityList;
		if (this.data?.defaultCapability) {
			this.selectCapability(this.data.defaultCapability);
		}

		this.isLoading = false;

		this.localizationAdapter.adapterEvents.languageChanged$.pipe(
			takeUntil(this.destroy$)
		).subscribe((lang) => {
			this.initLocalization();
		});
	}

	/** On destroy life cycle hook */
	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	/** Sets capability id for new icon */
	selectCapability(capability: CapabilityManifest$v1) {
		this.selectedCapability = capability;
		this.newIcon.capabilityId = capability.id;
	}

	/** Stages new icon file */
	upload(file: File): void {
		if (file) {
			this.isLoading = true;
			this.dataSrv.primitiveIcon.stage$(file).toPromise().then(url => {
				if (url) {
					this.newIcon.url = url;
					this.newIcon.fileName = file.name;
					this.isLoading = false;
					this.errorMsg = '';
					this.validate();
				} else {
					this.newIcon.url = '';
					this.newIcon.fileName = '';
					this.isLoading = false;
					this.errorMsg = this.tTokens.duplicateFilenameFound;
					this.validate();
				}
			});
		} else {
			this.newIcon.url = '';
			this.validate();
		}
	}

	/** Validates that necessary information are provided */
	validate(): void {
		this.isValid = (
			this.newIcon.url &&
			this.newIcon.name &&
			!this.invalidNames.includes(this.newIcon.name) &&
			this.newIcon.capabilityId &&
			this.newIcon.baseHeight > 0 &&
			this.newIcon.baseWidth > 0
		);
	}

	/** Closes dialog */
	close(): void {
		this.dialogRef.close();
	}

	/** Saves new icon */
	save(): void {
		this.isLoading = true;
		this.dataSrv.primitiveIcon.create$([this.newIcon]).toPromise().then(icons => {
			icons.forEach(icon => {
				if (icon) {
					// New icon created
					this.primitiveIconStore.upsert(icon);
					this.isLoading = false;
					this.close();
				} else {
					// Duplicate name exists in system
					this.invalidNames.push(this.newIcon.name);
					this.isLoading = false;
					this.validate();
				}
			});
		});
	}

	/** Set up routine for localization */
	private async initLocalization() {
		const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
		const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
		this.tTokens.name = translatedTokens[TranslationTokens.name];
		this.tTokens.chooseImage = translatedTokens[TranslationTokens.chooseImage];
		this.tTokens.dragDropImage = translatedTokens[TranslationTokens.dragDropImage];
		this.tTokens.duplicateFilenameFound = translatedTokens[TranslationTokens.duplicateFilenameFound];
	}
}
