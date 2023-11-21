
import { Constants } from "shared-from-dcdev/shared/enums/constants";

export class ButtonInfo {
	constructor (
		public id: string = Constants.emptyGuid,
		public label: string = null,
		public navigationPath: string = null,
		public target: string = null,
		public configurationKey: string = null,
		public isFavorited: boolean = false
	) {
	}
	static create (item: ButtonInfo = null, preserveNull: boolean = false): ButtonInfo {
		return item == null
			? preserveNull ? null : new ButtonInfo()
			: new ButtonInfo(
				item.id,
				item.label,
				item.navigationPath,
				item.target,
				item.configurationKey,
				item.isFavorited
			);
	}
};


export class DashboardPanelState {
    isFavoritesCollapsed: boolean = false;
    isMiscellaneousCollapsed: boolean = false;
}