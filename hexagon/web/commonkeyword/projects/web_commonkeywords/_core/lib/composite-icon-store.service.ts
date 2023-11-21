import { Injectable } from '@angular/core';
import { CompositeIcon$v1, CompositeIconRequest$v1 } from '@galileo/web_commonkeywords/_common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Store of composite icons that is used by the main list of icons.
 * This store should not be used for admin.
 */
@Injectable({ providedIn: 'root' })
export class CompositeIconStoreService {

	/** List of composite icons */
	private icons = new BehaviorSubject<CompositeIconRequest$v1[]>([]);

	/** List of composite icons */
	readonly icons$ = this.icons.asObservable();

	constructor() { }

	/**
	 * Inserts or updates a composite icon
	 * @param icon Icon to upsert
	 */
	upsert(icon: CompositeIconRequest$v1): void {
		const found = !!this.icons.getValue().find(i => {
			return i.capabilityId === icon.capabilityId &&
				i.tenantId === icon.tenantId &&
				i.industryId === icon.industryId &&
				JSON.stringify(i.keywords) === JSON.stringify(icon.keywords);
		});
		if (!found) {
			this.icons.next([...this.icons.getValue(), icon]);
		} else {
			let incidentUpdated = false;
			this.icons.next(this.icons.getValue().map(item => {
				if (item.capabilityId === icon.capabilityId &&
					item.tenantId === icon.tenantId &&
					item.industryId === icon.industryId &&
					JSON.stringify(item.keywords) === JSON.stringify(icon.keywords)) {
					item = icon;
					incidentUpdated = true;
				}
				return item;
			}));
		}
	}

	/**
	 * Add a list of icons to the store
	 * @param iconList Icon list to add to the store
	 */
	concatenate(iconList: CompositeIconRequest$v1[]): void {
		iconList.forEach(icon => {
			this.upsert(icon);
		});
	}

	/**
	 * Get an icon from the store
	 * @param tenantId Id of the tenant that owns the icon
	 * @param industryId Id of the industry
	 * @param capabilityId Id of the capability
	 * @param keywords List of keywords
	 */
	get$(tenantId: string, industryId: string, capabilityId: string, keywords: string[]): Observable<CompositeIcon$v1> {
		return this.icons$.pipe(
			map((request: CompositeIconRequest$v1[]) => {
				const found = request.find(r => {
					return r.capabilityId === capabilityId &&
						r.tenantId === tenantId &&
						r.industryId === industryId &&
						JSON.stringify(r.keywords) === JSON.stringify(keywords);
				});

				if (found) {
					return found.icon;
				} else {
					return null;
				}
			})
		);
	}

	/**
	 * Returns true if the icon is already in the store
	 * @param tenantId Id of the tenant that owns the icon
	 * @param industryId Id of the industry
	 * @param capabilityId Id of the capability
	 * @param keywords List of keywords
	 */
	has(tenantId: string, industryId: string, capabilityId: string, keywords: string[]): boolean {
		const icons: CompositeIconRequest$v1[] = this.icons.getValue() as CompositeIconRequest$v1[];

		if (!icons) {
			return false;
		}

		return !!icons.find(r => {
			return r.capabilityId === capabilityId &&
				r.tenantId === tenantId &&
				r.industryId === industryId &&
				JSON.stringify(r.keywords) === JSON.stringify(keywords);
		});
	}
}
