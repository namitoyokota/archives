import { ComponentRef, Injectable, Injector } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { AppNotification$v1, AppNotificationService$v1 } from '@galileo/web_commonnotifications/adapter';
import { capabilityId, InjectableComponentNames } from '@galileo/web_shapes/_common';
import { combineLatest, Observable } from 'rxjs';
import { first, flatMap, map } from 'rxjs/operators';

import { AppNotificationSettings } from './injectable-component/app-notification/app-notification-settings';
import { ShapeStoreService } from './shape-store.service';

export enum AppNotificationType {
	newShape = 'NewShape',
	shapeUpdate = 'ShapeUpdate',
	shapeDeleted = 'ShapeDeleted',
	unknown = 'Unknown'
}

export enum AppNotificationSubtype {
	unknown = 'Unknown'
}

enum AppNotificationTranslationTokens {
	newShape = 'shape-core.notification.newShape',
	shapeUpdate = 'shape-core.notification.shapeUpdate',
	shapeDeleted = 'shape-core.notification.shapeDeleted'
}

@Injectable()
export class AppNotificationService extends AppNotificationService$v1 {

	/** Default notification color */
	readonly defaultColor = '#9EA0A3';

	constructor(
		injector: Injector,
		private store: ShapeStoreService,
		private layoutAdapter: LayoutCompilerAdapterService,
		private localizationAdapter: CommonlocalizationAdapterService$v1
	) {
		super(injector);
	}

	/**
	 * Return the color the notification should be
	 * @param notifications$  Stream of notifications
	 */
	getNotificationColorAsync(
		notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>
	): Promise<Observable<string>> {
		return new Promise<Observable<string>>(resolve => {
			const color$ = combineLatest([
				this.store.entity$,
				notifications$
			]).pipe(
				map(([shapes, n]) => {
					const mainShape = shapes.find(a => a.id === n[0].id);
					if (mainShape) {
						return mainShape.graphicsSettings.fillColor;
					} else {
						return this.defaultColor;
					}
				})
			);

			resolve(color$);
		});
	}

	/**
	 * Returns the title for the notification
	 * @param notifications$ Stream of notifications
	 */
	getNotificationTitleAsync(
		notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>
	): Promise<Observable<string>> {
		return new Promise<Observable<string>>(resolve => {
			resolve(notifications$.pipe(
				flatMap(async notifications => {
					let token: AppNotificationTranslationTokens;
					switch (notifications[0].notificationType) {
						case AppNotificationType.newShape:
							token = AppNotificationTranslationTokens.newShape;
							break;
						case AppNotificationType.shapeUpdate:
							token = AppNotificationTranslationTokens.shapeUpdate;
							break;
						case AppNotificationType.shapeDeleted:
							token = AppNotificationTranslationTokens.shapeDeleted;
							break;
					}

					await this.localizationAdapter.localizeStringAsync(token);
					return await this.localizationAdapter.getTranslationAsync(token);
				})
			));
		});
	}

	/**
	 * Inject the icon component
	 * @param notifications$ Stream of notifications
	 * @param id Id of the container where the component will be injected
	 */
	injectIconAsync(
		notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>,
		id: string
	): Promise<ComponentRef<any>> {
		return new Promise<ComponentRef<any>>(async resolve => {
			const shapeId = await notifications$.pipe(
				map(notifications => {
					return notifications[0].id;
				}),
				first()
			).toPromise();

			resolve(
				await this.layoutAdapter.delegateInjectComponentPortalAsync(
					InjectableComponentNames.iconComponent,
					capabilityId, `#${id}`, shapeId
				)
			);
		});
	}

	/**
	 * Inject the item component
	 * @param notifications$ Stream of notifications
	 * @param id Id of the container where the component will be injected
	 * @param contextId$ Stream for context id that the component will use
	 */
	injectItemAsync(
		notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>,
		id: string, contextId$: Observable<string>
	): Promise<ComponentRef<any>> {
		return new Promise<ComponentRef<any>>(async resolve => {
			resolve(
				await this.layoutAdapter.delegateInjectComponentPortalAsync(
					InjectableComponentNames.appNotificationComponent,
					capabilityId, `#${id}`, new AppNotificationSettings({
						contextId$, notifications$
					})
				)
			);
		});
	}

	/**
	 * Returns the capability id
	 */
	getCapabilityId(): string {
		return capabilityId;
	}
}
