import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Changelog$v1 } from '@galileo/web_commonidentity/adapter';

@Component({
	selector: 'hxgn-commontenant-organization-changelog-list',
	templateUrl: 'changelog-list.component.html',
	styleUrls: ['changelog-list.component.scss']
})
export class OrganizationChangelogListComponent {

	/** List of changelogs to display */
	@Input() logs: Changelog$v1[];

	/** Flag to indicate that all logs have been loaded */
    @Input() allLogsLoaded: boolean;

	/** Event when more data is needed */
    @Output() requestData = new EventEmitter<void>();

	/** The min height of the card */
    readonly itemMinHeight = 45;

	constructor() { }

	/** Emit event to request more data */
	requestMoreData() {
		this.requestData.emit();
	}
}
