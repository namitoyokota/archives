import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    Changelog$v1,
    ChangelogDescriptor$v1,
    ChangelogSortOptions$v1,
    ChangeOperation$v1,
    ChangeOperator$v1,
    CustomTranslation$v1,
    UserInfo$v1,
} from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    Application$v1,
    ChangelogPropertyName$v1,
	Changelog$v1 as OrganizationManagerLog$v1,
    Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { ApplicationStoreService, DataService$v2 } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { OrganizationChangelogStoreService } from '../organization-changelog-store.service';
import { DescriptionTokens, TranslatedTokens, TranslationTokens } from './changelog-dialog.translation';


export interface OrganizationChangelogDialogData {
	/** Active tenant id of the user */
	tenant: Tenant$v1;

	/** List of users in the tenant */
	users: UserInfo$v1[];

	/** map of type tokens for filter */
	typesFilter: Map<string, string>;

	/** industries - id and name tokens for display values */
	industryNameTokens: Map<string, string>;

	/** map of type tokens for display values */
	onboardingNameTokens: Map<string, string>;

	/** map of capability tokens for display values */
	capabilitiesNameTokens: Map<string, string>;
}

enum IconUrls {
	dataSharingUpdate = 'assets/commontenant-core/changelog/changelog-data-sharing-update.svg',
	detailsUpdate = 'assets/commontenant-core/changelog/changelog-details-updated.svg',
	locationUpdate = 'assets/commontenant-core/changelog/changelog-location-update.svg',
	emailUpdate = 'assets/commontenant-core/changelog/changelog-email-update.svg',
}

@Component({
	templateUrl: 'changelog-dialog.component.html',
	styleUrls: ['changelog-dialog.component.scss'],
	animations: [
		trigger('expansionState', [
			state(':enter', style({ height: '*' })),
			state(':leave', style({ height: '0' })),
			state('void', style({ height: '0' })),
			transition('* => *', animate('300ms ease-in-out'))
		])
	]
})
export class OrganizationChangelogDialogComponent implements OnInit, OnDestroy {

	/** State of the options button and expansion pane */
	private paneState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	/** State of the options button and expansion pane but observable */
	paneState$ = this.paneState.asObservable();

	/** List of types to select from */
	types: string[] = [];

	/** Currently selected type key */
	selectedTypeKey = '';

	/** Currently selected type */
	selectedType = '';

	/** List of users to select from */
	users: UserInfo$v1[];

	/** Currently selected user */
	selectedUser: UserInfo$v1;

	/** Start date value to be used to filter data */
	startDate: Date = null;

	/** End date value to be used to filter data */
	endDate: Date = null;

	/** Currently selected sort option */
	selectedSort$ = new BehaviorSubject<ChangelogSortOptions$v1>(ChangelogSortOptions$v1.timeDesc);

	/** Flag to indicate whether filter has been touched */
	isDirty = false;

	/** List of access manager changelogs */
	logs$: Observable<Changelog$v1[]> = combineLatest([
		this.changelogStore.entity$,
		this.selectedSort$.asObservable()
	]).pipe(
		map(([logs, sortOption]) => {
			return this.sortLogs(logs, sortOption);
		})
	);

	/** Descriptor sent to API */
	descriptor = new ChangelogDescriptor$v1();

	/** Flag to indicate that all logs have been loaded */
	allLogsLoaded$ = this.changelogStore.allLogsLoaded;

	/** Flag to indicate when data is being loaded */
	loadingData = false;

	/** Export tokens to HTML */
	tokens: typeof TranslationTokens = TranslationTokens;

	/** description tokens to pass */
	descriptionTokens: typeof DescriptionTokens = DescriptionTokens;

	/** Translated tokens */
	tTokens: TranslatedTokens = {} as TranslatedTokens;

	/** Page size for the API call */
	readonly pageSize = 50;

	/** Observable used to clean up subscriptions on destory */
	private destroy$ = new Subject<boolean>();

