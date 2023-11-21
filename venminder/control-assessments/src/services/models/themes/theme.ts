
export class TemplateTheme {
	constructor (
		public themeName: string = null,
		public fileName: string = null,
		public fileType: string = null,
		public createDate: string = null,
		public description: string = null,
		public defaultTheme: boolean = false,
		public fileList: string[] = [],
		public base64FileString: string = null
	) {
	}
	static create (item: TemplateTheme = null, preserveNull: boolean = false): TemplateTheme {
		return item == null
			? preserveNull ? null : new TemplateTheme()
			: new TemplateTheme(
				item.themeName,
				item.fileName,
				item.fileType,
				item.createDate,
				item.description,
				item.defaultTheme,
				item.fileList,
				item.base64FileString
			);
	}
};

