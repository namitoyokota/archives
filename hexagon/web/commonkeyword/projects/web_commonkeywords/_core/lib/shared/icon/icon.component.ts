import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import {
	CompositeIcon$v1,
	CompositeIconMember$v1,
	IconRule$v1,
	KeywordRule$v1,
	PrimitiveIcon$v2,
} from '@galileo/web_commonkeywords/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrimitiveIconStoreService } from '../../primitve-icon-store.service';

@Component({
	selector: 'hxgn-commonkeywords-icon',
	templateUrl: 'icon.component.html',
	styleUrls: ['icon.component.scss']
})

export class IconComponent {

	/** Height and width of icon */
	@Input() size = 30;

	/** Composite icon */
	@Input() icon: CompositeIcon$v1;

	/** List of optional composite icons and rules to select from */
	@Input() iconRules: IconRule$v1[] = [];

	/** Icon to use if no keyword icon is found */
	@Input() fallbackIcon: string;

	/** Heading string of the dropdown menu */
	@Input() title: string;

	/** Subtitle string of the dropdown menu */
	@Input() subtitle: string;

	/** Whether icon can be edited or not */
	@Input() editable = false;

	/** Keywords required to change to new icon */
	@Output() keywordsChange = new EventEmitter<string[]>();

	iconUrl: string;

	/** Export url helper to html */
	UrlHelper: typeof UrlHelper = UrlHelper;

	/** Base size of icon */
	private readonly baseSize = 394;

	constructor(
		private primitiveStore: PrimitiveIconStoreService
	) { }

	/**
	 * Get the scale value
	 */
	scaledValue(n: number): number {
		const scale = this.size / this.baseSize;
		return n * scale;
	}

	/**
	 * Gets url of primitive icon
	 * @param icon Composite icon to get url for
	 */
	getIconUrl$(icon: CompositeIconMember$v1): Observable<string> {
		// console.log('getIconUrl$', icon);

		if (!icon) {
			return null;
		}

		return this.primitiveStore.get$(icon.primitiveIconId).pipe(
			map((pIcon: PrimitiveIcon$v2) => {
				console.log(pIcon);

				if (icon?.options?.showStroke) {
					return pIcon?.urlWithStroke;
				} else {
					return pIcon?.url;
				}
			})
		);
	}

	/**
	 * Event when new icon selected
	 * @param rule Keyword rule to corresponding icon
	 */
	updateKeywords(rule: KeywordRule$v1) {
		this.keywordsChange.emit(rule.keywords);
	}

	/**
	 * Used to track item in ng for loop
	 */
	trackByFn(index, item) {
		return index;
	}
}
