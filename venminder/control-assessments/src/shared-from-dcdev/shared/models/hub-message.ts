
export class HubProgressMessageData {
	constructor (
		public workCompleted: number = 0,
		public totalWork: number = 0,
		public description: string = null,
		public additionalData: string = null
	) {
	}
};

export class HubMessage {
	constructor (
		public name: string = null,
		public data: string = null
	) {
	}
};

