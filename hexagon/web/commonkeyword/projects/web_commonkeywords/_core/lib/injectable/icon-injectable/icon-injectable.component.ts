import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import {
	capabilityId,
	CompositeIcon$v1,
	IconCapabilityOptions$v1,
	IconRequest$v1,
	IconRule$v1,
	LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commonkeywords/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, combineLatest, from, Observable, Subject, Subscription } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { CompositeIconStoreService } from '../../composite-icon-store.service';
import { CoreService } from '../../core.service';
import { DataService } from '../../data.service';

@Component({
	templateUrl: 'icon-injectable.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class IconInjectableComponent implements OnInit, OnDestroy {

	/** Height and width of icon */
	size = 30;

	/** Height of host element */
	@HostBinding('style.height.px') hostHeight = this.size;

	/** Width of host element */
	@HostBinding('style.width.px') hostWidth = this.size;

	/** Composite icon */
	private icon = new BehaviorSubject<CompositeIcon$v1>(null);

	/** Composite icon to display */
	readonly icon$: Observable<CompositeIcon$v1> = this.icon.asObservable();

	/** List of optional composite icons to select from */
	private iconRules = new BehaviorSubject<IconRule$v1[]>([]);

	/** List of optional composite icons to select from */
	readonly iconRules$: Observable<IconRule$v1[]> = this.iconRules.asObservable();

	/**
	 * Icon to use if no keyword icon is found
	 */
	fallbackIcon$ = combineLatest([
		from(this.tenantAdapter.getCapabilityListAsync()),
		this.settings.icon$
	]).pipe(
		map(([capabilityList, request]) => {
			const capability = capabilityList.find(comp => comp.id === request.capabilityId);
			if (capability) {
				const compatible = capability.compatible.find(comp => comp.capabilityId === capabilityId);

				if (compatible) {
					const options: IconCapabilityOptions$v1 = new IconCapabilityOptions$v1(compatible.options);
					// Try for industry fallback
					if (options.industryIcons.has(request.industryId)) {

						return options.industryIcons.get(request.industryId)?.filePath;
					} else {
						// Try for capability fallback

						return options?.capabilityIconPath;
					}
				}
			}
			return '';
		})
	);

	/** Subscription to composite icon */
	private compositeSub: Subscription;

	private destroy$ = new Subject<boolean>();

	constructor(
		@Inject(LAYOUT_MANAGER_SETTINGS) public settings: IconRequest$v1,
		private tenantAdapter: CommontenantAdapterService$v1,
		private compositeStore: CompositeIconStoreService,
		private dataSrv: DataService,
		private coreSrv: CoreService
	) { }

	/**
	 * On init lifecycle hook
	 */
	ngOnInit() {
		this.settings.icon$.pipe(
			takeUntil(this.destroy$)
		).subscribe(r => {
			if (this.compositeSub) {
				this.compositeSub.unsubscribe();
			}

			this.compositeSub = this.compositeStore.get$(
				r.tenantId, r.industryId, r.capabilityId, r.keywords
			).pipe(
				takeUntil(this.destroy$)
			).subscribe(i => {
				this.icon.next(i);
			});
		});

		this.settings.size$.pipe(
			filter(data => !!data)
		).pipe(
			takeUntil(this.destroy$)
		).subscribe(s => {
			this.size = this.hostWidth = this.hostHeight = s;
		});

		this.settings.editable$.pipe(first()).subscribe(async (isEditable) => {
			if (isEditable) {
				this.settings.keywords$.pipe(
					takeUntil(this.destroy$)
				).subscribe(keywords => {
					const request = this.settings.icon$.getValue();
					request.keywords = keywords;

					// Update list of icon options
					this.dataSrv.compositeIcon.searchAll$([request]).toPromise().then(iconRules => {
						this.sortIconRules(iconRules);
						this.coreSrv.loadPrimitiveIcon(iconRules);
						this.iconRules.next(iconRules);
					});
				});
			}
		});
	}

	/**
	 * On destroy lifecycle hook
	 */
	ngOnDestroy(): void {
		if (this.compositeSub) {
			this.compositeSub.unsubscribe();
		}

		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Emits event for when new icon selected
	 * @param keywords List of keywords required
	 */
	updateKeywords(keywords: string[]) {
		this.settings.updateKeywords(keywords);
	}

	/**
	 * Sort the list of icon rules by friendly name
	 * @param iconRules List of icon rules
	 */
	sortIconRules(iconRules: IconRule$v1[]) {
		iconRules.sort((a, b) => a.rule.friendlyName.toLocaleLowerCase() > b.rule.friendlyName.toLocaleLowerCase() ? 1 : -1);
	}
}
