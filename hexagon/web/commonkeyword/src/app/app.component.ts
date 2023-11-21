import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { capabilityId } from '@galileo/web_commonkeywords/_common';
import { CommonkeywordsAdapterService$v1, CompositeIconRequest$v1 } from '@galileo/web_commonkeywords/adapter';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

	icons = [];

	keywords = ['vessel'];

	constructor(
		private adapter: CommonkeywordsAdapterService$v1,
		private identity: CommonidentityAdapterService$v1,
		private layoutCompilerSrv: LayoutCompilerAdapterService,
		private localizationSrv: CommonlocalizationAdapterService$v1
	) {

		const request = [
			// new CompositeIconRequest$v1({
			// 	keywords: ['test'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			// new CompositeIconRequest$v1({
			// 	keywords: ['test'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			// new CompositeIconRequest$v1({
			// 	keywords: ['test'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			// new CompositeIconRequest$v1({
			// 	keywords: ['fire'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			// new CompositeIconRequest$v1({
			// 	keywords: ['fire gas leak'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: 'DB107918-ECEC-497F-8F89-FF823920DF34',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			// new CompositeIconRequest$v1({
			// 	keywords: ['vessel'],
			// 	tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
			// 	industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
			// 	capabilityId: '@hxgn/incidents'
			// }),
			new CompositeIconRequest$v1({
				keywords: ['ship'],
				tenantId: '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
				industryId: '18AD75D0-D7A0-4D18-AD0A-9379F6B8ECEF',
				capabilityId: '@hxgn/incidents'
			})
		];

		// setTimeout(() => {
		//   this.keywords = ['dumpster fire'];
		// }, 10000);
		// setTimeout(() => {
		//   this.keywords = ['fire hazard'];
		// }, 15000);
		// setTimeout(() => {
		//   this.keywords = ['notfound'];
		// }, 20000);

		this.adapter.loadCompositeIconsAsync(request);

		// for (let i = 0; i < 1000; i++) {
		//     setTimeout(async () => {
		//         await this.adapter.getCompositeIconFromKeywordsAsync('@hxgn/incidents', 'Police', ['test', '123']);

		//     });
		// }

		// for (let i = 0; i < 1000; i++) {
		//     setTimeout(async () => {
		//         const icon = await this.adapter.getCompositeIconFromKeywordsAsync('@hxgn/incidents', 'Police', ['123', 'test', 'abc']);
		//         this.icons.push(icon);
		//     });
		// }
	}

	ngOnInit(): void {
		this.localizationSrv.changeLanguageAsync('en')
	}

	async ngAfterViewInit(): Promise<void> {
		// setTimeout(() => {
		// 	this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
		// 		InjectableComponentNames.OnboardingComponent,
		// 		capabilityId, '#portal-outlet', { save$: new Observable(), setSaveEnabled: () => { } }
		// 	);
		// });

		const adminId = '@hxgn/commonkeywords/admin';
		await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
		this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
			'@hxgn/commonkeywords/admin/iconmanager/v1',
			adminId,
			'#admin-portal',
			null
		);
	}

	echo(message: any) {
		console.log(message);
	}

	updateKeywords(words: string[]) {
		this.keywords = this.keywords.concat(words);
		console.log('now', this.keywords);
	}
}
