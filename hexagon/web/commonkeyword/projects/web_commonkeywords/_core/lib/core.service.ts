import { Injectable } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
	capabilityId,
	CommonkeywordsMailboxService,
	CompositeIcon$v1,
	CompositeIconFromKeywordsRequest,
	CompositeIconRequest$v1,
	IconRule$v1,
	PrimitiveIcon$v2,
} from '@galileo/web_commonkeywords/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { ReplaySubject, Subject, zip } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { CompositeIconStoreService } from './composite-icon-store.service';
import { DataService } from './data.service';
import { PrimitiveIconStoreService } from './primitve-icon-store.service';

@Injectable()
export class CoreService {

	/** Cache of primitive icons (primitive id, primitive icon) */
	private primitiveIconCache = new Map<string, PrimitiveIcon$v2>();

	/** Cache of composite icons (composite id, composite icon) */
	private compositeIconCache = new Map<string, CompositeIcon$v1>();

	/** Cache of keyword search results (hashed value of search request, composite icon id)*/
	private searchResultCache = new Map<string, string>();

	/** Event bus for when the composite icon cache is updated */
	private compositeIconCacheUpdated$ = new Subject<CompositeIcon$v1>();

	/** Event bus for when the primitive icon cache is updated */
	private primitiveIconCacheUpdated$ = new Subject<PrimitiveIcon$v2>();

	/** Event bus for when the search result cache is updated (hash id of search result) */
	private searchResultCacheUpdated$ = new ReplaySubject<string>(100);

	constructor(
		private dataSrv: DataService,
		private mailbox: CommonkeywordsMailboxService,
		private layoutAdapter: LayoutCompilerAdapterService,
		private compositeStore: CompositeIconStoreService,
		private primitiveStore: PrimitiveIconStoreService,
		private identityAdapter: CommonidentityAdapterService$v1
	) {
		this.initPostOffice();
		this.layoutAdapter.coreIsLoadedAsync(capabilityId);
	}

	/**
	 * Listen to all messages in the mailbox service
	 */
	private async initPostOffice() {
		this.initListenerForGetIconFromKeywords();
		this.initListenerForGetPrimitiveIcon();
		this.initListenerForLoadCompositeIcons();

		this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
	}

	private initListenerForGetIconFromKeywords(): void {
		this.mailbox.mailbox$v1.getCompositeIconFromKeywords$.subscribe(async (mailbox) => {
			const icon = await this.getIconFromKeywordsAsync(mailbox.payload);

			mailbox.response.next(icon);
			mailbox.response.complete();
		});
	}

	private initListenerForGetPrimitiveIcon(): void {
		this.mailbox.mailbox$v1.getPrimitiveIcon$.subscribe(async (mailbox) => {
			const icon = await this.getPrimitiveIconAsync(mailbox.payload);

			mailbox.response.next(icon);
			mailbox.response.complete();
		});
	}

	/**
	 * Load primitive icons into store based on icon rules
	 * @param rules Icon Rule
	 */
	async loadPrimitiveIcon(rules: IconRule$v1[]): Promise<void> {
		let iconList: string[] = [];
		rules.forEach(r => {
			if (r?.icon) {
				iconList = iconList.concat(r.icon.iconStack.map(is => is.primitiveIconId));
			}
		});
		iconList = [...new Set(iconList)];

		iconList = iconList.filter(i => !this.primitiveStore.has(i));
		this.primitiveStore.concat(iconList.map(i => {
			return new PrimitiveIcon$v2({ id: i });
		}));

		// Load primitive icons that are missing
		if (iconList.length) {
			this.dataSrv.primitiveIcon.systemGet$(iconList).toPromise().then(async systemIcons => {
				console.warn('system', systemIcons);

				const foundAllIcons = systemIcons.length === iconList.length;
				if (foundAllIcons) {
					this.primitiveStore.concat(systemIcons);
				} else {
					const tenantIcons = await this.dataSrv.primitiveIcon.get$(iconList, (await this.identityAdapter.getUserInfoAsync()).activeTenant).toPromise();
					console.warn('tenant', tenantIcons);

					// const pIcons = [...new Set(tenantIcons.concat(systemIcons))];
					// this.primitiveStore.concat(pIcons);
					this.primitiveStore.concat(systemIcons);
					this.primitiveStore.concat(tenantIcons);
				}
			});
		}
	}