	private tenantName: string = '';

	/** map of application tokens for display values */
	private applicationNameTokens: Map<string, string> = new Map<string, string>();

	private readonly propertyNameBlackList: string[] = [
		ChangelogPropertyName$v1.enforceRateLimiting,
		ChangelogPropertyName$v1.tombstoned
	];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: OrganizationChangelogDialogData,
		private dataSrv: DataService$v2,
		private changelogStore: OrganizationChangelogStoreService,
		private localizationAdapter: CommonlocalizationAdapterService$v1,
		private appStore: ApplicationStoreService
	) { }

	/** On initialization function call */
	ngOnInit() {
		this.types = Array.from(this.data.typesFilter.keys());

		this.initLocalizationAsync();

		/** set the application token look up map */
		this.appStore.entity$.pipe(first()).subscribe((list: Application$v1[]) => {
            let tokenList: string[] = [];
            for (const item of list) {
                tokenList = tokenList.concat([item.nameToken]);
            }

            this.localizationAdapter.localizeStringsAsync(tokenList).then(async () => {
                const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokenList);
                list.forEach((item: Application$v1) => {
                    this.applicationNameTokens.set(item.id.toLocaleLowerCase(), translatedTokens[item.nameToken]);
                });
            });
        });

		/** Clear filtering in case some already exist */
		this.clearFilters();

		/** Creates description object to make API calls */
		this.descriptor = new ChangelogDescriptor$v1({
			id: this.data?.tenant.id,
			changeRecordCreationTime: '',
			continuationToken: '',
			pageSize: this.pageSize
		});

		/** Filter empty user names */
		this.users = this.data?.users?.filter(u => u.displayName !== null);

		this.tenantName = this.data?.tenant.name;

		this.localizationAdapter.adapterEvents.languageChanged$.pipe(
			takeUntil(this.destroy$)
		).subscribe((lang) => {
			this.initLocalizationAsync();
		});
	}

	/** On destroy lifecycle hook */
	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	/** Open or close filter pane */
	triggerPane() {
		this.paneState.next(!this.paneState.getValue());
	}

	/** Update selected type */
	updateType(type: string) {
		this.selectedTypeKey = type;
		this.selectedType = this.data.typesFilter.get(type);
		this.filterChanged();
	}

	/** Update selected user */
	updateUser(user: UserInfo$v1) {
		this.selectedUser = user;
		this.filterChanged();
	}

	/** Update selected start date */
	updateStartDate(date: Date) {
		if (date && this.startDate !== date) {
			this.startDate = date;
			this.filterChanged();
		}
	}

	/** Update selected end date */
	updateEndDate(date) {
		if (date && this.endDate !== date) {
			this.endDate = date.toDate();
			this.endDate.setHours(23, 59, 59);
			this.filterChanged();
		}
	}

	/** Updates selected sort */
	updateSort(sort: ChangelogSortOptions$v1) {
		this.selectedSort$.next(sort);
	}

	/** Filter the list of logs */
	filterChanged() {
		this.isDirty = true;
		this.clearStore();
	}

	/** Clear type and user filters */
	clearDataFilters() {
		this.selectedTypeKey = '';
		this.selectedType = '';
		this.selectedUser = null;
		this.isDirty = this.checkDirty();
		this.clearStore();
	}

	/** Clear type and user filters */
	clearTimeFilters() {
		this.startDate = null;
		this.endDate = null;
		this.isDirty = this.checkDirty();
		this.clearStore();
	}

	/** Reset filters to default */
	clearFilters(): void {
		this.clearDataFilters();
		this.clearTimeFilters();
		this.isDirty = false;
	}

	/** Resets changelog store */
	clearStore() {
		this.descriptor.changeRecordCreationTime = '';
		this.changelogStore.allLogsLoaded.next(false);
		this.changelogStore.clear();
	}

	/** Check if filter still exists */
	checkDirty(): boolean {
		return !!this.selectedType ||
			!!this.selectedUser ||
			!!this.startDate ||
			!!this.endDate;
	}

	/** Get more data from the API */
	requestLogs() {
		if (!this.allLogsLoaded$.getValue()) {
			this.loadingData = true;
			this.dataSrv.tenant.getTimeline$(
				this.descriptor,
				this.selectedUser?.id,
				this.selectedType,
				this.startDate?.toISOString(),
				this.endDate?.toISOString()
			).toPromise().then((pages: Map<string, OrganizationManagerLog$v1[]>) => {
				this.descriptor.continuationToken = pages.entries().next().value[0];
				this.descriptor.changeRecordCreationTime = pages.entries().next().value[0];

				if (!this.descriptor.continuationToken) {
					this.changelogStore.allLogsLoaded.next(true);
				}
				const filteredEntries: OrganizationManagerLog$v1[] = pages.get(this.descriptor.continuationToken).filter((change: OrganizationManagerLog$v1) => {
					change.operations = change.operations.filter(operation => {
						const isRedacted = operation.redact;
						const isBlackListed = this.propertyNameBlackList.indexOf(operation.propertyName) > -1;
						let emptySharingData = false;
						if (operation.propertyName === ChangelogPropertyName$v1.configuredDataSharingTypes) {
							const objKeys = Object.keys(operation.value);
							if (objKeys.length === 0) {
								emptySharingData = true;
							} else {
								if (!operation.value[objKeys[0]].length || operation.value[objKeys[0]].length === 0) {
									emptySharingData = true;
								}
							}
						}

						return !(isRedacted || isBlackListed || emptySharingData);
					});
					return change.operations.length > 0;
				});
				this.parseLogs(filteredEntries);
				this.loadingData = false;
			});
		}
	}

	/** Method to get the list of changelog objects */
	parseLogs(inputLogs: OrganizationManagerLog$v1[]): void {
		this.changelogStore.upsert(
			inputLogs.map(log => {
				return this.parseLog(log);
			})
		);
	}

	/** Parses passed in log to changelog object */
	parseLog(log: OrganizationManagerLog$v1): Changelog$v1 {
		let title = '';
		let iconUrl = IconUrls.detailsUpdate;
		let descriptions: CustomTranslation$v1[] = [];
		const operator = this.users.find(user => user.id === log.user);
		if (log.operations.length > 1) {
			if (log.operations.every(o => o.propertyName === ChangelogPropertyName$v1.industryIds)) {
				title = this.tTokens.industryIdUpdated;
			} else {
				title = this.tTokens.updated;
			}
		} else {
			const operation = log.operations[0];
			switch (operation.propertyName) {
				case ChangelogPropertyName$v1.mapData: {
					iconUrl = IconUrls.locationUpdate;
					title = this.tTokens.locationUpdated;
					break;
				}
				case ChangelogPropertyName$v1.contactAddress: {
					iconUrl = IconUrls.emailUpdate;
					title = this.tTokens.emailUpdated;
					break;
				}
				case ChangelogPropertyName$v1.optInAsSharee:
				case ChangelogPropertyName$v1.optIntoGroupDataSharing:
				case ChangelogPropertyName$v1.dataSharingGroup:
				case ChangelogPropertyName$v1.dataSharingNetworks: {
					iconUrl = IconUrls.dataSharingUpdate;
					title = this.tTokens.dataSharingUpdated;
					break;
				}
				case ChangelogPropertyName$v1.configuredDataSharingTypes: {
					iconUrl = IconUrls.dataSharingUpdate;
					title = this.tTokens.dataSharingTypesUpdated;
					break;
				}
				case ChangelogPropertyName$v1.abbreviation: {
					title = this.tTokens.abbreviationUpdated;
					break;
				}
				case ChangelogPropertyName$v1.city: {
					title = this.tTokens.cityUpdated;
					break;
				}
				case ChangelogPropertyName$v1.culture: {
					title = this.tTokens.cultureUpdated;
					break;
				}
				case ChangelogPropertyName$v1.country: {
					title = this.tTokens.countryUpdated;
					break;
				}
				case ChangelogPropertyName$v1.enableJargon: {
					title = this.tTokens.jargonStatusUpdated;
					break;
				}
				case ChangelogPropertyName$v1.industryIds: {
					title = this.tTokens.industryIdUpdated;
					break;
				}
				case ChangelogPropertyName$v1.name: {
					title = this.tTokens.nameUpdated;
					break;
				}
				case ChangelogPropertyName$v1.state: {
					title = this.tTokens.stateUpdated;
					break;
				}
				case ChangelogPropertyName$v1.tenantIconUrl: {
					title = this.tTokens.iconUpdated;
					break;
				}
				case ChangelogPropertyName$v1.onboardingConfiguredSteps: {
					title = this.tTokens.onBoardingStepUpdated;
					break;
				}
				case ChangelogPropertyName$v1.applicationIds: {
					title = this.tTokens.licensedAppsUpdate;
					break;
				}
				default: {
					title = this.tTokens.updated;
					break;
				}
			}
		}

		log.operations.forEach(op => {
			descriptions.push(this.parseOperation(op));
		});

		return new Changelog$v1({
			id: log.timestamp,
			iconUrl,
			title,
			descriptions,
			user: operator,
			timestamp: log.timestamp
		});
	}

	/** parses Changelog Operation into a custom translation object
	* @param value
	* @param op: ChangeOperation$v1
	* @returns CustomTranslation$v1
	*/
	parseOperation(op: ChangeOperation$v1): CustomTranslation$v1 {
		let replacements = [];
		let translation = this.descriptionTokens.genericPropertyDescription;
		switch (op.propertyName) {
			case ChangelogPropertyName$v1.contactAddress: {
				translation = this.descriptionTokens.emailDescription;
				replacements.push(op.value);
				break;
			}
			case ChangelogPropertyName$v1.dataSharingGroup:
			case ChangelogPropertyName$v1.dataSharingNetworks: {
				const isRemoved = (op.operator === ChangeOperator$v1.removal || op.operator === ChangeOperator$v1.removeEach);
				if (op.value?.length === 1) {
					translation = isRemoved ? this.descriptionTokens.dataTypeRemovedDescription : this.descriptionTokens.dataTypeDescription;
				} else {
					translation = isRemoved ? this.descriptionTokens.dataTypesRemovedDescription : this.descriptionTokens.dataTypesDescription;
				}
				replacements.push(`"${op.value?.join(',')}"`);
				break;
			}
			case ChangelogPropertyName$v1.enableJargon: {
				if (op.value) {
					translation = this.descriptionTokens.jargonEnabledDescription;
				} else {
					translation = this.descriptionTokens.jargonDisabledDescription;
				}
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.industryIds: {
				const names = op.value?.map(id => this.data.industryNameTokens.get(id));
				if (op.operator === ChangeOperator$v1.removal || op.operator === ChangeOperator$v1.removeEach) {
					if (names?.length === 1) {
						translation = this.descriptionTokens.industryIdRemovedDescription;
					} else {
						translation = this.descriptionTokens.industryIdsRemovedDescription;
					}
				} else {
					if (names?.length === 1) {
						translation = this.descriptionTokens.industryIdUpdatedDescription;
					} else {
						translation = this.descriptionTokens.industryIdsUpdatedDescription;
					}
				}
				replacements.push(`"${names.join(', ')}"`);
				break;
			}
			case ChangelogPropertyName$v1.mapData: {
				translation = this.descriptionTokens.locationUpdateDescription;
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.tenantIconUrl: {
				if (op.value && op.value !== '') {
					translation = this.descriptionTokens.iconUpdatedDescription;
				} else {
					translation = this.descriptionTokens.iconRemovedDescription;
				}
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.onboardingConfiguredSteps: {
				translation = this.descriptionTokens.onBoardingStepUpdatedDescription;
				const names = op.value?.map(value => this.data.onboardingNameTokens.get(value));
				replacements.push(`"${names.join(',')}"`);
				break;
			}
			case ChangelogPropertyName$v1.optInAsSharee: {
				if (op.value) {
					translation = this.descriptionTokens.optInShareeEnabledDescription;
				} else {
					translation = this.descriptionTokens.optInShareeDisabledDescription;
				}
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.optIntoGroupDataSharing: {
				if (op.value) {
					translation = this.descriptionTokens.optIntoGroupEnabledDescription;
				} else {
					translation = this.descriptionTokens.optIntoGroupDisabledDescription;
				}
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.configuredDataSharingTypes: {
				const objKeys = Object.keys(op.value);
				if (objKeys[0].toLowerCase().includes('internal')) {
					translation = this.descriptionTokens.internalDataSharingTypesDescription;
				} else {
					translation = this.descriptionTokens.externalDataSharingTypesDescription;
				}
				const names = op.value[objKeys[0]].map(id => this.data.capabilitiesNameTokens.get(id));
				replacements.push(`"${names.join(', ')}"`);
				break;
			}
			case ChangelogPropertyName$v1.invitationAccepted: {
				if (op.value) {
					translation = this.descriptionTokens.invitationAcceptedDescription;
				} else {
					translation = this.descriptionTokens.invitationNotAcceptedDescription;
				}
				replacements.push(this.tenantName);
				break;
			}
			case ChangelogPropertyName$v1.applicationIds: {
				if(op.operator === ChangeOperator$v1.removal || op.operator === ChangeOperator$v1.removeEach) {
					translation = this.descriptionTokens.licensedAppsRemovedDescription;
				} else {
					translation = this.descriptionTokens.licensedAppsUpdatedDescription;
				}
				const names = op.value.map(id => this.applicationNameTokens.get(id.toLowerCase()));
				replacements.push(`"${names.join(', ')}"`);
				break;
			}
			default: {
				replacements.push(op.propertyName);
				replacements.push(this.tenantName);
				replacements.push(op.value);
				break;
			}
		}
		return new CustomTranslation$v1({ translation, replacements });
	}

	/** Sort the list of logs by given sort option */
	sortLogs(logs: Changelog$v1[], sortOption: ChangelogSortOptions$v1): Changelog$v1[] {
		switch (sortOption) {
			case ChangelogSortOptions$v1.timeAsc:
				return logs.sort((a, b) => {
					return a.timestamp > b.timestamp ? 1 : -1;
				});
			case ChangelogSortOptions$v1.timeDesc:
				return logs.sort((a, b) => {
					return a.timestamp < b.timestamp ? 1 : -1;
				});
			case ChangelogSortOptions$v1.titleAsc:
				return logs.sort((a, b) => {
					return a.title.localeCompare(b.title);
				});
			case ChangelogSortOptions$v1.titleDesc:
				return logs.sort((a, b) => {
					return b.title.localeCompare(a.title);
				});
			case ChangelogSortOptions$v1.userNameAsc:
				return logs.sort((a, b) => {
					if (!a.user) {
						return 1;
					} else if (!b.user) {
						return -1;
					} else {
						return a.user.displayName.localeCompare(b.user.displayName);
					}
				});
			case ChangelogSortOptions$v1.userNameDesc:
				return logs.sort((a, b) => {
					if (!a.user) {
						return -1;
					} else if (!b.user) {
						return 1;
					} else {
						return b.user.displayName.localeCompare(a.user.displayName);
					}
				});
		}
	}

	/** Set up routine for localization */
	private async initLocalizationAsync(): Promise<void> {
		const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
		const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
		const keys = Object.keys(TranslationTokens);
		for (const index in keys) {
			const prop = keys[index];
			this.tTokens[prop] = translatedTokens[TranslationTokens[prop]];
		}
	}
}