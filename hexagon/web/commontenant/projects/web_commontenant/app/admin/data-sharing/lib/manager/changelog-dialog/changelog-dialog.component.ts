import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeOperator$v1 } from '@galileo/web_common-libraries';
import {
	Changelog$v1,
	ChangelogDescriptor$v1,
	ChangelogSortOptions$v1,
	CustomTranslation$v1,
	UserInfo$v1,
} from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Changelog$v1 as OrganizationManagerLog$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { DataService$v2 } from '@galileo/web_commontenant/app/_core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DataSharingChangelogStoreService } from '../../changelog-store.service';
import { TranslatedTokens, TranslationTokens } from './changelog-dialog.translation';

export interface ChangelogDialogData {
	/** Active tenant id of the user */
	tenantId: string;

	/** List of users in the tenant */
	users: UserInfo$v1[];

	/** List of tenants in the system */
	tenants: Tenant$v1[];

	/** Map for translated capability tokens */
	tokenMap: Map<string, string>;
}

interface CriteriaInfo {
	capabilityNames: string[];
	sharerName: string;
	shareeName: string;
}

enum EntityTypes {
	sharingCriteria = 'Sharing Criteria',
}

enum IconUrls {
	invitationAccepted = 'assets/commontenant-core/changelog/changelog-invitation-accepted.svg',
	rulesDefined = 'assets/commontenant-core/changelog/data-sharing-rules-defined.svg',
	rulesUpdated = 'assets/commontenant-core/changelog/data-sharing-rules-updated.svg',
	stopped = 'assets/commontenant-core/changelog/data-sharing-stopped.svg'
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
export class DataSharingChangelogDialogComponent implements OnInit, OnDestroy {

	/** State of the options button and expansion pane */
	private paneState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	/** State of the options button and expansion pane but observable */
	paneState$ = this.paneState.asObservable();

	/** Currently selected sort option */
	selectedSort$ = new BehaviorSubject<ChangelogSortOptions$v1>(ChangelogSortOptions$v1.timeDesc);

	/** List of access manager changelogs */
	logs$: Observable<Changelog$v1[]> = combineLatest([
		this.changelogStore.entity$,
		this.selectedSort$.asObservable()
	]).pipe(
		map(([logs, sortOption]) => {
			return this.sortLogs(logs, sortOption);
		})
	);

	/** List of types to select from */
	readonly types = [
		EntityTypes.sharingCriteria
	];

	/** Currently selected type */
	selectedType = '';

	/** List of users to select from */
	users: UserInfo$v1[] = [];

	/** Currently selected user */
	selectedUser: UserInfo$v1;

	/** Start date value to be used to filter data */
	startDate: Date = null;

	/** End date value to be used to filter data */
	endDate: Date = null;

	/** Flag to indicate whether filter has been touched */
	isDirty = false;

	/** Descriptor sent to API */
	descriptor = new ChangelogDescriptor$v1();

	/** Flag to indicate that all logs have been loaded */
	allLogsLoaded$ = this.changelogStore.allLogsLoaded;

	/** Flag to indicate when data is being loaded */
	loadingData = false;

	/** Export tokens to HTML */
	tokens: typeof TranslationTokens = TranslationTokens;

	/** Translated tokens */
	tTokens: TranslatedTokens = {} as TranslatedTokens;

	/** Page size for the API call */
	readonly pageSize = 100;

	/** Observable used to clean up subscriptions on destory */
	private destroy$ = new Subject<boolean>();

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ChangelogDialogData,
		private dataSrv: DataService$v2,
		private changelogStore: DataSharingChangelogStoreService,
		private localizationAdapter: CommonlocalizationAdapterService$v1
	) { }