	private initListenerForLoadCompositeIcons(): void {
		this.mailbox.mailbox$v1.loadCompositeIcons$.subscribe((request: CompositeIconRequest$v1[]) => {
			console.warn(request);

			// First filter out any request that have already been made
			request = request.filter((r: CompositeIconRequest$v1) => {
				return !this.compositeStore.has(r.tenantId, r.industryId, r.capabilityId, r.keywords);
			});

			console.warn(request);

			if (!request?.length) {
				return;
			}

			// There could be dups of missing icons filter them out
			const cleanRequest = [];
			request.forEach(r => {
				// Check if the request is in the list
				const found = !!cleanRequest.find(cr => {

					return r.capabilityId === cr.capabilityId &&
						r.tenantId === cr.tenantId &&
						r.industryId === cr.industryId &&
						JSON.stringify(r.keywords) === JSON.stringify(cr.keywords);
				});

				if (!found) {
					cleanRequest.push(r);
				}
			});

			this.compositeStore.concatenate(cleanRequest);

			console.warn(cleanRequest);

			this.dataSrv.compositeIcon.search$(cleanRequest).subscribe(async response => {
				console.warn(response);

				// Get primitive icons first
				let iconList: string[] = [];
				response.forEach(r => {
					if (r?.icon) {
						iconList = iconList.concat(r.icon.iconStack.map(is => is.primitiveIconId));
					}
				});

				console.error(iconList);

				iconList = [...new Set(iconList)];

				iconList = iconList.filter(i => !this.primitiveStore.has(i));
				this.primitiveStore.concat(iconList.map(i => {
					return new PrimitiveIcon$v2({ id: i });
				}));

				console.error('request', iconList);

				// Load primitive icons that are missing
				if (iconList.length) {
					this.dataSrv.primitiveIcon.systemGet$(iconList).toPromise().then(async systemIcons => {
						console.warn('system', systemIcons);

						const foundAllIcons = systemIcons.length === iconList.length;
						if (foundAllIcons) {
							this.primitiveStore.concat(systemIcons);
						} else {
							console.log('asking tenant', iconList);
							const tenantIcons = await this.dataSrv.primitiveIcon.get$(iconList, (await this.identityAdapter.getUserInfoAsync()).activeTenant).toPromise();
							console.warn('tenant', tenantIcons);
							this.primitiveStore.concat(systemIcons);
							this.primitiveStore.concat(tenantIcons);
							// const pIcons = [...new Set(tenantIcons.concat(systemIcons))];
							// this.primitiveStore.concat(pIcons);
						}
					});
				}

				this.compositeStore.concatenate(response);
			});

		});
	}

	/**
	 * Given keyword list, capabilityId, and industry returns an composite icon
	 * @param capabilityId The capability id to filter on
	 * @param industry The industry to filter on
	 */
	private async getIconFromKeywordsAsync(searchRequest: CompositeIconFromKeywordsRequest): Promise<CompositeIcon$v1> {
		return new Promise(async (resolve) => {
			// First we need an id for search result
			if (!searchRequest.keywords) {
				searchRequest.keywords = [];
			}

			searchRequest.keywords.sort();
			const id = JSON.stringify(searchRequest).toLocaleLowerCase().toString();
			const found = this.searchResultCache.get(id);
			if (found) {
				// Get composite icon
				resolve(found ? await this.getCompositeIconAsync(found) : null);
			} else if (this.searchResultCache.has(id)) {
				// Wait for the call already made to come back
				this.searchResultCacheUpdated$.pipe(
					filter(item => item === id),
					first()
				).subscribe(async (searchId) => {
					// Get the composite id
					const cId = this.searchResultCache.get(searchId);
					resolve(cId ? await this.getCompositeIconAsync(cId) : null);
				});
			} else {
				// Add null to cache
				this.searchResultCache.set(id, null);

				// Make call to get composite icon
				const resourceId = await this.dataSrv.keywords.getResourceId$(
					searchRequest.capabilityId, searchRequest.industry, searchRequest.keywords
				).toPromise();

				this.searchResultCache.set(id, resourceId);

				// Resolve any other calls that are waiting
				this.searchResultCacheUpdated$.next(id);

				// Resolve this promise
				resolve(resourceId ? await this.getCompositeIconAsync(resourceId) : null);
			}
		});
	}

	/**
	 * Returns a composite icon from the cache. If not in the cache it will get it from
	 * the REST api.
	 * @param id Composite icon
	 */
	private getCompositeIconAsync(id: string): Promise<CompositeIcon$v1> {
		return new Promise(async (resolve) => {
			const found = this.compositeIconCache.get(id);
			if (found) {
				resolve(found);
			} else if (this.compositeIconCache.has(id)) {
				// Wait for the call already made to come back
				const ready$ = this.compositeIconCacheUpdated$.pipe(
					filter(item => item && item.id === id)
				).subscribe((icon) => {
					ready$.unsubscribe();
					resolve(icon);
				});
			} else {
				// Add null to cache
				this.compositeIconCache.set(id, null);

				// Make call to get composite icon
				const composite = await this.dataSrv.compositeIcon.get$(id).toPromise() as CompositeIcon$v1;
				this.compositeIconCache.set(id, composite);

				// Resolve any other calls that are waiting
				this.compositeIconCacheUpdated$.next(composite);

				// Resolve this promise
				resolve(composite);
			}
		});
	}

	/**
	 * Returns a primitive icon from the cache. If not in the cache it will get it from
	 * the REST api.
	 * @param id Primitive icon
	 */
	private getPrimitiveIconAsync(id: string): Promise<PrimitiveIcon$v2> {
		return new Promise(async (resolve) => {
			const found = this.primitiveIconCache.get(id);
			if (found) {
				resolve(found);
			} else if (this.primitiveIconCache.has(id)) {
				// Wait for the call already made to come back
				const ready$ = this.primitiveIconCacheUpdated$.pipe(
					filter(item => item && item.id === id)
				).subscribe((icon) => {
					ready$.unsubscribe();
					resolve(icon);
				});
			} else {
				// Add null to cache
				this.primitiveIconCache.set(id, null);

				// Make call to get primitive icon
				zip(
					this.dataSrv.primitiveIcon.get$([id], (await this.identityAdapter.getUserInfoAsync()).activeTenant),
					this.dataSrv.primitiveIcon.systemGet$([id])
				).subscribe(([userIcon, systemIcon]) => {
					let primitive: PrimitiveIcon$v2;
					if (userIcon) {
						primitive = userIcon as PrimitiveIcon$v2;
					} else {
						primitive = systemIcon as PrimitiveIcon$v2;
					}

					this.primitiveIconCache.set(id, primitive);

					// Resolve any other calls that are waiting
					this.primitiveIconCacheUpdated$.next(primitive);

					// Resolve this promise
					resolve(primitive);
				});
			}
		});
	}
}