	/** On initialization lifecycle hook */
	ngOnInit() {
		this.initLocalizationAsync();

		// Clear filtering in case some already exist
		this.clearFilters();

		// Creates description object to make API calls
		this.descriptor = new ChangelogDescriptor$v1({
			id: this.data?.tenantId,
			changeRecordCreationTime: '',
			continuationToken: '',
			pageSize: this.pageSize
		});

		// Store the list of users
		this.users = this.data?.users;

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
		this.selectedType = type;
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
	clearDateFilters() {
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
		this.clearDateFilters();
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
		const noMoreData = this.allLogsLoaded$.getValue();
		if (!noMoreData) {
			this.loadingData = true;

			this.dataSrv.dataSharing.getTimeline$(
				this.descriptor,
				this.selectedType?.replace(/\s/g, ''),
				this.selectedUser?.id,
				this.startDate?.toISOString(),
				this.endDate?.toISOString()
			).toPromise().then((pages: Map<string, OrganizationManagerLog$v1[]>) => {
				this.descriptor.changeRecordCreationTime = pages.entries().next().value[0];
				if (!this.descriptor.changeRecordCreationTime) {
					this.changelogStore.allLogsLoaded.next(true);
				}

				const newLogs = pages.get(this.descriptor.changeRecordCreationTime);
				if (newLogs.length) {
					this.mergeLogs(newLogs);
					this.parseLogs(newLogs);
				}

				this.loadingData = false;
			});
		}
	}

	/** Method to merge logs with same sharing criteria */
	mergeLogs(logs: OrganizationManagerLog$v1[]) {
		for (let index = 0; index < logs.length - 1; index++) {
			// Current log used to merge logs into
			const currentLog = logs[index];
			const currentCriteria = this.getCriteriaInfo(currentLog);

			let indexIsInRange;
			while (indexIsInRange = index < logs.length - 1) {
				// Next log to check if it can be merged with current log
				const nextLog = logs[index + 1];

				const logValueExists = Object.keys(nextLog.operations[0].value).length;
				if (logValueExists) {
					const nextCriteria = this.getCriteriaInfo(nextLog);
					const sameOperator = currentLog.operations[0].operator === nextLog.operations[0].operator;
					const sameSharee = currentCriteria.shareeName === nextCriteria.shareeName;
					const sameSharer = currentCriteria.sharerName === nextCriteria.sharerName;
					const datesAreClose = new Date(currentLog.timestamp).getTime() - new Date(nextLog.timestamp).getTime() < 600000;

					const canMerge = sameOperator && sameSharee && sameSharer && datesAreClose;
					if (canMerge) {
						// Merge to next log to current log
						currentLog.operations = currentLog.operations.concat(nextLog.operations);

						// Remove log from array
						logs.splice(index + 1, 1);
					} else {
						break;
					}
				} else {
					// Remove log from array
					logs.splice(index + 1, 1);
				}
			}
		}
	}

	/** Method to get the list of changelog objects */
	async parseLogs(inputLogs: OrganizationManagerLog$v1[]) {
		this.changelogStore.upsert(
			inputLogs.map(log => {
				return this.parseLog(log);
			})
		);
	}

	/** Parses passed in log to changelog object */
	parseLog(log: OrganizationManagerLog$v1): Changelog$v1 {
		const newChangelog = new Changelog$v1({
			id: log.timestamp,
			user: this.users.find(user => user.id === log.user),
			timestamp: log.timestamp
		});

		const criteria = this.getCriteriaInfo(log);
		const isSharingStopped = log.operations[0].operator === ChangeOperator$v1.removeEach;
		const isSharingUpdated = log.operations[0].operator === ChangeOperator$v1.updateEach;

		if (isSharingUpdated) {
			this.sharingRulesUpdated(newChangelog, criteria);
		} else if (isSharingStopped) {
			this.sharingStopped(newChangelog, criteria);
		} else {
			if (criteria.sharerName === criteria.shareeName) {
				this.sharingRulesDefined(newChangelog, criteria);
			} else {
				this.sharingStarted(newChangelog, criteria);
			}
		}

		return newChangelog;
	}

	/** Parse data sharing criteria from log */
	getCriteriaInfo(log: OrganizationManagerLog$v1) {
		const criterias = log.operations.map(operation => {
			const operationList = operation.value[Object.keys(operation.value)[0]];
			if (operationList?.length) {
				return operationList[0];
			}
		});

		return {
			shareeName: this.data?.tenants.find(tenant => tenant.id == criterias[0]?.shareeTenantId)?.name,
			sharerName: this.data?.tenants.find(tenant => tenant.id == criterias[0]?.sharerTenantId)?.name,
			capabilityNames: [...new Set(criterias
				.map(criteria => this.data?.tokenMap.get(criteria?.capabilityId))
				.sort((a, b) => a > b ? 1 : -1)
			)]
		} as CriteriaInfo;
	}

	/** Method to assign Sharing Started attributes */
	sharingStarted(log: Changelog$v1, criteria: CriteriaInfo) {
		log.title = this.tTokens.sharingStarted;
		log.iconUrl = IconUrls.invitationAccepted;
		log.descriptions = [new CustomTranslation$v1({
			translation: this.tokens.sharingStartedDescription,
			replacements: [
				criteria.sharerName,
				criteria.capabilityNames.join(', '),
				criteria.shareeName
			]
		})];
	}

	/** Method to assign Sharing Stopped attributes */
	sharingStopped(log: Changelog$v1, criteria: CriteriaInfo) {
		log.title = this.tTokens.sharingStopped;
		log.iconUrl = IconUrls.stopped;
		log.descriptions = [new CustomTranslation$v1({
			translation: this.tokens.sharingStoppedDescription,
			replacements: [
				criteria.sharerName,
				criteria.capabilityNames.join(', '),
				criteria.sharerName
			]
		})];
	}

	/** Method to assign Sharing Rules Defined attributes */
	sharingRulesDefined(log: Changelog$v1, criteria: CriteriaInfo) {
		log.title = this.tTokens.sharingDefined;
		log.iconUrl = IconUrls.rulesDefined;
		log.descriptions = [new CustomTranslation$v1({
			translation: this.tokens.sharingDefinedDescription,
			replacements: [
				criteria.capabilityNames.join(', '),
				criteria.sharerName
			]
		})];
	}

	/** Method to assign Sharing Rules Updated attributes */
	sharingRulesUpdated(log: Changelog$v1, criteria: CriteriaInfo) {
		log.title = this.tTokens.sharingUpdated;
		log.iconUrl = IconUrls.rulesUpdated;
		log.descriptions = [new CustomTranslation$v1({
			translation: this.tokens.sharingUpdatedDescription,
			replacements: [
				criteria.capabilityNames.join(', '),
				criteria.sharerName
			]
		})];
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